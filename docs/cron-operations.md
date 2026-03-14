# Cron Operations SOP

SOP operasional untuk automation dashboard Instagram via OpenClaw cron.

## Cron jobs aktif

### 1) Job utama — daily dashboard automation

- **Job ID:** `61d312e8-c04d-4e40-9cef-76f03e5bf05c`
- **Name:** `Instagram daily dashboard automation`
- **Schedule:** `07:00 WIB` setiap hari
- **Purpose:**
  1. jalankan hybrid workflow
  2. build `dashboard/data.json`
  3. commit + push jika ada perubahan
  4. biarkan Vercel auto-deploy
  5. kirim ringkasan ke chat Telegram utama

### 2) Job verifier — fallback alert + dashboard verification

- **Job ID:** `e5b7fed6-8393-4d38-9409-5c5a992802e5`
- **Name:** `Instagram dashboard verifier and fallback alert`
- **Schedule:** `07:20 WIB` setiap hari
- **Purpose:**
  1. cek status run job utama
  2. cek delivery job utama
  3. cek freshness dan schema `dashboard/data.json`
  4. kirim alert hanya jika ada masalah

---

## Jadwal final

- **07:00 WIB** → job utama
- **07:20 WIB** → verifier

---

## Check status

### Lihat semua cron

```bash
openclaw cron list --all --json
```

### Lihat status scheduler

```bash
openclaw cron status --json
```

---

## Pause / disable

### Pause job utama

```bash
openclaw cron disable 61d312e8-c04d-4e40-9cef-76f03e5bf05c
```

### Pause verifier

```bash
openclaw cron disable e5b7fed6-8393-4d38-9409-5c5a992802e5
```

### Pause dua-duanya

```bash
openclaw cron disable 61d312e8-c04d-4e40-9cef-76f03e5bf05c
openclaw cron disable e5b7fed6-8393-4d38-9409-5c5a992802e5
```

### Kapan dipakai

- saat maintenance repo
- saat ubah workflow atau script utama
- saat token/auth bermasalah
- saat tidak ingin ada auto-push sementara

---

## Resume / enable

### Enable job utama

```bash
openclaw cron enable 61d312e8-c04d-4e40-9cef-76f03e5bf05c
```

### Enable verifier

```bash
openclaw cron enable e5b7fed6-8393-4d38-9409-5c5a992802e5
```

### Enable dua-duanya

```bash
openclaw cron enable 61d312e8-c04d-4e40-9cef-76f03e5bf05c
openclaw cron enable e5b7fed6-8393-4d38-9409-5c5a992802e5
```

---

## Manual run / test

### Jalankan job utama sekarang

```bash
openclaw cron run 61d312e8-c04d-4e40-9cef-76f03e5bf05c --expect-final
```

### Jalankan verifier sekarang

```bash
openclaw cron run e5b7fed6-8393-4d38-9409-5c5a992802e5 --expect-final
```

---

## Lihat riwayat run

### Riwayat job utama

```bash
openclaw cron runs --id 61d312e8-c04d-4e40-9cef-76f03e5bf05c --limit 10
```

### Riwayat verifier

```bash
openclaw cron runs --id e5b7fed6-8393-4d38-9409-5c5a992802e5 --limit 10
```

---

## Expected behavior

### Job utama sukses jika

- hybrid workflow selesai
- `dashboard/data.json` berhasil dibuild
- commit dibuat hanya jika ada perubahan
- push ke `main` berhasil
- ringkasan terkirim ke chat Telegram

### Verifier sukses jika

- run terakhir job utama hari itu status `ok`
- delivery job utama berhasil
- `https://instagram-tracker-dashboard.vercel.app/data.json` valid
- `version = 2`
- `latest.date` = tanggal hari ini (WIB)
- `generated_at_wib` ada
- 5 akun wajib ada:
  - `metmalbekasi`
  - `grandmetropolitan`
  - `metmalcileungsi`
  - `summareconmal.bekasi`
  - `pakuwonmallbekasi`

Jika semua sehat, verifier harus diam (`NO_REPLY`).
Jika ada masalah, verifier kirim alert ke chat utama.

---

## Troubleshooting cepat

### Jika job utama gagal

Cek kemungkinan berikut:

- `APIFY_TOKEN` tidak tersedia
- `gog` auth / Google Sheets auth bermasalah
- build `dashboard/data.json` gagal
- `git commit` / `git push` gagal

Langkah:

1. cek riwayat job utama
2. kalau perlu run manual
3. perbaiki blocker
4. run manual lagi sampai sukses

```bash
openclaw cron run 61d312e8-c04d-4e40-9cef-76f03e5bf05c --expect-final
```

### Jika verifier kirim alert

Berarti salah satu dari ini:

- job utama tidak jalan
- delivery job utama gagal
- `data.json` stale
- schema invalid
- ada akun wajib yang hilang

Langkah:

1. cek status job utama
2. cek live `data.json`
3. jika perlu, jalankan job utama manual

```text
https://instagram-tracker-dashboard.vercel.app/data.json
```

---

## Local secret dependency

Automation harian saat ini memakai file lokal yang tidak di-commit:

- `.env.daily-dashboard`

Dipakai untuk memuat:

- `APIFY_TOKEN`
- `GOG_KEYRING_PASSWORD`
- `GOG_ACCOUNT`

Pastikan file ini tetap ada di environment tempat cron berjalan.
