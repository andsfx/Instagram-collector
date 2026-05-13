import { useMemo, useState } from 'react'
import { type RankingSortKey, type SortDirection, getRankingTableRows, sortRankingRows } from '../data/selectors'
import type { DashboardRecord } from '../data/types'
import { formatEngagementRate, formatInteger, formatPercent } from '../utils/formatters'
import { SectionCard } from './ui'

const SORT_LABELS: Array<{ key: RankingSortKey; label: string }> = [
  { key: 'rank', label: 'Rank' },
  { key: 'username', label: 'Username' },
  { key: 'followers', label: 'Followers' },
  { key: 'following', label: 'Following' },
  { key: 'posts', label: 'Posts' },
  { key: 'avgLikes', label: 'Avg Likes' },
  { key: 'avgComments', label: 'Avg Comments' },
  { key: 'er', label: 'ER' },
  { key: 'verified', label: 'Verified' },
  { key: 'gap', label: 'Gap vs Brand' },
]

function nextSortDirection(currentKey: RankingSortKey, activeKey: RankingSortKey, direction: SortDirection): SortDirection {
  if (currentKey !== activeKey) return currentKey === 'username' || currentKey === 'rank' ? 'asc' : 'desc'
  return direction === 'asc' ? 'desc' : 'asc'
}

function SortIndicator({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) {
    return (
      <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 text-text-soft">
        <path d="M3 5 6 2l3 3M9 7 6 10 3 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
      </svg>
    )
  }

  return direction === 'asc' ? (
    <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 text-brand">
      <path d="M6 2 9 6H3l3-4Z" fill="currentColor" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 text-brand">
      <path d="M6 10 3 6h6l-3 4Z" fill="currentColor" />
    </svg>
  )
}

