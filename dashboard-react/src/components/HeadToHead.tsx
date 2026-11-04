import { useMemo } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  type HeadToHeadMetric,
  getHeadToHeadData,
  resolveHeadToHeadPreset,
} from '../data/selectors'
import type { DashboardRecord } from '../data/types'
import { downsampleData } from '../data/downsample'
import { formatInteger } from '../utils/formatters'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { chartAxisColor, chartGridColor, chartLegendStyle, chartTooltipStyle } from './chart-theme'

export function HeadToHead({
  data,
  accountA,
  setAccountA,
  accountB,
  setAccountB,
  metric,
  setMetric,
  presetValue,
  setPresetValue,
}: {
  data: DashboardRecord
  accountA: string
  setAccountA: (v: string) => void
  accountB: string
  setAccountB: (v: string) => void
  metric: HeadToHeadMetric
  setMetric: (v: HeadToHeadMetric) => void
  presetValue: string
  setPresetValue: (v: string) => void
}) {
  const view = useMemo(() => getHeadToHeadData(data, accountA, accountB, metric), [accountA, accountB, data, metric])
  const activeLabel = view.metricOptions.find((option) => option.value === metric)?.label
  const activeRow = view.comparisonRows.find((row) => row.label === activeLabel)
  const leadValueA = activeRow?.valueA ?? `@${view.accountA}`
  const leadValueB = activeRow?.valueB ?? `@${view.accountB}`
  const totalWins = Math.max(view.winsA + view.winsB, 1)

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="md:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm">Head-to-head{activeLabel ? ` · ${activeLabel}` : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <span className="text-xs font-medium text-muted-foreground">@{view.accountA}</span>
                <p className="mt-1 font-heading text-2xl font-semibold tabular-nums tracking-tight break-words">{leadValueA}</p>
              </div>
              <div className="min-w-0">
                <span className="text-xs font-medium text-muted-foreground">@{view.accountB}</span>
                <p className="mt-1 font-heading text-2xl font-semibold tabular-nums tracking-tight break-words">{leadValueB}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div className="grid min-w-[160px] gap-1">
                <span className="text-xs font-medium text-muted-foreground">Akun A</span>
                <Select value={accountA} onValueChange={setAccountA}>
                  <SelectTrigger aria-label="Akun A">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {data.accounts.map((account) => (
                      <SelectItem key={account} value={account}>
                        @{account}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid min-w-[160px] gap-1">
                <span className="text-xs font-medium text-muted-foreground">Akun B</span>
                <Select value={accountB} onValueChange={setAccountB}>
                  <SelectTrigger aria-label="Akun B">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {data.accounts.map((account) => (
                      <SelectItem key={account} value={account}>
                        @{account}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid min-w-[180px] gap-1">
                <span className="text-xs font-medium text-muted-foreground">Preset</span>
                <Select
                  value={presetValue}
                  onValueChange={(value) => {
                    const resolved = resolveHeadToHeadPreset(data, value, accountA, accountB)
                    setAccountA(resolved.accountA)
                    setAccountB(resolved.accountB)
                    setPresetValue('')
                  }}
                >
                  <SelectTrigger aria-label="Preset">
                    <SelectValue placeholder="Pilih preset" />
                  </SelectTrigger>
                  <SelectContent>
                    {view.presets.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-1" role="group" aria-label="Metrik perbandingan">
              {view.metricOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={metric === option.value ? 'default' : 'outline'}
                  aria-pressed={metric === option.value}
                  onClick={() => setMetric(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick verdict</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">{view.verdict}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{view.subverdict}</p>

            <div className="mt-4 border-t border-border pt-3">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Distribusi kemenangan</span>
                <span className="tabular-nums">Gap followers: {formatInteger(view.gapFollowers)}</span>
              </div>
              <div className="mt-2 flex h-2.5" aria-label="Distribusi kemenangan per metrik">
                <div
                  className="bg-primary"
                  style={{ width: `${Math.max((view.winsA / totalWins) * 100, view.winsA ? 18 : 0)}%` }}
                />
                <div
                  className="bg-muted-foreground"
                  style={{ width: `${Math.max((view.winsB / totalWins) * 100, view.winsB ? 18 : 0)}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline" className="border-primary text-primary">
                  @{view.accountA}: {view.winsA}
                </Badge>
                <Badge variant="outline">
                  @{view.accountB}: {view.winsB}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Perbandingan per metrik</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="min-w-[26rem]">
              <TableHeader>
                <TableRow>
                  <TableHead scope="col" className="pl-6">
                    @{view.accountA}
                  </TableHead>
                  <TableHead scope="col" className="text-center">
                    Metrik
                  </TableHead>
                  <TableHead scope="col" className="pr-6 text-right">
                    @{view.accountB}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {view.comparisonRows.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell className={`pl-6 ${row.rawA > row.rawB ? 'font-medium text-primary' : ''}`}>
                      {row.valueA}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">{row.label}</TableCell>
                    <TableCell className={`pr-6 text-right tabular-nums ${row.rawB > row.rawA ? 'font-medium text-primary' : ''}`}>
                      {row.valueB}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="md:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm">{`Trend ${view.trendTitle}`}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-xs leading-relaxed text-muted-foreground">{view.trendDescription}</p>
            {view.hasTrend ? (
              <div className="chart-wrap chart-wrap-lg">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={downsampleData(view.trendData, 90, view.accountA)} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                    <XAxis dataKey="date" stroke={chartAxisColor} fontSize={12} />
                    <YAxis stroke={chartAxisColor} fontSize={12} />
                    <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: 'var(--foreground)' }} itemStyle={{ color: 'var(--foreground)' }} />
                    <Legend wrapperStyle={{ ...chartLegendStyle, fontSize: 12 }} />
                    <Line type="monotone" dataKey={view.accountA} stroke="var(--primary)" strokeWidth={2.4} dot={false} />
                    <Line type="monotone" dataKey={view.accountB} stroke="var(--muted-foreground)" strokeWidth={2.4} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Trend historis untuk metrik ini belum tersedia secara granular, jadi perbandingan difokuskan ke
                snapshot saat ini.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
