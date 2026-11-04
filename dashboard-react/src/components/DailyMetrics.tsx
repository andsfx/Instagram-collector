import { useMemo } from 'react'
import { getDailyMetricsView } from '../data/selectors'
import type { DashboardRecord } from '../data/types'
import { formatInteger } from '../utils/formatters'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Ledger } from './dashboard/Ledger'
import { useTableDesktop } from './dashboard/states'

const RANGE_OPTIONS = [7, 14, 30]

function renderDelta(value: number, isBaseline: boolean) {
  if (isBaseline) return <span className='text-muted-foreground'>--</span>
  if (value > 0) return <span className='text-emerald-600 dark:text-emerald-400'>+{formatInteger(value)}</span>
  if (value < 0) return <span className='text-destructive'>{formatInteger(value)}</span>
  return <span className='text-muted-foreground'>--</span>
}

export function DailyMetrics({
  data,
  selectedAccount,
  setSelectedAccount,
  rangeDays,
  setRangeDays,
}: {
  data: DashboardRecord
  selectedAccount: string
  setSelectedAccount: (v: string) => void
  rangeDays: number
  setRangeDays: (v: number) => void
}) {
  const view = useMemo(() => getDailyMetricsView(data, selectedAccount, rangeDays), [data, rangeDays, selectedAccount])
  const isDesktop = useTableDesktop()

  return (
    <div className='grid gap-4'>
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        <Card className='xl:col-span-2'>
          <CardHeader>
            <CardTitle className='text-sm'>
              Akun aktif{view.selectedAccount ? ` · @${view.selectedAccount}` : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='font-heading text-base font-semibold tracking-tight break-all md:text-lg'>
              @{view.selectedAccount}
            </p>

            <div className='mt-4 flex flex-wrap items-end gap-3'>
              <div className='grid min-w-[200px] gap-1'>
                <span className='text-xs font-medium text-muted-foreground'>Pilih akun</span>
                <Select value={view.selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger aria-label='Pilih akun'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {view.accounts.map((account) => (
                      <SelectItem key={account} value={account}>
                        @{account}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-1'>
                <span className='text-xs font-medium text-muted-foreground'>Rentang</span>
                <div className='flex flex-wrap gap-1' role='group' aria-label='Rentang hari'>
                  {RANGE_OPTIONS.map((option) => (
                    <Button
                      key={option}
                      type='button'
                      size='sm'
                      variant={rangeDays === option ? 'default' : 'outline'}
                      aria-pressed={rangeDays === option}
                      onClick={() => setRangeDays(option)}
                    >
                      {option}h
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <p className='mt-4 max-w-[46ch] text-xs leading-relaxed text-muted-foreground'>
              {view.disclosureTitle}. {view.disclosureHint}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-sm'>Ringkasan rentang</CardTitle>
          </CardHeader>
          <CardContent>
            <Ledger
              rows={view.summaryRows.map((row) => ({
                key: row.label,
                value: (
                  <span className='inline-flex gap-3'>
                    <span>{renderDelta(row.followers, false)}</span>
                    <span>{renderDelta(row.following, false)}</span>
                    <span>{renderDelta(row.posts, false)}</span>
                  </span>
                ),
              }))}
            />
            <p className='mt-2 text-xs leading-relaxed text-muted-foreground'>
              Urutan delta: followers · following · posts.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        <Card className='md:col-span-2 xl:col-span-3'>
          <CardHeader>
            <CardTitle className='text-sm'>Riwayat harian</CardTitle>
            <CardDescription className='text-xs'>{`${view.rows.length} hari`}</CardDescription>
          </CardHeader>
          {view.rows.length === 0 ? (
            <CardContent>
              <p className='text-sm text-muted-foreground'>Tidak ada data harian untuk rentang ini.</p>
            </CardContent>
          ) : isDesktop ? (
            <CardContent className='p-0'>
              <Table className='min-w-[720px]'>
                <TableHeader>
                  <TableRow>
                    <TableHead scope='col' className='pl-6'>
                      Tanggal
                    </TableHead>
                    <TableHead scope='col' colSpan={2}>
                      Followers
                    </TableHead>
                    <TableHead scope='col' colSpan={2}>
                      Following
                    </TableHead>
                    <TableHead scope='col' colSpan={2}>
                      Posts
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {view.rows.map((row) => (
                    <TableRow key={row.date}>
                      <TableCell className='pl-6'>
                        <div className='font-medium'>{row.dayLabel}</div>
                        <div className='text-xs text-muted-foreground'>{row.fullDateLabel}</div>
                      </TableCell>
                      <TableCell>{renderDelta(row.deltaFollowers, row.isBaseline)}</TableCell>
                      <TableCell className='font-medium tabular-nums'>{formatInteger(row.followers)}</TableCell>
                      <TableCell>{renderDelta(row.deltaFollowing, row.isBaseline)}</TableCell>
                      <TableCell className='font-medium tabular-nums'>{formatInteger(row.following)}</TableCell>
                      <TableCell>{renderDelta(row.deltaPosts, row.isBaseline)}</TableCell>
                      <TableCell className='font-medium tabular-nums'>{formatInteger(row.posts)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          ) : (
            <CardContent>
              {view.mobileRows.map((row, index) => (
                <div key={`${row.date}-mobile`} className='border-b border-border py-2 text-sm last:border-b-0'>
                  <div className='flex items-center justify-between gap-3'>
                    <span className='font-medium'>{index === 0 ? 'Terbaru' : row.fullDateLabel}</span>
                    <span className='text-xs text-muted-foreground'>{row.dayLabel}</span>
                  </div>
                  <div className='mt-2 grid gap-1'>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>Followers</span>
                      <strong className='tabular-nums'>{formatInteger(row.followers)}</strong>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>Δ followers</span>
                      <strong className='tabular-nums'>
                        {row.isBaseline
                          ? '--'
                          : `${row.deltaFollowers >= 0 ? '+' : ''}${formatInteger(row.deltaFollowers)}`}
                      </strong>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>Following</span>
                      <strong className='tabular-nums'>{formatInteger(row.following)}</strong>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>Posts</span>
                      <strong className='tabular-nums'>{formatInteger(row.posts)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
