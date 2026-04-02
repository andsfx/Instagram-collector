import { getContentHighlights } from '../data/selectors'
import type { DashboardRecord } from '../data/types'
import { EmptyState, SectionCard } from './ui'

export function ContentBreakdown({ data }: { data: DashboardRecord }) {
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
    <SectionCard
      eyebrow="Content Breakdown"
      title="Komposisi format konten per akun"
      description="Ringkasan ini fokus pada distribusi format dan best post, agar tim cepat melihat pola konten dominan tanpa tabel panjang."
    >
      <div className="summary-strip-grid">
        <article className="summary-strip-card">
          <div className="stat-label">Format terbanyak</div>
          <div className="big-value">{highlights.topFormatLabel}</div>
          <div className="helper-copy">{highlights.topFormatCount > 0 ? `${highlights.topFormatCount} post pada dataset terbaru` : 'Belum ada data format.'}</div>
        </article>
        <article className="summary-strip-card">
          <div className="stat-label">ER tertinggi</div>
          <div className="big-value">{highlights.topErAccount ? `@${highlights.topErAccount}` : '-'}</div>
          <div className="helper-copy">{highlights.topErAccount ? `${highlights.topErValue.toFixed(2)}% engagement rate` : 'Belum ada data ER.'}</div>
        </article>
        <article className="summary-strip-card">
          <div className="stat-label">Best post owner</div>
          <div className="big-value">{highlights.bestPostOwner ? `@${highlights.bestPostOwner}` : '-'}</div>
          <div className="helper-copy">
            {highlights.bestPostOwner ? `${highlights.bestPostLikes} interactions${highlights.bestPostType ? ` · ${highlights.bestPostType}` : ''}` : 'Belum ada best post.'}
          </div>
        </article>
      </div>
      {meaningful.length ? (
        <div className="breakdown-grid">
          {meaningful.map((row) => (
            <article key={row.account} className="breakdown-card">
              <div className="stat-label">@{row.account}</div>
              <div className="big-value">{row.posts} post</div>
              <div className="chip-row">
                {typeof row.reels === 'number' ? <span className="chip chip-brand">Reels {row.reels}</span> : null}
                {typeof row.carousels === 'number' ? <span className="chip chip-brand">Carousel {row.carousels}</span> : null}
                {typeof row.images === 'number' ? <span className="chip chip-brand">Image {row.images}</span> : null}
                {typeof row.videos === 'number' ? <span className="chip chip-brand">Video {row.videos}</span> : null}
              </div>
              <div className="helper-copy">Volume posting relatif terhadap akun lain pada snapshot terbaru.</div>
              <div className="breakdown-progress" aria-label={`posts-${row.account}`}>
                <div className="breakdown-progress-fill" style={{ width: `${(row.posts / maxPosts) * 100}%` }} />
              </div>
              {row.bestPost ? (
                <div className="featured-post">
                  <div className="micro-label">Best Post</div>
                  <div className="table-strong">{row.bestPost.type ?? 'Format belum diketahui'}</div>
                  <div className="table-muted">
                    {typeof row.bestPost.interactions === 'number' ? `${row.bestPost.interactions} interactions` : 'Interaksi belum tersedia'}
                  </div>
                  {row.bestPost.url ? (
                    <a className="accent-link" href={row.bestPost.url} target="_blank" rel="noreferrer">
                      Buka postingan terbaik
                    </a>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState>Data breakdown konten belum tersedia dari pipeline saat ini.</EmptyState>
      )}
    </SectionCard>
  )
}
