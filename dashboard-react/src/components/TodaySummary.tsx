import type { TodaySummaryData } from '../data/selectors'
import { SectionCard } from './ui'

export function TodaySummary({ today }: { today: TodaySummaryData }) {
  return (
    <SectionCard
      eyebrow="Update Hari Ini"
      title={today.title}
      description="Tiga indikator cepat untuk update rapat."
      actions={
        <span className="inline-flex items-center rounded-full border border-[color:color-mix(in_srgb,var(--brand)_16%,white)] bg-[color:color-mix(in_srgb,var(--brand-soft)_18%,white)] px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-[color:color-mix(in_srgb,var(--brand)_18%,transparent)] dark:bg-[color:color-mix(in_srgb,var(--brand)_12%,transparent)] dark:text-slate-200">
          Ref: {today.referenceDate}
        </span>
      }
    >
      <div className="grid gap-4 md:grid-cols-3 md:gap-6">
        {today.items.map((item) => (
          <article key={item.label} className="grid gap-2 border-t border-slate-200/80 pt-4 dark:border-white/10 md:first:border-t-0 md:first:pt-0">
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{item.label}</div>
            <div className="font-display text-[clamp(1.55rem,1.3rem+0.7vw,2.2rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-slate-950 dark:text-white">
              {item.value}
            </div>
            <div className="text-[0.94rem] leading-7 text-slate-600 dark:text-slate-300">{item.detail}</div>
          </article>
        ))}
      </div>
    </SectionCard>
  )
}
