<img src="./web/docs/kaple-logo-png.png" width="50px" style="background-color: white; padding: 7px; border-radius: 50%;">

# KapleCSS [BETA]

**A Modern, Minimal & Premium CSS Framework.**  
Inspired by the design language of Vercel, Framer, and Linear. Built for developers who value speed, intention, and clean aesthetics.

[![npm version](https://img.shields.io/npm/v/kaple-css.svg)](https://www.npmjs.com/package/kaple-css)
[![license](https://img.shields.io/npm/l/kaple-css.svg)](https://github.com/faazdy/kaple-css/)

---

## Key Features

- 💎 **Premium Aesthetic**: Clean, high-contrast, and focused design.
- 🏗️ **Modular Architecture**: Built with Sass using the 7-1 pattern.
- 🎨 **Design Tokens**: Fully customizable via CSS variables.
- 🌓 **Native Dark Mode**: Automatic detection & manual `data-theme` toggle.
- ⚡ **Zero Dependencies**: Pure CSS. No JavaScript required for core features.
- 📱 **Responsive**: Mobile-first grid and utility-driven layout system.

---

## Installation

### Via NPM
```bash
npm install kaple-css
```

Then import it into your main Sass or CSS file:
```scss
// If using Sass (Dart Sass 1.71+ with the Node package importer)
@use "pkg:kaple-css";

// If using Sass with node_modules as a load path
@use "kaple-css";

// If using CSS / a bundler
@import "kaple-css/dist/kaple.css";
```

With the Node package importer enabled (`sass --pkg-importer=node`, or
`importers: [new NodePackageImporter()]` in the JS API), `pkg:kaple-css` resolves
to the Sass sources so you can configure the framework.

#### Sass options

```scss
@use "pkg:kaple-css" with (
  // Stop styling bare <nav> and <footer> elements (recommended).
  $legacy-element-selectors: false
);
```

### Via CDN (Rapid Prototyping)
Simply add this to your `<head>`:
```html
<link rel="stylesheet" href="https://unpkg.com/kaple-css/dist/kaple.css">
```

---

## Quick Start

### Responsive Button
```html
<button class="btn btn-primary btn-lg">Get Started</button>
```

### Premium Card
```html
<div class="card card-hover">
  <div class="card-body">
    <h3 class="h5">Feature Title</h3>
    <p class="text-sm text-secondary">A minimalist description for your feature.</p>
  </div>
</div>
```

### Grid Layout
```html
<div class="grid grid-3 gap-6">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>
```

### Responsive Variants
Mobile-first: `bp:class` applies `class` from that breakpoint up
(`sm` ≥ 640px, `md` ≥ 768px, `lg` ≥ 1024px, `xl` ≥ 1280px).
```html
<div class="grid grid-1 sm:grid-2 lg:grid-4 gap-4">...</div>
<nav class="hidden md:flex">...</nav>
<div class="flex flex-col md:flex-row gap-2 md:gap-8">...</div>
<p class="text-center lg:text-left">...</p>
```
Available with a prefix: display (`block`, `inline-block`, `flex`, `inline-flex`,
`grid`, `hidden`), `grid-1/2/3/4/6/12`, `col-span-*`, `flex-row`, `flex-col`,
`flex-wrap`, `items-*`, `justify-*`, `gap-*` and `text-left/center/right`.

> **Changed in 1.2:** `sm:grid-2` used to mean "2 columns at 768px and below".
> It now follows the mobile-first rule above (2 columns from 640px up).

### Background Patterns
Pure-CSS dotted, grid, ruled and diagonal backgrounds. They combine with
background-color utilities and fade into the page with `.pattern-fade*`.
```html
<section class="bg-dots pattern-fade py-24">...</section>
<div class="bg-grid pattern-lg pattern-fade-b">...</div>
<div class="bg-muted bg-diagonal pattern-strong">...</div>
```

| Class | Effect |
| --- | --- |
| `.bg-dots` / `.bg-grid` / `.bg-lines` / `.bg-diagonal` | Pattern type |
| `.pattern-sm` / `.pattern-md` / `.pattern-lg` | Cell size: 16px / 24px (default) / 40px |
| `.pattern-subtle` / `.pattern-strong` | Lighter or darker pattern color |
| `.pattern-fade` / `.pattern-fade-t` / `.pattern-fade-b` | Fade to the edges / top / bottom |

Fine-tune with custom properties on the element or any ancestor:
`--pattern-color`, `--pattern-size`, `--pattern-thickness` (line width or dot
radius) and `--pattern-fade-color`.

The fade blends into the element's background automatically: `bg-base`,
`bg-subtle`, `bg-muted`, `bg-surface` and `bg-accent` set `--pattern-fade-color`
(also for their children), and anything else falls back to `--color-bg`.
For a custom background, set the variable yourself, ideally in a stylesheet:
```css
.my-panel { background: #f0f4ff; --pattern-fade-color: #f0f4ff; }
```

### Theming & Dark Mode
Dark mode follows `prefers-color-scheme`, and `data-theme="dark"` / `data-theme="light"`
force a theme on any element. Every value that changes between themes is a token, so
components never need their own dark-mode rules. Besides the base colors and shadows,
the themed tokens are `--color-bg-blur` (navbars), `--color-bg-glass` /
`--color-border-glass` (`.glass`), `--color-glow` (`.hero`), `--color-gradient-stops`
(`.gradient-animated`), `--color-code-tag` / `-attr` / `-string`, and the status
colors `--color-success` / `-warning` / `-danger` / `-info` with their `-bg`
(dark mode uses lighter text on a 15% tint, so badges and notices don't glow).

To customize a token in dark mode, cover both the OS preference and the manual toggle:
```css
@media (prefers-color-scheme: dark) { :root { --color-accent: #60a5fa; } }
[data-theme="dark"] { --color-accent: #60a5fa; }
[data-theme="light"] { --color-accent: #000; }
```

### Accessibility
- **Reduced motion:** with `prefers-reduced-motion: reduce`, every animation and
  transition finishes instantly (keeping its end state) and smooth scrolling is off.
- **Visible focus:** buttons, inputs, `.input-error` fields and `.toggle` switches
  show a focus indicator, including in Windows High Contrast (`forced-colors`) mode.
- **Tooltips** (`data-tooltip`) also appear on keyboard focus, not only on hover.
- **Text contrast:** primary, secondary and tertiary text meet WCAG AA (4.5:1) on
  `--color-bg` in both themes. Input placeholders use the softer
  `--color-text-placeholder` on purpose, so always pair inputs with a visible `.label`.

### Site Navigation & Footer
```html
<nav class="site-nav">...</nav>
<footer class="site-footer">...</footer>
```

> **Deprecated:** Kaple 1.x also styles bare `<nav>` and `<footer>` elements
> (`<nav>` becomes a fixed bar). Add `.site-nav` / `.site-footer` to the
> elements that should look like that. The bare element selectors will be
> removed in 2.0; Sass users can drop them now with
> `$legacy-element-selectors: false`.

---

## AI Agents

`skills/kaple-css/` is an [Agent Skill](https://agentskills.io/) that teaches AI coding
agents (Claude Code, Codex, Cursor, GitHub Copilot, Gemini CLI and others) to build
with the real KapleCSS classes and tokens instead of guessing Tailwind-style names.

Get it in one of three ways:
- **Download** `kaple-css-skill.zip` from the [landing page](https://kaplecss.vercel.app/#ai) or the docs.
- **npm:** it ships with the package, in `node_modules/kaple-css/skills/kaple-css/`.
- **This repo:** the `skills/kaple-css/` folder.

Then put the `kaple-css` folder in your agent's skills directory, for example in Claude Code:
```bash
unzip kaple-css-skill.zip -d ~/.claude/skills                  # every project
cp -r node_modules/kaple-css/skills/kaple-css .claude/skills/   # this project only
```

`npm run web:build` packs the zip into `web/downloads/` with `scripts/build-skill-zip.mjs`.

`npm test` fails if the skill mentions a class or token that `dist/kaple.css` does not
ship, so update `skills/kaple-css/references/` whenever a class is added or renamed.

---

## Documentation

For full documentation and component examples, check our [Documentation Page](https://kaplecss.vercel.app/docs/index.html).

---

## Development

If you want to contribute or build your own version:

1. Clone the repo.
2. Install dependencies: `npm install`
3. Start watching changes: `npm run watch`
4. Build for production: `npm run build` (writes `dist/kaple.css` and `dist/kaple.min.css`)
5. Run the tests: `npm test` (checks that `dist/` is up to date, theme tokens,
   accessibility guards and responsive variants). Visual playground: `test/test.html`.

## License

Kaple CSS is open-source software licensed under the [MIT License](LICENSE).

---

Built with ❤️ by [faazdy](https://github.com/faazdy) - [portfolio](https://leorengifodev.vercel.app/)

