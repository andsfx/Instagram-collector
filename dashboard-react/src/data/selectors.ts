import type { DashboardRecord, MetricEntry, PostInsightPost, UiAccountSummary } from './types'

export const formatCompact = new Intl.NumberFormat('id-ID', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

export const formatInteger = new Intl.NumberFormat('id-ID')

const JAKARTA_DAY_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Jakarta',
  weekday: 'short',
})

const JAKARTA_HOUR_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Jakarta',
  hour: '2-digit',
  hour12: false,
})

function formatDateLabel(value: string) {
  const date = new Date(value)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTimeLabel(value: string) {
  const date = new Date(value)
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function metricFor(record: DashboardRecord, account: string): MetricEntry {
  return record.latest[account] ?? {
    followers: null,
    following: null,
    posts: null,
    avg_likes: null,
    avg_comments: null,
    engagement_rate: null,
  }
}

export interface FreshnessSummary {
  latestDateLabel: string
  generatedAtLabel: string
  accountCount: number
  historyDays: number
  sourceLabel: string
}

export function getFreshnessSummary(data: DashboardRecord): FreshnessSummary {
  return {
    latestDateLabel: formatDateLabel(data.latestDate),
    generatedAtLabel: formatDateTimeLabel(data.generatedAtWib),
    accountCount: data.accounts.length,
    historyDays: data.history.length,
    sourceLabel: [data.sources.stats, data.sources.engagement].filter(Boolean).join(' + '),
  }
}

export interface ExecutiveSummaryData {
  kpis: DashboardRecord['presentation']['executiveKpis']
  bullets: string[]
}

export function getExecutiveSummary(data: DashboardRecord): ExecutiveSummaryData {
  return {
    kpis: data.presentation.executiveKpis,
    bullets: data.presentation.executiveBullets,
  }
}

export interface TodaySummaryItem {
  label: string
  value: string
  detail: string
}

export interface TodaySummaryData {
  title: string
  referenceDate: string
  items: TodaySummaryItem[]
}

export function getTodaySummary(data: DashboardRecord): TodaySummaryData {
  const topFollowers = data.rankings.by_followers[0]
  const topEngagement = data.rankings.by_engagement_rate[0]
  const fastestGrowth = Object.entries(data.growth)
    .map(([account, growth]) => ({ account, ...growth }))
    .sort((a, b) => b.pct_change_7d - a.pct_change_7d)[0]

  return {
    title: 'Tiga indikator yang paling cepat menjelaskan situasi kompetitor',
    referenceDate: formatDateLabel(data.latestDate),
    items: [
      {
        label: 'Pemimpin audiens',
        value: topFollowers ? `@${topFollowers.account}` : '-',
        detail: topFollowers
          ? `${formatInteger.format(topFollowers.followers)} followers masih menjadi baseline awareness tertinggi.`
          : 'Belum ada data ranking followers.',
      },
      {
        label: 'Kualitas interaksi',
        value: topEngagement ? `@${topEngagement.account}` : '-',
        detail: topEngagement
          ? `${topEngagement.engagement_rate.toFixed(2)}% engagement rate memimpin periode terbaru.`
          : 'Belum ada data engagement rate.',
      },
      {
        label: 'Pertumbuhan tercepat 7 hari',
        value: fastestGrowth ? `@${fastestGrowth.account}` : '-',
        detail: fastestGrowth
          ? `${fastestGrowth.pct_change_7d.toFixed(2)}% atau ${formatInteger.format(fastestGrowth.followers_change_7d)} followers dalam 7 hari.`
          : 'Belum ada data pertumbuhan 7 hari.',
      },
    ],
  }
}

export interface QuickVisualData {
  followerTrend: Array<Record<string, number | string>>
  engagementRanking: Array<{ account: string; engagementRate: number }>
  series: Array<{ key: string; color: string }>
  followerShare: Array<{ account: string; followers: number; fill: string }>
  radarComparison: Array<Record<string, number | string>>
  projectionTrend: Array<Record<string, number | string | null>>
  projectionNote: string
  engagementTrend: Array<Record<string, number | string | null>>
}

const SERIES_COLORS = ['#2152d9', '#e1306c', '#0f9f6e', '#c47c00', '#7c3aed']

const H2H_METRICS = {
  followers: { label: 'Followers' },
  engagement: { label: 'Engagement Rate' },
  avgLikes: { label: 'Avg Likes' },
  growth: { label: 'Growth 7d' },
} as const

export type HeadToHeadMetric = keyof typeof H2H_METRICS

const HEATMAP_DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

const HEATMAP_SLOTS = [
  { key: 'morning', label: 'Pagi', sublabel: '06-11', match: (hour: number) => hour >= 6 && hour <= 11 },
  { key: 'afternoon', label: 'Siang', sublabel: '12-16', match: (hour: number) => hour >= 12 && hour <= 16 },
  { key: 'evening', label: 'Sore', sublabel: '17-20', match: (hour: number) => hour >= 17 && hour <= 20 },
  { key: 'night', label: 'Malam', sublabel: '21-05', match: (hour: number) => hour >= 21 || hour <= 5 },
] as const

function getBrandAccount(data: DashboardRecord) {
  return data.accounts[0] ?? null
}

function getMetricValue(data: DashboardRecord, account: string, metric: HeadToHeadMetric) {
  const latest = metricFor(data, account)
  const growth = data.growth[account]

  if (metric === 'followers') return latest.followers ?? 0
  if (metric === 'engagement') return latest.engagement_rate ?? 0
  if (metric === 'avgLikes') return latest.avg_likes ?? 0
  return growth?.pct_change_7d ?? 0
}

function getMetricFormatter(metric: HeadToHeadMetric, value: number) {
  if (metric === 'engagement' || metric === 'growth') return `${value.toFixed(2)}%`
  return formatInteger.format(value)
}

function getHistoryMetricValue(entry: MetricEntry | undefined, metric: HeadToHeadMetric, growthValue: number) {
  if (metric === 'followers') return entry?.followers ?? 0
  if (metric === 'engagement') return entry?.engagement_rate ?? 0
  if (metric === 'avgLikes') return entry?.avg_likes ?? 0
  return growthValue
}

export function getQuickVisualData(data: DashboardRecord): QuickVisualData {
  const lastTenDays = data.history.slice(-10)
  const followerTrend = lastTenDays.map((row) => {
    const shaped: Record<string, number | string> = {
      date: formatDateLabel(row.date),
    }

    data.accounts.forEach((account) => {
      shaped[account] = row.values[account]?.followers ?? 0
    })

    return shaped
  })

  const followerShare = data.accounts.map((account, index) => ({
    account: `@${account}`,
    followers: metricFor(data, account).followers ?? 0,
    fill: SERIES_COLORS[index % SERIES_COLORS.length],
  }))

  const accountMetrics = data.accounts.map((account) => ({
    account,
    latest: metricFor(data, account),
  }))
  const maxFollowers = Math.max(1, ...accountMetrics.map((entry) => entry.latest.followers ?? 0))
  const maxFollowing = Math.max(1, ...accountMetrics.map((entry) => entry.latest.following ?? 0))
  const maxPosts = Math.max(1, ...accountMetrics.map((entry) => entry.latest.posts ?? 0))
  const maxAvgLikes = Math.max(1, ...accountMetrics.map((entry) => entry.latest.avg_likes ?? 0))
  const maxAvgComments = Math.max(1, ...accountMetrics.map((entry) => entry.latest.avg_comments ?? 0))
  const maxEngagement = Math.max(1, ...accountMetrics.map((entry) => entry.latest.engagement_rate ?? 0))

  const radarComparison = [
    {
      metric: 'Followers',
      ...Object.fromEntries(data.accounts.map((account) => [account, ((metricFor(data, account).followers ?? 0) / maxFollowers) * 100])),
    },
    {
      metric: 'Following',
      ...Object.fromEntries(data.accounts.map((account) => [account, ((metricFor(data, account).following ?? 0) / maxFollowing) * 100])),
    },
    {
      metric: 'Posts',
      ...Object.fromEntries(data.accounts.map((account) => [account, ((metricFor(data, account).posts ?? 0) / maxPosts) * 100])),
    },
    {
      metric: 'Avg Likes',
      ...Object.fromEntries(data.accounts.map((account) => [account, ((metricFor(data, account).avg_likes ?? 0) / maxAvgLikes) * 100])),
    },
    {
      metric: 'Avg Comments',
      ...Object.fromEntries(data.accounts.map((account) => [account, ((metricFor(data, account).avg_comments ?? 0) / maxAvgComments) * 100])),
    },
    {
      metric: 'ER',
      ...Object.fromEntries(data.accounts.map((account) => [account, ((metricFor(data, account).engagement_rate ?? 0) / maxEngagement) * 100])),
    },
  ]

  const engagementTrend = lastTenDays.map((row) => {
    const shaped: Record<string, number | string | null> = {
      date: formatDateLabel(row.date),
    }

    data.accounts.forEach((account) => {
      shaped[account] = row.values[account]?.engagement_rate ?? null
    })

    return shaped
  })

  const projectionDays = 14
  const projectionTrend: Array<Record<string, number | string | null>> = data.history.slice(-10).map((row) => {
    const shaped: Record<string, number | string | null> = {
      date: formatDateLabel(row.date),
    }
    data.accounts.forEach((account) => {
      shaped[`${account}_actual`] = row.values[account]?.followers ?? null
      shaped[`${account}_projection`] = null
    })
    return shaped
  })

  const projectionNotes: string[] = []

  data.accounts.forEach((account) => {
    const series = data.history.map((row) => row.values[account]?.followers ?? 0)
    const points = series.map((value, index) => ({ x: index, y: value })).filter((point) => point.y > 0)
    if (points.length < 2) return

    const count = points.length
    const sumX = points.reduce((total, point) => total + point.x, 0)
    const sumY = points.reduce((total, point) => total + point.y, 0)
    const sumXY = points.reduce((total, point) => total + (point.x * point.y), 0)
    const sumXX = points.reduce((total, point) => total + (point.x * point.x), 0)
    const denominator = (count * sumXX) - (sumX * sumX)
    if (denominator === 0) return

    const slope = ((count * sumXY) - (sumX * sumY)) / denominator
    const intercept = (sumY - (slope * sumX)) / count
    const lastIndex = data.history.length - 1

    for (let offset = 1; offset <= projectionDays; offset += 1) {
      const labelDate = new Date(data.latestDate)
      labelDate.setDate(labelDate.getDate() + offset)
      const formattedDate = labelDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
      const projectedValue = Math.round((slope * (lastIndex + offset)) + intercept)
      const rowIndex = projectionTrend.findIndex((row) => row.date === formattedDate)

      if (rowIndex >= 0) {
        projectionTrend[rowIndex][`${account}_projection`] = projectedValue
      } else {
        projectionTrend.push({
          date: formattedDate,
          ...Object.fromEntries(data.accounts.flatMap((entry) => [
            [`${entry}_actual`, null],
            [`${entry}_projection`, entry === account ? projectedValue : null],
          ])),
        })
      }
    }

    const brand = getBrandAccount(data)
    if (brand && brand !== account) {
      const brandSeries = data.history.map((row) => row.values[brand]?.followers ?? 0)
      const brandPoints = brandSeries.map((value, index) => ({ x: index, y: value })).filter((point) => point.y > 0)
      if (brandPoints.length >= 2) {
        const brandCount = brandPoints.length
        const brandSumX = brandPoints.reduce((total, point) => total + point.x, 0)
        const brandSumY = brandPoints.reduce((total, point) => total + point.y, 0)
        const brandSumXY = brandPoints.reduce((total, point) => total + (point.x * point.y), 0)
        const brandSumXX = brandPoints.reduce((total, point) => total + (point.x * point.x), 0)
        const brandDenominator = (brandCount * brandSumXX) - (brandSumX * brandSumX)
        if (brandDenominator !== 0 && slope !== (((brandCount * brandSumXY) - (brandSumX * brandSumY)) / brandDenominator)) {
          const brandSlope = ((brandCount * brandSumXY) - (brandSumX * brandSumY)) / brandDenominator
          const brandIntercept = (brandSumY - (brandSlope * brandSumX)) / brandCount
          const crossingX = (brandIntercept - intercept) / (slope - brandSlope)
          const crossingInDays = crossingX - lastIndex
          if (crossingInDays > 0 && crossingInDays <= 60) {
            projectionNotes.push(`@${account} berpotensi menyalip @${brand} dalam sekitar ${Math.round(crossingInDays)} hari.`)
          }
        }
      }
    }
  })

  projectionTrend.sort((left, right) => {
    const leftDate = new Date(`2026 ${left.date}`)
    const rightDate = new Date(`2026 ${right.date}`)
    return leftDate.getTime() - rightDate.getTime()
  })

  return {
    followerTrend,
    engagementRanking: data.rankings.by_engagement_rate.map((row) => ({
      account: `@${row.account}`,
      engagementRate: row.engagement_rate,
    })),
    series: data.accounts.map((account, index) => ({
      key: account,
      color: SERIES_COLORS[index % SERIES_COLORS.length],
    })),
    followerShare,
    radarComparison,
    projectionTrend,
    projectionNote: projectionNotes[0] ?? 'Belum ada crossing signifikan yang terindikasi dalam horizon proyeksi pendek.',
    engagementTrend,
  }
}

export function getAccountSummaries(data: DashboardRecord): UiAccountSummary[] {
  return data.accounts
    .map((account) => {
      const latest = metricFor(data, account)
      const growth = data.growth[account]

      return {
        key: account,
        name: `@${account}`,
        followers: latest.followers ?? 0,
        following: latest.following ?? 0,
        posts: latest.posts ?? 0,
        avgLikes: latest.avg_likes ?? 0,
        avgComments: latest.avg_comments ?? 0,
        engagementRate: latest.engagement_rate ?? 0,
        change1d: growth?.followers_change_1d ?? 0,
        change7d: growth?.followers_change_7d ?? 0,
        change7dPct: growth?.pct_change_7d ?? 0,
      }
    })
    .sort((a, b) => b.followers - a.followers)
}

export function getLatestPost(posts: PostInsightPost[] | undefined) {
  if (!posts?.length) return null

  return posts.reduce<PostInsightPost | null>((latest, post) => {
    if (!latest) return post

    const latestTime = new Date(latest.published_at ?? latest.timestamp ?? 0).getTime()
    const postTime = new Date(post.published_at ?? post.timestamp ?? 0).getTime()

    return postTime > latestTime ? post : latest
  }, null)
}

export function formatPostDate(value?: string) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
  })
}

