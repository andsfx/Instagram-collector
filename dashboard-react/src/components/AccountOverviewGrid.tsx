import type { UiAccountSummary } from '../data/types'
import { formatCompact, formatEngagementRate, formatPercent } from '../utils/formatters'

export function AccountOverviewGrid({ accounts }: { accounts: UiAccountSummary[] }) {
  if (accounts.length === 0) {
    return (
      <section className="border border-[var(--border)] bg-[var(--panel)] p-6">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">Perbandingan cepat tiap akun</h2>
        <p className="mt-4 py-6 text-center text-sm text-[var(--text-muted)]">Belum ada akun yang bisa ditampilkan.</p>
      </section>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {accounts.map((acc, index) => {
          const isBrand = index === 0
          const isMuted = index % 2 === 1
          return (
            <section
              key={acc.key}
              className={`border border-[var(--border)] p-5 ${isMuted ? 'bg-[var(--panel-muted)]' : 'bg-[var(--panel)]'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="truncate text-base font-semibold text-[var(--text)]">{acc.name}</h3>
                {isBrand ? (
                  <span className="rounded-[var(--radius-sm)] bg-[var(--brand-soft)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--brand)]">Brand</span>
                ) : (
                  <span className="rounded-[var(--radius-sm)] bg-[var(--panel-muted)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-soft)]">Competitor</span>
                )}
              </div>

              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">Followers</p>
                <p className="mt-1 font-display text-[clamp(1.8rem,2.5vw,2.4rem)] font-normal tracking-[-0.03em] text-[var(--text)]">
                  {formatCompact(acc.followers)}
                </p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <p className={`text-sm ${acc.change1d >= 0 ? 'text-[var(--success)]' : acc.change1d < 0 ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'}`}>
                  {acc.change1d >= 0 ? '+' : ''}{formatCompact(acc.change1d)} <span className="text-xs text-[var(--text-soft)]">1d</span>
                </p>
                <p className={`text-sm ${acc.change7dPct >= 0 ? 'text-[var(--success)]' : acc.change7dPct < 0 ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'}`}>
                  {acc.change7dPct >= 0 ? '+' : ''}{formatPercent(acc.change7dPct)} <span className="text-xs text-[var(--text-soft)]">7d</span>
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[var(--border)] pt-3">
                <p className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="text-xs text-[var(--text-soft)]">Following</span>
                  <span className="font-semibold text-[var(--text)]">{formatCompact(acc.following)}</span>
                </p>
                <p className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="text-xs text-[var(--text-soft)]">Posts</span>
                  <span className="font-semibold text-[var(--text)]">{formatCompact(acc.posts)}</span>
                </p>
                <p className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="text-xs text-[var(--text-soft)]">Avg Likes</span>
                  <span className="font-semibold text-[var(--text)]">{formatCompact(acc.avgLikes)}</span>
                </p>
                <p className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="text-xs text-[var(--text-soft)]">ER</span>
                  <span className="font-semibold text-[var(--text)]">{formatEngagementRate(acc.engagementRate)}</span>
                </p>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
