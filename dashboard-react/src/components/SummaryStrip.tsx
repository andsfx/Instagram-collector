import type { SummaryStripItem } from '../data/selectors'

export function SummaryStrip({ items }: { items: SummaryStripItem[] }) {
  return (
    <section className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <article
          key={item.label}
          className={[
            'rounded-[22px] border p-4 shadow-panel-sm',
            item.emphasis
              ? 'border-[color:color-mix(in_srgb,var(--brand)_18%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_72%,var(--panel)),color-mix(in_srgb,var(--panel)_96%,transparent))]'
              : 'border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_98%,transparent),color-mix(in_srgb,var(--panel-muted)_88%,transparent))]',
          ].join(' ')}
        >
          <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">{item.label}</div>
          <div className={item.emphasis ? 'mt-2.5 font-display text-[clamp(1.5rem,1.2rem+0.75vw,2.2rem)] font-semibold leading-none text-brand-strong' : 'mt-2.5 font-display text-[clamp(1.3rem,1.1rem+0.5vw,1.85rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-text'}>
            {item.value}
          </div>
          <div className="mt-2.5 text-[0.92rem] leading-[1.6] text-text-muted">{item.detail}</div>
        </article>
      ))}
    </section>
  )
}
