import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { QuickVisualData } from '../data/selectors'
import { chartAxisColor, chartGridColor, chartItemStyle, chartLabelStyle, chartLegendStyle, chartTooltipStyle } from './chart-theme'

export function FeaturedGrowthChart({ data }: { data: QuickVisualData }) {
  const firstPoint = data.followerTrend[0]
  const lastPoint = data.followerTrend[data.followerTrend.length - 1]
  const movers = data.series
    .map((series) => {
      const start = Number(firstPoint?.[series.key] ?? 0)
      const end = Number(lastPoint?.[series.key] ?? 0)
      return { account: series.key, delta: end - start, start, end }
    })
    .sort((left, right) => right.delta - left.delta)

  const leadMover = movers[0]
  const totalDelta = movers.reduce((sum, m) => sum + m.delta, 0)

  // Normalize data to % change from first day for better scale comparison
  const normalizedTrend = data.followerTrend.map((point) => {
    const normalized: Record<string, unknown> = { date: point.date }
    for (const series of data.series) {
      const baseValue = Number(firstPoint?.[series.key] ?? 1)
      const currentValue = Number(point[series.key] ?? 0)
      normalized[series.key] = baseValue > 0 ? ((currentValue - baseValue) / baseValue) * 100 : 0
    }
    return normalized
  })

  return (
    <article className="grid gap-4">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--panel)] p-3 shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)] cursor-pointer">
          <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">Leading Mover</div>
          <div className="mt-1 font-display text-lg font-extrabold text-[var(--text)]">{leadMover ? `@${leadMover.account}` : '-'}</div>
          <div className="text-xs font-bold text-[var(--success)]">{leadMover ? `+${leadMover.delta.toLocaleString('id-ID')}` : '-'}</div>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--panel)] p-3 shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)] cursor-pointer">
          <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">Total Growth</div>
          <div className="mt-1 font-display text-lg font-extrabold text-[var(--text)]">{totalDelta >= 0 ? '+' : ''}{totalDelta.toLocaleString('id-ID')}</div>
          <div className="text-xs text-[var(--text-muted)]">{data.followerTrend.length} data points</div>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--panel)] p-3 shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)] cursor-pointer">
          <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">Tracked</div>
          <div className="mt-1 font-display text-lg font-extrabold text-[var(--text)]">{data.series.length} akun</div>
          <div className="text-xs text-[var(--text-muted)]">Follower comparison</div>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--panel)] p-3 shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)] cursor-pointer">
          <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">Period</div>
          <div className="mt-1 font-display text-lg font-extrabold text-[var(--text)]">{data.followerTrend.length}d</div>
          <div className="text-xs text-[var(--text-muted)]">Window aktif</div>
        </div>
      </div>

      {/* Chart - Full Width, Normalized to % Growth */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-sm)]">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-bold text-[var(--text-muted)]">Growth % (normalized from day 1)</div>
          <div className="text-[10px] text-[var(--text-soft)]">Semua akun dimulai dari 0% untuk perbandingan yang adil</div>
        </div>
        <div className="h-[300px] w-full sm:h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={normalizedTrend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
              <XAxis dataKey="date" stroke={chartAxisColor} fontSize={12} />
              <YAxis stroke={chartAxisColor} fontSize={12} tickFormatter={(v: number) => `${v.toFixed(1)}%`} />
              <Tooltip contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} formatter={(value: number) => [`${value.toFixed(3)}%`, '']} />
              <Legend wrapperStyle={chartLegendStyle} />
              {data.series.map((series) => (
                <Line key={series.key} type="monotone" dataKey={series.key} name={`@${series.key}`} stroke={series.color} strokeWidth={2.4} dot={false} activeDot={{ r: 4 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </article>
  )
}