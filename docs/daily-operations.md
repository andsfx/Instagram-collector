# Daily Operations Checklist

Dokumen ini adalah checklist operasional harian untuk workflow:

**Windows → Google Drive → Workspace → Google Sheets**

Target sheet utama:
- `Engagement`
- `Content Breakdown`

## Daily Goal

Satu hari dianggap selesai jika:
- akun yang dijalankan menghasilkan file `merged` dan `metrics`
- file masuk ke Google Drive source baru
- row berhasil masuk ke `Engagement`
- row berhasil masuk ke `Content Breakdown`
- tidak ada row rusak atau nilai aneh yang lolos

---

## A. Windows — Generate Data

Buka repo lokal:

```powershell
cd $HOME\instagram-collector
```

### 1. Check repo status

```powershell
git status
```

Checklist:
- [ ] repo bisa dibuka normal
- [ ] tidak ada masalah git yang mengganggu run

### 2. Jalankan satu akun dulu

Contoh:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run\run-instagram-account.ps1 -Account metmalbekasi -SkipSheetSync
```

Checklist:
- [ ] profile stats step jalan
- [ ] post collection step jalan
- [ ] metrics step jalan
- [ ] merge step jalan
- [ ] validate step jalan

### 3. Cek file output

Minimal cek:

```powershell
Get-Content .\data\processed\merged\metmalbekasi.json
Get-Content .\data\processed\metrics\metmalbekasi-metrics.json
```

Checklist:
- [ ] file `merged` ada
- [ ] file `metrics` ada
- [ ] `date` benar
- [ ] `username` benar
- [ ] `posts_analyzed` ada
- [ ] `avg_likes` ada
- [ ] `avg_comments` ada
- [ ] `engagement_rate` ada

### 4. Pastikan Google Drive sync selesai

Checklist:
- [ ] file `processed/merged/<username>.json` muncul di source baru
- [ ] file `processed/metrics/<username>-metrics.json` muncul di source baru

---

## B. Source of Truth — Google Drive

Batch source baru yang dipakai:

### Processed
- `processed` → `1IwxLYhOwmuNQShlddq8ITK7uo3y7ZQ4g`

### Subfolders
- `merged` → `1M3t1nVS3clq0vOcFOUsDa0ndcwPeEOOZ`
- `metrics` → `1ZcxFkyxjvhOkyewhk2xKzQWwGJmJCx0i`

Rule penting:
- hanya file di **source baru** ini yang dianggap valid untuk batch
- subtree lama di Drive harus diabaikan

Checklist:
- [ ] file masuk ke source baru, bukan folder lama
- [ ] nama file sesuai pola

### Naming rules

Merged:
```text
<username>.json
```

Metrics:
```text
<username>-metrics.json
```

---

## C. Workspace / Sync to Google Sheets

## 5. Validasi pasangan file

Akun hanya diproses jika ada dua file:
- `processed/merged/<username>.json`
- `processed/metrics/<username>-metrics.json`

Checklist:
- [ ] merged ada
- [ ] metrics ada
- [ ] nama akun match

## 6. Upsert ke sheet

Target:
- [ ] `Engagement`
- [ ] `Content Breakdown`

### Single account sync

```powershell
node .\scripts\sync\update-google-sheet.js metmalbekasi
```

### Drive batch sync

```powershell
node .\scripts\sync\sync-drive-batch.js
```

Checklist:
- [ ] `Engagement` ter-update
- [ ] `Content Breakdown` ter-update
- [ ] tidak ada write ke `Follower History`

## 7. Verifikasi hasil di spreadsheet

Checklist:
- [ ] tanggal benar
- [ ] akun benar
- [ ] angka engagement masuk akal
- [ ] content breakdown masuk akal
- [ ] tidak ada nilai `None`
- [ ] tidak ada row jadi satu sel panjang

---

## Red Flags

Kalau salah satu ini muncul, jangan lanjut batch penuh dulu:

- [ ] `Cannot find module 'playwright'`
- [ ] `gog` tidak ditemukan di PATH
- [ ] `metrics` file tidak jadi
- [ ] `merged` file tidak jadi
- [ ] file sync ke folder Drive yang salah
- [ ] merged ada tapi metrics tidak ada
- [ ] angka engagement terlihat aneh sekali
- [ ] sheet menerima seluruh row sebagai satu cell

---

## Recovery Rules

### Kalau `playwright` error
Jalankan:

```powershell
npm install
npx playwright install
```

### Kalau `gog` error di Windows
Cek:

```powershell
gog version
where.exe gog
```

### Kalau file tidak muncul di source baru
Checklist:
- [ ] pastikan output lokal ada
- [ ] pastikan Google Drive sync selesai
- [ ] pastikan file masuk ke subtree source baru, bukan subtree lama

---

## Recommended Daily Pattern

## Minimal pattern

1. run satu akun di Windows
2. cek `merged` + `metrics`
3. tunggu sync ke Drive
4. sync ke sheet
5. cek row terbaru

## Full pattern

1. run semua akun di Windows
2. cek output akun penting
3. pastikan semua file masuk ke source baru
4. jalankan batch sync
5. review `Engagement`
6. review `Content Breakdown`

---

## Success Criteria

Checklist harian dianggap sukses jika:
- [ ] file output valid
- [ ] source baru Drive terisi benar
- [ ] row baru masuk ke `Engagement`
- [ ] row baru masuk ke `Content Breakdown`
- [ ] tidak ada data rusak yang tertulis
