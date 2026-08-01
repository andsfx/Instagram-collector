import { useMemo } from 'react'
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
  resolveHeadToHeadPreset,
} from '../data/selectors'
import type { DashboardRecord } from '../data/types'
import { downsampleData } from '../data/downsample'
import { formatInteger } from '../utils/formatters'
import { chartAxisColor, chartGridColor, chartTooltipStyle } from './chart-theme'

export function HeadToHead({
  data,
  accountA,
  setAccountA,
  accountB,
  setAccountB,
  metric,
  setMetric,
  presetValue,
  setPresetValue,
}: {
  data: DashboardRecord
  accountA: string
  setAccountA: (v: string) => void
  accountB: string
  setAccountB: (v: string) => void
  metric: HeadToHeadMetric
  setMetric: (v: HeadToHeadMetric) => void
  presetValue: string
  setPresetValue: (v: string) => void
}) {

  const view = useMemo(() => getHeadToHeadData(data, accountA, accountB, metric), [accountA, accountB, data, metric])
  const activeLabel = view.metricOptions.find((option) => option.value === metric)?.label
  const activeRow = view.comparisonRows.find((row) => row.label === activeLabel)
  const leadValueA = activeRow?.valueA ?? `@${view.accountA}`
  const leadValueB = activeRow?.valueB ?? `@${view.accountB}`

  return (
    <div className="grid gap-6">
      {/* Stat-Led scoreboard lead */}
      <div className="border-b border-[var(--border)] pb-6">
        <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
          Head-to-Head{activeLabel ? ` · ${activeLabel}` : ''}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-6">
          <div className="grid gap-1">
            <p className="text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">@{view.accountA}</p>
            <p className="font-display text-[clamp(1.8rem,4vw,3rem)] font-normal tracking-[-0.03em] text-[var(--text)]">
              {leadValueA}
            </p>
          </div>
          <div className="grid gap-1 border-l border-[var(--border)] pl-6">
            <p className="text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">@{view.accountB}</p>
            <p className="font-display text-[clamp(1.8rem,4vw,3rem)] font-normal tracking-[-0.03em] text-[var(--text)]">
              {leadValueB}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="grid gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Akun A</span>
          <select
            className="min-h-[44px] rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-3.5 py-2.5 text-sm text-[var(--text)]"
            value={accountA}
            onChange={(event) => setAccountA(event.target.value)}
          >
            {data.accounts.map((account) => <option key={account} value={account}>@{account}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Akun B</span>
          <select
            className="min-h-[44px] rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-3.5 py-2.5 text-sm text-[var(--text)]"
            value={accountB}
            onChange={(event) => setAccountB(event.target.value)}
          >
            {data.accounts.map((account) => <option key={account} value={account}>@{account}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Preset</span>
          <select
            className="min-h-[44px] rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-3.5 py-2.5 text-sm text-[var(--text)]"
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
              'inline-flex min-h-[38px] items-center justify-center rounded-[var(--radius-sm)] border px-3 py-2 text-sm font-medium transition',
              metric === option.value
                ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]'
                : 'border-[var(--border)] bg-[var(--panel)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]',
            ].join(' ')}
            aria-pressed={metric === option.value}
            onClick={() => setMetric(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Verdict + distribution */}
      <section className="border border-[var(--border)] bg-[var(--panel)] p-6">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">Quick Verdict</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{view.verdict}</p>
        <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">{view.subverdict}</p>

        <div className="mt-4 grid gap-2 border-t border-[var(--border)] pt-4">
          <div className="flex items-center justify-between text-sm text-[var(--text-soft)]">
            <span>Distribusi kemenangan per metrik</span>
            <span>Gap followers: {formatInteger(view.gapFollowers)}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--panel-muted)]" aria-label="Distribusi kemenangan per metrik">
            <div className="flex h-full w-full">
              <div className="bg-[var(--brand)]" style={{ width: `${Math.max((view.winsA / Math.max(view.winsA + view.winsB, 1)) * 100, view.winsA ? 18 : 0)}%` }} />
              <div className="bg-[var(--warning)]" style={{ width: `${Math.max((view.winsB / Math.max(view.winsA + view.winsB, 1)) * 100, view.winsB ? 18 : 0)}%` }} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-medium text-[var(--brand)]">
              @{view.accountA}: {view.winsA}
            </span>
            <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--warning-soft)] px-2.5 py-1 text-xs font-medium text-[var(--warning)]">
              @{view.accountB}: {view.winsB}
            </span>
          </div>
        </div>
      </section>

      {/* Comparison table panel */}
      <section className="border border-[var(--border)] bg-[var(--panel-muted)] p-6">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">Perbandingan per metrik</h2>
        <div className="mt-4">
          <div className="hidden grid-cols-[minmax(0,1fr)_minmax(96px,0.7fr)_minmax(0,1fr)] gap-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] sm:grid">
            <span>@{view.accountA}</span>
            <span className="text-center">Metrik</span>
            <span className="text-right">@{view.accountB}</span>
          </div>
          <div className="grid gap-2">
            {view.comparisonRows.map((row) => (
              <div key={row.label} className="grid gap-1.5 border-t border-[var(--border)] py-3 sm:grid-cols-[minmax(0,1fr)_minmax(96px,0.7fr)_minmax(0,1fr)] sm:items-center sm:gap-3">
                <div className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)] sm:hidden">{row.label}</div>
                <div className={`min-w-0 break-words text-sm font-medium ${row.rawA > row.rawB ? 'text-[var(--brand)]' : 'text-[var(--text)]'}`}>{row.valueA}</div>
                <div className="hidden text-center text-xs font-medium uppercase tracking-wide text-[var(--text-muted)] sm:block">{row.label}</div>
                <div className={`min-w-0 break-words text-sm font-medium sm:text-right ${row.rawB > row.rawA ? 'text-[var(--success)]' : 'text-[var(--text)]'}`}>{row.valueB}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trend figure */}
      <section className="border border-[var(--border)] bg-[var(--panel)] p-6">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">Trend {view.trendTitle}</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{view.trendDescription}</p>
        {view.hasTrend ? (
          <div className="mt-4 w-full overflow-hidden">
            <div className="h-[320px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={downsampleData(view.trendData, 90, view.accountA)} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
          <p className="mt-4 border border-dashed border-[var(--border)] bg-[var(--panel-muted)] p-4 text-sm text-[var(--text-muted)]">
            Trend historis untuk metrik ini belum tersedia secara granular, jadi perbandingan difokuskan ke snapshot saat ini.
          </p>
        )}
      </section>
    </div>
  )
}