export interface HeadToHeadData {
  accountA: string
  accountB: string
  presets: Array<{ value: string; label: string }>
  metricOptions: Array<{ value: HeadToHeadMetric; label: string }>
  verdict: string
  subverdict: string
  winsA: number
  winsB: number
  gapFollowers: number
  comparisonRows: Array<{ label: string; valueA: string; valueB: string; rawA: number; rawB: number }>
  trendTitle: string
  trendDescription: string
  trendData: Array<Record<string, number | string>>
  hasTrend: boolean
}

export function getHeadToHeadDefaults(data: DashboardRecord) {
  const accountA = getBrandAccount(data) ?? data.accounts[0] ?? ''
  const competitors = data.accounts.filter((account) => account !== accountA)
  const topFollowerCompetitor = [...competitors].sort((left, right) => {
    return (metricFor(data, right).followers ?? 0) - (metricFor(data, left).followers ?? 0)
  })[0] ?? competitors[0] ?? accountA

  return {
    accountA,
    accountB: topFollowerCompetitor,
    metric: 'followers' as HeadToHeadMetric,
  }
}

export function resolveHeadToHeadPreset(data: DashboardRecord, preset: string, currentA: string, currentB: string) {
  const brand = getBrandAccount(data) ?? currentA
  const competitors = data.accounts.filter((account) => account !== brand)

  if (preset === 'brand-top-followers') {
    const topFollowers = [...competitors].sort((left, right) => {
      return (metricFor(data, right).followers ?? 0) - (metricFor(data, left).followers ?? 0)
    })[0]

    return topFollowers ? { accountA: brand, accountB: topFollowers } : { accountA: currentA, accountB: currentB }
  }

  if (preset === 'brand-top-er') {
    const topEngagement = [...competitors].sort((left, right) => {
      return (metricFor(data, right).engagement_rate ?? 0) - (metricFor(data, left).engagement_rate ?? 0)
    })[0]

    return topEngagement ? { accountA: brand, accountB: topEngagement } : { accountA: currentA, accountB: currentB }
  }

  if (preset === 'top-two') {
    const topTwo = [...data.accounts].sort((left, right) => {
      return (metricFor(data, right).followers ?? 0) - (metricFor(data, left).followers ?? 0)
    }).slice(0, 2)

    if (topTwo.length === 2) {
      return { accountA: topTwo[0], accountB: topTwo[1] }
    }
  }

  return { accountA: currentA, accountB: currentB }
}

