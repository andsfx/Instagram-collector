# Apify Transition Notes

Dokumen ini menjelaskan arah baru pipeline: mengganti koleksi post-level dari scraping browser lokal ke Apify.

## Why switch to Apify

Masalah pada pendekatan scraping lokal:
- redirect ke login Instagram
- session browser tidak stabil
- hasil raw post JSON sering kosong
- operasional sulit diulang secara konsisten

Apify dipilih karena bisa memberi data post-level publik dengan struktur yang lebih stabil.

## Planned Flow

1. Ambil latest posts dari actor Apify (`apify/instagram-scraper`)
2. Simpan raw dataset JSON
3. Transform output Apify ke format pipeline lokal
4. Hasilkan:
   - `data/raw/posts/<username>-latest12-full.json`
   - `data/processed/metrics/<username>-metrics.json`
   - `data/processed/merged/<username>.json`
5. Sync ke:
   - `Engagement`
   - `Content Breakdown`

## Current adapter

Script adapter:

```text
scripts/apify/transform-apify-posts.js
```

## Minimal required fields from Apify

Per post, kita butuh minimal:
- `type`
- `likesCount`
- `commentsCount`
- `url`
- `timestamp`
- `caption`
- `shortCode`

## Type mapping

Apify type -> pipeline type:
- `Sidecar` -> `carousel`
- `Image` -> `image`
- `Video` -> `video`
- `Reel` -> `reels`

## Example usage

```powershell
node .\scripts\apify\transform-apify-posts.js metmalbekasi .\apify-output\metmalbekasi.json 93505
```

## Recommendation

Mulai dari test 1 akun, validasi output metrics, lalu scale ke multi-account workflow.
