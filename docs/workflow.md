# Workflow

## Overview

Repo ini memakai 2 sumber data utama:

1. **Profile/account stats**
   - followers
   - following
   - posts_count
   - diambil lewat Scrapling

2. **Post-level metrics**
   - likes
   - comments
   - tipe post
   - diambil dari JSON hasil collector post

Kedua sumber ini digabung lalu dikirim ke spreadsheet.

## End-to-end Flow

### Step 1 — collect profile stats
Script:
- `scripts/collect/collect-profile-stats.py`

Output:
- `data/raw/profiles/<username>.json`

### Step 2 — collect latest posts
Script:
- `scripts/collect/collect-instagram-posts-full.js`

Output:
- `data/raw/posts/<username>-latest12-full.json`

### Step 3 — calculate metrics
Script:
- `calc-instagram-metrics.js`

Output:
- `data/processed/metrics/<username>-metrics.json`

### Step 4 — merge dataset
Script:
- `scripts/transform/merge-instagram-dataset.js`

Output:
- `data/processed/merged/<username>.json`

### Step 5 — validate
Script:
- `scripts/transform/validate-output.js`

### Step 6 — sync to sheet
Script:
- `scripts/sync/update-google-sheet.js`

Target:
- `Follower History`

## Run Order

### Single account
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run\run-instagram-account.ps1 -Account grandmetropolitan
```

### All accounts
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run\run-all-instagram-accounts.ps1
```

## Why this structure exists

Pemisahan ini penting supaya:
- raw data tetap bisa diaudit
- metrics bisa dihitung ulang tanpa scrape ulang
- sync spreadsheet tidak langsung bergantung pada scraping real-time
- debugging lebih gampang per tahap
