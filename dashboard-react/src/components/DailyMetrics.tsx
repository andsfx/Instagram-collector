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
      description="Detail harian tetap lengkap, tetapi kontrol dan list mobile sekarang dipadatkan agar lebih nyaman dipakai saat presentasi atau scroll cepat."
      actions={<span className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">{view.disclosurePill}</span>}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)] lg:items-end">
        <div className="grid gap-1.5">
          <div className="font-display text-[1.15rem] font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">{view.disclosureTitle}</div>
          <p className="text-[0.94rem] leading-7 text-slate-600 dark:text-slate-300">{view.disclosureHint}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Pilih akun</span>
            <select className="rounded-[1rem] border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-200" value={view.selectedAccount} onChange={(event) => setSelectedAccount(event.target.value)}>
              {view.accounts.map((account) => (
                <option key={account} value={account}>@{account}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Rentang</span>
            <select className="rounded-[1rem] border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-200" value={rangeDays} onChange={(event) => setRangeDays(Number(event.target.value))}>
              {RANGE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option} hari terakhir</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <article className="grid gap-4 rounded-[1.7rem] border border-slate-200/80 bg-white/74 p-4 shadow-[0_18px_46px_-42px_rgba(15,23,42,0.34)] dark:border-white/10 dark:bg-slate-950/46 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Akun aktif</div>
            <div className="font-display text-[clamp(1.45rem,1.2rem+0.55vw,1.9rem)] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">@{view.selectedAccount}</div>
          </div>
          <span className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">{rangeDays} hari</span>
        </div>

        <div className="hidden overflow-x-auto rounded-[1.2rem] border border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-slate-950/56 lg:block">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-200 px-4 py-3 text-left text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:border-white/10 dark:text-slate-400">Tanggal</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:border-white/10 dark:text-slate-400" colSpan={2}>Followers</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:border-white/10 dark:text-slate-400" colSpan={2}>Following</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:border-white/10 dark:text-slate-400" colSpan={2}>Posts</th>
              </tr>
            </thead>
            <tbody>
              {view.rows.map((row) => (
                <tr key={row.date}>
                  <td className="border-b border-slate-200 px-4 py-3 align-top dark:border-white/10">
                    <div className="grid gap-0.5">
                      <div className="font-medium text-slate-950 dark:text-white">{row.dayLabel}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{row.fullDateLabel}</div>
                    </div>
                  </td>
                  <td className="border-b border-slate-200 px-4 py-3 dark:border-white/10">{renderDelta(row.deltaFollowers, row.isBaseline)}</td>
                  <td className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-950 dark:border-white/10 dark:text-white">{formatInteger.format(row.followers)}</td>
                  <td className="border-b border-slate-200 px-4 py-3 dark:border-white/10">{renderDelta(row.deltaFollowing, row.isBaseline)}</td>
                  <td className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-950 dark:border-white/10 dark:text-white">{formatInteger.format(row.following)}</td>
                  <td className="border-b border-slate-200 px-4 py-3 dark:border-white/10">{renderDelta(row.deltaPosts, row.isBaseline)}</td>
                  <td className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-950 dark:border-white/10 dark:text-white">{formatInteger.format(row.posts)}</td>
                </tr>
              ))}
              {view.summaryRows.map((row) => (
                <tr key={row.label} className="daily-summary-row">
                  <td className="px-4 py-3 font-medium text-slate-950 dark:text-white">{row.label}</td>
                  <td className="px-4 py-3" colSpan={2}>{renderDelta(row.followers, false)}</td>
                  <td className="px-4 py-3" colSpan={2}>{renderDelta(row.following, false)}</td>
                  <td className="px-4 py-3" colSpan={2}>{renderDelta(row.posts, false)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 lg:hidden">
          {view.mobileRows.map((row, index) => (
            <div key={`${row.date}-mobile`} className="grid gap-3 rounded-[1.2rem] border border-slate-200/80 bg-slate-50/85 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-slate-950 dark:text-white">{index === 0 ? 'Terbaru' : row.fullDateLabel}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{row.dayLabel}</div>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between gap-3"><span className="text-slate-500 dark:text-slate-400">Followers</span><strong className="text-slate-950 dark:text-white">{formatInteger.format(row.followers)}</strong></div>
                <div className="flex items-center justify-between gap-3"><span className="text-slate-500 dark:text-slate-400">Delta followers</span><strong className="text-slate-950 dark:text-white">{row.isBaseline ? '--' : `${row.deltaFollowers >= 0 ? '+' : ''}${formatInteger.format(row.deltaFollowers)}`}</strong></div>
                <div className="flex items-center justify-between gap-3"><span className="text-slate-500 dark:text-slate-400">Following</span><strong className="text-slate-950 dark:text-white">{formatInteger.format(row.following)}</strong></div>
                <div className="flex items-center justify-between gap-3"><span className="text-slate-500 dark:text-slate-400">Posts</span><strong className="text-slate-950 dark:text-white">{formatInteger.format(row.posts)}</strong></div>
              </div>
            </div>
          ))}
          <div className="rounded-[1.1rem] border border-dashed border-slate-300 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            Menampilkan seluruh observasi dalam rentang {rangeDays} hari, dengan versi tabel penuh tetap tersedia pada layout desktop yang lebih lebar.
          </div>
        </div>
      </article>
    </SectionCard>
  )
}
