import type { TodaySummaryData } from '../data/selectors'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Stat } from './dashboard/Stat'

export function TodaySummary({ today }: { today: TodaySummaryData }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="bg-muted/50 md:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm">Sinyal utama</CardTitle>
            <CardDescription className="text-xs">{today.referenceDate}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-xl font-semibold tracking-tight break-words md:text-2xl">{today.title}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {today.items.map((item) => (
          <Card key={item.label}>
            <CardContent>
              <Stat label={item.label} value={item.value} note={item.detail} size="handle" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
