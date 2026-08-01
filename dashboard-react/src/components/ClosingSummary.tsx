import type { ExecutiveSummaryData, FreshnessSummary, InsightsData, TodaySummaryData } from '../data/selectors'

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
  const lead = summary.kpis[0]
  const takeaway = insights.items[0]

  return (
    <div className="grid gap-6">
      {/* Narrative lead */}
      <section className="border border-[var(--border)] bg-[var(--panel)] p-6">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">Ringkasan penutup</h2>
        <p className="mt-4 text-lg leading-relaxed text-[var(--text)]">
          {takeaway ? `${takeaway.title} — ${takeaway.description}` : 'Tidak ada ringkasan yang tersedia untuk hari ini.'}
        </p>

        {/* Closing figure */}
        {lead ? (
          <div className="mt-6 border-t border-[var(--border)] pt-4">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
              {lead.label}{lead.account ? ` · @${lead.account}` : ''}
            </p>
            <p className="mt-1 font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-normal tracking-[-0.03em] text-[var(--text)]">
              {lead.value}
            </p>
          </div>
        ) : null}
      </section>

      {/* Supporting paragraphs */}
      {insights.items.length > 1 && (
        <section className="border border-[var(--border)] bg-[var(--panel-muted)] p-6">
          <div className="grid">
            {insights.items.slice(1, 4).map((item, i) => (
              <p key={item.title} className={`text-sm leading-relaxed text-[var(--text-muted)] ${i === 0 ? '' : 'border-t border-[var(--border)] pt-4'} ${i === 0 ? 'pb-4' : ''}`}>
                <strong className="font-semibold text-[var(--text)] break-words">{item.title}</strong> — {item.description}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Reference line */}
      <p className="text-xs text-[var(--text-soft)]">
        Ref: {today.referenceDate} · Generated {freshness.generatedAtLabel} · Latest: {freshness.latestDateLabel}
      </p>
    </div>
  )
}
