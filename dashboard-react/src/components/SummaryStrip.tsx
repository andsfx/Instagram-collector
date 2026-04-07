import type { SummaryStripItem } from '../data/selectors'

export function SummaryStrip({ items }: { items: SummaryStripItem[] }) {
  return (
    <section className="grid gap-3 border-t border-slate-200/80 pt-6 dark:border-white/10 md:grid-cols-3 md:gap-6">
      {items.map((item) => (
        <article key={item.label} className="grid gap-1.5">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{item.label}</div>
          <div className={`font-display text-[clamp(1.3rem,1.12rem+0.48vw,1.75rem)] font-semibold leading-[0.98] tracking-[-0.035em] ${item.emphasis ? 'text-[var(--brand)]' : 'text-slate-950 dark:text-white'}`}>
            {item.value}
          </div>
          <div className="max-w-[28ch] text-[0.9rem] leading-6 text-slate-600 dark:text-slate-300">{item.detail}</div>
        </article>
      ))}
    </section>
  )
}
