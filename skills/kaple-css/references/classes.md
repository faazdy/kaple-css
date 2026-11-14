# KapleCSS class reference (v1.2)

Every class below exists in `dist/kaple.css`. A test in the KapleCSS repo fails if this file names a class the framework does not ship.

## Layout

- Containers: `.container` `.container-sm` `.container-md` `.container-lg` `.container-xl` `.container-2xl`
- Grid: `.grid` `.grid-1` `.grid-2` `.grid-3` `.grid-4` `.grid-6` `.grid-12` `.grid-auto` `.grid-auto-sm` `.grid-auto-lg`
- Spans: `.col-span-1` `.col-span-2` `.col-span-3` `.col-span-4` `.col-span-6` `.col-span-full` `.row-span-1` `.row-span-2` `.row-span-3`
- Flex: `.flex` `.inline-flex` `.flex-row` `.flex-col` `.flex-wrap` `.flex-1` `.flex-auto` `.flex-none` `.shrink-0`
- Align: `.items-start` `.items-center` `.items-end` `.items-stretch` `.justify-start` `.justify-center` `.justify-end` `.justify-between` `.justify-around`
- Gap: `.gap-1` `.gap-2` `.gap-3` `.gap-4` `.gap-5` `.gap-6` `.gap-8` `.gap-10` `.gap-12`
- Display: `.block` `.inline-block` `.hidden`
- Position: `.relative` `.absolute` `.fixed` `.sticky` `.inset-0` `.top-0` `.z-10` `.z-50` `.z-100`
- Size: `.w-full` `.w-auto` `.h-full` `.h-auto` `.h-screen` `.min-h-screen`
- Overflow: `.overflow-hidden` `.overflow-auto` `.overflow-x-auto`

### Responsive variants

