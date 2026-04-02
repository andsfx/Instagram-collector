import { Fragment, useMemo, useState } from 'react'
import { getHeatmapData } from '../data/selectors'
import type { DashboardRecord } from '../data/types'
import { SectionCard } from './ui'

export function Heatmap({ data }: { data: DashboardRecord }) {
  const [account, setAccount] = useState(data.accounts[0] ?? '')
  const heatmap = useMemo(() => getHeatmapData(data, account), [account, data])

  return (
    <SectionCard
      eyebrow="Heatmap"
      title="Distribusi waktu posting per akun"
      description="Heatmap ini dibangun langsung dari timestamp posting pada `post_insights`, sehingga tetap bisa ikut update tanpa rebuild React app."
      actions={
        <label className="grid gap-2">
          <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-text-soft">Akun</span>
          <select className="min-h-[42px] min-w-[180px] rounded-xl border border-border bg-panel px-3.5 py-2.5 text-text" value={account} onChange={(event) => setAccount(event.target.value)}>
            {heatmap.accounts.map((item) => <option key={item} value={item}>@{item}</option>)}
          </select>
        </label>
      }
    >
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex rounded-full bg-[linear-gradient(180deg,var(--brand-soft),color-mix(in_srgb,var(--brand-soft-2)_72%,var(--panel)))] px-2.5 py-1.5 text-xs font-bold text-brand">Total post dianalisis: {heatmap.totalPosts}</span>
        <span className="inline-flex rounded-full bg-success-soft px-2.5 py-1.5 text-xs font-bold text-success">Jendela terbaik: {heatmap.bestWindow}</span>
      </div>
      <div className="inline-flex flex-wrap items-center gap-2" aria-label="Legenda intensitas heatmap">
        <span className="text-sm text-text-muted">Rendah</span>
        <span className="h-[18px] w-[18px] rounded-md border border-border bg-panel" />
        <span className="h-[18px] w-[18px] rounded-md border border-border bg-[rgba(232,104,58,0.12)]" />
        <span className="h-[18px] w-[18px] rounded-md border border-border bg-[rgba(232,104,58,0.3)]" />
        <span className="h-[18px] w-[18px] rounded-md border border-border bg-[rgba(176,61,34,0.55)]" />
        <span className="h-[18px] w-[18px] rounded-md border border-border bg-[rgba(142,51,32,0.88)]" />
        <span className="text-sm text-text-muted">Tinggi</span>
      </div>
      <div className="w-full overflow-x-auto rounded-panel-md border border-[color:color-mix(in_srgb,var(--brand)_12%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel-muted)_90%,var(--brand-soft)_10%),var(--panel))] p-2.5">
        <div className="grid grid-cols-[56px_repeat(4,minmax(52px,1fr))] gap-2 mobile:grid-cols-[72px_repeat(4,minmax(0,1fr))]" role="table" aria-label={`Heatmap waktu posting untuk @${account}`}>
          <div className="min-h-12 rounded-xl border border-border bg-panel-muted p-2 mobile:min-h-[58px]" />
          {heatmap.matrix[0]?.map((cell) => (
            <div key={`${cell.slot}-${cell.sublabel}`} className="flex min-h-12 flex-col items-center justify-center rounded-xl border border-border bg-panel-muted p-2 text-center font-bold mobile:min-h-[58px]">
              <span>{cell.slot}</span>
              <small className="text-[0.68rem] text-text-soft mobile:text-xs">{cell.sublabel}</small>
            </div>
          ))}
          {heatmap.matrix.map((row) => (
            <Fragment key={row[0]?.day}>
              <div className="flex min-h-12 items-center justify-center rounded-xl border border-border bg-panel-muted p-2 font-extrabold text-text-muted mobile:min-h-[58px]">{row[0]?.day}</div>
              {row.map((cell) => (
                <div
                  key={`${cell.day}-${cell.slot}`}
                  className="flex min-h-12 items-center justify-center rounded-xl border p-2 text-center font-extrabold shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] mobile:min-h-[58px]"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--brand) 14%, var(--border))',
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
      <div className="text-[0.92rem] leading-[1.6] text-text-muted">Semakin pekat warna sel, semakin sering akun memposting pada slot waktu tersebut dalam dataset terbaru.</div>
    </SectionCard>
  )
}
