import type { UiAccountSummary } from '../data/types'
import { formatCompact, formatEngagementRate, formatPercent } from '../utils/formatters'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function trendClass(value: number) {
  if (value > 0) return 'text-emerald-600 dark:text-emerald-400'
  if (value < 0) return 'text-destructive'
  return 'text-muted-foreground'
}

export function AccountOverviewGrid({ accounts }: { accounts: UiAccountSummary[] }) {
  if (accounts.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="md:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm">Perbandingan akun</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Belum ada akun yang bisa ditampilkan.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {accounts.map((acc, index) => {
        const isBrand = index === 0
        return (
          <Card key={acc.key} className={isBrand ? 'bg-muted/60' : undefined}>
            <CardHeader>
              <CardTitle className="text-sm font-medium break-all">@{acc.name}</CardTitle>
              <Badge variant={isBrand ? 'default' : 'secondary'} className="justify-self-start">
                {isBrand ? 'Brand' : 'Kompetitor'}
              </Badge>
            </CardHeader>
            <CardContent>
              <span className="text-xs font-medium text-muted-foreground">Followers</span>
              <p className="mt-1 mb-2.5 font-heading text-2xl font-semibold tabular-nums tracking-tight break-words">
                {formatCompact(acc.followers)}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="min-w-0">
                  <span className="text-xs font-medium text-muted-foreground">1 hari</span>
                  <p className={`mt-0.5 text-sm tabular-nums ${trendClass(acc.change1d)}`}>
                    {acc.change1d >= 0 ? '+' : ''}
                    {formatCompact(acc.change1d)}
                  </p>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-muted-foreground">7 hari</span>
                  <p className={`mt-0.5 text-sm tabular-nums ${trendClass(acc.change7dPct)}`}>
                    {acc.change7dPct >= 0 ? '+' : ''}
                    {formatPercent(acc.change7dPct)}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-4 border-t border-border pt-3">
                <div className="min-w-0">
                  <span className="text-xs font-medium text-muted-foreground">Following</span>
                  <p className="mt-0.5 text-sm font-medium tabular-nums break-words">{formatCompact(acc.following)}</p>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-muted-foreground">Posts</span>
                  <p className="mt-0.5 text-sm font-medium tabular-nums break-words">{formatCompact(acc.posts)}</p>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-muted-foreground">Avg likes</span>
                  <p className="mt-0.5 text-sm font-medium tabular-nums break-words">{formatCompact(acc.avgLikes)}</p>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-muted-foreground">ER</span>
                  <p className="mt-0.5 text-sm font-medium tabular-nums break-words">
                    {formatEngagementRate(acc.engagementRate)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
