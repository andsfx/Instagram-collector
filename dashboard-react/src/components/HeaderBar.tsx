import type { HeroMetaItem } from '../data/selectors'

export function HeaderBar({ onRefresh, heroMeta }: { onRefresh: () => void; heroMeta: HeroMetaItem[] }) {
  return (
    <header className="panel hero">
      <div className="split-row">
        <div className="hero-topline">Competitor Intelligence Brief</div>
        <button type="button" className="hero-secondary hero-refresh" onClick={onRefresh}>Muat ulang data terbaru</button>
      </div>
      <div className="hero-copy">
        <h1>Editorial dashboard untuk membaca performa Instagram kompetitor dengan lebih tajam.</h1>
        <p className="hero-subtitle">
          Dirancang ulang dengan nuansa terracotta-premium editorial, dashboard ini tetap mempertahankan struktur analitik inti sambil membuat pembacaan tren, gap, dan kualitas interaksi terasa lebih tenang dan meyakinkan.
        </p>
      </div>
      <div className="hero-actions">
        <a className="hero-cta" href="#section-summary">Lihat executive summary</a>
        <a className="hero-secondary" href="#section-ranking">Buka ranking lengkap</a>
      </div>
      <div className="hero-meta">
        {heroMeta.map((item) => (
          <div key={item.label} className="hero-meta-item">
            <div className="hero-meta-value">{item.value}</div>
            <div className="hero-meta-label">{item.label}</div>
          </div>
        ))}
      </div>
    </header>
  )
}
