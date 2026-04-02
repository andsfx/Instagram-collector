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
      description="Section ini sekarang mendekati versi legacy dengan filter akun, pengurutan, filter performa post, dan ringkasan campaign."
    >
      <div className="daily-toolbar-controls post-toolbar-controls">
        <label className="control-field">
          <span className="stat-label">Akun</span>
          <select value={selectedAccount} onChange={(event) => setSelectedAccount(event.target.value)}>
            <option value="all">Semua akun</option>
            {view.accounts.map((account) => <option key={account} value={account}>@{account}</option>)}
          </select>
        </label>
        <label className="control-field">
          <span className="stat-label">Urutan akun</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as PostSnapshotSort)}>
            {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="control-field">
          <span className="stat-label">Filter performa</span>
          <select value={filterBy} onChange={(event) => setFilterBy(event.target.value as PostPerformanceFilter)}>
            {FILTER_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>

      <div className="summary-strip-grid">
        {view.summaryCards.map((card) => (
          <article key={card.label} className="summary-strip-card">
            <div className="stat-label">{card.label}</div>
            <div className="big-value">{card.value}</div>
          </article>
        ))}
      </div>

      {view.cards.length ? (
        <div className="snapshot-grid">
          {view.cards.map((card) => (
            <article key={card.account} className="snapshot-card">
              <div className="split-row">
                <div>
                  <div className="stat-label">@{card.account}</div>
                  <div className="big-value">{card.averagePostEr > 0 ? `${(card.averagePostEr * 100).toFixed(2)}%` : '-'}</div>
                </div>
                <span className="badge badge-brand">ER rata-rata</span>
              </div>

              <div className="metric-grid">
                <div className="metric-row"><span className="metric-name">Avg Likes</span><span className="metric-value">{formatInteger.format(Math.round(card.averageLikes))}</span></div>
                <div className="metric-row"><span className="metric-name">Avg Comments</span><span className="metric-value">{formatInteger.format(Math.round(card.averageComments))}</span></div>
                <div className="metric-row"><span className="metric-name">Viral Posts</span><span className="metric-value">{card.viralPosts}</span></div>
                <div className="metric-row"><span className="metric-name">Underperform</span><span className="metric-value">{card.underperformPosts}</span></div>
              </div>

              <div className="chip-row">
                <span className="chip chip-brand">{card.dominantType ?? 'unknown'}</span>
                {card.campaignTerms.slice(0, 2).map((term) => <span key={term} className="chip chip-warning">{term}</span>)}
              </div>

              <div className="helper-copy">{card.insightText}</div>

              {card.featuredPost ? (
                <div className="featured-post">
                  <div className="micro-label">Highlighted Post</div>
                  <div className="table-strong">{card.featuredPost.type ?? 'Format tidak diketahui'}</div>
                  <div className="table-muted">Dipublikasikan {formatPostDate(card.featuredPost.published_at ?? card.featuredPost.timestamp)}</div>
                  <div className="chip-row">
                    <span className="chip chip-success">{card.featuredPost.performance_label ?? 'n/a'}</span>
                    <span className="chip chip-brand">{card.featuredPost.interactions ?? 0} interactions</span>
                  </div>
                  {card.topHashtags.length ? <div className="helper-copy">{card.topHashtags.slice(0, 3).join(' ')}</div> : null}
                  {card.featuredPost.url ? (
                    <a className="accent-link" href={card.featuredPost.url} target="_blank" rel="noreferrer">
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
