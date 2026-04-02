import { useMemo, useState } from 'react'
import {
  CartesianGrid,
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
import { SectionCard } from './ui'

const chartAxisColor = 'var(--chart-axis)'
const chartGridColor = 'var(--chart-grid)'
const chartTooltipStyle = {
  backgroundColor: 'var(--chart-tooltip-bg)',
  border: '1px solid var(--chart-tooltip-border)',
  borderRadius: '12px',
  color: 'var(--text)',
}

export function HeadToHead({ data }: { data: DashboardRecord }) {
  const defaults = useMemo(() => getHeadToHeadDefaults(data), [data])
  const [accountA, setAccountA] = useState(defaults.accountA)
  const [accountB, setAccountB] = useState(defaults.accountB)
  const [metric, setMetric] = useState<HeadToHeadMetric>(defaults.metric)

  const view = useMemo(() => getHeadToHeadData(data, accountA, accountB, metric), [accountA, accountB, data, metric])

  return (
    <SectionCard
      eyebrow="Head-to-Head"
      title="Bandingkan dua akun pada metrik yang paling penting"
      description="Migrasi ini mempertahankan pola perbandingan cepat legacy, tetapi dengan struktur kontrol dan visual yang lebih rapi."
    >
      <div className="controls-row">
        <label className="control-field">
          <span className="stat-label">Akun A</span>
          <select value={accountA} onChange={(event) => setAccountA(event.target.value)}>
            {data.accounts.map((account) => <option key={account} value={account}>@{account}</option>)}
          </select>
        </label>
        <label className="control-field">
          <span className="stat-label">Akun B</span>
          <select value={accountB} onChange={(event) => setAccountB(event.target.value)}>
            {data.accounts.map((account) => <option key={account} value={account}>@{account}</option>)}
          </select>
        </label>
        <label className="control-field">
          <span className="stat-label">Preset</span>
          <select
            defaultValue=""
            onChange={(event) => {
              const resolved = resolveHeadToHeadPreset(data, event.target.value, accountA, accountB)
              setAccountA(resolved.accountA)
              setAccountB(resolved.accountB)
              event.target.value = ''
            }}
          >
            <option value="" disabled>Pilih preset</option>
            {view.presets.map((preset) => <option key={preset.value} value={preset.value}>{preset.label}</option>)}
          </select>
        </label>
      </div>

      <div className="chip-row">
        {view.metricOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`metric-chip ${metric === option.value ? 'is-active' : ''}`}
            aria-pressed={metric === option.value}
            onClick={() => setMetric(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="h2h-layout">
        <article className="insight-card">
          <div className="split-row">
            <div>
              <div className="stat-label">Quick Verdict</div>
              <div className="section-title">@{view.accountA} vs @{view.accountB}</div>
            </div>
            <div className="chip-row">
              <span className="chip chip-brand">@{view.accountA}: {view.winsA}</span>
              <span className="chip chip-warning">@{view.accountB}: {view.winsB}</span>
            </div>
          </div>
          <p className="section-description">{view.verdict}</p>
          <p className="helper-copy">{view.subverdict}</p>
          <div className="score-track" aria-label="Distribusi kemenangan per metrik">
            <div className="score-side is-a" style={{ width: `${Math.max((view.winsA / Math.max(view.winsA + view.winsB, 1)) * 100, view.winsA ? 18 : 0)}%` }} />
            <div className="score-side is-b" style={{ width: `${Math.max((view.winsB / Math.max(view.winsA + view.winsB, 1)) * 100, view.winsB ? 18 : 0)}%` }} />
          </div>
          <div className="helper-copy">Selisih followers saat ini: {view.gapFollowers.toLocaleString('id-ID')}</div>
        </article>

        <article className="comparison-card">
          <div className="comparison-head">
            <span>@{view.accountA}</span>
            <span>Metrik</span>
            <span>@{view.accountB}</span>
          </div>
          <div className="comparison-list">
            {view.comparisonRows.map((row) => (
              <div key={row.label} className="comparison-row">
                <div className={`comparison-value ${row.rawA > row.rawB ? 'is-win' : ''}`}>{row.valueA}</div>
                <div className="comparison-label">{row.label}</div>
                <div className={`comparison-value ${row.rawB > row.rawA ? 'is-win' : ''}`}>{row.valueB}</div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="chart-card">
        <div className="section-heading">
          <h3 className="section-title">Trend {view.trendTitle}</h3>
          <p className="section-description">{view.trendDescription}</p>
        </div>
        {view.hasTrend ? (
          <div className="chart-scroll-shell">
            <div className="chart-wrap chart-min-wide">
              <ResponsiveContainer width="100%" height="100%">
              <LineChart data={view.trendData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis dataKey="date" stroke={chartAxisColor} fontSize={12} />
                <YAxis stroke={chartAxisColor} fontSize={12} />
                <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: 'var(--text)' }} itemStyle={{ color: 'var(--text)' }} />
                <Line type="monotone" dataKey={view.accountA} stroke="#2152d9" strokeWidth={2.4} dot={false} />
                <Line type="monotone" dataKey={view.accountB} stroke="#e1306c" strokeWidth={2.4} dot={false} />
              </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="empty-state">Trend historis untuk metrik ini belum tersedia secara granular, jadi perbandingan difokuskan ke snapshot saat ini.</div>
        )}
      </article>
    </SectionCard>
  )
}
