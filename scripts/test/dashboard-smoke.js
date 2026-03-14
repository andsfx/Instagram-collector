const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..', '..');
const html = fs.readFileSync(path.join(repoRoot, 'dashboard', 'index.html'), 'utf8');
const script = html.split('<script>')[1].split('</script>')[0];
const data = JSON.parse(fs.readFileSync(path.join(repoRoot, 'dashboard', 'data.json'), 'utf8'));

function elementStub() {
  return {
    className: '',
    textContent: '',
    innerHTML: '',
    style: {},
    dataset: {},
    value: '',
    appendChild() {},
    querySelector() { return elementStub(); },
    querySelectorAll() { return []; },
    getContext() { return {}; },
    addEventListener() {},
    classList: { add() {}, remove() {}, toggle() {} }
  };
}

const sandbox = {
  console,
  localStorage: {
    _s: {},
    getItem(k) { return this._s[k] ?? null; },
    setItem(k, v) { this._s[k] = String(v); },
    removeItem(k) { delete this._s[k]; }
  },
  window: {
    location: { search: '' },
    addEventListener() {},
    scrollY: 0
  },
  document: {
    body: { classList: { add() {} } },
    documentElement: { setAttribute() {}, getAttribute() { return 'light'; } },
    head: { appendChild() {} },
    createElement() { return elementStub(); },
    getElementById() { return elementStub(); },
    querySelector() { return elementStub(); },
    querySelectorAll() { return []; }
  },
  URLSearchParams,
  Date,
  Math,
  JSON,
  Intl,
  setTimeout,
  clearTimeout,
  AbortController,
  fetch: async () => ({ ok: true, json: async () => data }),
  Chart: function() {},
  requestAnimationFrame(fn) { return fn(); },
  html2canvas: async () => ({}),
  jspdf: { jsPDF: function() {} }
};
sandbox.global = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(script, sandbox);

const validation = sandbox.validateDashboardRaw(data);
assert.equal(validation.ok, true, 'dashboard/data.json should pass frontend validation');

const adapted = sandbox.adaptV2ToLegacyShape(data);
assert.ok(Array.isArray(adapted.accounts), 'adapted.accounts should be array');
assert.ok(Array.isArray(adapted.dates), 'adapted.dates should be array');
assert.equal(adapted.dates.length, data.history.length, 'dates length should match history length');
assert.ok(adapted.contentBreakdown.metmalbekasi, 'contentBreakdown should include metmalbekasi');
assert.ok(Object.prototype.hasOwnProperty.call(adapted.contentBreakdown.metmalbekasi, 'video'), 'contentBreakdown should map video count');
assert.ok(adapted.trend.metmalbekasi.length === data.history.length, 'trend length should match history length');
assert.equal(sandbox.isStaleLegacyCache({ version: 2 }), true, 'legacy v2 cache without content_breakdown should be stale');
assert.equal(sandbox.isStaleLegacyCache(data), false, 'current v2 payload should not be stale');
assert.equal(sandbox.shouldUseFreshPayload({ generated_at: '2026-01-01T00:00:00Z' }, { generated_at: '2026-01-01T00:00:00Z' }), false, 'same generated_at should not force rerender');
assert.equal(sandbox.shouldUseFreshPayload({ generated_at: '2026-01-01T00:00:00Z' }, { generated_at: '2026-01-02T00:00:00Z' }), true, 'different generated_at should rerender');

console.log(JSON.stringify({
  ok: true,
  checks: [
    'frontend validation passes for current data.json',
    'adapter maps dates/trend/contentBreakdown correctly',
    'cache stale detection works',
    'fresh payload comparison works'
  ]
}, null, 2));
