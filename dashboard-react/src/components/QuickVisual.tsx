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
import { SectionCard } from './ui'

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

export function QuickVisual({ data }: { data: QuickVisualData }) {
  return (
    <SectionCard
      eyebrow="Quick Visual"
      title="Dua visual inti untuk membaca arah persaingan"
      description="Kita mulai dengan line chart untuk tren followers dan bar chart untuk ranking engagement, sesuai kebutuhan analytics inti dashboard ini."
    >
      <div className="chart-grid">
        <article className="chart-card chart-card-mobile-wide">
          <div className="section-heading">
            <h3 className="section-title">Tren followers 10 hari terakhir</h3>
            <p className="section-description">Membantu membaca momentum tanpa harus membuka tabel histori harian.</p>
          </div>
          <div className="chart-scroll-shell">
            <div className="chart-wrap chart-min-wide">
              <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.followerTrend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
                    stroke={series.color}
                    strokeWidth={2.2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </article>
        <article className="chart-card chart-card-mobile-wide">
          <div className="section-heading">
            <h3 className="section-title">Engagement rate ranking</h3>
            <p className="section-description">Bar chart memudahkan membandingkan kategori yang sudah terurut.</p>
          </div>
          <div className="chart-scroll-shell">
            <div className="chart-wrap chart-min-wide">
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.engagementRanking} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis type="number" stroke={chartAxisColor} fontSize={12} />
                <YAxis type="category" dataKey="account" width={130} stroke={chartAxisColor} fontSize={12} />
                <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} />
                <Bar dataKey="engagementRate" fill="var(--brand)" radius={[0, 8, 8, 0]} />
              </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </article>
        <article className="chart-card">
          <div className="section-heading">
            <h3 className="section-title">Share of followers</h3>
            <p className="section-description">Doughnut legacy diganti pie chart untuk memperlihatkan distribusi audiens antar akun.</p>
          </div>
          <div className="chart-wrap chart-wrap-compact">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.followerShare} dataKey="followers" nameKey="account" innerRadius={62} outerRadius={92} paddingAngle={2}>
                  {data.followerShare.map((entry) => (
                    <Cell key={entry.account} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => value.toLocaleString('id-ID')} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} />
                <Legend wrapperStyle={chartLegendStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="chart-card">
          <div className="section-heading">
            <h3 className="section-title">Radar comparison</h3>
            <p className="section-description">Membandingkan profil akun relatif terhadap pemimpin masing-masing metrik.</p>
          </div>
          <div className="chart-scroll-shell">
            <div className="chart-wrap chart-min-wide">
              <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data.radarComparison}>
                <PolarGrid stroke="var(--chart-grid)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--chart-axis)', fontSize: 12 }} />
                {data.series.map((series) => (
                  <Radar
                    key={series.key}
                    name={`@${series.key}`}
                    dataKey={series.key}
                    stroke={series.color}
                    fill={series.color}
                    fillOpacity={0.12}
                  />
                ))}
                <Legend wrapperStyle={chartLegendStyle} />
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} />
              </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </article>
        <article className="chart-card chart-card-mobile-wide">
          <div className="section-heading">
            <h3 className="section-title">Engagement trend</h3>
            <p className="section-description">Versi React dari grafik ER trend legacy untuk melihat kualitas interaksi dari waktu ke waktu.</p>
          </div>
          <div className="chart-scroll-shell">
            <div className="chart-wrap chart-min-wide">
              <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.engagementTrend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis dataKey="date" stroke={chartAxisColor} fontSize={12} />
                <YAxis stroke={chartAxisColor} fontSize={12} />
                <Tooltip formatter={(value) => typeof value === 'number' ? `${value.toFixed(2)}%` : '-'} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} />
                <Legend wrapperStyle={chartLegendStyle} />
                {data.series.map((series) => (
                  <Line key={series.key} type="monotone" dataKey={series.key} stroke={series.color} strokeWidth={2} dot={false} connectNulls />
                ))}
              </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </article>
        <article className="chart-card chart-card-wide">
          <div className="section-heading">
            <h3 className="section-title">Projection trend</h3>
            <p className="section-description">Proyeksi followers jangka pendek berdasarkan tren linear sederhana, untuk menggantikan projection chart legacy.</p>
          </div>
          <div className="chart-scroll-shell">
            <div className="chart-wrap chart-wrap-lg chart-min-xl">
              <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.projectionTrend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis dataKey="date" stroke={chartAxisColor} fontSize={12} />
                <YAxis stroke={chartAxisColor} fontSize={12} />
                <Tooltip contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} />
                <Legend wrapperStyle={chartLegendStyle} />
                {data.series.map((series) => (
                  <Area key={`${series.key}-actual`} type="monotone" dataKey={`${series.key}_actual`} name={`@${series.key}`} stroke={series.color} fill={series.color} fillOpacity={0.08} />
                ))}
                {data.series.map((series) => (
                  <Line key={`${series.key}-projection`} type="monotone" dataKey={`${series.key}_projection`} name={`@${series.key} (proyeksi)`} stroke={series.color} strokeDasharray="5 5" dot={false} connectNulls />
                ))}
              </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="helper-copy">{data.projectionNote}</div>
        </article>
      </div>
    </SectionCard>
  )
}
