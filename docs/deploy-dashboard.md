# Deploy Dashboard from `Instagram-collector`

Dashboard sekarang berada di:

```text
dashboard/
```

## Recommended Vercel setup

Saat membuat / mengubah project Vercel, gunakan repo:
- `andsfx/Instagram-collector`

Lalu set:

### Root Directory
```text
dashboard
```

### Framework Preset
```text
Other
```

### Build Command
Kosongkan / none.

### Output Directory
Kosongkan / none.

Karena dashboard ini adalah aplikasi statis.

## Files used by deployment

```text
dashboard/
  index.html
  data.json
  vercel.json
```

## Important note

`dashboard/data.json` harus dibangun ulang dari workflow hybrid sebelum deploy jika ingin data terbaru tampil.

Generator:

```powershell
node .\scripts\export\build-dashboard-data.js
```

## Suggested deployment flow

1. jalankan hybrid master workflow
2. build `dashboard/data.json`
3. commit/push perubahan dashboard
4. biarkan Vercel redeploy dari repo

## Hybrid command reminder

```powershell
$env:APIFY_TOKEN = "your_apify_token"
powershell -ExecutionPolicy Bypass -File .\scripts\run\run-hybrid-master.ps1
node .\scripts\export\build-dashboard-data.js
```

## Why Root Directory matters

Jangan deploy root repo secara langsung tanpa set `dashboard/` sebagai Root Directory.

Kalau root repo dideploy apa adanya, Vercel bisa:
- melihat file yang bukan bagian frontend statis
- membingungkan routing
- membuat deploy tidak jelas source file utamanya

`dashboard/` harus menjadi app statis yang berdiri sendiri di dalam repo.