Mobile-first: `bp:class` applies from that width up (`sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px).
Available for display (`block inline-block flex inline-flex grid hidden`), `grid-1/2/3/4/6/12`, `col-span-*`, `flex-row`, `flex-col`, `flex-wrap`, `items-*`, `justify-*`, `gap-*`, `text-left/center/right`.

```html
<div class="grid grid-1 sm:grid-2 lg:grid-4 gap-4">...</div>
<div class="hidden md:flex">...</div>
```

Max-width (desktop-first) helpers: `.hide-sm` (≤640px) `.hide-md` (≤768px) `.hide-lg` (≤1024px) `.show-sm` (hidden above 640px).

## Spacing

Steps: `0 1 2 3 4 5 6 8 10 12` for `.m-*` `.mt-*` `.mb-*` `.ml-*` `.mr-*` `.mx-*` `.my-*` `.p-*` `.py-*`.
Extras: `.m-auto` `.mx-auto` `.ml-auto` `.mr-auto` `.p-16` `.py-16` `.py-20` `.py-24`.
`.px-*` stops at `.px-10`. `.pt-*` `.pb-*` `.pl-*` `.pr-*` only have `0 4 6 8`.

## Typography

- Headings: `.h1` `.h2` `.h3` `.h4` `.h5` `.h6` `.display-1` `.display-2`
- Size: `.text-xs` `.text-sm` `.text-base` `.text-lg` `.text-xl` `.text-2xl` `.text-3xl` `.text-4xl` `.text-5xl` `.text-6xl`
- Color: `.text-primary` `.text-secondary` `.text-tertiary` `.text-disabled` `.text-inverse` `.text-accent` `.text-success` `.text-warning` `.text-danger` `.text-info` `.text-gradient`
- Weight: `.font-normal` `.font-medium` `.font-semibold` `.font-bold` `.font-mono`
- Align/wrap: `.text-left` `.text-center` `.text-right` `.text-balance` `.text-pretty` `.text-nowrap` `.text-truncate`
- Leading: `.leading-tight` `.leading-snug` `.leading-normal` `.leading-relaxed`
- Tracking: `.tracking-tight` `.tracking-snug` `.tracking-normal` `.tracking-wide` `.tracking-wider`
- Case: `.uppercase` `.lowercase` `.capitalize`

## Surfaces and effects

- Backgrounds: `.bg-base` `.bg-subtle` `.bg-muted` `.bg-surface` `.bg-accent` `.bg-overlay`
- Patterns: `.bg-dots` `.bg-grid` `.bg-lines` `.bg-diagonal` + `.pattern-sm` `.pattern-md` `.pattern-lg` `.pattern-subtle` `.pattern-strong` `.pattern-fade` `.pattern-fade-t` `.pattern-fade-b`
- Borders: `.border` `.border-0` `.border-t` `.border-b` `.border-l` `.border-r` `.border-strong`
- Radius: `.rounded-xs` `.rounded-sm` `.rounded` `.rounded-lg` `.rounded-xl` `.rounded-2xl` `.rounded-full`
- Shadow: `.shadow-none` `.shadow-xs` `.shadow-sm` `.shadow` `.shadow-lg` `.shadow-xl`
- Effects: `.glass` `.blur` `.blur-sm` `.noise` `.gradient-animated` `.opacity-0` `.opacity-50` `.opacity-75` `.opacity-100`
- Motion: `.animate` `.fade-in` `.slide-up` `.scale-in` `.delay-1` … `.delay-5` `.transition` `.transition-colors` `.transition-transform` `.scale-95` `.scale-100` `.scale-105`
- Misc: `.divider` `.sr-only` `.cursor-pointer` `.select-none` `.pointer-events-none` `.focus-ring`

## Components

- Buttons: `.btn` + `.btn-primary` `.btn-secondary` `.btn-outline` `.btn-ghost` `.btn-danger`; size `.btn-xs` `.btn-sm` `.btn-lg` `.btn-xl`; `.btn-block` `.btn-icon`
- Card: `.card` `.card-hover` > `.card-header` `.card-body` `.card-footer`
- Badge: `.badge` + `.badge-default` `.badge-accent` `.badge-success` `.badge-warning` `.badge-danger` `.badge-info`; `.badge-dot`
- Notice: `.notice` + `.notice-default` `.notice-success` `.notice-warning` `.notice-danger` `.notice-info`
- Avatar: `.avatar` + `.avatar-xs` `.avatar-sm` `.avatar-md` `.avatar-lg` `.avatar-xl`; wrap several in `.avatar-group`
- Progress: `.progress` (`.progress-sm` `.progress-lg`) > `.progress-bar`
- Skeleton: `.skeleton` `.skeleton-text` `.skeleton-circle`
- Table: `.table-wrapper` > `table.table` (`.table-hover`)
- Tabs: `.tabs` (`.tabs-pill`) > `.tab`, current one `.tab.active`
- Tooltip: `data-tooltip="Text"` on any element; `.tooltip-wrapper` as positioning parent
- Code window: `.code-window` > `.code-titlebar` + `.code-body`; tokens `.code-tag` `.code-attr` `.code-string` `.code-comment`

```html
<div class="form-group">
  <label class="label" for="email">Email</label>
  <input class="input" id="email" type="email">
  <p class="form-hint">We never share it.</p>
</div>
<label class="toggle"><input type="checkbox"><span class="toggle-slider"></span></label>
```

Forms also have `.input-error` + `.form-error`, `.input-row`, `.select`, `.textarea`, `.checkbox`, `.radio`.

```html
<div class="overlay">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="m-title">
    <div class="modal-header"><h2 class="h5" id="m-title">Title</h2></div>
    <div class="modal-body">...</div>
    <div class="modal-footer"><button class="btn btn-primary">OK</button></div>
  </div>
</div>
```

## Navigation

- Site bar: `nav.site-nav` > `.nav-logo` + `.nav-links` (hidden ≤768px) + `.nav-actions`; links `.nav-link` (`.nav-link.active`)
- Inline navbar: `.navbar` > `.navbar-brand` + `.navbar-nav`
- Footer: `footer.site-footer` > `.footer-grid` (`.footer-brand-name` `.footer-brand-desc` `.footer-col-title` `.footer-links` `.footer-link`) + `.footer-bottom` (`.footer-copy`)

## Sections

- Hero: `.hero` > `.hero-eyebrow` `.hero-title` `.hero-subtitle` `.hero-actions` `.hero-meta`
- Section: `.section` (`.section-sm` `.section-lg`) > `.section-header` > `.section-eyebrow` `.section-title` `.section-sub`
- Features: `.features-grid` > `.feature-card` > `.feature-icon` `.feature-title` `.feature-desc`
- Pricing: `.pricing-grid` > `.pricing-card` (`.featured`) > `.pricing-badge` `.pricing-name` `.pricing-price` `.pricing-period` `.pricing-desc` `.pricing-divider` `.pricing-features` > `.pricing-feature` (`.included`)
- Stats: `.stats-section` > `.stats-grid` > `.stat-item` > `.stat-number` `.stat-label`
- Testimonials: `.testimonials-grid` > `.testimonial` > `.testimonial-text` `.testimonial-author` (`.author-name` `.author-role`)
- Logos: `.logos-bar` > `.logos-list` > `.logo-item`
- CTA: `.cta-section` > `.cta-title` `.cta-sub`
