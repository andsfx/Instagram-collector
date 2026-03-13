# Setup Dependency and Auth

Dokumen ini menjelaskan dependency minimum untuk workflow default saat ini.

## Current default workflow

Current recommended workflow:
- SocialBlade + Scrapling for account stats
- Apify for post-level metrics
- `gog` for Google Sheets writes

## Runtime requirements

- Node.js + npm
- Python 3
- Scrapling
- `gog`

## Install Node dependency

```powershell
npm install
```

## Install Python dependency

```powershell
pip install scrapling
```

## Verify Scrapling

```powershell
python -c "import scrapling; print('scrapling ok')"
```

## Verify gog

```powershell
gog version
```

## Verify spreadsheet access

```powershell
gog sheets metadata 1MdTlen1rcq1ZplbTwfHzj-kHFBoQufgahzRAxZPqt7U --account andysafii9@gmail.com --json --results-only --no-input
```

## Apify token

Set token before running batch or master command:

```powershell
$env:APIFY_TOKEN = "your_apify_token"
```

## Optional keyring password

If the environment requires a keyring password for `gog`:

```powershell
$env:GOG_KEYRING_PASSWORD = "your_keyring_password"
```

## Recommended command

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run\run-hybrid-master.ps1
```

## Deprecated note

The old Windows browser-session scraping path is no longer the recommended default.
Use it only if you intentionally need legacy debugging/reference behavior.
