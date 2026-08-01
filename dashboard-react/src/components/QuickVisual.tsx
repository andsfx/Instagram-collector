import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { QuickVisualData } from '../data/selectors'
import { downsampleData } from '../data/downsample'
import { formatInteger } from '../utils/formatters'
import { chartAxisColor, chartGridColor, chartItemStyle, chartLabelStyle, chartLegendStyle, chartTooltipStyle } from './chart-theme'
import { EmptyState } from './ui'

function FigurePanel({ title, caption, children, muted }: { title: string; caption?: string; children: React.ReactNode; muted?: boolean }) {
  return (
    <section className={`border border-[var(--border)] p-5 ${muted ? 'bg-[var(--panel-muted)]' : 'bg-[var(--panel)]'}`}>
      <p className="text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">{title}</p>
      <div className="mt-3">{children}</div>
      {caption ? <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{caption}</p> : null}
    </section>
  )
}

const MAX_CHART_POINTS = 90

export function QuickVisual({ data }: { data: QuickVisualData }) {
  if (!data.followerTrend.length || !data.series.length) {
    return (
      <section className="border border-[var(--border)] bg-[var(--panel)] p-6">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">Visual analytics</h2>
        <EmptyState>Belum ada data chart yang tersedia.</EmptyState>
      </section>
    )
  }

  // Downsample time-series data when exceeding threshold
  const firstSeriesKey = data.series[0]?.key
  const followerTrend = downsampleData(data.followerTrend, MAX_CHART_POINTS, firstSeriesKey)
  const engagementTrend = downsampleData(data.engagementTrend, MAX_CHART_POINTS, firstSeriesKey)
  const projectionTrend = downsampleData(data.projectionTrend, MAX_CHART_POINTS, firstSeriesKey ? `${firstSeriesKey}_actual` : undefined)

  const lastTrendPoint = followerTrend[followerTrend.length - 1]
  const leadValue = lastTrendPoint?.[firstSeriesKey]
  const leadAccount = firstSeriesKey

  return (
    <div className="grid gap-6">
      {/* Stat-Led lead */}
      <div className="border-b border-[var(--border)] pb-6">
        <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
          Tren pengikut{leadAccount ? ` · @${leadAccount}` : ''}
        </p>
        <p className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-normal tracking-[-0.03em] text-[var(--text)]">
          {typeof leadValue === 'number' ? formatInteger(leadValue) : '—'}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Follower Trend */}
        <FigurePanel title="Follower Trend (10d)" caption="Perkembangan jumlah pengikut 10 hari terakhir lintas akun terpantau.">
          <div className="h-[260px] w-full overflow-x-auto">
            <div className="h-full min-w-[480px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={followerTrend} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis dataKey="date" stroke={chartAxisColor} fontSize={11} />
                  <YAxis stroke={chartAxisColor} fontSize={11} />
                  <Tooltip contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} />
                  <Legend wrapperStyle={chartLegendStyle} />
                  {data.series.map((s) => (
                    <Line key={s.key} type="monotone" dataKey={s.key} name={`@${s.key}`} stroke={s.color} strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </FigurePanel>

        {/* ER Ranking Bar */}
        <FigurePanel title="Engagement Rate Ranking" caption="Urutan akun berdasarkan engagement rate terbaru." muted>
          <div className="h-[240px] w-full overflow-x-auto">
            <div className="h-full min-w-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.engagementRanking} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis type="number" stroke={chartAxisColor} fontSize={11} />
                  <YAxis type="category" dataKey="account" width={110} stroke={chartAxisColor} fontSize={11} />
                  <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} />
                  <Bar dataKey="engagementRate" fill="var(--brand)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </FigurePanel>

        {/* Follower Share Pie */}
        <FigurePanel title="Follower Share" caption="Porsi jumlah pengikut setiap akun terhadap total.">
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.followerShare} dataKey="followers" nameKey="account" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {data.followerShare.map((e) => (
                    <Cell key={e.account} fill={e.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatInteger(v)} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} />
                <Legend wrapperStyle={chartLegendStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </FigurePanel>

        {/* Radar Comparison */}
        <FigurePanel title="Radar Comparison" caption="Profil metrik antar akun dalam satu bidang perbandingan." muted>
          <div className="h-[240px] w-full overflow-x-auto">
            <div className="h-full min-w-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data.radarComparison}>
                  <PolarGrid stroke="var(--chart-grid)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
                  {data.series.map((s) => (
                    <Radar key={s.key} name={`@${s.key}`} dataKey={s.key} stroke={s.color} fill={s.color} fillOpacity={0.1} />
                  ))}
                  <Legend wrapperStyle={chartLegendStyle} />
                  <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </FigurePanel>

        {/* Engagement Trend */}
        <FigurePanel title="Engagement Rate Trend" caption="Perubahan engagement rate harian pada jendela terpantau.">
          <div className="h-[260px] w-full overflow-x-auto">
            <div className="h-full min-w-[480px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementTrend} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis dataKey="date" stroke={chartAxisColor} fontSize={11} />
                  <YAxis stroke={chartAxisColor} fontSize={11} />
                  <Tooltip formatter={(v) => typeof v === 'number' ? `${v.toFixed(2)}%` : '-'} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} />
                  <Legend wrapperStyle={chartLegendStyle} />
                  {data.series.map((s) => (
                    <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={2} dot={false} connectNulls />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </FigurePanel>

        {/* Projection */}
        <FigurePanel title="Follower Projection (30d)" caption={data.projectionNote} muted>
          <div className="h-[280px] w-full overflow-x-auto">
            <div className="h-full min-w-[480px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionTrend} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis dataKey="date" stroke={chartAxisColor} fontSize={11} />
                  <YAxis stroke={chartAxisColor} fontSize={11} />
                  <Tooltip contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} />
                  <Legend wrapperStyle={chartLegendStyle} />
                  {data.series.map((s) => (
                    <Area key={`${s.key}-a`} type="monotone" dataKey={`${s.key}_actual`} name={`@${s.key}`} stroke={s.color} fill={s.color} fillOpacity={0.06} />
                  ))}
                  {data.series.map((s) => (
                    <Line key={`${s.key}-p`} type="monotone" dataKey={`${s.key}_projection`} name={`@${s.key} proj.`} stroke={s.color} strokeDasharray="5 5" dot={false} connectNulls />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </FigurePanel>
      </div>
    </div>
  )
}
