import type { TodaySummaryData } from '../data/selectors'
import { SectionCard } from './ui'

export function TodaySummary({ today }: { today: TodaySummaryData }) {
  return (
    <SectionCard
      eyebrow="Update Hari Ini"
      title={today.title}
      description="Narasi singkat ini mempertahankan flow summary-to-detail dari dashboard legacy tanpa ornamen yang tidak perlu."
      actions={
        <span className="inline-flex items-center rounded-full bg-[linear-gradient(180deg,var(--brand-soft),color-mix(in_srgb,var(--brand-soft-2)_72%,var(--panel)))] px-2.5 py-1.5 text-xs font-bold text-brand">
          Ref date: {today.referenceDate}
        </span>
      }
    >
      <div className="grid gap-4 desktop:grid-cols-3">
        {today.items.map((item) => (
          <article
            key={item.label}
            className="grid gap-3 rounded-panel-md border border-[color:color-mix(in_srgb,var(--brand)_12%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_88%,var(--brand-soft)_12%),var(--panel))] p-[22px] shadow-panel-sm"
          >
            <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">{item.label}</div>
            <div className="font-display text-[clamp(1.5rem,1.2rem+0.75vw,2.2rem)] leading-none text-brand-strong">{item.value}</div>
            <div className="text-[0.92rem] leading-[1.6] text-text-muted">{item.detail}</div>
          </article>
        ))}
      </div>
    </SectionCard>
  )
}
