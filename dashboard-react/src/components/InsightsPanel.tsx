import type { InsightsData } from '../data/selectors'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Notes } from './dashboard/Notes'

const TONE_LABEL: Record<InsightsData['items'][number]['tone'], string> = {
  positive: 'Positif',
  warning: 'Perhatian',
  danger: 'Risiko',
  info: 'Info',
}

export function InsightsPanel({ insights }: { insights: InsightsData }) {
  if (insights.items.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="md:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm">Catatan keputusan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Insight belum tersedia untuk periode ini.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card className="md:col-span-2 xl:col-span-3">
        <CardHeader>
          <CardTitle className="text-sm">Catatan keputusan</CardTitle>
          <CardDescription className="text-xs">{`${insights.items.length} temuan`}</CardDescription>
        </CardHeader>
        <CardContent>
          <Notes
            items={insights.items.map((item) => ({
              label: `${TONE_LABEL[item.tone]} · ${item.label}`,
              title: item.title,
              description: item.description,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  )
}
