import type { HeroMetaItem } from '../data/selectors'

export function HeaderBar({ onRefresh, heroMeta }: { onRefresh: () => void; heroMeta: HeroMetaItem[] }) {
  return (
    <header className="rounded-[2.5rem] border border-white/60 bg-white/76 px-5 py-6 shadow-[0_30px_90px_-42px_rgba(15,23,42,0.4)] backdrop-blur dark:border-white/10 dark:bg-slate-950/66 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-end">
        <div className="grid gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center rounded-full border border-[color:color-mix(in_srgb,var(--brand)_18%,white)] bg-[color:color-mix(in_srgb,var(--brand-soft)_18%,white)] px-3.5 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-700 dark:border-[color:color-mix(in_srgb,var(--brand)_24%,transparent)] dark:bg-[color:color-mix(in_srgb,var(--brand)_12%,transparent)] dark:text-slate-200">
              Metropolitan Mall Bekasi
            </div>
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-white/20 dark:hover:text-white"
              onClick={onRefresh}
            >
              Refresh data
            </button>
          </div>

          <div className="grid gap-4">
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Social performance briefing
            </div>
            <div className="grid gap-3">
              <h1 className="max-w-[14ch] font-display text-[clamp(2.4rem,5vw,4.7rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-slate-950 dark:text-white sm:max-w-[16ch]">
                Pertumbuhan followers Metropolitan Mall Bekasi vs kompetitor.
              </h1>
              <p className="max-w-[62ch] text-[1rem] leading-7 text-slate-600 dark:text-slate-300">
                Ringkasan presentasi untuk tim internal dan direksi, dengan fokus pada growth, engagement rate, dan format konten yang paling efektif dalam periode terbaru.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              className="inline-flex items-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
              href="#section-summary"
            >
              Executive summary
            </a>
            <a
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-white/20 dark:hover:text-white"
              href="#section-growth"
            >
              Growth comparison
            </a>
          </div>
        </div>

        <aside className="grid gap-4 rounded-[2rem] border border-[color:color-mix(in_srgb,var(--brand)_14%,white)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_16%,white),rgba(255,255,255,0.92))] p-5 shadow-[0_20px_60px_-38px_rgba(15,23,42,0.32)] dark:border-[color:color-mix(in_srgb,var(--brand)_18%,transparent)] dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.76),rgba(15,23,42,0.58))]">
          <div className="grid gap-2">
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Board focus
            </div>
            <h2 className="font-display text-[1.45rem] font-semibold leading-[1.02] tracking-[-0.03em] text-slate-950 dark:text-white">
              Satu layar pembuka untuk membaca posisi brand, momentum, dan gap kompetitif.
            </h2>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              Mulai dari growth comparison, lanjut ke executive summary, lalu turun ke chapter comparison dan pattern saat dibutuhkan.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {heroMeta.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.35rem] border border-slate-200/80 bg-white/88 px-4 py-3 dark:border-white/10 dark:bg-white/5"
              >
                <div className="text-[1.15rem] font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">{item.value}</div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.label}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </header>
  )
}