export function getHeadToHeadData(
  data: DashboardRecord,
  accountA: string,
  accountB: string,
  activeMetric: HeadToHeadMetric,
): HeadToHeadData {
  const latestA = metricFor(data, accountA)
  const latestB = metricFor(data, accountB)
  const growthA = data.growth[accountA]
  const growthB = data.growth[accountB]

  const comparisonRows = [
    {
      label: 'Followers',
      rawA: latestA.followers ?? 0,
      rawB: latestB.followers ?? 0,
      valueA: formatInteger.format(latestA.followers ?? 0),
      valueB: formatInteger.format(latestB.followers ?? 0),
    },
    {
      label: 'Following',
      rawA: latestA.following ?? 0,
      rawB: latestB.following ?? 0,
      valueA: formatInteger.format(latestA.following ?? 0),
      valueB: formatInteger.format(latestB.following ?? 0),
    },
    {
      label: 'Posts',
      rawA: latestA.posts ?? 0,
      rawB: latestB.posts ?? 0,
      valueA: formatInteger.format(latestA.posts ?? 0),
      valueB: formatInteger.format(latestB.posts ?? 0),
    },
    {
      label: 'Engagement Rate',
      rawA: latestA.engagement_rate ?? 0,
      rawB: latestB.engagement_rate ?? 0,
      valueA: `${(latestA.engagement_rate ?? 0).toFixed(2)}%`,
      valueB: `${(latestB.engagement_rate ?? 0).toFixed(2)}%`,
    },
    {
      label: 'Growth 7d',
      rawA: growthA?.pct_change_7d ?? 0,
      rawB: growthB?.pct_change_7d ?? 0,
      valueA: `${(growthA?.pct_change_7d ?? 0).toFixed(2)}%`,
      valueB: `${(growthB?.pct_change_7d ?? 0).toFixed(2)}%`,
    },
  ]

  let winsA = 0
  let winsB = 0
  comparisonRows.forEach((row) => {
    if (row.rawA > row.rawB) winsA += 1
    if (row.rawB > row.rawA) winsB += 1
  })

  const activeA = getMetricValue(data, accountA, activeMetric)
  const activeB = getMetricValue(data, accountB, activeMetric)
  const leader = activeA === activeB ? null : activeA > activeB ? accountA : accountB
  const verdict = winsA === winsB
    ? `@${accountA} dan @${accountB} masih berimbang pada metrik utama.`
    : `@${winsA > winsB ? accountA : accountB} unggul keseluruhan dengan memenangkan ${Math.max(winsA, winsB)} dari ${comparisonRows.length} metrik.`
  const subverdict = leader
    ? `Pada metrik aktif ${H2H_METRICS[activeMetric].label}, @${leader} lebih unggul dengan nilai ${getMetricFormatter(activeMetric, Math.max(activeA, activeB))}.`
    : `Pada metrik aktif ${H2H_METRICS[activeMetric].label}, keduanya masih imbang.`

  const trendData = data.history.slice(-10).map((row) => ({
    date: formatDateLabel(row.date),
    [accountA]: getHistoryMetricValue(row.values[accountA], activeMetric, growthA?.pct_change_7d ?? 0),
    [accountB]: getHistoryMetricValue(row.values[accountB], activeMetric, growthB?.pct_change_7d ?? 0),
  }))

  const hasTrend = activeMetric === 'followers' || activeMetric === 'engagement' || activeMetric === 'avgLikes'

  return {
    accountA,
    accountB,
    presets: [
      { value: 'brand-top-followers', label: 'Brand vs Top Followers' },
      { value: 'brand-top-er', label: 'Brand vs Top ER' },
      { value: 'top-two', label: 'Top 2 Accounts' },
    ],
    metricOptions: Object.entries(H2H_METRICS).map(([value, config]) => ({
      value: value as HeadToHeadMetric,
      label: config.label,
    })),
    verdict,
    subverdict,
    winsA,
    winsB,
    gapFollowers: Math.abs((latestA.followers ?? 0) - (latestB.followers ?? 0)),
    comparisonRows,
    trendTitle: H2H_METRICS[activeMetric].label,
    trendDescription: hasTrend
      ? `Perbandingan ${H2H_METRICS[activeMetric].label.toLowerCase()} dalam 10 observasi terakhir.`
      : `Metrik ${H2H_METRICS[activeMetric].label.toLowerCase()} saat ini lebih cocok dibaca sebagai snapshot ringkas.`,
    trendData,
    hasTrend,
  }
}

