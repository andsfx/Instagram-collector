# Daily Dashboard Automation

Entry point harian untuk flow hybrid + export dashboard + git push:

1. collect SocialBlade + update `Follower History`
2. run Apify batch + sync `Engagement` + `Content Breakdown`
3. build `dashboard/data.json`
4. commit `dashboard/data.json` jika berubah
5. push ke `main`
6. Vercel auto-deploy dari repo `Instagram-collector`

## Files

- `scripts/run/run-daily-dashboard.js`
- `scripts/run/run-daily-dashboard.ps1`

## Required env

### APIFY_TOKEN

```powershell
$env:APIFY_TOKEN = "your_apify_token"
```

### Optional

Jika environment perlu password keyring untuk `gog`:

```powershell
$env:GOG_KEYRING_PASSWORD = "your_keyring_password"
```

## Run

### Linux / current workspace

```bash
node ./scripts/run/run-daily-dashboard.js
```

### Windows PowerShell

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run\run-daily-dashboard.ps1
```

## Useful flags

### Rebuild dashboard only

```bash
node ./scripts/run/run-daily-dashboard.js --skip-collect
```

### Run without commit

```bash
node ./scripts/run/run-daily-dashboard.js --skip-commit --skip-push
```

## Success criteria

- `Follower History` updated
- `Engagement` updated
- `Content Breakdown` updated
- `dashboard/data.json` regenerated
- commit created only when `dashboard/data.json` changed
- push to `main` succeeds so Vercel can auto-deploy
