import { useMemo, useState } from 'react'
import { type RankingSortKey, type SortDirection, getRankingTableRows, sortRankingRows } from '../data/selectors'
import type { DashboardRecord } from '../data/types'
import { formatEngagementRate, formatInteger, formatPercent } from '../utils/formatters'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Ledger } from './dashboard/Ledger'

const SORT_LABELS: Array<{ key: RankingSortKey; label: string; numeric?: boolean }> = [
  { key: 'rank', label: '#' },
  { key: 'username', label: 'Akun' },
  { key: 'followers', label: 'Followers', numeric: true },
  { key: 'following', label: 'Following', numeric: true },
  { key: 'posts', label: 'Posts', numeric: true },
  { key: 'avgLikes', label: 'Avg likes', numeric: true },
  { key: 'avgComments', label: 'Avg comments', numeric: true },
  { key: 'er', label: 'ER', numeric: true },
  { key: 'verified', label: 'Verified' },
  { key: 'gap', label: 'Gap vs brand', numeric: true },
]

function nextSortDirection(currentKey: RankingSortKey, activeKey: RankingSortKey, direction: SortDirection): SortDirection {
  if (currentKey !== activeKey) return currentKey === 'username' || currentKey === 'rank' ? 'asc' : 'desc'
  return direction === 'asc' ? 'desc' : 'asc'
}

function trendClass(value: number) {
  if (value > 0) return 'text-emerald-600 dark:text-emerald-400'
  if (value < 0) return 'text-destructive'
  return 'text-muted-foreground'
}

export function RankingGrowthPresentation({
  data,
  mode = 'full',
}: {
  data: DashboardRecord
  mode?: 'full' | 'summary' | 'table'
}) {
  const [sortKey, setSortKey] = useState<RankingSortKey>('followers')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const rows = useMemo(() => sortRankingRows(getRankingTableRows(data), sortKey, sortDirection), [data, sortDirection, sortKey])
  const topFollowerRows = rows.slice().sort((left, right) => right.followers - left.followers).slice(0, 5)
  const topEngagementRows = rows.slice().sort((left, right) => right.engagementRate - left.engagementRate).slice(0, 5)
  const topGrowthRows = Object.entries(data.growth)
    .map(([account, growth]) => ({ account, ...growth }))
    .sort((left, right) => right.pct_change_7d - left.pct_change_7d)
    .slice(0, 5)
  const leadAccount = topFollowerRows[0]

  function handleSort(key: RankingSortKey) {
    setSortKey(key)
    setSortDirection(nextSortDirection(key, sortKey, sortDirection))
  }

  function getAriaSort(key: RankingSortKey): 'none' | 'ascending' | 'descending' {
    if (key !== sortKey) return 'none'
    return sortDirection === 'asc' ? 'ascending' : 'descending'
  }

  if (mode === 'summary') {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Peringkat followers</CardTitle>
          </CardHeader>
          <CardContent>
            <Ledger
              rows={topFollowerRows.slice(0, 5).map((row) => ({
                key: `@${row.account}`,
                note: `#${row.rank}`,
                value: formatInteger(row.followers),
              }))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Momentum 7 hari</CardTitle>
          </CardHeader>
          <CardContent>
            <Ledger
              rows={topGrowthRows.map((row) => ({
                key: `@${row.account}`,
                value: <span className="text-emerald-600 dark:text-emerald-400">{formatPercent(row.pct_change_7d)}</span>,
              }))}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  const showSummary = mode === 'full'

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">
              Posisi audiens &amp; momentum{leadAccount ? ` · @${leadAccount.account}` : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-4xl font-semibold tabular-nums tracking-tight break-words">
              {leadAccount ? formatInteger(leadAccount.followers) : '—'}
            </p>
            <p className="mt-3 max-w-[46ch] text-xs leading-relaxed text-muted-foreground">
              Followers akun terdepan. Tabel di bawah memuat seluruh kompetitor dan bisa diurutkan per kolom.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Akun teratas</CardTitle>
            <CardDescription className="text-xs">Top 3</CardDescription>
          </CardHeader>
          <CardContent>
            <Ledger
              rows={topFollowerRows.slice(0, 3).map((row) => ({
                key: `@${row.account}`,
                value: formatInteger(row.followers),
              }))}
            />
          </CardContent>
        </Card>
      </div>

      {showSummary ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Kualitas perhatian</CardTitle>
            </CardHeader>
            <CardContent>
              <Ledger
                rows={topEngagementRows.slice(0, 5).map((row) => ({
                  key: `@${row.account}`,
                  value: formatEngagementRate(row.engagementRate),
                }))}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pertumbuhan 7 hari</CardTitle>
            </CardHeader>
            <CardContent>
              <Ledger
                rows={topGrowthRows.map((row) => ({
                  key: `@${row.account}`,
                  value: <span className="text-emerald-600 dark:text-emerald-400">{formatPercent(row.pct_change_7d)}</span>,
                }))}
              />
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="md:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm">Tabel kompetitor penuh</CardTitle>
            <CardDescription className="text-xs">Klik header untuk urutkan</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  {SORT_LABELS.map((column) => (
                    <TableHead key={column.key} scope="col" aria-sort={getAriaSort(column.key)} className={column.numeric ? 'text-right' : 'pl-6'}>
                      <button type="button" className="font-medium whitespace-nowrap hover:text-primary" onClick={() => handleSort(column.key)}>
                        <span>{column.label}</span>
                        {sortKey === column.key ? (
                          <span aria-hidden="true" className="ml-1 text-xs">
                            {sortDirection === 'asc' ? '▲' : '▼'}
                          </span>
                        ) : null}
                      </button>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.account}>
                    <TableCell className="pl-6 text-muted-foreground tabular-nums">{row.rank}</TableCell>
                    <TableCell className="font-medium">@{row.account}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatInteger(row.followers)}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{formatInteger(row.following)}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{formatInteger(row.posts)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatInteger(Math.round(row.avgLikes))}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{row.avgComments.toFixed(2)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatEngagementRate(row.engagementRate)}</TableCell>
                    <TableCell className="text-muted-foreground">{row.verified ? 'Ya' : '–'}</TableCell>
                    <TableCell className={`text-right tabular-nums ${trendClass(row.gapVsBrand)}`}>
                      {row.gapVsBrand >= 0 ? '+' : ''}
                      {formatInteger(row.gapVsBrand)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
