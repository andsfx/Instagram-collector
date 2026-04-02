export function HeaderBar({ onRefresh }: { onRefresh: () => void }) {
  return (
    <header className="panel hero">
      <div className="split-row">
        <div className="hero-topline">Competitor Intelligence Brief</div>
        <button type="button" className="hero-secondary" onClick={onRefresh}>Refresh data</button>
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
        <div className="hero-meta-item">
          <div className="hero-meta-value">5</div>
          <div className="hero-meta-label">Akun dipantau</div>
        </div>
        <div className="hero-meta-item">
          <div className="hero-meta-value">Live</div>
          <div className="hero-meta-label">Runtime data</div>
        </div>
        <div className="hero-meta-item">
          <div className="hero-meta-value">Daily</div>
          <div className="hero-meta-label">Monitoring cadence</div>
        </div>
      </div>
    </header>
  )
}
