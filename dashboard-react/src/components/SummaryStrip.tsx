import { memo } from 'react'
import type { SummaryStripItem } from '../data/selectors'

export const SummaryStrip = memo(function SummaryStrip({ items }: { items: SummaryStripItem[] }) {
  return (
    <section className="border border-[var(--border)] bg-[var(--panel-muted)] p-6">
      <h2 className="text-lg font-semibold text-[var(--text)]">Rankings</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead>
            <tr>
              <th className="pb-2 pr-3 text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
                #
              </th>
              <th className="pb-2 pr-3 text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
                Metric
              </th>
              <th className="pb-2 pr-3 text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
                Account
              </th>
              <th className="pb-2 text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">
                Detail
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.label} className="border-t border-[var(--border)]">
                <td className="py-3 pr-3 font-display text-sm font-normal text-[var(--text-muted)]">
                  {String(i + 1).padStart(2, '0')}
                </td>
                <td className="py-3 pr-3 text-[var(--text-muted)]">{item.label}</td>
                <td
                  className={`py-3 pr-3 font-semibold ${
                    item.emphasis ? 'text-[var(--brand)]' : 'text-[var(--text)]'
                  }`}
                >
                  {item.value}
                </td>
                <td className="py-3 text-[var(--text-muted)]">{item.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
})
