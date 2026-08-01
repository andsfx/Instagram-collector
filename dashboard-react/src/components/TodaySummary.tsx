import type { TodaySummaryData } from '../data/selectors'

export function TodaySummary({ today }: { today: TodaySummaryData }) {
  const [primary, ...rest] = today.items

  return (
    <section className="border border-[var(--border)] bg-[var(--panel)] p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-[var(--text)]">{today.title}</h2>
        <span className="text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
          {today.referenceDate}
        </span>
      </div>

      {primary && (
        <div className="mt-6 border-b border-[var(--border)] pb-6">
          <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
            {primary.label}
          </p>
          <p className="font-display text-[clamp(2rem,4vw,3rem)] font-normal tracking-[-0.03em] text-[var(--text)]">
            {primary.value}
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{primary.detail}</p>
        </div>
      )}

      {rest.length > 0 && (
        <div className="mt-2">
          {rest.map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-1 border-t border-[var(--border)] py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            >
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
                  {item.label}
                </p>
                <p className="mt-0.5 text-sm text-[var(--text-muted)]">{item.detail}</p>
              </div>
              <p className="shrink-0 font-display text-xl font-normal tracking-tight text-[var(--text)]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
