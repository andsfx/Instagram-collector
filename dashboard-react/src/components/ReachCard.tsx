import type { ReachSummaryData } from '../data/selectors'
import { formatDate, formatInteger } from '../utils/formatters'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Reach + follower baru harian.
 * Hanya akun yang tersambung ke Instagram Graph yang punya angka; sisanya
 * disebut sebagai catatan supaya gap-nya kelihatan, bukan disembunyikan.
 */
export function ReachCard({ summary }: { summary: ReachSummaryData }) {
  if (!summary.rows.length) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="md:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm">Reach &amp; follower baru</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
              Belum ada data reach. Angka muncul setelah insight Instagram tersedia (mundur satu hari).
              Metrik ini hanya tersedia untuk akun yang tersambung ke Instagram Graph resmi.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card className="md:col-span-2 xl:col-span-3">
        <CardHeader>
          <CardTitle className="text-sm">{`Reach & follower baru · ${formatDate(summary.date)}`}</CardTitle>
          <CardDescription className="text-xs">{`${summary.rows.length} akun`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {summary.rows.map((row) => (
              <div key={row.account} className="min-w-0">
                <p className="text-sm font-medium break-all">@{row.account}</p>
                <div className="mt-2 grid grid-cols-2 gap-4 border-t border-border pt-2">
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-muted-foreground">Reach</span>
                    <p className="mt-1 font-heading text-xl font-semibold tabular-nums tracking-tight break-words">
                      {row.reach == null ? '–' : formatInteger(row.reach)}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-muted-foreground">Follower baru</span>
                    <p className="mt-1 font-heading text-xl font-semibold tabular-nums tracking-tight break-words">
                      {row.newFollowers == null ? '–' : formatInteger(row.newFollowers)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {summary.missing.length ? (
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Tanpa data Graph: {summary.missing.map((account) => `@${account}`).join(', ')} — akun ini
              hanya punya angka follower harian.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
