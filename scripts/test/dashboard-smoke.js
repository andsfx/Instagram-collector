const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..', '..');
const html = fs.readFileSync(path.join(repoRoot, 'dashboard', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script(?: src="([^"]+)")?>([\s\S]*?)<\/script>/g)];
const coreScript = fs.readFileSync(path.join(repoRoot, 'dashboard', 'js', 'data-core.js'), 'utf8');
const inlineScript = scripts[scripts.length - 1][2];
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
    closest() { return elementStub(); },
    parentElement: elementStub.__p || null,
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
sandbox.window = sandbox;
sandbox.location = { search: '' };
sandbox.window.location = sandbox.location;
sandbox.addEventListener = function() {};
sandbox.window.addEventListener = sandbox.addEventListener;
sandbox.global = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(coreScript, sandbox);
vm.runInContext(inlineScript, sandbox);

const validation = sandbox.validateDashboardRaw(data);
assert.equal(validation.ok, true, 'dashboard/data.json should pass frontend validation');

const normalized = sandbox.normalizeDashboardData(data);
assert.ok(Array.isArray(normalized.accounts), 'normalized.accounts should be array');
assert.ok(Array.isArray(normalized.dates), 'normalized.dates should be array');
assert.equal(normalized.dates.length, data.history.length, 'dates length should match history length');
assert.ok(normalized.contentBreakdown.metmalbekasi, 'contentBreakdown should include metmalbekasi');
assert.ok(Object.prototype.hasOwnProperty.call(normalized.contentBreakdown.metmalbekasi, 'video'), 'contentBreakdown should map video count');
assert.ok(normalized.trend.metmalbekasi.length === data.history.length, 'trend length should match history length');
assert.ok(normalized.engTrend.metmalbekasi.length === data.history.length, 'engagement trend length should match history length');

console.log(JSON.stringify({
  ok: true,
  checks: [
    'frontend validation passes for current data.json',
    'normalizeDashboardData maps dates/trend/engTrend/contentBreakdown correctly'
  ]
}, null, 2));
