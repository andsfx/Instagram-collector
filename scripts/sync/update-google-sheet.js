const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ENGAGEMENT_HEADERS = [
  "Tanggal",
  "Akun",
  "Posts_Analyzed",
  "Avg_Likes",
  "Avg_Comments",
  "Engagement_Rate",
  "Total_Likes_Last12",
  "Total_Comments_Last12"
];

const CONTENT_BREAKDOWN_HEADERS = [
  "Tanggal",
  "Akun",
  "Reels",
  "Carousel",
  "Image",
  "Video",
  "Total_Posts_Analyzed",
  "Avg_Likes",
  "Avg_Comments",
  "Engagement_Rate",
  "Reels_AvgLikes",
  "Reels_AvgComments",
  "Reels_ER",
  "Carousel_AvgLikes",
  "Carousel_AvgComments",
  "Carousel_ER",
  "Image_AvgLikes",
  "Image_AvgComments",
  "Image_ER",
  "BestPost_URL",
  "BestPost_Type",
  "BestPost_Likes",
  "BestPost_Comments"
];

function safeReadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadConfig(repoRoot) {
  const sheets = safeReadJson(path.join(repoRoot, "config", "sheets.json"));
  const accounts = safeReadJson(path.join(repoRoot, "config", "accounts.json")) || [];
  if (!sheets?.spreadsheetId) {
    throw new Error("Missing config/sheets.json or spreadsheetId");
  }
  return { sheets, accounts };
}

