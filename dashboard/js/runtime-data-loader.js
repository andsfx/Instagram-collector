/* Runtime data loader: status UI, data fetch/cache, debug panel */

const STATIC_JSON_URL = './data.json';
window.STATIC_JSON_URL = STATIC_JSON_URL;

function setFreshnessBadge(type, extra){
  var el = document.getElementById('freshnessBadge');
  if (!el) return;
  el.className = 'status-badge ' + type;
  if (type === 'fresh') el.textContent = extra ? ('Data terbaru • ' + extra) : 'Data terbaru';
  else if (type === 'cached') el.textContent = extra ? ('Cache lokal • ' + extra) : 'Cache lokal';
  else el.textContent = extra ? ('Perlu perhatian • ' + extra) : 'Perlu refresh';
}

function setDataSource(state, detail){
  var el = document.getElementById('dataSource');
  var textEl = document.getElementById('dataSourceText');
  if(!el || !textEl) return;
  var message = 'Menyiapkan data dashboard…';
  var cls = 'live src-loading';
  if(state === 'cached'){
    cls = 'live src-cached';
    message = detail ? ('Menampilkan cache lokal • ' + detail) : 'Menampilkan cache lokal';
  } else if(state === 'static'){
    cls = 'live src-live';
    message = detail ? ('Data live dari data.json • Tanggal data ' + detail) : 'Data live dari data.json';
  } else if(state === 'error'){
    cls = 'live src-error';
    message = detail ? ('Gagal memuat data • ' + detail) : 'Gagal memuat data';
  } else if(state === 'refreshing'){
    cls = 'live src-loading';
    message = detail ? ('Menyegarkan data… • ' + detail) : 'Menyegarkan data…';
  }
  el.className = cls;
  textEl.textContent = message;
}

function renderDebugPanel(source, raw, note){
  var panel = document.getElementById('debugPanel');
  if(!panel) return;
  if(!DEBUG_MODE){
    panel.classList.remove('open');
    panel.innerHTML = '';
    return;
  }
  var summary = {
    source: source || '-',
    note: note || '-',
    latestDate: raw && raw.latest ? raw.latest.date || '-' : '-',
    generatedAtWib: raw ? raw.generated_at_wib || '-' : '-',
    accounts: raw && Array.isArray(raw.accounts) ? raw.accounts.length : 0,
    historyDays: raw && Array.isArray(raw.history) ? raw.history.length : 0
  };
  panel.innerHTML = '<div class="debug-grid">' + Object.entries(summary).map(function(entry){
    return '<div class="debug-item"><div class="debug-k">' + entry[0] + '</div><div class="debug-v">' + entry[1] + '</div></div>';
  }).join('') + '</div>';
}

function toggleDebugPanel(){
  var panel = document.getElementById('debugPanel');
  if(!panel || !DEBUG_MODE) return;
  panel.classList.toggle('open');
}

function syncRuntimeState(parsed){
  setDashboardData(normalizeDashboardData(parsed));
}

function onData(raw, source){
  var parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  var validation = validateDashboardRaw(parsed);
  if (!validation.ok) {
    onError(new Error('Schema dashboard tidak valid: ' + validation.issues.join('; ')), parsed);
    return;
  }
  try {
    syncRuntimeState(parsed);
  } catch(e){
    onError(e, parsed);
    return;
  }
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  updateDarkBtn(document.documentElement.getAttribute('data-theme') || 'light');
  var data = getDashboardData();
  document.getElementById('lastUpdate').textContent = 'Update terakhir: ' + prettyLastUpdate(data.lastUpdate || '-');
  if (source === 'cached') setFreshnessBadge('cached', formatAge(Date.now() - parseInt(localStorage.getItem(CACHE_TS_KEY) || Date.now(), 10)));
  else setFreshnessBadge('fresh', parsed.latest && parsed.latest.date ? parsed.latest.date : todayWibDate());
  renderDebugPanel(source, parsed, validation.ok ? 'schema ok' : validation.issues.join('; '));
  render();
}

function onError(e, raw){
  document.getElementById('loadingState').innerHTML =
    '<div class="error-box"><strong>Gagal memuat data</strong><br><br>'+
    (e && e.message ? e.message : 'Terjadi kesalahan. Silakan refresh halaman.')+
    '<br><br><button onclick="forceRefreshData()" style="padding:8px 20px;border:1px solid var(--danger);background:transparent;color:var(--danger);border-radius:var(--radius-pill);cursor:pointer;font-weight:600;font-family:inherit">Force refresh</button></div>';
  setFreshnessBadge('error', 'perlu refresh');
  setDataSource('loading');
  renderDebugPanel('error', raw || null, e && e.message ? e.message : 'unknown error');
}

async function fetchWithTimeout(url, timeoutMs, cacheMode){
  var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  var timer = null;
  try {
    if(controller) timer = setTimeout(function(){ controller.abort(); }, timeoutMs || 5000);
    var options = { cache: cacheMode || 'default' };
    if(controller) options.signal = controller.signal;
    return await fetch(url, options);
  } finally {
    if(timer) clearTimeout(timer);
  }
}

async function silentRefresh(){
  var data = getDashboardData();
  if(!data || !data.generated_at) return;
  try {
    var res = await fetchWithTimeout(STATIC_JSON_URL, 5000, 'no-cache');
    if(!res.ok) return;
    var raw = await res.json();
    var validation = validateDashboardRaw(raw);
    if(!validation.ok) return;
    if(!shouldUseFreshPayload(data, raw)) return;
    saveToCache(raw);
    setDataSource('static', raw.latest && raw.latest.date ? raw.latest.date : todayWibDate());
    onData(raw, 'static');
  } catch(_) {}
}

async function initDashboard(){
  setDataSource('loading');
  var cached = loadFromCache();
  if(cached && cached.data){
    setDataSource('cached', formatAge(cached.ageMs));
    onData(cached.data, 'cached');
    silentRefresh();
    return;
  }
  try {
    var res = await fetchWithTimeout(STATIC_JSON_URL, 5000, 'default');
    if(!res.ok) throw new Error('Gagal memuat data.json (HTTP ' + res.status + ')');
    var raw = await res.json();
    var validation = validateDashboardRaw(raw);
    if(!validation.ok) throw new Error('Schema dashboard tidak valid: ' + validation.issues.join('; '));
    saveToCache(raw);
    setDataSource('static', raw.latest && raw.latest.date ? raw.latest.date : todayWibDate());
    onData(raw, 'static');
  } catch(e) {
    onError(e);
  }
}

function forceRefreshData(){
  clearDashboardCache();
  setDataSource('refreshing');
  var loading = document.getElementById('loadingState');
  var dashboard = document.getElementById('dashboard');
  if(loading) loading.style.display = 'block';
  if(dashboard) dashboard.style.display = 'none';
  initDashboard();
}

window.setFreshnessBadge = setFreshnessBadge;
window.setDataSource = setDataSource;
window.renderDebugPanel = renderDebugPanel;
window.toggleDebugPanel = toggleDebugPanel;
window.syncRuntimeState = syncRuntimeState;
window.onData = onData;
window.onError = onError;
window.fetchWithTimeout = fetchWithTimeout;
window.silentRefresh = silentRefresh;
window.initDashboard = initDashboard;
window.forceRefreshData = forceRefreshData;
