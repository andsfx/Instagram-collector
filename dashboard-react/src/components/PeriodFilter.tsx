export type Period = 'day' | 'week' | 'month'

const LABELS: Record<Period, string> = { day: 'Hari', week: 'Minggu', month: 'Bulan' }

export function PeriodFilter({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  const periods: Period[] = ['day', 'week', 'month']
  return (
    <div className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--panel)] p-0.5 shadow-[var(--shadow-sm)]">
      <span className="px-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-soft)]">Periode</span>
      {periods.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`rounded-[var(--radius-pill)] px-4 py-1.5 text-xs font-semibold transition-all ${
            value === p
              ? 'bg-[image:var(--ig-gradient)] text-white shadow-[0_2px_10px_rgba(225,48,108,0.35)]'
              : 'text-[var(--text-soft)] hover:text-[var(--text)] hover:bg-[var(--panel-muted)]'
          }`}
        >
          {LABELS[p]}
        </button>
      ))}
    </div>
  )
}