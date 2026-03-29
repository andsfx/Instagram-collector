import { SectionCard } from './ui'
import { UiAccountSummary } from '../data/types'
import { formatCompact } from '../data/selectors'

// Minimal multi-account overview grid
export function AccountOverviewGrid({ accounts }: { accounts: UiAccountSummary[] }) {
  return (
    <SectionCard title="Overview Akun">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{accounts.map((acc) => (
        <div key={acc.key} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold text-slate-900 mb-2">{acc.name}</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
            <span>Followers</span><span className="text-right font-semibold">{formatCompact.format(acc.followers)}</span>
            <span>Following</span><span className="text-right font-semibold">{formatCompact.format(acc.following)}</span>
            <span>Posts</span><span className="text-right font-semibold">{formatCompact.format(acc.posts)}</span>
            <span>Avg Likes</span><span className="text-right font-semibold">{formatCompact.format(acc.avgLikes)}</span>
            <span>Avg Comments</span><span className="text-right font-semibold">{formatCompact.format(acc.avgComments)}</span>
            <span>Engagement</span><span className="text-right font-semibold">{acc.engagementRate.toFixed(2)}%</span>
            <span>Change 1d</span><span className="text-right font-semibold">{acc.change1d >= 0 ? '+' : ''}{formatCompact.format(acc.change1d)}</span>
            <span>Change 7d</span><span className="text-right font-semibold">{acc.change7d >= 0 ? '+' : ''}{formatCompact.format(acc.change7d)}</span>
          </div>
        </div>
      ))}</div>
    </SectionCard>
  )
}
