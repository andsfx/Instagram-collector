import { useMemo, useState } from 'react'
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
import {
  type HeadToHeadMetric,
  getHeadToHeadData,
  getHeadToHeadDefaults,
  resolveHeadToHeadPreset,
} from '../data/selectors'
import type { DashboardRecord } from '../data/types'
import { chartAxisColor, chartGridColor, chartTooltipStyle } from './chart-theme'
import { SectionCard } from './ui'

export function HeadToHead({ data }: { data: DashboardRecord }) {
  const defaults = useMemo(() => getHeadToHeadDefaults(data), [data])
  const [accountA, setAccountA] = useState(defaults.accountA)
  const [accountB, setAccountB] = useState(defaults.accountB)
  const [metric, setMetric] = useState<HeadToHeadMetric>(defaults.metric)
  const [presetValue, setPresetValue] = useState('')

  const view = useMemo(() => getHeadToHeadData(data, accountA, accountB, metric), [accountA, accountB, data, metric])

  return (
    <SectionCard
      eyebrow="Head-to-Head"
      title="Bandingkan dua akun pada metrik yang paling penting"
    >
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1.5">
          <span className="text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-text-soft">Akun A</span>
          <select
            className="min-h-[44px] rounded-[var(--radius-lg)] border border-[color:color-mix(in_srgb,var(--border)_88%,transparent)] bg-[color:color-mix(in_srgb,var(--panel)_86%,transparent)] px-3.5 py-2.5 text-[0.95rem] text-text"
            value={accountA}
            onChange={(event) => setAccountA(event.target.value)}
          >
            {data.accounts.map((account) => <option key={account} value={account}>@{account}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-text-soft">Akun B</span>
          <select
            className="min-h-[44px] rounded-[var(--radius-lg)] border border-[color:color-mix(in_srgb,var(--border)_88%,transparent)] bg-[color:color-mix(in_srgb,var(--panel)_86%,transparent)] px-3.5 py-2.5 text-[0.95rem] text-text"
            value={accountB}
            onChange={(event) => setAccountB(event.target.value)}
          >
            {data.accounts.map((account) => <option key={account} value={account}>@{account}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-text-soft">Preset</span>
          <select
            className="min-h-[44px] rounded-[var(--radius-lg)] border border-[color:color-mix(in_srgb,var(--border)_88%,transparent)] bg-[color:color-mix(in_srgb,var(--panel)_86%,transparent)] px-3.5 py-2.5 text-[0.95rem] text-text"
            value={presetValue}
            onChange={(event) => {
              const resolved = resolveHeadToHeadPreset(data, event.target.value, accountA, accountB)
              setAccountA(resolved.accountA)
              setAccountB(resolved.accountB)
              setPresetValue('')
            }}
          >
            <option value="" disabled>Pilih preset</option>
            {view.presets.map((preset) => <option key={preset.value} value={preset.value}>{preset.label}</option>)}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {view.metricOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={[
              'inline-flex min-h-[38px] items-center justify-center rounded-full border px-3 py-2 text-[0.84rem] font-semibold transition',
              metric === option.value
                ? 'border-[color:color-mix(in_srgb,var(--brand)_18%,var(--border))] bg-[color:color-mix(in_srgb,var(--panel)_84%,transparent)] text-brand'
                : 'border-[color:color-mix(in_srgb,var(--border)_84%,transparent)] bg-[color:color-mix(in_srgb,var(--panel)_72%,transparent)] text-text-muted hover:border-[color:color-mix(in_srgb,var(--brand)_18%,var(--border))] hover:text-brand',
            ].join(' ')}
            aria-pressed={metric === option.value}
            onClick={() => setMetric(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 border-t border-slate-200/80 pt-6 dark:border-white/10 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-brand">Quick Verdict</div>
            <div className="font-display text-[clamp(1.3rem,1.1rem+0.5vw,1.8rem)] font-semibold leading-[1.04] text-text">
              @{view.accountA} vs @{view.accountB}
            </div>
            <p className="m-0 text-[0.95rem] leading-[1.65] text-text">{view.verdict}</p>
            <p className="m-0 text-[0.92rem] leading-[1.6] text-text-muted">{view.subverdict}</p>
          </div>

          <div className="grid gap-2 border-t border-slate-200/70 pt-4 dark:border-white/10">
            <div className="flex items-center justify-between text-[0.82rem] text-text-soft">
              <span>Distribusi kemenangan per metrik</span>
              <span>Gap followers: {view.gapFollowers.toLocaleString('id-ID')}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[color:color-mix(in_srgb,var(--panel-muted)_78%,transparent)]" aria-label="Distribusi kemenangan per metrik">
              <div className="flex h-full w-full">
                <div className="bg-brand" style={{ width: `${Math.max((view.winsA / Math.max(view.winsA + view.winsB, 1)) * 100, view.winsA ? 18 : 0)}%` }} />
                <div className="bg-warning" style={{ width: `${Math.max((view.winsB / Math.max(view.winsA + view.winsB, 1)) * 100, view.winsB ? 18 : 0)}%` }} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center rounded-full bg-[color:color-mix(in_srgb,var(--brand-soft)_86%,var(--panel))] px-2.5 py-1 text-[0.76rem] font-bold text-brand">
                @{view.accountA}: {view.winsA}
              </span>
              <span className="inline-flex items-center rounded-full bg-warning-soft px-2.5 py-1 text-[0.76rem] font-bold text-warning">
                @{view.accountB}: {view.winsB}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-2 border-t border-slate-200/70 pt-4 dark:border-white/10 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(120px,0.7fr)_minmax(0,1fr)] gap-3 text-[0.76rem] font-extrabold uppercase tracking-[0.08em] text-text-soft">
            <span>@{view.accountA}</span>
            <span className="text-center">Metrik</span>
            <span className="text-right">@{view.accountB}</span>
          </div>
          <div className="grid gap-2">
            {view.comparisonRows.map((row) => (
              <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_minmax(120px,0.7fr)_minmax(0,1fr)] items-center gap-3 border-b border-slate-200/70 py-3 last:border-b-0 dark:border-white/10">
                <div className={`text-sm font-semibold ${row.rawA > row.rawB ? 'text-brand' : 'text-text'}`}>{row.valueA}</div>
                <div className="text-center text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-text-soft">{row.label}</div>
                <div className={`text-right text-sm font-semibold ${row.rawB > row.rawA ? 'text-success' : 'text-text'}`}>{row.valueB}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <article className="grid gap-4 border-t border-slate-200/80 pt-6 dark:border-white/10">
        <div className="grid gap-1.5">
          <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-text-soft">Trend</div>
          <h3 className="font-display text-[clamp(1.14rem,1rem+0.42vw,1.5rem)] font-semibold leading-[1.08] text-text">Trend {view.trendTitle}</h3>
          <p className="text-[0.95rem] text-text-muted">{view.trendDescription}</p>
        </div>
        {view.hasTrend ? (
          <div className="w-full overflow-x-auto">
            <div className="h-[320px] min-w-full mobile:min-w-[680px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={view.trendData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis dataKey="date" stroke={chartAxisColor} fontSize={12} />
                  <YAxis stroke={chartAxisColor} fontSize={12} />
                  <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: 'var(--text)' }} itemStyle={{ color: 'var(--text)' }} />
                  <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: 12 }} />
                  <Line type="monotone" dataKey={view.accountA} stroke="var(--brand)" strokeWidth={2.4} dot={false} />
                  <Line type="monotone" dataKey={view.accountB} stroke="var(--success)" strokeWidth={2.4} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:color-mix(in_srgb,var(--border)_88%,transparent)] bg-[color:color-mix(in_srgb,var(--panel)_76%,transparent)] p-4 text-[0.92rem] text-text-muted">
            Trend historis untuk metrik ini belum tersedia secara granular, jadi perbandingan difokuskan ke snapshot saat ini.
          </div>
        )}
      </article>
    </SectionCard>
  )
}
