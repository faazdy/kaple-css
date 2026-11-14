// Deploy-level tests for the website in `web/` (landing + docs).
// Vercel publishes only `web/`, so every local href/src must resolve inside it.
// `web/dist/` is produced at build time by `npm run web:build` from `dist/`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const web = path.join(root, 'web');
// Folders that are not published: generated build output and gitignored design drafts.
const skipped = new Set(['dist', 'design', 'downloads']);

const htmlFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return skipped.has(entry.name) ? [] : htmlFiles(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });

const pages = htmlFiles(web).map((file) => path.relative(web, file).split(path.sep).join('/'));
const templates = readdirSync(path.join(web, 'templates'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

// Where a published path lives in the repo before `npm run web:build` generates it:
// web/dist/ is copied from dist/, and the skill zip is packed from skills/kaple-css/.
const generated = { 'downloads/kaple-css-skill.zip': path.join(root, 'skills/kaple-css') };
const sourceOf = (published) => {
  const rel = path.relative(web, published).split(path.sep).join('/');
  if (generated[rel]) return generated[rel];
  return rel.split('/')[0] === 'dist' ? path.join(root, rel) : published;
};

for (const page of pages) {
  test(`${page}: local references stay inside web/ and exist`, () => {
    const html = readFileSync(path.join(web, page), 'utf8');
    const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
      .map((m) => m[1])
      .filter((ref) => !/^(?:[a-z]+:|\/\/|#)/i.test(ref));

    for (const ref of refs) {
      const target = path.resolve(path.dirname(path.join(web, page)), ref.split(/[?#]/)[0]);
      const rel = path.relative(web, target);
      assert.ok(!rel.startsWith('..'), `${page}: "${ref}" points outside web/`);
      assert.ok(existsSync(sourceOf(target)), `${page}: "${ref}" does not exist`);
    }
  });
}

test('landing links every template from the templates section, nav and footer', () => {
  const html = readFileSync(path.join(web, 'index.html'), 'utf8');
  assert.ok(templates.length > 0, 'web/templates/ has no templates');
  assert.match(html, /id="templates"/);
  assert.equal(html.match(/href="#templates"/g)?.length, 2, 'nav and footer must link #templates');
  for (const name of templates) {
    assert.ok(html.includes(`href="./templates/${name}/index.html"`), `landing does not link "${name}"`);
  }
});

test('vercel.json publishes web/ after copying the framework build into it', () => {
  const config = JSON.parse(readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(config.outputDirectory, 'web');
  assert.match(config.buildCommand, /npm run web:build/);
  assert.ok(pkg.scripts['web:build'], 'package.json is missing the "web:build" script');
  assert.equal(config.routes, undefined, 'catch-all routes shadow static files');
});

test('landing install tabs each control an existing panel, and only the selected one is visible', () => {
  const html = readFileSync(path.join(web, 'index.html'), 'utf8');
  const tabs = [...html.matchAll(/<button[^>]*role="tab"[^>]*>/g)].map((m) => m[0]);
  assert.equal(tabs.length, 3, 'expected npm, CDN and Download tabs');
  const selected = tabs.filter((tab) => tab.includes('aria-selected="true"'));
  assert.equal(selected.length, 1, 'exactly one tab starts selected');

  for (const tab of tabs) {
    const id = tab.match(/aria-controls="([^"]+)"/)?.[1];
    const panel = html.match(new RegExp(`<div[^>]*role="tabpanel"[^>]*id="${id}"[^>]*>`))?.[0];
    assert.ok(panel, `tab controls missing panel "${id}"`);
    assert.equal(panel.includes(' hidden'), !tab.includes('aria-selected="true"'), `panel "${id}" visibility`);
  }
});

test('landing link colors are not overridden by the ".lp a { color: inherit }" reset', () => {
  // A bare ".class" selector (0,1,0) loses to ".lp a" (0,1,1), so a class that
  // colors an <a> must be written as ".lp .class" or the link inherits instead.
  const css = readFileSync(path.join(web, 'landing/assets/styles/style.css'), 'utf8');
  const html = readFileSync(path.join(web, 'index.html'), 'utf8');
  const weakColorClasses = new Set(
    [...css.matchAll(/^\.([\w-]+)\s*\{[^}]*(?<![\w-])color:/gm)].map((m) => m[1])
  );
  const linkClasses = [...html.matchAll(/<a\b[^>]*class="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/));
  const overridden = [...new Set(linkClasses.filter((name) => weakColorClasses.has(name)))];
  assert.deepEqual(overridden, [], `prefix these selectors with ".lp ": ${overridden.join(', ')}`);
});

const cssFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return skipped.has(entry.name) ? [] : cssFiles(full);
    return entry.name.endsWith('.css') ? [full] : [];
  });

for (const file of cssFiles(web)) {
  const sheet = path.relative(web, file).split(path.sep).join('/');
  test(`${sheet}: @import and url() references stay inside web/ and exist`, () => {
    const css = readFileSync(file, 'utf8');
    const refs = [...css.matchAll(/@import\s+(?:url\()?\s*['"]?([^'")\s;]+)|url\(\s*['"]?([^'")]+)/g)]
      .map((m) => m[1] ?? m[2])
      .filter((ref) => !/^(?:[a-z]+:|\/\/|#)/i.test(ref));

    for (const ref of refs) {
      const target = path.resolve(path.dirname(file), ref.split(/[?#]/)[0]);
      assert.ok(!path.relative(web, target).startsWith('..'), `${sheet}: "${ref}" points outside web/`);
      assert.ok(existsSync(sourceOf(target)), `${sheet}: "${ref}" does not exist`);
    }
  });
}

test('landing and docs offer the AI skill download', () => {
  const landing = readFileSync(path.join(web, 'index.html'), 'utf8');
  const docs = readFileSync(path.join(web, 'docs/index.html'), 'utf8');
  assert.match(landing, /<a[^>]*href="\.\/downloads\/kaple-css-skill\.zip"[^>]*download/);
  assert.match(docs, /<a[^>]*href="\.\.\/downloads\/kaple-css-skill\.zip"[^>]*download/);
  assert.ok(docs.indexOf('kaple-css-skill.zip') < docs.indexOf('id="install"'), 'docs must show it before Installation');
});
