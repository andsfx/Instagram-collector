# Audit Report — Instagram Tracker Dashboard

**Tanggal audit:** 2025-01  
**Scope:** Pipeline data, kalkulator metrik, React Dashboard, Legacy Dashboard, serverless API, schema data, konfigurasi deploy Vercel  
**Framing:** Cleanup artefak legacy dan prevent regresi (bukan konsolidasi dua frontend paralel)

---

## Ringkasan Temuan

| # | Domain | Temuan | Severity | Requirement | Status |
|---|--------|--------|----------|-------------|--------|
| 1 | Cleanup | Legacy folder `dashboard/` masih ada di repo meskipun tidak di-serve ke production | medium | Requirement 1 | done |
| 2 | Security | `auth.js` legacy dengan kredensial default `admin/admin` dan hashing JS custom | high | Requirement 5 | done |
| 3 | Data Pipeline | Runtime data endpoint mem-fetch JSON tanpa validasi skema di sisi server | high | Requirement 2, 5 | done |
| 4 | Observability | Kesegaran data tanpa mekanisme alert staleness dan tanpa health check | medium | Requirement 4 | done |
| 5 | Data Pipeline | Schema mengandung field opsional dengan sinonim (`carousel`/`carousels`, `image`/`images`) | medium | Requirement 2 | done |
| 6 | Data Pipeline | Kalkulasi ER tidak terlindungi terhadap edge case `followers = 0`, `posts_count = 0`, tipe post tidak dikenal | high | Requirement 3 | done |
| 7 | Observability | Tidak ada endpoint health, metric log terstruktur, atau surfaced error telemetry di frontend | medium | Requirement 6 | done |
| 8 | Accessibility | Accessibility tertutup sebagian di React (skip link, sr-only) tetapi belum divalidasi secara sistematis | low | Requirement 8 | done |

---

## Detail Temuan per Domain

### 1. Cleanup Artefak Legacy

**Severity:** medium  
**Requirement:** Requirement 1

**Temuan:**
- Folder `dashboard/` berisi artefak frontend legacy (HTML, vanilla JS modules, fonts, `vercel.json`) yang tidak lagi di-serve ke production
- Berpotensi menyesatkan developer baru dan memperlebar permukaan audit
- File `dashboard/vercel.json` bisa menyebabkan deployment tidak sengaja

**Resolusi:**
- Semua file frontend legacy dihapus (lihat `docs/cleanup-report.md`)
- `dashboard/data.json` dipertahankan sebagai sumber data untuk Dashboard_Runtime_API
- `dashboard/vercel.json` dihapus
- CI warning ditambahkan untuk PR yang memodifikasi `dashboard/js/`

---

### 2. Security — Auth Module Legacy

**Severity:** high  
**Requirement:** Requirement 5

**Temuan:**
- `dashboard/js/auth.js` mengandalkan hashing JavaScript custom dan storage di `localStorage`/`sessionStorage`
- Kredensial default `admin/admin` hardcoded
- Oleh developer sendiri ditandai sebagai "bukan security boundary yang kuat"
- Risiko eksploitasi aktif sudah hilang (tidak di-serve), tetapi kode masih ada di repo

**Resolusi:**
- `dashboard/js/auth.js` dihapus beserta seluruh referensi kredensial
- Rekomendasi auth server-side (Supabase Auth / Vercel Password Protection) didokumentasikan untuk kebutuhan masa depan

---

### 3. Data Pipeline — Validasi Server-Side

**Severity:** high  
**Requirement:** Requirement 2, Requirement 5

**Temuan:**
- Dashboard_Runtime_API mem-fetch JSON dari `raw.githubusercontent.com` tanpa validasi skema di sisi server
- Validasi skema (Zod) hanya dijalankan di client
- Payload yang tidak valid bisa lolos ke frontend

**Resolusi:**
- Server-side schema validation ditambahkan di `/api/dashboard-data`
- Payload yang gagal validasi dikembalikan sebagai HTTP 502
- Payload yang bukan JSON valid dikembalikan sebagai HTTP 422
- Structured logging ditambahkan untuk setiap request

---

