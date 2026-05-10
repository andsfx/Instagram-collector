import type { UiAccountSummary } from '../data/types'
import { formatCompact } from '../data/selectors'
import { SectionCard } from './ui'

const CARD_ACCENTS = [
  'before:bg-[image:var(--account-brand)]',
  'before:bg-[image:var(--account-comp-1)]',
  'before:bg-[image:var(--account-comp-2)]',
  'before:bg-[image:var(--account-comp-3)]',
  'before:bg-[image:var(--account-comp-4)]',
]

export function AccountOverviewGrid({ accounts }: { accounts: UiAccountSummary[] }) {
  if (accounts.length === 0) {
    return (
      <SectionCard eyebrow="Overview Akun" title="Perbandingan cepat tiap akun">
        <p className="py-8 text-center text-sm text-[var(--text-muted)]">Belum ada akun yang bisa ditampilkan.</p>
      </SectionCard>
    )
  }
  return (
    <SectionCard eyebrow="Overview Akun" title="Perbandingan cepat tiap akun">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {accounts.map((acc, index) => {
          const accentClass = CARD_ACCENTS[index % CARD_ACCENTS.length]
          const isBrand = index === 0
          return (
            <article
              key={acc.key}
              className={`relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 before:absolute before:inset-x-0 before:top-0 before:h-1 before:rounded-t-[var(--radius-lg)] ${accentClass} ${isBrand ? 'bg-gradient-to-b from-[rgba(225,48,108,0.03)] to-[var(--panel)]' : ''}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-display text-sm font-bold text-[var(--text)] truncate">{acc.name}</span>
                {isBrand ? (
                  <span className="rounded-[var(--radius-pill)] bg-[image:var(--ig-gradient)] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">Brand</span>
                ) : (
                  <span className="rounded-[var(--radius-pill)] bg-[var(--panel-muted)] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--text-soft)]">Competitor</span>
                )}
              </div>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-soft)]">Followers</div>
              <div className="font-display text-2xl font-extrabold tracking-tight text-[var(--text)]">
                {formatCompact.format(acc.followers)}
              </div>
              <div className="mt-2 flex gap-1.5">
                <span className={`inline-flex items-center rounded-[var(--radius-pill)] px-2 py-0.5 text-[10px] font-bold ${acc.change1d > 0 ? 'bg-[var(--success-soft)] text-[var(--success)]' : acc.change1d < 0 ? 'bg-[var(--danger-soft)] text-[var(--danger)]' : 'bg-[var(--panel-muted)] text-[var(--text-soft)]'}`}>
                  {acc.change1d >= 0 ? '+' : ''}{formatCompact.format(acc.change1d)}
                </span>
                <span className={`inline-flex items-center rounded-[var(--radius-pill)] px-2 py-0.5 text-[10px] font-bold ${acc.change7dPct > 0 ? 'bg-[var(--success-soft)] text-[var(--success)]' : acc.change7dPct < 0 ? 'bg-[var(--danger-soft)] text-[var(--danger)]' : 'bg-[var(--panel-muted)] text-[var(--text-soft)]'}`}>
                  7d {acc.change7dPct >= 0 ? '+' : ''}{acc.change7dPct.toFixed(2)}%
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-[var(--radius-sm)] bg-[var(--panel-muted)] p-2 text-center">
                  <div className="text-sm font-bold text-[var(--text)]">{formatCompact.format(acc.following)}</div>
                  <div className="text-[10px] text-[var(--text-soft)]">Following</div>
                </div>
                <div className="rounded-[var(--radius-sm)] bg-[var(--panel-muted)] p-2 text-center">
                  <div className="text-sm font-bold text-[var(--text)]">{formatCompact.format(acc.posts)}</div>
                  <div className="text-[10px] text-[var(--text-soft)]">Posts</div>
                </div>
                <div className="rounded-[var(--radius-sm)] bg-[var(--panel-muted)] p-2 text-center">
                  <div className="text-sm font-bold text-[var(--text)]">{formatCompact.format(acc.avgLikes)}</div>
                  <div className="text-[10px] text-[var(--text-soft)]">Avg Likes</div>
                </div>
                <div className="rounded-[var(--radius-sm)] bg-[var(--ig-gradient-soft)] p-2 text-center">
                  <div className="bg-[image:var(--ig-gradient)] bg-clip-text text-sm font-extrabold text-transparent">{acc.engagementRate.toFixed(2)}%</div>
                  <div className="text-[10px] text-[var(--text-soft)]">ER</div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </SectionCard>
  )
}