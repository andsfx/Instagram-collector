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
        <label className="control-field control-field-inline">
          <span className="stat-label">Akun</span>
          <select value={account} onChange={(event) => setAccount(event.target.value)}>
            {heatmap.accounts.map((item) => <option key={item} value={item}>@{item}</option>)}
          </select>
        </label>
      }
    >
      <div className="badge-row">
        <span className="badge badge-brand">Total post dianalisis: {heatmap.totalPosts}</span>
        <span className="badge badge-success">Jendela terbaik: {heatmap.bestWindow}</span>
      </div>

      <div className="heatmap-scroll-shell">
        <div className="heatmap-grid" role="table" aria-label={`Heatmap waktu posting untuk @${account}`}>
          <div className="heatmap-header heatmap-corner" />
          {heatmap.matrix[0]?.map((cell) => (
            <div key={`${cell.slot}-${cell.sublabel}`} className="heatmap-header">
              <span>{cell.slot}</span>
              <small>{cell.sublabel}</small>
            </div>
          ))}
          {heatmap.matrix.map((row) => (
            <Fragment key={row[0]?.day}>
              <div className="heatmap-day">{row[0]?.day}</div>
              {row.map((cell) => (
                <div
                  key={`${cell.day}-${cell.slot}`}
                  className="heatmap-cell"
                  style={{
                    background: `linear-gradient(180deg, rgba(33, 82, 217, ${Math.max(cell.intensity * 0.16, 0.04)}), rgba(225, 48, 108, ${Math.max(cell.intensity * 0.78, 0.06)}))`,
                    color: cell.intensity >= 0.45 ? '#ffffff' : '#0f172a',
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
      <div className="helper-copy">Semakin pekat warna sel, semakin sering akun memposting pada slot waktu tersebut dalam dataset terbaru.</div>
    </SectionCard>
  )
}
