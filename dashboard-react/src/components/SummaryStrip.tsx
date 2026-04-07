import type { SummaryStripItem } from '../data/selectors'

export function SummaryStrip({ items }: { items: SummaryStripItem[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <article
          key={item.label}
          className={`grid gap-2 rounded-[1.45rem] border p-4 shadow-[0_18px_46px_-42px_rgba(15,23,42,0.38)] ${
            item.emphasis
              ? 'border-[color:color-mix(in_srgb,var(--brand)_18%,white)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_18%,white),rgba(255,255,255,0.92))] dark:border-[color:color-mix(in_srgb,var(--brand)_20%,transparent)] dark:bg-[linear-gradient(180deg,rgba(51,65,85,0.72),rgba(15,23,42,0.56))]'
              : 'border-slate-200/80 bg-white/74 dark:border-white/10 dark:bg-slate-950/46'
          }`}
        >
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{item.label}</div>
          <div className={`font-display text-[clamp(1.35rem,1.12rem+0.5vw,1.85rem)] font-semibold leading-[0.98] tracking-[-0.035em] ${item.emphasis ? 'text-[var(--brand)]' : 'text-slate-950 dark:text-white'}`}>
            {item.value}
          </div>
          <div className="text-[0.9rem] leading-6 text-slate-600 dark:text-slate-300">{item.detail}</div>
        </article>
      ))}
    </section>
  )
}
