# Implementation Plan: Dashboard Audit Improvements

## Overview

This plan implements the audit improvements for the Instagram tracker dashboard system. The work is organized into incremental phases: schema hardening and metric calculator fixes first (foundation), then API/security/freshness layers, followed by frontend UX/accessibility, pipeline reliability, CI integration, and finally documentation. Each task builds on previous steps, ensuring no orphaned code.

## Tasks

- [x] 1. Set up testing infrastructure and install dependencies
  - [x] 1.1 Install fast-check and configure Vitest for property-based testing
    - Add `fast-check` as a devDependency in `dashboard-react/package.json`
    - Verify Vitest config supports property test tagging via `--grep`
    - Create test helper file `dashboard-react/src/test-utils/fc-helpers.ts` with shared arbitraries for post entries, account configs, and dashboard payloads
    - _Requirements: 12.2, 12.3, 12.6_

- [x] 2. Harden schema and payload parser (single source of truth)
  - [x] 2.1 Create strict v2 schema in `dashboard-react/src/data/schema.ts`
    - Refactor existing `dashboardSchema` to use `.strict()` on content_breakdown
    - Normalize field names: `carousels` (reject `carousel`), `images` (reject `image`), `videos` (reject `video`)
    - Add `SUPPORTED_VERSIONS` constant and version validation
    - Add `unknown` field to content breakdown for unrecognized post types
    - Export `ParseResult<T>` and `ValidationError` interfaces with dot-path error reporting
    - Create `parsePayload()` function that returns `ParseResult` with structured errors
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 2.2 Write property test: Payload Round-Trip (Property 1)
    - **Property 1: Payload Round-Trip**
    - Generate valid Dashboard_Payload via fast-check arbitrary, parse → serialize → parse, assert field-by-field equality
    - **Validates: Requirements 2.5**

  - [ ]* 2.3 Write property test: Content Breakdown Normalization (Property 2)
    - **Property 2: Content Breakdown Normalization**
    - Generate payloads from serializer, assert only `{reels, carousels, images, videos, unknown}` keys present; generate payloads with synonyms, assert rejection
    - **Validates: Requirements 2.4**

  - [ ]* 2.4 Write property test: Parser Rejection with Error Paths (Property 3)
    - **Property 3: Parser Rejection with Error Paths**
    - Generate invalid payloads (missing fields, wrong types, out-of-bounds values), assert rejection with non-empty error list containing dot-path and reason
    - **Validates: Requirements 2.3**

  - [x] 2.5 Create adapter normalization layer
    - Update `dashboard-react/src/data/adapter.ts` to use the new strict parser
    - Ensure adapter transforms `DashboardApi` → `DashboardRecord` using normalized field names only
    - Remove legacy synonym handling from adapter (synonyms now rejected at parse level)
    - _Requirements: 2.1, 2.4_

- [x] 3. Harden metric calculator (`calc-instagram-metrics.js`)
  - [x] 3.1 Add defensive checks and null-safe computation
    - Validate CLI args: exit code 1 with usage message if `<account>` or `<followers>` invalid
    - Guard division: if `followers` is not a positive finite integer → `engagement_rate = null`
    - Guard empty posts: if `posts.length === 0` → `avg_likes = null`, `avg_comments = null`, `engagement_rate = null`
    - Filter valid entries: `total_likes` and `total_comments` sum only finite non-negative numbers
    - Compute `avg_likes` and `avg_comments` from valid entries only
    - Round `engagement_rate` to 2 decimals using half-up rounding
    - Normalize content breakdown output: use `{reels, carousels, images, videos, unknown}`
    - Log warning to stderr for unknown post types, classify as `unknown`
    - Ensure `reels + carousels + images + videos + unknown === posts_analyzed`
    - Ensure deterministic output: stable JSON key ordering
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

  - [ ]* 3.2 Write property test: Engagement Rate Computation (Property 4)
    - **Property 4: Engagement Rate Computation Correctness**
    - Generate random followers (including 0, negative, NaN, Infinity) and posts with random likes/comments; assert ER formula correctness or null
    - **Validates: Requirements 3.1, 3.2**

  - [ ]* 3.3 Write property test: Type Count Invariant (Property 5)
    - **Property 5: Type Count Invariant**
    - Generate random posts with mixed types; assert `reels + carousels + images + videos + unknown === posts_analyzed`
    - **Validates: Requirements 3.7**

  - [ ]* 3.4 Write property test: Average Bounded by Min-Max (Property 6)
    - **Property 6: Average Bounded by Min-Max**
    - Generate posts with at least one valid likes value; assert `min(valid) <= avg_likes <= max(valid)`
    - **Validates: Requirements 3.6**

  - [ ]* 3.5 Write property test: Total Sum of Valid Entries (Property 7)
    - **Property 7: Total Sum of Valid Entries Only**
    - Generate posts with mix of valid/invalid likes/comments; assert totals equal sum of finite non-negative entries only
    - **Validates: Requirements 3.5**

  - [ ]* 3.6 Write property test: Idempotence (Property 8)
    - **Property 8: Metric Calculator Idempotence**
    - Generate input, run calculator twice, assert byte-identical JSON output
    - **Validates: Requirements 3.8**

  - [ ]* 3.7 Write property test: No NaN/Infinity (Property 9)
    - **Property 9: No NaN/Infinity in Metric Output**
    - Generate edge-case inputs (empty posts, zero followers, null likes, unknown types); assert no NaN/Infinity in any numeric output field
    - **Validates: Requirements 3.10**

  - [ ]* 3.8 Write unit tests for metric calculator edge cases
    - Test: posts empty → nulls returned
    - Test: followers = 0 → engagement_rate = null
    - Test: unknown post type → warning logged, counted as unknown
    - Test: normal case → correct computation
    - _Requirements: 12.1_

