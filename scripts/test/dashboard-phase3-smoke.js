const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..', '..');
const coreScript = fs.readFileSync(path.join(repoRoot, 'dashboard', 'js', 'data-core.js'), 'utf8');
const data = JSON.parse(fs.readFileSync(path.join(repoRoot, 'dashboard', 'data.json'), 'utf8'));

const sandbox = {
  console,
  window: {},
  localStorage: {
    _s: {},
    getItem(k) { return this._s[k] ?? null; },
    setItem(k, v) { this._s[k] = String(v); },
    removeItem(k) { delete this._s[k]; }
  },
  Date,
  JSON,
  Math,
  Intl
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(coreScript, sandbox);

const validation = sandbox.validateDashboardRaw(data);
assert.equal(validation.ok, true, 'v2 data should pass validation');

const normalized = sandbox.normalizeDashboardData(data);
assert.ok(Array.isArray(normalized.accounts), 'normalized.accounts should exist');
assert.ok(Array.isArray(normalized.dates), 'normalized.dates should exist');
assert.ok(normalized.engTrend.metmalbekasi.length === data.history.length, 'engTrend should align with history');
assert.ok(normalized.contentBreakdown.metmalbekasi, 'contentBreakdown should exist');
assert.equal(normalized.totalDataPoints, data.history.length, 'totalDataPoints should match history');

sandbox.saveToCache(data);
const cached = sandbox.loadFromCache();
assert.ok(cached && cached.data, 'cache should load back saved payload');
assert.equal(sandbox.isStaleLegacyCache({ version: 2 }), true, 'legacy payload should be stale');
assert.equal(sandbox.shouldUseFreshPayload({ generated_at: 'A' }, { generated_at: 'A' }), false, 'same payload should not rerender');
assert.equal(sandbox.shouldUseFreshPayload({ generated_at: 'A' }, { generated_at: 'B' }), true, 'new payload should rerender');

console.log(JSON.stringify({
  ok: true,
  checks: [
    'data-core validation passes',
    'normalizeDashboardData maps accounts/dates/trend/engTrend/contentBreakdown',
    'cache helpers work',
    'fresh payload comparison works'
  ]
}, null, 2));
