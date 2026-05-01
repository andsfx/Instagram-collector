import type { QuickVisualData } from '../data/selectors'

export function FeaturedGrowthChart({ data }: { data: QuickVisualData }) {
  const firstPoint = data.followerTrend[0]
  const lastPoint = data.followerTrend[data.followerTrend.length - 1]
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
  const totalDelta = movers.reduce((sum, m) => sum + m.delta, 0)
  const maxFollowers = movers[0]?.end ?? 1
  const leadMover = [...movers].sort((a, b) => b.delta - a.delta)[0]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {/* Hero Card - Total Followers (spans 2 cols) */}
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)] sm:col-span-2">
        <div className="absolute inset-0 bg-[image:var(--ig-gradient-soft)] opacity-50" />
        <div className="relative">
          <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">Total Followers (All Tracked)</div>
          <div className="mt-1 font-display text-[clamp(2rem,3vw,3rem)] font-extrabold tracking-tight text-[var(--text)]">
            {totalFollowers.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className={`text-sm font-bold ${totalDelta >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
              {totalDelta >= 0 ? '+' : ''}{totalDelta.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-[var(--text-soft)]">dalam {data.followerTrend.length} hari</span>
          </div>
        </div>
      </div>

      {/* Leading Mover Card */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)]">
        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">Leading Mover</div>
        <div className="mt-1 font-display text-xl font-extrabold text-[var(--text)]">
          {leadMover ? `@${leadMover.account}` : '-'}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--success)]">
            {leadMover ? `+${leadMover.delta.toLocaleString('id-ID')}` : '-'}
          </span>
          <span className="text-xs text-[var(--text-soft)]">
            {leadMover ? `${leadMover.pct.toFixed(2)}%` : ''}
          </span>
        </div>
      </div>

      {/* Tracked Accounts Card */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)]">
        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">Tracked</div>
        <div className="mt-1 font-display text-xl font-extrabold text-[var(--text)]">{data.series.length} akun</div>
        <div className="mt-1 text-xs text-[var(--text-soft)]">{data.followerTrend.length} hari data</div>
      </div>

      {/* Horizontal Bar Chart - Follower Ranking (spans full width) */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-sm)] sm:col-span-2 lg:col-span-4">
        <div className="mb-3 text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">Follower Ranking</div>
        <div className="grid gap-2">
          {movers.map((m, i) => (
            <div key={m.account} className="grid grid-cols-[140px_1fr_auto] items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold" style={{ backgroundColor: `${m.color}20`, color: m.color }}>
                  {i + 1}
                </span>
                <span className="truncate text-xs font-bold text-[var(--text)]">@{m.account}</span>
              </div>
              <div className="h-5 overflow-hidden rounded-full bg-[var(--panel-muted)]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(m.end / maxFollowers) * 100}%`, backgroundColor: m.color }}
                />
              </div>
              <div className="flex items-center gap-2 text-right">
                <span className="text-xs font-bold text-[var(--text)]">{m.end.toLocaleString('id-ID')}</span>
                <span className={`text-[10px] font-bold ${m.delta > 0 ? 'text-[var(--success)]' : m.delta < 0 ? 'text-[var(--danger)]' : 'text-[var(--text-soft)]'}`}>
                  {m.delta > 0 ? '+' : ''}{m.delta.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}