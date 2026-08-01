# Design — Instagram-collector Dashboard

New design system for the React operator dashboard (`dashboard-react`), replacing the 2026-07-30 lock (see ADR 002). Written from scratch under the Hallmark **editorial / Newsprint** system.
Every Hallmark redesign reads this file before emitting code. Do not regenerate per section — amend this file when the system needs to grow.

## Product

- **Primary job:** Competitive daily brief for brand account `metmalbekasi` (Summary home).
- **Audience:** Mall/brand operators reviewing peers, growth, content, H2H.
- **IA (fixed):** Summary · Growth · Content · Comparison · Charts · Pattern · Recap.
- **Locale:** `id-ID` + `Asia/Jakarta` (WIB). Null metrics render as `-`.
- **UI language:** Bilingual operator UI (Indonesian nav/narrative; short English metric jargon OK).

## Genre

**editorial** (canonical Hallmark content-led voice) — the dashboard reads like a daily broadsheet: hairlines, double rules, asymmetric rhythm, generous whitespace, single restrained accent. Not modern-minimal, not atmospheric, not playful. This is a **print metaphor on screen**.

## Theme — Newsprint

Cool slate paper, roman-serif display (sentence case), double rules. Static print metaphor: **no scroll reveals, no entrance animation**. Two live variants: **Day edition** (default) and **Night edition** (dark) — both designed, never a naive invert.

## Macrostructure family

| Page type | Macrostructure | Notes |
|-----------|----------------|-------|
| **App shell** | Stat-Led | Data is the narrative: Summary opens with the brand account's big numbers; every section leads with its figure. Masthead + section row; one visible section at a time |
| **Section surfaces** | Editorial panels | Hairline-framed panels and tables inside `max-w` content column; paper-2/paper-3 alternation for density breaks |
| **Marketing / landing** | *N/A* | Out of scope for this product |

**Nav archetype:** N6 Newspaper masthead — issue/date row in serif small caps above a large centred wordmark, double rule below, then the section row (7 tabs) reading like a broadsheet section index.  
**Footer archetype:** none (operator app — no marketing footer).  
**Hero enrichment:** none on all app surfaces.

## Theme tokens (OKLCH)

Day edition — paper is cool slate (never pure white), ink is deep slate (never pure black).

| Token | Day edition | Night edition |
|-------|-------------|---------------|
| `--color-paper` | `oklch(96.5% 0.006 250)` | `oklch(20% 0.012 255)` |
| `--color-paper-2` | `oklch(98.5% 0.005 250)` | `oklch(24% 0.012 255)` |
| `--color-paper-3` | `oklch(94% 0.008 250)` | `oklch(27% 0.014 255)` |
| `--color-ink` | `oklch(24% 0.015 255)` | `oklch(92% 0.008 250)` |
| `--color-ink-2` | `oklch(45% 0.012 255)` | `oklch(74% 0.01 250)` |
| `--color-rule` | `oklch(86% 0.01 250)` | `oklch(34% 0.012 255)` |
| `--color-accent` | `oklch(57% 0.21 8)` | `oklch(70% 0.19 8)` |
| `--color-accent-ink` | `oklch(99% 0 0)` | `oklch(99% 0 0)` |
| `--color-focus` | `oklch(55% 0.16 250)` | `oklch(72% 0.15 250)` |

Approx hex anchors (existing product names map 1:1):

| Product token | Role | Day hex (approx) |
|---------------|------|-------------------|
| `--bg` | paper | `#F4F6F8` |
| `--panel` | paper-2 | `#FBFCFD` |
| `--panel-muted` | paper-3 | `#EDF0F4` |
| `--text` | ink | `#23262E` |
| `--text-muted` / `--text-soft` | ink-2 | `#5A6472` / `#4E5A6B` |
| `--border` | rule | `#D3DAE3` |
| `--brand` | accent | `#E1306C` |
| `--accent` | focus family | `#4A6FA5` |

**Accent discipline:** single accent = brand pink `#E1306C`, used at <5% of any viewport. Do not invent new brand hues. Chart series (`--chart-1`…`--chart-6`) and account gradients stay for data encoding only — never chrome decoration. Focus ring is a slate-family hue (not pink) so it never reads as brand decoration.

## Typography

- **Display:** Instrument Serif, weight 400, roman, sentence case (no italic headers, no all-caps headlines). For masthead wordmark and the big KPI numerals.
- **Body:** IBM Plex Sans, weights 400–600 — an editorial non-default sans with strong tabular figures for data tables. (Archivo is the accepted alternative if Plex reads too technical in testing.)
- **Mono:** system mono only if needed for raw IDs; not a third brand face.
- **Issue line / small caps:** serif small caps for the masthead date/issue row and section index labels.
- **Display tracking:** tight on large stats (`-0.01em` to `-0.03em`); normal on body.
- **Type scale:** KPI numerals use the existing clamp patterns; section titles ~`text-lg` semibold sans — no display-hero section headings; hierarchy carries via rules, size and accent, not weight on the serif.
- **Section eyebrows / numbered tags:** OFF by default (no `01 · SUMMARY` kickers).
- **Italic:** body-emphasis only (long-form captions), never the header face.

## Spacing

4-point named scale. Prefer tokens over raw px in new work.

```text
--space-3xs: 0.25rem   --space-2xs: 0.5rem   --space-xs: 0.75rem
--space-sm:  1rem      --space-md:  1.5rem   --space-lg: 2rem
--space-xl:  3rem      --space-2xl: 4.5rem
```

