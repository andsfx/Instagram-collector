import type { HeroMetaItem, SummaryStripItem } from '../data/selectors'

export function HeaderBar({
  onRefresh,
  heroMeta,
  highlights,
}: {
  onRefresh: () => void
  heroMeta: HeroMetaItem[]
  highlights: SummaryStripItem[]
}) {
  return (
    <header className="relative overflow-hidden rounded-[34px] border border-[color:color-mix(in_srgb,var(--brand)_14%,var(--border))] bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--brand)_20%,transparent),transparent_26%),radial-gradient(circle_at_bottom_left,color-mix(in_srgb,var(--brand-soft-2)_44%,transparent),transparent_34%),linear-gradient(135deg,color-mix(in_srgb,var(--panel)_74%,var(--brand-soft)_26%),var(--panel))] px-0 py-[56px] shadow-[0_28px_60px_rgba(34,20,16,0.14)] max-[720px]:rounded-[28px] max-[720px]:py-9">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" aria-hidden="true" />
      <div className="relative z-[1] mx-auto grid w-[min(1360px,calc(100vw-24px))] gap-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:gap-10">
        <div className="grid content-start gap-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex w-fit items-center rounded-full border border-[color:color-mix(in_srgb,var(--brand)_16%,var(--border))] bg-[linear-gradient(180deg,var(--brand-soft),color-mix(in_srgb,var(--brand-soft-2)_75%,var(--panel)))] px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-brand shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
              Competitor Intelligence Brief
            </div>
            <button
              type="button"
              className="inline-flex min-h-[38px] items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--brand)_16%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_82%,var(--brand-soft)_18%),color-mix(in_srgb,var(--panel)_92%,transparent))] px-3.5 py-2 text-sm font-bold text-text transition duration-200 hover:-translate-y-px"
              onClick={onRefresh}
            >
              Muat ulang data terbaru
            </button>
          </div>
          <div className="grid max-w-[980px] gap-5">
            <h1 className="m-0 max-w-[12.5ch] font-display text-[clamp(3rem,2.45rem+1.65vw,4.4rem)] leading-[0.94] tracking-[-0.045em] text-text max-[720px]:max-w-[11ch] max-[720px]:text-[clamp(2.35rem,2.05rem+1.75vw,3rem)]">
              Lanskap Instagram kompetitor, dibaca seperti editorial brief.
            </h1>
            <p className="m-0 max-w-[58ch] text-[1rem] leading-[1.75] text-text-muted max-[720px]:max-w-[34ch] max-[720px]:text-[0.96rem]">
              Sinyal kompetitor, momentum pertumbuhan, dan kualitas interaksi dirangkai sebagai alur baca yang lebih tenang, cepat dipindai, dan terasa seperti halaman pembuka sebuah report.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--brand-strong)_55%,transparent)] bg-[linear-gradient(180deg,var(--brand),var(--brand-hover))] px-5 py-3 font-bold text-white shadow-[0_12px_24px_color-mix(in_srgb,var(--brand)_22%,transparent)] transition duration-200 hover:-translate-y-px"
              href="#section-summary"
            >
              Lihat executive summary
            </a>
            <a
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-[color:color-mix(in_srgb,var(--panel)_88%,transparent)] px-5 py-3 font-bold text-text transition duration-200 hover:-translate-y-px"
              href="#section-ranking"
            >
              Buka ranking lengkap
            </a>
          </div>
          <div className="hidden flex-wrap gap-[22px] border-t border-[color:color-mix(in_srgb,var(--border)_82%,transparent)] pt-5 lg:flex">
            {heroMeta.map((item) => (
              <div key={item.label} className="grid gap-[3px]">
                <div className="font-display text-[1.8rem] leading-none text-brand">{item.value}</div>
                <div className="text-[0.82rem] uppercase tracking-[0.08em] text-text-soft">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <aside className="grid gap-5 self-stretch rounded-[30px] border border-[color:color-mix(in_srgb,var(--brand)_15%,var(--border))] bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--brand-soft-2)_55%,transparent),transparent_34%),linear-gradient(180deg,color-mix(in_srgb,var(--panel)_95%,var(--brand-soft)_5%),color-mix(in_srgb,var(--panel)_98%,transparent))] p-6 shadow-panel-md max-[720px]:rounded-[24px] max-[720px]:p-5">
          <div className="grid gap-2.5">
            <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-brand">Live Brief</div>
            <div className="max-w-[18ch] font-display text-[clamp(1.42rem,1.15rem+0.45vw,1.92rem)] leading-[1.04] tracking-[-0.03em] text-text">
              Tiga sinyal yang langsung menjelaskan lanskap hari ini
            </div>
          </div>
          <div className="grid gap-2.5">
            {highlights.map((item) => (
              <article
                key={item.label}
                className={[
                  'grid gap-2 rounded-[20px] border px-4 py-[14px]',
                  item.emphasis
                    ? 'border-[color:color-mix(in_srgb,var(--brand)_24%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft-2)_85%,var(--panel)),color-mix(in_srgb,var(--brand-soft)_72%,var(--panel)))]'
                    : 'border-[color:color-mix(in_srgb,var(--brand)_8%,var(--border))] bg-[color:color-mix(in_srgb,var(--panel)_94%,transparent)]',
                ].join(' ')}
              >
                <div className="text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-text-soft">{item.label}</div>
                <div className="font-display text-[clamp(1.25rem,1.02rem+0.5vw,1.8rem)] leading-[0.98] text-brand-strong">{item.value}</div>
                <div className="text-[0.9rem] leading-[1.5] text-text-muted">{item.detail}</div>
              </article>
            ))}
          </div>
          <p className="border-t border-[color:color-mix(in_srgb,var(--border)_82%,transparent)] pt-3 text-[0.9rem] leading-[1.55] text-text-muted">
            Mulai dari ringkasan strategis di atas, lalu turun ke section berikutnya untuk membaca ranking, momentum, dan pola konten secara lebih detail.
          </p>
        </aside>
      </div>
      <div className="mx-auto mt-5 flex w-[min(1360px,calc(100vw-24px))] flex-wrap gap-4 border-t border-[color:color-mix(in_srgb,var(--border)_82%,transparent)] pt-4 lg:hidden">
        {heroMeta.map((item) => (
          <div key={item.label} className="grid gap-[3px]">
            <div className="font-display text-[1.55rem] leading-none text-brand">{item.value}</div>
            <div className="text-[0.76rem] uppercase tracking-[0.08em] text-text-soft">{item.label}</div>
          </div>
        ))}
      </div>
    </header>
  )
}
