import type { SummaryStripItem } from '../data/selectors'

export function SummaryStrip({ items }: { items: SummaryStripItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item, i) => (
        <article
          key={item.label}
          className={`rounded-[var(--radius-md)] border border-[var(--border)] p-3 shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)] ${
            i === 0 ? 'bg-gradient-to-br from-[rgba(225,48,108,0.06)] to-[var(--panel)]' : 'bg-[var(--panel)]'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">{item.label}</div>
          <div className={`mt-1 font-display text-lg font-extrabold tracking-tight ${item.emphasis ? 'text-[var(--brand)]' : 'text-[var(--text)]'}`}>
            {item.value}
          </div>
          <div className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-muted)]">{item.detail}</div>
        </article>
      ))}
    </div>
  )
}