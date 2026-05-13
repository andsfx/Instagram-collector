# Dashboard Data Schema v2

**Source of truth:** `dashboard-react/src/data/schema.ts`  
**Supported versions:** `[2]`  
**Validation library:** Zod (TypeScript)

> Dokumen ini HARUS sinkron dengan file schema kode. Perubahan pada schema kode tanpa update dokumen ini akan diblokir oleh CI (`npm run check:schema-doc`).

---

## Top-Level Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `generated_at` | `string` | ✅ | ISO 8601 UTC timestamp |
| `generated_at_wib` | `string` | ✅ | ISO 8601 timestamp zona Asia/Jakarta (UTC+07:00) |
| `version` | `number` | ✅ | Must be in `SUPPORTED_VERSIONS` (currently: `[2]`) |
| `sources` | `object` | ✅ | See [Sources](#sources) |
| `accounts` | `string[]` | ✅ | Array of account usernames, minimal 1 entri |
| `latest` | `object` | ✅ | See [Latest](#latest) |
| `growth` | `Record<string, GrowthEntry>` | ✅ | See [Growth](#growth) |
| `rankings` | `object` | ✅ | See [Rankings](#rankings) |
| `history` | `object[]` | ✅ | See [History](#history) |
| `content_breakdown` | `Record<string, ContentBreakdownAccount>` | ❌ | See [Content Breakdown](#content-breakdown) |
| `post_insights` | `Record<string, PostInsightsAccount>` | ❌ | See [Post Insights](#post-insights) |
| `presentation_report` | `object` | ✅ | See [Presentation Report](#presentation-report) |
| `meta` | `object` | ❌ | See [Meta](#meta) |

---

## Sources

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `sources.stats` | `string` | ✅ | Data source for account stats (e.g. `"socialblade"`) |
| `sources.engagement` | `string` | ✅ | Data source for engagement metrics (e.g. `"apify"`) |

---

## Latest

Object dengan key `date` dan satu entry per akun.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `latest.date` | `string` | ✅ | ISO 8601 date (`YYYY-MM-DD`) |
| `latest.<account>` | `MetricEntry` | ✅ | Satu entry per akun di `accounts[]` |

### MetricEntry (per account)

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `followers` | `number \| null` | ✅ | Nullable jika data tidak tersedia |
| `following` | `number \| null` | ✅ | Nullable jika data tidak tersedia |
| `posts` | `number \| null` | ✅ | Nullable jika data tidak tersedia |
| `avg_likes` | `number \| null` | ✅ | Nullable jika tidak dapat dihitung |
| `avg_comments` | `number \| null` | ✅ | Nullable jika tidak dapat dihitung |
| `engagement_rate` | `number \| null` | ✅ | Nullable jika followers invalid. Satuan: persen, 2 desimal |

> MetricEntry menggunakan `.passthrough()` — field tambahan diizinkan tetapi tidak divalidasi.

---

## Growth

Record dengan key = account username.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `followers_change_1d` | `number` | ✅ | Perubahan followers 1 hari |
| `followers_change_7d` | `number` | ✅ | Perubahan followers 7 hari |
| `pct_change_7d` | `number` | ✅ | Persentase perubahan 7 hari |

---

## Rankings

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `rankings.by_followers` | `RankEntry[]` | ✅ | Sorted descending by followers |
| `rankings.by_engagement_rate` | `RankEntry[]` | ✅ | Sorted descending by engagement_rate |

### RankEntry

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `rank` | `number` | ✅ | Positive integer, 1-based |
| `account` | `string` | ✅ | Account username |
| `followers` | `number` | ✅ | (for `by_followers`) |
| `engagement_rate` | `number` | ✅ | (for `by_engagement_rate`) |

---

## History

Array of date-keyed objects. Setiap entry mewakili satu hari.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `date` | `string` | ✅ | ISO 8601 date (`YYYY-MM-DD`) |
| `<account>.*` | `any` | ❌ | Per-account metrics (passthrough) |

**Invariant:** Tanggal harus unik dan terurut menaik (ascending).

---

## Content Breakdown

Record dengan key = account username. Menggunakan **strict mode** — hanya field yang terdaftar yang diterima.

### ContentBreakdownAccount (strict)

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `reels` | `number` | ❌ | Jumlah post tipe Reels |
| `carousels` | `number` | ❌ | Jumlah post tipe Carousel. **BUKAN** `carousel` |
| `images` | `number` | ❌ | Jumlah post tipe Image. **BUKAN** `image` |
| `videos` | `number` | ❌ | Jumlah post tipe Video. **BUKAN** `video` |
| `unknown` | `number` | ❌ | Jumlah post dengan tipe tidak dikenal |
| `total_posts_analyzed` | `number` | ❌ | Total posts yang dianalisis |
| `posts` | `number` | ❌ | Total posts akun |
| `followers` | `number` | ❌ | Followers akun |
| `bestPost` | `BestPostEntry` | ❌ | Post dengan performa terbaik |

> **Strict mode:** Field di luar daftar ini akan ditolak. Sinonim (`carousel`, `image`, `video`) **TIDAK** diterima.

### BestPostEntry

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `url` | `string` | ❌ | URL post |
| `type` | `string` | ❌ | Tipe post |
| `interactions` | `number` | ❌ | Total interaksi (likes + comments) |
| `comments` | `number` | ❌ | Jumlah komentar |
| `timestamp` | `string` | ❌ | Waktu publikasi |
| `id` | `string` | ❌ | Post ID |
| `caption` | `string` | ❌ | Caption post |

---

## Post Insights

Record dengan key = account username. Opsional.

### PostInsightsAccount

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `followers` | `number` | ❌ | Followers saat analisis |
| `posts` | `PostDetail[]` | ❌ | Array of post details |
| `top_interactions` | `object[]` | ❌ | Top posts by interactions |
| `average_likes` | `number` | ❌ | Rata-rata likes |
| `average_comments` | `number` | ❌ | Rata-rata komentar |
| `average_post_er` | `number` | ❌ | Rata-rata ER per post |
| `dominant_type` | `string` | ❌ | Tipe post dominan |
| `top_hashtags` | `string[]` | ❌ | Hashtag paling sering |
| `campaign_terms` | `string[]` | ❌ | Campaign terms terdeteksi |
| `viral_posts` | `number` | ❌ | Jumlah viral posts |
| `underperform_posts` | `number` | ❌ | Jumlah underperforming posts |

> PostInsightsAccount menggunakan `.passthrough()` — field tambahan diizinkan.

### PostDetail

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `id` | `string` | ❌ | Post ID |
| `url` | `string` | ❌ | URL post |
| `shortcode` | `string` | ❌ | Instagram shortcode |
| `timestamp` | `string` | ❌ | Waktu publikasi |
| `published_at` | `string` | ❌ | Alias timestamp |
| `interactions` | `number` | ❌ | Total interaksi |
| `likes` | `number` | ❌ | Jumlah likes |
| `comments` | `number` | ❌ | Jumlah komentar |
| `type` | `string` | ❌ | Tipe post |
| `caption` | `string` | ❌ | Caption lengkap |
| `caption_snippet` | `string` | ❌ | Potongan caption |
| `post_er` | `number` | ❌ | ER per post |
| `performance_label` | `string` | ❌ | Label performa |

> PostDetail menggunakan `.passthrough()` — field tambahan diizinkan.

---

## Presentation Report

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `presentation_report.executiveSummary` | `object` | ✅ | Ringkasan eksekutif |
| `presentation_report.executiveSummary.kpis` | `KpiEntry[]` | ✅ | Array of KPI entries |
| `presentation_report.executiveSummary.bullets` | `string[]` | ✅ | Bullet points ringkasan |

### KpiEntry

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `key` | `string` | ✅ | Identifier KPI |
| `label` | `string` | ✅ | Display label |
| `account` | `string \| null` | ✅ | Account terkait (nullable) |
| `value` | `string` | ✅ | Nilai KPI (formatted string) |

---

## Meta

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `meta.brand_account` | `string \| null` | ❌ | Akun brand utama |
| `meta.history_days` | `number` | ❌ | Jumlah hari history yang disimpan |

---

## Version Support

| Version | Status | Notes |
|---------|--------|-------|
| 2 | ✅ Active | Current production schema |

Payload dengan `version` di luar `SUPPORTED_VERSIONS` akan ditolak oleh parser dengan error:
```
Unsupported version. Supported versions: 2
```

---

## Validation Behavior

- **Valid payload:** `parsePayload()` returns `{ success: true, data: DashboardApi }`
- **Invalid payload:** `parsePayload()` returns `{ success: false, errors: ValidationError[] }`
- Setiap `ValidationError` berisi:
  - `path`: dot-path notation (e.g. `"content_breakdown.metmalbekasi.carousel"`)
  - `message`: human-readable reason
  - `code`: machine-readable error code (e.g. `"unrecognized_keys"`, `"invalid_type"`)

---

## Source Mapping

| Source | Fields |
|--------|--------|
| SocialBlade | `followers`, `following`, `posts`, `growth.*` |
| Apify | `avg_likes`, `avg_comments`, `engagement_rate`, `content_breakdown.*`, `post_insights.*` |
