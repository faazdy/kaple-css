# Kaple CSS

**A Modern, Minimal & Premium CSS Framework.**  
Inspired by the design language of Vercel, Framer, and Linear. Built for developers who value speed, intention, and clean aesthetics.

[![npm version](https://img.shields.io/npm/v/kaple-css.svg)](https://www.npmjs.com/package/kaple-css)
[![license](https://img.shields.io/npm/l/kaple-css.svg)](https://github.com/faazdy/kaple-css)

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
// If using Sass
@use "kaple-css";

// If using CSS
@import "kaple-css/dist/kaple.css";
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

---

## Documentation

For full documentation and component examples, check our [Documentation Page](docs.html).

---

## Development

If you want to contribute or build your own version:

1. Clone the repo.
2. Install dependencies: `npm install`
3. Start watching changes: `npm run watch`
4. Build for production: `npm run build:min`

## License

Kaple CSS is open-source software licensed under the [ISC License](LICENSE).

---

Built with ❤️ by [faazdy](https://github.com/faazdy)
