# CSS to Tailwind Migration Matrix

Tujuan dokumen ini: menentukan urutan migrasi paling aman dari CSS custom ke Tailwind hybrid, tanpa merusak dashboard yang sekarang sudah live.

## Legend

- **Risk**: Low / Medium / High
- **Strategy**:
  - `Keep CSS`: pertahankan CSS custom dulu
  - `Hybrid`: wrapper/layout pakai Tailwind, visual detail tetap CSS/token
  - `Tailwind First`: relatif aman dipindah penuh lebih awal

## Matrix

| Component | Current CSS Dependence | Risk | Strategy | Why |
|---|---|---:|---|---|
| `HeaderBar` | low | Low | Tailwind First | mostly shell spacing and text hierarchy |
| `SectionNav` | medium | Medium | Hybrid | sticky behavior, mobile scroll, active state, skip-link relation |
| `ui.tsx / SectionCard` | high | Medium | Hybrid | central card primitive used almost everywhere |
| `FreshnessPanel` | low | Low | Tailwind First | mostly KPI card layout |
| `ExecutiveSummary` | low | Low | Tailwind First | text-heavy and grid-based |
| `TodaySummary` | low | Low | Tailwind First | simple tile cards |
| `InsightsPanel` | low | Low | Tailwind First | low-risk card repetition |
| `AccountOverviewGrid` | medium | Low | Hybrid | repeated stat cards with chip rows |
| `RankingGrowth` | medium | Low | Hybrid | list/table-like patterns but no complex media behavior |
| `ContentBreakdown` | medium | Medium | Hybrid | progress bars and featured card styles still benefit from CSS tokens |
| `PostSnapshot` | medium | Medium | Hybrid | featured post card and chip combinations |
| `DailyMetrics` | high | Medium | Keep CSS first | dual desktop/mobile presentation and table/list swap |
| `HeadToHead` | high | High | Keep CSS first | controls, comparison table, mobile collapse, chart shell |
| `Heatmap` | high | High | Keep CSS first | heatmap grid and scroll behavior are easier to preserve in CSS |
| `QuickVisual` | very high | High | Keep CSS first | chart wrappers, dark-mode chart tokens, min-width behavior |
| `SectionAsyncBoundary` | low | Low | Tailwind First | simple state wrappers and retry button |
| `useTheme` related shell states | low | Low | Tailwind First | class/data-theme integration is straightforward |

## Recommended Migration Order

### Phase 1: Shell and primitives

Migrate first:
- `HeaderBar`
- `SectionNav`
- `SectionAsyncBoundary`
- loading / error / empty states
- `SectionCard` wrappers and generic shell spacing

Reason:
- high reuse
- low chart risk
- good place to validate Tailwind token mapping

### Phase 2: Simple analytics sections

Migrate next:
- `FreshnessPanel`
- `ExecutiveSummary`
- `TodaySummary`
- `InsightsPanel`

Reason:
- mostly grid + typography
- easy to compare before/after visually

### Phase 3: Repeated card sections

Migrate next:
- `AccountOverviewGrid`
- `RankingGrowth`
- `ContentBreakdown`
- `PostSnapshot`

Reason:
- starts exercising chip/badge/card utilities
- still lower risk than table/heatmap/chart work

### Phase 4: Responsive dual-mode sections

Migrate after that:
- `DailyMetrics`

Reason:
- desktop table + mobile summary are more sensitive
- should wait until shell and card utilities are stable

### Phase 5: High-risk interactive analytics

Migrate last:
- `HeadToHead`
- `Heatmap`
- `QuickVisual`

Reason:
- most visual regressions likely here
- chart token story must already be stable
- mobile scroll shells must not regress

## Tailwind Adoption Rules

1. Do not migrate all classes at once.
2. Keep chart token styling in CSS variables even after Tailwind adoption.
3. Prefer Tailwind for:
   - spacing
   - layout
   - typography utilities
   - border radius
   - simple cards
4. Keep CSS for longer on:
   - heatmap grid math
   - chart wrappers
   - reduced-motion global rules
   - gradient and special surface treatments

## Exit Criteria Per Phase

Before moving to the next phase:

1. `npm run build` passes
2. dark mode still matches current tokens
3. mobile at `375px` remains readable
4. no new global horizontal scroll
5. keyboard focus states still visible