- [x] 4. Checkpoint - Ensure schema and metric calculator tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Harden Dashboard Runtime API
  - [x] 5.1 Add security headers and method validation to `/api/dashboard-data`
    - Add `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` to every response
    - Return HTTP 405 with `Allow: GET` header for non-GET requests
    - Add `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` for success responses
    - Add `X-Dashboard-Commit` header from `VERCEL_GIT_COMMIT_SHA` env var
    - _Requirements: 5.4, 5.5, 7.5, 10.6_

  - [x] 5.2 Add server-side schema validation and structured logging
    - Validate fetched payload against schema kanonik before returning to client
    - Return HTTP 502 if validation fails with JSON error body
    - Return HTTP 422 if upstream response is not valid JSON
    - Read `DASHBOARD_DATA_URL` from env var (fallback to documented default)
    - Implement structured JSON logging: `{timestamp, level, event, duration_ms, upstream_source, status_code}`
    - Implement retry logic: up to 3 fallback sources (GitHub raw → local file)
    - Return HTTP 502 with JSON error body if all sources fail
    - _Requirements: 4.8, 4.9, 4.10, 5.3, 6.1, 10.2, 10.3_

  - [x] 5.3 Create `/api/health` endpoint
    - Return JSON `{status, generated_at, age_seconds, accounts_count}`
    - Classify: `fresh` (≤86400s), `stale` (86400-172800s), `critical` (>172800s)
    - Fetch and validate upstream payload to determine freshness
    - _Requirements: 4.7_

  - [ ]* 5.4 Write property test: Security Headers (Property 13)
    - **Property 13: Security Headers on Every API Response**
    - Generate various valid GET requests; assert all three security headers present on every 2xx response
    - **Validates: Requirements 5.5**

  - [ ]* 5.5 Write property test: Non-GET Method Rejection (Property 14)
    - **Property 14: Non-GET Method Rejection**
    - Generate requests with methods from `{POST, PUT, DELETE, PATCH, OPTIONS, HEAD}`; assert HTTP 405 with `Allow: GET` header
    - **Validates: Requirements 5.4**

  - [ ]* 5.6 Write unit tests for Dashboard API scenarios
    - Test: successful remote fetch → 200 + valid JSON
    - Test: remote fail → fallback to local
    - Test: invalid JSON upstream → 422
    - Test: non-GET method → 405
    - Test: all sources fail → 502
    - _Requirements: 12.4_

- [x] 6. Implement Freshness Monitor component
  - [x] 6.1 Create `FreshnessMonitor` React component
    - Display `generated_at_wib` and `latest.date` in dashboard header
    - Display source labels from `sources.stats` and `sources.engagement`
    - Classify freshness: `fresh` (≤24h), `stale` (24-48h), `critical` (>48h)
    - Show status indicator with appropriate colors (3:1 contrast ratio minimum)
    - Show `Retry` button when status is `critical`
    - Handle `unavailable` state when no data and no cache
    - Mark data source as `cached` when API unreachable but cached data exists
    - Ensure ARIA labels on status indicators for screen reader accessibility
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.11, 8.4_

  - [ ]* 6.2 Write property test: Freshness Status Classification (Property 10)
    - **Property 10: Freshness Status Classification**
    - Generate random `age_seconds` values; assert deterministic classification matching thresholds (fresh ≤86400, stale 86400-172800, critical >172800)
    - **Validates: Requirements 4.2, 4.3, 4.7**

