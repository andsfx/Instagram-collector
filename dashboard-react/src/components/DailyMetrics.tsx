import { useMemo } from 'react'
import { formatInteger, getDailyMetricsView } from '../data/selectors'
import type { DashboardRecord } from '../data/types'
import { EmptyState, SectionCard } from './ui'

const RANGE_OPTIONS = [7, 14, 30]

function renderDelta(value: number, isBaseline: boolean) {
  if (isBaseline) return <span style={{ color: 'var(--text-muted)' }}>--</span>
  if (value > 0) return <span style={{ color: 'var(--success)' }}>+{formatInteger.format(value)}</span>
  if (value < 0) return <span style={{ color: 'var(--danger)' }}>{formatInteger.format(value)}</span>
  return <span style={{ color: 'var(--text-muted)' }}>--</span>
}

export function DailyMetrics({
  data,
  selectedAccount,
  setSelectedAccount,
  rangeDays,
  setRangeDays,
}: {
  data: DashboardRecord
  selectedAccount: string
  setSelectedAccount: (v: string) => void
  rangeDays: number
  setRangeDays: (v: number) => void
}) {

  const view = useMemo(() => getDailyMetricsView(data, selectedAccount, rangeDays), [data, rangeDays, selectedAccount])

  return (
    <SectionCard
      eyebrow="Daily Metrics"
      title="Riwayat detail akun per hari"
      actions={<span className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">{view.disclosurePill}</span>}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)] lg:items-end">
        <div className="grid gap-1.5">
          <div className="font-display text-[1.1rem] font-semibold tracking-[-0.03em] text-[var(--text)]">{view.disclosureTitle}</div>
          <p className="text-[0.94rem] leading-7 text-[var(--text-muted)]">{view.disclosureHint}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">Pilih akun</span>
            <select className="rounded-[1rem] border border-[var(--border)] bg-[var(--panel)] px-3.5 py-2.5 text-sm text-[var(--text)] shadow-sm" value={view.selectedAccount} onChange={(event) => setSelectedAccount(event.target.value)}>
              {view.accounts.map((account) => (
                <option key={account} value={account}>@{account}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">Rentang</span>
            <select className="rounded-[1rem] border border-[var(--border)] bg-[var(--panel)] px-3.5 py-2.5 text-sm text-[var(--text)] shadow-sm" value={rangeDays} onChange={(event) => setRangeDays(Number(event.target.value))}>
              {RANGE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option} hari terakhir</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-4 border-t border-[var(--border)] pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[var(--text-soft)]">Akun aktif</div>
            <div className="font-display text-[clamp(1.45rem,1.2rem+0.55vw,1.9rem)] font-semibold tracking-[-0.04em] text-[var(--text)]">@{view.selectedAccount}</div>
          </div>
          <span className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">{rangeDays} hari</span>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          {view.rows.length === 0 ? (
            <EmptyState>Tidak ada data harian untuk rentang ini.</EmptyState>
          ) : (
            <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-[var(--border)] px-4 py-3 text-left text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[var(--text-soft)]">Tanggal</th>
                <th className="border-b border-[var(--border)] px-4 py-3 text-left text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[var(--text-soft)]" colSpan={2}>Followers</th>
                <th className="border-b border-[var(--border)] px-4 py-3 text-left text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[var(--text-soft)]" colSpan={2}>Following</th>
                <th className="border-b border-[var(--border)] px-4 py-3 text-left text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[var(--text-soft)]" colSpan={2}>Posts</th>
              </tr>
            </thead>
            <tbody>
              {view.rows.map((row) => (
                <tr key={row.date}>
                  <td className="border-b border-[var(--border)] px-4 py-3 align-top">
                    <div className="grid gap-0.5">
                      <div className="font-medium text-[var(--text)]">{row.dayLabel}</div>
                      <div className="text-xs text-[var(--text-muted)]">{row.fullDateLabel}</div>
                    </div>
                  </td>
                  <td className="border-b border-[var(--border)] px-4 py-3">{renderDelta(row.deltaFollowers, row.isBaseline)}</td>
                  <td className="border-b border-[var(--border)] px-4 py-3 font-semibold text-[var(--text)]">{formatInteger.format(row.followers)}</td>
                  <td className="border-b border-[var(--border)] px-4 py-3">{renderDelta(row.deltaFollowing, row.isBaseline)}</td>
                  <td className="border-b border-[var(--border)] px-4 py-3 font-semibold text-[var(--text)]">{formatInteger.format(row.following)}</td>
                  <td className="border-b border-[var(--border)] px-4 py-3">{renderDelta(row.deltaPosts, row.isBaseline)}</td>
                  <td className="border-b border-[var(--border)] px-4 py-3 font-semibold text-[var(--text)]">{formatInteger.format(row.posts)}</td>
                </tr>
              ))}
              {view.summaryRows.map((row) => (
                <tr key={row.label}>
                  <td className="px-4 py-3 font-medium text-[var(--text)]">{row.label}</td>
                  <td className="px-4 py-3" colSpan={2}>{renderDelta(row.followers, false)}</td>
                  <td className="px-4 py-3" colSpan={2}>{renderDelta(row.following, false)}</td>
                  <td className="px-4 py-3" colSpan={2}>{renderDelta(row.posts, false)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        <div className="grid gap-4 lg:hidden">
          {view.mobileRows.length === 0 ? (
            <EmptyState>Tidak ada data harian untuk rentang ini.</EmptyState>
          ) : (
            <>
              {view.mobileRows.map((row, index) => (
            <div key={`${row.date}-mobile`} className="grid gap-3 border-t border-[var(--border)] pt-4 first:border-t-0 first:pt-0">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-[var(--text)]">{index === 0 ? 'Terbaru' : row.fullDateLabel}</div>
                <div className="text-xs text-[var(--text-muted)]">{row.dayLabel}</div>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between gap-3"><span className="text-[var(--text-muted)]">Followers</span><strong className="text-[var(--text)]">{formatInteger.format(row.followers)}</strong></div>
                <div className="flex items-center justify-between gap-3"><span className="text-[var(--text-muted)]">Perubahan followers</span><strong className="text-[var(--text)]">{row.isBaseline ? '--' : `${row.deltaFollowers >= 0 ? '+' : ''}${formatInteger.format(row.deltaFollowers)}`}</strong></div>
                <div className="flex items-center justify-between gap-3"><span className="text-[var(--text-muted)]">Following</span><strong className="text-[var(--text)]">{formatInteger.format(row.following)}</strong></div>
                <div className="flex items-center justify-between gap-3"><span className="text-[var(--text-muted)]">Posts</span><strong className="text-[var(--text)]">{formatInteger.format(row.posts)}</strong></div>
              </div>
            </div>
          ))}
            </>
          )}
        </div>
      </div>
    </SectionCard>
  )
}
