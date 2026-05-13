# Dashboard Migration — React Migration Complete

**Status:** ✅ Migrasi selesai  
**Tanggal selesai:** 2025-01  
**Production frontend:** `dashboard-react/` (Vite + React 18 + Tailwind CSS)

---

## Ringkasan

Migrasi dari Legacy Dashboard (vanilla HTML/JS di `dashboard/`) ke React Dashboard (`dashboard-react/`) telah selesai. React Dashboard adalah satu-satunya frontend production yang di-deploy ke Vercel.

Folder `dashboard/` tidak lagi berisi frontend code — hanya menyisakan `dashboard/data.json` sebagai sumber data snapshot untuk Dashboard_Runtime_API.

---

## Arsitektur Saat Ini

```
dashboard-react/          ← Production frontend (React + TypeScript + Tailwind)
├── src/                  ← Source code
├── api/                  ← Serverless API endpoints (Vercel Functions)
├── vercel.json           ← Satu-satunya Vercel config production
└── package.json

dashboard/                ← Bukan frontend lagi
├── data.json             ← Data snapshot (dipakai oleh API sebagai fallback)
└── assets/               ← Logo (dipakai oleh build pipeline)
```

---

## Fitur Legacy Dashboard yang TIDAK Di-Port

| Fitur | Alasan Tidak Di-Port |
|-------|---------------------|
| **Auth Module** (`dashboard/js/auth.js`) | Auth client-side berbasis `localStorage` dengan kredensial hardcoded `admin/admin` bukan security boundary yang kuat. Tidak ada kebutuhan auth di dashboard saat ini. Jika diperlukan di masa depan, akan menggunakan auth server-side (Supabase Auth / Vercel Password Protection). |
| **Settings Panel** (`dashboard/js/settings.js`) | Panel settings legacy mengatur preferensi UI yang tidak relevan di React Dashboard. React Dashboard menggunakan konfigurasi berbasis environment variable dan Tailwind theme. |
| **Compatibility Bridge** (v2 → legacy UI shape) | Bridge yang mentransformasi data v2 ke format legacy UI tidak diperlukan karena React Dashboard mengonsumsi schema v2 secara native melalui Zod parser. |
| **Custom Font Loading** (`dashboard/fonts/`) | Legacy dashboard menggunakan Plus Jakarta Sans via self-hosted woff2 files. React Dashboard menggunakan Tailwind default font stack (system fonts) untuk performa lebih baik. |
| **Inline Chart Rendering** (`dashboard/js/render-charts.js`) | Digantikan oleh Recharts library di React Dashboard dengan code splitting, virtualization, dan chart theme konsisten. |
| **Manual Data Loader** (`dashboard/js/runtime-data-loader.js`) | Digantikan oleh `useDashboardData` hook dengan abort controller, retry logic, caching, dan freshness monitoring. |
| **Multi-view Render Modules** (`render-overview.js`, `render-metrics.js`, `render-comparison.js`, `render-content.js`) | Digantikan oleh React components dengan code splitting (`React.lazy`), error boundaries per section, dan consistent formatting utilities. |

---

## Fitur Baru di React Dashboard (Tidak Ada di Legacy)

| Fitur | Deskripsi |
|-------|-----------|
| Freshness Monitor | Klasifikasi `fresh`/`stale`/`critical` dengan retry button |
| Health Endpoint | `/api/health` untuk monitoring operasional |
| Server-side Validation | Schema validation di API sebelum response ke client |
| Security Headers | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, CSP |
| Structured Logging | JSON logs di API untuk observability |
| Property-Based Tests | fast-check tests untuk metric calculator dan parser |
| Accessibility | Focus trap, ARIA labels, keyboard navigation, contrast compliance |
| Code Splitting | `React.lazy` untuk heavy components (charts, heatmap, head-to-head) |
| Error Boundaries | Section-level dan app-level error recovery |
| Abort/Retry Logic | Cancel inflight requests, single active request constraint |

---

## File Legacy yang Dihapus

Lihat `docs/cleanup-report.md` untuk daftar lengkap file yang dihapus beserta alasan.

---

## Catatan untuk Developer Baru

1. **Jangan modifikasi `dashboard/js/`** — folder ini deprecated dan kosong. CI akan menampilkan warning jika ada PR yang menyentuh folder ini.
2. **Semua perubahan frontend** dilakukan di `dashboard-react/`.
3. **`dashboard/data.json`** adalah output pipeline, bukan file frontend. Dipakai oleh `/api/dashboard-data` sebagai fallback.
4. **Deployment** hanya melalui `dashboard-react/vercel.json`. Tidak ada deployment config lain.
