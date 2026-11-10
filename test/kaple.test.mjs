// Build-level tests for Kaple CSS. Run with `npm test` (Node 20+).
// They compile the Sass sources and assert on the generated CSS, so no
// browser is needed. Visual checks live in test/test.html.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as sass from 'sass';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const entry = path.join(root, 'scss/kaple.scss');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

const compile = (style = 'expanded') => sass.compile(entry, { style }).css;
const compileWith = (config) =>
  sass.compileString(`@use "scss/kaple" with (${config});`, { loadPaths: [root] }).css;
const normalize = (s) => s.replace(/\r\n/g, '\n').trim();

const css = compile();

// Custom properties declared inside the first block that starts with `selector {`.
function tokensOf(selector) {
  const start = css.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `block "${selector}" not found`);
  const body = css.slice(start, css.indexOf('}', start));
  return new Map([...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}

// WCAG 2.x contrast ratio between two #rrggbb colors.
function contrast(a, b) {
  const lum = (hex) => {
    const [r, g, bl] = [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// ── Build & package ─────────────────────────────────────────

test('dist/ is up to date with the Sass sources', () => {
  assert.equal(normalize(readFileSync(path.join(root, 'dist/kaple.css'), 'utf8')), normalize(css),
    'dist/kaple.css is stale: run `npm run build`');
  assert.equal(normalize(readFileSync(path.join(root, 'dist/kaple.min.css'), 'utf8')), normalize(compile('compressed')),
    'dist/kaple.min.css is stale: run `npm run build`');
});

test('every package entry point exists', () => {
  const exportTargets = Object.values(pkg.exports)
    .flatMap((v) => (typeof v === 'string' ? [v] : Object.values(v)))
    .filter((p) => !p.includes('*'));
  for (const file of [pkg.main, pkg.style, pkg.sass, pkg.unpkg, pkg.jsdelivr, ...exportTargets, '_index.scss']) {
    assert.ok(existsSync(path.join(root, file)), `${file} is referenced by package.json but missing`);
  }
});

// ── Public Sass options ─────────────────────────────────────

test('bare <nav>/<footer> are styled by default (1.x compatibility)', () => {
  assert.match(css, /^nav \{/m);
  assert.match(css, /^footer \{/m);
});

test('$legacy-element-selectors: false removes bare <nav>/<footer> rules', () => {
  const out = compileWith('$legacy-element-selectors: false');
  assert.doesNotMatch(out, /(^|[\s,}])(nav|footer)\s*\{/m);
  assert.match(out, /^\.site-nav \{/m);
  assert.match(out, /^\.site-footer \{/m);
});

// ── Theming ─────────────────────────────────────────────────

test('dark and light themes define exactly the same tokens', () => {
  const dark = [...tokensOf('[data-theme=dark]').keys()].sort();
  const light = [...tokensOf('[data-theme=light]').keys()].sort();
  assert.deepEqual(dark, light);
});

test(':root defines every themed token plus the shared ones', () => {
  const rootTokens = tokensOf(':root');
  for (const name of tokensOf('[data-theme=light]').keys()) {
    assert.ok(rootTokens.has(name), `:root is missing ${name}`);
  }
  for (const name of ['--color-success', '--color-danger', '--color-warning', '--color-info', '--space-4', '--radius-md']) {
    assert.ok(rootTokens.has(name), `:root is missing ${name}`);
  }
});

test('no component writes its own dark-mode rule (tokens only)', () => {
  const themeSelectors = [...css.matchAll(/^([^{}\n]*data-theme[^{}\n]*)\{/gm)].map((m) => m[1].trim());
  assert.deepEqual(themeSelectors.sort(), ['[data-theme=dark]', '[data-theme=light]']);
});

// ── Accessibility ───────────────────────────────────────────

test('primary, secondary and tertiary text pass WCAG AA on --color-bg in both themes', () => {
  for (const theme of ['[data-theme=light]', '[data-theme=dark]']) {
    const t = tokensOf(theme);
    for (const name of ['--color-text-primary', '--color-text-secondary', '--color-text-tertiary']) {
      const ratio = contrast(t.get(name), t.get('--color-bg'));
      assert.ok(ratio >= 4.5, `${theme} ${name} is ${ratio.toFixed(2)}:1`);
    }
  }
});

// Composite an rgba() token over an opaque #rrggbb background → #rrggbb.
function flatten(color, background) {
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return color;
  const [r, g, b, a = 1] = m[1].split(',').map(Number);
  const bg = [1, 3, 5].map((i) => parseInt(background.slice(i, i + 2), 16));
  return '#' + [r, g, b].map((v, i) => Math.round(v * a + bg[i] * (1 - a)).toString(16).padStart(2, '0')).join('');
}

const statuses = ['success', 'warning', 'danger', 'info'];

test('dark theme: status badges/notices keep dark backgrounds and readable text (AA)', () => {
  const t = tokensOf('[data-theme=dark]');
  for (const s of statuses) {
    assert.ok(t.has(`--color-${s}-bg`), `--color-${s}-bg must be themed`);
    const bg = flatten(t.get(`--color-${s}-bg`), t.get('--color-bg'));
    assert.ok(contrast(bg, '#ffffff') > 10, `--color-${s}-bg resolves to ${bg} in dark mode (too light)`);
    const ratio = contrast(t.get(`--color-${s}`), bg);
    assert.ok(ratio >= 4.5, `dark ${s} text on its bg is ${ratio.toFixed(2)}:1`);
  }
});

test('light theme: status text on status backgrounds meets AA',
  { todo: 'success (3.15:1) and warning (2.84:1) predate 1.2; tracked as a follow-up' }, () => {
  const t = tokensOf('[data-theme=light]');
  for (const s of statuses) {
    const ratio = contrast(t.get(`--color-${s}`), t.get(`--color-${s}-bg`));
    assert.ok(ratio >= 4.5, `light ${s} text on its bg is ${ratio.toFixed(2)}:1`);
  }
});

test('.btn-danger text stays readable on --color-danger in both themes', () => {
  assert.match(rulesIn(css, '.btn-danger')[0], /color: var\(--color-text-inverse\)/);
  for (const theme of ['[data-theme=light]', '[data-theme=dark]']) {
    const t = tokensOf(theme);
    const ratio = contrast(t.get('--color-text-inverse'), t.get('--color-danger'));
    assert.ok(ratio >= 4.5, `${theme} .btn-danger text is ${ratio.toFixed(2)}:1`);
  }
});

test('focus outlines are never removed with outline: none', () => {
  assert.doesNotMatch(css, /outline:\s*(none|0)\s*;/);
});

test('prefers-reduced-motion stops animations and transitions', () => {
  const block = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
  assert.match(block, /animation-duration: 0\.01ms !important/);
  assert.match(block, /animation-iteration-count: 1 !important/);
  assert.match(block, /transition-duration: 0\.01ms !important/);
});

test('.delay-* never hides an element on its own', () => {
  const rules = [...css.matchAll(/^\.delay-\d \{([^}]*)\}/gm)].map((m) => m[1]);
  assert.equal(rules.length, 5);
  for (const body of rules) assert.doesNotMatch(body, /opacity/);
});

// ── Responsive variants (mobile-first) ──────────────────────

const breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280 };

// Declarations of `.selector { ... }`: top-level rules when `source` is the
// whole stylesheet, indented rules when it is a @media block.
function rulesIn(source, selector) {
  const indent = source === css ? '' : '\\s+';
  const re = new RegExp(`^${indent}${selector.replace(/[.\\:]/g, (c) => '\\' + c)} \\{([^}]*)\\}`, 'gm');
  return [...source.matchAll(re)].map((m) => m[1].trim().replace(/\s+/g, ' '));
}
// All @media blocks with exactly this query, concatenated (Sass doesn't merge them).
function mediaBlock(query) {
  const head = `@media ${query} {`;
  const blocks = [];
  for (let start = css.indexOf(head); start !== -1; start = css.indexOf(head, start + 1)) {
    let depth = 0;
    for (let i = css.indexOf('{', start); i < css.length; i++) {
      if (css[i] === '{') depth++;
      if (css[i] === '}' && --depth === 0) { blocks.push(css.slice(start, i + 1)); break; }
    }
  }
  return blocks.join('\n');
}

test('responsive variants apply from their breakpoint up (min-width)', () => {
  for (const [bp, px] of Object.entries(breakpoints)) {
    const block = mediaBlock(`(min-width: ${px}px)`);
    assert.deepEqual(rulesIn(block, `.${bp}\\:grid-3`), ['grid-template-columns: repeat(3, 1fr);'], `${bp}:grid-3`);
    assert.deepEqual(rulesIn(block, `.${bp}\\:hidden`), ['display: none;'], `${bp}:hidden`);
    assert.deepEqual(rulesIn(block, `.${bp}\\:flex`), ['display: flex;'], `${bp}:flex`);
  }
});

test('every responsive variant declares exactly what its base class does', () => {
  const block = mediaBlock('(min-width: 768px)');
  const variants = [...block.matchAll(/^\s*\.md\\:([\w-]+) \{/gm)].map((m) => m[1]);
  assert.ok(variants.length >= 40, `only ${variants.length} md: variants`);
  for (const name of variants) {
    const base = rulesIn(css, `.${name}`);
    assert.equal(base.length, 1, `.${name} should exist once at top level`);
    assert.deepEqual(rulesIn(block, `.md\\:${name}`), base, `.md:${name} differs from .${name}`);
  }
});

test('responsive variants come after the base utilities so they can override them', () => {
  const firstVariant = css.search(/\.sm\\:[\w-]+ \{/);
  for (const base of ['.hidden {', '.grid-3 {', '.text-left {', '.gap-12 {', '.justify-between {']) {
    assert.ok(css.indexOf(base) < firstVariant, `${base} is emitted after the responsive variants`);
  }
  assert.ok(css.lastIndexOf('grid-template-columns: 1fr;') < firstVariant, 'the mobile grid collapse must come before the variants');
});

test('sm:grid-2 is a mobile-first variant, no longer a max-width override', () => {
  assert.equal(rulesIn(mediaBlock('(max-width: 768px)'), '.sm\\:grid-2').length, 0);
  assert.deepEqual(rulesIn(mediaBlock('(min-width: 640px)'), '.sm\\:grid-2'), ['grid-template-columns: repeat(2, 1fr);']);
});

test('layout utilities override components (e.g. "badge hidden" hides the badge)', () => {
  const lastComponent = Math.max(...['.badge {', '.btn {', '.avatar {', '.notice {', '.tab {'].map((s) => css.indexOf(s)));
  for (const util of ['.hidden {', '.flex {', '.block {', '.inline-flex {', '.grid-3 {', '.gap-4 {', '.items-center {']) {
    assert.ok(css.indexOf(util) > lastComponent, `${util} is emitted before the components, so they override it`);
  }
});

// ── Output hygiene ──────────────────────────────────────────

test('each @keyframes name is defined once', () => {
  const names = [...css.matchAll(/@keyframes ([\w-]+)/g)].map((m) => m[1]);
  const dupes = names.filter((n, i) => names.indexOf(n) !== i);
  assert.deepEqual(dupes, [], `duplicated @keyframes: ${dupes.join(', ')}`);
});

test('pattern fades blend into the background utility on the element automatically', () => {
  const expected = {
    'bg-base': '--color-bg', 'bg-subtle': '--color-bg-subtle', 'bg-muted': '--color-bg-muted',
    'bg-surface': '--color-surface', 'bg-accent': '--color-accent',
  };
  for (const [cls, token] of Object.entries(expected)) {
    const decls = [...css.matchAll(new RegExp(`^\\.${cls} \\{([^}]*)\\}`, 'gm'))].map((m) => m[1]).join(' ');
    assert.match(decls, new RegExp(`--pattern-fade-color: var\\(${token}\\)`), `.${cls} should set --pattern-fade-color`);
  }
});

test('background patterns are generated', () => {
  for (const cls of ['bg-dots', 'bg-grid', 'bg-lines', 'bg-diagonal', 'pattern-fade', 'pattern-lg', 'pattern-strong']) {
    assert.match(css, new RegExp(`^\\.${cls} \\{`, 'm'), `.${cls} missing`);
  }
});
