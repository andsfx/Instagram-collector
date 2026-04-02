# Deploy Checklist

Gunakan checklist ini sebelum `preview deploy` atau `production deploy` untuk `dashboard-react`.

## Pre-Deploy

- [ ] Jalankan `npm install`
- [ ] Jalankan `npm run build`
- [ ] Pastikan build selesai tanpa error TypeScript atau Vite
- [ ] Pastikan `dashboard-react/vercel.json` ada dan sesuai
- [ ] Pastikan `dashboard-react/api/dashboard-data.ts` ada dan ikut terdeploy

## Runtime Data

- [ ] Pastikan endpoint `/api/dashboard-data` mengembalikan `200`
- [ ] Pastikan payload valid JSON
- [ ] Pastikan field utama tersedia:
  - [ ] `generated_at`
  - [ ] `accounts`
  - [ ] `latest`
  - [ ] `history`
  - [ ] `rankings`
  - [ ] `post_insights`
- [ ] Pastikan sumber GitHub raw aktif:
  - [ ] `https://raw.githubusercontent.com/andsfx/Instagram-collector/main/dashboard/data.json`

## UI Smoke Test

- [ ] App load tanpa error fatal
- [ ] Sticky nav berfungsi
- [ ] Dark mode toggle berfungsi
- [ ] Freshness panel tampil benar
- [ ] Summary sections tampil benar
- [ ] Daily Metrics tampil benar
- [ ] Ranking dan Content sections tampil benar
- [ ] Head-to-Head lazy section termuat normal
- [ ] Heatmap lazy section termuat normal
- [ ] Quick Visual chart suite termuat normal
- [ ] Insights panel tampil benar

## Mobile QA

- [ ] Uji di sekitar `375px`
- [ ] Uji di sekitar `768px`
- [ ] Uji di sekitar `1024px`
- [ ] Tidak ada horizontal scroll global yang tidak perlu
- [ ] Scroll horizontal hanya terjadi di area chart/heatmap yang memang perlu
- [ ] Daily Metrics mobile list terbaca baik

## Error Recovery

- [ ] Error state utama muncul saat endpoint gagal
- [ ] Tombol `Coba ambil ulang data` bekerja
- [ ] Lazy section fallback tampil saat chunk sedang dimuat
- [ ] Retry section tidak merusak page lain

## Cache / Deployment

- [ ] Header `Cache-Control` untuk `/api/dashboard-data` sesuai ekspektasi
- [ ] Folder deploy root adalah `dashboard-react/`
- [ ] Preview deploy command siap: `npm run deploy:preview`
- [ ] Production deploy command siap: `npm run deploy:prod`

## Post-Deploy

- [ ] Buka URL preview / production
- [ ] Hard refresh halaman
- [ ] Cek request `/api/dashboard-data` di network tab
- [ ] Pastikan tidak ada error console kritis
- [ ] Pastikan data yang tampil adalah data terbaru
