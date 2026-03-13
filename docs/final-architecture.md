# Final Architecture and Source of Truth

Dokumen ini menjelaskan arsitektur final `Instagram-collector` setelah workflow utama dipindahkan ke model hybrid.

## Core principle

Repo utama dan source of truth workflow sekarang adalah:

- **`Instagram-collector`**

Semua komponen utama berada di repo ini:
- collection
- transform
- spreadsheet sync
- dashboard export
- dashboard frontend
- deploy config

---

## Source of truth by domain

## 1. Account-level stats
### Source
- **SocialBlade + Scrapling**

### Used for
- followers
- following
- posts_count

### Local output
```text
data/raw/stats/<username>-stats.json
```

### Spreadsheet target
- `Follower History`

### Status
- active
- validated
- official source for stats

---

## 2. Post-level engagement data
### Source
- **Apify**

### Used for
- latest 12 posts
- likes
- comments
- media type
- permalink
- timestamp

### Local output
```text
incoming/apify/datasets/<username>.json
data/raw/posts/<username>-latest12-full.json
data/processed/metrics/<username>-metrics.json
data/processed/merged/<username>.json
```

### Spreadsheet targets
- `Engagement`
- `Content Breakdown`

### Status
- active
- validated for all 5 current accounts
- official source for post-level metrics

---

## Spreadsheet mapping

## `Follower History`
### Source of truth
- SocialBlade stats

### Contains
- followers
- following
- posts

### Important rule
- Do not write Apify engagement/content metrics here.

---

## `Engagement`
### Source of truth
- Apify metrics

### Contains
- Posts_Analyzed
- Avg_Likes
- Avg_Comments
- Engagement_Rate
- Total_Likes_Last12
- Total_Comments_Last12

---

## `Content Breakdown`
### Source of truth
- Apify content breakdown

### Contains
- reels
- carousel
- image
- video
- total analyzed
- avg likes/comments/ER
- per-type averages
- best post info

---

## Dashboard architecture

Dashboard sekarang berada di repo ini:

```text
dashboard/
  index.html
  data.json
  vercel.json
```

## Dashboard source of truth

Primary data file:

```text
dashboard/data.json
```

This file is generated from the hybrid workflow by:

```text
scripts/export/build-dashboard-data.js
```

The dashboard uses:
- SocialBlade-derived stats for account-level metrics
- Apify-derived metrics for engagement and content breakdown

---

## Deploy architecture

### Vercel project
- `instagram-tracker-dashboard`

### Git repository
- `andsfx/Instagram-collector`

### Root Directory
```text
dashboard
```

### Deployment result
- live dashboard now serves from the new repo and dashboard subdirectory

---

## Main workflow commands

## Hybrid master workflow
```text
scripts/run/run-hybrid-master.js
scripts/run/run-hybrid-master.ps1
```

This master workflow runs:
1. SocialBlade stats collection
2. `Follower History` update
3. Apify batch run
4. `Engagement` sync
5. `Content Breakdown` sync

## Dashboard export
```text
scripts/export/build-dashboard-data.js
```

This builds:
- `dashboard/data.json`

---

## Operational summary

### Stats path
SocialBlade + Scrapling
→ `Follower History`

### Post metrics path
Apify
→ `Engagement`
→ `Content Breakdown`

### Dashboard path
Hybrid data
→ `dashboard/data.json`
→ `dashboard/index.html`
→ Vercel

---

## Deprecated legacy flow

The older browser-based Instagram scraping path is now **legacy/deprecated**.

### Reason
- redirected to Instagram login frequently
- unstable browser session dependency
- frequent zero-post output
- inefficient for repeatable daily operations

### Current status
Kept only for:
- backward compatibility
- debugging/reference

It is **not** the primary source of truth anymore.

---

## Final source of truth summary

### Repo
- `Instagram-collector`

### Stats
- SocialBlade + Scrapling

### Post metrics
- Apify

### Stats sheet
- `Follower History`

### Engagement sheet
- `Engagement`

### Content sheet
- `Content Breakdown`

### Dashboard frontend
- `dashboard/index.html`

### Dashboard data
- `dashboard/data.json`

### Deploy
- Vercel project using repo `Instagram-collector` with root `dashboard`
