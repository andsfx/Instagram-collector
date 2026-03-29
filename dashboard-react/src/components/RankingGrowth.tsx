import { SectionCard } from './ui'
import type { DashboardRecord } from '../data/types'

// Minimal ranking & growth view driven by existing schema
export function RankingGrowth({ data }: { data: DashboardRecord }) {
  const byFollowers = data.rankings.by_followers
  const byEngagement = data.rankings.by_engagement_rate
  const growthList = Object.entries(data.growth).map(([account, g]) => ({ account, ...g }))
    .sort((a, b) => b.pct_change_7d - a.pct_change_7d)

  // Helper to resolve a display name if available in data.latest map
  const nameFromAccount = (acct: string) => acct

  return (
    <SectionCard title="Ranking & Growth">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 text-sm font-medium text-slate-700">Peringkat Berdasarkan Pengikut</div>
          <ol className="space-y-2 pl-4 text-sm text-slate-700">
            {byFollowers.slice(0, 5).map((r) => (
              <li key={r.account}>
                #{r.rank} {nameFromAccount(r.account)} — {r.followers.toLocaleString('id-ID')} pengikut
              </li>
            ))}
          </ol>
        </div>
        <div>
          <div className="mb-2 text-sm font-medium text-slate-700">Peringkat Berdasarkan Engagement</div>
          <ol className="space-y-2 pl-4 text-sm text-slate-700">
            {byEngagement.slice(0, 5).map((r) => (
              <li key={r.account}>
                #{r.rank} {nameFromAccount(r.account)} — {r.engagement_rate.toFixed(2)}% ER
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="mt-4 pt-2 border-t border-slate-200">
        <div className="mb-2 text-sm font-medium text-slate-700"> Pertumbuhan 7d</div>
        <ul className="space-y-2 text-sm text-slate-700">
          {growthList.slice(0, 5).map((g) => (
            <li key={g.account}>
              {g.account} — {g.pct_change_7d.toFixed(2)}% (7d) | ±{g.followers_change_7d.toLocaleString('id-ID')} followers
            </li>
          ))}
        </ul>
      </div>
    </SectionCard>
  )
}
