import { memo } from 'react'
import type { SummaryStripItem } from '../data/selectors'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export const SummaryStrip = memo(function SummaryStrip({ items }: { items: SummaryStripItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card className="md:col-span-2 xl:col-span-3">
        <CardHeader>
          <CardTitle className="text-sm">Papan ranking</CardTitle>
          <CardDescription className="text-xs">{`${items.length} metrik`}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="pl-6">
                  #
                </TableHead>
                <TableHead scope="col">Metrik</TableHead>
                <TableHead scope="col">Akun / nilai</TableHead>
                <TableHead scope="col" className="text-right">
                  Detail
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, i) => (
                <TableRow key={item.label}>
                  <TableCell className="pl-6 tabular-nums text-muted-foreground">
                    {String(i + 1).padStart(2, '0')}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.label}</TableCell>
                  <TableCell className={item.emphasis ? 'font-medium text-primary' : undefined}>{item.value}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{item.detail}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
})
