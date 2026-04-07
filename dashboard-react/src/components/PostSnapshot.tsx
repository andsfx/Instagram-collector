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
    <SectionCard eyebrow="Post Snapshot" title="12-post snapshot lintas akun" description="Section ini menjaga filter akun, pengurutan, performa post, dan ringkasan campaign dalam susunan yang lebih bersih.">
      <div className="grid gap-[14px] lg:grid-cols-3">
        <label className="grid gap-2">
          <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">Akun</span>
          <select className="min-h-[42px] rounded-xl border border-border bg-panel px-3.5 py-2.5 text-text" value={selectedAccount} onChange={(event) => setSelectedAccount(event.target.value)}>
            <option value="all">Semua akun</option>
            {view.accounts.map((account) => <option key={account} value={account}>@{account}</option>)}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">Urutan akun</span>
          <select className="min-h-[42px] rounded-xl border border-border bg-panel px-3.5 py-2.5 text-text" value={sortBy} onChange={(event) => setSortBy(event.target.value as PostSnapshotSort)}>
            {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">Filter performa</span>
          <select className="min-h-[42px] rounded-xl border border-border bg-panel px-3.5 py-2.5 text-text" value={filterBy} onChange={(event) => setFilterBy(event.target.value as PostPerformanceFilter)}>
            {FILTER_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-5">
        {view.summaryCards.map((card) => (
          <article key={card.label} className={`rounded-[22px] border p-4 shadow-panel-sm ${card.label === 'Total post teranalisis' ? 'border-[color:color-mix(in_srgb,var(--brand)_22%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft-2)_90%,var(--panel)),color-mix(in_srgb,var(--brand-soft)_65%,var(--panel)))]' : 'border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_88%,var(--brand-soft)_12%),var(--panel))]'}`}>
            <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">{card.label}</div>
            <div className="mt-2.5 font-display text-[clamp(1.3rem,1.1rem+0.5vw,1.85rem)] leading-[1.1] tracking-[-0.03em] text-brand-strong">{card.value}</div>
          </article>
        ))}
      </div>

      {view.cards.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {view.cards.map((card) => (
            <article key={card.account} className="grid gap-4 rounded-[24px] border border-[color:color-mix(in_srgb,var(--brand)_12%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_90%,var(--brand-soft)_10%),var(--panel))] p-5 shadow-panel-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">@{card.account}</div>
                  <div className="mt-2.5 font-display text-[clamp(1.5rem,1.2rem+0.75vw,2.2rem)] leading-none text-brand-strong">{card.averagePostEr > 0 ? `${(card.averagePostEr * 100).toFixed(2)}%` : '-'}</div>
                </div>
                <span className="inline-flex rounded-full bg-[linear-gradient(180deg,var(--brand-soft),color-mix(in_srgb,var(--brand-soft-2)_72%,var(--panel)))] px-2.5 py-1.5 text-xs font-bold text-brand">ER rata-rata</span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                <div className="flex items-baseline justify-between gap-3"><span className="text-[0.9rem] text-text-muted">Avg Likes</span><span className="font-semibold text-text">{formatInteger.format(Math.round(card.averageLikes))}</span></div>
                <div className="flex items-baseline justify-between gap-3"><span className="text-[0.9rem] text-text-muted">Avg Comments</span><span className="font-semibold text-text">{formatInteger.format(Math.round(card.averageComments))}</span></div>
                <div className="flex items-baseline justify-between gap-3"><span className="text-[0.9rem] text-text-muted">Viral Posts</span><span className="font-semibold text-text">{card.viralPosts}</span></div>
                <div className="flex items-baseline justify-between gap-3"><span className="text-[0.9rem] text-text-muted">Underperform</span><span className="font-semibold text-text">{card.underperformPosts}</span></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex rounded-full bg-[linear-gradient(180deg,var(--brand-soft),color-mix(in_srgb,var(--brand-soft-2)_72%,var(--panel)))] px-2.5 py-1.5 text-xs font-bold text-brand">{card.dominantType ?? 'unknown'}</span>
                {card.campaignTerms.slice(0, 2).map((term) => <span key={term} className="inline-flex rounded-full bg-warning-soft px-2.5 py-1.5 text-xs font-bold text-warning">{term}</span>)}
              </div>
              <div className="border-t border-[color:color-mix(in_srgb,var(--border)_84%,transparent)] pt-3 text-[0.92rem] leading-[1.6] text-text-muted">{card.insightText}</div>
              {card.featuredPost ? (
                <div className="grid gap-2.5 rounded-panel-sm border border-[color:color-mix(in_srgb,var(--brand)_16%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft-2)_72%,var(--panel)),color-mix(in_srgb,var(--brand-soft)_82%,var(--panel)))] p-[14px]">
                  <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">Highlighted Post</div>
                  <div className="font-semibold text-text">{card.featuredPost.type ?? 'Format tidak diketahui'}</div>
                  <div className="text-sm text-text-muted">Dipublikasikan {formatPostDate(card.featuredPost.published_at ?? card.featuredPost.timestamp)}</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full bg-success-soft px-2.5 py-1.5 text-xs font-bold text-success">{card.featuredPost.performance_label ?? 'n/a'}</span>
                    <span className="inline-flex rounded-full bg-[linear-gradient(180deg,var(--brand-soft),color-mix(in_srgb,var(--brand-soft-2)_72%,var(--panel)))] px-2.5 py-1.5 text-xs font-bold text-brand">{card.featuredPost.interactions ?? 0} interactions</span>
                  </div>
                  {card.topHashtags.length ? <div className="text-[0.92rem] leading-[1.6] text-text-muted">{card.topHashtags.slice(0, 3).join(' ')}</div> : null}
                  {card.featuredPost.url ? <a className="font-bold text-accent underline-offset-4 hover:underline" href={card.featuredPost.url} target="_blank" rel="noreferrer">Buka postingan</a> : null}
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
