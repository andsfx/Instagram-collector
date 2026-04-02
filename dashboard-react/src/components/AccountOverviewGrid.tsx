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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {accounts.map((acc) => (
          <article
            key={acc.key}
            className="grid gap-4 rounded-panel-md border border-[color:color-mix(in_srgb,var(--brand)_12%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_90%,var(--brand-soft)_10%),var(--panel))] p-[18px] shadow-panel-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">Akun</div>
                <div className="mt-2.5 font-display text-[clamp(1.5rem,1.2rem+0.75vw,2.2rem)] leading-none text-brand-strong">{acc.name}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1.5 text-xs font-bold ${acc.change1d > 0 ? 'bg-success-soft text-success' : acc.change1d < 0 ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning'}`}>
                  1d {acc.change1d >= 0 ? '+' : ''}{formatCompact.format(acc.change1d)}
                </span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1.5 text-xs font-bold ${acc.change7d > 0 ? 'bg-success-soft text-success' : acc.change7d < 0 ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning'}`}>
                  7d {acc.change7dPct >= 0 ? '+' : ''}{acc.change7dPct.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="h-px bg-border" />
            <div className="grid grid-cols-1 gap-x-3 gap-y-2.5 sm:grid-cols-2">
              <div className="flex items-baseline justify-between gap-3"><span className="text-[0.9rem] text-text-muted">Followers</span><span className="font-semibold text-text">{formatCompact.format(acc.followers)}</span></div>
              <div className="flex items-baseline justify-between gap-3"><span className="text-[0.9rem] text-text-muted">Following</span><span className="font-semibold text-text">{formatCompact.format(acc.following)}</span></div>
              <div className="flex items-baseline justify-between gap-3"><span className="text-[0.9rem] text-text-muted">Posts</span><span className="font-semibold text-text">{formatCompact.format(acc.posts)}</span></div>
              <div className="flex items-baseline justify-between gap-3"><span className="text-[0.9rem] text-text-muted">Engagement</span><span className="font-semibold text-text">{acc.engagementRate.toFixed(2)}%</span></div>
              <div className="flex items-baseline justify-between gap-3"><span className="text-[0.9rem] text-text-muted">Avg Likes</span><span className="font-semibold text-text">{formatCompact.format(acc.avgLikes)}</span></div>
              <div className="flex items-baseline justify-between gap-3"><span className="text-[0.9rem] text-text-muted">Avg Comments</span><span className="font-semibold text-text">{formatCompact.format(acc.avgComments)}</span></div>
            </div>
            <div className="text-[0.92rem] leading-[1.6] text-text-muted">Growth 7 hari {acc.change7dPct >= 0 ? 'menguat' : 'melemah'} {acc.change7dPct >= 0 ? '+' : ''}{acc.change7dPct.toFixed(2)}% dengan engagement {acc.engagementRate.toFixed(2)}%.</div>
          </article>
        ))}
      </div>
    </SectionCard>
  )
}
