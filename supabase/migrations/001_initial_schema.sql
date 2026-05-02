-- Instagram Collector: Supabase Schema Migration
-- Replaces Google Sheets (Follower History, Engagement, Content Breakdown)

-- 1. ACCOUNTS
CREATE TABLE IF NOT EXISTS accounts (
  username    TEXT PRIMARY KEY,
  followers   INTEGER DEFAULT 0,
  enabled     BOOLEAN DEFAULT TRUE,
  verified    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FOLLOWER HISTORY (normalized from wide-format sheet)
CREATE TABLE IF NOT EXISTS follower_history (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date        DATE NOT NULL,
  username    TEXT NOT NULL REFERENCES accounts(username) ON DELETE CASCADE,
  followers   INTEGER,
  following   INTEGER,
  posts       INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, username)
);

CREATE INDEX IF NOT EXISTS idx_follower_history_date ON follower_history(date DESC);
CREATE INDEX IF NOT EXISTS idx_follower_history_username ON follower_history(username);

-- 3. ENGAGEMENT
CREATE TABLE IF NOT EXISTS engagement (
  id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date                  DATE NOT NULL,
  username              TEXT NOT NULL REFERENCES accounts(username) ON DELETE CASCADE,
  posts_analyzed        INTEGER,
  avg_likes             NUMERIC(10,2),
  avg_comments          NUMERIC(10,2),
  engagement_rate       NUMERIC(10,4),
  total_likes_last12    INTEGER,
  total_comments_last12 INTEGER,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, username)
);

CREATE INDEX IF NOT EXISTS idx_engagement_date ON engagement(date DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_username ON engagement(username);

-- 4. CONTENT BREAKDOWN
CREATE TABLE IF NOT EXISTS content_breakdown (
  id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date                    DATE NOT NULL,
  username                TEXT NOT NULL REFERENCES accounts(username) ON DELETE CASCADE,
  reels                   INTEGER DEFAULT 0,
  carousel                INTEGER DEFAULT 0,
  image                   INTEGER DEFAULT 0,
  video                   INTEGER DEFAULT 0,
  total_posts_analyzed    INTEGER DEFAULT 0,
  avg_likes               NUMERIC(10,2),
  avg_comments            NUMERIC(10,2),
  engagement_rate         NUMERIC(10,4),
  reels_avg_likes         NUMERIC(10,2),
  reels_avg_comments      NUMERIC(10,2),
  reels_er                NUMERIC(10,4),
  carousel_avg_likes      NUMERIC(10,2),
  carousel_avg_comments   NUMERIC(10,2),
  carousel_er             NUMERIC(10,4),
  image_avg_likes         NUMERIC(10,2),
  image_avg_comments      NUMERIC(10,2),
  image_er                NUMERIC(10,4),
  best_post_url           TEXT,
  best_post_type          TEXT,
  best_post_likes         INTEGER,
  best_post_comments      INTEGER,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, username)
);

CREATE INDEX IF NOT EXISTS idx_content_breakdown_date ON content_breakdown(date DESC);
CREATE INDEX IF NOT EXISTS idx_content_breakdown_username ON content_breakdown(username);

-- 5. POST INSIGHTS
CREATE TABLE IF NOT EXISTS post_insights (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date              DATE NOT NULL,
  username          TEXT NOT NULL REFERENCES accounts(username) ON DELETE CASCADE,
  shortcode         TEXT,
  url               TEXT,
  post_type         TEXT,
  likes             INTEGER DEFAULT 0,
  comments          INTEGER DEFAULT 0,
  interactions      INTEGER DEFAULT 0,
  published_at      TIMESTAMPTZ,
  caption_snippet   TEXT,
  post_er           NUMERIC(10,4),
  performance_label TEXT DEFAULT 'normal',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, username, shortcode)
);

CREATE INDEX IF NOT EXISTS idx_post_insights_date ON post_insights(date DESC);
CREATE INDEX IF NOT EXISTS idx_post_insights_username ON post_insights(username);

-- 6. DASHBOARD CACHE
CREATE TABLE IF NOT EXISTS dashboard_cache (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload       JSONB NOT NULL,
  version       INTEGER DEFAULT 2,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_cache_generated_at ON dashboard_cache(generated_at DESC);

-- RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE follower_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_cache ENABLE ROW LEVEL SECURITY;

-- Anon read
CREATE POLICY "anon_read_accounts" ON accounts FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_follower_history" ON follower_history FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_engagement" ON engagement FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_content_breakdown" ON content_breakdown FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_post_insights" ON post_insights FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_dashboard_cache" ON dashboard_cache FOR SELECT TO anon USING (true);

-- Service role full access
CREATE POLICY "service_role_all_accounts" ON accounts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_follower_history" ON follower_history FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_engagement" ON engagement FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_content_breakdown" ON content_breakdown FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_post_insights" ON post_insights FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_dashboard_cache" ON dashboard_cache FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Helper: get latest dashboard
CREATE OR REPLACE FUNCTION get_latest_dashboard()
RETURNS JSONB LANGUAGE SQL STABLE AS $$
  SELECT payload FROM dashboard_cache ORDER BY generated_at DESC LIMIT 1;
$$;

-- Auto-update updated_at on accounts
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed accounts
INSERT INTO accounts (username, followers, enabled) VALUES
  ('metmalbekasi', 93505, true),
  ('grandmetropolitan', 92455, true),
  ('metmalcileungsi', 83251, true),
  ('summareconmal.bekasi', 332974, true),
  ('pakuwonmallbekasi', 72247, true)
ON CONFLICT (username) DO UPDATE SET
  followers = EXCLUDED.followers,
  enabled = EXCLUDED.enabled,
  updated_at = NOW();
