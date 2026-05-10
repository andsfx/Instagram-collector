import type { ExecutiveSummaryData } from '../data/selectors'
import { SectionCard } from './ui'

const TONE_STYLES = [
  { card: 'bg-gradient-to-br from-[rgba(225,48,108,0.06)] to-[var(--panel)]', border: 'before:bg-[image:var(--ig-gradient)]' },
  { card: 'bg-gradient-to-br from-[rgba(46,204,113,0.06)] to-[var(--panel)]', border: 'before:bg-gradient-to-b before:from-[var(--success)] before:to-[#16a34a]' },
  { card: 'bg-gradient-to-br from-[rgba(247,119,55,0.08)] to-[var(--panel)]', border: 'before:bg-gradient-to-b before:from-[var(--ig-yellow)] before:to-[var(--ig-orange)]' },
  { card: 'bg-gradient-to-br from-[rgba(131,58,180,0.06)] to-[var(--panel)]', border: 'before:bg-gradient-to-b before:from-[var(--ig-purple)] before:to-[var(--ig-blue)]' },
]

export function ExecutiveSummary({ summary }: { summary: ExecutiveSummaryData }) {
  if (summary.kpis.length === 0) {
    return (
      <SectionCard eyebrow="Executive Summary" title="Sinyal utama brand">
        <p className="py-8 text-center text-sm text-[var(--text-muted)]">Ringkasan belum bisa dibuat karena data belum lengkap.</p>
      </SectionCard>
    )
  }
  return (
    <SectionCard eyebrow="Executive Summary" title="Sinyal utama brand">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.kpis.map((kpi, index) => {
          const style = TONE_STYLES[index % TONE_STYLES.length]
          return (
            <article
              key={kpi.key}
              className={`relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] p-4 shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-[var(--radius-lg)] ${style.card} ${style.border}`}
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.5px] text-[var(--text-soft)]">{kpi.label}</div>
              <div className="mt-1 font-display text-[clamp(1.5rem,1.2rem+0.6vw,2rem)] font-extrabold leading-tight tracking-tight text-[var(--text)]">{kpi.value}</div>
              <div className="mt-1 text-xs leading-relaxed text-[var(--text-muted)] line-clamp-2">
                {kpi.account ? `@${kpi.account}` : 'Lintas akun'}
              </div>
            </article>
          )
        })}
      </div>
      {summary.bullets.length > 0 && (
        <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-sm)]">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">Key Takeaways</div>
          <ul className="grid gap-2">
            {summary.bullets.map((bullet, i) => (
              <li key={bullet} className="flex items-start gap-2 text-sm leading-relaxed text-[var(--text-muted)]">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[10px] font-bold text-[var(--brand)]">{i + 1}</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionCard>
  )
}