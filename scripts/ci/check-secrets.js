/**
 * Secret Leakage Check Script
 *
 * Scans build output and data files for leaked secrets:
 * - JWT tokens (eyJ... pattern)
 * - Apify API keys (apify_api_...)
 * - Supabase service role keys/URLs
 *
 * Exit 0 if clean, exit 1 if any matches found.
 *
 * Requirements: 5.6, 5.7, 5.9
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

// Patterns to detect secret leakage
const SECRET_PATTERNS = [
  {
    name: 'JWT Token',
    pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
  },
  {
    name: 'Apify API Key',
    pattern: /apify_api_[A-Za-z0-9]{20,}/g,
  },
  {
    name: 'Supabase Service Role Key',
    pattern: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
  },
  {
    name: 'Supabase Service Role URL Pattern',
    pattern: /service_role['":\s]*[A-Za-z0-9_-]{30,}/gi,
  },
];

// Files and directories to scan
const SCAN_TARGETS = [
  { path: path.join(ROOT, 'dashboard-react', 'dist'), type: 'directory' },
  { path: path.join(ROOT, 'dashboard', 'data.json'), type: 'file' },
  { path: path.join(ROOT, 'data', 'dashboard-snapshot.json'), type: 'file' },
];

/**
 * Recursively get all files in a directory
 */
function getFilesRecursive(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getFilesRecursive(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Scan a single file for secret patterns
 */
function scanFile(filePath) {
  const matches = [];

  if (!fs.existsSync(filePath)) return matches;

  // Skip binary files
  const ext = path.extname(filePath).toLowerCase();
  const binaryExts = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.svg'];
  if (binaryExts.includes(ext)) return matches;

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return matches;
  }

  for (const { name, pattern } of SECRET_PATTERNS) {
    // Reset regex lastIndex
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      matches.push({
        file: path.relative(ROOT, filePath),
        secret: name,
        snippet: match[0].substring(0, 40) + '...',
        position: match.index,
      });
    }
  }

  return matches;
}

function main() {
  console.log('🔍 Secret Leakage Check');
  console.log('========================\n');

  let allMatches = [];
  let scannedFiles = 0;

  for (const target of SCAN_TARGETS) {
    if (target.type === 'directory') {
      if (!fs.existsSync(target.path)) {
        console.log(`⚠️  Directory not found (skipping): ${path.relative(ROOT, target.path)}`);
        continue;
      }
      const files = getFilesRecursive(target.path);
      console.log(`📂 Scanning directory: ${path.relative(ROOT, target.path)} (${files.length} files)`);
      for (const file of files) {
        const matches = scanFile(file);
        allMatches.push(...matches);
        scannedFiles++;
      }
    } else {
      if (!fs.existsSync(target.path)) {
        console.log(`⚠️  File not found (skipping): ${path.relative(ROOT, target.path)}`);
        continue;
      }
      console.log(`📄 Scanning file: ${path.relative(ROOT, target.path)}`);
      const matches = scanFile(target.path);
      allMatches.push(...matches);
      scannedFiles++;
    }
  }

  console.log(`\n📊 Scanned ${scannedFiles} files total.\n`);

  if (allMatches.length === 0) {
    console.log('✅ No secret leakage detected. All clear!');
    process.exit(0);
  } else {
    console.log(`❌ Found ${allMatches.length} potential secret leak(s):\n`);
    for (const match of allMatches) {
      console.warn(`  ⚠️  [${match.secret}] in ${match.file}`);
      console.warn(`     Snippet: ${match.snippet}`);
      console.warn('');
    }
    console.error('\n🚫 Secret leakage check FAILED. Fix the above issues before deploying.');
    process.exit(1);
  }
}

main();
