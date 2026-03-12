const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

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

function upsertFollowerHistory(spreadsheetId, tabName, merged) {
  const dataRange = `${tabName}!A:I`;
  const rows = getExistingRows(spreadsheetId, dataRange);
  const keyDate = merged.date ?? "";
  const keyUsername = merged.username ?? "";
  const row = toSheetRow(merged);

  let matchedIndex = -1;
  for (let i = 0; i < rows.length; i += 1) {
    const current = rows[i] || [];
    if ((current[0] ?? "") === keyDate && (current[1] ?? "") === keyUsername) {
      matchedIndex = i + 1;
      break;
    }
  }

  if (matchedIndex === -1) {
    appendRow(spreadsheetId, `${tabName}!A:I`, row);
    console.log(`Appended ${keyUsername} on ${keyDate} to ${tabName}`);
    return;
  }

  updateRow(spreadsheetId, `${tabName}!A${matchedIndex}:I${matchedIndex}`, row);
  console.log(`Updated ${keyUsername} on ${keyDate} at row ${matchedIndex}`);
}

function main() {
  const username = process.argv[2];
  if (!username) {
    console.error("Usage: node scripts/sync/update-google-sheet.js <username>");
    process.exit(1);
  }

  const repoRoot = path.resolve(__dirname, "..", "..");
  const { sheets } = loadConfig(repoRoot);
  const mergedPath = path.join(repoRoot, "data", "processed", "merged", `${username}.json`);
  const merged = safeReadJson(mergedPath);

  if (!merged) {
    throw new Error(`Merged dataset not found: ${mergedPath}`);
  }

  upsertFollowerHistory(
    sheets.spreadsheetId,
    sheets.tabs.followerHistory || "Follower History",
    merged
  );
}

main();
