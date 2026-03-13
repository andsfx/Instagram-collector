# Dashboard Data Schema

Schema ini dipakai untuk `dashboard/data.json` pada workflow hybrid final.

## Purpose

File ini menjadi source tunggal untuk dashboard statis.

Data di dalamnya dibangun dari:
- **SocialBlade + Scrapling** untuk account-level stats
- **Apify** untuk engagement + content breakdown

## Top-level shape

```json
{
  "generated_at": "2026-03-13T08:00:00Z",
  "generated_at_wib": "2026-03-13T15:00:00+07:00",
  "version": 2,
  "sources": {
    "stats": "socialblade",
    "engagement": "apify"
  },
  "accounts": [],
  "latest": {},
  "history": [],
  "growth": {},
  "rankings": {},
  "content_breakdown": {},
  "meta": {}
}
```

## Fields

### `generated_at`
UTC timestamp for file generation.

### `generated_at_wib`
Human-friendly WIB timestamp.

### `version`
Schema version. Current recommended value: `2`.

### `sources`
Declares the canonical source for each metric domain.

```json
{
  "stats": "socialblade",
  "engagement": "apify"
}
```

### `accounts`
Ordered list of account usernames included in the dashboard.

### `latest`
Latest snapshot keyed by username.

Example:

```json
{
  "date": "2026-03-13",
  "metmalbekasi": {
    "followers": 93531,
    "following": 265,
    "posts": 16474,
    "avg_likes": 47.67,
    "avg_comments": 1.92,
    "engagement_rate": 0.05,
    "ff_ratio": 352.95,
    "verified": true,
    "sources": {
      "stats": "socialblade",
      "engagement": "apify"
    }
  }
}
```

### `history`
Date-keyed time series. One object per day.

Example:

```json
{
  "date": "2026-03-13",
  "metmalbekasi": {
    "followers": 93531,
    "following": 265,
    "posts": 16474,
    "avg_likes": 47.67,
    "avg_comments": 1.92,
    "engagement_rate": 0.05,
    "anomaly": false
  }
}
```

### `growth`
Per-account follower growth summary.

Example:

```json
{
  "metmalbekasi": {
    "followers_change_1d": 44,
    "followers_change_7d": 175,
    "pct_change_7d": 0.19,
    "anomaly_detected": false,
    "notes": []
  }
}
```

### `rankings`
Latest rankings derived from `latest`.

Expected lists:
- `by_followers`
- `by_engagement_rate`
- `by_avg_likes`

### `content_breakdown`
Detailed post-type breakdown keyed by username.

Expected fields:
- reels
- carousel
- image
- video
- total_posts_analyzed
- avg_likes
- avg_comments
- engagement_rate
- per-type averages
- best post fields

### `meta`
Dashboard metadata, for example:

```json
{
  "brand_account": "metmalbekasi",
  "history_days": 30
}
```

## Source mapping

### SocialBlade
Used for:
- followers
- following
- posts

### Apify
Used for:
- avg_likes
- avg_comments
- engagement_rate
- content breakdown
- best post

## Important rules

1. `Follower History` is the source for account-level history.
2. `Engagement` and `Content Breakdown` are the source for post-level metrics.
3. Rankings must be computed from latest valid data, not hardcoded.
4. Anomalies should be flagged in `history` and considered in growth calculations.