function runGog(args, options = {}) {
  const env = { ...process.env };
  const platformBin = process.platform === "win32" ? "gog" : "/root/.local/bin/gog";
  const gogBin = process.env.GOG_BIN || platformBin;
  if (!env.GOG_ACCOUNT) {
    if (!process.env.GOG_ACCOUNT) {
      throw new Error("GOG_ACCOUNT environment variable is required. Set it in .env or pass it directly.");
    }
    env.GOG_ACCOUNT = process.env.GOG_ACCOUNT;
  }
  return execFileSync(gogBin, args, {
    cwd: options.cwd,
    env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function getExistingRows(spreadsheetId, range) {
  const output = runGog([
    "sheets",
    "get",
    spreadsheetId,
    range,
    "--json",
    "--results-only",
    "--no-input"
  ]);
  const parsed = JSON.parse(output || "[]");
  return Array.isArray(parsed) ? parsed : [];
}

function updateRowJson(spreadsheetId, range, row) {
  runGog([
    "sheets",
    "update",
    spreadsheetId,
    range,
    "--values-json",
    JSON.stringify([row]),
    "--no-input"
  ]);
}

function appendRowJson(spreadsheetId, range, row) {
  runGog([
    "sheets",
    "append",
    spreadsheetId,
    range,
    "--values-json",
    JSON.stringify([row]),
    "--no-input"
  ]);
}

function rowsEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (String(a[i] ?? "") !== String(b[i] ?? "")) return false;
  }
  return true;
}

function ensureHeader(spreadsheetId, tabName, expectedHeaders) {
  const lastCol = String.fromCharCode(64 + expectedHeaders.length);
  const rows = getExistingRows(spreadsheetId, `${tabName}!A1:${lastCol}1`);
  const header = rows[0] || [];
  if (rowsEqual(header, expectedHeaders)) return { changed: false };
  updateRowJson(spreadsheetId, `${tabName}!A1:${lastCol}1`, expectedHeaders);
  return { changed: true };
}

function isMergedDataUsable(merged, metrics) {
  if (!merged || typeof merged !== "object") return false;
  if (!merged.username || !merged.date) return false;
  if (!metrics || typeof metrics !== "object") return false;
  return true;
}

function buildEngagementRow(merged, metrics) {
  return [
    merged.date ?? "",
    merged.username ?? "",
    metrics.posts_analyzed ?? merged.metrics?.analyzed_posts ?? "",
    metrics.avg_likes ?? merged.metrics?.avg_likes ?? "",
    metrics.avg_comments ?? merged.metrics?.avg_comments ?? "",
    metrics.engagement_rate ?? merged.metrics?.engagement_rate ?? "",
    metrics.total_likes ?? metrics.engagement?.total_likes_last12 ?? merged.metrics?.total_likes ?? "",
    metrics.total_comments ?? metrics.engagement?.total_comments_last12 ?? merged.metrics?.total_comments ?? ""
  ].map((v) => (v == null ? "" : String(v)));
}

function buildContentBreakdownRow(merged, metrics) {
  const cb = metrics.content_breakdown || {};
  return [
    merged.date ?? "",
    merged.username ?? "",
    cb.reels ?? "",
    cb.carousel ?? "",
    cb.image ?? "",
    cb.video ?? "",
    cb.total_posts_analyzed ?? metrics.posts_analyzed ?? "",
    cb.avg_likes ?? metrics.avg_likes ?? "",
    cb.avg_comments ?? metrics.avg_comments ?? "",
    cb.engagement_rate ?? metrics.engagement_rate ?? "",
    cb.reels_avg_likes ?? "",
    cb.reels_avg_comments ?? "",
    cb.reels_er ?? "",
    cb.carousel_avg_likes ?? "",
    cb.carousel_avg_comments ?? "",
    cb.carousel_er ?? "",
    cb.image_avg_likes ?? "",
    cb.image_avg_comments ?? "",
    cb.image_er ?? "",
    cb.best_post_url ?? "",
    cb.best_post_type ?? "",
    cb.best_post_likes ?? "",
    cb.best_post_comments ?? ""
  ].map((v) => (v == null ? "" : String(v)));
}

/**
 * Upsert a row by date+username.
 * Accepts an optional pre-fetched `existingRows` array to avoid re-fetching
 * all rows for every account (N+1 problem).
 */
function upsertByDateUsername(spreadsheetId, tabName, width, row, existingRows) {
  const endCol = String.fromCharCode(64 + width);
  const rows = existingRows ?? getExistingRows(spreadsheetId, `${tabName}!A2:${endCol}`);
  const keyDate = row[0] ?? "";
  const keyUsername = row[1] ?? "";
  let matchedIndex = -1;
  for (let i = 0; i < rows.length; i += 1) {
    const current = rows[i] || [];
    if ((current[0] ?? "") === keyDate && (current[1] ?? "") === keyUsername) {
      matchedIndex = i + 2;
      break;
    }
  }
  if (matchedIndex === -1) {
    appendRowJson(spreadsheetId, `${tabName}!A:${endCol}`, row);
    return { action: "append", row: null };
  }
  updateRowJson(spreadsheetId, `${tabName}!A${matchedIndex}:${endCol}${matchedIndex}`, row);
  return { action: "update", row: matchedIndex };
}

/**
 * Process a single account. Accepts optional pre-fetched sheet rows to avoid
 * redundant full-sheet reads when processing multiple accounts.
 */
function processOne(repoRoot, sheets, username, cachedRows) {
  const mergedPath = path.join(repoRoot, "data", "processed", "merged", `${username}.json`);
  const metricsPath = path.join(repoRoot, "data", "processed", "metrics", `${username}-metrics.json`);
  const merged = safeReadJson(mergedPath);
  const metrics = safeReadJson(metricsPath);

  if (!merged || !metrics) {
    return { username, ok: false, skipped: true, reason: "Merged or metrics file missing" };
  }
  if (!isMergedDataUsable(merged, metrics)) {
    return { username, ok: false, skipped: true, reason: "Merged/metrics data not usable" };
  }

  const engagementTab = sheets.tabs.engagement || "Engagement";
  const contentTab = sheets.tabs.contentBreakdown || "Content Breakdown";

  ensureHeader(sheets.spreadsheetId, engagementTab, ENGAGEMENT_HEADERS);
  ensureHeader(sheets.spreadsheetId, contentTab, CONTENT_BREAKDOWN_HEADERS);

  const engagementResult = upsertByDateUsername(
    sheets.spreadsheetId,
    engagementTab,
    ENGAGEMENT_HEADERS.length,
    buildEngagementRow(merged, metrics),
    cachedRows?.engagement
  );

  const contentResult = upsertByDateUsername(
    sheets.spreadsheetId,
    contentTab,
    CONTENT_BREAKDOWN_HEADERS.length,
    buildContentBreakdownRow(merged, metrics),
    cachedRows?.content
  );

  return {
    username,
    ok: true,
    skipped: false,
    engagement: engagementResult,
    contentBreakdown: contentResult
  };
}

function main() {
  const repoRoot = path.resolve(__dirname, "..", "..");
  const { sheets, accounts } = loadConfig(repoRoot);
  const arg = process.argv[2];

  if (!arg) {
    console.error("Usage: node scripts/sync/update-google-sheet.js <username|--all>");
    process.exit(1);
  }

  if (arg === "--all") {
    const enabled = accounts.filter((a) => a.enabled).map((a) => a.username);

    // Pre-fetch all rows once to avoid N+1 reads
    const engagementTab = sheets.tabs.engagement || "Engagement";
    const contentTab = sheets.tabs.contentBreakdown || "Content Breakdown";
    const engEndCol = String.fromCharCode(64 + ENGAGEMENT_HEADERS.length);
    const cbEndCol = String.fromCharCode(64 + CONTENT_BREAKDOWN_HEADERS.length);
    const cachedRows = {
      engagement: getExistingRows(sheets.spreadsheetId, `${engagementTab}!A2:${engEndCol}`),
      content: getExistingRows(sheets.spreadsheetId, `${contentTab}!A2:${cbEndCol}`),
    };

    const results = enabled.map((username) => processOne(repoRoot, sheets, username, cachedRows));
    console.log(JSON.stringify(results, null, 2));
    const hasFailure = results.some((r) => !r.ok && !r.skipped);
    process.exit(hasFailure ? 2 : 0);
  }

  const result = processOne(repoRoot, sheets, arg, null);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 2);
}

main();
