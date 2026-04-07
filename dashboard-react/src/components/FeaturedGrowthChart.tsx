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
    <article className="grid gap-5 rounded-[2rem] border border-[color:color-mix(in_srgb,var(--brand)_16%,white)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_18%,white),rgba(255,255,255,0.94))] p-5 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.32)] dark:border-[color:color-mix(in_srgb,var(--brand)_20%,transparent)] dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.76),rgba(15,23,42,0.54))] sm:p-6 lg:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)] lg:items-end lg:gap-7">
      <div className="grid gap-5">
        <div className="grid gap-2">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Growth comparison
          </div>
          <h2 className="font-display text-[clamp(1.65rem,1.3rem+0.7vw,2.35rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-slate-950 dark:text-white">
            Tren followers 10 hari terakhir sebagai pembuka narasi pertumbuhan.
          </h2>
          <p className="max-w-[40ch] text-[0.98rem] leading-7 text-slate-600 dark:text-slate-300">
            Chapter ini dibuka dengan pergerakan audiens harian agar pembaca langsung melihat momentum brand dan pesaing sebelum turun ke leaderboard teknis.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-[1.4rem] border border-slate-200/85 bg-white/90 px-4 py-3 dark:border-white/10 dark:bg-white/5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Leading mover
            </div>
            <div className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
              {leadMover ? `@${leadMover.account}` : '-'}
            </div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {leadMover ? `${leadMover.delta.toLocaleString('id-ID')} followers bertambah dalam rentang 10 hari.` : 'Belum ada pergerakan yang bisa dihitung.'}
            </div>
          </div>
          <div className="rounded-[1.4rem] border border-slate-200/85 bg-white/90 px-4 py-3 dark:border-white/10 dark:bg-white/5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Tracked accounts
            </div>
            <div className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
              {data.series.length} akun
            </div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Garis yang sama dipakai untuk membaca jarak pertumbuhan brand dan kompetitor secara konsisten.
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.7rem] border border-white/70 bg-white/92 p-3 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.42)] dark:border-white/10 dark:bg-slate-950/62 sm:p-4">
        <div className="h-[280px] w-full sm:h-[340px]">
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
