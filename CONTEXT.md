# CONTEXT.md

Shared vocabulary for Instagram-collector. Updated during `/grill-with-docs`.

## Glossary

| Term | Definition |
|------|------------|
| **Account** | An Instagram profile tracked by this system, identified by `username` (e.g. `metmalbekasi`). Config lives in `config/accounts.json` / Supabase `accounts`. |
| **Hybrid workflow** | Official daily pipeline: SocialBlade+Scrapling for account-level stats, Apify for post-level engagement. Orchestrated by `run-hybrid-master`. |
| **Account-level stats** | Followers, following, posts count for an Account. Source of truth for collection: **SocialBlade + Scrapling**. Local path: `data/raw/stats/<username>-stats.json`. |
| **Post-level data** | Latest N posts with likes, comments, media type, permalink, timestamp. Source of truth for collection: **Apify**. Canonical N = **12** (`latestPostsCount`); Engagement/Content Breakdown use this window only. |
| **Follower History** | Time series of account-level stats by date×username. Sheet name historically; also Supabase table `follower_history`. |
| **Engagement** | Aggregated metrics over the latest posts window (avg likes/comments, engagement rate, totals). Sheet + Supabase table `engagement`. |
| **Content Breakdown** | Mix of media types (reels/carousel/image/video) plus per-type averages and best post. Sheet + Supabase table `content_breakdown`. |
| **Engagement rate (ER)** | `((avg_likes + avg_comments) / followers) * 100` over the latest-**12** posts window. Followers from account-level stats (SocialBlade) for that day when available. Implemented by `computeEngagementRate` in `calc-instagram-metrics.js`. |
| **Dashboard payload** | Versioned JSON consumed by the React dashboard (`DashboardRecord` / schema v2). Built by export scripts; served as `dashboard/data.json` or `/api/dashboard-data`. |
| **Brand account** | Primary mall Account for head-to-head / featured comparisons: **`metmalbekasi`**. |
| **System of record (SOT)** | Authoritative store for daily Account metrics. **Supabase** (tables: `follower_history`, `engagement`, `content_breakdown`, …). See ADR 001. |
| **Dashboard export** | Generated artifact (`dashboard/data.json` / API) derived from SOT for the React UI—not itself the SOT. |
| **Sheets (optional)** | Legacy Google Spreadsheet targets; not SOT. May remain as optional export only. |
| **Nested tree** | Path `Instagram-collector/Instagram-collector/`. **Legacy dead** duplicate of root—do not run pipeline/graphify against it; cleanup candidate. |
| **Dashboard primary job** | **Competitive daily brief** for brand Account `metmalbekasi`: open on Summary; peers exist for context in Comparison/Growth, not as equal multi-lab. |
| **Dashboard sections** | Nav IA (fixed product language): Summary, Growth, Content, Comparison, Charts, Pattern, Recap (`App.tsx` `SECTIONS`). |
| **Freshness SLA** | Dashboard data is **fresh** ≤24h from `generated_at`, **stale** ≤48h, else **critical**. Implemented in `FreshnessMonitor` and `classifyFreshness`. |
| **Presentation report** | Payload block `presentation_report` (executive KPIs + bullets) built for brief/narrative—not a separate product from the dashboard. |
| **Rankings** | Ordered lists in payload: `rankings.by_followers`, `rankings.by_engagement_rate` across tracked Accounts. |
| **Peer account** | Any tracked Account that is not the Brand account; used as competitors in Comparison / Head-to-Head. |
| **Head-to-Head (H2H)** | Two-account comparison UI. Defaults: **A = Brand**, **B = Peer with most followers**, metric = **followers**. Presets include brand-vs-top-followers, brand-vs-top-ER, top-two by followers. |
| **Growth windows** | Payload `growth` per Account: `followers_change_1d`, `followers_change_7d`, `pct_change_7d`. “Fastest growth” in Summary uses **7d %** unless a view explicitly uses 1d. |
| **Display locale** | Dashboard numbers/dates: **`id-ID`** + timezone **`Asia/Jakarta` (WIB)**. `generated_at_wib` is the operator-facing generation timestamp. |
| **Posting heatmap** | Pattern-section matrix: days Sen–Min × slots Pagi (06–11), Siang (12–16), Sore (17–20), Malam (21–05), from post timestamps. |
| **Daily metrics range** | Pattern/daily table default range **7 days** (`dmRangeDays` in App); operator-selectable, not a second SOT window. |
| **Sheets dual-write** | Optional and **non-blocking** during transition (see ADR 001). Not required for day-complete or dashboard correctness. |
| **UI language policy** | **Bilingual operator UI**: Indonesian for nav/narrative; short English metric jargon (Growth, ER, Head-to-Head, Performance overview) allowed. No full monolingual rewrite required for shared language. |
| **Enabled account** | Account with `enabled: true` in config/SOT; hybrid master only processes these. |
| **Partial day** | Collection run where some steps or accounts fail. **Not day-complete** for product ops. |
| **Day-complete** | For observation date D: **every Enabled account** has complete account-level stats **and** post-level engagement/content for D in SOT (and thus exportable dashboard). Partial Apify/stats success may continue the pipeline for salvage, but does **not** count as day-complete. |
| **Null metric display** | Missing/invalid numeric fields are `null` in payload; UI renders **`-`** (formatters). Null ≠ zero. |
| **Missing account hole** | Enabled account absent from `latest` / breakdown / insights for D → day not complete; verifier treats as failure when checking required accounts. |
| **Dashboard publish/deploy** | **Auto-publish only when day-complete.** Salvage/local export OK on partial days; production commit/push/deploy requires day-complete **or** explicit force. |
| **Observation date (D)** | **WIB calendar date at hybrid job start** (default “today Asia/Jakarta”). All stats/engagement/content rows for that run share the same D; one run does not auto-split across two dates. Stamped on SOT rows and `latest.date`. |
| **Required accounts (verifier)** | Hard-coded checklist of usernames the live dashboard must include for a hard pass (today mirrors the five Enabled accounts). Should stay aligned with Enabled accounts. |
| **Dashboard shell** | Chrome around section content: left `SectionNav` (desktop) / mobile drawer, sticky section header, main content frame, skip link, loading/error shells. Not the metric math. |
| **Full shell rebuild** | Visual/interaction rebuild of Dashboard shell only (layout, tokens, nav/header voice, card chrome). Preserves IA (`Dashboard sections`), data hooks, selectors, and bilingual copy policy. |
| **Design system (locked)** | Project design source of truth in root [`design.md`](design.md). Hallmark multi-page/app redesigns defer to it (genre, theme, type, shell contract). **Superseded 2026-08-01** — replaced by a new system written from scratch (see Full app redesign / ADR 002). |
| **Full app redesign** | Rebuild of the **entire dashboard app** — shell plus content of all 7 sections — under a **new design system** written from scratch in [`design.md`](design.md). Replaces the 2026-07-30 lock. Preserves IA (`Dashboard sections`), data hooks, selectors, and bilingual copy unless explicitly changed. |
| **Hallmark redesign (app)** | Historical in-place visual redesign under a locked `design.md`; no production file deletion without explicit approval; diversification inverted (consistency across sections). The 2026-08-01 Full app redesign intentionally breaks the lock instead. |

## Open questions

_None open for design direction. Design system settled via grill (ADR 002) and `design.md` rewritten 2026-08-01: genre **editorial**, theme **Newsprint**, macrostructure **Stat-Led**, nav **N6 masthead + section row**, type **Instrument Serif + IBM Plex Sans**, dark mode **dual theme (night edition)**, accent **brand pink**. Implementation of the Full app redesign proceeds from the new `design.md`._

## Decisions (ADRs)

- [ADR 001](docs/adr/001-system-of-record-supabase.md) — Supabase is system of record for daily metrics.
- **Design lock (2026-07-30):** Dashboard UI system locked in [`design.md`](design.md) — genre modern-minimal, macrostructure Workbench, top bar nav, brand accent `#E1306C`, display Instrument Serif + body Inter. Amend `design.md` before theme/nav forks. (Documented in design.md; not a separate ADR — reversible by editing the lock file.) **Superseded 2026-08-01 by ADR 002.**
- [ADR 002](docs/adr/002-full-app-redesign-new-design-system.md) — Full app redesign under a new design system; supersedes the 2026-07-30 design lock.
