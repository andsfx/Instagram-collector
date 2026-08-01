import { useMemo, useState } from 'react'
import {
  type PostPerformanceFilter,
  type PostSnapshotSort,
  formatPostDate,
  getPostSnapshotView,
} from '../data/selectors'
import type { DashboardRecord } from '../data/types'
import { formatEngagementRate, formatInteger } from '../utils/formatters'
import { EmptyState } from './ui'

const SORT_OPTIONS: Array<{ value: PostSnapshotSort; label: string }> = [
  { value: 'viral_posts', label: 'Viral terbanyak' },
  { value: 'average_post_er', label: 'ER tertinggi' },
  { value: 'average_likes', label: 'Likes tertinggi' },
  { value: 'campaign_terms', label: 'Campaign terbanyak' },
  { value: 'username', label: 'Username A-Z' },
]

const FILTER_OPTIONS: Array<{ value: PostPerformanceFilter; label: string }> = [
  { value: 'all', label: 'Semua' },
  { value: 'viral', label: 'Viral' },
  { value: 'normal', label: 'Normal' },
  { value: 'underperform', label: 'Underperform' },
]

export function PostSnapshot({ data }: { data: DashboardRecord }) {
  const [selectedAccount, setSelectedAccount] = useState<string>('all')
  const [sortBy, setSortBy] = useState<PostSnapshotSort>('viral_posts')
  const [filterBy, setFilterBy] = useState<PostPerformanceFilter>('all')
  const view = useMemo(
    () => getPostSnapshotView(data, selectedAccount, sortBy, filterBy),
    [data, filterBy, selectedAccount, sortBy],
  )

  return (
    <div className="grid gap-6">
      {/* Filters — flat, radius-sm, no pills */}
      <section className="border border-[var(--border)] bg-[var(--panel)] p-6">
        <h2 className="text-lg font-semibold text-[var(--text)]">12-post snapshot per akun</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1">
            <span className="text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
              Akun
            </span>
            <select
              className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--text)]"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
            >
              <option value="all">Semua akun</option>
              {view.accounts.map((a) => (
                <option key={a} value={a}>
                  @{a}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
              Urutan
            </span>
            <select
              className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--text)]"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as PostSnapshotSort)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
              Filter
            </span>
            <select
              className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--text)]"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as PostPerformanceFilter)}
            >
              {FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Summary as hairline table row */}
        {view.summaryCards.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-x-4 sm:grid-cols-5">
            {view.summaryCards.map((card) => (
              <div key={card.label} className="border-t border-[var(--border)] py-3">
                <p className="text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
                  {card.label}
                </p>
                <p className="mt-0.5 font-display text-lg font-normal text-[var(--text)]">
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Editorial post table */}
      {view.cards.length ? (
        <section className="border border-[var(--border)] bg-[var(--panel-muted)] p-6">
          <h2 className="text-lg font-semibold text-[var(--text)]">Post list</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead>
                <tr>
                  <th className="pb-2 pr-3 text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
                    Account
                  </th>
                  <th className="pb-2 pr-3 text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
                    Type
                  </th>
                  <th className="pb-2 pr-3 text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
                    ER
                  </th>
                  <th className="pb-2 pr-3 text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
                    Avg likes
                  </th>
                  <th className="pb-2 pr-3 text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
                    Viral
                  </th>
                  <th className="pb-2 pr-3 text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
                    Date
                  </th>
                  <th className="pb-2 text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
                    Permalink
                  </th>
                </tr>
              </thead>
              <tbody>
                {view.cards.map((card) => {
                  const post = card.featuredPost
                  const dateLabel = post
                    ? formatPostDate(post.published_at ?? post.timestamp)
                    : '-'
                  return (
                    <tr key={card.account} className="border-t border-[var(--border)]">
                      <td className="py-3 pr-3 font-semibold text-[var(--text)]">
                        @{card.account}
                      </td>
                      <td className="py-3 pr-3">
                        <span className="inline-block rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                          {card.dominantType ?? 'unknown'}
                        </span>
                      </td>
                      <td className="py-3 pr-3 font-display text-base font-normal text-[var(--text)]">
                        {card.averagePostEr > 0
                          ? formatEngagementRate(card.averagePostEr * 100)
                          : '-'}
                      </td>
                      <td className="py-3 pr-3 text-[var(--text)]">
                        {formatInteger(Math.round(card.averageLikes))}
                      </td>
                      <td className="py-3 pr-3 text-[var(--text)]">
                        {formatInteger(card.viralPosts)}
                        <span className="text-[var(--text-muted)]">
                          {' / '}
                          {formatInteger(card.underperformPosts)} und.
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-[var(--text-muted)]">{dateLabel}</td>
                      <td className="py-3">
                        {post?.url ? (
                          <a
                            className="text-[var(--brand)] hover:underline"
                            href={post.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Buka post
                          </a>
                        ) : (
                          <span className="text-[var(--text-muted)]">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <EmptyState>Tidak ada data sesuai filter.</EmptyState>
      )}
    </div>
  )
}
