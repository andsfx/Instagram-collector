import { Fragment, useMemo, useState } from 'react'
import { getHeatmapData } from '../data/selectors'
import type { DashboardRecord } from '../data/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const LEVELS = [0, 1, 2, 3, 4] as const

export function HeatmapPresentation({ data }: { data: DashboardRecord }) {
  const [account, setAccount] = useState(data.accounts[0] ?? '')
  const heatmap = useMemo(() => getHeatmapData(data, account), [account, data])

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Jendela posting terbaik{account ? ` · @${account}` : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl font-semibold tracking-tight break-words md:text-4xl">{heatmap.bestWindow}</p>
            <p className="mt-2.5 max-w-[46ch] text-xs leading-relaxed text-muted-foreground">
              Semakin pekat sel, semakin sering akun memposting pada slot waktu tersebut dalam dataset terbaru.
              Total post dianalisis: {heatmap.totalPosts}.
            </p>
            <div className="mt-4">
              <div className="grid min-w-[220px] gap-1">
                <span className="text-xs font-medium text-muted-foreground">Akun</span>
                <Select value={account} onValueChange={setAccount}>
                  <SelectTrigger aria-label="Akun">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {heatmap.accounts.map((item) => (
                      <SelectItem key={item} value={item}>
                        @{item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Intensitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Legenda intensitas heatmap">
              <span>Rendah</span>
              {LEVELS.map((level) => (
                <span key={level} className={`size-3 rounded-sm border border-border heatmap-legend-box is-${level}`} />
              ))}
              <span>Tinggi</span>
            </div>
            <p className="mt-3.5 text-xs leading-relaxed text-muted-foreground">
              Baris = hari, kolom = slot waktu. Angka di sel adalah jumlah post pada slot itu.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="md:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm">Distribusi waktu posting</CardTitle>
            <CardDescription className="text-xs">{`@${account}`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <div
                className="grid min-w-[420px] grid-cols-[64px_repeat(4,minmax(0,1fr))] gap-0.5"
                role="table"
                aria-label={`Heatmap waktu posting untuk @${account}`}
              >
                <div className="min-h-9 border-r border-b border-border text-xs text-muted-foreground" />
                {heatmap.matrix[0]?.map((cell) => (
                  <div
                    key={`${cell.slot}-${cell.sublabel}`}
                    className="flex min-h-9 flex-col items-center justify-center border-r border-b border-border text-xs"
                  >
                    <span>{cell.slot}</span>
                    <span className="text-[8.5px] text-muted-foreground">{cell.sublabel}</span>
                  </div>
                ))}
                {heatmap.matrix.map((row) => (
                  <Fragment key={row[0]?.day}>
                    <div className="flex min-h-9 items-center justify-start border-r border-b border-border text-xs text-muted-foreground">
                      {row[0]?.day}
                    </div>
                    {row.map((cell) => {
                      const level = cell.value === 0 ? 0 : cell.intensity >= 0.75 ? 4 : cell.intensity >= 0.5 ? 3 : cell.intensity >= 0.25 ? 2 : 1
                      return (
                        <div
                          key={`${cell.day}-${cell.slot}`}
                          className={`flex min-h-9 items-center justify-center border-r border-b border-border text-[11px] tabular-nums matrix-cell i${level}`}
                          title={`${cell.day} · ${cell.slot} (${cell.sublabel}) · ${cell.value} post`}
                        >
                          {cell.value > 0 ? cell.value : '–'}
                        </div>
                      )
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
