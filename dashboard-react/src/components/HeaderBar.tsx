import type { HeroMetaItem, HeroSummary } from '../data/selectors'

export function HeaderBar({ onRefresh, heroMeta, copy }: { onRefresh: () => void; heroMeta: HeroMetaItem[]; copy?: HeroSummary }) {
  const heroLead = heroMeta[0]
  const supportingMeta = heroMeta.slice(1)

  return (
    <header className="relative overflow-hidden border-b border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,248,252,0.92)_46%,rgba(248,250,252,0.84))] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.96),rgba(15,23,42,0.9)_48%,rgba(15,23,42,0.76))]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.18),transparent_28%),radial-gradient(circle_at_78%_22%,rgba(129,140,248,0.18),transparent_22%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.22),transparent_30%),radial-gradient(circle_at_78%_22%,rgba(129,140,248,0.18),transparent_22%)]" />
      <div className="relative mx-auto grid min-h-[calc(100svh-3.5rem)] w-full max-w-[1440px] gap-10 px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:items-end lg:px-10 lg:pb-16 lg:pt-12">
        <div className="grid content-end gap-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="grid gap-2">
              <div className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                {copy?.title ?? 'Metropolitan Mall Bekasi'}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">{copy?.subtitle ?? 'Performance overview'}</div>
            </div>
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-slate-200/90 bg-white/88 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:text-white"
              onClick={onRefresh}
            >
              Refresh data
            </button>
          </div>

          <div className="grid gap-5">
            <h1 className="max-w-[11ch] font-display text-[clamp(2.8rem,6vw,6.2rem)] font-semibold leading-[0.92] tracking-[-0.065em] text-slate-950 dark:text-white sm:max-w-[12ch]">
              {copy?.title ? `${copy.title}.` : 'Metropolitan Mall Bekasi.'}
            </h1>
            <div className="grid max-w-[42rem] gap-3">
              <p className="text-[clamp(1.02rem,0.94rem+0.3vw,1.26rem)] font-medium leading-[1.35] text-slate-800 dark:text-slate-100">
                {copy?.description ?? 'Growth, engagement, dan gap kompetitor dalam satu ringkasan.'}
              </p>
              <p className="max-w-[34rem] text-[0.92rem] leading-6 text-slate-600 dark:text-slate-300">
                Disusun untuk tim internal dan direksi. Mulai dari growth, lanjut ke summary, lalu detail saat diperlukan.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              className="inline-flex items-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
              href="#section-growth"
            >
              Lihat growth
            </a>
            <a
              className="inline-flex items-center rounded-full border border-slate-200/90 bg-white/88 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:text-white"
              href="#section-summary"
            >
              Lihat summary
            </a>
          </div>
        </div>

        <div className="grid content-end gap-5 lg:pl-8 lg:border-l lg:border-slate-200/80 dark:lg:border-white/10">
          <div className="grid gap-3">
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Board readout
            </div>
            <p className="max-w-[22rem] font-display text-[clamp(1.28rem,1.08rem+0.52vw,1.8rem)] font-semibold leading-[1.06] tracking-[-0.035em] text-slate-950 dark:text-white">
              {copy?.boardTitle ?? 'Buka dengan posisi brand. Turun ke detail bila perlu.'}
            </p>
          </div>

          {heroLead ? (
            <div className="grid gap-2 border-t border-slate-200/80 pt-4 dark:border-white/10">
              <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                {heroLead.label}
              </div>
              <div className="font-display text-[clamp(3rem,4.5vw,4.8rem)] font-semibold leading-[0.92] tracking-[-0.07em] text-slate-950 dark:text-white">
                {heroLead.value}
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 border-t border-slate-200/80 pt-4 dark:border-white/10 sm:grid-cols-2">
            {supportingMeta.map((item) => (
              <div key={item.label} className="grid gap-1 py-1">
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{item.label}</div>
                <div className="text-[1.05rem] font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
