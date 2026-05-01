export type Period = 'day' | 'week' | 'month'

const LABELS: Record<Period, string> = { day: 'Hari', week: 'Minggu', month: 'Bulan' }

export function PeriodFilter({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  const periods: Period[] = ['day', 'week', 'month']
  return (
    <div className="grid gap-1">
      <div className="px-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-soft)]">Periode</div>
      <div className="flex gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel-muted)] p-0.5">
        {periods.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`flex-1 rounded-[calc(var(--radius-sm)-2px)] px-2 py-1 text-[11px] font-semibold transition-all ${
              value === p
                ? 'bg-[var(--panel)] text-[var(--brand)] shadow-sm'
                : 'text-[var(--text-soft)] hover:text-[var(--text)]'
            }`}
          >
            {LABELS[p]}
          </button>
        ))}
      </div>
    </div>
  )
}