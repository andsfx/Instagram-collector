# Apify Batch Runner

Dokumen ini menjelaskan runner batch baru untuk mengambil data post-level Instagram via Apify untuk semua akun yang aktif di `config/accounts.json`.

## Script

```text
scripts/apify/run-apify-batch.js
```

## What it does

Untuk setiap akun aktif:
1. jalankan actor Apify `instagram-scraper`
2. ambil dataset items
3. simpan raw dataset ke `incoming/apify/datasets/<username>.json`
4. transform ke format pipeline lokal melalui:
   - `scripts/apify/transform-apify-posts.js`
5. hasilkan file:
   - `data/raw/posts/<username>-latest12-full.json`
   - `data/processed/metrics/<username>-metrics.json`
   - `data/processed/merged/<username>.json`

## Required environment

### APIFY_TOKEN
Set token Apify sebelum run:

```powershell
$env:APIFY_TOKEN = "your_apify_token"
```

### Optional actor override
Kalau mau ganti actor:

```powershell
$env:APIFY_ACTOR_ID = "apify~instagram-scraper"
```

## Run command

```powershell
node .\scripts\apify\run-apify-batch.js
```

## Output summary

Script akan mengembalikan summary JSON berisi:
- jumlah akun processed
- jumlah akun error
- run ID Apify per akun
- dataset ID per akun
- ringkasan transform metrics

## Recommended workflow

1. set `APIFY_TOKEN`
2. jalankan batch Apify
3. cek output `metrics` + `merged`
4. jalankan sync ke spreadsheet

## Notes

- actor default: `apify~instagram-scraper`
- hasil follower masih memakai fallback dari `config/accounts.json`
- pendekatan ini fokus pada post-level metrics, bukan profile stats detail
