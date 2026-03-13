# Hybrid Final Flow

## Sources

### SocialBlade + Scrapling
Dipakai untuk:
- followers
- following
- posts_count

Target sheet:
- `Follower History`

### Apify
Dipakai untuk:
- 12 latest posts
- likes
- comments
- media type
- permalink
- timestamp

Target sheets:
- `Engagement`
- `Content Breakdown`

## Scripts

### SocialBlade side
- `scripts/socialblade/collect-socialblade-stats.py`
- `scripts/socialblade/update-follower-history.js`

### Apify side
- `scripts/apify/run-apify-batch.js`
- `scripts/apify/transform-apify-posts.js`
- `scripts/sync/update-google-sheet.js`

## Daily sequence

1. Collect SocialBlade stats for all accounts
2. Update `Follower History`
3. Run Apify batch for all accounts
4. Transform Apify datasets to local metrics/merged files
5. Upsert `Engagement`
6. Upsert `Content Breakdown`
