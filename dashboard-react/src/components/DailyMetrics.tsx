import type { DashboardRecord } from '../data/types'
import { formatInteger } from '../data/selectors'
import { SectionCard } from './ui'

export function DailyMetrics({ data }: { data: DashboardRecord }) {
  const recentHistory = data.history.slice(-7).reverse()

  return (
    <SectionCard
      eyebrow="Daily Metrics"
      title="Riwayat detail 7 hari terakhir"
      description="Section ini membawa kembali kemampuan legacy untuk membaca perubahan followers, following, dan posting secara harian, tapi dibatasi ke jendela yang lebih relevan untuk monitoring rutin."
    >
      <div className="daily-grid">
        {data.accounts.map((account) => (
          <article key={account} className="daily-card">
            <div className="split-row">
              <div>
                <div className="stat-label">Akun</div>
                <div className="big-value">@{account}</div>
              </div>
              <span className="badge badge-brand">7 hari</span>
            </div>
            <div className="daily-table-wrap">
              <table className="daily-table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Followers</th>
                    <th>Following</th>
                    <th>Posts</th>
                  </tr>
                </thead>
                <tbody>
                  {recentHistory.map((row) => {
                    const metrics = row.values[account]

                    return (
                      <tr key={`${account}-${row.date}`}>
                        <td>{new Date(row.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</td>
                        <td>{formatInteger.format(metrics?.followers ?? 0)}</td>
                        <td>{formatInteger.format(metrics?.following ?? 0)}</td>
                        <td>{formatInteger.format(metrics?.posts ?? 0)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="daily-mobile-list" aria-hidden="true">
              {recentHistory.slice(0, 3).map((row, index) => {
                const metrics = row.values[account]

                return (
                  <div key={`${account}-${row.date}-mobile`} className="daily-mobile-item">
                    <div className="daily-mobile-date">
                      {index === 0 ? 'Terbaru' : new Date(row.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                    </div>
                    <div className="daily-mobile-metrics">
                      <div className="daily-mobile-row"><span>Followers</span><strong>{formatInteger.format(metrics?.followers ?? 0)}</strong></div>
                      <div className="daily-mobile-row"><span>Following</span><strong>{formatInteger.format(metrics?.following ?? 0)}</strong></div>
                      <div className="daily-mobile-row"><span>Posts</span><strong>{formatInteger.format(metrics?.posts ?? 0)}</strong></div>
                    </div>
                  </div>
                )
              })}
              <div className="daily-mobile-summary">Menampilkan 3 observasi terbaru. Gunakan layar lebih lebar untuk histori 7 hari penuh.</div>
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  )
}
