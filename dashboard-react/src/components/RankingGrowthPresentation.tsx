import { useMemo, useState } from 'react'
import { type RankingSortKey, type SortDirection, getRankingTableRows, sortRankingRows } from '../data/selectors'
import type { DashboardRecord } from '../data/types'
import { formatEngagementRate, formatInteger, formatPercent } from '../utils/formatters'

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
      <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 text-[var(--text-soft)]">
        <path d="M3 5 6 2l3 3M9 7 6 10 3 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
      </svg>
    )
  }

  return direction === 'asc' ? (
    <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 text-[var(--brand)]">
      <path d="M6 2 9 6H3l3-4Z" fill="currentColor" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 text-[var(--brand)]">
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
  const leadAccount = topFollowerRows[0]

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

  if (mode === 'summary') {
    return (
      <div className="grid gap-6">
        <section className="grid gap-5 border-t border-[var(--border)] pt-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)] lg:gap-8">
          <div className="grid gap-4">
            <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">Leaderboard</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-3">
                <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Peringkat followers</div>
                <ol className="grid gap-2.5">
                  {topFollowerRows.slice(0, 3).map((row) => (
                    <li key={row.account} className="flex items-baseline justify-between gap-3 border-t border-[var(--border)] pt-2">
                      <span className="font-semibold text-[var(--text)]">#{row.rank} @{row.account}</span>
                      <span className="text-sm text-[var(--text-muted)]">{formatInteger(row.followers)}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="grid gap-3">
                <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Peringkat engagement</div>
                <ol className="grid gap-2.5">
                  {topEngagementRows.slice(0, 3).map((row) => (
                    <li key={row.account} className="flex items-baseline justify-between gap-3 border-t border-[var(--border)] pt-2">
                      <span className="font-semibold text-[var(--text)]">#{row.rank} @{row.account}</span>
                      <span className="text-sm text-[var(--text-muted)]">{formatEngagementRate(row.engagementRate)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          <aside className="grid gap-3">
            <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Momentum 7 hari</div>
            <ol className="grid gap-3">
              {topGrowthRows.slice(0, 3).map((row) => (
                <li key={row.account} className="grid gap-1 border-t border-[var(--border)] pt-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold text-[var(--text)]">@{row.account}</span>
                    <span className="text-sm font-semibold text-[var(--brand)]">{formatPercent(row.pct_change_7d)}</span>
                  </div>
                  <span className="text-sm text-[var(--text-muted)]">{formatInteger(row.followers_change_7d)} followers dalam 7 hari.</span>
                </li>
              ))}
            </ol>
          </aside>
        </section>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      {/* Stat-Led lead */}
      <div className="border-b border-[var(--border)] pb-6">
        <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
          Posisi audiens & momentum{leadAccount ? ` · @${leadAccount.account}` : ''}
        </p>
        <p className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-normal tracking-[-0.03em] text-[var(--text)]">
          {leadAccount ? formatInteger(leadAccount.followers) : '—'}
        </p>
      </div>

      {showSummary ? (
        <section className="border border-[var(--border)] bg-[var(--panel)] p-6">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">Siapa yang memimpin ukuran audiens dan kualitas perhatian</h2>
          <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-[var(--text-muted)]">
            Bagian ini merangkum dua ranking yang paling cepat menjelaskan struktur persaingan sebelum pembaca turun ke tabel lengkap.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <section className="grid gap-4 bg-[var(--panel-muted)] p-5">
              <h3 className="text-base font-semibold text-[var(--text)]">Peringkat followers</h3>
              <ol className="grid gap-3">
                {topFollowerRows.map((row, index) => (
                  <li key={row.account} className={`flex items-baseline justify-between gap-3 border-t border-[var(--border)] pt-3 ${index === 0 ? 'border-t-0 pt-0' : ''}`}>
                    <span className="font-semibold text-[var(--text)]">#{row.rank} @{row.account}</span>
                    <span className="text-sm text-[var(--text-muted)]">{formatInteger(row.followers)} followers</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="grid gap-4 bg-[var(--panel-muted)] p-5">
              <h3 className="text-base font-semibold text-[var(--text)]">Peringkat engagement</h3>
              <ol className="grid gap-3">
                {topEngagementRows.map((row, index) => (
                  <li key={row.account} className={`flex items-baseline justify-between gap-3 border-t border-[var(--border)] pt-3 ${index === 0 ? 'border-t-0 pt-0' : ''}`}>
                    <span className="font-semibold text-[var(--text)]">#{row.rank} @{row.account}</span>
                    <span className="text-sm text-[var(--text-muted)]">{formatEngagementRate(row.engagementRate)} ER</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </section>
      ) : null}

      {showSummary ? (
        <section className="border border-[var(--border)] bg-[var(--panel-muted)] p-6">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">Pertumbuhan 7 hari</h2>
          <ol className="mt-4 grid gap-3">
            {topGrowthRows.map((row) => (
              <li key={row.account} className="flex items-baseline justify-between gap-3 border-t border-[var(--border)] pt-3">
                <div className="grid gap-1">
                  <span className="font-semibold text-[var(--text)]">@{row.account}</span>
                  <span className="text-sm text-[var(--text-muted)]">{formatInteger(row.followers_change_7d)} followers dalam 7 hari.</span>
                </div>
                <span className="shrink-0 text-sm font-semibold text-[var(--brand)]">{formatPercent(row.pct_change_7d)}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {showDetailedTable ? (
        <section className="border border-[var(--border)] bg-[var(--panel)] p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="grid gap-1">
              <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">Tabel kompetitor penuh</h2>
              <p className="text-sm text-[var(--text-muted)]">Klik header kolom untuk mengurutkan.</p>
            </div>
          </div>

          <div className="mt-4 w-full overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  {SORT_LABELS.map((column) => (
                    <th
                      key={column.key}
                      aria-sort={getAriaSort(column.key)}
                      className="border-b border-[var(--border)] px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]"
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
                    <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text)]">#{row.rank}</td>
                    <td className="border-b border-[var(--border)] px-3 py-3 text-sm font-semibold text-[var(--text)]">@{row.account}</td>
                    <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text)]">{formatInteger(row.followers)}</td>
                    <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text)]">{formatInteger(row.following)}</td>
                    <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text)]">{formatInteger(row.posts)}</td>
                    <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text)]">{formatInteger(Math.round(row.avgLikes))}</td>
                    <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text)]">{row.avgComments.toFixed(2)}</td>
                    <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text)]">{formatEngagementRate(row.engagementRate)}</td>
                    <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text)]">{row.verified ? 'Ya' : 'Tidak'}</td>
                    <td className={`border-b border-[var(--border)] px-3 py-3 text-sm ${row.gapVsBrand >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                      {row.gapVsBrand >= 0 ? '+' : ''}{formatInteger(row.gapVsBrand)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  )
}
