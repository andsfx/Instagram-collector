import type { QuickVisualData } from '../data/selectors'
import { formatInteger, formatPercent } from '../utils/formatters'
import { EmptyState } from './ui'

export function FeaturedGrowthChart({ data }: { data: QuickVisualData }) {
  const firstPoint = data.followerTrend[0]
  const lastPoint = data.followerTrend[data.followerTrend.length - 1]

  if (!firstPoint || !lastPoint || data.series.length === 0) {
    return <EmptyState>Tidak ada data growth untuk ditampilkan.</EmptyState>
  }

  const movers = data.series
    .map((series) => {
      const start = Number(firstPoint?.[series.key] ?? 0)
      const end = Number(lastPoint?.[series.key] ?? 0)
      const delta = end - start
      const pct = start > 0 ? (delta / start) * 100 : 0
      return { account: series.key, delta, pct, end, color: series.color }
    })
    .sort((left, right) => right.end - left.end)

  const totalFollowers = movers.reduce((sum, m) => sum + m.end, 0)
  const totalStart = movers.reduce((sum, m) => sum + (m.end - m.delta), 0)
  const totalDelta = movers.reduce((sum, m) => sum + m.delta, 0)
  const totalPct = totalStart > 0 ? (totalDelta / totalStart) * 100 : 0
  const maxFollowers = movers[0]?.end ?? 1
  const windowDays = data.followerTrend.length

  const deltaSign = totalDelta >= 0 ? '+' : ''
  const leadValue = `${deltaSign}${formatInteger(totalDelta)}`

  return (
    <div className="grid gap-6">
      {/* Stat-Led lead — 7d followers change */}
      <div className="border-b border-[var(--border)] pb-6">
        <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
          Followers change · {windowDays}d
        </p>
        <p className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-normal tracking-[-0.03em] text-[var(--text)]">
          {leadValue}
        </p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {totalPct >= 0 ? '+' : ''}
          {formatPercent(totalPct)} · {formatInteger(totalFollowers)} total followers · {data.series.length}{' '}
          akun
        </p>
      </div>

      {/* Chart figure panel */}
      <section className="border border-[var(--border)] bg-[var(--panel)] p-6">
        <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
          Follower Ranking
        </p>
        <div className="mt-4 grid gap-3">
          {movers.map((m, i) => (
            <div key={m.account} className="grid gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="font-display text-sm font-normal text-[var(--text-muted)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="h-2 w-2 shrink-0 rounded-[var(--radius-sm)]"
                    style={{ backgroundColor: m.color }}
                    aria-hidden="true"
                  />
                  <span className="truncate text-sm font-semibold text-[var(--text)]">
                    @{m.account}
                  </span>
                </div>
                <div className="flex shrink-0 items-baseline gap-2 text-right">
                  <span className="font-display text-base font-normal text-[var(--text)]">
                    {formatInteger(m.end)}
                  </span>
                  <span
                    className={`text-xs ${
                      m.delta > 0
                        ? 'text-[var(--success)]'
                        : m.delta < 0
                          ? 'text-[var(--danger)]'
                          : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {m.delta > 0 ? '+' : ''}
                    {formatInteger(m.delta)}
                  </span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--panel-muted)]">
                <div
                  className="h-full rounded-[var(--radius-sm)]"
                  style={{
                    width: `${(m.end / maxFollowers) * 100}%`,
                    backgroundColor: m.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-[var(--text-muted)]">
          Peringkat followers lintas akun pada window {windowDays} hari. Warna series data-only.
        </p>
      </section>
    </div>
  )
}
