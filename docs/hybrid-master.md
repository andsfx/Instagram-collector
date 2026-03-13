# Hybrid Master Command

Command master ini menjalankan seluruh flow hybrid:

1. Collect stats dari SocialBlade untuk semua akun
2. Update `Follower History`
3. Run batch Apify untuk semua akun
4. Update `Engagement`
5. Update `Content Breakdown`

## Files

- `scripts/run/run-hybrid-master.js`
- `scripts/run/run-hybrid-master.ps1`

## Required environment

### APIFY_TOKEN

```powershell
$env:APIFY_TOKEN = "your_apify_token"
```

### Optional (if needed in current environment)
If `gog` keyring requires a password in the execution environment, set:

```powershell
$env:GOG_KEYRING_PASSWORD = "your_keyring_password"
```

## Run

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run\run-hybrid-master.ps1
```

## What success looks like

- `Follower History` updated for today
- `Engagement` updated for all valid accounts
- `Content Breakdown` updated for all valid accounts
- final JSON summary printed to stdout