export function RankingGrowthPresentation({
  data,
  mode = 'full',
}: {
  data: DashboardRecord
  mode?: 'full' | 'summary' | 'table'
}) {
  const [sortKey, setSortKey] = useState<RankingSortKey>('followers')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const rows = useMemo(() => sortRankingRows(getRankingTableRows(data), sortKey, sortDirection), [data, sortDirection, sortKey])
  const topFollowerRows = rows.slice().sort((left, right) => right.followers - left.followers).slice(0, 5)
  const topEngagementRows = rows.slice().sort((left, right) => right.engagementRate - left.engagementRate).slice(0, 5)
  const topGrowthRows = Object.entries(data.growth)
    .map(([account, growth]) => ({ account, ...growth }))
    .sort((left, right) => right.pct_change_7d - left.pct_change_7d)
    .slice(0, 5)

  function handleSort(key: RankingSortKey) {
    const direction = nextSortDirection(key, sortKey, sortDirection)
    setSortKey(key)
    setSortDirection(direction)
  }

  function getAriaSort(key: RankingSortKey): 'none' | 'ascending' | 'descending' {
    if (key !== sortKey) return 'none'
    return sortDirection === 'asc' ? 'ascending' : 'descending'
  }

  const showSummary = mode !== 'table'
  const showDetailedTable = mode !== 'summary'
  const sectionCopy =
    mode === 'summary'
      ? {
          eyebrow: 'Ranking & Growth',
          title: 'Posisi audiens dan momentum pertumbuhan',
          description: undefined,
        }
      : mode === 'table'
        ? {
            eyebrow: 'Detailed Comparison',
            title: 'Tabel kompetitor penuh',
            description: undefined,
          }
        : {
            eyebrow: 'Ranking & Growth',
            title: 'Posisi audiens dan momentum pertumbuhan',
            description: undefined,
          }

  if (mode === 'summary') {
    return (
      <section className="grid gap-6 border-t border-slate-200/80 pt-6 dark:border-white/10 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)] lg:gap-8">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Leaderboard snapshot</div>
            <h3 className="font-display text-[clamp(1.3rem,1.12rem+0.48vw,1.85rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-slate-950 dark:text-white">
              Leaderboard
            </h3>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-3 border-t border-slate-200/80 pt-3 dark:border-white/10">
              <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Peringkat followers</div>
              <ol className="grid gap-2.5">
                {topFollowerRows.slice(0, 3).map((row) => (
                  <li key={row.account} className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold text-slate-900 dark:text-white">#{row.rank} @{row.account}</span>
                    <span className="text-[0.9rem] text-slate-600 dark:text-slate-300">{formatInteger(row.followers)}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid gap-3 border-t border-slate-200/80 pt-3 dark:border-white/10">
              <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Peringkat engagement</div>
              <ol className="grid gap-2.5">
                {topEngagementRows.slice(0, 3).map((row) => (
                  <li key={row.account} className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold text-slate-900 dark:text-white">#{row.rank} @{row.account}</span>
                    <span className="text-[0.9rem] text-slate-600 dark:text-slate-300">{formatEngagementRate(row.engagementRate)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        <aside className="grid gap-3 border-t border-slate-200/80 pt-3 dark:border-white/10">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Momentum 7 hari</div>
          <ol className="grid gap-3">
            {topGrowthRows.slice(0, 3).map((row) => (
              <li key={row.account} className="grid gap-1 border-b border-slate-200/70 pb-3 last:border-b-0 last:pb-0 dark:border-white/10">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white">@{row.account}</span>
                  <span className="text-[0.9rem] font-semibold text-[var(--brand)]">{formatPercent(row.pct_change_7d)}</span>
                </div>
                <span className="text-[0.88rem] text-slate-600 dark:text-slate-300">{formatInteger(row.followers_change_7d)} followers dalam 7 hari.</span>
              </li>
            ))}
          </ol>
        </aside>
      </section>
    )
  }

  return (
    <SectionCard
      eyebrow={sectionCopy.eyebrow}
      title={sectionCopy.title}
      description={sectionCopy.description}
    >
      {showSummary ? (
        <div className="grid gap-5 desktop:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <article className="grid gap-5 rounded-[28px] border border-[color:color-mix(in_srgb,var(--brand)_18%,var(--border))] bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--brand-soft-2)_52%,transparent),transparent_36%),linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_58%,var(--panel)),var(--panel))] p-6 shadow-panel-md">
            <div className="grid gap-2">
              <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-brand">Leaderboard</div>
              <h3 className="font-display text-[clamp(1.34rem,1.1rem+0.55vw,1.95rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-text">
                Siapa yang memimpin ukuran audiens dan kualitas perhatian.
              </h3>
              <p className="max-w-[48ch] text-[0.95rem] leading-[1.65] text-text-muted">
                Bagian ini merangkum dua ranking yang paling cepat menjelaskan struktur persaingan sebelum pembaca turun ke tabel lengkap.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <article className="grid gap-4 rounded-[22px] border border-[color:color-mix(in_srgb,var(--brand)_12%,var(--border))] bg-[color:color-mix(in_srgb,var(--panel)_88%,transparent)] p-5 shadow-panel-sm">
                <div className="grid gap-1.5">
                  <h4 className="font-display text-[clamp(1.08rem,0.98rem+0.35vw,1.35rem)] font-semibold leading-[1.08] text-text">Peringkat followers</h4>
                  <p className="text-[0.92rem] text-text-muted">Urutan berdasarkan ukuran audiens saat ini.</p>
                </div>
                <ol className="grid gap-3">
                  {topFollowerRows.map((row, index) => (
                    <li key={row.account} className={`flex items-baseline justify-between gap-3 border-b border-[color:color-mix(in_srgb,var(--border)_80%,transparent)] pb-3 ${index === topFollowerRows.length - 1 ? 'border-b-0 pb-0' : ''}`}>
                      <span className="font-semibold text-text">#{row.rank} @{row.account}</span>
                      <span className="text-[0.9rem] text-text-muted">{formatInteger(row.followers)} followers</span>
                    </li>
                  ))}
                </ol>
              </article>

              <article className="grid gap-4 rounded-[22px] border border-[color:color-mix(in_srgb,var(--brand)_12%,var(--border))] bg-[color:color-mix(in_srgb,var(--panel)_88%,transparent)] p-5 shadow-panel-sm">
                <div className="grid gap-1.5">
                  <h4 className="font-display text-[clamp(1.08rem,0.98rem+0.35vw,1.35rem)] font-semibold leading-[1.08] text-text">Peringkat engagement</h4>
                  <p className="text-[0.92rem] text-text-muted">Akun paling efisien mengubah audiens jadi interaksi.</p>
                </div>
                <ol className="grid gap-3">
                  {topEngagementRows.map((row, index) => (
                    <li key={row.account} className={`flex items-baseline justify-between gap-3 border-b border-[color:color-mix(in_srgb,var(--border)_80%,transparent)] pb-3 ${index === topEngagementRows.length - 1 ? 'border-b-0 pb-0' : ''}`}>
                      <span className="font-semibold text-text">#{row.rank} @{row.account}</span>
                      <span className="text-[0.9rem] text-text-muted">{formatEngagementRate(row.engagementRate)} ER</span>
                    </li>
                  ))}
                </ol>
              </article>
            </div>
          </article>

          <article className="grid gap-4 rounded-[26px] border border-[color:color-mix(in_srgb,var(--border)_88%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_82%,transparent),color-mix(in_srgb,var(--panel-muted)_86%,transparent))] p-5">
            <div className="grid gap-1.5">
              <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-text-soft">Momentum</div>
              <h3 className="font-display text-[clamp(1.14rem,1rem+0.4vw,1.48rem)] font-semibold leading-[1.08] text-text">Pertumbuhan 7 hari</h3>
              <p className="text-[0.93rem] text-text-muted">Akun yang paling cepat bertambah selama seminggu terakhir.</p>
            </div>
            <ol className="grid gap-3">
              {topGrowthRows.map((row) => (
                <li key={row.account} className="grid gap-1.5 rounded-[18px] border border-[color:color-mix(in_srgb,var(--border)_86%,transparent)] bg-[color:color-mix(in_srgb,var(--panel)_86%,transparent)] px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold text-text">@{row.account}</span>
                    <span className="text-[0.9rem] font-semibold text-brand">{formatPercent(row.pct_change_7d)}</span>
                  </div>
                  <span className="text-[0.88rem] text-text-muted">{formatInteger(row.followers_change_7d)} followers dalam 7 hari.</span>
                </li>
              ))}
            </ol>
          </article>
        </div>
      ) : null}

      {showDetailedTable ? (
        <article className="grid gap-4 rounded-[28px] border border-[color:color-mix(in_srgb,var(--border)_88%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_94%,transparent),color-mix(in_srgb,var(--panel-muted)_72%,transparent))] p-5 shadow-panel-sm">
          <div className="flex flex-col gap-3 desktop:flex-row desktop:items-end desktop:justify-between">
            <div className="grid gap-1.5">
              <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-text-soft">Detailed table</div>
              <h3 className="font-display text-[clamp(1.14rem,1rem+0.42vw,1.5rem)] font-semibold leading-[1.08] text-text">Tabel kompetitor penuh</h3>
              <p className="max-w-[62ch] text-[0.95rem] text-text-muted">
                Klik header kolom untuk mengurutkan.
              </p>
            </div>
            <div className="inline-flex w-fit rounded-full border border-[color:color-mix(in_srgb,var(--brand)_14%,var(--border))] bg-[color:color-mix(in_srgb,var(--panel)_82%,transparent)] px-3 py-1.5 text-xs font-bold text-brand">
              Klik header tabel untuk mengurutkan
            </div>
          </div>

          <div className="w-full overflow-x-auto rounded-[22px] border border-[color:color-mix(in_srgb,var(--border)_86%,transparent)] bg-[color:color-mix(in_srgb,var(--panel)_90%,transparent)]">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  {SORT_LABELS.map((column) => (
                    <th
                      key={column.key}
                      aria-sort={getAriaSort(column.key)}
                      className="border-b border-border bg-[color:color-mix(in_srgb,var(--panel-muted)_88%,var(--panel))] px-[12px] py-3.5 text-left text-[0.78rem] font-extrabold uppercase tracking-[0.08em] text-text-soft"
                    >
                      <button type="button" className="inline-flex items-center gap-1.5 bg-transparent p-0 text-inherit" onClick={() => handleSort(column.key)}>
                        <span>{column.label}</span>
                        <SortIndicator active={sortKey === column.key} direction={sortDirection} />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.account} className="transition-colors hover:bg-[color:color-mix(in_srgb,var(--brand-soft)_28%,transparent)]">
                    <td className="border-b border-border px-[12px] py-3 text-[0.92rem] text-text">#{row.rank}</td>
                    <td className="border-b border-border px-[12px] py-3 text-[0.92rem] font-semibold text-text">@{row.account}</td>
                    <td className="border-b border-border px-[12px] py-3 text-[0.92rem] text-text">{formatInteger(row.followers)}</td>
                    <td className="border-b border-border px-[12px] py-3 text-[0.92rem] text-text">{formatInteger(row.following)}</td>
                    <td className="border-b border-border px-[12px] py-3 text-[0.92rem] text-text">{formatInteger(row.posts)}</td>
                    <td className="border-b border-border px-[12px] py-3 text-[0.92rem] text-text">{formatInteger(Math.round(row.avgLikes))}</td>
                    <td className="border-b border-border px-[12px] py-3 text-[0.92rem] text-text">{row.avgComments.toFixed(2)}</td>
                    <td className="border-b border-border px-[12px] py-3 text-[0.92rem] text-text">{formatEngagementRate(row.engagementRate)}</td>
                    <td className="border-b border-border px-[12px] py-3 text-[0.92rem] text-text">{row.verified ? 'Ya' : 'Tidak'}</td>
                    <td className={`border-b border-border px-[12px] py-3 text-[0.92rem] ${row.gapVsBrand >= 0 ? 'text-success' : 'text-danger'}`}>
                      {row.gapVsBrand >= 0 ? '+' : ''}{formatInteger(row.gapVsBrand)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      ) : null}
    </SectionCard>
  )
}
