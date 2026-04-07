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
    <SectionCard
      eyebrow="Content Breakdown"
      title="Komposisi format konten per akun"
      description="Chapter ini diubah menjadi pembacaan konten yang lebih editorial: headline insight dulu, lalu bukti per akun dalam baris-baris yang lebih tenang."
    >
      <div className="grid gap-4 border-t border-slate-200/80 pt-5 dark:border-white/10 md:grid-cols-3 md:gap-6">
        <article className="grid gap-1.5">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Format terbanyak</div>
          <div className="font-display text-[clamp(1.55rem,1.3rem+0.6vw,2.1rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-[var(--brand)]">{highlights.topFormatLabel}</div>
          <div className="text-[0.9rem] leading-6 text-slate-600 dark:text-slate-300">{highlights.topFormatCount > 0 ? `${highlights.topFormatCount} post pada dataset terbaru` : 'Belum ada data format.'}</div>
        </article>
        <article className="grid gap-1.5">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">ER tertinggi</div>
          <div className="font-display text-[clamp(1.55rem,1.3rem+0.6vw,2.1rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-slate-950 dark:text-white">{highlights.topErAccount ? `@${highlights.topErAccount}` : '-'}</div>
          <div className="text-[0.9rem] leading-6 text-slate-600 dark:text-slate-300">{highlights.topErAccount ? `${highlights.topErValue.toFixed(2)}% engagement rate` : 'Belum ada data ER.'}</div>
        </article>
        <article className="grid gap-1.5">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Best post owner</div>
          <div className="font-display text-[clamp(1.55rem,1.3rem+0.6vw,2.1rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-slate-950 dark:text-white">{highlights.bestPostOwner ? `@${highlights.bestPostOwner}` : '-'}</div>
          <div className="text-[0.9rem] leading-6 text-slate-600 dark:text-slate-300">
            {highlights.bestPostOwner ? `${highlights.bestPostLikes} interactions${highlights.bestPostType ? ` · ${highlights.bestPostType}` : ''}` : 'Belum ada best post.'}
          </div>
        </article>
      </div>

      {meaningful.length ? (
        <div className="grid gap-5 border-t border-slate-200/80 pt-6 dark:border-white/10">
          {meaningful.map((row) => (
            <article key={row.account} className="grid gap-4 border-b border-slate-200/70 pb-5 last:border-b-0 last:pb-0 dark:border-white/10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-8">
              <div className="grid gap-3">
                <div className="flex items-end justify-between gap-4">
                  <div className="grid gap-1">
                    <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">@{row.account}</div>
                    <div className="font-display text-[clamp(1.9rem,1.55rem+0.72vw,2.45rem)] font-semibold leading-none tracking-[-0.05em] text-slate-950 dark:text-white">{row.posts} post</div>
                  </div>
                  <div className="text-[0.86rem] text-slate-500 dark:text-slate-400">Volume relatif snapshot terbaru</div>
                </div>
                <div className="h-2 rounded-full bg-slate-200/80 dark:bg-white/10" aria-label={`posts-${row.account}`}>
                  <div className="h-2 rounded-full bg-[linear-gradient(90deg,var(--accent),var(--brand))]" style={{ width: `${(row.posts / maxPosts) * 100}%` }} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {typeof row.reels === 'number' ? <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-1 text-[0.78rem] font-semibold text-brand">Reels {row.reels}</span> : null}
                  {typeof row.carousels === 'number' ? <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-1 text-[0.78rem] font-semibold text-brand">Carousel {row.carousels}</span> : null}
                  {typeof row.images === 'number' ? <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-1 text-[0.78rem] font-semibold text-brand">Image {row.images}</span> : null}
                  {typeof row.videos === 'number' ? <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-1 text-[0.78rem] font-semibold text-brand">Video {row.videos}</span> : null}
                </div>
              </div>

              <div className="grid gap-2 border-t border-slate-200/70 pt-4 dark:border-white/10 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Best post evidence</div>
                {row.bestPost ? (
                  <>
                    <div className="text-base font-semibold text-slate-950 dark:text-white">{row.bestPost.type ?? 'Format belum diketahui'}</div>
                    <div className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {typeof row.bestPost.interactions === 'number' ? `${row.bestPost.interactions} interactions` : 'Interaksi belum tersedia'}
                    </div>
                    {row.bestPost.url ? (
                      <a className="text-sm font-medium text-[var(--brand)] hover:underline" href={row.bestPost.url} target="_blank" rel="noreferrer">
                        Buka postingan terbaik
                      </a>
                    ) : null}
                  </>
                ) : (
                  <EmptyState>Belum ada best post untuk akun ini.</EmptyState>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState>Data breakdown konten belum tersedia dari pipeline saat ini.</EmptyState>
      )}
    </SectionCard>
  )
}
