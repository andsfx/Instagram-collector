const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const EXPECTED_HEADERS = [
  "Date",
  "Username",
  "Followers",
  "Following",
  "Posts",
  "Analyzed Posts",
  "Avg Likes",
  "Avg Comments",
  "Engagement Rate"
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

function toSheetRow(merged) {
  return [
    merged.date ?? "",
    merged.username ?? "",
    merged.profile?.followers ?? "",
    merged.profile?.following ?? "",
    merged.profile?.posts_count ?? "",
    merged.metrics?.analyzed_posts ?? "",
    merged.metrics?.avg_likes ?? "",
    merged.metrics?.avg_comments ?? "",
    merged.metrics?.engagement_rate ?? ""
  ];
}

function runGog(args, options = {}) {
  const gogBin = process.env.GOG_BIN || "/root/.local/bin/gog";
  const env = { ...process.env };
  if (!env.GOG_ACCOUNT) {
    env.GOG_ACCOUNT = "andysafii9@gmail.com";
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

function updateRow(spreadsheetId, range, row) {
  runGog([
    "sheets",
    "update",
    spreadsheetId,
    range,
    ...row.map((v) => String(v ?? "")),
    "--no-input"
  ]);
}

function appendRow(spreadsheetId, range, row) {
  runGog([
    "sheets",
    "append",
    spreadsheetId,
    range,
    ...row.map((v) => String(v ?? "")),
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

function ensureHeader(spreadsheetId, tabName) {
  const rows = getExistingRows(spreadsheetId, `${tabName}!A1:I1`);
  const header = rows[0] || [];
  const expected = EXPECTED_HEADERS;

  if (rowsEqual(header, expected)) {
    return { changed: false, headerOk: true };
  }

  updateRow(spreadsheetId, `${tabName}!A1:I1`, expected);
  return { changed: true, headerOk: true };
}

function isMergedDataUsable(merged) {
  if (!merged || typeof merged !== "object") return false;
  if (!merged.username || !merged.date) return false;

  const profile = merged.profile || {};
  const metrics = merged.metrics || {};

  const hasProfileValue = [profile.followers, profile.following, profile.posts_count].some(
    (v) => v !== null && v !== undefined && v !== ""
  );
  const hasMetricValue = [metrics.analyzed_posts, metrics.avg_likes, metrics.avg_comments, metrics.engagement_rate].some(
    (v) => v !== null && v !== undefined && v !== ""
  );

  return hasProfileValue || hasMetricValue;
}

function upsertFollowerHistory(spreadsheetId, tabName, merged) {
  ensureHeader(spreadsheetId, tabName);

  const dataRange = `${tabName}!A2:I`;
  const rows = getExistingRows(spreadsheetId, dataRange);
  const keyDate = merged.date ?? "";
  const keyUsername = merged.username ?? "";
  const row = toSheetRow(merged);

  let matchedIndex = -1;
  for (let i = 0; i < rows.length; i += 1) {
    const current = rows[i] || [];
    if ((current[0] ?? "") === keyDate && (current[1] ?? "") === keyUsername) {
      matchedIndex = i + 2;
      break;
    }
  }

  if (matchedIndex === -1) {
    appendRow(spreadsheetId, `${tabName}!A:I`, row);
    console.log(`Appended ${keyUsername} on ${keyDate} to ${tabName}`);
    return { action: "append", row: null };
  }

  updateRow(spreadsheetId, `${tabName}!A${matchedIndex}:I${matchedIndex}`, row);
  console.log(`Updated ${keyUsername} on ${keyDate} at row ${matchedIndex}`);
  return { action: "update", row: matchedIndex };
}

function processOne(repoRoot, sheets, username) {
  const mergedPath = path.join(repoRoot, "data", "processed", "merged", `${username}.json`);
  const merged = safeReadJson(mergedPath);

  if (!merged) {
    return { username, ok: false, skipped: true, reason: `Merged dataset not found: ${mergedPath}` };
  }

  if (!isMergedDataUsable(merged)) {
    return { username, ok: false, skipped: true, reason: "Merged dataset missing required usable values" };
  }

  const result = upsertFollowerHistory(
    sheets.spreadsheetId,
    sheets.tabs.followerHistory || "Follower History",
    merged
  );

  return { username, ok: true, skipped: false, ...result };
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
    const results = enabled.map((username) => processOne(repoRoot, sheets, username));
    console.log(JSON.stringify(results, null, 2));

    const hasFailure = results.some((r) => !r.ok && !r.skipped);
    process.exit(hasFailure ? 2 : 0);
  }

  const result = processOne(repoRoot, sheets, arg);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 2);
}

main();
