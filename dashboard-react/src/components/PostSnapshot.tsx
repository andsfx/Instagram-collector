import { useMemo, useState } from 'react'
import {
  type PostPerformanceFilter,
  type PostSnapshotSort,
  formatPostDate,
  getPostSnapshotView,
} from '../data/selectors'
import type { DashboardRecord } from '../data/types'
import { formatEngagementRate, formatInteger } from '../utils/formatters'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const SORT_OPTIONS: Array<{ value: PostSnapshotSort; label: string }> = [
  { value: 'viral_posts', label: 'Viral terbanyak' },
  { value: 'average_post_er', label: 'ER tertinggi' },
  { value: 'average_likes', label: 'Likes tertinggi' },
  { value: 'campaign_terms', label: 'Campaign terbanyak' },
  { value: 'username', label: 'Username A-Z' },
]

const FILTER_OPTIONS: Array<{ value: PostPerformanceFilter; label: string }> = [
  { value: 'all', label: 'Semua' },
  { value: 'viral', label: 'Viral' },
  { value: 'normal', label: 'Normal' },
  { value: 'underperform', label: 'Underperform' },
]

export function PostSnapshot({ data }: { data: DashboardRecord }) {
  const [selectedAccount, setSelectedAccount] = useState<string>('all')
  const [sortBy, setSortBy] = useState<PostSnapshotSort>('viral_posts')
  const [filterBy, setFilterBy] = useState<PostPerformanceFilter>('all')
  const view = useMemo(
    () => getPostSnapshotView(data, selectedAccount, sortBy, filterBy),
    [data, filterBy, selectedAccount, sortBy],
  )

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="md:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm">12-post snapshot per akun</CardTitle>
            <CardDescription className="text-xs">{`${view.cards.length} akun`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-3">
              <div className="grid min-w-[180px] gap-1">
                <span className="text-xs font-medium text-muted-foreground">Akun</span>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger aria-label="Akun">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua akun</SelectItem>
                    {view.accounts.map((a) => (
                      <SelectItem key={a} value={a}>
                        @{a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid min-w-[180px] gap-1">
                <span className="text-xs font-medium text-muted-foreground">Urutan</span>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as PostSnapshotSort)}>
                  <SelectTrigger aria-label="Urutan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid min-w-[160px] gap-1">
                <span className="text-xs font-medium text-muted-foreground">Filter</span>
                <Select value={filterBy} onValueChange={(value) => setFilterBy(value as PostPerformanceFilter)}>
                  <SelectTrigger aria-label="Filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FILTER_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {view.summaryCards.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {view.summaryCards.map((card) => (
                  <div key={card.label} className="flex min-w-0 flex-col gap-1">
                    <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
                    <p className="font-heading text-xl font-semibold tabular-nums tracking-tight break-words">{card.value}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {view.cards.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card className="md:col-span-2 xl:col-span-3">
            <CardHeader>
              <CardTitle className="text-sm">Post list</CardTitle>
              <CardDescription className="text-xs">
                {`${view.cards.reduce((n, c) => n + c.visiblePosts.length, 0)} post`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table className="min-w-[44rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col" className="pl-6">
                      Akun
                    </TableHead>
                    <TableHead scope="col">Tipe</TableHead>
                    <TableHead scope="col" className="text-right">
                      ER
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                      Avg likes
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                      Viral / und.
                    </TableHead>
                    <TableHead scope="col">Tanggal</TableHead>
                    <TableHead scope="col">Permalink</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {view.cards.map((card) => {
                    const post = card.featuredPost
                    const dateLabel = post ? formatPostDate(post.published_at ?? post.timestamp) : '-'
                    return (
                      <TableRow key={card.account}>
                        <TableCell className="pl-6 font-medium">@{card.account}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{card.dominantType ?? 'unknown'}</Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {card.averagePostEr > 0 ? formatEngagementRate(card.averagePostEr * 100) : '–'}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{formatInteger(Math.round(card.averageLikes))}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatInteger(card.viralPosts)}
                          <span className="text-muted-foreground"> / {formatInteger(card.underperformPosts)}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{dateLabel}</TableCell>
                        <TableCell>
                          {post?.url ? (
                            <a href={post.url} target="_blank" rel="noreferrer" className="text-primary underline-offset-4 hover:underline">
                              Buka post
                            </a>
                          ) : (
                            <span className="text-muted-foreground">–</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card className="md:col-span-2 xl:col-span-3">
            <CardContent>
              <p className="text-sm text-muted-foreground">Tidak ada data sesuai filter.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
