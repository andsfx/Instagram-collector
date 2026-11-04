import type { ExecutiveSummaryData } from '../data/selectors'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Ledger } from './dashboard/Ledger'
import { Notes } from './dashboard/Notes'

export function ExecutiveSummary({ summary }: { summary: ExecutiveSummaryData }) {
  if (summary.kpis.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="md:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm">Ringkasan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Ringkasan belum bisa dibuat karena data belum lengkap.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const [lead, ...rest] = summary.kpis

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardDescription className="text-xs font-medium">
            {lead.label}
            {lead.account ? ` · @${lead.account}` : ''}
          </CardDescription>
          <CardTitle className="font-heading text-4xl font-semibold tabular-nums tracking-tight break-words md:text-5xl">
            {lead.value}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
            Puncak ukuran audiens pada periode ini. Angka lain di kanan adalah pembanding cepat
            sebelum turun ke tabel kompetitor.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Indikator pendukung</CardTitle>
          <CardDescription className="text-xs">{`${rest.length} metrik`}</CardDescription>
        </CardHeader>
        <CardContent>
          <Ledger
            rows={rest.map((kpi) => ({
              key: kpi.label,
              note: kpi.account ? `@${kpi.account}` : 'lintas akun',
              value: kpi.value,
            }))}
          />
        </CardContent>
      </Card>

      {summary.bullets.length > 0 ? (
        <Card className="md:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm">Key takeaways</CardTitle>
            <CardDescription className="text-xs">3 poin</CardDescription>
          </CardHeader>
          <CardContent>
            <Notes
              items={summary.bullets.map((bullet) => ({
                title: bullet,
              }))}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
