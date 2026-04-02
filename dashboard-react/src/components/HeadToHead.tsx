import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { type HeadToHeadMetric, getHeadToHeadData, getHeadToHeadDefaults, resolveHeadToHeadPreset } from '../data/selectors'
import type { DashboardRecord } from '../data/types'
import { EmptyState, SectionCard } from './ui'

const chartAxisColor = 'var(--chart-axis)'
const chartGridColor = 'var(--chart-grid)'
const chartTooltipStyle = { backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: '12px', color: 'var(--text)' }

export function HeadToHead({ data }: { data: DashboardRecord }) {
  const defaults = useMemo(() => getHeadToHeadDefaults(data), [data])
  const [accountA, setAccountA] = useState(defaults.accountA)
  const [accountB, setAccountB] = useState(defaults.accountB)
  const [metric, setMetric] = useState<HeadToHeadMetric>(defaults.metric)
  const view = useMemo(() => getHeadToHeadData(data, accountA, accountB, metric), [accountA, accountB, data, metric])

  return (
    <SectionCard eyebrow="Head-to-Head" title="Bandingkan dua akun pada metrik yang paling penting" description="Migrasi ini mempertahankan pola perbandingan cepat legacy, tetapi dengan struktur kontrol dan visual yang lebih rapi.">
      <div className="grid gap-[14px] lg:grid-cols-3">
        <label className="grid gap-2"><span className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">Akun A</span><select className="min-h-[42px] rounded-xl border border-border bg-panel px-3.5 py-2.5 text-text" value={accountA} onChange={(event) => setAccountA(event.target.value)}>{data.accounts.map((account) => <option key={account} value={account}>@{account}</option>)}</select></label>
        <label className="grid gap-2"><span className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">Akun B</span><select className="min-h-[42px] rounded-xl border border-border bg-panel px-3.5 py-2.5 text-text" value={accountB} onChange={(event) => setAccountB(event.target.value)}>{data.accounts.map((account) => <option key={account} value={account}>@{account}</option>)}</select></label>
        <label className="grid gap-2">
          <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">Preset</span>
          <select className="min-h-[42px] rounded-xl border border-border bg-panel px-3.5 py-2.5 text-text" defaultValue="" onChange={(event) => { const resolved = resolveHeadToHeadPreset(data, event.target.value, accountA, accountB); setAccountA(resolved.accountA); setAccountB(resolved.accountB); event.target.value = '' }}>
            <option value="" disabled>Pilih preset</option>
            {view.presets.map((preset) => <option key={preset.value} value={preset.value}>{preset.label}</option>)}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        {view.metricOptions.map((option) => (
          <button key={option.value} type="button" className={`inline-flex items-center rounded-full border px-3.5 py-2.5 text-sm font-bold transition-colors ${metric === option.value ? 'border-[color:color-mix(in_srgb,var(--brand)_24%,var(--border))] bg-brand-soft text-brand' : 'border-border bg-panel text-text-muted'}`} aria-pressed={metric === option.value} onClick={() => setMetric(option.value)}>
            {option.label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 desktop:grid-cols-[minmax(320px,0.95fr)_minmax(0,1.05fr)]">
        <article className="grid gap-4 rounded-panel-md border border-[color:color-mix(in_srgb,var(--brand)_18%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_78%,var(--panel)),var(--panel))] p-[22px] shadow-panel-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div><div className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">Quick Verdict</div><div className="mt-1.5 font-display text-[clamp(1.12rem,1rem+0.55vw,1.55rem)] leading-[1.15] tracking-[-0.02em] text-text">@{view.accountA} vs @{view.accountB}</div></div>
            <div className="flex flex-wrap gap-2"><span className="inline-flex rounded-full bg-[linear-gradient(180deg,var(--brand-soft),color-mix(in_srgb,var(--brand-soft-2)_72%,var(--panel)))] px-2.5 py-1.5 text-xs font-bold text-brand">@{view.accountA}: {view.winsA}</span><span className="inline-flex rounded-full bg-warning-soft px-2.5 py-1.5 text-xs font-bold text-warning">@{view.accountB}: {view.winsB}</span></div>
          </div>
          <p className="text-[0.95rem] leading-[1.65] text-text-muted">{view.verdict}</p>
          <p className="text-[0.92rem] leading-[1.6] text-text-muted">{view.subverdict}</p>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-[color:color-mix(in_srgb,var(--brand-soft)_70%,var(--panel))]" aria-label="Distribusi kemenangan per metrik"><div className="h-full bg-[linear-gradient(90deg,var(--brand),var(--warning))]" style={{ width: `${Math.max((view.winsA / Math.max(view.winsA + view.winsB, 1)) * 100, view.winsA ? 18 : 0)}%` }} /><div className="h-full bg-[linear-gradient(90deg,var(--success),color-mix(in_srgb,var(--success)_55%,var(--panel)))]" style={{ width: `${Math.max((view.winsB / Math.max(view.winsA + view.winsB, 1)) * 100, view.winsB ? 18 : 0)}%` }} /></div>
          <div className="text-[0.92rem] leading-[1.6] text-text-muted">Selisih followers saat ini: {view.gapFollowers.toLocaleString('id-ID')}</div>
        </article>
        <article className="rounded-panel-md border border-[color:color-mix(in_srgb,var(--brand)_12%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_94%,var(--brand-soft)_6%),var(--panel))] p-[18px] shadow-panel-sm">
          <div className="grid gap-0 border-b border-border pb-3 text-[0.8rem] font-extrabold uppercase tracking-[0.08em] text-text-soft desktop:grid-cols-[1fr_minmax(120px,0.72fr)_1fr]"><span>@{view.accountA}</span><span className="text-center">Metrik</span><span className="text-right">@{view.accountB}</span></div>
          <div className="grid">{view.comparisonRows.map((row) => <div key={row.label} className="grid gap-2 border-b border-border py-3 desktop:grid-cols-[1fr_minmax(120px,0.72fr)_1fr] desktop:items-center"><div className={`font-bold ${row.rawA > row.rawB ? 'text-success' : 'text-text'}`}>{row.valueA}</div><div className="text-[0.92rem] text-text-muted desktop:text-center">{row.label}</div><div className={`font-bold desktop:text-right ${row.rawB > row.rawA ? 'text-success' : 'text-text'}`}>{row.valueB}</div></div>)}</div>
        </article>
      </div>
      <article className="grid gap-4 rounded-panel-md border border-[color:color-mix(in_srgb,var(--brand)_14%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_92%,var(--brand-soft)_8%),var(--panel))] p-[18px] shadow-panel-sm">
        <div className="grid gap-1.5"><h3 className="font-display text-[clamp(1.12rem,1rem+0.55vw,1.55rem)] leading-[1.15] tracking-[-0.02em] text-text">Trend {view.trendTitle}</h3><p className="text-[0.95rem] text-text-muted">{view.trendDescription}</p></div>
        {view.hasTrend ? <div className="w-full overflow-x-auto"><div className="h-[280px] min-w-full mobile:min-w-[540px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={view.trendData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} /><XAxis dataKey="date" stroke={chartAxisColor} fontSize={12} /><YAxis stroke={chartAxisColor} fontSize={12} /><Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: 'var(--text)' }} itemStyle={{ color: 'var(--text)' }} /><Line type="monotone" dataKey={view.accountA} stroke="var(--brand)" strokeWidth={2.4} dot={false} /><Line type="monotone" dataKey={view.accountB} stroke="var(--success)" strokeWidth={2.4} dot={false} /></LineChart></ResponsiveContainer></div></div> : <EmptyState>Trend historis untuk metrik ini belum tersedia secara granular, jadi perbandingan difokuskan ke snapshot saat ini.</EmptyState>}
      </article>
    </SectionCard>
  )
}
