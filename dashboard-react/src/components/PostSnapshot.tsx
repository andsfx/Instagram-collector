import type { DashboardRecord } from '../data/types'
import { formatInteger, formatPostDate, getLatestPost } from '../data/selectors'
import { EmptyState, SectionCard } from './ui'

export function PostSnapshot({ data }: { data: DashboardRecord }) {
  const snapshot = (data.rankings.by_followers ?? []).slice(0, 4).map((rankingRow) => {
    const postInsight = data.post_insights?.[rankingRow.account]
    const latestPost = getLatestPost(postInsight?.posts) ?? postInsight?.top_interactions?.[0] ?? null

    return {
      account: rankingRow.account,
      followers: rankingRow.followers,
      latestPost,
    }
  })

  return (
    <SectionCard
      eyebrow="Post Snapshot"
      title="Cuplikan posting terbaru dari akun paling besar"
      description="Migrasi awal ini belum memindahkan semua filter legacy, tetapi sudah memindahkan inti snapshot post-level yang paling berguna untuk monitoring harian."
    >
      {snapshot.length ? (
        <div className="snapshot-grid">
          {snapshot.map((row) => (
            <article key={row.account} className="snapshot-card">
              <div className="split-row">
                <div>
                  <div className="stat-label">@{row.account}</div>
                  <div className="big-value">{formatInteger.format(row.followers)}</div>
                </div>
                <span className="badge badge-brand">followers</span>
              </div>
              {row.latestPost ? (
                <div className="featured-post">
                  <div className="micro-label">Latest Post</div>
                  <div className="table-strong">{row.latestPost.type ?? 'Format tidak diketahui'}</div>
                  <div className="table-muted">Dipublikasikan {formatPostDate(row.latestPost.published_at ?? row.latestPost.timestamp)}</div>
                  <div className="chip-row">
                    <span className="chip chip-success">{row.latestPost.interactions ?? 0} interactions</span>
                    {typeof row.latestPost.likes === 'number' ? <span className="chip chip-brand">{row.latestPost.likes} likes</span> : null}
                    {typeof row.latestPost.comments === 'number' ? <span className="chip chip-warning">{row.latestPost.comments} comments</span> : null}
                  </div>
                  {row.latestPost.url ? (
                    <a className="accent-link" href={row.latestPost.url} target="_blank" rel="noreferrer">
                      Buka postingan
                    </a>
                  ) : null}
                </div>
              ) : (
                <EmptyState>Belum ada data posting terbaru untuk akun ini.</EmptyState>
              )}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState>Data snapshot posting belum tersedia dari pipeline saat ini.</EmptyState>
      )}
    </SectionCard>
  )
}
