/**
 * FreshnessMonitor — displays data freshness status in the dashboard header.
 *
 * Classifies freshness based on age of `generatedAt`:
 * - fresh: ≤24h (86400s)
 * - stale: 24-48h (86400-172800s)
 * - critical: >48h (172800s)
 * - unavailable: no data and no cache
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.11, 8.4
 */

export type FreshnessStatus = 'fresh' | 'stale' | 'critical' | 'unavailable'
export type DataSource = 'live' | 'cached'

export interface FreshnessMonitorProps {
  /** ISO 8601 UTC timestamp of when data was generated */
  generatedAt: string | null
  /** Pre-formatted WIB timestamp string (e.g. "2025-01-15 14:30") */
  generatedAtWib: string | null
  /** Latest observation date (e.g. "2025-01-15") */
  latestDate: string | null
  /** Data source labels */
  sources: {
    stats: string
    engagement: string
  } | null
  /** Whether data is live from API or served from client cache */
  dataSource: DataSource
  /** Callback triggered when user clicks Retry */
  onRetry: () => void
}

const STALE_THRESHOLD_SECONDS = 86400 // 24 hours
const CRITICAL_THRESHOLD_SECONDS = 172800 // 48 hours

/**
 * Compute freshness status from generatedAt timestamp vs current time.
 */
export function classifyFreshness(generatedAt: string | null): FreshnessStatus {
  if (!generatedAt) return 'unavailable'

  const generatedTime = new Date(generatedAt).getTime()
  if (Number.isNaN(generatedTime)) return 'unavailable'

  const ageSeconds = (Date.now() - generatedTime) / 1000

  if (ageSeconds <= STALE_THRESHOLD_SECONDS) return 'fresh'
  if (ageSeconds <= CRITICAL_THRESHOLD_SECONDS) return 'stale'
  return 'critical'
}

const STATUS_CONFIG: Record<FreshnessStatus, { label: string; badgeClass: string; ariaLabel: string }> = {
  fresh: {
    label: 'Fresh',
    // Green badge — meets 3:1 contrast on white/dark backgrounds
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    ariaLabel: 'Data status: fresh — data is up to date',
  },
  stale: {
    label: 'Stale',
    // Amber/yellow badge — meets 3:1 contrast
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    ariaLabel: 'Data status: stale — data is between 24 and 48 hours old',
  },
  critical: {
    label: 'Critical',
    // Red badge — meets 3:1 contrast
    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    ariaLabel: 'Data status: critical — data is more than 48 hours old',
  },
  unavailable: {
    label: 'Unavailable',
    badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    ariaLabel: 'Data status: unavailable — no data could be loaded',
  },
}

export function FreshnessMonitor({
  generatedAt,
  generatedAtWib,
  latestDate,
  sources,
  dataSource,
  onRetry,
}: FreshnessMonitorProps) {
  const status = classifyFreshness(generatedAt)
  const config = STATUS_CONFIG[status]

  const showRetry = status === 'critical' || status === 'unavailable'
  const sourceLabel = sources
    ? [
        sources.stats ? `Stats: ${sources.stats}` : null,
        sources.engagement ? `Engagement: ${sources.engagement}` : null,
      ]
        .filter(Boolean)
        .join(' | ')
    : null

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      {/* Status badge with ARIA label for screen readers */}
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.badgeClass}`}
        role="status"
        aria-label={config.ariaLabel}
      >
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            status === 'fresh'
              ? 'bg-emerald-500'
              : status === 'stale'
                ? 'bg-amber-500'
                : status === 'critical'
                  ? 'bg-red-500'
                  : 'bg-slate-400'
          }`}
          aria-hidden="true"
        />
        {config.label}
      </span>

      {/* Cached indicator */}
      {dataSource === 'cached' && (
        <span
          className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
          aria-label="Data source: cached"
        >
          Cached
        </span>
      )}

      {/* Generated at WIB */}
      {generatedAtWib && (
        <span className="text-xs text-[var(--text-muted)]">
          Generated: {generatedAtWib} WIB
        </span>
      )}

      {/* Latest date */}
      {latestDate && (
        <span className="text-xs text-[var(--text-muted)]">
          Latest: {latestDate}
        </span>
      )}

      {/* Source labels */}
      {sourceLabel && (
        <span className="text-xs text-[var(--text-soft)]">
          {sourceLabel}
        </span>
      )}

      {/* Retry button — shown only when critical or unavailable */}
      {showRetry && (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-red-300 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
          onClick={onRetry}
          aria-label="Retry loading dashboard data"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" />
            <path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14" />
          </svg>
          Retry
        </button>
      )}
    </div>
  )
}
