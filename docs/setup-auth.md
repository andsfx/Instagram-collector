# Setup Dependency and Auth

Dokumen ini menjelaskan dependency minimum dan auth yang dibutuhkan agar pipeline bisa jalan di Windows.

## 1. Runtime Requirements

### Windows
- PowerShell
- Node.js + npm
- Python 3
- browser/profile Instagram yang sudah login

## 2. Install Node dependency

Di folder repo:

```powershell
npm install
```

Dependency utama saat ini:
- `playwright`

## 3. Install Python dependency

Untuk profile stats collector:

```powershell
pip install scrapling
```

Kalau ingin pakai virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install scrapling
```

## 4. Instagram browser session

Collector post memakai persistent browser profile. Pastikan session Instagram masih login.

Profile yang dipakai collector sekarang mengarah ke profile lokal di home directory Windows.

Kalau session mati atau kena challenge, collector bisa gagal walaupun script benar.

## 5. Google Sheets auth

Pipeline sync memakai `gog`.

Default account yang dipakai updater saat ini:

```text
andysafii9@gmail.com
```

## 6. Verify gog is installed

Cek versi:

```powershell
gog version
```

Kalau command tidak dikenali, pastikan binary `gog` sudah ada di PATH.

## 7. Verify Google account access

Tes baca metadata spreadsheet:

```powershell
gog sheets metadata 1MdTlen1rcq1ZplbTwfHzj-kHFBoQufgahzRAxZPqt7U --account andysafii9@gmail.com --json --results-only --no-input
```

Kalau ini berhasil, auth dasar untuk Google Sheets biasanya sudah benar.

## 8. Override account if needed

Kalau mau pakai akun Google lain saat run:

```powershell
$env:GOG_ACCOUNT = "your-email@example.com"
```

Lalu jalankan pipeline seperti biasa.

## 9. Recommended preflight checks

Sebelum full run:

### Check Scrapling
```powershell
python -c "import scrapling; print('scrapling ok')"
```

### Check Playwright
```powershell
node -e "require('playwright'); console.log('playwright ok')"
```

### Check gog
```powershell
gog version
```

### Check sheet access
```powershell
gog sheets metadata 1MdTlen1rcq1ZplbTwfHzj-kHFBoQufgahzRAxZPqt7U --account andysafii9@gmail.com --json --results-only --no-input
```

## 10. First safe test

Test paling aman:
- jalankan satu akun
- skip sheet sync dulu
- cek output JSON
- baru ulang dengan sync aktif

Contoh:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run\run-instagram-account.ps1 -Account grandmetropolitan -SkipSheetSync
```

Kalau hasil sudah valid, lanjut:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run\run-instagram-account.ps1 -Account grandmetropolitan
```
