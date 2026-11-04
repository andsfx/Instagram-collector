import type { QuickVisualData } from '../data/selectors'
import { formatInteger, formatPercent } from '../utils/formatters'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function trendClass(value: number) {
  if (value > 0) return 'text-emerald-600 dark:text-emerald-400'
  if (value < 0) return 'text-destructive'
  return 'text-muted-foreground'
}

export function FeaturedGrowthChart({ data }: { data: QuickVisualData }) {
  const firstPoint = data.followerTrend[0]
  const lastPoint = data.followerTrend[data.followerTrend.length - 1]

  if (!firstPoint || !lastPoint || data.series.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="md:col-span-2 xl:col-span-3">
          <CardContent>
            <p className="text-sm text-muted-foreground">Tidak ada data growth untuk ditampilkan.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const movers = data.series
    .map((series) => {
      const start = Number(firstPoint?.[series.key] ?? 0)
      const end = Number(lastPoint?.[series.key] ?? 0)
      const delta = end - start
      const pct = start > 0 ? (delta / start) * 100 : 0
      return { account: series.key, delta, pct, end, color: series.color }
    })
    .sort((left, right) => right.end - left.end)

  const totalFollowers = movers.reduce((sum, m) => sum + m.end, 0)
  const totalStart = movers.reduce((sum, m) => sum + (m.end - m.delta), 0)
  const totalDelta = movers.reduce((sum, m) => sum + m.delta, 0)
  const totalPct = totalStart > 0 ? (totalDelta / totalStart) * 100 : 0
  const maxFollowers = movers[0]?.end ?? 1
  const windowDays = data.followerTrend.length

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardDescription className="text-xs font-medium">{`Perubahan followers · ${windowDays} hari`}</CardDescription>
          <CardTitle className="font-heading text-4xl font-semibold tabular-nums tracking-tight break-words md:text-5xl">
            {totalDelta >= 0 ? '+' : ''}
            {formatInteger(totalDelta)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="max-w-[46ch] text-xs leading-relaxed text-muted-foreground">
            {totalPct >= 0 ? '+' : ''}
            {formatPercent(totalPct)} · {formatInteger(totalFollowers)} total followers · {data.series.length} akun
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Peringkat followers</CardTitle>
          <CardDescription className="text-xs">{`${windowDays} hari`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {movers.map((m, i) => (
              <div key={m.account} className="grid gap-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-baseline gap-2">
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="inline-block size-2 shrink-0 rounded-full"
                      style={{ background: m.color }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 truncate text-sm font-semibold" title={`@${m.account}`}>
                      @{m.account}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-baseline gap-2.5">
                    <span className="text-sm font-bold tabular-nums">{formatInteger(m.end)}</span>
                    <span className={`min-w-[62px] text-right text-xs tabular-nums ${trendClass(m.delta)}`}>
                      {m.delta > 0 ? '+' : ''}
                      {formatInteger(m.delta)}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(m.end / maxFollowers) * 100}%`, background: m.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Peringkat followers lintas akun pada window {windowDays} hari. Warna series data-only.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
