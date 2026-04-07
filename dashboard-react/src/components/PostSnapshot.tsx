import { useMemo, useState } from 'react'
import { type PostPerformanceFilter, type PostSnapshotSort, formatInteger, formatPostDate, getPostSnapshotView } from '../data/selectors'
import type { DashboardRecord } from '../data/types'
import { EmptyState, SectionCard } from './ui'

const SORT_OPTIONS: Array<{ value: PostSnapshotSort; label: string }> = [
  { value: 'viral_posts', label: 'Viral terbanyak' },
  { value: 'average_post_er', label: 'Rata-rata ER tertinggi' },
  { value: 'average_likes', label: 'Rata-rata likes tertinggi' },
  { value: 'campaign_terms', label: 'Tema campaign terbanyak' },
  { value: 'username', label: 'Username A-Z' },
]

const FILTER_OPTIONS: Array<{ value: PostPerformanceFilter; label: string }> = [
  { value: 'all', label: 'Semua status' },
  { value: 'viral', label: 'Viral' },
  { value: 'normal', label: 'Normal' },
  { value: 'underperform', label: 'Underperform' },
]

export function PostSnapshot({ data }: { data: DashboardRecord }) {
  const [selectedAccount, setSelectedAccount] = useState<string>('all')
  const [sortBy, setSortBy] = useState<PostSnapshotSort>('viral_posts')
  const [filterBy, setFilterBy] = useState<PostPerformanceFilter>('all')

  const view = useMemo(() => getPostSnapshotView(data, selectedAccount, sortBy, filterBy), [data, filterBy, selectedAccount, sortBy])

  return (
    <SectionCard
      eyebrow="Post Snapshot"
      title="12-post snapshot lintas akun"
      description="Snapshot ini diubah menjadi daftar bukti performa, dengan kontrol di atas dan account evidence yang lebih mirip briefing sheet daripada kartu-kartu mandiri."
    >
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1.5">
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Akun</span>
          <select className="rounded-[1rem] border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-200" value={selectedAccount} onChange={(event) => setSelectedAccount(event.target.value)}>
            <option value="all">Semua akun</option>
            {view.accounts.map((account) => <option key={account} value={account}>@{account}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Urutan akun</span>
          <select className="rounded-[1rem] border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-200" value={sortBy} onChange={(event) => setSortBy(event.target.value as PostSnapshotSort)}>
            {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Filter performa</span>
          <select className="rounded-[1rem] border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-200" value={filterBy} onChange={(event) => setFilterBy(event.target.value as PostPerformanceFilter)}>
            {FILTER_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-4 border-t border-slate-200/80 pt-5 dark:border-white/10 md:grid-cols-5 md:gap-6">
        {view.summaryCards.map((card) => (
          <article key={card.label} className="grid gap-1.5">
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{card.label}</div>
            <div className={`font-display text-[clamp(1.15rem,1rem+0.4vw,1.5rem)] font-semibold tracking-[-0.03em] ${card.label === 'Total post teranalisis' ? 'text-[var(--brand)]' : 'text-slate-950 dark:text-white'}`}>{card.value}</div>
          </article>
        ))}
      </div>

      {view.cards.length ? (
        <div className="grid gap-5 border-t border-slate-200/80 pt-6 dark:border-white/10">
          {view.cards.map((card) => (
            <article key={card.account} className="grid gap-4 border-b border-slate-200/70 pb-5 last:border-b-0 last:pb-0 dark:border-white/10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-8">
              <div className="grid gap-3">
                <div className="flex items-end justify-between gap-4">
                  <div className="grid gap-1">
                    <div className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">@{card.account}</div>
                    <div className="font-display text-[clamp(1.75rem,1.45rem+0.68vw,2.25rem)] font-semibold leading-none tracking-[-0.05em] text-slate-950 dark:text-white">
                      {card.averagePostEr > 0 ? `${(card.averagePostEr * 100).toFixed(2)}%` : '-'}
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-[0.72rem] font-semibold text-brand">ER rata-rata</span>
                </div>

                <div className="grid gap-2 text-[0.92rem]">
                  <div className="flex items-center justify-between gap-3"><span className="text-slate-500 dark:text-slate-400">Avg Likes</span><span className="font-semibold text-slate-950 dark:text-white">{formatInteger.format(Math.round(card.averageLikes))}</span></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-slate-500 dark:text-slate-400">Avg Comments</span><span className="font-semibold text-slate-950 dark:text-white">{formatInteger.format(Math.round(card.averageComments))}</span></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-slate-500 dark:text-slate-400">Viral Posts</span><span className="font-semibold text-slate-950 dark:text-white">{card.viralPosts}</span></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-slate-500 dark:text-slate-400">Underperform</span><span className="font-semibold text-slate-950 dark:text-white">{card.underperformPosts}</span></div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-1 text-[0.78rem] font-semibold text-brand">{card.dominantType ?? 'unknown'}</span>
                  {card.campaignTerms.slice(0, 2).map((term) => <span key={term} className="inline-flex items-center rounded-full bg-warning-soft px-2.5 py-1 text-[0.78rem] font-semibold text-warning">{term}</span>)}
                </div>

                <div className="text-[0.9rem] leading-6 text-slate-600 dark:text-slate-300">{card.insightText}</div>
              </div>

              <div className="grid gap-2 border-t border-slate-200/70 pt-4 dark:border-white/10 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Highlighted post</div>
                {card.featuredPost ? (
                  <>
                    <div className="text-base font-semibold text-slate-950 dark:text-white">{card.featuredPost.type ?? 'Format tidak diketahui'}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Dipublikasikan {formatPostDate(card.featuredPost.published_at ?? card.featuredPost.timestamp)}</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-success-soft px-2.5 py-1 text-[0.78rem] font-semibold text-success">{card.featuredPost.performance_label ?? 'n/a'}</span>
                      <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-1 text-[0.78rem] font-semibold text-brand">{card.featuredPost.interactions ?? 0} interactions</span>
                    </div>
                    {card.topHashtags.length ? <div className="text-[0.84rem] leading-6 text-slate-600 dark:text-slate-300">{card.topHashtags.slice(0, 3).join(' ')}</div> : null}
                    {card.featuredPost.url ? (
                      <a className="text-sm font-medium text-[var(--brand)] hover:underline" href={card.featuredPost.url} target="_blank" rel="noreferrer">
                        Buka postingan
                      </a>
                    ) : null}
                  </>
                ) : (
                  <EmptyState>Tidak ada postingan sesuai filter.</EmptyState>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState>Tidak ada akun atau postingan yang sesuai dengan filter saat ini.</EmptyState>
      )}
    </SectionCard>
  )
}
