import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { QuickVisualData } from '../data/selectors'
import { SectionCard } from './ui'

const chartAxisColor = 'var(--chart-axis)'
const chartGridColor = 'var(--chart-grid)'
const chartTooltipStyle = { backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: '12px', color: 'var(--text)' }
const chartLabelStyle = { color: 'var(--text)' }
const chartItemStyle = { color: 'var(--text)' }
const chartLegendStyle = { color: 'var(--text-muted)' }

function ChartCard({
  title,
  description,
  children,
  wide = false,
  hero = false,
  quiet = false,
}: {
  title: string
  description: string
  children: React.ReactNode
  wide?: boolean
  hero?: boolean
  quiet?: boolean
}) {
  return (
    <article
      className={[
        wide ? 'xl:col-span-2' : '',
        'grid gap-4 rounded-[26px] border p-5 shadow-panel-sm',
        hero
          ? 'border-[color:color-mix(in_srgb,var(--brand)_14%,var(--border))] bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--brand-soft-2)_44%,transparent),transparent_34%),linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_58%,var(--panel)),var(--panel))]'
          : quiet
            ? 'border-[color:color-mix(in_srgb,var(--border)_88%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_92%,transparent),color-mix(in_srgb,var(--panel-muted)_72%,transparent))]'
            : 'border-[color:color-mix(in_srgb,var(--brand)_10%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_96%,var(--brand-soft)_4%),var(--panel))]',
      ].join(' ')}
    >
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
    <SectionCard eyebrow="Growth Visual" title="Visual pembuka untuk membaca arah pertumbuhan" description="Chapter ini dipadatkan agar pembaca menangkap proyeksi, momentum followers, dan ranking engagement terlebih dahulu sebelum masuk ke detail perbandingan lain.">
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard wide hero title="Projection trend" description="Proyeksi followers jangka pendek berdasarkan tren linear sederhana, untuk membuka visual suite dengan satu sinyal arah yang paling strategis.">
          <div className="w-full overflow-x-auto"><div className="h-[340px] min-w-full mobile:min-w-[620px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.projectionTrend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} /><XAxis dataKey="date" stroke={chartAxisColor} fontSize={12} /><YAxis stroke={chartAxisColor} fontSize={12} /><Tooltip contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} /><Legend wrapperStyle={chartLegendStyle} />{data.series.map((series) => <Area key={`${series.key}-actual`} type="monotone" dataKey={`${series.key}_actual`} name={`@${series.key}`} stroke={series.color} fill={series.color} fillOpacity={0.08} />)}{data.series.map((series) => <Line key={`${series.key}-projection`} type="monotone" dataKey={`${series.key}_projection`} name={`@${series.key} (proyeksi)`} stroke={series.color} strokeDasharray="5 5" dot={false} connectNulls />)}</AreaChart></ResponsiveContainer></div></div>
          <div className="text-[0.92rem] leading-[1.6] text-text-muted">{data.projectionNote}</div>
        </ChartCard>
        <ChartCard title="Tren followers 10 hari terakhir" description="Membantu membaca momentum tanpa harus membuka tabel histori harian."><div className="w-full overflow-x-auto"><div className="h-[260px] min-w-full mobile:min-w-[460px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.followerTrend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} /><XAxis dataKey="date" stroke={chartAxisColor} fontSize={12} /><YAxis stroke={chartAxisColor} fontSize={12} /><Tooltip contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} /><Legend wrapperStyle={chartLegendStyle} />{data.series.map((series) => <Line key={series.key} type="monotone" dataKey={series.key} stroke={series.color} strokeWidth={2.2} dot={false} activeDot={{ r: 4 }} />)}</LineChart></ResponsiveContainer></div></div></ChartCard>
        <ChartCard title="Engagement rate ranking" description="Bar chart memudahkan membandingkan kategori yang sudah terurut."><div className="w-full overflow-x-auto"><div className="h-[260px] min-w-full mobile:min-w-[460px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.engagementRanking} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} /><XAxis type="number" stroke={chartAxisColor} fontSize={12} /><YAxis type="category" dataKey="account" width={130} stroke={chartAxisColor} fontSize={12} /><Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} /><Bar dataKey="engagementRate" fill="var(--brand)" radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer></div></div></ChartCard>
      </div>
      <div className="grid gap-4 rounded-[26px] border border-[color:color-mix(in_srgb,var(--border)_84%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_74%,transparent),color-mix(in_srgb,var(--panel-muted)_84%,transparent))] p-5 max-[720px]:gap-3.5 max-[720px]:p-4">
        <div className="grid gap-1.5">
          <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-text-soft">Supplementary visuals</div>
          <p className="m-0 max-w-[60ch] text-[0.92rem] leading-[1.6] text-text-muted max-[720px]:text-[0.88rem]">
            Visual berikut tetap dipertahankan sebagai lapisan kedua untuk membaca distribusi audiens, profil akun, dan kualitas interaksi secara lebih lengkap.
          </p>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          <ChartCard quiet title="Share of followers" description="Distribusi audiens antar akun."><div className="h-[200px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.followerShare} dataKey="followers" nameKey="account" innerRadius={58} outerRadius={84} paddingAngle={2}>{data.followerShare.map((entry) => <Cell key={entry.account} fill={entry.fill} />)}</Pie><Tooltip formatter={(value: number) => value.toLocaleString('id-ID')} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} /><Legend wrapperStyle={chartLegendStyle} /></PieChart></ResponsiveContainer></div></ChartCard>
          <ChartCard quiet title="Radar comparison" description="Profil akun relatif terhadap pemimpin metrik."><div className="w-full overflow-x-auto"><div className="h-[230px] min-w-full mobile:min-w-[420px]"><ResponsiveContainer width="100%" height="100%"><RadarChart data={data.radarComparison}><PolarGrid stroke="var(--chart-grid)" /><PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />{data.series.map((series) => <Radar key={series.key} name={`@${series.key}`} dataKey={series.key} stroke={series.color} fill={series.color} fillOpacity={0.12} />)}<Legend wrapperStyle={chartLegendStyle} /><Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} /></RadarChart></ResponsiveContainer></div></div></ChartCard>
          <ChartCard quiet title="Engagement trend" description="Konsistensi kualitas interaksi dari waktu ke waktu."><div className="w-full overflow-x-auto"><div className="h-[230px] min-w-full mobile:min-w-[420px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.engagementTrend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} /><XAxis dataKey="date" stroke={chartAxisColor} fontSize={11} /><YAxis stroke={chartAxisColor} fontSize={11} /><Tooltip formatter={(value) => typeof value === 'number' ? `${value.toFixed(2)}%` : '-'} contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={chartItemStyle} /><Legend wrapperStyle={chartLegendStyle} />{data.series.map((series) => <Line key={series.key} type="monotone" dataKey={series.key} stroke={series.color} strokeWidth={2} dot={false} connectNulls />)}</LineChart></ResponsiveContainer></div></div></ChartCard>
        </div>
      </div>
    </SectionCard>
  )
}
