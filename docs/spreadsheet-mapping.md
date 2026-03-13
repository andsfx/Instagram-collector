# Spreadsheet Mapping

## Current source mapping

### `Follower History`
Source:
- **SocialBlade + Scrapling**

Fields written:
- followers
- following
- posts_count

Format:
- wide table
- one row per date
- account-specific columns

### `Engagement`
Source:
- **Apify**

Fields written:
- `Tanggal`
- `Akun`
- `Posts_Analyzed`
- `Avg_Likes`
- `Avg_Comments`
- `Engagement_Rate`
- `Total_Likes_Last12`
- `Total_Comments_Last12`

### `Content Breakdown`
Source:
- **Apify**

Fields written:
- `Tanggal`
- `Akun`
- `Reels`
- `Carousel`
- `Image`
- `Video`
- `Total_Posts_Analyzed`
- `Avg_Likes`
- `Avg_Comments`
- `Engagement_Rate`
- per-type averages
- best post info

## Important rule

Do **not** write post-level metrics to `Follower History`.

`Follower History` is only for account-level stats from SocialBlade.
