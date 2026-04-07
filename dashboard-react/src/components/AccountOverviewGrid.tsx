import type { UiAccountSummary } from '../data/types'
import { formatCompact } from '../data/selectors'
import { SectionCard } from './ui'

export function AccountOverviewGrid({ accounts }: { accounts: UiAccountSummary[] }) {
  return (
    <SectionCard
      eyebrow="Overview Akun"
      title="Perbandingan cepat tiap akun"
      description="Kartu akun ini dirancang sebagai lapisan kedua setelah leaderboard, supaya pembaca bisa membandingkan profil tiap akun tanpa tenggelam di detail tabel."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {accounts.map((acc, index) => (
          <article
            key={acc.key}
            className={[
              'grid gap-4 rounded-[24px] border p-5 shadow-panel-sm',
              index === 0
                ? 'border-[color:color-mix(in_srgb,var(--brand)_16%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_32%,var(--panel)),var(--panel))]'
                : 'border-[color:color-mix(in_srgb,var(--border)_88%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_96%,transparent),color-mix(in_srgb,var(--panel-muted)_72%,transparent))]',
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="grid gap-1">
                <div className="text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-text-soft">Akun</div>
                <div className="font-display text-[clamp(1.28rem,1.08rem+0.48vw,1.74rem)] font-semibold leading-[1.02] text-text">
                  {acc.name}
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.76rem] font-bold ${acc.change1d > 0 ? 'bg-success-soft text-success' : acc.change1d < 0 ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning'}`}>
                  1d {acc.change1d >= 0 ? '+' : ''}{formatCompact.format(acc.change1d)}
                </span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.76rem] font-bold ${acc.change7dPct > 0 ? 'bg-success-soft text-success' : acc.change7dPct < 0 ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning'}`}>
                  7d {acc.change7dPct >= 0 ? '+' : ''}{acc.change7dPct.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="grid gap-2 rounded-[18px] border border-[color:color-mix(in_srgb,var(--border)_84%,transparent)] bg-[color:color-mix(in_srgb,var(--panel)_74%,transparent)] p-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[0.82rem] text-text-soft">Followers</span>
                <span className="font-display text-[1.5rem] font-semibold leading-none text-text">{formatCompact.format(acc.followers)}</span>
              </div>
              <div className="text-[0.88rem] text-text-muted">
                Growth 7 hari {acc.change7dPct >= 0 ? 'menguat' : 'melemah'} {acc.change7dPct >= 0 ? '+' : ''}{acc.change7dPct.toFixed(2)}%.
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3 text-[0.92rem]">
                <span className="text-text-muted">Following</span>
                <span className="font-semibold text-text">{formatCompact.format(acc.following)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[0.92rem]">
                <span className="text-text-muted">Posts</span>
                <span className="font-semibold text-text">{formatCompact.format(acc.posts)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[0.92rem]">
                <span className="text-text-muted">Engagement</span>
                <span className="font-semibold text-text">{acc.engagementRate.toFixed(2)}%</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[0.92rem]">
                <span className="text-text-muted">Avg Likes</span>
                <span className="font-semibold text-text">{formatCompact.format(acc.avgLikes)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[0.92rem]">
                <span className="text-text-muted">Avg Comments</span>
                <span className="font-semibold text-text">{formatCompact.format(acc.avgComments)}</span>
              </div>
            </div>

            <div className="rounded-[18px] border border-[color:color-mix(in_srgb,var(--border)_82%,transparent)] bg-[color:color-mix(in_srgb,var(--panel)_68%,transparent)] p-3 text-[0.88rem] leading-[1.55] text-text-muted">
              Engagement {acc.engagementRate.toFixed(2)}% memberi konteks terhadap perubahan followers jangka pendek akun ini.
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  )
}
