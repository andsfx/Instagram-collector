# Workflow

## Current default workflow

Repo ini sekarang menggunakan **hybrid workflow**.

### Source A — SocialBlade + Scrapling
Dipakai untuk:
- followers
- following
- posts_count

Target sheet:
- `Follower History`

### Source B — Apify
Dipakai untuk:
- latest 12 posts
- likes
- comments
- media type
- permalink
- timestamp

Target sheets:
- `Engagement`
- `Content Breakdown`

## End-to-end Flow

### Step 1 — collect SocialBlade stats
Script:
- `scripts/socialblade/collect-socialblade-stats.py`

Output:
- `data/raw/stats/<username>-stats.json`

### Step 2 — update Follower History
Script:
- `scripts/socialblade/update-follower-history.js`

### Step 3 — run Apify batch
Script:
- `scripts/apify/run-apify-batch.js`

Output:
- `incoming/apify/datasets/<username>.json`
- `data/raw/posts/<username>-latest12-full.json`
- `data/processed/metrics/<username>-metrics.json`
- `data/processed/merged/<username>.json`

### Step 4 — sync sheets
Script:
- `scripts/sync/update-google-sheet.js`

Targets:
- `Engagement`
- `Content Breakdown`

### Step 5 — easiest full run
Script:
- `scripts/run/run-hybrid-master.ps1`
- `scripts/run/run-hybrid-master.js`

## Deprecated legacy path

The older browser-session Instagram scraping path is kept only for reference/backward compatibility.
It is no longer the preferred default because it was unstable against login redirects and session issues.
