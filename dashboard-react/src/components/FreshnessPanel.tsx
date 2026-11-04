import type { FreshnessSummary } from '../data/selectors'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function FreshnessPanel({ freshness }: { freshness: FreshnessSummary }) {
  const stats = [
    { label: 'Tanggal terbaru', value: freshness.latestDateLabel, note: 'Observasi terakhir di dataset.' },
    { label: 'Generated', value: freshness.generatedAtLabel, note: 'Waktu file dashboard dibuat.' },
    { label: 'Akun dipantau', value: String(freshness.accountCount), note: 'Ikut masuk ranking & perbandingan.' },
    { label: 'Histori', value: `${freshness.historyDays} hari`, note: 'Rentang untuk membaca tren.' },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card className="md:col-span-2 xl:col-span-3">
        <CardHeader>
          <CardTitle className="text-sm">Status data</CardTitle>
          <CardDescription className="text-xs">Technical footer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="min-w-0">
                <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                <p className="mt-1 mb-1 font-heading text-xl font-semibold tabular-nums tracking-tight break-words">
                  {stat.value}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">{stat.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">Sumber: {freshness.sourceLabel}</Badge>
            <Badge variant="secondary">Payload tervalidasi zod</Badge>
            <Badge variant="secondary">Data dibundle saat build</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
