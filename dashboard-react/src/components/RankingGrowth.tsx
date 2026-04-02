import { useMemo, useState } from 'react'
import { type RankingSortKey, type SortDirection, formatInteger, getRankingTableRows, sortRankingRows } from '../data/selectors'
import type { DashboardRecord } from '../data/types'
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

export function RankingGrowth({ data }: { data: DashboardRecord }) {
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

  return (
    <SectionCard
      eyebrow="Ranking & Growth"
      title="Posisi audiens dan momentum pertumbuhan"
      description="Section ini sekarang menggabungkan ringkasan ranking cepat dengan tabel kompetitor penuh yang bisa diurutkan seperti versi legacy."
    >
      <div className="ranking-grid">
        <article className="ranking-card editorial-ranking-card">
          <div className="section-heading">
            <h3 className="section-title">Peringkat followers</h3>
            <p className="section-description">Urutan berdasarkan ukuran audiens saat ini.</p>
          </div>
          <ol className="ranking-list">
            {topFollowerRows.map((row) => (
              <li key={row.account} className="table-row">
                <span className="table-strong">#{row.rank} @{row.account}</span>
                <span className="table-muted">{formatInteger.format(row.followers)} followers</span>
              </li>
            ))}
          </ol>
        </article>
        <article className="ranking-card editorial-ranking-card">
          <div className="section-heading">
            <h3 className="section-title">Peringkat engagement</h3>
            <p className="section-description">Akun paling efisien mengubah audiens jadi interaksi.</p>
          </div>
          <ol className="ranking-list">
            {topEngagementRows.map((row) => (
              <li key={row.account} className="table-row">
                <span className="table-strong">#{row.rank} @{row.account}</span>
                <span className="table-muted">{row.engagementRate.toFixed(2)}% ER</span>
              </li>
            ))}
          </ol>
        </article>
      </div>

      <article className="ranking-card editorial-ranking-card">
        <div className="section-heading">
          <h3 className="section-title">Pertumbuhan 7 hari</h3>
          <p className="section-description">Fokus pada akun yang paling cepat bertambah selama seminggu terakhir.</p>
        </div>
        <ul className="ranking-list">
          {topGrowthRows.map((row) => (
            <li key={row.account} className="table-row">
              <span className="table-strong">@{row.account}</span>
              <span className="table-muted">{row.pct_change_7d.toFixed(2)}% | {formatInteger.format(row.followers_change_7d)} followers</span>
            </li>
          ))}
        </ul>
      </article>

      <article className="ranking-card editorial-table-card">
        <div className="section-heading">
          <h3 className="section-title">Tabel kompetitor penuh</h3>
          <p className="section-description">Urutkan kolom untuk membaca gap brand, status verified, dan metrik akun dengan detail penuh.</p>
        </div>
        <div className="ranking-table-wrap">
          <table className="ranking-table">
            <thead>
              <tr>
                {SORT_LABELS.map((column) => (
                  <th key={column.key} aria-sort={getAriaSort(column.key)}>
                    <button type="button" className="table-sort-button" onClick={() => handleSort(column.key)}>
                      <span>{column.label}</span>
                      <span className={`sort-indicator ${sortKey === column.key ? 'is-active' : ''}`} aria-hidden="true">
                        {sortKey === column.key ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.account}>
                  <td>#{row.rank}</td>
                  <td className="table-strong">@{row.account}</td>
                  <td>{formatInteger.format(row.followers)}</td>
                  <td>{formatInteger.format(row.following)}</td>
                  <td>{formatInteger.format(row.posts)}</td>
                  <td>{formatInteger.format(Math.round(row.avgLikes))}</td>
                  <td>{row.avgComments.toFixed(2)}</td>
                  <td>{row.engagementRate.toFixed(2)}%</td>
                  <td>{row.verified ? 'Ya' : 'Tidak'}</td>
                  <td className={row.gapVsBrand >= 0 ? 'trend-positive' : 'trend-negative'}>
                    {row.gapVsBrand >= 0 ? '+' : ''}{formatInteger.format(row.gapVsBrand)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </SectionCard>
  )
}
