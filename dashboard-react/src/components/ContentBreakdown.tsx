import { SectionCard } from './ui'
import type { DashboardRecord } from '../data/types'

// Content breakdown based on posts per account when available
export function ContentBreakdown({ data }: { data: DashboardRecord }) {
  // Compute latest posts per account if available
  const latest = data.latest
  const accounts = data.accounts
  // Build per-account post counts, handling missing/nulls gracefully
  const postsPerAccountAll = accounts.map((acc) => ({
    account: acc,
    posts: latest[acc]?.posts ?? 0,
  }))
  // Only consider accounts with non-zero posts as meaningful data
  const postsPerAccount = postsPerAccountAll.filter((p) => p.posts > 0)
  const maxPosts = Math.max(1, ...postsPerAccount.map((p) => p.posts))
  const hasData = postsPerAccount.length > 0

  return (
    <SectionCard title="Content Breakdown">
      {hasData ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {postsPerAccount.map((p) => (
            <div key={p.account} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-600 mb-1">{p.account}</div>
              <div className="h-4 w-full rounded bg-slate-200" aria-label={`posts-${p.account}`}>
                <div
                  style={{ width: `${(p.posts / maxPosts) * 100}%` }}
                  className="h-4 rounded bg-pink-500"
                />
              </div>
              <div className="mt-1 text-xs text-slate-600">Posts: {p.posts}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-slate-600">
          Data breakdown konten belum tersedia. Data post-level per akun belum diteruskan dari pipeline saat ini.
        </div>
      )}
    </SectionCard>
  )
}
