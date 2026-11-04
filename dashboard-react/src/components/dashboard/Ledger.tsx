import type { ReactNode } from 'react'

/**
 * Label + value ledger. Keeps a real `<dl>` so the pairs stay associated.
 */
export function Ledger({ rows }: { rows: Array<{ key: string; value: ReactNode; note?: string }> }) {
  return (
    <dl className="divide-y divide-border text-sm">
      {rows.map((row) => (
        <div className="flex items-baseline justify-between gap-3 py-2" key={row.key}>
          <dt className="text-muted-foreground">
            {row.key}
            {row.note ? <span className="text-xs text-muted-foreground"> · {row.note}</span> : null}
          </dt>
          <dd className="text-right font-medium tabular-nums">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}
