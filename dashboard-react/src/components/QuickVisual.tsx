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
import { chartAxisColor, chartGridColor, chartItemStyle, chartLabelStyle, chartLegendStyle, chartTooltipStyle } from './chart-theme'
import { EmptyState, SectionCard } from './ui'

function ChartCard({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-sm)] ${wide ? 'sm:col-span-2' : ''}`}>
      <div className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[var(--text-soft)]">{title}</div>
      {children}
    </div>
  )
}

export function QuickVisual({ data }: { data: QuickVisualData }) {
  if (!data.followerTrend.length || !data.series.length) {
    return (
      <SectionCard eyebrow="Charts" title="Visual analytics">
        <EmptyState>Belum ada data chart yang tersedia.</EmptyState>
      </SectionCard>
    )
  }
  return (
    <SectionCard eyebrow="Charts" title="Visual analytics">
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Follower Trend */}
        <ChartCard title="Follower Trend (10d)" wide>
          <div className="h-[260px] w-full overflow-x-auto">
            <div className="h-full min-w-[480px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.followerTrend} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
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
        </ChartCard>

        {/* ER Ranking Bar */}
        <ChartCard title="Engagement Rate Ranking">
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
        </ChartCard>

        {/* Follower Share Pie */}
        <ChartCard title="Follower Share">
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.followerShare} dataKey="followers" nameKey="account" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {data.followerShare.map((e) => (
                    <Cell key={e.account} fill={e.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => v.toLocaleString('id-ID')} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} />
                <Legend wrapperStyle={chartLegendStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Radar Comparison */}
        <ChartCard title="Radar Comparison">
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
        </ChartCard>

        {/* Engagement Trend */}
        <ChartCard title="Engagement Rate Trend" wide>
          <div className="h-[260px] w-full overflow-x-auto">
            <div className="h-full min-w-[480px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.engagementTrend} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
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
        </ChartCard>

        {/* Projection */}
        <ChartCard title="Follower Projection (30d)" wide>
          <div className="h-[280px] w-full overflow-x-auto">
            <div className="h-full min-w-[480px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.projectionTrend} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
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
          {data.projectionNote ? <div className="mt-2 text-[11px] text-[var(--text-soft)]">{data.projectionNote}</div> : null}
        </ChartCard>
      </div>
    </SectionCard>
  )
}