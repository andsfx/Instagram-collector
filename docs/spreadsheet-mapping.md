# Spreadsheet Mapping

## Target Spreadsheet

- **Spreadsheet Name:** Instagram Follower Database
- **Spreadsheet ID:** `1MdTlen1rcq1ZplbTwfHzj-kHFBoQufgahzRAxZPqt7U`
- **Primary Tab:** `Follower History`

## Current Sync Strategy

Saat ini pipeline menulis ke tab:
- `Follower History`

Mode update yang dipakai:
- **upsert by `Date + Username`**

Artinya:
- jika kombinasi `Date` dan `Username` sudah ada, row akan di-update
- jika belum ada, row baru akan di-append

## Source Files Used

Updater membaca file merged final dari:

```text
data/processed/merged/<username>.json
```

Contoh:

```text
data/processed/merged/grandmetropolitan.json
```

## Merged JSON Structure

Contoh struktur merged file:

```json
{
  "date": "2026-03-13",
  "username": "grandmetropolitan",
  "profile": {
    "followers": 92455,
    "following": 12,
    "posts_count": 1842
  },
  "metrics": {
    "analyzed_posts": 12,
    "total_likes": 1683,
    "total_comments": 39,
    "avg_likes": 140.25,
    "avg_comments": 3.25,
    "engagement_rate": 0.16
  },
  "sources": {
    "profile_stats": "scrapling",
    "post_metrics": "json"
  }
}
```

## Current Follower History Column Mapping

Updater saat ini menulis 9 kolom:

| Sheet Column | Value Source |
|---|---|
| A | `date` |
| B | `username` |
| C | `profile.followers` |
| D | `profile.following` |
| E | `profile.posts_count` |
| F | `metrics.analyzed_posts` |
| G | `metrics.avg_likes` |
| H | `metrics.avg_comments` |
| I | `metrics.engagement_rate` |

## Header Row Expected

Header yang direkomendasikan untuk `Follower History`:

```text
Date | Username | Followers | Following | Posts | Analyzed Posts | Avg Likes | Avg Comments | Engagement Rate
```

## Notes About Data Quality

### Profile stats source
Didapat dari Scrapling:
- followers
- following
- posts_count

### Metrics source
Didapat dari JSON post-level:
- analyzed_posts
- avg_likes
- avg_comments
- engagement_rate

## Recommended Future Expansion

Kalau nanti mau memperluas sync, field berikut bisa ditambahkan:
- `total_likes`
- `total_comments`
- `content type breakdown`
- `best_post_url`
- `best_post_type`
- `best_post_likes`
- `best_post_comments`

## Sync Safety Rules

Updater sebaiknya:
1. memastikan header sesuai
2. hanya sync jika merged file valid
3. skip akun jika field inti kosong total
4. log hasil append/update per akun
