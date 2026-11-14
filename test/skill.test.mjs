// Keeps the Agent Skill in skills/kaple-css/ honest: every class and token it
// teaches must exist in the compiled framework, so agents never learn a class
// that Kaple does not ship. Run `npm run build` first if dist/ is stale.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillDir = path.join(root, 'skills/kaple-css');
const css = readFileSync(path.join(root, 'dist/kaple.css'), 'utf8');

const shippedClasses = new Set(
  [...css.matchAll(/\.((?:\\:|[\w-])+)/g)].map((m) => m[1].replace(/\\:/g, ':'))
);
const TAGS = new Set(['nav', 'footer', 'table', 'div', 'span', 'a', 'button', 'input', 'label', 'section']);

const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? files(full) : [full];
  });

const skillFiles = files(skillDir).filter((file) => /\.(md|html)$/.test(file));
const rel = (file) => path.relative(root, file).split(path.sep).join('/');

// Classes named in prose as `.class`, `tag.class` or `.a.b`; wildcards like `.m-*` are skipped.
function proseClasses(text) {
  const found = [];
  for (const [, span] of text.matchAll(/`([^`\n]+)`/g)) {
    for (const m of span.matchAll(/(?:^|[\s(>])([a-z]*)((?:\.[a-z][a-z0-9-]*[a-z0-9])+)(?![\w*-])/g)) {
      if (m[1] && !TAGS.has(m[1])) continue; // file names such as kaple.css
      found.push(...m[2].split('.').filter(Boolean));
    }
  }
  return found;
}

const attributeClasses = (text) =>
  [...text.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/).filter(Boolean));

for (const file of skillFiles) {
  test(`${rel(file)}: every class it names ships in dist/kaple.css`, () => {
    const text = readFileSync(file, 'utf8');
    const named = [...new Set([...proseClasses(text), ...attributeClasses(text)])];
    const missing = named.filter((name) => !shippedClasses.has(name));
    assert.deepEqual(missing, [], `unknown classes: ${missing.join(', ')}`);
  });

  // A token counts when Kaple declares it or reads it (opt-in knobs such as
  // --pattern-thickness are only read, with a fallback: `var(--x, 1px)`).
  test(`${rel(file)}: every token it names is declared or read in dist/kaple.css`, () => {
    const text = readFileSync(file, 'utf8');
    const tokens = [...new Set([...text.matchAll(/--[a-z][\w-]*[a-z0-9](?![\w=-])/g)].map((m) => m[0]))];
    const missing = tokens.filter((token) => !css.includes(`${token}:`) && !css.includes(`var(${token}`));
    assert.deepEqual(missing, [], `unknown tokens: ${missing.join(', ')}`);
  });
}

test('skills/kaple-css/SKILL.md has valid frontmatter and the required sections in order', () => {
  const text = readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8').replace(/\r\n/g, '\n');
  const front = text.match(/^---\n([\s\S]*?)\n---\n/)?.[1];
  assert.ok(front, 'missing frontmatter');
  assert.match(front, /^name: kaple-css$/m, 'name must match the folder name');
  const description = front.match(/^description: "([^"\n]+)"$/m)?.[1];
  assert.ok(description, 'description must be one quoted line');
  assert.ok(description.startsWith('Trigger:'), 'description must start with "Trigger:"');
  assert.ok(description.length <= 250, `description is ${description.length} chars (max 250)`);
  assert.match(front, /^license: \S+/m);
  assert.match(front, /^ {2}author: "\S+"$/m);
  assert.match(front, /^ {2}version: "\S+"$/m);

  const sections = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  assert.deepEqual(sections, [
    'Activation Contract', 'Hard Rules', 'Decision Gates', 'Execution Steps', 'Output Contract', 'References',
  ]);
});

test('skills/kaple-css/SKILL.md only references files that exist in the skill', () => {
  const text = readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8');
  const refs = [...text.matchAll(/`((?:references|assets)\/[^`]+)`/g)].map((m) => m[1]);
  assert.ok(refs.length > 0);
  const present = new Set(skillFiles.map((file) => path.relative(skillDir, file).split(path.sep).join('/')));
  assert.deepEqual(refs.filter((ref) => !present.has(ref)), []);
});

// ── Packaging ────────────────────────────────────────────────────────────────
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { inflateRawSync } from 'node:zlib';
import { buildSkillZip } from '../scripts/build-skill-zip.mjs';

// Reads a zip through its central directory, independently of how it was written.
function unzip(buf) {
  const end = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  assert.notEqual(end, -1, 'end of central directory not found');
  const count = buf.readUInt16LE(end + 10);
  let at = buf.readUInt32LE(end + 16);
  const entries = new Map();
  for (let i = 0; i < count; i++) {
    assert.equal(buf.readUInt32LE(at), 0x02014b50, 'bad central directory entry');
    const method = buf.readUInt16LE(at + 10);
    const size = buf.readUInt32LE(at + 20);
    const nameLen = buf.readUInt16LE(at + 28);
    const extraLen = buf.readUInt16LE(at + 30);
    const commentLen = buf.readUInt16LE(at + 32);
    const localAt = buf.readUInt32LE(at + 42);
    const name = buf.toString('utf8', at + 46, at + 46 + nameLen);
    const dataAt = localAt + 30 + buf.readUInt16LE(localAt + 26) + buf.readUInt16LE(localAt + 28);
    const raw = buf.subarray(dataAt, dataAt + size);
    entries.set(name, method === 8 ? inflateRawSync(raw) : raw);
    at += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

test('the skill zip holds every skill file, byte for byte, under one kaple-css/ folder', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'kaple-skill-'));
  try {
    const out = path.join(dir, 'kaple-css-skill.zip');
    const archive = buildSkillZip(out);
    assert.deepEqual(readFileSync(out), archive, 'written file differs from the returned archive');

    const entries = unzip(archive);
    const expected = files(skillDir);
    assert.deepEqual(
      [...entries.keys()].sort(),
      expected.map((file) => 'kaple-css/' + path.relative(skillDir, file).split(path.sep).join('/')).sort()
    );
    assert.ok(entries.has('kaple-css/SKILL.md'), 'SKILL.md must sit at the top of the folder');
    for (const file of expected) {
      const name = 'kaple-css/' + path.relative(skillDir, file).split(path.sep).join('/');
      assert.deepEqual(entries.get(name), readFileSync(file), `${name} content changed in the zip`);
    }
    assert.deepEqual(buildSkillZip(out), archive, 'builds must be reproducible');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the npm package ships the skill and the website build packs the zip', () => {
  const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.ok(pkg.files.includes('skills/'), 'package.json "files" must include "skills/"');
  assert.match(pkg.scripts['web:build'], /scripts\/build-skill-zip\.mjs/);
});
