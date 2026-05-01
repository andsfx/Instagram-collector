import type { TodaySummaryData } from '../data/selectors'
import { SectionCard } from './ui'

export function TodaySummary({ today }: { today: TodaySummaryData }) {
  return (
    <SectionCard eyebrow="Update Hari Ini" title={today.title}>
      <div className="rounded-[var(--radius-lg)] border border-[rgba(131,58,180,0.16)] bg-gradient-to-br from-[rgba(64,93,230,0.05)] to-[rgba(225,48,108,0.06)] p-5 shadow-[var(--shadow-sm)]">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">Ringkasan Hari Ini</div>
          <span className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-[10px] font-bold text-[var(--text-muted)]">
            {today.referenceDate}
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {today.items.map((item) => (
            <article key={item.label} className="border-t border-[var(--border)] pt-3 first:border-t-0 first:pt-0 md:border-l md:border-t-0 md:pl-4 md:pt-0 md:first:border-l-0 md:first:pl-0">
              <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">{item.label}</div>
              <div className="mt-1 font-display text-2xl font-extrabold tracking-tight text-[var(--text)]">{item.value}</div>
              <div className="mt-0.5 text-xs text-[var(--text-muted)]">{item.detail}</div>
            </article>
          ))}
        </div>
      </div>
    </SectionCard>
  )
}