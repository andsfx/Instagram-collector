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

const chartAxisColor = 'var(--chart-axis)'
const chartGridColor = 'var(--chart-grid)'
const chartTooltipStyle = {
  backgroundColor: 'var(--chart-tooltip-bg)',
  border: '1px solid var(--chart-tooltip-border)',
  borderRadius: '12px',
  color: 'var(--text)',
}
const chartLabelStyle = { color: 'var(--text)' }
const chartItemStyle = { color: 'var(--text)' }
const chartLegendStyle = { color: 'var(--text-muted)' }

export function FeaturedGrowthChart({ data }: { data: QuickVisualData }) {
  const firstPoint = data.followerTrend[0]
  const lastPoint = data.followerTrend[data.followerTrend.length - 1]
  const movers = data.series
    .map((series) => {
      const start = Number(firstPoint?.[series.key] ?? 0)
      const end = Number(lastPoint?.[series.key] ?? 0)
      return {
        account: series.key,
        delta: end - start,
      }
    })
    .sort((left, right) => right.delta - left.delta)

  const leadMover = movers[0]

  return (
    <article className="grid gap-8 border-t border-[color:color-mix(in_srgb,var(--brand)_18%,white)] pt-8 dark:border-[color:color-mix(in_srgb,var(--brand)_20%,transparent)] lg:grid-cols-[minmax(320px,0.58fr)_minmax(0,1.42fr)] lg:items-end lg:gap-10">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Growth comparison
          </div>
          <h2 className="max-w-[12ch] font-display text-[clamp(2.1rem,1.55rem+1vw,3.1rem)] font-semibold leading-[0.93] tracking-[-0.055em] text-slate-950 dark:text-white">
            Growth story dimulai dari pergerakan audiens.
          </h2>
          <p className="max-w-[40ch] text-[0.98rem] leading-7 text-slate-600 dark:text-slate-300">
            Chapter ini dibuka dengan pergerakan audiens harian agar pembaca langsung melihat momentum brand dan pesaing sebelum turun ke leaderboard teknis.
          </p>
        </div>

        <div className="grid gap-3 border-t border-slate-200/80 pt-4 dark:border-white/10 sm:grid-cols-2 lg:grid-cols-1">
          <div className="grid gap-1">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Leading mover
            </div>
            <div className="text-[1.15rem] font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
              {leadMover ? `@${leadMover.account}` : '-'}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              {leadMover ? `${leadMover.delta.toLocaleString('id-ID')} followers bertambah dalam rentang 10 hari.` : 'Belum ada pergerakan yang bisa dihitung.'}
            </div>
          </div>
          <div className="grid gap-1">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Tracked accounts
            </div>
            <div className="text-[1.15rem] font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
              {data.series.length} akun
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              Garis yang sama dipakai untuk membaca jarak pertumbuhan brand dan kompetitor secara konsisten.
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200/80 bg-white/78 p-3 shadow-[0_24px_60px_-46px_rgba(15,23,42,0.24)] dark:border-white/10 dark:bg-slate-950/42 sm:p-4">
        <div className="h-[300px] w-full sm:h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.followerTrend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
              <XAxis dataKey="date" stroke={chartAxisColor} fontSize={12} />
              <YAxis stroke={chartAxisColor} fontSize={12} />
              <Tooltip contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} />
              <Legend wrapperStyle={chartLegendStyle} />
              {data.series.map((series) => (
                <Line
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  name={`@${series.key}`}
                  stroke={series.color}
                  strokeWidth={2.4}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </article>
  )
}
