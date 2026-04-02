import type { UiAccountSummary } from '../data/types'
import { formatCompact } from '../data/selectors'
import { SectionCard } from './ui'

export function AccountOverviewGrid({ accounts }: { accounts: UiAccountSummary[] }) {
  return (
    <SectionCard
      eyebrow="Overview Akun"
      title="Perbandingan cepat tiap akun"
      description="Kartu ini mempertahankan metrik inti legacy, tetapi dibersihkan supaya lebih mudah dipindai dan tidak terlalu dekoratif."
    >
      <div className="tile-grid">
        {accounts.map((acc) => (
          <article key={acc.key} className="account-card">
            <div className="split-row">
              <div>
                <div className="stat-label">Akun</div>
                <div className="big-value">{acc.name}</div>
              </div>
              <div className="chip-row">
                <span className={`chip ${acc.change1d > 0 ? 'chip-success' : acc.change1d < 0 ? 'chip-danger' : 'chip-warning'}`}>
                  1d {acc.change1d >= 0 ? '+' : ''}{formatCompact.format(acc.change1d)}
                </span>
                <span className={`chip ${acc.change7d > 0 ? 'chip-success' : acc.change7d < 0 ? 'chip-danger' : 'chip-warning'}`}>
                  7d {acc.change7dPct >= 0 ? '+' : ''}{acc.change7dPct.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="divider" />
            <div className="metric-grid">
              <div className="metric-row"><span className="metric-name">Followers</span><span className="metric-value">{formatCompact.format(acc.followers)}</span></div>
              <div className="metric-row"><span className="metric-name">Following</span><span className="metric-value">{formatCompact.format(acc.following)}</span></div>
              <div className="metric-row"><span className="metric-name">Posts</span><span className="metric-value">{formatCompact.format(acc.posts)}</span></div>
              <div className="metric-row"><span className="metric-name">Engagement</span><span className="metric-value">{acc.engagementRate.toFixed(2)}%</span></div>
              <div className="metric-row"><span className="metric-name">Avg Likes</span><span className="metric-value">{formatCompact.format(acc.avgLikes)}</span></div>
              <div className="metric-row"><span className="metric-name">Avg Comments</span><span className="metric-value">{formatCompact.format(acc.avgComments)}</span></div>
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  )
}
