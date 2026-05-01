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
    <div className="grid gap-3">
      {/* KPI Strip - 2 col mobile, 4 col desktop */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--panel)] p-3 shadow-[var(--shadow-sm)] col-span-2 lg:col-span-2">
          <div className="absolute inset-0 bg-[image:var(--ig-gradient-soft)] opacity-50" />
          <div className="relative">
            <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">Total Followers</div>
            <div className="mt-0.5 font-display text-[clamp(1.5rem,4vw,2.5rem)] font-extrabold tracking-tight text-[var(--text)]">
              {totalFollowers.toLocaleString('id-ID')}
            </div>
            <span className={`text-xs font-bold ${totalDelta >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
              {totalDelta >= 0 ? '+' : ''}{totalDelta.toLocaleString('id-ID')} <span className="font-normal text-[var(--text-soft)]">/ {data.followerTrend.length}d</span>
            </span>
          </div>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--panel)] p-3 shadow-[var(--shadow-sm)]">
          <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">Top Mover</div>
          <div className="mt-0.5 font-display text-sm font-extrabold text-[var(--text)] truncate">{leadMover ? `@${leadMover.account}` : '-'}</div>
          <span className="text-xs font-bold text-[var(--success)]">{leadMover ? `+${leadMover.delta.toLocaleString('id-ID')}` : '-'}</span>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--panel)] p-3 shadow-[var(--shadow-sm)]">
          <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">Tracked</div>
          <div className="mt-0.5 font-display text-sm font-extrabold text-[var(--text)]">{data.series.length} akun</div>
          <span className="text-xs text-[var(--text-soft)]">{data.followerTrend.length}d window</span>
        </div>
      </div>

      {/* Bar Chart - responsive with values on bars */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-3 shadow-[var(--shadow-sm)] sm:p-4">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">Follower Ranking</div>
        <div className="grid gap-2">
          {movers.map((m, i) => (
            <div key={m.account} className="grid gap-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: m.color }}>
                    {i + 1}
                  </span>
                  <span className="truncate text-xs font-bold text-[var(--text)]">@{m.account}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-right">
                  <span className="text-xs font-extrabold text-[var(--text)]">{m.end.toLocaleString('id-ID')}</span>
                  <span className={`text-[10px] font-bold ${m.delta > 0 ? 'text-[var(--success)]' : m.delta < 0 ? 'text-[var(--danger)]' : 'text-[var(--text-soft)]'}`}>
                    {m.delta > 0 ? '+' : ''}{m.delta.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[var(--panel-muted)]">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(m.end / maxFollowers) * 100}%`, backgroundColor: m.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}