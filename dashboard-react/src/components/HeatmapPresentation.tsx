import { Fragment, useMemo, useState } from 'react'
import { getHeatmapData } from '../data/selectors'
import type { DashboardRecord } from '../data/types'

export function HeatmapPresentation({ data }: { data: DashboardRecord }) {
  const [account, setAccount] = useState(data.accounts[0] ?? '')
  const heatmap = useMemo(() => getHeatmapData(data, account), [account, data])

  return (
    <div className="grid gap-6">
      {/* Stat-Led lead */}
      <div className="border-b border-[var(--border)] pb-6">
        <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
          Jendela posting terbaik{account ? ` · @${account}` : ''}
        </p>
        <p className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-normal tracking-[-0.03em] text-[var(--text)]">
          {heatmap.bestWindow}
        </p>
      </div>

      {/* Toolbar */}
      <div className="grid gap-3 sm:max-w-[280px]">
        <label className="grid gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Akun</span>
          <select className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-3.5 py-2.5 text-sm text-[var(--text)]" value={account} onChange={(event) => setAccount(event.target.value)}>
            {heatmap.accounts.map((item) => <option key={item} value={item}>@{item}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-3 text-sm">
        <p className="text-[var(--text-muted)]">Total post dianalisis: <span className="font-semibold text-[var(--text)]">{heatmap.totalPosts}</span></p>
      </div>

      {/* Heatmap figure */}
      <section className="border border-[var(--border)] bg-[var(--panel)] p-5">
        <p className="text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">Distribusi waktu posting</p>

        <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-muted)]" aria-label="Legenda intensitas heatmap">
          <span>Rendah</span>
          <span className="h-3 w-3 rounded-[var(--radius-sm)] bg-[rgba(225,48,108,0.10)]" />
          <span className="h-3 w-3 rounded-[var(--radius-sm)] bg-[rgba(225,48,108,0.22)]" />
          <span className="h-3 w-3 rounded-[var(--radius-sm)] bg-[rgba(193,53,132,0.38)]" />
          <span className="h-3 w-3 rounded-[var(--radius-sm)] bg-[rgba(131,58,180,0.55)]" />
          <span className="h-3 w-3 rounded-[var(--radius-sm)] bg-[rgba(131,58,180,0.85)]" />
          <span>Tinggi</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <div className="grid min-w-[520px] grid-cols-[90px_repeat(4,minmax(88px,1fr))] gap-2" role="table" aria-label={`Heatmap waktu posting untuk @${account}`}>
            <div className="rounded-[var(--radius-sm)] border border-transparent" />
            {heatmap.matrix[0]?.map((cell) => (
              <div key={`${cell.slot}-${cell.sublabel}`} className="grid gap-0.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel-muted)] px-3 py-2 text-center">
                <span className="text-sm font-medium text-[var(--text)]">{cell.slot}</span>
                <small className="text-xs text-[var(--text-soft)]">{cell.sublabel}</small>
              </div>
            ))}
            {heatmap.matrix.map((row) => (
              <Fragment key={row[0]?.day}>
                <div className="flex items-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel-muted)] px-3 py-3 text-sm font-medium text-[var(--text)]">{row[0]?.day}</div>
                {row.map((cell) => (
                  <div
                    key={`${cell.day}-${cell.slot}`}
                    className="flex min-h-[68px] items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] text-sm font-semibold"
                    style={{
                      background: `rgba(131, 58, 180, ${Math.max(cell.intensity * 0.75, 0.06)})`,
                      color: cell.intensity >= 0.45 ? 'var(--color-accent-ink)' : 'var(--text)',
                    }}
                    title={`${cell.day} · ${cell.slot} (${cell.sublabel}) · ${cell.value} post`}
                  >
                    {cell.value > 0 ? cell.value : '-'}
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">Semakin pekat warna sel, semakin sering akun memposting pada slot waktu tersebut dalam dataset terbaru.</p>
      </section>
    </div>
  )
}
