import type { DashboardRecord } from '../data/types'
import { formatInteger } from '../data/selectors'
import { SectionCard } from './ui'

export function RankingGrowth({ data }: { data: DashboardRecord }) {
  const byFollowers = data.rankings.by_followers
  const byEngagement = data.rankings.by_engagement_rate
  const growthList = Object.entries(data.growth)
    .map(([account, growth]) => ({ account, ...growth }))
    .sort((a, b) => b.pct_change_7d - a.pct_change_7d)

  return (
    <SectionCard
      eyebrow="Ranking & Growth"
      title="Posisi audiens dan momentum pertumbuhan"
      description="Section ini menggantikan tabel ranking legacy dengan format yang tetap data-dense tetapi lebih nyaman dibaca di layar menengah."
    >
      <div className="ranking-grid">
        <article className="ranking-card">
          <div className="section-heading">
            <h3 className="section-title">Peringkat followers</h3>
            <p className="section-description">Urutan berdasarkan ukuran audiens saat ini.</p>
          </div>
          <ol className="ranking-list">
            {byFollowers.slice(0, 5).map((row) => (
              <li key={row.account} className="table-row">
                <span className="table-strong">#{row.rank} @{row.account}</span>
                <span className="table-muted">{formatInteger.format(row.followers)} followers</span>
              </li>
            ))}
          </ol>
        </article>
        <article className="ranking-card">
          <div className="section-heading">
            <h3 className="section-title">Peringkat engagement</h3>
            <p className="section-description">Akun paling efisien mengubah audiens jadi interaksi.</p>
          </div>
          <ol className="ranking-list">
            {byEngagement.slice(0, 5).map((row) => (
              <li key={row.account} className="table-row">
                <span className="table-strong">#{row.rank} @{row.account}</span>
                <span className="table-muted">{row.engagement_rate.toFixed(2)}% ER</span>
              </li>
            ))}
          </ol>
        </article>
      </div>
      <article className="ranking-card">
        <div className="section-heading">
          <h3 className="section-title">Pertumbuhan 7 hari</h3>
          <p className="section-description">Fokus pada akun yang paling cepat bertambah selama seminggu terakhir.</p>
        </div>
        <ul className="ranking-list">
          {growthList.slice(0, 5).map((row) => (
            <li key={row.account} className="table-row">
              <span className="table-strong">@{row.account}</span>
              <span className="table-muted">{row.pct_change_7d.toFixed(2)}% | {formatInteger.format(row.followers_change_7d)} followers</span>
            </li>
          ))}
        </ul>
      </article>
    </SectionCard>
  )
}
