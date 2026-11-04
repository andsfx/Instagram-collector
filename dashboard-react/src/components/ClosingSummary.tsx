import type { ExecutiveSummaryData, FreshnessSummary, InsightsData, TodaySummaryData } from '../data/selectors'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Notes } from './dashboard/Notes'

export function ClosingSummary({
  summary,
  today,
  insights,
  freshness,
}: {
  summary: ExecutiveSummaryData
  today: TodaySummaryData
  insights: InsightsData
  freshness: FreshnessSummary
}) {
  const lead = summary.kpis[0]
  const takeaway = insights.items[0]

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Ringkasan penutup</CardTitle>
            <CardDescription className="text-xs">{today.referenceDate}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl font-semibold tracking-tight break-words md:text-3xl">
              {takeaway ? takeaway.title : 'Tidak ada ringkasan untuk hari ini.'}
            </p>
            {takeaway ? <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{takeaway.description}</p> : null}
            {lead ? (
              <div className="mt-5 border-t border-border pt-4">
                <span className="text-xs font-medium text-muted-foreground">
                  {lead.label}
                  {lead.account ? ` · @${lead.account}` : ''}
                </span>
                <p className="mt-1 font-heading text-2xl font-semibold tabular-nums tracking-tight break-words">{lead.value}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Temuan pendukung</CardTitle>
          </CardHeader>
          <CardContent>
            {insights.items.length > 1 ? (
              <Notes
                items={insights.items.slice(1, 4).map((item) => ({
                  title: item.title,
                  description: item.description,
                }))}
              />
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">Belum ada temuan pendukung lain pada periode ini.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="bg-muted/40 md:col-span-2 xl:col-span-3">
          <CardContent>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Ref {today.referenceDate} · Generated {freshness.generatedAtLabel} · Latest {freshness.latestDateLabel} ·
              Sumber {freshness.sourceLabel}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
