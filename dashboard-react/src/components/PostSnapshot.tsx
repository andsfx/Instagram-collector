import { useMemo, useState } from 'react'
import { type PostPerformanceFilter, type PostSnapshotSort, formatInteger, formatPostDate, getPostSnapshotView } from '../data/selectors'
import type { DashboardRecord } from '../data/types'
import { EmptyState, SectionCard } from './ui'

const SORT_OPTIONS: Array<{ value: PostSnapshotSort; label: string }> = [
  { value: 'viral_posts', label: 'Viral terbanyak' },
  { value: 'average_post_er', label: 'ER tertinggi' },
  { value: 'average_likes', label: 'Likes tertinggi' },
  { value: 'campaign_terms', label: 'Campaign terbanyak' },
  { value: 'username', label: 'Username A-Z' },
]

const FILTER_OPTIONS: Array<{ value: PostPerformanceFilter; label: string }> = [
  { value: 'all', label: 'Semua' },
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
    <SectionCard eyebrow="Post Snapshot" title="12-post snapshot per akun">
      {/* Filters */}
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="grid gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">Akun</span>
          <select className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm" value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
            <option value="all">Semua akun</option>
            {view.accounts.map((a) => <option key={a} value={a}>@{a}</option>)}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">Urutan</span>
          <select className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value as PostSnapshotSort)}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">Filter</span>
          <select className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm" value={filterBy} onChange={(e) => setFilterBy(e.target.value as PostPerformanceFilter)}>
            {FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {view.summaryCards.map((card) => (
          <div key={card.label} className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] p-2">
            <div className="text-[9px] font-bold uppercase tracking-wide text-[var(--text-soft)]">{card.label}</div>
            <div className="font-display text-sm font-extrabold text-[var(--text)]">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Account Cards */}
      {view.cards.length ? (
        <div className="grid gap-3">
          {view.cards.map((card) => (
            <div key={card.account} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-sm)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                {/* Left: Account + Metrics */}
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[var(--text)]">@{card.account}</span>
                    <span className="rounded-[var(--radius-pill)] bg-[var(--brand-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--brand)]">
                      ER {card.averagePostEr > 0 ? `${(card.averagePostEr * 100).toFixed(2)}%` : '-'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span><strong>{formatInteger.format(Math.round(card.averageLikes))}</strong> avg likes</span>
                    <span><strong>{formatInteger.format(Math.round(card.averageComments))}</strong> avg comments</span>
                    <span className="text-[var(--success)]"><strong>{card.viralPosts}</strong> viral</span>
                    <span className="text-[var(--danger)]"><strong>{card.underperformPosts}</strong> underperform</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="rounded-[var(--radius-pill)] bg-[var(--brand-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--brand)]">{card.dominantType ?? 'unknown'}</span>
                    {card.campaignTerms.slice(0, 2).map((t) => <span key={t} className="rounded-[var(--radius-pill)] bg-[var(--warning-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--warning)]">{t}</span>)}
                  </div>
                </div>
                {/* Right: Featured Post */}
                {card.featuredPost ? (
                  <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel-muted)] p-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-[var(--radius-pill)] px-2 py-0.5 text-[9px] font-bold ${card.featuredPost.performance_label === 'viral' ? 'bg-[var(--success-soft)] text-[var(--success)]' : card.featuredPost.performance_label === 'underperform' ? 'bg-[var(--danger-soft)] text-[var(--danger)]' : 'bg-[var(--panel-muted)] text-[var(--text-soft)]'}`}>
                        {card.featuredPost.performance_label ?? 'n/a'}
                      </span>
                      <span className="text-[var(--text-soft)]">{formatPostDate(card.featuredPost.published_at ?? card.featuredPost.timestamp)}</span>
                      <span className="font-bold text-[var(--text)]">{card.featuredPost.interactions ?? 0} int.</span>
                    </div>
                    {card.featuredPost.url ? <a className="mt-1 block text-[var(--brand)] hover:underline" href={card.featuredPost.url} target="_blank" rel="noreferrer">Buka post</a> : null}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState>Tidak ada data sesuai filter.</EmptyState>
      )}
    </SectionCard>
  )
}