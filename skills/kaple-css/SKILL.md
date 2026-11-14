---
name: kaple-css
description: "Trigger: KapleCSS, kaple-css, Kaple classes, build UI with Kaple. Write HTML/CSS that uses only real KapleCSS classes, tokens and dark mode."
license: MIT
metadata:
  author: "faazdy"
  version: "1.0"
---

## Activation Contract

Load this skill when the user asks to build, edit, or review UI that uses KapleCSS (`kaple-css` on npm), or when the project loads `kaple.css` / `kaple.min.css` or `@use "pkg:kaple-css"`.

## Hard Rules

- Use ONLY classes listed in `references/classes.md`. Never invent Tailwind/Bootstrap names (`bg-blue-500`, `text-gray-600`, `p-7`, `d-flex`, `col-md-6`).
- Spacing scales have gaps: margin/padding steps are `0 1 2 3 4 5 6 8 10 12` (plus `p-16`, `py-16/20/24`); `gap-*` is `1–6 8 10 12`. Never use a missing step.
- Color through tokens only: `var(--color-*)` in custom CSS. Never hardcode hex for text, backgrounds or borders.
- Never write per-component dark-mode rules. Dark mode is automatic; force it with `data-theme="dark"` or `data-theme="light"` on any element.
- To change a token, override it in all three places shown in `references/theming.md`, or the manual theme toggle breaks.
- Responsive prefixes `sm: md: lg: xl:` are mobile-first (min-width) and exist only for the families in `references/classes.md`. `.hide-sm/.hide-md/.hide-lg` are max-width; prefer `hidden md:flex`.
- Kaple 1.x styles bare `<nav>` as a fixed top bar and bare `<footer>` with a border. Put `.site-nav` / `.site-footer` on the site bar and footer; for any other `<nav>` (breadcrumbs, pagination, in-page menus) reset `position` or use a `<div>`.
- Pair every `.input`, `.select`, `.textarea` with a visible `.label`; placeholders are intentionally low-contrast.

## Decision Gates

| Need | Use |
|------|-----|
| Page width | `.container` (or `.container-sm` … `.container-2xl`) |
| Columns | `.grid .grid-1 md:grid-3 .gap-6`; auto-fill: `.grid-auto` |
| Row/stack | `.flex .flex-col md:flex-row .items-center .gap-4` |
| Landing blocks | `.hero`, `.section`, `.features-grid`, `.pricing-grid`, `.stats-grid`, `.cta-section` |
| Surfaces | `.card .card-hover` > `.card-header/.card-body/.card-footer` |
| Status | `.badge-*`, `.notice-*` (`success warning danger info`) |
| Decorative background | `.bg-dots/.bg-grid/.bg-lines/.bg-diagonal` + `.pattern-fade` |

## Execution Steps

1. Detect how Kaple is loaded; if missing, add the CDN link from `assets/starter.html` or `npm install kaple-css`.
2. Start new pages from `assets/starter.html`.
3. Check each class against `references/classes.md` before writing it.
4. Put custom styles in a separate stylesheet loaded after Kaple, using tokens from `references/theming.md`.
5. Confirm the page works in both themes without extra dark-mode CSS.

## Output Contract

Return the HTML/CSS, then one line listing any custom CSS you added and why no Kaple class covered it.

## References

- `references/classes.md` — every class, grouped by purpose, with component markup.
- `references/theming.md` — tokens, dark mode, customization, accessibility.
- `assets/starter.html` — page skeleton with nav, hero, features and footer.
