import type { TodaySummaryData } from '../data/selectors'
import { SectionCard } from './ui'

export function TodaySummary({ today }: { today: TodaySummaryData }) {
  return (
    <SectionCard
      eyebrow="Update Hari Ini"
      title={today.title}
      description="Ringkasan operasional ini menjaga konteks harian tetap singkat, rapi, dan siap dibahas di opening presentation."
      actions={
        <span className="inline-flex items-center rounded-full border border-[color:color-mix(in_srgb,var(--brand)_14%,var(--border))] bg-[color:color-mix(in_srgb,var(--panel)_84%,transparent)] px-2.5 py-1.5 text-xs font-bold text-brand">
          Ref date: {today.referenceDate}
        </span>
      }
    >
      <div className="grid gap-4 desktop:grid-cols-3">
        {today.items.map((item) => (
          <article
            key={item.label}
            className="grid gap-3 rounded-[24px] border border-[color:color-mix(in_srgb,var(--border)_94%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_98%,transparent),color-mix(in_srgb,var(--panel-muted)_90%,transparent))] p-[22px] shadow-panel-sm"
          >
            <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">{item.label}</div>
            <div className="font-display text-[clamp(1.5rem,1.2rem+0.75vw,2.2rem)] font-semibold leading-none text-text">{item.value}</div>
            <div className="text-[0.92rem] leading-[1.6] text-text-muted">{item.detail}</div>
          </article>
        ))}
      </div>
    </SectionCard>
  )
}
