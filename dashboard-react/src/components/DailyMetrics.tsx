import { useMemo } from 'react'
import { getDailyMetricsView } from '../data/selectors'
import type { DashboardRecord } from '../data/types'
import { formatInteger } from '../utils/formatters'
import { EmptyState } from './ui'

const RANGE_OPTIONS = [7, 14, 30]

function renderDelta(value: number, isBaseline: boolean) {
  if (isBaseline) return <span className="text-[var(--text-muted)]">--</span>
  if (value > 0) return <span className="text-[var(--success)]">+{formatInteger(value)}</span>
  if (value < 0) return <span className="text-[var(--danger)]">{formatInteger(value)}</span>
  return <span className="text-[var(--text-muted)]">--</span>
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
    <div className="grid gap-6">
      {/* Stat-Led lead */}
      <div className="border-b border-[var(--border)] pb-6">
        <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
          Akun aktif{view.selectedAccount ? ` · @${view.selectedAccount}` : ''}
        </p>
        <p className="font-display text-[clamp(2rem,4vw,3rem)] font-normal tracking-[-0.03em] text-[var(--text)]">
          @{view.selectedAccount}
        </p>
      </div>

      {/* Toolbar */}
      <div className="grid gap-3 sm:grid-cols-2 lg:max-w-[560px]">
        <label className="grid gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Pilih akun</span>
          <select className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-3.5 py-2.5 text-sm text-[var(--text)]" value={view.selectedAccount} onChange={(event) => setSelectedAccount(event.target.value)}>
            {view.accounts.map((account) => (
              <option key={account} value={account}>@{account}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Rentang</span>
          <select className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-3.5 py-2.5 text-sm text-[var(--text)]" value={rangeDays} onChange={(event) => setRangeDays(Number(event.target.value))}>
            {RANGE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option} hari terakhir</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3">
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">{view.disclosureTitle}. {view.disclosureHint}</p>
      </div>

      {/* Desktop table */}
      <section className="hidden border border-[var(--border)] bg-[var(--panel)] p-6 lg:block">
        <div className="overflow-x-auto">
          {view.rows.length === 0 ? (
            <EmptyState>Tidak ada data harian untuk rentang ini.</EmptyState>
          ) : (
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-[var(--border)] px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Tanggal</th>
                  <th className="border-b border-[var(--border)] px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]" colSpan={2}>Followers</th>
                  <th className="border-b border-[var(--border)] px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]" colSpan={2}>Following</th>
                  <th className="border-b border-[var(--border)] px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]" colSpan={2}>Posts</th>
                </tr>
              </thead>
              <tbody>
                {view.rows.map((row) => (
                  <tr key={row.date}>
                    <td className="border-b border-[var(--border)] px-4 py-3 align-top">
                      <div className="grid gap-0.5">
                        <div className="font-medium text-[var(--text)]">{row.dayLabel}</div>
                        <div className="text-xs text-[var(--text-soft)]">{row.fullDateLabel}</div>
                      </div>
                    </td>
                    <td className="border-b border-[var(--border)] px-4 py-3">{renderDelta(row.deltaFollowers, row.isBaseline)}</td>
                    <td className="border-b border-[var(--border)] px-4 py-3 font-semibold text-[var(--text)]">{formatInteger(row.followers)}</td>
                    <td className="border-b border-[var(--border)] px-4 py-3">{renderDelta(row.deltaFollowing, row.isBaseline)}</td>
                    <td className="border-b border-[var(--border)] px-4 py-3 font-semibold text-[var(--text)]">{formatInteger(row.following)}</td>
                    <td className="border-b border-[var(--border)] px-4 py-3">{renderDelta(row.deltaPosts, row.isBaseline)}</td>
                    <td className="border-b border-[var(--border)] px-4 py-3 font-semibold text-[var(--text)]">{formatInteger(row.posts)}</td>
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
      </section>

      {/* Mobile rows */}
      <div className="grid gap-4 lg:hidden">
        {view.mobileRows.length === 0 ? (
          <EmptyState>Tidak ada data harian untuk rentang ini.</EmptyState>
        ) : (
          <>
            {view.mobileRows.map((row, index) => (
              <div key={`${row.date}-mobile`} className="grid gap-3 border-t border-[var(--border)] pt-4 first:border-t-0 first:pt-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-[var(--text)]">{index === 0 ? 'Terbaru' : row.fullDateLabel}</div>
                  <div className="text-xs text-[var(--text-soft)]">{row.dayLabel}</div>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between gap-3"><span className="text-[var(--text-muted)]">Followers</span><strong className="text-[var(--text)]">{formatInteger(row.followers)}</strong></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-[var(--text-muted)]">Perubahan followers</span><strong className="text-[var(--text)]">{row.isBaseline ? '--' : `${row.deltaFollowers >= 0 ? '+' : ''}${formatInteger(row.deltaFollowers)}`}</strong></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-[var(--text-muted)]">Following</span><strong className="text-[var(--text)]">{formatInteger(row.following)}</strong></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-[var(--text-muted)]">Posts</span><strong className="text-[var(--text)]">{formatInteger(row.posts)}</strong></div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
