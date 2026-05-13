/**
 * Schema-Doc Sync Check Script
 *
 * Verifies that `docs/dashboard-data-schema.md` exists and is kept in sync
 * with the schema code at `dashboard-react/src/data/schema.ts`.
 *
 * Current implementation:
 * - Checks that the doc file exists
 * - Compares modification times (doc should be updated when schema changes)
 *
 * Future enhancement: Parse both files and compare field names programmatically.
 *
 * Requirements: 2.7, 2.8
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

const SCHEMA_CODE_PATH = path.join(ROOT, 'dashboard-react', 'src', 'data', 'schema.ts');
const SCHEMA_DOC_PATH = path.join(ROOT, 'docs', 'dashboard-data-schema.md');

function main() {
  console.log('📋 Schema-Doc Sync Check');
  console.log('=========================\n');

  // Check schema code file exists
  if (!fs.existsSync(SCHEMA_CODE_PATH)) {
    console.error(`❌ Schema code file not found: ${path.relative(ROOT, SCHEMA_CODE_PATH)}`);
    process.exit(1);
  }
  console.log(`✓ Schema code found: ${path.relative(ROOT, SCHEMA_CODE_PATH)}`);

  // Check documentation file exists
  if (!fs.existsSync(SCHEMA_DOC_PATH)) {
    console.error(`❌ Schema documentation not found: ${path.relative(ROOT, SCHEMA_DOC_PATH)}`);
    console.error('  Please create docs/dashboard-data-schema.md documenting all schema fields.');
    process.exit(1);
  }
  console.log(`✓ Schema doc found: ${path.relative(ROOT, SCHEMA_DOC_PATH)}`);

  // Compare modification times
  const schemaStat = fs.statSync(SCHEMA_CODE_PATH);
  const docStat = fs.statSync(SCHEMA_DOC_PATH);

  const schemaModified = schemaStat.mtime;
  const docModified = docStat.mtime;

  console.log(`\n  Schema code last modified: ${schemaModified.toISOString()}`);
  console.log(`  Schema doc last modified:  ${docModified.toISOString()}`);

  if (schemaModified > docModified) {
    console.warn('\n⚠️  WARNING: Schema code was modified more recently than the documentation.');
    console.warn('  Please update docs/dashboard-data-schema.md to reflect schema changes.');
    console.warn('  This is a warning — build will continue, but docs may be out of sync.');
    // Exit with 0 but warn — the CI workflow can treat this as a warning
    // For stricter enforcement, change to process.exit(1)
    process.exit(0);
  }

  console.log('\n✅ Schema documentation is up to date.');
  process.exit(0);
}

main();
