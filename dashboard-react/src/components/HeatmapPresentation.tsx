import { Fragment, useMemo, useState } from 'react'
import { getHeatmapData } from '../data/selectors'
import type { DashboardRecord } from '../data/types'
import { SectionCard } from './ui'

export function HeatmapPresentation({ data }: { data: DashboardRecord }) {
  const [account, setAccount] = useState(data.accounts[0] ?? '')
  const heatmap = useMemo(() => getHeatmapData(data, account), [account, data])

  return (
    <SectionCard
      eyebrow="Heatmap"
      title="Distribusi waktu posting per akun"
      description="Heatmap diperlakukan sebagai lembar referensi waktu, jadi legenda, selector, dan grid dibawa ke format appendix yang lebih sunyi."
      actions={
        <label className="grid gap-1.5">
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Akun</span>
          <select className="rounded-[1rem] border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-200" value={account} onChange={(event) => setAccount(event.target.value)}>
            {heatmap.accounts.map((item) => <option key={item} value={item}>@{item}</option>)}
          </select>
        </label>
      }
    >
      <div className="flex flex-wrap gap-2 border-t border-slate-200/80 pt-5 dark:border-white/10">
        <span className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">Total post dianalisis: {heatmap.totalPosts}</span>
        <span className="inline-flex items-center rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">Jendela terbaik: {heatmap.bestWindow}</span>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400" aria-label="Legenda intensitas heatmap">
        <span>Rendah</span>
        <span className="h-3 w-3 rounded bg-[rgba(232,104,58,0.10)]" />
        <span className="h-3 w-3 rounded bg-[rgba(232,104,58,0.18)]" />
        <span className="h-3 w-3 rounded bg-[rgba(232,104,58,0.28)]" />
        <span className="h-3 w-3 rounded bg-[rgba(232,104,58,0.38)]" />
        <span className="h-3 w-3 rounded bg-[rgba(142,51,32,0.64)]" />
        <span>Tinggi</span>
      </div>

      <div className="overflow-x-auto border-t border-slate-200/80 pt-5 dark:border-white/10">
        <div className="grid min-w-[520px] grid-cols-[90px_repeat(4,minmax(88px,1fr))] gap-2" role="table" aria-label={`Heatmap waktu posting untuk @${account}`}>
          <div className="rounded-[0.9rem] border border-transparent" />
          {heatmap.matrix[0]?.map((cell) => (
            <div key={`${cell.slot}-${cell.sublabel}`} className="grid gap-0.5 rounded-[0.9rem] border border-slate-200/80 bg-slate-50/85 px-3 py-2 text-center dark:border-white/10 dark:bg-white/5">
              <span className="text-sm font-medium text-slate-950 dark:text-white">{cell.slot}</span>
              <small className="text-[0.72rem] text-slate-500 dark:text-slate-400">{cell.sublabel}</small>
            </div>
          ))}
          {heatmap.matrix.map((row) => (
            <Fragment key={row[0]?.day}>
              <div className="flex items-center rounded-[0.9rem] border border-slate-200/80 bg-slate-50/85 px-3 py-3 text-sm font-medium text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-white">{row[0]?.day}</div>
              {row.map((cell) => (
                <div
                  key={`${cell.day}-${cell.slot}`}
                  className="flex min-h-[68px] items-center justify-center rounded-[0.9rem] border border-slate-200/60 text-sm font-semibold shadow-sm dark:border-white/10"
                  style={{
                    background: `linear-gradient(180deg, rgba(232, 104, 58, ${Math.max(cell.intensity * 0.14, 0.05)}), rgba(142, 51, 32, ${Math.max(cell.intensity * 0.72, 0.08)}))`,
                    color: cell.intensity >= 0.45 ? '#ffffff' : 'var(--text)',
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

      <div className="text-[0.9rem] leading-6 text-slate-600 dark:text-slate-300">Semakin pekat warna sel, semakin sering akun memposting pada slot waktu tersebut dalam dataset terbaru.</div>
    </SectionCard>
  )
}
