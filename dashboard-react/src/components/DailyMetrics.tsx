import { useMemo, useState } from 'react'
import { formatInteger, getDailyMetricsView } from '../data/selectors'
import type { DashboardRecord } from '../data/types'
import { SectionCard } from './ui'

const RANGE_OPTIONS = [7, 14, 30]

function renderDelta(value: number, isBaseline: boolean) {
  if (isBaseline) return <span className="font-bold text-text-soft">--</span>
  if (value > 0) return <span className="font-bold text-success">+{formatInteger.format(value)}</span>
  if (value < 0) return <span className="font-bold text-danger">{formatInteger.format(value)}</span>
  return <span className="font-bold text-text-soft">--</span>
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
      actions={<span className="inline-flex items-center rounded-full bg-[linear-gradient(180deg,var(--brand-soft),color-mix(in_srgb,var(--brand-soft-2)_72%,var(--panel)))] px-2.5 py-1.5 text-xs font-bold text-brand">{view.disclosurePill}</span>}
    >
      <div className="flex flex-col gap-4 rounded-panel-md border border-[color:color-mix(in_srgb,var(--brand)_10%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel-muted)_88%,var(--brand-soft)_12%),var(--panel))] p-[18px] lg:flex-row lg:items-start lg:justify-between">
        <div className="grid max-w-[56ch] gap-1.5">
          <div className="font-display text-[clamp(1.12rem,1rem+0.55vw,1.55rem)] leading-[1.15] tracking-[-0.02em] text-text">{view.disclosureTitle}</div>
          <p className="text-[0.95rem] text-text-muted">{view.disclosureHint}</p>
        </div>
        <div className="grid w-full gap-[14px] lg:w-auto lg:min-w-[380px] lg:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">Pilih akun</span>
            <select className="min-h-[42px] w-full rounded-xl border border-border bg-panel px-3.5 py-2.5 text-text" value={view.selectedAccount} onChange={(event) => setSelectedAccount(event.target.value)}>
              {view.accounts.map((account) => (
                <option key={account} value={account}>@{account}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">Rentang</span>
            <select className="min-h-[42px] w-full rounded-xl border border-border bg-panel px-3.5 py-2.5 text-text" value={rangeDays} onChange={(event) => setRangeDays(Number(event.target.value))}>
              {RANGE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option} hari terakhir</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <article className="grid gap-4 rounded-panel-md border border-[color:color-mix(in_srgb,var(--brand)_12%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_94%,var(--brand-soft)_6%),var(--panel))] p-[18px] shadow-panel-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">Akun aktif</div>
            <div className="mt-2.5 font-display text-[clamp(1.5rem,1.2rem+0.75vw,2.2rem)] leading-none text-brand-strong">@{view.selectedAccount}</div>
          </div>
          <span className="inline-flex items-center rounded-full bg-[linear-gradient(180deg,var(--brand-soft),color-mix(in_srgb,var(--brand-soft-2)_72%,var(--panel)))] px-2.5 py-1.5 text-xs font-bold text-brand">{rangeDays} hari</span>
        </div>

        <div className="hidden w-full overflow-x-auto mobile:block">
          <table className="mt-[14px] w-full min-w-[760px] border-collapse">
            <thead>
              <tr>
                <th className="border-b border-border py-2.5 text-left text-[0.78rem] font-extrabold uppercase tracking-[0.08em] text-text-soft">Tanggal</th>
                <th className="border-b border-border py-2.5 text-left text-[0.78rem] font-extrabold uppercase tracking-[0.08em] text-text-soft" colSpan={2}>Followers</th>
                <th className="border-b border-border py-2.5 text-left text-[0.78rem] font-extrabold uppercase tracking-[0.08em] text-text-soft" colSpan={2}>Following</th>
                <th className="border-b border-border py-2.5 text-left text-[0.78rem] font-extrabold uppercase tracking-[0.08em] text-text-soft" colSpan={2}>Posts</th>
              </tr>
            </thead>
            <tbody>
              {view.rows.map((row) => (
                <tr key={row.date}>
                  <td className="border-b border-border py-2.5">
                    <div className="grid gap-0.5">
                      <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.08em] text-text-soft">{row.dayLabel}</div>
                      <div className="text-[0.9rem] font-semibold text-text">{row.fullDateLabel}</div>
                    </div>
                  </td>
                  <td className="border-b border-border py-2.5 text-[0.9rem]">{renderDelta(row.deltaFollowers, row.isBaseline)}</td>
                  <td className="border-b border-border py-2.5 text-[0.9rem] font-semibold text-text">{formatInteger.format(row.followers)}</td>
                  <td className="border-b border-border py-2.5 text-[0.9rem]">{renderDelta(row.deltaFollowing, row.isBaseline)}</td>
                  <td className="border-b border-border py-2.5 text-[0.9rem] font-semibold text-text">{formatInteger.format(row.following)}</td>
                  <td className="border-b border-border py-2.5 text-[0.9rem]">{renderDelta(row.deltaPosts, row.isBaseline)}</td>
                  <td className="border-b border-border py-2.5 text-[0.9rem] font-semibold text-text">{formatInteger.format(row.posts)}</td>
                </tr>
              ))}
              {view.summaryRows.map((row) => (
                <tr key={row.label}>
                  <td className="bg-panel-muted py-2.5 font-semibold text-brand-strong">{row.label}</td>
                  <td className="bg-panel-muted py-2.5 font-semibold text-brand-strong" colSpan={2}>{renderDelta(row.followers, false)}</td>
                  <td className="bg-panel-muted py-2.5 font-semibold text-brand-strong" colSpan={2}>{renderDelta(row.following, false)}</td>
                  <td className="bg-panel-muted py-2.5 font-semibold text-brand-strong" colSpan={2}>{renderDelta(row.posts, false)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid mobile:hidden">
          {view.mobileRows.map((row, index) => (
            <div key={`${row.date}-mobile`} className={`grid gap-2.5 border-t border-border py-[14px] ${index === 0 ? 'mt-[14px]' : ''}`}>
              <div className="text-[0.78rem] font-extrabold uppercase tracking-[0.08em] text-text-soft">{index === 0 ? 'Terbaru' : row.fullDateLabel}</div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3 text-[0.92rem] text-text-muted"><span>Followers</span><strong className="text-text">{formatInteger.format(row.followers)}</strong></div>
                <div className="flex items-center justify-between gap-3 text-[0.92rem] text-text-muted"><span>Delta followers</span><strong className={row.isBaseline ? 'text-text-soft' : row.deltaFollowers > 0 ? 'text-success' : row.deltaFollowers < 0 ? 'text-danger' : 'text-text-soft'}>{row.isBaseline ? '--' : `${row.deltaFollowers >= 0 ? '+' : ''}${formatInteger.format(row.deltaFollowers)}`}</strong></div>
                <div className="flex items-center justify-between gap-3 text-[0.92rem] text-text-muted"><span>Following</span><strong className="text-text">{formatInteger.format(row.following)}</strong></div>
                <div className="flex items-center justify-between gap-3 text-[0.92rem] text-text-muted"><span>Delta following</span><strong className={row.isBaseline ? 'text-text-soft' : row.deltaFollowing > 0 ? 'text-success' : row.deltaFollowing < 0 ? 'text-danger' : 'text-text-soft'}>{row.isBaseline ? '--' : `${row.deltaFollowing >= 0 ? '+' : ''}${formatInteger.format(row.deltaFollowing)}`}</strong></div>
                <div className="flex items-center justify-between gap-3 text-[0.92rem] text-text-muted"><span>Posts</span><strong className="text-text">{formatInteger.format(row.posts)}</strong></div>
                <div className="flex items-center justify-between gap-3 text-[0.92rem] text-text-muted"><span>Delta posts</span><strong className={row.isBaseline ? 'text-text-soft' : row.deltaPosts > 0 ? 'text-success' : row.deltaPosts < 0 ? 'text-danger' : 'text-text-soft'}>{row.isBaseline ? '--' : `${row.deltaPosts >= 0 ? '+' : ''}${formatInteger.format(row.deltaPosts)}`}</strong></div>
              </div>
            </div>
          ))}
          <div className="mt-3 text-[0.84rem] text-text-soft">
            Menampilkan seluruh observasi untuk rentang {rangeDays} hari terakhir agar filter tetap konsisten di mobile.
          </div>
        </div>
      </article>
    </SectionCard>
  )
}
