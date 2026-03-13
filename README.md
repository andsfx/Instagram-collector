# Instagram Collector

Pipeline utama repo ini sekarang adalah **hybrid workflow**:

- **SocialBlade + Scrapling** → untuk `followers`, `following`, `posts_count`
- **Apify** → untuk post-level data, `Engagement`, dan `Content Breakdown`

## Current Recommended Flow

### Source split

#### 1. SocialBlade
Dipakai untuk account-level stats:
- followers
- following
- posts_count

Target sheet:
- `Follower History`

#### 2. Apify
Dipakai untuk post-level data:
- latest posts
- likes
- comments
- media type
- permalink
- timestamp

Target sheets:
- `Engagement`
- `Content Breakdown`

## Master Command

Jalankan full workflow dari environment yang punya akses:
- Apify
- Google Sheets (`gog`)
- Scrapling/Python

```powershell
$env:APIFY_TOKEN = "your_apify_token"
powershell -ExecutionPolicy Bypass -File .\scripts\run\run-hybrid-master.ps1
```

## Required Environment

### Runtime
- Node.js + npm
- Python 3
- Scrapling
- `gog`

### Required environment variables

```powershell
$env:APIFY_TOKEN = "your_apify_token"
```

If `gog` keyring requires it in the current environment:

```powershell
$env:GOG_KEYRING_PASSWORD = "your_keyring_password"
```

## Main Scripts

### Master workflow
- `scripts/run/run-hybrid-master.js`
- `scripts/run/run-hybrid-master.ps1`

### SocialBlade side
- `scripts/socialblade/collect-socialblade-stats.py`
- `scripts/socialblade/update-follower-history.js`

### Apify side
- `scripts/apify/run-apify-batch.js`
- `scripts/apify/transform-apify-posts.js`

### Sheet sync
- `scripts/sync/update-google-sheet.js`

## Output Files

### SocialBlade stats
```text
data/raw/stats/<username>-stats.json
```

### Apify raw datasets
```text
incoming/apify/datasets/<username>.json
```

### Raw posts
```text
data/raw/posts/<username>-latest12-full.json
```

### Metrics
```text
data/processed/metrics/<username>-metrics.json
```

### Merged
```text
data/processed/merged/<username>.json
```

## Daily Operating Pattern

1. run hybrid master command
2. verify `Follower History` updated for today
3. verify `Engagement` updated
4. verify `Content Breakdown` updated

## Documentation Index

- `docs/hybrid-flow.md`
- `docs/hybrid-master.md`
- `docs/apify-transition.md`
- `docs/apify-batch.md`
- `docs/daily-operations.md`
- `docs/spreadsheet-mapping.md`
- `docs/setup-auth.md`
- `docs/workflow.md`

## Deprecated / Legacy Notes

The following older flows are no longer the recommended default:

### Legacy browser-based Instagram scraping
The old Playwright/persistent-profile collector path is considered **legacy** because it was prone to:
- redirects to Instagram login
- unstable sessions
- zero-post outputs
- hard-to-repeat runs

Those scripts remain in the repo for reference/backward compatibility, but they are **not the primary workflow** anymore.

### Legacy direct `Follower History` assumptions for post metrics
`Follower History` should **not** be used as the target for post-level engagement/content metrics.

Current sheet mapping is:
- `Follower History` ← SocialBlade stats
- `Engagement` ← Apify metrics
- `Content Breakdown` ← Apify content breakdown

## Recommended Direction

If unsure, always prefer:

```text
run-hybrid-master
```

over any older manual collector flow.


## Dashboard Deploy

Dashboard frontend now lives in `dashboard/`.
For Vercel, set the project **Root Directory** to:

```text
dashboard
```
