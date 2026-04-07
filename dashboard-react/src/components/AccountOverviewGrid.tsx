import type { UiAccountSummary } from '../data/types'
import { formatCompact } from '../data/selectors'
import { SectionCard } from './ui'

export function AccountOverviewGrid({ accounts }: { accounts: UiAccountSummary[] }) {
  return (
    <SectionCard
      eyebrow="Overview Akun"
      title="Perbandingan cepat tiap akun"
      description="Lapisan ini diubah menjadi roster comparison, jadi pembaca melihat akun sebagai baris-baris terstruktur, bukan kartu-kartu independen."
    >
      <div className="grid gap-5">
        {accounts.map((acc, index) => (
          <article
            key={acc.key}
            className={[
              'grid gap-4 border-b border-slate-200/70 pb-5 last:border-b-0 last:pb-0 dark:border-white/10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8',
              index === 0 ? 'border-[color:color-mix(in_srgb,var(--brand)_18%,white)]' : '',
            ].join(' ')}
          >
            <div className="grid gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="grid gap-1">
                  <div className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Akun</div>
                  <div className="font-display text-[clamp(1.35rem,1.15rem+0.5vw,1.85rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-slate-950 dark:text-white">
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

              <div className="grid gap-1">
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Followers</div>
                <div className="font-display text-[clamp(1.9rem,1.55rem+0.72vw,2.45rem)] font-semibold leading-none tracking-[-0.05em] text-slate-950 dark:text-white">
                  {formatCompact.format(acc.followers)}
                </div>
                <div className="text-[0.9rem] leading-6 text-slate-600 dark:text-slate-300">
                  Growth 7 hari {acc.change7dPct >= 0 ? 'menguat' : 'melemah'} {acc.change7dPct >= 0 ? '+' : ''}{acc.change7dPct.toFixed(2)}%.
                </div>
              </div>
            </div>

            <div className="grid gap-3 border-t border-slate-200/70 pt-4 dark:border-white/10 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div className="grid gap-2 text-[0.92rem]">
                <div className="flex items-center justify-between gap-3"><span className="text-slate-500 dark:text-slate-400">Following</span><span className="font-semibold text-slate-950 dark:text-white">{formatCompact.format(acc.following)}</span></div>
                <div className="flex items-center justify-between gap-3"><span className="text-slate-500 dark:text-slate-400">Posts</span><span className="font-semibold text-slate-950 dark:text-white">{formatCompact.format(acc.posts)}</span></div>
                <div className="flex items-center justify-between gap-3"><span className="text-slate-500 dark:text-slate-400">Engagement</span><span className="font-semibold text-slate-950 dark:text-white">{acc.engagementRate.toFixed(2)}%</span></div>
                <div className="flex items-center justify-between gap-3"><span className="text-slate-500 dark:text-slate-400">Avg Likes</span><span className="font-semibold text-slate-950 dark:text-white">{formatCompact.format(acc.avgLikes)}</span></div>
                <div className="flex items-center justify-between gap-3"><span className="text-slate-500 dark:text-slate-400">Avg Comments</span><span className="font-semibold text-slate-950 dark:text-white">{formatCompact.format(acc.avgComments)}</span></div>
              </div>

              <div className="text-[0.88rem] leading-[1.55] text-slate-600 dark:text-slate-300">
                Engagement {acc.engagementRate.toFixed(2)}% memberi konteks terhadap perubahan followers jangka pendek akun ini.
              </div>
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  )
}
