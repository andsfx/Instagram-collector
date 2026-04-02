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
      <div className="grid gap-4 desktop:grid-cols-[minmax(0,1.15fr)_repeat(2,minmax(0,0.8fr))]">
        <article className="grid gap-3 rounded-[24px] border border-[color:color-mix(in_srgb,var(--brand)_22%,var(--border))] bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--brand-soft-2)_64%,transparent),transparent_40%),linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_72%,var(--panel)),var(--panel))] p-5 shadow-panel-md">
          <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">Format terbanyak</div>
          <div className="font-display text-[clamp(1.8rem,1.4rem+0.82vw,2.55rem)] leading-none text-brand-strong">{highlights.topFormatLabel}</div>
          <div className="max-w-[36ch] text-[0.95rem] leading-[1.65] text-text-muted">
            {highlights.topFormatCount > 0
              ? `${highlights.topFormatCount} post pada dataset terbaru. Ini jadi sinyal pembuka untuk membaca arah editorial konten kompetitor pada snapshot yang sama.`
              : 'Belum ada data format.'}
          </div>
        </article>
        <article className="rounded-[22px] border border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_88%,var(--brand-soft)_12%),var(--panel))] p-5 shadow-panel-sm">
          <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">ER tertinggi</div>
          <div className="mt-2.5 font-display text-[clamp(1.5rem,1.2rem+0.75vw,2.2rem)] leading-none text-brand-strong">{highlights.topErAccount ? `@${highlights.topErAccount}` : '-'}</div>
          <div className="mt-2.5 text-[0.92rem] leading-[1.6] text-text-muted">{highlights.topErAccount ? `${highlights.topErValue.toFixed(2)}% engagement rate` : 'Belum ada data ER.'}</div>
        </article>
        <article className="rounded-[22px] border border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_88%,var(--brand-soft)_12%),var(--panel))] p-5 shadow-panel-sm">
          <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">Best post owner</div>
          <div className="mt-2.5 font-display text-[clamp(1.5rem,1.2rem+0.75vw,2.2rem)] leading-none text-brand-strong">{highlights.bestPostOwner ? `@${highlights.bestPostOwner}` : '-'}</div>
          <div className="mt-2.5 text-[0.92rem] leading-[1.6] text-text-muted">{highlights.bestPostOwner ? `${highlights.bestPostLikes} interactions${highlights.bestPostType ? ` · ${highlights.bestPostType}` : ''}` : 'Belum ada best post.'}</div>
        </article>
      </div>
      {meaningful.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {meaningful.map((row) => (
            <article key={row.account} className="grid gap-4 rounded-[24px] border border-[color:color-mix(in_srgb,var(--brand)_12%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_90%,var(--brand-soft)_10%),var(--panel))] p-5 shadow-panel-sm">
              <div className="grid gap-2">
                <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">@{row.account}</div>
                <div className="font-display text-[clamp(1.5rem,1.2rem+0.75vw,2.2rem)] leading-none text-brand-strong">{row.posts} post</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {typeof row.reels === 'number' ? <span className="inline-flex rounded-full bg-[linear-gradient(180deg,var(--brand-soft),color-mix(in_srgb,var(--brand-soft-2)_72%,var(--panel)))] px-2.5 py-1.5 text-xs font-bold text-brand">Reels {row.reels}</span> : null}
                {typeof row.carousels === 'number' ? <span className="inline-flex rounded-full bg-[linear-gradient(180deg,var(--brand-soft),color-mix(in_srgb,var(--brand-soft-2)_72%,var(--panel)))] px-2.5 py-1.5 text-xs font-bold text-brand">Carousel {row.carousels}</span> : null}
                {typeof row.images === 'number' ? <span className="inline-flex rounded-full bg-[linear-gradient(180deg,var(--brand-soft),color-mix(in_srgb,var(--brand-soft-2)_72%,var(--panel)))] px-2.5 py-1.5 text-xs font-bold text-brand">Image {row.images}</span> : null}
                {typeof row.videos === 'number' ? <span className="inline-flex rounded-full bg-[linear-gradient(180deg,var(--brand-soft),color-mix(in_srgb,var(--brand-soft-2)_72%,var(--panel)))] px-2.5 py-1.5 text-xs font-bold text-brand">Video {row.videos}</span> : null}
              </div>
              <div className="text-[0.92rem] leading-[1.6] text-text-muted">Volume posting relatif terhadap akun lain pada snapshot terbaru.</div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between text-[0.8rem] uppercase tracking-[0.08em] text-text-soft">
                  <span>Volume relatif</span>
                  <span>{Math.round((row.posts / maxPosts) * 100)}%</span>
                </div>
                <div className="h-3.5 w-full overflow-hidden rounded-full bg-[color:color-mix(in_srgb,var(--brand-soft)_34%,var(--panel))]">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--brand),var(--accent))]" style={{ width: `${(row.posts / maxPosts) * 100}%` }} />
                </div>
              </div>
              {row.bestPost ? (
                <div className="grid gap-2.5 rounded-panel-sm border border-[color:color-mix(in_srgb,var(--brand)_16%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft-2)_72%,var(--panel)),color-mix(in_srgb,var(--brand-soft)_82%,var(--panel)))] p-[14px]">
                  <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">Best Post</div>
                  <div className="font-semibold text-text">{row.bestPost.type ?? 'Format belum diketahui'}</div>
                  <div className="text-sm text-text-muted">{typeof row.bestPost.interactions === 'number' ? `${row.bestPost.interactions} interactions` : 'Interaksi belum tersedia'}</div>
                  {row.bestPost.url ? <a className="font-bold text-accent underline-offset-4 hover:underline" href={row.bestPost.url} target="_blank" rel="noreferrer">Buka postingan terbaik</a> : null}
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
