/* =============================================
   INSTAGRAM COMPETITOR DASHBOARD - FULL JS
   Features: Dark Mode, Export, Growth Velocity,
   Projection, Head-to-Head, Content Breakdown,
   Heatmap, Settings/Thresholds
   ============================================= */

// ===== GLOBALS =====
let D = null;
let curFilter = 'day';
let sortCol = 'followers';
let sortAsc = false;
let h2hMetric = 'followers';
let chartInstances = {};
window.D = D;
window.chartInstances = chartInstances;
const COLORS = ['#E1306C','#833AB4','#405DE6','#F77737','#FCAF45','#5B51D8','#FD1D1D','#2ecc71','#00376B','#C13584'];
const DEFAULTS = {gapFollow:500, erDrop:20, growthSpike:5, followChange:3};
const DEBUG_MODE = new URLSearchParams(window.location.search).has('debug');

// ===== DYNAMIC SCRIPT LOADER =====
var _scriptCache = {};
function loadScript(url){
  if(_scriptCache[url]) return _scriptCache[url];
  _scriptCache[url] = new Promise(function(resolve, reject){
    var s = document.createElement('script');
    s.src = url;
    s.onload = resolve;
    s.onerror = function(){ reject(new Error('Failed to load: ' + url)); };
    document.head.appendChild(s);
  });
  return _scriptCache[url];
}
function loadChartJS(){
  return loadScript('https://cdn.jsdelivr.net/npm/chart.js');
}
function loadExportLibs(){
  return Promise.all([
    loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'),
    loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js')
  ]);
}

// ===== FEATURE 8: DARK MODE =====
(function initTheme(){
  const saved = localStorage.getItem('ig-dash-theme');
  if(saved) document.documentElement.setAttribute('data-theme', saved);
})();

function toggleDark(){
  const html = document.documentElement;
  const cur = html.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('ig-dash-theme', next);
  updateDarkBtn(next);
  // Re-render charts with updated colors
  if(D) renderAllCharts();
}

function updateDarkBtn(theme){
  const btn = document.getElementById('darkToggle');
  const icon = document.getElementById('darkIcon');
  const label = document.getElementById('darkLabel');
  if(theme === 'dark'){
    btn.classList.add('active');
    icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
    label.textContent = 'Light Mode';
  } else {
    btn.classList.remove('active');
    icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    label.textContent = 'Dark Mode';
  }
}

// ===== FEATURE 6: SETTINGS =====
function loadSettings(){
  try {
    const s = JSON.parse(localStorage.getItem('ig-dash-settings'));
    return s || {...DEFAULTS};
  } catch(e){ return {...DEFAULTS}; }
}

function applySettingsToUI(){
  const s = loadSettings();
  document.getElementById('setGap').value = s.gapFollow;
  document.getElementById('setErDrop').value = s.erDrop;
  document.getElementById('setGrowthSpike').value = s.growthSpike;
  document.getElementById('setFollowChange').value = s.followChange;
}

function saveSettings(){
  const s = {
    gapFollow: Number(document.getElementById('setGap').value) || DEFAULTS.gapFollow,
    erDrop: Number(document.getElementById('setErDrop').value) || DEFAULTS.erDrop,
    growthSpike: Number(document.getElementById('setGrowthSpike').value) || DEFAULTS.growthSpike,
    followChange: Number(document.getElementById('setFollowChange').value) || DEFAULTS.followChange
  };
  localStorage.setItem('ig-dash-settings', JSON.stringify(s));
  const btn = document.querySelector('.settings-save');
  btn.textContent = 'Tersimpan!';
  setTimeout(() => btn.textContent = 'Simpan Settings', 1500);
}

function toggleSettings(){
  const panel = document.getElementById('settingsPanel');
  panel.classList.toggle('open');
}

