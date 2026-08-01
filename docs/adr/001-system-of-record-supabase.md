# ADR 001: Supabase as system of record for daily metrics

## Status

Accepted

## Context

Daily metrics historically lived in Google Sheets (`Follower History`, `Engagement`, `Content Breakdown`). The repo also has Supabase schema (`follower_history`, `engagement`, `content_breakdown`) whose migration comments say sheets are being replaced, plus local JSON paths and a versioned dashboard payload.

Dual write paths increase failure modes (partial sync, drift, unclear “today’s numbers”). Dashboard builders already lean toward Supabase-shaped data and schema v2 JSON export.

## Decision

**Supabase is the system of record** for Account daily metrics (follower history, engagement, content breakdown, and related tables).

Google Sheets are not SOT. If retained, they are optional export/reporting only—not required for pipeline success or dashboard correctness.

The dashboard may still be served from a generated `dashboard/data.json` (or `/api/dashboard-data`) **derived from Supabase** (or from an export built from Supabase), not as an independent SOT.

## Consequences

- Hybrid master and sync scripts should treat Supabase upserts as the critical write path.
- **Sheets dual-write is optional and non-blocking:** if configured it may run, but sheet failure does not fail the day when Supabase + dashboard export succeeded.
- Docs that still call Sheets the SOT need updating to match this ADR.
- Operators need Supabase credentials/env for production runs; `gog`/Sheets become non-blocking if kept.
