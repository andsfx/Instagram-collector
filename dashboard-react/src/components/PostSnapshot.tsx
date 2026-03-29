import { SectionCard } from './ui'
import type { DashboardRecord } from '../data/types'

// Simple post snapshot using available per-account latest data
export function PostSnapshot({ data }: { data: DashboardRecord }) {
  // Build a snapshot list: top by followers for display reliability
  const rankingList = data.rankings.by_followers ?? []
  const snapshot = rankingList.slice(0, 4).map((r) => ({ account: r.account, followers: r.followers }))

  // Validation: ensure we actually have data to show
  const hasData = data.accounts.length > 0 && snapshot.length > 0

  return (
    <SectionCard title="Post Snapshot">
      {hasData ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {snapshot.map((s) => (
            <div key={s.account} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-medium uppercase text-slate-600">{s.account}</div>
              <div className="mt-1 text-sm text-slate-700">
                Followers: {Number(s.followers).toLocaleString('id-ID')}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-slate-600">
          Data snapshot posting belum tersedia. Ranking per akun atau data akun belum tersedia dari pipeline.
        </div>
      )}
    </SectionCard>
  )
}
