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
      description="Snapshot ini dipadatkan untuk presentasi: kontrol tetap lengkap, tetapi kartu akun dan highlighted post sekarang lebih mudah dipindai di desktop maupun mobile."
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {view.summaryCards.map((card) => (
          <article key={card.label} className={`grid gap-1.5 rounded-[1.3rem] border p-4 ${card.label === 'Total post teranalisis' ? 'border-[color:color-mix(in_srgb,var(--brand)_18%,white)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_18%,white),rgba(255,255,255,0.92))] dark:border-[color:color-mix(in_srgb,var(--brand)_16%,transparent)] dark:bg-[linear-gradient(180deg,rgba(51,65,85,0.7),rgba(15,23,42,0.56))]' : 'border-slate-200/80 bg-white/72 dark:border-white/10 dark:bg-slate-950/44'}`}>
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{card.label}</div>
            <div className="font-display text-[clamp(1.15rem,1rem+0.4vw,1.5rem)] font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">{card.value}</div>
          </article>
        ))}
      </div>

      {view.cards.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {view.cards.map((card) => (
            <article key={card.account} className="grid gap-4 rounded-[1.7rem] border border-slate-200/80 bg-white/76 p-4 shadow-[0_18px_46px_-42px_rgba(15,23,42,0.34)] dark:border-white/10 dark:bg-slate-950/44 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="grid gap-1">
                  <div className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">@{card.account}</div>
                  <div className="font-display text-[clamp(1.6rem,1.3rem+0.6vw,2.1rem)] font-semibold leading-none tracking-[-0.04em] text-slate-950 dark:text-white">{card.averagePostEr > 0 ? `${(card.averagePostEr * 100).toFixed(2)}%` : '-'}</div>
                </div>
                <span className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-[0.72rem] font-semibold text-brand">ER rata-rata</span>
              </div>

              <div className="grid gap-2 rounded-[1.2rem] border border-slate-200/80 bg-slate-50/85 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between gap-3 text-sm"><span className="text-slate-500 dark:text-slate-400">Avg Likes</span><span className="font-semibold text-slate-950 dark:text-white">{formatInteger.format(Math.round(card.averageLikes))}</span></div>
                <div className="flex items-center justify-between gap-3 text-sm"><span className="text-slate-500 dark:text-slate-400">Avg Comments</span><span className="font-semibold text-slate-950 dark:text-white">{formatInteger.format(Math.round(card.averageComments))}</span></div>
                <div className="flex items-center justify-between gap-3 text-sm"><span className="text-slate-500 dark:text-slate-400">Viral Posts</span><span className="font-semibold text-slate-950 dark:text-white">{card.viralPosts}</span></div>
                <div className="flex items-center justify-between gap-3 text-sm"><span className="text-slate-500 dark:text-slate-400">Underperform</span><span className="font-semibold text-slate-950 dark:text-white">{card.underperformPosts}</span></div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-1 text-[0.78rem] font-semibold text-brand">{card.dominantType ?? 'unknown'}</span>
                {card.campaignTerms.slice(0, 2).map((term) => <span key={term} className="inline-flex items-center rounded-full bg-warning-soft px-2.5 py-1 text-[0.78rem] font-semibold text-warning">{term}</span>)}
              </div>

              <div className="text-[0.9rem] leading-6 text-slate-600 dark:text-slate-300">{card.insightText}</div>

              {card.featuredPost ? (
                <div className="grid gap-2 rounded-[1.25rem] border border-slate-200/80 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Highlighted Post</div>
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
                </div>
              ) : (
                <EmptyState>Tidak ada postingan sesuai filter.</EmptyState>
              )}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState>Tidak ada akun atau postingan yang sesuai dengan filter saat ini.</EmptyState>
      )}
    </SectionCard>
  )
}
