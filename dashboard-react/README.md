# Dashboard React

React migration of the legacy Instagram competitor dashboard.

## Current Scope

This app already covers the core monitoring workflow:

- freshness and source status
- executive summary and today summary
- daily metrics
- ranking and growth
- content breakdown and post snapshot
- account overview
- head-to-head comparison
- posting heatmap
- insights and recommendations
- chart suite for followers, engagement, share, radar, and projection

Auth, settings/admin, and export are intentionally still out of scope.

## Local Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

Deploy preview from this folder:

```bash
npm run deploy:preview
```

Deploy production from this folder:

```bash
npm run deploy:prod
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DASHBOARD_DATA_URL` | No | `https://raw.githubusercontent.com/andsfx/Instagram-collector/main/dashboard/data.json` | URL of the upstream dashboard data JSON. The API fetches from this URL first, then falls back to other sources if unavailable. Set this in Vercel project settings to point to a custom data source. |
| `VERCEL_GIT_COMMIT_SHA` | No (auto-set by Vercel) | — | Automatically provided by Vercel on each deployment. Used to set the `X-Dashboard-Commit` response header on API responses for deployment traceability. |

### Setting Environment Variables

In Vercel:
1. Go to your project → Settings → Environment Variables
2. Add `DASHBOARD_DATA_URL` with the URL of your data source
3. `VERCEL_GIT_COMMIT_SHA` is automatically injected by Vercel — no manual setup needed

Locally (for development):
```bash
# Create a .env.local file in dashboard-react/
DASHBOARD_DATA_URL=https://raw.githubusercontent.com/andsfx/Instagram-collector/main/dashboard/data.json
```

### Response Headers

The `/api/dashboard-data` endpoint sets the following headers on every response:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevent MIME-type sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage |
| `X-Dashboard-Commit` | `<commit SHA>` | Identifies which deployment served the response (from `VERCEL_GIT_COMMIT_SHA`) |
| `Cache-Control` | `public, s-maxage=60, stale-while-revalidate=300` | Edge caching for successful responses |

## Runtime Data Strategy

This app does not bundle `dashboard/data.json` into the client anymore.

Instead, the UI fetches runtime data from:

```text
/api/dashboard-data
```

### In local Vite development

`vite.config.ts` injects a dev/preview middleware endpoint that reads:

```text
../dashboard/data.json
```

This means local data updates can appear without rebuilding the React app.

### In Vercel deployment

`api/dashboard-data.ts` serves the runtime endpoint.

Primary strategy:

1. fetch the latest file from GitHub raw
2. return it with cache headers

Current upstream source:

```text
https://raw.githubusercontent.com/andsfx/Instagram-collector/main/dashboard/data.json
```

This keeps the deployed UI synced with the latest repository data even if the frontend bundle itself has not been rebuilt.

## Deployment Notes

Recommended deployment model:

1. deploy `dashboard-react/` as its own Vercel project
2. keep `/api/dashboard-data` enabled as a serverless function
3. allow the function to fetch the latest GitHub raw dashboard data

### Direct Folder Deploy

If you want to deploy directly from this folder:

1. open terminal in `dashboard-react/`
2. run `npm install`
3. run `npm run deploy:preview` for first linking / preview deploy
4. run `npm run deploy:prod` for production deploy

Notes:

1. `npx vercel` works even if Vercel CLI is not installed globally
2. on first run, Vercel will ask you to link the folder to a project
3. after linking, deploys can be repeated directly from `dashboard-react/`
4. `deploy:preview` explicitly uses `--target preview` to avoid accidental production deploys

Important implications:

1. the frontend bundle can stay cached longer than the data
2. data freshness depends on GitHub raw availability
3. cache policy is currently short-lived to favor freshness

Current cache headers for `/api/dashboard-data`:

```text
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```

## If You Want Stronger Production Reliability

Consider one of these follow-up strategies:

1. move the JSON source to object storage or a small database/API you control
2. add a scheduled sync job that stores the latest payload inside Vercel KV, Blob, or another durable store
3. version the payload and expose a health endpoint for monitoring freshness

## Directory Notes

- `src/` contains the React app
- `api/dashboard-data.ts` is the production runtime endpoint for Vercel
- `api/health.ts` is the health check endpoint
- `vercel.json` is the **single production Vercel configuration** for this project (the legacy `dashboard/vercel.json` has been emptied)
