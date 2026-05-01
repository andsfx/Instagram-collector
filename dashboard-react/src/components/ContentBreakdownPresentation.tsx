import { getContentHighlights } from '../data/selectors'
import type { DashboardRecord } from '../data/types'
import { EmptyState, SectionCard } from './ui'

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
    <SectionCard eyebrow="Content Breakdown" title="Format konten per akun">
      {/* KPI Strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--panel)] p-3 shadow-[var(--shadow-sm)]">
          <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">Format terbanyak</div>
          <div className="mt-1 font-display text-lg font-extrabold text-[var(--brand)]">{highlights.topFormatLabel}</div>
          <div className="text-xs text-[var(--text-muted)]">{highlights.topFormatCount} post</div>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--panel)] p-3 shadow-[var(--shadow-sm)]">
          <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">ER tertinggi</div>
          <div className="mt-1 font-display text-lg font-extrabold text-[var(--text)]">{highlights.topErAccount ? `@${highlights.topErAccount}` : '-'}</div>
          <div className="text-xs text-[var(--text-muted)]">{highlights.topErAccount ? `${highlights.topErValue.toFixed(2)}%` : '-'}</div>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--panel)] p-3 shadow-[var(--shadow-sm)]">
          <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">Best post</div>
          <div className="mt-1 font-display text-lg font-extrabold text-[var(--text)]">{highlights.bestPostOwner ? `@${highlights.bestPostOwner}` : '-'}</div>
          <div className="text-xs text-[var(--text-muted)]">{highlights.bestPostOwner ? `${highlights.bestPostLikes} interactions` : '-'}</div>
        </div>
      </div>

      {/* Per-account rows */}
      {meaningful.length ? (
        <div className="grid gap-3">
          {meaningful.map((row) => (
            <div key={row.account} className="flex items-center gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--panel)] p-3 shadow-[var(--shadow-sm)]">
              <div className="min-w-[140px]">
                <div className="text-xs font-bold text-[var(--text)]">@{row.account}</div>
                <div className="font-display text-base font-extrabold text-[var(--text)]">{row.posts} post</div>
              </div>
              <div className="flex-1">
                <div className="h-2 rounded-full bg-[var(--panel-muted)]">
                  <div className="h-2 rounded-full bg-[image:var(--ig-gradient)]" style={{ width: `${(row.posts / maxPosts) * 100}%` }} />
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {typeof row.reels === 'number' && row.reels > 0 ? <span className="rounded-[var(--radius-pill)] bg-[rgba(225,48,108,0.1)] px-2 py-0.5 text-[10px] font-bold text-[var(--ig-pink)]">Reels {row.reels}</span> : null}
                {typeof row.carousels === 'number' && row.carousels > 0 ? <span className="rounded-[var(--radius-pill)] bg-[rgba(64,93,230,0.1)] px-2 py-0.5 text-[10px] font-bold text-[var(--ig-blue)]">Carousel {row.carousels}</span> : null}
                {typeof row.images === 'number' && row.images > 0 ? <span className="rounded-[var(--radius-pill)] bg-[rgba(247,119,55,0.1)] px-2 py-0.5 text-[10px] font-bold text-[var(--ig-orange)]">Image {row.images}</span> : null}
                {typeof row.videos === 'number' && row.videos > 0 ? <span className="rounded-[var(--radius-pill)] bg-[rgba(131,58,180,0.1)] px-2 py-0.5 text-[10px] font-bold text-[var(--ig-purple)]">Video {row.videos}</span> : null}
              </div>
              {row.bestPost?.interactions ? (
                <div className="text-right text-xs">
                  <div className="font-bold text-[var(--text)]">{row.bestPost.interactions} int.</div>
                  {row.bestPost.url ? <a className="text-[var(--brand)] hover:underline" href={row.bestPost.url} target="_blank" rel="noreferrer">Lihat</a> : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState>Data content breakdown belum tersedia.</EmptyState>
      )}
    </SectionCard>
  )
}