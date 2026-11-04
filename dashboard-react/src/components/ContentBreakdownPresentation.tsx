import { getContentHighlights } from '../data/selectors'
import type { DashboardRecord } from '../data/types'
import { formatEngagementRate, formatInteger } from '../utils/formatters'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Stat } from './dashboard/Stat'

const MIX_KEYS = ['reels', 'carousels', 'images', 'videos'] as const

export function ContentBreakdownPresentation({ data }: { data: DashboardRecord }) {
  const latest = data.latest
  const highlights = getContentHighlights(data)
  const perAccount = data.accounts.map((account) => {
    const breakdown = data.content_breakdown?.[account]
    const posts = breakdown?.posts ?? latest[account]?.posts ?? 0
    return {
      account,
      posts,
      reels: breakdown?.reels,
      carousels: breakdown?.carousels,
      images: breakdown?.images,
      videos: breakdown?.videos,
      bestPost: breakdown?.bestPost,
    }
  })

  const meaningful = perAccount.filter((row) => (row.posts ?? 0) > 0)

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Format dominan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-4xl font-semibold tracking-tight break-words">{highlights.topFormatLabel}</p>
            <p className="mt-3 max-w-[46ch] text-xs leading-relaxed text-muted-foreground">
              {highlights.topFormatCount > 0
                ? `${formatInteger(highlights.topFormatCount)} post · ER top ${
                    highlights.topErAccount
                      ? `@${highlights.topErAccount} (${formatEngagementRate(highlights.topErValue)})`
                      : '-'
                  }`
                : 'Belum ada data konten.'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Stat
              label="ER tertinggi"
              size="sm"
              value={highlights.topErAccount ? `@${highlights.topErAccount}` : '–'}
              note={highlights.topErAccount ? formatEngagementRate(highlights.topErValue) : '-'}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Stat
              label="Best post"
              size="sm"
              value={highlights.bestPostOwner ? `@${highlights.bestPostOwner}` : '–'}
              note={
                highlights.bestPostOwner
                  ? `${formatInteger(highlights.bestPostLikes)} interactions${highlights.bestPostType ? ` · ${highlights.bestPostType}` : ''}`
                  : '-'
              }
            />
          </CardContent>
        </Card>
      </div>

      {meaningful.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card className="md:col-span-2 xl:col-span-3">
            <CardHeader>
              <CardTitle className="text-sm">Format konten per akun</CardTitle>
              <CardDescription className="text-xs">{`${meaningful.length} akun`}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table className="min-w-[40rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col" className="pl-6">
                      Akun
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                      Posts
                    </TableHead>
                    <TableHead scope="col">Mix</TableHead>
                    <TableHead scope="col" className="w-[24%]">
                      Komposisi
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                      Best
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meaningful.map((row) => (
                    <TableRow key={row.account}>
                      <TableCell className="pl-6 font-medium">@{row.account}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.posts}</TableCell>
                      <TableCell className="whitespace-normal">
                        <span className="inline-flex flex-wrap gap-1">
                          {typeof row.reels === 'number' && row.reels > 0 ? <Badge variant="outline">Reels {row.reels}</Badge> : null}
                          {typeof row.carousels === 'number' && row.carousels > 0 ? <Badge variant="outline">Carousel {row.carousels}</Badge> : null}
                          {typeof row.images === 'number' && row.images > 0 ? <Badge variant="outline">Image {row.images}</Badge> : null}
                          {typeof row.videos === 'number' && row.videos > 0 ? <Badge variant="outline">Video {row.videos}</Badge> : null}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex h-2.5 w-full">
                          <div
                            className="flex h-full overflow-hidden rounded-full"
                            title={[
                              row.reels ? `Reels ${row.reels}` : null,
                              row.carousels ? `Carousel ${row.carousels}` : null,
                              row.images ? `Image ${row.images}` : null,
                              row.videos ? `Video ${row.videos}` : null,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          >
                            {MIX_KEYS.map((key) => {
                              const count = Number(row[key] ?? 0)
                              if (!count) return null
                              return (
                                <span
                                  key={key}
                                  className={`mix-part is-${key}`}
                                  style={{ width: `${(count / Math.max(row.posts, 1)) * 100}%` }}
                                />
                              )
                            })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {row.bestPost?.interactions ? (
                          <>
                            {formatInteger(row.bestPost.interactions)} int.
                            {row.bestPost.url ? (
                              <>
                                {' · '}
                                <a href={row.bestPost.url} target="_blank" rel="noreferrer" className="text-primary underline-offset-4 hover:underline">
                                  Lihat
                                </a>
                              </>
                            ) : null}
                          </>
                        ) : (
                          '–'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card className="md:col-span-2 xl:col-span-3">
            <CardContent>
              <p className="text-sm text-muted-foreground">Data content breakdown belum tersedia.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