Content column: ~`max-w-[1080px]` inside main (shell may go full remaining width).  
Section stack gap: `space-y-6` (1.5rem) unless a denser table needs less.

## Rules, radius & elevation

- **Panels:** hairline `1px` `var(--border)` frame — **hairlines, not heavy card borders**. No card-in-card.
- **Radius:** `--radius-sm` (6px) on controls; panels may be square-cornered or `--radius-sm`; no pill on data controls. No heavy rounded cards (16px+).
- **Shadows:** none or `--shadow-sm` only; the print metaphor is flat. Hover may lift with a hairline darkening, not a big shadow.
- **Double rule:** masthead bottom edge uses the Newsprint double rule (two tight hairlines).

## Motion

- **Stance:** static print metaphor — **no scroll reveals, no entrance animation** (Newsprint rule). No framer-motion / gsap dependency.
- Transitions on interactive states only: `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`; durations ≤220ms (`--dur-short`).
- Animate `opacity` / `transform` only.
- `prefers-reduced-motion: reduce` — opacity-only ≤150ms.
- Drawer open/close may use a short transform; no scroll-driven reveals anywhere.

## Microinteractions

- No refresh — data is per-day; no manual refresh button in shell.
- Hover tooltips delay ~800ms if added; focus delay 0ms.
- Interactive controls: default · hover · `:focus-visible` · active · disabled · loading · error · success where state exists.
- Focus ring: visible, ≥3:1, slate hue, **instant** (never animate ring appearance).

## CTA / control voice

- **Primary:** accent fill or accent-tinted + accent border; short verbs (`Coba lagi`, `Lihat detail`); square or `--radius-sm` — **never gradient-filled pills**.
- **Secondary:** outlined (hairline border) + ink text; same height rhythm as primary.
- **Nav item active:** ink weight shift + accent underline/rule beneath the active tab (broadsheet section-index voice) — not gradient fills on every row.
- **IG full gradient:** wordmark tile / rare badge only — not full-width chrome bars.

## Shell layout contract

1. **Masthead:** thin issue/date row (serif small caps: `EDISI · <date WIB>`), large centred wordmark, **double rule** below.
2. **Section row:** 7 section tabs in one horizontal row under the masthead (desktop) — the section index.
3. **Mobile:** masthead simplifies (smaller wordmark + issue row), section tabs collapse into a hamburger drawer that also hosts the theme toggle; main `pt-[...]` sized to the collapsed masthead.
4. **No sticky section header** — the active section tab is the only location indicator.
5. **No refresh button** — daily data, no manual refresh.
6. **Section body:** one visible section; others `hidden` (keep existing IA switch).
7. **Skip link:** preserve “Lewati navigasi”.
8. **Loading / error:** same shell chrome; content area skeleton or centred `ErrorState`.
9. **Night edition:** same masthead structure; paper/ink inverted per tokens; double rules and hairlines preserved.

## What surfaces MUST share

- Masthead wordmark + issue-row treatment
- Accent discipline (single pink, <5%)
- Display serif (Instrument Serif, weight 400) + body sans (IBM Plex Sans)
- Hairline frame language + section heading rhythm
- Token names consumed via `var(--*)` / Tailwind theme bridge

## What surfaces MAY differ on

- Internal panel grids (2-col charts vs table vs heatmap)
- Per-section paper-2/paper-3 alternation for density breaks
- Chart colour assignment by account (data, not chrome)

## Implementation boundaries

- **In scope for the rebuild:** full app — shell (masthead, section row, drawer, tokens, shell CSS) **plus all 7 section surfaces** (Summary · Growth · Content · Comparison · Charts · Pattern · Recap), under this system.
- **Out of scope unless asked:** pipeline, schema, selectors math, SOT, publish gates.
- **No deletions** of production routes/components without explicit file-level approval.
- **Legacy dead tree** `Instagram-collector/Instagram-collector/` is not a design target.

## Stamp (required on shell CSS entry)

```css
/* Hallmark · genre: editorial · macrostructure: Stat-Led · theme: Newsprint · enrichment: none
 * nav: N6 masthead + section row · footer: none · product: competitive-daily-brief
 */
```

## Exports

Canonical runtime tokens live in `dashboard-react/src/styles/tokens.css` (product names).
Hallmark core names above map onto those product tokens; do not fork a second live palette.

### tokens.css (Hallmark bridge — add alongside product tokens when implementing)

```css
:root {
  --color-paper: var(--bg);
  --color-paper-2: var(--panel);
  --color-paper-3: var(--panel-muted);
  --color-ink: var(--text);
  --color-ink-2: var(--text-muted);
  --color-rule: var(--border);
  --color-accent: var(--brand);
  --color-accent-ink: #ffffff;
  --color-focus: var(--accent);

  --font-display: "Instrument Serif", serif;
  --font-body: "IBM Plex Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

  --space-3xs: 0.25rem;
  --space-2xs: 0.5rem;
  --space-xs: 0.75rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 2rem;
  --space-xl: 3rem;
  --space-2xl: 4.5rem;

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-short: 220ms;
}
```

### Tailwind

Existing `tailwind.config.js` already bridges product CSS variables. Prefer those classes; do not hard-code hex in JSX.

---

*New system 2026-08-01 — replaces the 2026-07-30 lock per ADR 002. Amend this file before inventing a new theme or nav pattern.*