function getJakartaDayIndex(dateValue: string) {
  const weekday = JAKARTA_DAY_FORMATTER.format(new Date(dateValue))
  if (weekday === 'Mon') return 0
  if (weekday === 'Tue') return 1
  if (weekday === 'Wed') return 2
  if (weekday === 'Thu') return 3
  if (weekday === 'Fri') return 4
  if (weekday === 'Sat') return 5
  return 6
}

function getJakartaHour(dateValue: string) {
  return Number(JAKARTA_HOUR_FORMATTER.format(new Date(dateValue)))
}

export interface HeatmapCellData {
  day: string
  slot: string
  sublabel: string
  value: number
  intensity: number
}

export interface HeatmapData {
  accounts: string[]
  matrix: HeatmapCellData[][]
  bestWindow: string
  totalPosts: number
}

export function getHeatmapData(data: DashboardRecord, account: string): HeatmapData {
  const matrixCounts = HEATMAP_DAYS.map(() => HEATMAP_SLOTS.map(() => 0))
  const posts = data.post_insights?.[account]?.posts ?? []

  posts.forEach((post) => {
    const publishedAt = post.published_at ?? post.timestamp
    if (!publishedAt) return

    const dayIndex = getJakartaDayIndex(publishedAt)
    const hour = getJakartaHour(publishedAt)
    const slotIndex = HEATMAP_SLOTS.findIndex((slot) => slot.match(hour))

    if (slotIndex >= 0) {
      matrixCounts[dayIndex][slotIndex] += 1
    }
  })

  const maxValue = Math.max(1, ...matrixCounts.flat())
  let bestDayIndex = 0
  let bestSlotIndex = 0
  let bestValue = 0

  matrixCounts.forEach((row, dayIndex) => {
    row.forEach((value, slotIndex) => {
      if (value > bestValue) {
        bestValue = value
        bestDayIndex = dayIndex
        bestSlotIndex = slotIndex
      }
    })
  })

  return {
    accounts: data.accounts,
    matrix: matrixCounts.map((row, dayIndex) => row.map((value, slotIndex) => ({
      day: HEATMAP_DAYS[dayIndex],
      slot: HEATMAP_SLOTS[slotIndex].label,
      sublabel: HEATMAP_SLOTS[slotIndex].sublabel,
      value,
      intensity: value / maxValue,
    }))),
    bestWindow: `${HEATMAP_DAYS[bestDayIndex]}, ${HEATMAP_SLOTS[bestSlotIndex].label} (${HEATMAP_SLOTS[bestSlotIndex].sublabel})`,
    totalPosts: posts.length,
  }
}

