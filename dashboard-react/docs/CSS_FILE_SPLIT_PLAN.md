# CSS File Split Plan

Target: pecah `src/styles.css` yang sekarang masih monolitik menjadi struktur yang lebih rapi tanpa mengubah perilaku visual.

## Target Structure

```text
src/
  styles/
    index.css
    tokens.css
    base.css
    layout.css
    components/
      shell.css
      cards.css
      data-display.css
      charts.css
      states.css
      mobile.css
```

## Import Order

`src/styles/index.css`

```css
@import './tokens.css';
@import './base.css';
@import './layout.css';
@import './components/shell.css';
@import './components/cards.css';
@import './components/data-display.css';
@import './components/charts.css';
@import './components/states.css';
@import './components/mobile.css';
```

Lalu `src/main.tsx` ganti import dari `./styles.css` menjadi `./styles/index.css`.

## File-by-File Move Plan

### `src/styles/tokens.css`

Pindahkan:
- `:root` tokens light theme
- `:root[data-theme="dark"]` tokens dark theme

Termasuk token:
- color tokens: `--bg`, `--panel`, `--border`, `--text`, `--brand`, `--accent`, `--success`, `--warning`, `--danger`
- chart tokens: `--chart-grid`, `--chart-axis`, `--chart-tooltip-bg`, `--chart-tooltip-border`
- elevation: `--shadow-sm`, `--shadow-md`
- radius: `--radius-lg`, `--radius-md`, `--radius-sm`

Tujuan:
- jadi source of truth tema sekarang
- nanti paling mudah dipetakan ke `tailwind.config`

### `src/styles/base.css`

Pindahkan:
- `* { box-sizing: border-box; }`
- `html { scroll-behavior: smooth; }`
- `@media (prefers-reduced-motion: reduce)`
- `body`
- `:root[data-theme="dark"] body`
- elemen global: `a`, `button`, `input`, `select`, `textarea`
- `:focus-visible`

Tambahkan catatan:
- semua aturan global dan accessibility global hanya boleh ada di sini

### `src/styles/layout.css`

Pindahkan:
- `.app-shell`
- `.section-anchor`
- `.stack-lg`
- grid wrappers generik:
  - `.meta-grid`
  - `.tile-grid`
  - `.summary-grid`
  - `.chart-grid`
  - `.breakdown-grid`
  - `.snapshot-grid`
  - `.ranking-grid`
  - `.insight-grid`
  - `.daily-grid`
- layout helpers:
  - `.split-row`
  - `.controls-row`
  - `.control-field`
  - `.control-field-inline`
  - `.metric-grid`
  - `.metric-row`
  - `.table-row`

Tujuan:
- pisahkan aturan grid/layout dari warna dan komponen visual

### `src/styles/components/shell.css`

Pindahkan:
- `.skip-link`
- `.section-nav`
- `.section-nav-links`
- `.section-nav-link`
- `.theme-toggle`
- `.hero`
- `.hero-topline`
- `.hero h1`
- `.hero-copy`
- `.hero-subtitle`

Tujuan:
- semua outer-shell, hero, sticky nav, dan chrome page terkumpul di satu tempat

### `src/styles/components/cards.css`

Pindahkan:
- `.panel`
- `.panel-section`
- `.section-card`
- `.section-header`
- `.section-heading`
- `.eyebrow`
- `.section-title`
- `.section-description`
- `.muted`
- grup base card surface:
  - `.stat-card`
  - `.kpi-card`
  - `.insight-card`
  - `.insight-tile`
  - `.account-card`
  - `.daily-card`
  - `.ranking-card`
  - `.chart-card`
  - `.breakdown-card`
  - `.snapshot-card`
- typography helpers:
  - `.stat-label`
  - `.micro-label`
  - `.stat-value`
  - `.big-value`
  - `.stat-detail`
  - `.micro-detail`
  - `.helper-copy`

Tujuan:
- satu tempat untuk primitive card surface dan typography dashboard

### `src/styles/components/data-display.css`

Pindahkan:
- `.badge-row`, `.chip-row`
- `.badge`, `.chip`
- tone variants:
  - `.badge-brand`, `.chip-brand`
  - `.badge-success`, `.chip-success`
  - `.badge-warning`, `.chip-warning`
  - `.badge-danger`, `.chip-danger`
- list helpers:
  - `.bullet-list`
  - `.ranking-list`
- `.metric-chip`, `.metric-chip.is-active`
- `.comparison-card`
- `.comparison-head`
- `.comparison-list`
- `.comparison-row`
- `.comparison-value`
- `.comparison-label`
- `.score-track`
- `.score-side`, `.score-side.is-a`, `.score-side.is-b`
- `.metric-name`, `.table-muted`, `.metric-value`, `.table-strong`
- `.accent-link`
- `.divider`

Tujuan:
- semua badge/chip/table/comparison patterns jadi domain tersendiri

### `src/styles/components/charts.css`

Pindahkan:
- `.chart-wrap`
- `.chart-wrap-compact`
- `.chart-wrap-lg`
- `.chart-scroll-shell`
- `.chart-min-wide`
- `.chart-min-xl`
- `.chart-card-wide`
- `.heatmap-grid`
- `.heatmap-scroll-shell`
- `.heatmap-header`
- `.heatmap-day`
- `.heatmap-cell`
- `.heatmap-corner`
- `.featured-post`

Tujuan:
- semua visual wrappers yang paling mungkin jadi target hybrid Tailwind nanti terpisah dari cards umum

### `src/styles/components/states.css`

Pindahkan:
- `.empty-state`
- `.state-panel`
- `.state-loading .state-dot`
- `.state-error`
- `.retry-button`
- `.loader`
- `.error-panel`

Tujuan:
- loading/error/empty jadi reusable domain sendiri

### `src/styles/components/mobile.css`

Pindahkan seluruh breakpoint:
- `@media (max-width: 1024px)`
- `@media (max-width: 720px)`

Termasuk mobile-only helpers:
- `.daily-mobile-list`
- `.daily-mobile-item`
- `.daily-mobile-date`
- `.daily-mobile-metrics`
- `.daily-mobile-row`
- `.daily-mobile-summary`

Tujuan:
- semua responsive override terkonsolidasi dulu
- nanti baru jika perlu dipisah lagi per domain

## Safe Refactor Order

1. Buat folder `src/styles/` dan file `index.css`
2. Pindahkan `tokens.css`
3. Pindahkan `base.css`
4. Pindahkan `layout.css`
5. Pindahkan `shell.css`
6. Pindahkan `cards.css`
7. Pindahkan `data-display.css`
8. Pindahkan `charts.css`
9. Pindahkan `states.css`
10. Pindahkan `mobile.css`
11. Ganti import di `src/main.tsx`
12. Jalankan `npm run build`

## Rules During Split

1. Jangan rename class saat split pertama
2. Jangan ubah selector specificity saat split pertama
3. Jangan campur refactor Tailwind ke langkah split ini
4. Setelah split stabil, baru lakukan cleanup class yang redundant
