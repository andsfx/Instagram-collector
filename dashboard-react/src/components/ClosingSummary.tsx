import type { ExecutiveSummaryData, FreshnessSummary, InsightsData, TodaySummaryData } from '../data/selectors'
import { SectionCard } from './ui'

export function ClosingSummary({
  summary,
  today,
  insights,
  freshness,
}: {
  summary: ExecutiveSummaryData
  today: TodaySummaryData
  insights: InsightsData
  freshness: FreshnessSummary
}) {
  return (
    <SectionCard eyebrow="Closing Summary" title="Ringkasan penutup">
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow-sm)]">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {summary.kpis.slice(0, 3).map((kpi) => (
                <div key={kpi.key}>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-soft)]">{kpi.label}</div>
                  <div className="font-display text-lg font-extrabold tracking-tight text-[var(--text)]">{kpi.value}</div>
                  <div className="text-xs text-[var(--text-muted)]">{kpi.account ? `@${kpi.account}` : 'Agregat'}</div>
                </div>
              ))}
            </div>
            <div className="grid gap-2 border-t border-[var(--border)] pt-3">
              {insights.items.slice(0, 3).map((item, i) => (
                <div key={item.title} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[10px] font-bold text-[var(--brand)]">{i + 1}</span>
                  <span><strong className="text-[var(--text)] break-words">{item.title}</strong> — {item.description}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-[var(--border)] pt-3 text-xs text-[var(--text-soft)] lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <div className="font-bold">Ref: {today.referenceDate}</div>
            <div className="mt-1">Generated {freshness.generatedAtLabel}</div>
            <div>Latest: {freshness.latestDateLabel}</div>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}