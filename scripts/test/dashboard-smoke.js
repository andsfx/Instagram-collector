const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..', '..');
const html = fs.readFileSync(path.join(repoRoot, 'dashboard', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script(?: src="([^"]+)")?>([\s\S]*?)<\/script>/g)];
const data = JSON.parse(fs.readFileSync(path.join(repoRoot, 'dashboard', 'data.json'), 'utf8'));

function elementStub() {
  return {
    className: '',
    textContent: '',
    innerHTML: '',
    style: {},
    dataset: {},
    value: '',
    options: [],
    appendChild(node) { this.options.push(node); },
    querySelector() { return elementStub(); },
    querySelectorAll() { return []; },
    getContext() { return {}; },
    addEventListener() {},
    closest() { return elementStub(); },
    cloneNode() { return elementStub(); },
    parentElement: null,
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
  location: { search: '' },
  addEventListener() {},
  scrollY: 0,
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
sandbox.document = {
  body: { classList: { add() {} } },
  documentElement: { setAttribute() {}, getAttribute() { return 'light'; } },
  head: { appendChild() {} },
  createElement() { return elementStub(); },
  getElementById() { return elementStub(); },
  querySelector() { return elementStub(); },
  querySelectorAll() { return []; }
};
sandbox.window = sandbox;
sandbox.window.location = sandbox.location;
sandbox.window.addEventListener = sandbox.addEventListener;
sandbox.global = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

for (const match of scripts) {
  const src = match[1];
  const inline = match[2];
  let code = '';
  if (src) code = fs.readFileSync(path.join(repoRoot, 'dashboard', src.replace(/^\.\//, '')), 'utf8');
  else code = inline;
  if (!code.trim()) continue;
  vm.runInContext(code, sandbox);
}

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
assert.equal(typeof sandbox.fmtFull, 'function', 'fmtFull should be loaded from ui utils module');
assert.equal(typeof sandbox.getBrand, 'function', 'getBrand should be loaded from ui utils module');
assert.equal(typeof sandbox.renderCards, 'function', 'renderCards should be loaded from render module');
assert.equal(typeof sandbox.renderContentBreakdown, 'function', 'renderContentBreakdown should be loaded from render module');
assert.equal(typeof sandbox.initDashboard, 'function', 'initDashboard should be loaded from runtime data loader module');
assert.equal(typeof sandbox.forceRefreshData, 'function', 'forceRefreshData should be loaded from runtime data loader module');
assert.equal(typeof sandbox.IG_DASH_STATE, 'object', 'IG_DASH_STATE namespace should exist');
assert.equal(typeof sandbox.getDashboardState, 'function', 'getDashboardState helper should exist');
assert.equal(typeof sandbox.getDashboardData, 'function', 'getDashboardData helper should exist');
assert.equal(typeof sandbox.queueChartBootstrap, 'function', 'queueChartBootstrap helper should exist');
assert.equal(sandbox.IG_DASH_STATE.sortCol, 'followers', 'IG_DASH_STATE should track default sort');
assert.equal(sandbox.D, undefined, 'legacy D global should not be required anymore');
assert.equal(sandbox.STATIC_JSON_URL, './data.json', 'STATIC_JSON_URL should be stable for HTTP caching');

console.log(JSON.stringify({
  ok: true,
  checks: [
    'frontend validation passes for current data.json',
    'normalizeDashboardData maps dates/trend/engTrend/contentBreakdown correctly',
    'render module functions are loaded from external script',
    'runtime loader/init functions are loaded from external scripts',
    'IG_DASH_STATE namespace is initialized',
    'legacy D global is no longer required',
    'data URL is stable for HTTP caching',
    'chart bootstrap is deferred via runtime helper'
  ]
}, null, 2));
