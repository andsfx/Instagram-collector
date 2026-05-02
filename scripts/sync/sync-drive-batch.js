const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const DEFAULT_DRIVE_SOURCE = {
  processedId: "1IwxLYhOwmuNQShlddq8ITK7uo3y7ZQ4g",
  mergedId: "1M3t1nVS3clq0vOcFOUsDa0ndcwPeEOOZ",
  metricsId: "1ZcxFkyxjvhOkyewhk2xKzQWwGJmJCx0i"
};

function safeReadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function normalizeCell(value) {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (["None", "null", "undefined"].includes(s)) return "";
  return s;
}

function runCmd(bin, args, options = {}) {
  return execFileSync(bin, args, {
    cwd: options.cwd,
    env: { ...process.env, ...(options.env || {}) },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function getGogBin() {
  if (process.env.GOG_BIN) return process.env.GOG_BIN;
  return process.platform === "win32" ? "gog" : "/home/ubuntu/.local/bin/gog";
}

function runGog(args) {
  const gogBin = getGogBin();
  const env = { ...process.env };
  if (!env.GOG_ACCOUNT) env.GOG_ACCOUNT = "andysafii9@gmail.com";
  return runCmd(gogBin, args, { env });
}

function driveList(parentId) {
  const out = runGog([
    "drive",
    "ls",
    "--parent",
    parentId,
    "--json",
    "--results-only",
    "--no-input"
  ]);
  return JSON.parse(out || "[]");
}

function driveDownload(fileId, outPath) {
  ensureDir(path.dirname(outPath));
  runGog([
    "drive",
    "download",
    fileId,
    "--out",
    outPath,
    "--no-input"
  ]);
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
  return JSON.parse(output || "[]");
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
  const endCol = String.fromCharCode(64 + expectedHeaders.length);
  const rows = getExistingRows(spreadsheetId, `${tabName}!A1:${endCol}1`);
  const header = rows[0] || [];
  if (!rowsEqual(header, expectedHeaders)) {
    updateRowJson(spreadsheetId, `${tabName}!A1:${endCol}1`, expectedHeaders);
  }
}

function upsertByDateUsername(spreadsheetId, tabName, width, row) {
  const endCol = String.fromCharCode(64 + width);
  const rows = getExistingRows(spreadsheetId, `${tabName}!A2:${endCol}`);
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

function buildAccountMap(mergedFiles, metricsFiles) {
  const map = new Map();

  for (const f of mergedFiles) {
    if (!f.name.endsWith('.json')) continue;
    const username = f.name.replace(/\.json$/i, '');
    if (!map.has(username)) map.set(username, {});
    map.get(username).merged = f;
  }

  for (const f of metricsFiles) {
    const m = f.name.match(/^(.*)-metrics\.json$/i);
    if (!m) continue;
    const username = m[1];
    if (!map.has(username)) map.set(username, {});
    map.get(username).metrics = f;
  }

  return map;
}

function validateMergedAndMetrics(merged, metrics) {
  const issues = [];
  if (!merged || typeof merged !== 'object') issues.push('merged json invalid');
  if (!metrics || typeof metrics !== 'object') issues.push('metrics json invalid');
  if (issues.length) return issues;
  if (!merged.date) issues.push('merged.date missing');
  if (!merged.username) issues.push('merged.username missing');
  for (const key of ['posts_analyzed', 'avg_likes', 'avg_comments', 'engagement_rate']) {
    if (metrics[key] === undefined || metrics[key] === null) issues.push(`metrics.${key} missing`);
  }
  return issues;
}

function buildEngagementRow(merged, metrics) {
  return [
    merged.date,
    merged.username,
    metrics.posts_analyzed,
    metrics.avg_likes,
    metrics.avg_comments,
    metrics.engagement_rate,
    metrics.total_likes ?? metrics.engagement?.total_likes_last12,
    metrics.total_comments ?? metrics.engagement?.total_comments_last12
  ].map(normalizeCell);
}

function buildContentBreakdownRow(merged, metrics) {
  const cb = metrics.content_breakdown || {};
  return [
    merged.date,
    merged.username,
    cb.reels,
    cb.carousel,
    cb.image,
    cb.video,
    cb.total_posts_analyzed ?? metrics.posts_analyzed,
    cb.avg_likes ?? metrics.avg_likes,
    cb.avg_comments ?? metrics.avg_comments,
    cb.engagement_rate ?? metrics.engagement_rate,
    cb.reels_avg_likes,
    cb.reels_avg_comments,
    cb.reels_er,
    cb.carousel_avg_likes,
    cb.carousel_avg_comments,
    cb.carousel_er,
    cb.image_avg_likes,
    cb.image_avg_comments,
    cb.image_er,
    cb.best_post_url,
    cb.best_post_type,
    cb.best_post_likes,
    cb.best_post_comments
  ].map(normalizeCell);
}

function loadRepoConfig(repoRoot) {
  const sheets = safeReadJson(path.join(repoRoot, 'config', 'sheets.json'));
  if (!sheets?.spreadsheetId) throw new Error('Missing config/sheets.json or spreadsheetId');
  return sheets;
}

function processAccount(repoRoot, sheets, username, files) {
  const incomingBase = path.join(repoRoot, 'incoming', 'instagram-tracker', 'processed');
  const mergedPath = path.join(incomingBase, 'merged', `${username}.json`);
  const metricsPath = path.join(incomingBase, 'metrics', `${username}-metrics.json`);

  driveDownload(files.merged.id, mergedPath);
  driveDownload(files.metrics.id, metricsPath);

  const merged = safeReadJson(mergedPath);
  const metrics = safeReadJson(metricsPath);
  const issues = validateMergedAndMetrics(merged, metrics);
  if (issues.length) {
    return { username, status: 'skipped', reason: issues.join('; ') };
  }

  const ENGAGEMENT_HEADERS = [
    'Tanggal','Akun','Posts_Analyzed','Avg_Likes','Avg_Comments','Engagement_Rate','Total_Likes_Last12','Total_Comments_Last12'
  ];
  const CONTENT_BREAKDOWN_HEADERS = [
    'Tanggal','Akun','Reels','Carousel','Image','Video','Total_Posts_Analyzed','Avg_Likes','Avg_Comments','Engagement_Rate','Reels_AvgLikes','Reels_AvgComments','Reels_ER','Carousel_AvgLikes','Carousel_AvgComments','Carousel_ER','Image_AvgLikes','Image_AvgComments','Image_ER','BestPost_URL','BestPost_Type','BestPost_Likes','BestPost_Comments'
  ];

  ensureHeader(sheets.spreadsheetId, sheets.tabs.engagement || 'Engagement', ENGAGEMENT_HEADERS);
  ensureHeader(sheets.spreadsheetId, sheets.tabs.contentBreakdown || 'Content Breakdown', CONTENT_BREAKDOWN_HEADERS);

  const engagement = upsertByDateUsername(
    sheets.spreadsheetId,
    sheets.tabs.engagement || 'Engagement',
    ENGAGEMENT_HEADERS.length,
    buildEngagementRow(merged, metrics)
  );
  const contentBreakdown = upsertByDateUsername(
    sheets.spreadsheetId,
    sheets.tabs.contentBreakdown || 'Content Breakdown',
    CONTENT_BREAKDOWN_HEADERS.length,
    buildContentBreakdownRow(merged, metrics)
  );

  return { username, status: 'processed', engagement, contentBreakdown };
}

function main() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const sheets = loadRepoConfig(repoRoot);
  const source = DEFAULT_DRIVE_SOURCE;

  const mergedFiles = driveList(source.mergedId);
  const metricsFiles = driveList(source.metricsId);
  const accountMap = buildAccountMap(mergedFiles, metricsFiles);

  const usernames = Array.from(accountMap.keys()).sort();
  const summary = { processed: 0, skipped: 0, errors: 0, accounts: [] };

  for (const username of usernames) {
    const files = accountMap.get(username);
    if (!files?.merged || !files?.metrics) {
      summary.skipped += 1;
      summary.accounts.push({ username, status: 'skipped', reason: 'merged or metrics file missing in Drive source' });
      continue;
    }

    try {
      const result = processAccount(repoRoot, sheets, username, files);
      if (result.status === 'processed') summary.processed += 1;
      else summary.skipped += 1;
      summary.accounts.push(result);
    } catch (error) {
      summary.errors += 1;
      summary.accounts.push({ username, status: 'error', reason: error.message });
    }
  }

  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.errors > 0 ? 2 : 0);
}

main();
