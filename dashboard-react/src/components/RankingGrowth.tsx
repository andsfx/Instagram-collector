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
      <div className="grid gap-5 desktop:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)]">
        <article className="grid gap-5 rounded-[26px] border border-[color:color-mix(in_srgb,var(--brand)_18%,var(--border))] bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--brand-soft-2)_52%,transparent),transparent_36%),linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_56%,var(--panel)),var(--panel))] p-6 shadow-panel-md">
          <div className="grid gap-2">
            <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-brand">Leaderboard</div>
            <h3 className="font-display text-[clamp(1.35rem,1.12rem+0.6vw,2rem)] leading-[1.02] tracking-[-0.03em] text-text">
              Akun yang paling menguasai ukuran audiens dan laju perhatian.
            </h3>
            <p className="max-w-[46ch] text-[0.95rem] leading-[1.65] text-text-muted">
              Fold ranking ini dibuka dengan dua ranking yang paling cepat menjelaskan struktur pasar:
              siapa yang paling besar, dan siapa yang paling efisien mengubah audiens jadi interaksi.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <article className="grid gap-4 rounded-panel-md border border-[color:color-mix(in_srgb,var(--brand)_14%,var(--border))] bg-[color:color-mix(in_srgb,var(--panel)_90%,transparent)] p-5 shadow-panel-sm">
              <div className="grid gap-1.5">
                <h4 className="font-display text-[clamp(1.12rem,1rem+0.4vw,1.45rem)] leading-[1.08] tracking-[-0.02em] text-text">Peringkat followers</h4>
                <p className="text-[0.92rem] text-text-muted">Urutan berdasarkan ukuran audiens saat ini.</p>
              </div>
              <ol className="grid gap-3">
                {topFollowerRows.map((row, index) => (
                  <li
                    key={row.account}
                    className={`flex items-baseline justify-between gap-3 border-b border-[color:color-mix(in_srgb,var(--border)_80%,transparent)] pb-3 ${index === topFollowerRows.length - 1 ? 'border-b-0 pb-0' : ''}`}
                  >
                    <span className="font-semibold text-text">#{row.rank} @{row.account}</span>
                    <span className="text-[0.9rem] text-text-muted">{formatInteger.format(row.followers)} followers</span>
                  </li>
                ))}
              </ol>
            </article>
            <article className="grid gap-4 rounded-panel-md border border-[color:color-mix(in_srgb,var(--brand)_14%,var(--border))] bg-[color:color-mix(in_srgb,var(--panel)_90%,transparent)] p-5 shadow-panel-sm">
              <div className="grid gap-1.5">
                <h4 className="font-display text-[clamp(1.12rem,1rem+0.4vw,1.45rem)] leading-[1.08] tracking-[-0.02em] text-text">Peringkat engagement</h4>
                <p className="text-[0.92rem] text-text-muted">Akun paling efisien mengubah audiens jadi interaksi.</p>
              </div>
              <ol className="grid gap-3">
                {topEngagementRows.map((row, index) => (
                  <li
                    key={row.account}
                    className={`flex items-baseline justify-between gap-3 border-b border-[color:color-mix(in_srgb,var(--border)_80%,transparent)] pb-3 ${index === topEngagementRows.length - 1 ? 'border-b-0 pb-0' : ''}`}
                  >
                    <span className="font-semibold text-text">#{row.rank} @{row.account}</span>
                    <span className="text-[0.9rem] text-text-muted">{row.engagementRate.toFixed(2)}% ER</span>
                  </li>
                ))}
              </ol>
            </article>
          </div>
        </article>

        <article className="grid gap-4 rounded-[26px] border border-[color:color-mix(in_srgb,var(--brand)_12%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel-muted)_94%,var(--brand-soft)_6%),var(--panel))] p-5 shadow-panel-sm">
          <div className="grid gap-1.5">
            <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-text-soft">Momentum</div>
            <h3 className="font-display text-[clamp(1.18rem,1rem+0.5vw,1.55rem)] leading-[1.08] tracking-[-0.02em] text-text">Pertumbuhan 7 hari</h3>
            <p className="text-[0.95rem] text-text-muted">Fokus pada akun yang paling cepat bertambah selama seminggu terakhir.</p>
          </div>
          <ol className="grid gap-3">
            {topGrowthRows.map((row) => (
              <li key={row.account} className="grid gap-1.5 rounded-[18px] border border-[color:color-mix(in_srgb,var(--brand)_12%,var(--border))] bg-[color:color-mix(in_srgb,var(--panel)_92%,transparent)] px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold text-text">@{row.account}</span>
                  <span className="text-[0.9rem] font-semibold text-brand">{row.pct_change_7d.toFixed(2)}%</span>
                </div>
                <span className="text-[0.88rem] text-text-muted">{formatInteger.format(row.followers_change_7d)} followers dalam 7 hari.</span>
              </li>
            ))}
          </ol>
        </article>
      </div>

      <article className="grid gap-4 rounded-[28px] border border-[color:color-mix(in_srgb,var(--brand)_12%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_95%,var(--brand-soft)_5%),var(--panel))] p-5 shadow-panel-sm">
        <div className="flex flex-col gap-3 desktop:flex-row desktop:items-end desktop:justify-between">
          <div className="grid gap-1.5">
            <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-text-soft">Deep Dive Table</div>
            <h3 className="font-display text-[clamp(1.15rem,1rem+0.45vw,1.55rem)] leading-[1.1] tracking-[-0.02em] text-text">Tabel kompetitor penuh</h3>
            <p className="max-w-[60ch] text-[0.95rem] text-text-muted">
              Urutkan kolom untuk membaca gap brand, status verified, dan metrik akun dengan detail penuh.
              Bagian ini sengaja dibuat lebih teknis sebagai lapisan kedua setelah leaderboard ringkas di atas.
            </p>
          </div>
          <div className="inline-flex w-fit rounded-full border border-[color:color-mix(in_srgb,var(--brand)_14%,var(--border))] bg-[linear-gradient(180deg,var(--brand-soft),color-mix(in_srgb,var(--brand-soft-2)_72%,var(--panel)))] px-3 py-1.5 text-xs font-bold text-brand">
            Klik header tabel untuk mengurutkan
          </div>
        </div>
        <div className="w-full overflow-x-auto rounded-[22px] border border-[color:color-mix(in_srgb,var(--brand)_10%,var(--border))] bg-[color:color-mix(in_srgb,var(--panel)_92%,transparent)]">
          <table className="w-full min-w-[980px] border-collapse">
            <thead>
              <tr>
                {SORT_LABELS.map((column) => (
                  <th key={column.key} aria-sort={getAriaSort(column.key)} className="border-b border-border bg-[color:color-mix(in_srgb,var(--panel-muted)_88%,var(--panel))] px-[12px] py-3.5 text-left text-[0.78rem] font-extrabold uppercase tracking-[0.08em] text-text-soft">
                    <button type="button" className="inline-flex items-center gap-1.5 bg-transparent p-0 text-inherit" onClick={() => handleSort(column.key)}>
                      <span>{column.label}</span>
                      <span className={`text-[0.72rem] ${sortKey === column.key ? 'text-brand' : 'text-text-soft'}`} aria-hidden="true">
                        {sortKey === column.key ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.account} className="transition-colors hover:bg-[color:color-mix(in_srgb,var(--brand-soft)_36%,transparent)]">
                  <td className="border-b border-border px-[12px] py-3 text-[0.92rem] text-text">#{row.rank}</td>
                  <td className="border-b border-border px-[12px] py-3 text-[0.92rem] font-semibold text-text">@{row.account}</td>
                  <td className="border-b border-border px-[12px] py-3 text-[0.92rem] text-text">{formatInteger.format(row.followers)}</td>
                  <td className="border-b border-border px-[12px] py-3 text-[0.92rem] text-text">{formatInteger.format(row.following)}</td>
                  <td className="border-b border-border px-[12px] py-3 text-[0.92rem] text-text">{formatInteger.format(row.posts)}</td>
                  <td className="border-b border-border px-[12px] py-3 text-[0.92rem] text-text">{formatInteger.format(Math.round(row.avgLikes))}</td>
                  <td className="border-b border-border px-[12px] py-3 text-[0.92rem] text-text">{row.avgComments.toFixed(2)}</td>
                  <td className="border-b border-border px-[12px] py-3 text-[0.92rem] text-text">{row.engagementRate.toFixed(2)}%</td>
                  <td className="border-b border-border px-[12px] py-3 text-[0.92rem] text-text">{row.verified ? 'Ya' : 'Tidak'}</td>
                  <td className={`border-b border-border px-[12px] py-3 text-[0.92rem] ${row.gapVsBrand >= 0 ? 'text-success' : 'text-danger'}`}>
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
