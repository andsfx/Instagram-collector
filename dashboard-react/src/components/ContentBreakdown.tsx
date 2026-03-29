import { SectionCard } from './ui'
import type { DashboardRecord } from '../data/types'

// Content breakdown based on posts per account when available
export function ContentBreakdown({ data }: { data: DashboardRecord }) {
  const latest = data.latest
  const accounts = data.accounts

  // Helper to normalize breakdown per account
  const breakdownFor = (acc: string) => {
    const cb = (data as any).content_breakdown?.[acc]
    const piTop = (data as any).post_insights?.[acc]?.top_interactions?.[0]
    // bestPost can come from content_breakdown or fall back to top_interactions or undefined
    const bestPost = cb?.bestPost ?? piTop ?? undefined
    return {
      posts: cb?.posts ?? latest?.[acc]?.posts ?? 0,
      reels: cb?.reels ?? undefined,
      carousels: cb?.carousels ?? cb?.carousel ?? undefined,
      images: cb?.images ?? cb?.image ?? undefined,
      videos: cb?.videos ?? cb?.video ?? undefined,
      bestPost: bestPost,
    }
  }

  const perAccount = accounts.map((acc) => ({ account: acc, ...breakdownFor(acc) }))
  // Only consider accounts with meaningful data (at least one data point > 0)
  const meaningful = perAccount.filter((a) => (a.posts ?? 0) > 0 || (a.reels ?? 0) > 0 || (a.carousels ?? 0) > 0 || (a.images ?? 0) > 0 || (a.videos ?? 0) > 0)
  const maxPosts = meaningful.length > 0 ? Math.max(1, ...meaningful.map((a) => a.posts ?? 0)) : 1
  const hasData = meaningful.length > 0

  return (
    <SectionCard title="Content Breakdown">
      {hasData ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {meaningful.map((p) => (
            <div key={p.account} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-600 mb-1">{p.account}</div>
              <div className="flex items-center gap-2 mb-2 text-xs text-slate-600">
                {p.reels !== undefined && (
                  <span className="px-2 py-1 rounded-full bg-slate-200">Reels: {p.reels}</span>
                )}
                {p.carousels !== undefined && (
                  <span className="px-2 py-1 rounded-full bg-slate-200">Carousels: {p.carousels}</span>
                )}
                {p.images !== undefined && (
                  <span className="px-2 py-1 rounded-full bg-slate-200">Images: {p.images}</span>
                )}
                {p.videos !== undefined && (
                  <span className="px-2 py-1 rounded-full bg-slate-200">Videos: {p.videos}</span>
                )}
              </div>
              <div className="h-4 w-full rounded bg-slate-200" aria-label={`posts-${p.account}`}>
                <div
                  style={{ width: `${(p.posts / maxPosts) * 100}%` }}
                  className="h-4 rounded bg-pink-500"
                />
              </div>
              <div className="mt-1 text-xs text-slate-600">Posts: {p.posts}</div>
              {p.bestPost && (
                <div className="mt-2 text-xs text-slate-700">
                  Best post: {p.bestPost.url ?? p.bestPost.id ?? 'unknown'}
                  {p.bestPost.type ? ` • type: ${p.bestPost.type}` : ''}
                  {typeof p.bestPost.interactions === 'number' ? ` • interactions: ${p.bestPost.interactions}` : ''}
                </div>
              )}
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
