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
      description="Bagian ini dirancang seperti chapter performa konten: highlight utama lebih dulu, lalu breakdown per akun sebagai bukti pendukung."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <article className="grid gap-2 rounded-[1.5rem] border border-[color:color-mix(in_srgb,var(--brand)_18%,white)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_18%,white),rgba(255,255,255,0.92))] p-4 shadow-[0_18px_46px_-42px_rgba(15,23,42,0.38)] dark:border-[color:color-mix(in_srgb,var(--brand)_20%,transparent)] dark:bg-[linear-gradient(180deg,rgba(51,65,85,0.7),rgba(15,23,42,0.56))]">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Format terbanyak</div>
          <div className="font-display text-[clamp(1.4rem,1.18rem+0.55vw,1.95rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-[var(--brand)]">{highlights.topFormatLabel}</div>
          <div className="text-[0.9rem] leading-6 text-slate-600 dark:text-slate-300">{highlights.topFormatCount > 0 ? `${highlights.topFormatCount} post pada dataset terbaru` : 'Belum ada data format.'}</div>
        </article>
        <article className="grid gap-2 rounded-[1.5rem] border border-slate-200/80 bg-white/74 p-4 shadow-[0_18px_46px_-42px_rgba(15,23,42,0.36)] dark:border-white/10 dark:bg-slate-950/44">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">ER tertinggi</div>
          <div className="font-display text-[clamp(1.4rem,1.18rem+0.55vw,1.95rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-slate-950 dark:text-white">{highlights.topErAccount ? `@${highlights.topErAccount}` : '-'}</div>
          <div className="text-[0.9rem] leading-6 text-slate-600 dark:text-slate-300">{highlights.topErAccount ? `${highlights.topErValue.toFixed(2)}% engagement rate` : 'Belum ada data ER.'}</div>
        </article>
        <article className="grid gap-2 rounded-[1.5rem] border border-slate-200/80 bg-white/74 p-4 shadow-[0_18px_46px_-42px_rgba(15,23,42,0.36)] dark:border-white/10 dark:bg-slate-950/44">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Best post owner</div>
          <div className="font-display text-[clamp(1.4rem,1.18rem+0.55vw,1.95rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-slate-950 dark:text-white">{highlights.bestPostOwner ? `@${highlights.bestPostOwner}` : '-'}</div>
          <div className="text-[0.9rem] leading-6 text-slate-600 dark:text-slate-300">
            {highlights.bestPostOwner ? `${highlights.bestPostLikes} interactions${highlights.bestPostType ? ` · ${highlights.bestPostType}` : ''}` : 'Belum ada best post.'}
          </div>
        </article>
      </div>

      {meaningful.length ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {meaningful.map((row) => (
            <article key={row.account} className="grid gap-4 rounded-[1.6rem] border border-slate-200/80 bg-white/76 p-5 shadow-[0_18px_46px_-42px_rgba(15,23,42,0.36)] dark:border-white/10 dark:bg-slate-950/44">
              <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">@{row.account}</div>
              <div className="font-display text-[clamp(1.8rem,1.4rem+0.7vw,2.35rem)] font-semibold leading-none tracking-[-0.04em] text-slate-950 dark:text-white">{row.posts} post</div>
              <div className="flex flex-wrap gap-2">
                {typeof row.reels === 'number' ? <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-1 text-[0.78rem] font-semibold text-brand">Reels {row.reels}</span> : null}
                {typeof row.carousels === 'number' ? <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-1 text-[0.78rem] font-semibold text-brand">Carousel {row.carousels}</span> : null}
                {typeof row.images === 'number' ? <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-1 text-[0.78rem] font-semibold text-brand">Image {row.images}</span> : null}
                {typeof row.videos === 'number' ? <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-1 text-[0.78rem] font-semibold text-brand">Video {row.videos}</span> : null}
              </div>
              <div className="text-[0.9rem] leading-6 text-slate-600 dark:text-slate-300">Volume posting relatif terhadap akun lain pada snapshot terbaru.</div>
              <div className="h-2 rounded-full bg-slate-200/80 dark:bg-white/10" aria-label={`posts-${row.account}`}>
                <div className="h-2 rounded-full bg-[linear-gradient(90deg,var(--accent),var(--brand))]" style={{ width: `${(row.posts / maxPosts) * 100}%` }} />
              </div>
              {row.bestPost ? (
                <div className="grid gap-1 rounded-[1.2rem] border border-slate-200/80 bg-slate-50/85 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Best Post</div>
                  <div className="text-base font-semibold text-slate-950 dark:text-white">{row.bestPost.type ?? 'Format belum diketahui'}</div>
                  <div className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {typeof row.bestPost.interactions === 'number' ? `${row.bestPost.interactions} interactions` : 'Interaksi belum tersedia'}
                  </div>
                  {row.bestPost.url ? (
                    <a className="text-sm font-medium text-[var(--brand)] hover:underline" href={row.bestPost.url} target="_blank" rel="noreferrer">
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
