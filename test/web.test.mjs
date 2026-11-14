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
const skipped = new Set(['dist', 'design']);

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

// Where a published path lives in the repo before the build copies `dist/` into `web/`.
const sourceOf = (published) => {
  const rel = path.relative(web, published);
  return rel.split(path.sep)[0] === 'dist' ? path.join(root, rel) : published;
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
