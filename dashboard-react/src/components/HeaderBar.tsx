export function HeaderBar({ onRefresh }: { onRefresh: () => void }) {
  return (
    <header className="panel hero">
      <div className="split-row">
        <div className="hero-topline">Dashboard Intel Kompetitor</div>
        <button type="button" className="theme-toggle" onClick={onRefresh}>Refresh data</button>
      </div>
      <div className="hero-copy">
        <h1>Dashboard performa Instagram yang lebih rapi untuk analisis harian.</h1>
        <p className="hero-subtitle">
          Migrasi React ini memprioritaskan parity informasi inti, keterbacaan data, dan fondasi komponen yang lebih sehat daripada dashboard legacy.
        </p>
      </div>
    </header>
  )
}
