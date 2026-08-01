import type { InsightsData } from '../data/selectors'

export function InsightsPanel({ insights }: { insights: InsightsData }) {
  if (insights.items.length === 0) {
    return (
      <section className="border border-[var(--border)] bg-[var(--panel-muted)] p-6">
        <h2 className="text-lg font-semibold text-[var(--text)]">Catatan keputusan</h2>
        <p className="mt-4 py-6 text-center text-sm text-[var(--text-muted)]">
          Insight belum tersedia untuk periode ini.
        </p>
      </section>
    )
  }

  return (
    <section className="border border-[var(--border)] bg-[var(--panel-muted)] p-6">
      <h2 className="text-lg font-semibold text-[var(--text)]">Catatan keputusan</h2>
      <ol className="mt-4">
        {insights.items.map((item, i) => (
          <li
            key={item.title}
            className="border-t border-[var(--border)] py-4 first:border-t-0 first:pt-0"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 font-display text-sm font-normal text-[var(--brand)]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 grid gap-1">
                <p className="text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
                  {item.label}
                </p>
                <h3 className="text-base font-semibold text-[var(--text)] break-words">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-muted)] break-words">
                  {item.description}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
