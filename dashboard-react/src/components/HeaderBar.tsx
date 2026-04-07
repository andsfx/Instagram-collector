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
    <header className="relative overflow-hidden rounded-[36px] border border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_98%,transparent),color-mix(in_srgb,var(--panel)_92%,transparent))] px-0 py-[42px] shadow-panel-md backdrop-blur-[22px] max-[720px]:rounded-[28px] max-[720px]:py-7">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--brand-soft)_92%,transparent),transparent_28%),radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--brand-soft-2)_72%,transparent),transparent_26%)]"
        aria-hidden="true"
      />
      <div className="relative z-[1] mx-auto grid w-[min(1360px,calc(100vw-24px))] gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.92fr)] lg:gap-8">
        <div className="grid content-start gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex w-fit items-center rounded-full border border-[color:color-mix(in_srgb,var(--brand)_14%,var(--border))] bg-[color:color-mix(in_srgb,var(--panel)_88%,transparent)] px-3.5 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-brand">
              Metropolitan Mall Bekasi Social Performance
            </div>
            <button
              type="button"
              className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-border bg-[color:color-mix(in_srgb,var(--panel)_84%,transparent)] px-4 py-2 text-sm font-semibold text-text transition duration-200 hover:-translate-y-px hover:border-[color:color-mix(in_srgb,var(--brand)_18%,var(--border))] hover:text-brand"
              onClick={onRefresh}
            >
              Refresh live data
            </button>
          </div>

          <div className="grid gap-4 lg:max-w-[760px]">
            <div className="grid gap-3">
              <p className="m-0 text-sm font-semibold uppercase tracking-[0.18em] text-text-soft">
                Presentation-ready competitive snapshot
              </p>
              <h1 className="m-0 max-w-[17ch] font-display text-[clamp(2.9rem,2.15rem+1.8vw,4.9rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-text max-[720px]:max-w-[15ch] max-[720px]:text-[clamp(1.95rem,1.75rem+1vw,2.55rem)] max-[720px]:leading-[1.02]">
                Metropolitan Mall Bekasi vs kompetitor, dibaca cepat untuk keputusan.
              </h1>
            </div>
            <p className="m-0 max-w-[60ch] text-[1.02rem] leading-[1.75] text-text-muted max-[720px]:text-[0.95rem] max-[720px]:leading-[1.62]">
              Dashboard ini menyusun pertumbuhan followers, engagement rate, top competitor, dan format konten terbaik ke dalam alur baca yang lebih tenang, ringkas, dan siap dipresentasikan ke tim internal maupun direksi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-transparent bg-[linear-gradient(135deg,var(--brand),var(--brand-strong))] px-5 py-3 text-sm font-bold text-white shadow-[0_16px_30px_color-mix(in_srgb,var(--brand)_18%,transparent)] transition duration-200 hover:-translate-y-px"
              href="#section-summary"
            >
              Mulai dari executive summary
            </a>
            <a
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-[color:color-mix(in_srgb,var(--panel)_82%,transparent)] px-5 py-3 text-sm font-semibold text-text transition duration-200 hover:-translate-y-px hover:border-[color:color-mix(in_srgb,var(--brand)_18%,var(--border))]"
              href="#section-growth"
            >
              Lihat growth story
            </a>
          </div>

          <div className="grid gap-3 border-t border-[color:color-mix(in_srgb,var(--border)_88%,transparent)] pt-4 md:grid-cols-4 max-[720px]:grid-cols-2">
            {heroMeta.map((item, index) => (
              <div
                key={item.label}
                className={[
                  'grid gap-1 rounded-[22px] border p-4',
                  index === 0
                    ? 'border-[color:color-mix(in_srgb,var(--brand)_18%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_65%,var(--panel)),color-mix(in_srgb,var(--panel)_96%,transparent))]'
                    : 'border-[color:color-mix(in_srgb,var(--border)_90%,transparent)] bg-[color:color-mix(in_srgb,var(--panel)_76%,transparent)]',
                ].join(' ')}
              >
                <div className="text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-text-soft">{item.label}</div>
                <div className="font-display text-[clamp(1.4rem,1.14rem+0.62vw,2rem)] font-semibold leading-none text-text">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <aside className="grid content-start gap-4 rounded-[30px] border border-[color:color-mix(in_srgb,var(--border)_92%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_90%,transparent),color-mix(in_srgb,var(--panel-muted)_88%,transparent))] p-6 max-[720px]:rounded-[24px] max-[720px]:gap-3.5 max-[720px]:p-4">
          <div className="grid gap-2">
            <div className="text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-brand">Board Brief</div>
            <h2 className="m-0 max-w-[20ch] font-display text-[clamp(1.22rem,1.06rem+0.38vw,1.58rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-text">
              Dua sinyal pembuka yang paling cepat menjelaskan posisi hari ini.
            </h2>
          </div>

          <div className="grid gap-3">
            {highlights.slice(0, 2).map((item, index) => (
              <article
                key={item.label}
                className={[
                  'grid gap-2 rounded-[22px] border p-4',
                  index === 0 || item.emphasis
                    ? 'border-[color:color-mix(in_srgb,var(--brand)_22%,var(--border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand-soft)_86%,var(--panel)),color-mix(in_srgb,var(--brand-soft-2)_54%,var(--panel)))]'
                    : 'border-[color:color-mix(in_srgb,var(--border)_90%,transparent)] bg-[color:color-mix(in_srgb,var(--panel)_82%,transparent)]',
                ].join(' ')}
              >
                <div className="text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-text-soft">{item.label}</div>
                <div className="font-display text-[clamp(1.2rem,1.05rem+0.45vw,1.62rem)] font-semibold leading-[1.02] text-text">
                  {item.value}
                </div>
                <div className="text-[0.92rem] leading-[1.55] text-text-muted">{item.detail}</div>
              </article>
            ))}
          </div>

          <div className="rounded-[20px] border border-[color:color-mix(in_srgb,var(--border)_84%,transparent)] bg-[color:color-mix(in_srgb,var(--panel)_72%,transparent)] p-3.5 text-[0.88rem] leading-[1.55] text-text-muted max-[720px]:hidden">
            KPI inti tetap tampil di hero. Panel ini sengaja diperingan agar opening screen terasa lebih cepat dipindai sebelum masuk ke chapter growth.
          </div>
        </aside>
      </div>
    </header>
  )
}