- [x] 7. Implement frontend error handling and retry logic
  - [x] 7.1 Enhance `useDashboardData` hook with abort and retry
    - Implement abort controller: cancel inflight request on retry
    - State machine: `idle → loading → success/error`, `idle → refreshing → success/error`
    - Ensure `isLoading` and `isRefreshing` never both true simultaneously
    - Show cached data on error with `cached` indicator
    - Timeout after 15s → show cached data or unavailable state
    - _Requirements: 6.4, 6.5, 6.6, 6.7_

  - [x] 7.2 Implement consistent ErrorBoundary and ErrorState components
    - Create/update `SectionAsyncBoundary` for section-level errors
    - Create/update app-level error boundary
    - Show retry button with `resetKey` increment pattern
    - Log errors to console with `dashboard.error` tag
    - Display HTTP error code in error message (no stack traces)
    - _Requirements: 6.3, 6.7_

  - [ ]* 7.3 Write unit tests for `useDashboardData` hook
    - Test: loading → data loaded → success
    - Test: fetch error → error state with message
    - Test: retry → abort inflight + new request
    - Test: cached data on error → show cached + error indicator
    - _Requirements: 12.5_

- [x] 8. Checkpoint - Ensure API, freshness, and error handling tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement UX consistency and formatting
  - [x] 9.1 Create unified formatter utilities
    - Implement `formatInteger` and `formatCompact` utility functions
    - Implement date formatter with `Asia/Jakarta` timezone and `id-ID` locale
    - Replace all ad-hoc `Number.toLocaleString` calls with unified formatters
    - Format Engagement Rate with 2 decimals and `%` suffix consistently
    - _Requirements: 9.1, 9.2, 9.5_

  - [x] 9.2 Implement consistent chart theme and empty states
    - Create/update `chart-theme.ts` with Instagram brand palette (`--ig-pink`, `--ig-purple`, `--ig-blue`, `--ig-orange`)
    - Ensure all charts use consistent palette
    - Implement empty state component with format `Belum ada data untuk [nama metrik].`
    - Ensure ranking views default to `rankings.by_followers` order
    - _Requirements: 9.3, 9.4, 9.6_

- [x] 10. Implement accessibility improvements
  - [x] 10.1 Implement keyboard navigation and focus management
    - Ensure skip link focuses `#dashboard-main` on activation
    - Verify all interactive elements operable via keyboard (Tab, Shift+Tab, Enter, Space, Arrow keys)
    - Add visible focus indicators with 3:1 contrast ratio
    - Implement focus trap in modals/overlays using `focus-trap-react`
    - Return focus to trigger element on overlay close
    - Allow Escape key to close overlays
    - _Requirements: 8.1, 8.2, 8.3, 8.6, 8.7_

  - [x] 10.2 Add ARIA labels and semantic markup
    - Add `aria-label` to all icon-only buttons (theme toggle, refresh, nav toggle)
    - Set `aria-hidden="true"` or `alt=""` on decorative images/icons
    - Ensure text contrast 4.5:1 for normal text, 3:1 for large text
    - Add screen-reader-accessible labels to status indicators
    - _Requirements: 8.4, 8.5, 8.8, 8.9_

- [x] 11. Implement performance optimizations
  - [x] 11.1 Add code splitting and bundle optimization
    - Implement `React.lazy` for `HeadToHead`, `HeatmapPresentation`, `QuickVisual`, `FeaturedGrowthChart`
    - Add Suspense boundaries with loading fallbacks
    - Verify bundle initial size < 250KB gzip
    - Implement chart virtualization/downsampling for >90 data points
    - _Requirements: 7.1, 7.2, 7.3, 7.6, 7.7, 7.8_

- [x] 12. Implement Content Security Policy
  - [x] 12.1 Add CSP meta tag to `index.html`
    - Add `<meta http-equiv="Content-Security-Policy">` with policy: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://raw.githubusercontent.com`
    - _Requirements: 5.8_