### 4. Observability — Freshness Monitoring

**Severity:** medium  
**Requirement:** Requirement 4

**Temuan:**
- Kesegaran data bergantung pada field `generated_at` / `latest.date` tanpa mekanisme alert staleness
- Tidak ada health check endpoint
- Operator tidak tahu kapan data sudah basi

**Resolusi:**
- `FreshnessMonitor` component ditambahkan dengan klasifikasi `fresh`/`stale`/`critical`
- Endpoint `/api/health` dibuat dengan status, age_seconds, dan accounts_count
- Retry button tersedia saat status `critical`

---

### 5. Data Pipeline — Schema Sinonim

**Severity:** medium  
**Requirement:** Requirement 2

**Temuan:**
- Schema dashboard mengandung banyak field opsional dengan sinonim (`carousel`/`carousels`, `image`/`images`)
- Diakomodasi di adapter tetapi tidak dinormalisasi di builder
- Menyebabkan drift antara produsen dan konsumen data

**Resolusi:**
- Schema v2 strict mode diterapkan: hanya `{reels, carousels, images, videos, unknown}` yang diterima
- Sinonim ditolak di level parser
- Payload_Serializer menormalisasi output ke set tunggal

---

### 6. Data Pipeline — Kalkulasi Metrik Edge Cases

**Severity:** high  
**Requirement:** Requirement 3

**Temuan:**
- Engagement Rate di `calc-instagram-metrics.js` tidak terlindungi terhadap:
  - `followers = 0` (division by zero → NaN/Infinity)
  - `posts_count = 0` (empty array → NaN)
  - Tipe post tidak dikenal (silently dropped)

**Resolusi:**
- Defensive checks ditambahkan: `followers` invalid → `engagement_rate = null`
- Posts kosong → semua avg/ER = `null`
- Tipe tidak dikenal → warning ke stderr, dihitung sebagai `unknown`
- Invariant dijamin: tidak pernah NaN/Infinity di output
- Rounding half-up ke 2 desimal

---

### 7. Observability — Logging dan Error Telemetry

**Severity:** medium  
**Requirement:** Requirement 6

**Temuan:**
- Tidak ada endpoint health
- Tidak ada metric log terstruktur
- Tidak ada surfaced error telemetry di frontend
- Sulit mendiagnosis kegagalan pipeline dan dashboard

**Resolusi:**
- Structured JSON logging ditambahkan di Dashboard_Runtime_API
- Health endpoint `/api/health` dibuat
- ErrorBoundary dan ErrorState konsisten di React
- Console logging dengan tag `dashboard.error`
- Refresh state (`live`, `cached`, `loading`) ditampilkan konsisten

---

### 8. Accessibility

**Severity:** low  
**Requirement:** Requirement 8

**Temuan:**
- Skip link dan sr-only sudah ada tetapi belum divalidasi secara sistematis
- Belum ada focus trap di modal/overlay
- ARIA labels belum lengkap pada icon-only buttons
- Kontras warna belum diverifikasi

**Resolusi:**
- Focus trap ditambahkan menggunakan `focus-trap-react`
- ARIA labels ditambahkan pada semua icon-only buttons
- Focus indicators dengan kontras 3:1 diterapkan
- Keyboard navigation diverifikasi (Tab, Shift+Tab, Enter, Space, Arrow keys)
- Decorative images diberi `aria-hidden="true"` atau `alt=""`

---

## Severity Legend

| Level | Kriteria | Contoh |
|-------|----------|--------|
| **high** | Security risk atau data integrity issue | Kredensial hardcoded, validasi server-side hilang, kalkulasi menghasilkan NaN |
| **medium** | Observability gap atau performance concern | Tidak ada health check, tidak ada staleness alert, schema drift |
| **low** | UX improvement atau documentation gap | Accessibility belum lengkap, dokumentasi kurang |

---

## Catatan

- Semua requirement telah diimplementasikan (status `done`)
- Untuk menjalankan audit ulang, lihat `docs/daily-operations.md` bagian "Audit & Quality Checks"
- Detail file yang dihapus/dipertahankan tersedia di `docs/cleanup-report.md`
