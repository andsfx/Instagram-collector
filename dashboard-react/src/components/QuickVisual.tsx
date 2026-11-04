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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function FigurePanel({
  title,
  caption,
  children,
  muted,
  wide,
}: {
  title: string
  caption?: string
  children: React.ReactNode
  muted?: boolean
  wide?: boolean
}) {
  return (
    <Card className={wide ? 'md:col-span-2' : muted ? 'bg-muted/40' : undefined}>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
        {caption ? <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{caption}</p> : null}
      </CardContent>
    </Card>
  )
}

const MAX_CHART_POINTS = 90

export function QuickVisual({ data }: { data: QuickVisualData }) {
  if (!data.followerTrend.length || !data.series.length) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="md:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm">Visual analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Belum ada data chart yang tersedia.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const firstSeriesKey = data.series[0]?.key
  const followerTrend = downsampleData(data.followerTrend, MAX_CHART_POINTS, firstSeriesKey)
  const engagementTrend = downsampleData(data.engagementTrend, MAX_CHART_POINTS, firstSeriesKey)
  const projectionTrend = downsampleData(data.projectionTrend, MAX_CHART_POINTS, firstSeriesKey ? `${firstSeriesKey}_actual` : undefined)

  const lastTrendPoint = followerTrend[followerTrend.length - 1]
  const leadValue = lastTrendPoint?.[firstSeriesKey]
  const leadAccount = firstSeriesKey

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="bg-muted/60 md:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm">Tren pengikut{leadAccount ? ` · @${leadAccount}` : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-4xl font-semibold tabular-nums tracking-tight break-words md:text-5xl">
              {typeof leadValue === 'number' ? formatInteger(leadValue) : '—'}
            </p>
            <p className="mt-2.5 max-w-[46ch] text-xs leading-relaxed text-muted-foreground">
              Enam figure di bawah memecah tren, ranking, share, profil radar, dan proyeksi. Semua warna series
              data-only, satu signal ink.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FigurePanel title="Follower trend (10d)" caption="Perkembangan jumlah pengikut 10 hari terakhir lintas akun terpantau.">
          <div className="chart-wrap chart-scroll-shell">
            <div className="chart-fill chart-min-wide">
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

        <FigurePanel title="Engagement rate ranking" caption="Urutan akun berdasarkan engagement rate terbaru." muted>
          <div className="chart-wrap chart-wrap-compact chart-scroll-shell">
            <div className="chart-fill chart-min-sm">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.engagementRanking} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis type="number" stroke={chartAxisColor} fontSize={11} />
                  <YAxis type="category" dataKey="account" width={140} stroke={chartAxisColor} fontSize={10} />
                  <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} />
                  <Bar dataKey="engagementRate" fill="var(--primary)" radius={0} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </FigurePanel>

        <FigurePanel title="Follower share" caption="Porsi jumlah pengikut setiap akun terhadap total.">
          <div className="chart-wrap chart-wrap-compact">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.followerShare} dataKey="followers" nameKey="account" innerRadius={48} outerRadius={80} paddingAngle={1}>
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

        <FigurePanel title="Radar comparison" caption="Profil metrik antar akun dalam satu bidang perbandingan." muted>
          <div className="chart-wrap chart-scroll-shell">
            <div className="chart-fill chart-min-sm">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data.radarComparison}>
                  <PolarGrid stroke={chartGridColor} />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: chartAxisColor, fontSize: 11 }} />
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

        <FigurePanel title="Engagement rate trend" caption="Perubahan engagement rate harian pada jendela terpantau.">
          <div className="chart-wrap chart-scroll-shell">
            <div className="chart-fill chart-min-wide">
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

        <FigurePanel title="Follower projection (30d)" caption={data.projectionNote} muted>
          <div className="chart-wrap chart-scroll-shell">
            <div className="chart-fill chart-min-wide">
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
