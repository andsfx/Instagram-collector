import type { ExecutiveSummaryData } from '../data/selectors'

export function ExecutiveSummary({ summary }: { summary: ExecutiveSummaryData }) {
  if (summary.kpis.length === 0) {
    return (
      <section className="border border-[var(--border)] bg-[var(--panel)] p-6">
        <h2 className="text-lg font-semibold text-[var(--text)]">Sinyal utama brand</h2>
        <p className="mt-4 py-6 text-center text-sm text-[var(--text-muted)]">
          Ringkasan belum bisa dibuat karena data belum lengkap.
        </p>
      </section>
    )
  }

  const [lead, ...rest] = summary.kpis

  return (
    <div className="grid gap-6">
      {/* Stat-Led lead */}
      <div className="border-b border-[var(--border)] pb-6">
        <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
          {lead.label}
          {lead.account ? ` · @${lead.account}` : ''}
        </p>
        <p className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-normal tracking-[-0.03em] text-[var(--text)]">
          {lead.value}
        </p>
      </div>

      {/* Remaining KPIs — 2-col table */}
      {rest.length > 0 && (
        <div className="grid sm:grid-cols-2">
          {rest.map((kpi) => (
            <div
              key={kpi.key}
              className="flex items-baseline justify-between gap-4 border-t border-[var(--border)] py-3"
            >
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
                  {kpi.label}
                </p>
                {kpi.account ? (
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">@{kpi.account}</p>
                ) : (
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">Lintas akun</p>
                )}
              </div>
              <p className="shrink-0 font-display text-2xl font-normal tracking-tight text-[var(--text)]">
                {kpi.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Key Takeaways — paper-3 editorial panel */}
      {summary.bullets.length > 0 && (
        <section className="border border-[var(--border)] bg-[var(--panel-muted)] p-6">
          <h2 className="text-lg font-semibold text-[var(--text)]">Key Takeaways</h2>
          <ol className="mt-4">
            {summary.bullets.map((bullet, i) => (
              <li
                key={bullet}
                className="flex items-start gap-3 border-t border-[var(--border)] py-3 first:border-t-0 first:pt-0"
              >
                <span className="mt-0.5 shrink-0 font-display text-sm font-normal text-[var(--brand)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-sm leading-relaxed text-[var(--text-muted)]">{bullet}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}