- [x] 13. Checkpoint - Ensure frontend tests pass and bundle size is within budget
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Implement data pipeline reliability
  - [x] 14.1 Add schema validation pre-write to build pipeline
    - In `build-dashboard-data.js` (or equivalent builder), validate output against schema kanonik before writing to disk
    - Exit non-zero if validation fails, preserving previous payload
    - Relocate output from `dashboard/data.json` to `data/dashboard-snapshot.json`
    - Update Dashboard_Runtime_API fallback path to new location
    - Ensure all enabled accounts from `config/accounts.json` produce entries in output
    - Handle failed accounts: include with `null` engagement fields + log warning
    - _Requirements: 11.2, 11.3, 11.4, 11.5, 1.6_

  - [ ]* 14.2 Write property test: History Dates Unique and Ascending (Property 11)
    - **Property 11: History Dates Unique and Ascending**
    - Generate valid payloads; assert all history dates are unique and in ascending order
    - **Validates: Requirements 11.7**

  - [ ]* 14.3 Write property test: All Enabled Accounts Present (Property 12)
    - **Property 12: All Enabled Accounts Present in Output**
    - Generate account configs with N enabled accounts; assert output contains exactly N entries in `accounts[]` and `latest[account]`
    - **Validates: Requirements 11.4**

- [x] 15. Legacy cleanup and deployment configuration
  - [x] 15.1 Remove legacy auth and deprecated files
    - Delete `dashboard/js/auth.js` and all `admin/admin` credential references
    - Delete or empty `dashboard/vercel.json`
    - Delete `dashboard/index.html` and `dashboard/js/*.js` files (except those used by pipeline)
    - Keep `dashboard/data.json` as snapshot source (or relocate per 14.1)
    - Generate cleanup report listing retained vs deleted files with reasons
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.1_

  - [x] 15.2 Consolidate Vercel deployment configuration
    - Ensure `dashboard-react/vercel.json` is the single production config
    - Add `DASHBOARD_DATA_URL` env var documentation to `dashboard-react/README.md`
    - Ensure `X-Dashboard-Commit` header is set from `VERCEL_GIT_COMMIT_SHA`
    - _Requirements: 10.1, 10.2, 10.3, 10.6_

- [x] 16. CI pipeline integration
  - [x] 16.1 Add CI checks and pre-commit hooks
    - Add secret leakage check script (scan for JWT, Apify key, Supabase service role patterns)
    - Add schema-doc sync check (verify `docs/dashboard-data-schema.md` matches schema code)
    - Add CI warning for PRs modifying `dashboard/js/` (deprecated folder)
    - Ensure `npm run build` fails pipeline on TypeScript/Vite errors
    - Ensure `npm test` runs all tests as merge prerequisite
    - Block production deploy until secret leakage check passes clean
    - _Requirements: 1.7, 2.8, 5.6, 5.7, 5.9, 10.4, 10.5, 12.6_

- [x] 17. Checkpoint - Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 18. Documentation
  - [x] 18.1 Create audit report and schema documentation
    - Create `docs/audit-report.md` with findings per domain and severity levels
    - Map each finding to corresponding Requirement ID
    - Create `docs/dashboard-data-schema.md` documenting every field (name, type, required/optional, constraints)
    - Create `docs/dashboard-migration.md` documenting React migration completion and non-ported features
    - Update `docs/daily-operations.md` with audit re-run instructions
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 2.7_

- [x] 19. Final checkpoint - Ensure all tests pass and documentation is complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document (14 properties total)
- Unit tests validate specific examples and edge cases
- The implementation language is TypeScript/JavaScript as specified in the design document
- fast-check is used for all property-based tests with minimum 100 iterations per property
- All tests must complete within 120 seconds total on CI

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8"] },
    { "id": 3, "tasks": ["5.1", "5.2", "5.3", "6.1"] },
    { "id": 4, "tasks": ["5.4", "5.5", "5.6", "6.2", "7.1", "7.2"] },
    { "id": 5, "tasks": ["7.3", "9.1", "9.2", "10.1", "10.2", "11.1", "12.1"] },
    { "id": 6, "tasks": ["14.1", "15.1", "15.2"] },
    { "id": 7, "tasks": ["14.2", "14.3", "16.1"] },
    { "id": 8, "tasks": ["18.1"] }
  ]
}
```
