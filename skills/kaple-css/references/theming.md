# KapleCSS theming and tokens (v1.2)

## Install

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/kaple-css/dist/kaple.min.css">
```

```bash
npm install kaple-css
```

```css
@import "kaple-css/dist/kaple.css";
```

Sass (Dart Sass 1.71+ with `--pkg-importer=node`):

```scss
@use "pkg:kaple-css" with ($legacy-element-selectors: false); // stop styling bare <nav>/<footer>
```

## Tokens

- Background: `--color-bg` `--color-bg-subtle` `--color-bg-muted` `--color-bg-overlay` `--color-bg-blur` `--color-bg-glass` `--color-surface` `--color-surface-2`
- Border: `--color-border` `--color-border-strong` `--color-border-focus` `--color-border-glass`
- Text: `--color-text-primary` `--color-text-secondary` `--color-text-tertiary` `--color-text-placeholder` `--color-text-disabled` `--color-text-inverse`
- Accent: `--color-accent` `--color-accent-hover` `--color-accent-subtle`
- Status: `--color-success` `--color-warning` `--color-danger` `--color-info`, each with a `-bg` pair (`--color-success-bg` …)
- Effects: `--color-glow` `--color-gradient-stops` `--color-code-tag` `--color-code-attr` `--color-code-string`
- Shadow: `--shadow-xs` `--shadow-sm` `--shadow-md` `--shadow-lg` `--shadow-xl`
- Font: `--font-sans` `--font-mono`; size `--text-xs` … `--text-6xl`; weight `--weight-normal` `--weight-medium` `--weight-semibold` `--weight-bold`
- Rhythm: `--leading-tight` `--leading-snug` `--leading-normal` `--leading-relaxed`; `--tracking-tight` `--tracking-snug` `--tracking-normal` `--tracking-wide` `--tracking-wider`
- Space: `--space-1` `--space-2` `--space-3` `--space-4` `--space-5` `--space-6` `--space-8` `--space-10` `--space-12` `--space-16` `--space-20` `--space-24`
- Radius: `--radius-xs` `--radius-sm` `--radius-md` `--radius-lg` `--radius-xl` `--radius-2xl` `--radius-full`
- Motion: `--transition-fast` `--transition-base` `--transition-slow` `--transition-spring`
- Width: `--container-sm` `--container-md` `--container-lg` `--container-xl` `--container-2xl`

## Dark mode

- Automatic from `prefers-color-scheme`.
- `data-theme="dark"` or `data-theme="light"` forces a theme on that element and its children.
- Every themed value is a token, so components need no dark-mode CSS.

## Customize a token

Override it in all three places, or the OS preference and the manual toggle disagree:

```css
:root { --color-accent: #2563eb; }
@media (prefers-color-scheme: dark) { :root { --color-accent: #60a5fa; } }
[data-theme="dark"] { --color-accent: #60a5fa; }
[data-theme="light"] { --color-accent: #2563eb; }
```

Pattern fades read `--pattern-fade-color`; `.bg-*` utilities set it. On a custom background set it yourself:

```css
.my-panel { background: var(--color-surface-2); --pattern-fade-color: var(--color-surface-2); }
```

Pattern tuning: `--pattern-color` `--pattern-size` `--pattern-thickness`.

## Accessibility built in

- `prefers-reduced-motion: reduce` finishes animations instantly and disables smooth scroll.
- Buttons, inputs, `.input-error` and `.toggle` show a visible focus ring, also in `forced-colors` mode.
- `data-tooltip` also shows on keyboard focus.
- Primary, secondary and tertiary text meet WCAG AA on `--color-bg` in both themes.