export interface InsightsData {
  items: Array<{
    label: string
    title: string
    description: string
    tone: 'positive' | 'warning' | 'danger' | 'info'
  }>
}

export function getInsightsData(data: DashboardRecord): InsightsData {
  const brand = getBrandAccount(data)
  const competitors = data.accounts.filter((account) => account !== brand)
  const brandMetric = brand ? metricFor(data, brand) : null

  const items: InsightsData['items'] = []

  if (brand && brandMetric) {
    const closestCompetitor = [...competitors].sort((left, right) => {
      return Math.abs((metricFor(data, left).followers ?? 0) - (brandMetric.followers ?? 0))
        - Math.abs((metricFor(data, right).followers ?? 0) - (brandMetric.followers ?? 0))
    })[0]

    if (closestCompetitor) {
      const gap = (brandMetric.followers ?? 0) - (metricFor(data, closestCompetitor).followers ?? 0)
      items.push({
        label: 'Gap terdekat',
        title: gap >= 0 ? `Brand masih unggul atas @${closestCompetitor}` : `@${closestCompetitor} sudah melewati brand`,
        description: `Selisih followers saat ini ${formatInteger.format(Math.abs(gap))}. Ini adalah rival paling relevan untuk pemantauan harian.`,
        tone: gap >= 0 ? 'info' : 'danger',
      })
    }

    const brandEr = brandMetric.engagement_rate ?? 0
    items.push({
      label: 'Kualitas interaksi',
      title: brandEr >= 0.1 ? 'Engagement brand relatif sehat' : 'Engagement brand perlu diperkuat',
      description: `ER brand saat ini ${brandEr.toFixed(2)}%. Gunakan ini sebagai baseline evaluasi konten dan jadwal posting berikutnya.`,
      tone: brandEr >= 0.1 ? 'positive' : 'warning',
    })
  }

  const fastestGrowth = Object.entries(data.growth)
    .map(([account, growth]) => ({ account, ...growth }))
    .sort((left, right) => right.pct_change_7d - left.pct_change_7d)[0]

  if (fastestGrowth) {
    items.push({
      label: 'Momentum',
      title: `@${fastestGrowth.account} paling cepat tumbuh dalam 7 hari`,
      description: `Pertumbuhan ${fastestGrowth.pct_change_7d.toFixed(2)}% setara ${formatInteger.format(fastestGrowth.followers_change_7d)} followers. Ini akun yang paling layak dianalisis polanya minggu ini.`,
      tone: 'positive',
    })
  }

  const bestEngagement = data.rankings.by_engagement_rate[0]
  if (bestEngagement) {
    items.push({
      label: 'Benchmark konten',
      title: `@${bestEngagement.account} memimpin engagement rate`,
      description: `${bestEngagement.engagement_rate.toFixed(2)}% ER menjadikannya benchmark paling jelas untuk kualitas interaksi, bukan hanya skala audiens.`,
      tone: 'info',
    })
  }

  if (!items.length) {
    items.push({
      label: 'Info',
      title: 'Belum cukup data untuk menyusun rekomendasi',
      description: 'Tambahkan histori dan data post-level agar panel insight dapat menghasilkan rekomendasi yang lebih tajam.',
      tone: 'warning',
    })
  }

  return { items }
}
