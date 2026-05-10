import type { InsightsData } from '../data/selectors'
import { SectionCard } from './ui'

export function InsightsPanel({ insights }: { insights: InsightsData }) {
  if (insights.items.length === 0) {
    return (
      <SectionCard eyebrow="Insights" title="Catatan keputusan">
        <p className="py-8 text-center text-sm text-[var(--text-muted)]">Insight belum tersedia untuk periode ini.</p>
      </SectionCard>
    )
  }
  return (
    <SectionCard eyebrow="Insights" title="Catatan keputusan">
      <div className="grid gap-4 md:grid-cols-3">
        {insights.items.map((item) => (
          <article
            key={item.title}
            className="grid gap-3 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5"
          >
            <div className={`inline-flex w-fit items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1 text-[10px] font-bold ${
              item.tone === 'positive' ? 'bg-[var(--success-soft)] text-[var(--success)]'
              : item.tone === 'warning' ? 'bg-[var(--warning-soft)] text-[var(--warning)]'
              : item.tone === 'danger' ? 'bg-[var(--danger-soft)] text-[var(--danger)]'
              : 'bg-[var(--brand-soft)] text-[var(--brand)]'
            }`}>
              {item.label}
            </div>
            <h3 className="font-display text-base font-bold tracking-tight text-[var(--text)] break-words">{item.title}</h3>
            <p className="text-sm leading-relaxed text-[var(--text-muted)] break-words">{item.description}</p>
          </article>
        ))}
      </div>
    </SectionCard>
  )
}