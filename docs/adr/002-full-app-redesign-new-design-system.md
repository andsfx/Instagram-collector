# ADR 002: Full app redesign under a new design system

## Status

Accepted

## Context

The dashboard UI was locked 2026-07-30 under a `design.md` system (genre modern-minimal, macrostructure Workbench, top bar nav, brand accent `#E1306C`, display Instrument Serif + body Inter). A shell rebuild and a Hallmark punch-list pass were completed against that lock, and the shell was audit-clean (0 critical findings).

The user then requested a **full project redesign** (scope: the entire dashboard app — all 7 sections, not just the shell) and, when asked whether to extend the locked system or start fresh, chose **"Tulis design.md baru total"** — a completely new design system written from scratch, replacing the 2026-07-30 lock.

## Decision

**Write a brand new `design.md` from scratch** (genre, theme, type, nav, shell contract all re-decided), then rebuild the **entire dashboard app** — shell plus content of all 7 sections — under the new system via Hallmark.

The 2026-07-30 design lock is **superseded**. The old `design.md` content is preserved in git history; no production file deletion without explicit approval, but all visual layer work (shell + section surfaces) is in scope for the rebuild.

### Settled direction (via grill)

- **Genre:** editorial (canonical Hallmark content-led voice; display must be roman serif / condensed sans / display-heavy — not Inter/Geist; single accent <5%; asymmetric layout, hairlines, generous whitespace).
- **Theme:** Newsprint (roman-serif display in sentence case, double rule, cool slate paper; static print metaphor — no scroll reveals). Remaining sub-decisions (nav archetype, type faces, dark mode, accent hue) pending grill.
- **Nav:** N6 masthead + section row — large centred wordmark, double rule, 7-section tab row beneath (Summary · Growth · Content · Comparison · Charts · Pattern · Recap), print-like section index.
- **Type faces:** display Instrument Serif (roman, Newsprint voice) + body editorial sans non-default (Archivo / IBM Plex Sans) — serif headline voice with crisp data/table numbers.
- **Dark mode:** dual theme retained — light Newsprint default, dark as a designed "night edition" (inverted paper/ink, deep slate, double rule preserved), not a naive palette invert. Toggle location per existing shell.
- **Accent hue:** single accent stays brand pink `#E1306C` (IG/brand identity continuity), re-disciplined to <5% viewport chrome per editorial rules — chart series may still use IG brand hues for data encoding only.

## Consequences

- All shell work from 2026-07-30 (top-bar nav, tokens, stamp) is provisional — it will be replaced by the new system, not extended.
- The new design system is the source of truth going forward; Hallmark redesigns defer to the new `design.md`.
- Preserved invariants (per CONTEXT.md): IA (`Dashboard sections`: Summary · Growth · Content · Comparison · Charts · Pattern · Recap), data hooks, selectors, lazy components, skeletons, dark/light toggle, bilingual operator UI, `id-ID` / `Asia/Jakarta`, null-metric `-` rendering.
- The new direction is being settled by grill (one question at a time) before `design.md` is rewritten.
