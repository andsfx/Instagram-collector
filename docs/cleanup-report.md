# Legacy Dashboard Cleanup Report

**Date:** 2025-01-XX  
**Spec:** Dashboard Audit Improvements — Task 15.1  
**Requirements:** 1.1, 1.2, 1.3, 1.4, 1.5, 5.1

## Summary

The `dashboard/` folder previously contained the legacy vanilla-JS frontend that has been fully replaced by `dashboard-react/`. This cleanup removes all legacy frontend code, auth module with hardcoded credentials, duplicate deployment config, and unused assets — while retaining files still used by the data pipeline or Dashboard_Runtime_API.

---

## Files Deleted

| File | Reason |
|------|--------|
| `dashboard/js/auth.js` | Legacy auth module with hardcoded `admin/admin` credentials and weak client-side hashing. Security risk per Req 1.4, 5.1. Not served in production. |
| `dashboard/js/data-core.js` | Legacy frontend data module. Not used by pipeline or React dashboard (Req 1.3). |
| `dashboard/js/render-charts.js` | Legacy chart rendering. Not used by pipeline or React dashboard (Req 1.3). |
| `dashboard/js/render-comparison.js` | Legacy comparison view. Not used by pipeline or React dashboard (Req 1.3). |
| `dashboard/js/render-content.js` | Legacy content view. Not used by pipeline or React dashboard (Req 1.3). |
| `dashboard/js/render-metrics.js` | Legacy metrics view. Not used by pipeline or React dashboard (Req 1.3). |
| `dashboard/js/render-overview.js` | Legacy overview view. Not used by pipeline or React dashboard (Req 1.3). |
| `dashboard/js/runtime-core.js` | Legacy runtime engine. Not used by pipeline or React dashboard (Req 1.3). |
| `dashboard/js/runtime-data-loader.js` | Legacy data loader. Not used by pipeline or React dashboard (Req 1.3). |
| `dashboard/js/runtime-init.js` | Legacy initialization with AuthModule references. Not used by pipeline (Req 1.3). |
| `dashboard/js/settings.js` | Legacy settings UI. Not used by pipeline or React dashboard (Req 1.3). |
| `dashboard/js/ui-utils.js` | Legacy UI utilities. Not used by pipeline or React dashboard (Req 1.3). |
| `dashboard/index.html` | Legacy frontend entry point. Replaced by `dashboard-react/index.html` (Req 1.3). |
| `dashboard/vercel.json` | Duplicate Vercel deployment config. Production config is `dashboard-react/vercel.json` (Req 1.5). |
| `dashboard/fonts/plus-jakarta-sans-latin-400.woff2` | Font only referenced by deleted `index.html`. React dashboard uses Tailwind/system fonts. |
| `dashboard/fonts/plus-jakarta-sans-latin-600.woff2` | Font only referenced by deleted `index.html`. React dashboard uses Tailwind/system fonts. |
| `dashboard/fonts/plus-jakarta-sans-latin-700.woff2` | Font only referenced by deleted `index.html`. React dashboard uses Tailwind/system fonts. |
| `dashboard/fonts/plus-jakarta-sans-latin-800.woff2` | Font only referenced by deleted `index.html`. React dashboard uses Tailwind/system fonts. |

---

## Files Retained

| File | Reason |
|------|--------|
| `dashboard/data.json` | Used by Dashboard_Runtime_API as data source/fallback. Referenced in `dashboard-react/api/dashboard-data.ts`. Pipeline output target from `build-dashboard-data.js` (Req 1.6). |
| `dashboard/assets/metropolitan-mall-logo.png` | Referenced by `scripts/export/build-dashboard-data.js` as `logoPath` value written into `data.json`. Retained to avoid breaking pipeline output data integrity. |

---

## Notes

- The `dashboard/js/` directory is now empty and can be removed as a directory.
- The `dashboard/fonts/` directory is now empty and can be removed as a directory.
- `dashboard/` folder is no longer a frontend — it serves only as a data snapshot location.
- Per Req 1.6, `dashboard/data.json` may be relocated to `data/dashboard-snapshot.json` in a future task (14.1).
- Per Req 1.7, CI should warn on PRs modifying `dashboard/js/` (handled in Task 16.1).
- The React dashboard at `dashboard-react/` is the sole production frontend (Req 1.1).
