import { getContentHighlights } from '../data/selectors'
import type { DashboardRecord } from '../data/types'
import { formatEngagementRate, formatInteger } from '../utils/formatters'
import { EmptyState } from './ui'

export function ContentBreakdownPresentation({ data }: { data: DashboardRecord }) {
  const latest = data.latest
  const highlights = getContentHighlights(data)
  const perAccount = data.accounts.map((account) => {
    const breakdown = data.content_breakdown?.[account]
    const posts = breakdown?.posts ?? latest[account]?.posts ?? 0
    return {
      account,
      posts,
      reels: breakdown?.reels,
      carousels: breakdown?.carousels,
      images: breakdown?.images,
      videos: breakdown?.videos,
      bestPost: breakdown?.bestPost,
    }
  })

  const meaningful = perAccount.filter((row) => (row.posts ?? 0) > 0)
  const maxPosts = meaningful.length ? Math.max(...meaningful.map((row) => row.posts)) : 1

  return (
    <div className="grid gap-6">
      {/* Stat-Led lead — dominant media type */}
      <div className="border-b border-[var(--border)] pb-6">
        <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
          Format dominan
        </p>
        <p className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-normal tracking-[-0.03em] text-[var(--text)]">
          {highlights.topFormatLabel}
        </p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {highlights.topFormatCount > 0
            ? `${formatInteger(highlights.topFormatCount)} post · ER top ${
                highlights.topErAccount
                  ? `@${highlights.topErAccount} (${formatEngagementRate(highlights.topErValue)})`
                  : '-'
              }`
            : 'Belum ada data konten.'}
        </p>
      </div>

      {/* Secondary KPIs as hairline table */}
      <div className="grid sm:grid-cols-2">
        <div className="flex items-baseline justify-between gap-4 border-t border-[var(--border)] py-3">
          <p className="text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
            ER tertinggi
          </p>
          <div className="text-right">
            <p className="font-display text-xl font-normal text-[var(--text)]">
              {highlights.topErAccount ? `@${highlights.topErAccount}` : '-'}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {highlights.topErAccount ? formatEngagementRate(highlights.topErValue) : '-'}
            </p>
          </div>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-[var(--border)] py-3">
          <p className="text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
            Best post
          </p>
          <div className="text-right">
            <p className="font-display text-xl font-normal text-[var(--text)]">
              {highlights.bestPostOwner ? `@${highlights.bestPostOwner}` : '-'}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {highlights.bestPostOwner
                ? `${formatInteger(highlights.bestPostLikes)} interactions`
                : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown table + solid brand progress bars */}
      {meaningful.length ? (
        <section className="border border-[var(--border)] bg-[var(--panel)] p-6">
          <h2 className="text-lg font-semibold text-[var(--text)]">Format konten per akun</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr>
                  <th className="pb-2 pr-3 text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
                    Account
                  </th>
                  <th className="pb-2 pr-3 text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
                    Posts
                  </th>
                  <th className="pb-2 pr-3 text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
                    Mix
                  </th>
                  <th className="pb-2 pr-3 text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
                    Share
                  </th>
                  <th className="pb-2 text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
                    Best
                  </th>
                </tr>
              </thead>
              <tbody>
                {meaningful.map((row) => (
                  <tr key={row.account} className="border-t border-[var(--border)]">
                    <td className="py-3 pr-3 font-semibold text-[var(--text)]">@{row.account}</td>
                    <td className="py-3 pr-3 font-display text-base font-normal text-[var(--text)]">
                      {row.posts}
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex flex-wrap gap-1">
                        {typeof row.reels === 'number' && row.reels > 0 ? (
                          <span className="rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                            Reels {row.reels}
                          </span>
                        ) : null}
                        {typeof row.carousels === 'number' && row.carousels > 0 ? (
                          <span className="rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                            Carousel {row.carousels}
                          </span>
                        ) : null}
                        {typeof row.images === 'number' && row.images > 0 ? (
                          <span className="rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                            Image {row.images}
                          </span>
                        ) : null}
                        {typeof row.videos === 'number' && row.videos > 0 ? (
                          <span className="rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                            Video {row.videos}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-3 pr-3 min-w-[8rem]">
                      <div className="h-2 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--panel-muted)]">
                        <div
                          className="h-full rounded-[var(--radius-sm)] bg-[var(--brand)]"
                          style={{ width: `${(row.posts / maxPosts) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 text-[var(--text-muted)]">
                      {row.bestPost?.interactions ? (
                        <span>
                          {formatInteger(row.bestPost.interactions)} int.
                          {row.bestPost.url ? (
                            <>
                              {' · '}
                              <a
                                className="text-[var(--brand)] hover:underline"
                                href={row.bestPost.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Lihat
                              </a>
                            </>
                          ) : null}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <EmptyState>Data content breakdown belum tersedia.</EmptyState>
      )}
    </div>
  )
}