// ===== DATA LOADING (3-Tier: Cache -> Static JSON -> Apps Script API) =====
const API_URL = null; // deprecated in hybrid mode
const STATIC_JSON_URL = './data.json?v=' + Date.now();

function fmtInt(v){
  if (v === null || v === undefined || v === '') return '—';
  var n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);
}
function fmtDec(v, digits=2){
  if (v === null || v === undefined || v === '') return '—';
  var n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: digits }).format(n);
}
function fmtPct(v, digits=2){
  if (v === null || v === undefined || v === '') return '—';
  var n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return fmtDec(n, digits) + '%';
}
function prettyLastUpdate(v){
  if (!v) return 'Unknown';
  try {
    var d = new Date(v);
    return d.toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:false, timeZone:'Asia/Jakarta' }) + ' WIB';
  } catch(_) {
    return String(v);
  }
}
function setFreshnessBadge(type, extra){
  var el = document.getElementById('freshnessBadge');
  if (!el) return;
  el.className = 'status-badge ' + type;
  if (type === 'fresh') el.textContent = extra ? ('Data terbaru • ' + extra) : 'Data terbaru';
  else if (type === 'cached') el.textContent = extra ? ('Cache lokal • ' + extra) : 'Cache lokal';
  else el.textContent = extra ? ('Perlu perhatian • ' + extra) : 'Perlu refresh';
}

function onData(raw, source){
  var parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  var validation = validateDashboardRaw(parsed);
  if (!validation.ok) {
    onError(new Error('Schema dashboard tidak valid: ' + validation.issues.join('; ')), parsed);
    return;
  }
  try {
    D = normalizeDashboardData(parsed);
    window.D = D;
    window.chartInstances = chartInstances;
  } catch(e){
    onError(e, parsed);
    return;
  }
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';

  // Init dark mode button state
  updateDarkBtn(document.documentElement.getAttribute('data-theme') || 'light');

  // Last update
  document.getElementById('lastUpdate').textContent = 'Update terakhir: ' + prettyLastUpdate(D.lastUpdate || '-');
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
    message = detail ? ('Data live dari data.json • ' + detail) : 'Data live dari data.json';
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

async function fetchWithTimeout(url, timeoutMs){
  var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  var timer = null;
  try {
    if(controller) timer = setTimeout(function(){ controller.abort(); }, timeoutMs || 5000);
    var options = { cache: 'no-store' };
    if(controller) options.signal = controller.signal;
    return await fetch(url, options);
  } finally {
    if(timer) clearTimeout(timer);
  }
}

async function silentRefresh(){
  if(!D || !D.generated_at) return;
  try {
    var res = await fetchWithTimeout(STATIC_JSON_URL, 5000);
    if(!res.ok) return;
    var raw = await res.json();
    var validation = validateDashboardRaw(raw);
    if(!validation.ok) return;
    if(!shouldUseFreshPayload(D, raw)) return;
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
    var res = await fetchWithTimeout(STATIC_JSON_URL, 5000);
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

// ===== FILTER =====
function setF(f){
  curFilter = f;
  document.querySelectorAll('.fbtn').forEach(b => b.classList.toggle('on', b.getAttribute('data-p') === f));
  const fn = document.getElementById('fn');
  const fnt = document.getElementById('fnt');
  if(f === 'day'){
    fn.classList.remove('show');
  } else {
    fn.classList.add('show');
    const pts = D.totalDataPoints || D.dates.length;
    if(f === 'week' && pts < 7){
      fnt.textContent = 'Data mingguan membutuhkan minimal 7 hari. Saat ini baru '+pts+' hari data tersedia.';
    } else if(f === 'month' && pts < 30){
      fnt.textContent = 'Data bulanan membutuhkan minimal 30 hari. Saat ini baru '+pts+' hari data tersedia.';
    } else {
      fn.classList.remove('show');
    }
  }
  render();
}

// ===== MAIN RENDER =====
// ===== RENDER BATCHING (rAF) =====
// Splits render into sequential batches to avoid blocking the main thread
function render(){
  // Batch 1: Critical above-the-fold content (immediate)
  renderSummaryStrip();
  renderCards();
  renderGrowthVelocity();

  // Batch 2: Table (next frame)
  requestAnimationFrame(function(){
    renderTable();

    // Batch 3: Charts + selectors (next frame after table)
    requestAnimationFrame(function(){
      renderAllCharts();
      renderH2HSelectors();
      renderH2H();

      // Batch 4: Below-fold features (next frame after charts)
      requestAnimationFrame(function(){
        renderContentBreakdown();
        renderHeatmapSelectors();
        renderHeatmap();
        renderInsights();
        initRevealAnimations();
      });
    });
  });
}

// ===== LAZY CHART RENDERING =====
// Charts only render when their container scrolls into viewport
var lazyChartObserver = null;
var lazyChartMap = {
  'chBar': mkFollowersBar,
  'chER': mkERBar,
  'chShare': mkShare,
  'chRadar': mkRadar,
  'chTrend': mkTrend,
  'chERTrend': mkERTrend,
  'chProjection': mkProjection
};
// Charts that are above-the-fold and should render immediately
var eagerCharts = ['chBar', 'chER'];

function setupLazyCharts(){
  // Render above-the-fold charts immediately
  eagerCharts.forEach(function(id){
    if(lazyChartMap[id]) lazyChartMap[id]();
  });

  // Lazy-load the rest via IntersectionObserver
  if(!('IntersectionObserver' in window)){
    // Fallback: render all if IO not supported
    Object.keys(lazyChartMap).forEach(function(id){
      if(eagerCharts.indexOf(id) === -1 && lazyChartMap[id]) lazyChartMap[id]();
    });
    return;
  }

  if(lazyChartObserver) lazyChartObserver.disconnect();
  lazyChartObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var canvas = entry.target.querySelector('canvas') || entry.target;
        var id = canvas.id;
        if(id && lazyChartMap[id]){
          lazyChartMap[id]();
          lazyChartObserver.unobserve(entry.target);
        }
      }
    });
  }, { rootMargin: '200px 0px' }); // Start loading 200px before visible

  Object.keys(lazyChartMap).forEach(function(id){
    if(eagerCharts.indexOf(id) !== -1) return; // Skip eager charts
    var el = document.getElementById(id);
    if(el){
      var container = el.closest('.chcon') || el.parentElement;
      lazyChartObserver.observe(container);
    }
  });
}

