# Instagram Collector

Pipeline untuk:
- mengambil profile stats Instagram (`followers`, `following`, `posts_count`)
- mengambil data post terbaru
- menghitung metrics dari JSON post-level
- menggabungkan hasil profile + metrics
- mengirim hasil akhir ke Google Sheets

## Workflow

Pipeline utama repo ini:

1. **Collect profile stats** menggunakan Scrapling
2. **Collect post data** menggunakan Playwright persistent profile
3. **Calculate metrics** dari file JSON post-level
4. **Merge dataset** menjadi format final per akun
5. **Validate output**
6. **Sync ke Google Sheets**

## Current Structure

```text
config/
  accounts.json
  pipeline.json
  sheets.json

scripts/
  collect/
  transform/
  sync/
  run/

data/
  raw/
  processed/
```

## Requirements

### Windows runtime
- Windows PowerShell
- Node.js + npm
- Python 3
- browser/profile Instagram yang sudah login

### Node package
```powershell
npm install
```

### Python package
Untuk jalur profile stats:

```powershell
pip install scrapling
```

Jika Scrapling belum terpasang, pipeline masih bisa jalan sebagian, tapi profile stats akan gagal dan memberi warning.

## Important Files

### Config
- `config/accounts.json` → daftar akun dan fallback followers
- `config/sheets.json` → spreadsheet target dan tab target
- `config/pipeline.json` → opsi pipeline

### Collect
- `scripts/collect/collect-profile-stats.py`
- `scripts/collect/collect-instagram-posts-full.js`

### Transform
- `calc-instagram-metrics.js`
- `scripts/transform/merge-instagram-dataset.js`
- `scripts/transform/validate-output.js`

### Sync
- `scripts/sync/update-google-sheet.js`

### Run
- `scripts/run/run-instagram-account.ps1`
- `scripts/run/run-all-instagram-accounts.ps1`
- `scripts/run/run-full-pipeline.ps1`

## Output Files

### Raw profile stats
```text
data/raw/profiles/<username>.json
```

### Raw posts
```text
data/raw/posts/<username>-latest12-full.json
```

### Metrics
```text
data/processed/metrics/<username>-metrics.json
```

### Merged final dataset
```text
data/processed/merged/<username>.json
```

## How To Run

### 1. Single account full pipeline

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run\run-instagram-account.ps1 -Account grandmetropolitan
```

Flow yang dijalankan:
1. collect profile stats
2. collect posts
3. calculate metrics
4. merge dataset
5. validate output
6. update Google Sheet

### 2. Single account without sheet sync

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run\run-instagram-account.ps1 -Account grandmetropolitan -SkipSheetSync
```

### 3. Single account without recollecting data
Dipakai kalau raw data sudah ada dan hanya mau proses ulang:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run\run-instagram-account.ps1 -Account grandmetropolitan -SkipCollect -SkipSheetSync
```

### 4. All accounts

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run\run-all-instagram-accounts.ps1
```

### 4b. Drive batch sync (source baru)

```powershell
node .\scripts\sync\sync-drive-batch.js
```

Script ini akan:
- scan Google Drive source baru (`processed/merged` + `processed/metrics`)
- download pasangan file yang lengkap
- validate JSON
- upsert ke `Engagement` dan `Content Breakdown`

### 5. Legacy commands
Wrapper lama tetap ada:

```powershell
powershell -ExecutionPolicy Bypass -File .\run-instagram-account.ps1 -Account grandmetropolitan -Followers 92455
powershell -ExecutionPolicy Bypass -File .\run-all-instagram-accounts.ps1
```

## Configuration

### Accounts
Edit `config/accounts.json`:
- `username`
- `followers`
- `enabled`

### Sheets
Edit `config/sheets.json`:
- `spreadsheetName`
- `spreadsheetId`
- target tab
- mode update

## Google Sheets Sync

Sync dilakukan oleh:

```text
scripts/sync/update-google-sheet.js
```

Saat ini target utama:
- Spreadsheet: **Instagram Follower Database**
- Tab: **Engagement / Content Breakdown**

Default account untuk `gog` saat ini:
- `andysafii9@gmail.com`

Kalau account Google berbeda, set environment variable sebelum run:

```powershell
$env:GOG_ACCOUNT = "your-email@example.com"
```

## Additional Docs

- `docs/workflow.md`
- `docs/spreadsheet-mapping.md`
- `docs/setup-auth.md`
- `docs/daily-operations.md`

## Troubleshooting

### 1. Scrapling import failed
Install Scrapling:

```powershell
pip install scrapling
```

### 2. Redirected to login / challenge
Artinya Instagram menolak akses public/plain fetch atau session browser belum valid.

Cek:
- browser profile masih login
- tidak kena challenge/checkpoint
- collector Playwright memakai profile yang benar

### 3. Metrics file not found
Pastikan raw post JSON sudah berhasil dibuat di:

```text
data/raw/posts/
```

### 4. Merged file missing fields
Jalankan validasi:

```powershell
node .\scripts\transform\validate-output.js grandmetropolitan
```

### 5. Google Sheets sync gagal
Cek:
- `gog` sudah login
- account Google benar
- spreadsheet ID benar
- permission spreadsheet ada

## Recommended Operating Pattern

Untuk run harian paling aman:

1. test 1 akun dulu
2. pastikan raw + metrics + merged file valid
3. cek hasil sheet update
4. baru jalankan semua akun

## Notes

- Repo ini masih menjaga backward compatibility untuk beberapa file root lama
- File sensitif dan cache di-ignore lewat `.gitignore`
- Output data di `data/raw/` dan `data/processed/` saat ini di-ignore dari Git
