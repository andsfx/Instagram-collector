import type { TodaySummaryData } from '../data/selectors'
import { SectionCard } from './ui'

export function TodaySummary({ today }: { today: TodaySummaryData }) {
  return (
    <SectionCard
      eyebrow="Update Hari Ini"
      title={today.title}
      description="Ringkasan ini menjaga momentum setelah executive summary, dengan tiga sinyal yang masih penting tetapi tidak lagi berebut perhatian."
      actions={
        <span className="inline-flex items-center rounded-full border border-[color:color-mix(in_srgb,var(--brand)_16%,white)] bg-[color:color-mix(in_srgb,var(--brand-soft)_18%,white)] px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-[color:color-mix(in_srgb,var(--brand)_18%,transparent)] dark:bg-[color:color-mix(in_srgb,var(--brand)_12%,transparent)] dark:text-slate-200">
          Ref date: {today.referenceDate}
        </span>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        {today.items.map((item) => (
          <article
            key={item.label}
            className="grid gap-3 rounded-[1.5rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.82))] p-5 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.4)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.62),rgba(15,23,42,0.52))]"
          >
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{item.label}</div>
            <div className="font-display text-[clamp(1.65rem,1.34rem+0.75vw,2.3rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-slate-950 dark:text-white">
              {item.value}
            </div>
            <div className="text-[0.94rem] leading-7 text-slate-600 dark:text-slate-300">{item.detail}</div>
          </article>
        ))}
      </div>
    </SectionCard>
  )
}
