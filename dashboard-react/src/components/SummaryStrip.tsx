import type { SummaryStripItem } from '../data/selectors'

export function SummaryStrip({ items }: { items: SummaryStripItem[] }) {
  return (
    <section className="summary-strip-grid">
      {items.map((item) => (
        <article key={item.label} className={`summary-strip-card ${item.emphasis ? 'is-emphasis' : ''}`}>
          <div className="stat-label">{item.label}</div>
          <div className={`big-value ${item.emphasis ? 'editorial-value' : ''}`}>{item.value}</div>
          <div className="helper-copy">{item.detail}</div>
        </article>
      ))}
    </section>
  )
}
