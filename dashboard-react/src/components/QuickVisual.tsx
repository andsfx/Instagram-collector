import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { QuickVisualData } from '../data/selectors'
import { SectionCard } from './ui'

const chartAxisColor = 'var(--chart-axis)'
const chartGridColor = 'var(--chart-grid)'
const chartTooltipStyle = { backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: '12px', color: 'var(--text)' }
const chartLabelStyle = { color: 'var(--text)' }
const chartItemStyle = { color: 'var(--text)' }
const chartLegendStyle = { color: 'var(--text-muted)' }

function ChartCard({ title, description, children, wide = false, hero = false }: { title: string; description: string; children: React.ReactNode; wide?: boolean; hero?: boolean }) {
  return (
    <article className={`${wide ? 'xl:col-span-2' : ''} grid gap-4 rounded-[26px] border p-5 shadow-panel-sm ${hero ? 'border-[color:color-mix(in_srgb,var(--brand)_14%,var(--border))] bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--brand-soft-2)_44%,transparent),transparent_34%),linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_58%,var(--panel)),var(--panel))]' : 'border-[color:color-mix(in_srgb,var(--brand)_14%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_94%,var(--brand-soft)_6%),var(--panel))]'}`}>
      <div className="grid gap-1.5">
        <h3 className="font-display text-[clamp(1.12rem,1rem+0.55vw,1.55rem)] leading-[1.15] tracking-[-0.02em] text-text">{title}</h3>
        <p className="text-[0.95rem] text-text-muted">{description}</p>
      </div>
      {children}
    </article>
  )
}

export function QuickVisual({ data }: { data: QuickVisualData }) {
  return (
    <SectionCard eyebrow="Quick Visual" title="Chart suite editorial untuk membaca posisi, kualitas interaksi, dan proyeksi" description="Section ini merangkum beberapa visual utama sekaligus agar tim bisa membaca skala audiens, kualitas engagement, share, profil akun, dan proyeksi jangka pendek dalam satu area analitik yang konsisten.">
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard wide hero title="Projection trend" description="Proyeksi followers jangka pendek berdasarkan tren linear sederhana, untuk membuka visual suite dengan satu sinyal arah yang paling strategis.">
          <div className="w-full overflow-x-auto"><div className="h-[340px] min-w-full mobile:min-w-[720px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.projectionTrend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} /><XAxis dataKey="date" stroke={chartAxisColor} fontSize={12} /><YAxis stroke={chartAxisColor} fontSize={12} /><Tooltip contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} /><Legend wrapperStyle={chartLegendStyle} />{data.series.map((series) => <Area key={`${series.key}-actual`} type="monotone" dataKey={`${series.key}_actual`} name={`@${series.key}`} stroke={series.color} fill={series.color} fillOpacity={0.08} />)}{data.series.map((series) => <Line key={`${series.key}-projection`} type="monotone" dataKey={`${series.key}_projection`} name={`@${series.key} (proyeksi)`} stroke={series.color} strokeDasharray="5 5" dot={false} connectNulls />)}</AreaChart></ResponsiveContainer></div></div>
          <div className="text-[0.92rem] leading-[1.6] text-text-muted">{data.projectionNote}</div>
        </ChartCard>
        <ChartCard title="Tren followers 10 hari terakhir" description="Membantu membaca momentum tanpa harus membuka tabel histori harian."><div className="w-full overflow-x-auto"><div className="h-[280px] min-w-full mobile:min-w-[540px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.followerTrend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} /><XAxis dataKey="date" stroke={chartAxisColor} fontSize={12} /><YAxis stroke={chartAxisColor} fontSize={12} /><Tooltip contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} /><Legend wrapperStyle={chartLegendStyle} />{data.series.map((series) => <Line key={series.key} type="monotone" dataKey={series.key} stroke={series.color} strokeWidth={2.2} dot={false} activeDot={{ r: 4 }} />)}</LineChart></ResponsiveContainer></div></div></ChartCard>
        <ChartCard title="Engagement rate ranking" description="Bar chart memudahkan membandingkan kategori yang sudah terurut."><div className="w-full overflow-x-auto"><div className="h-[280px] min-w-full mobile:min-w-[540px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.engagementRanking} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} /><XAxis type="number" stroke={chartAxisColor} fontSize={12} /><YAxis type="category" dataKey="account" width={130} stroke={chartAxisColor} fontSize={12} /><Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} /><Bar dataKey="engagementRate" fill="var(--brand)" radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer></div></div></ChartCard>
        <ChartCard title="Share of followers" description="Pie chart untuk membaca distribusi audiens antar akun secara cepat."><div className="h-[220px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.followerShare} dataKey="followers" nameKey="account" innerRadius={62} outerRadius={92} paddingAngle={2}>{data.followerShare.map((entry) => <Cell key={entry.account} fill={entry.fill} />)}</Pie><Tooltip formatter={(value: number) => value.toLocaleString('id-ID')} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} /><Legend wrapperStyle={chartLegendStyle} /></PieChart></ResponsiveContainer></div></ChartCard>
        <ChartCard title="Radar comparison" description="Membandingkan profil akun relatif terhadap pemimpin masing-masing metrik."><div className="w-full overflow-x-auto"><div className="h-[280px] min-w-full mobile:min-w-[540px]"><ResponsiveContainer width="100%" height="100%"><RadarChart data={data.radarComparison}><PolarGrid stroke="var(--chart-grid)" /><PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--chart-axis)', fontSize: 12 }} />{data.series.map((series) => <Radar key={series.key} name={`@${series.key}`} dataKey={series.key} stroke={series.color} fill={series.color} fillOpacity={0.12} />)}<Legend wrapperStyle={chartLegendStyle} /><Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} /></RadarChart></ResponsiveContainer></div></div></ChartCard>
        <ChartCard title="Engagement trend" description="Melihat kualitas interaksi dari waktu ke waktu untuk menguji konsistensi performa."><div className="w-full overflow-x-auto"><div className="h-[280px] min-w-full mobile:min-w-[540px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.engagementTrend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} /><XAxis dataKey="date" stroke={chartAxisColor} fontSize={12} /><YAxis stroke={chartAxisColor} fontSize={12} /><Tooltip formatter={(value) => typeof value === 'number' ? `${value.toFixed(2)}%` : '-'} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} /><Legend wrapperStyle={chartLegendStyle} />{data.series.map((series) => <Line key={series.key} type="monotone" dataKey={series.key} stroke={series.color} strokeWidth={2} dot={false} connectNulls />)}</LineChart></ResponsiveContainer></div></div></ChartCard>
      </div>
    </SectionCard>
  )
}