function renderAllCharts(){
  if(typeof Chart !== 'undefined'){
    setupLazyCharts();
    return;
  }
  loadChartJS().then(function(){
    setupLazyCharts();
  }).catch(function(err){
    console.error('Chart.js load failed:', err);
  });
}

// ===== EXPORT (Feature 7) — Lazy-loaded =====
function _doCanvasExport(callback){
  var overlay = document.getElementById('exportOverlay');
  var msg = document.getElementById('exportMsg');
  overlay.style.display = 'flex';
  msg.textContent = 'Loading export libraries...';
  loadExportLibs().then(function(){
    msg.textContent = 'Generating image...';
    setTimeout(function(){
      html2canvas(document.querySelector('main'), {
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#f4f5f7',
        scale: 2,
        useCORS: true,
        logging: false
      }).then(function(canvas){
        callback(canvas);
        overlay.style.display = 'none';
      }).catch(function(err){
        msg.textContent = 'Gagal export: ' + err.message;
        setTimeout(function(){ overlay.style.display = 'none'; }, 2000);
      });
    }, 300);
  }).catch(function(err){
    msg.textContent = 'Gagal load library: ' + err.message;
    setTimeout(function(){ overlay.style.display = 'none'; }, 2000);
  });
}

function exportPNG(){
  _doCanvasExport(function(canvas){
    var link = document.createElement('a');
    link.download = 'instagram-dashboard-' + new Date().toISOString().slice(0,10) + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

function exportPDF(){
  _doCanvasExport(function(canvas){
    var imgData = canvas.toDataURL('image/png');
    var pdf = new jspdf.jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('instagram-dashboard-' + new Date().toISOString().slice(0,10) + '.pdf');
  });
}

// ===== INIT =====
window.addEventListener('DOMContentLoaded', function(){
  // Init dark mode from localStorage
  var saved = localStorage.getItem('ig-dash-theme');
  if(saved === 'dark'){
    document.documentElement.setAttribute('data-theme', 'dark');
    updateDarkBtn('dark');
  }
  if (DEBUG_MODE) {
    var debugBtn = document.getElementById('debugToggleBtn');
    if (debugBtn) debugBtn.style.display = 'inline-flex';
  }
  // Load data
  initDashboard();
});

// ===== SCROLL REVEAL ANIMATIONS =====
function initRevealAnimations(){
  // Signal CSS that JS is ready — enables transitions
  document.body.classList.add('reveal-ready');

  if(typeof IntersectionObserver === 'undefined') {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('visible'); });
    return;
  }

  // Stagger above-the-fold elements with clear delays
  var aboveFold = [
    {sel:'.hdr.reveal', delay:300},
    {sel:'.nav-bar.reveal', delay:550},
    {sel:'#sec-overview .sec-group-header.reveal', delay:800},
    {sel:'.cards-s.reveal', delay:1000},
    {sel:'.gv-sec.reveal', delay:1200}
  ];
  var aboveFoldEls = new Set();

  aboveFold.forEach(function(item){
    var el = document.querySelector(item.sel);
    if(el){
      aboveFoldEls.add(el);
      setTimeout(function(){ el.classList.add('visible'); }, item.delay);
    }
  });

  // Observer for below-fold elements (scroll reveal)
  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:0.12, rootMargin:'0px 0px -60px 0px'});

  // Observe only elements NOT handled by above-fold stagger
  document.querySelectorAll('.reveal').forEach(function(el){
    if(!aboveFoldEls.has(el) && !el.classList.contains('visible')){
      observer.observe(el);
    }
  });
}

