import { useMemo, useState } from 'react'
import { formatInteger, getDailyMetricsView } from '../data/selectors'
import type { DashboardRecord } from '../data/types'
import { SectionCard } from './ui'

const RANGE_OPTIONS = [7, 14, 30]

function renderDelta(value: number, isBaseline: boolean) {
  if (isBaseline) return <span className="delta-neutral">--</span>
  if (value > 0) return <span className="delta-positive">+{formatInteger.format(value)}</span>
  if (value < 0) return <span className="delta-negative">{formatInteger.format(value)}</span>
  return <span className="delta-neutral">--</span>
}

export function DailyMetrics({ data }: { data: DashboardRecord }) {
  const [selectedAccount, setSelectedAccount] = useState<string>(data.accounts[0] ?? '')
  const [rangeDays, setRangeDays] = useState<number>(7)

  const view = useMemo(() => getDailyMetricsView(data, selectedAccount, rangeDays), [data, rangeDays, selectedAccount])

  return (
    <SectionCard
      eyebrow="Daily Metrics"
      title="Riwayat detail akun per hari"
      description="Section ini sekarang mendekati versi legacy dengan selector akun, rentang waktu, delta harian, dan ringkasan rata-rata maupun total."
      actions={<span className="badge badge-brand">{view.disclosurePill}</span>}
    >
      <div className="daily-toolbar">
        <div className="section-heading daily-toolbar-copy">
          <div className="section-title">{view.disclosureTitle}</div>
          <p className="section-description">{view.disclosureHint}</p>
        </div>
        <div className="daily-toolbar-controls">
          <label className="control-field">
            <span className="stat-label">Pilih akun</span>
            <select value={view.selectedAccount} onChange={(event) => setSelectedAccount(event.target.value)}>
              {view.accounts.map((account) => (
                <option key={account} value={account}>@{account}</option>
              ))}
            </select>
          </label>
          <label className="control-field">
            <span className="stat-label">Rentang</span>
            <select value={rangeDays} onChange={(event) => setRangeDays(Number(event.target.value))}>
              {RANGE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option} hari terakhir</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <article className="daily-card editorial-table-card">
        <div className="split-row">
          <div>
            <div className="stat-label">Akun aktif</div>
            <div className="big-value editorial-value">@{view.selectedAccount}</div>
          </div>
          <span className="badge badge-brand">{rangeDays} hari</span>
        </div>

        <div className="daily-table-wrap">
          <table className="daily-table daily-table-expanded">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th colSpan={2}>Followers</th>
                <th colSpan={2}>Following</th>
                <th colSpan={2}>Posts</th>
              </tr>
            </thead>
            <tbody>
              {view.rows.map((row) => (
                <tr key={row.date}>
                  <td>
                    <div className="daily-date-meta">
                      <div className="daily-date-day">{row.dayLabel}</div>
                      <div className="daily-date-full">{row.fullDateLabel}</div>
                    </div>
                  </td>
                  <td>{renderDelta(row.deltaFollowers, row.isBaseline)}</td>
                  <td className="table-strong">{formatInteger.format(row.followers)}</td>
                  <td>{renderDelta(row.deltaFollowing, row.isBaseline)}</td>
                  <td className="table-strong">{formatInteger.format(row.following)}</td>
                  <td>{renderDelta(row.deltaPosts, row.isBaseline)}</td>
                  <td className="table-strong">{formatInteger.format(row.posts)}</td>
                </tr>
              ))}
              {view.summaryRows.map((row) => (
                <tr key={row.label} className="daily-summary-row">
                  <td>{row.label}</td>
                  <td colSpan={2}>{renderDelta(row.followers, false)}</td>
                  <td colSpan={2}>{renderDelta(row.following, false)}</td>
                  <td colSpan={2}>{renderDelta(row.posts, false)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="daily-mobile-list" aria-hidden="true">
          {view.mobileRows.map((row, index) => (
            <div key={`${row.date}-mobile`} className="daily-mobile-item">
              <div className="daily-mobile-date">{index === 0 ? 'Terbaru' : row.fullDateLabel}</div>
              <div className="daily-mobile-metrics">
                <div className="daily-mobile-row"><span>Followers</span><strong>{formatInteger.format(row.followers)}</strong></div>
                <div className="daily-mobile-row"><span>Delta followers</span><strong>{row.isBaseline ? '--' : `${row.deltaFollowers >= 0 ? '+' : ''}${formatInteger.format(row.deltaFollowers)}`}</strong></div>
                <div className="daily-mobile-row"><span>Following</span><strong>{formatInteger.format(row.following)}</strong></div>
                <div className="daily-mobile-row"><span>Posts</span><strong>{formatInteger.format(row.posts)}</strong></div>
              </div>
            </div>
          ))}
          <div className="daily-mobile-summary">
            Menampilkan 3 observasi terbaru. Ringkasan {rangeDays} hari dan delta lengkap tersedia pada layout desktop/tablet lebar.
          </div>
        </div>
      </article>
    </SectionCard>
  )
}
