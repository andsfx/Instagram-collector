const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadConfig(repoRoot) {
  return {
    accounts: readJson(path.join(repoRoot, 'config', 'accounts.json')),
    sheets: readJson(path.join(repoRoot, 'config', 'sheets.json')),
  };
}

function gogBin() {
  if (process.env.GOG_BIN) return process.env.GOG_BIN;
  return process.platform === 'win32' ? 'gog' : '/home/ubuntu/.local/bin/gog';
}

function runGog(args) {
  const env = { ...process.env };
  if (!env.GOG_ACCOUNT) env.GOG_ACCOUNT = 'andysafii9@gmail.com';
  return execFileSync(gogBin(), args, {
    env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

function getRows(spreadsheetId, range) {
  const out = runGog(['sheets', 'get', spreadsheetId, range, '--json', '--results-only', '--no-input']);
  return JSON.parse(out || '[]');
}

function updateValues(spreadsheetId, range, values) {
  runGog(['sheets', 'update', spreadsheetId, range, '--values-json', JSON.stringify(values), '--no-input']);
}

function buildWideRow(date, statsByUser, orderedUsers) {
  const row = [date];
  for (const u of orderedUsers) {
    const s = statsByUser[u] || {};
    row.push(s.followers ?? '', s.following ?? '', s.posts_count ?? '');
  }
  return row.map((v) => (v == null ? '' : String(v)));
}

function main() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const { accounts, sheets } = loadConfig(repoRoot);
  const statsDir = path.join(repoRoot, 'data', 'raw', 'stats');
  const orderedUsers = accounts.filter((a) => a.enabled).map((a) => a.username);
  const statsByUser = {};
  let date = null;

  for (const username of orderedUsers) {
    const p = path.join(statsDir, `${username}-stats.json`);
    if (!fs.existsSync(p)) continue;
    const obj = readJson(p);
    statsByUser[username] = obj;
    if (!date && obj.date) date = obj.date;
  }

  if (!date) throw new Error('No stats files found in data/raw/stats');

  const spreadsheetId = sheets.spreadsheetId;
  const tab = (sheets.tabs && sheets.tabs.followerHistory) || 'Follower History';
  const header = ['Tanggal'];
  for (const u of orderedUsers) {
    header.push(`${u}_followers`, `${u}_following`, `${u}_posts`);
  }
  const row = buildWideRow(date, statsByUser, orderedUsers);

  const rows = getRows(spreadsheetId, `${tab}!A1:ZZ`);
  if (!rows.length) {
    updateValues(spreadsheetId, `${tab}!A1:${String.fromCharCode(64 + header.length)}2`, [header, row]);
    console.log(JSON.stringify({ action: 'initialize', date }, null, 2));
    return;
  }

  updateValues(spreadsheetId, `${tab}!A1:${String.fromCharCode(64 + header.length)}1`, [header]);

  let matched = -1;
  for (let i = 1; i < rows.length; i += 1) {
    if ((rows[i][0] || '') === date) {
      matched = i + 1;
      break;
    }
  }

  const lastCol = String.fromCharCode(64 + header.length);
  if (matched === -1) {
    const targetRow = rows.length + 1;
    updateValues(spreadsheetId, `${tab}!A${targetRow}:${lastCol}${targetRow}`, [row]);
    console.log(JSON.stringify({ action: 'append', date, row: targetRow }, null, 2));
  } else {
    updateValues(spreadsheetId, `${tab}!A${matched}:${lastCol}${matched}`, [row]);
    console.log(JSON.stringify({ action: 'update', date, row: matched }, null, 2));
  }
}

main();