// ===== SCROLL SPY + NAV BAR =====
(function initNav(){
  const nav = document.getElementById('navBar');
  if(!nav) return;
  const items = nav.querySelectorAll('.nav-item');
  const sectionIds = ['sec-overview','sec-engagement','sec-content','sec-history'];
  let lastScroll = 0;
  let ticking = false;

  // Smooth scroll on click
  items.forEach(item => {
    item.addEventListener('click', function(e){
      e.preventDefault();
      const target = document.getElementById(this.dataset.sec);
      if(target){
        target.scrollIntoView({behavior:'smooth',block:'start'});
        // Update active state immediately
        items.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });

  // Scroll spy
  function updateNav(){
    const scrollY = window.scrollY;
    const navH = nav.offsetHeight + 20;

    // Auto-hide on scroll down, show on scroll up
    if(scrollY > 200){
      nav.classList.add('scrolled');
      if(scrollY > lastScroll && scrollY > 400){
        nav.classList.add('hidden');
      } else {
        nav.classList.remove('hidden');
      }
    } else {
      nav.classList.remove('scrolled');
      nav.classList.remove('hidden');
    }
    lastScroll = scrollY;

    // Highlight active section
    let activeId = sectionIds[0];
    for(let i = sectionIds.length - 1; i >= 0; i--){
      const sec = document.getElementById(sectionIds[i]);
      if(sec && sec.getBoundingClientRect().top <= navH + 60){
        activeId = sectionIds[i];
        break;
      }
    }
    items.forEach(item => {
      item.classList.toggle('active', item.dataset.sec === activeId);
    });
    ticking = false;
  }

  window.addEventListener('scroll', function(){
    if(!ticking){
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, {passive:true});
})();