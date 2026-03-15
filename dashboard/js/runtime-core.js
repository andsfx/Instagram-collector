/* Runtime core: globals, loaders, theme/settings, render orchestration, export */

// ===== GLOBALS =====
const IG_DASH_STATE = window.IG_DASH_STATE || {
  data: null,
  curFilter: 'day',
  sortCol: 'followers',
  sortAsc: false,
  h2hMetric: 'followers',
  chartInstances: {}
};
window.IG_DASH_STATE = IG_DASH_STATE;

function getDashboardState(){
  return IG_DASH_STATE;
}

function getDashboardData(){
  return IG_DASH_STATE.data;
}

function getDashboardCharts(){
  return IG_DASH_STATE.chartInstances;
}

function setDashboardData(data){
  IG_DASH_STATE.data = data;
}

function setDashboardFilter(filter){
  IG_DASH_STATE.curFilter = filter;
}

function setDashboardSort(col, asc){
  IG_DASH_STATE.sortCol = col;
  IG_DASH_STATE.sortAsc = asc;
}

function setDashboardH2HMetric(metric){
  IG_DASH_STATE.h2hMetric = metric;
}

const COLORS = ['#E1306C','#833AB4','#405DE6','#F77737','#FCAF45','#5B51D8','#FD1D1D','#2ecc71','#00376B','#C13584'];
const DEFAULTS = {gapFollow:500, erDrop:20, growthSpike:5, followChange:3};
const DEBUG_MODE = new URLSearchParams(window.location.search).has('debug');
window.COLORS = COLORS;
window.DEFAULTS = DEFAULTS;
window.DEBUG_MODE = DEBUG_MODE;
window.getDashboardState = getDashboardState;
window.getDashboardData = getDashboardData;
window.getDashboardCharts = getDashboardCharts;
window.setDashboardData = setDashboardData;
window.setDashboardFilter = setDashboardFilter;
window.setDashboardSort = setDashboardSort;
window.setDashboardH2HMetric = setDashboardH2HMetric;

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
window.loadScript = loadScript;
window.loadChartJS = loadChartJS;
window.loadExportLibs = loadExportLibs;

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
  if(getDashboardData()) renderAllCharts();
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
window.toggleDark = toggleDark;
window.updateDarkBtn = updateDarkBtn;

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
window.loadSettings = loadSettings;
window.applySettingsToUI = applySettingsToUI;
window.saveSettings = saveSettings;
window.toggleSettings = toggleSettings;

// ===== FILTER =====
function setF(f){
  setDashboardFilter(f);
  document.querySelectorAll('.fbtn').forEach(b => b.classList.toggle('on', b.getAttribute('data-p') === f));
  const fn = document.getElementById('fn');
  const fnt = document.getElementById('fnt');
  if(f === 'day'){
    fn.classList.remove('show');
  } else {
    fn.classList.add('show');
    const data = getDashboardData();
    const pts = data.totalDataPoints || data.dates.length;
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
window.setF = setF;

// ===== MAIN RENDER =====
function render(){
  renderSummaryStrip();
  renderCards();
  renderGrowthVelocity();
  renderPostSnapshot();

  requestAnimationFrame(function(){
    renderTable();
    requestAnimationFrame(function(){
      renderH2HSelectors();
      renderH2H();
      initChartVisibilityBootstrap();
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
window.render = render;

// ===== LAZY CHART RENDERING =====
var lazyChartObserver = null;
var chartVisibilityObserver = null;
var chartVisibilityBootstrapStarted = false;
var chartLibraryLoading = false;
var lazyChartMap = {
  'chBar': mkFollowersBar,
  'chER': mkERBar,
  'chShare': mkShare,
  'chRadar': mkRadar,
  'chTrend': mkTrend,
  'chERTrend': mkERTrend,
  'chProjection': mkProjection
};

function ensureChartLibrary(){
  if(typeof Chart !== 'undefined') return Promise.resolve();
  if(chartLibraryLoading) return chartLibraryLoading;
  chartLibraryLoading = loadChartJS().catch(function(err){
    chartLibraryLoading = false;
    throw err;
  });
  return chartLibraryLoading;
}

function queueChartBootstrap(){
  return ensureChartLibrary().then(function(){
    setupLazyCharts();
    if (typeof renderH2H === 'function') renderH2H();
  }).catch(function(err){
    console.error('Chart.js load failed:', err);
  });
}

function setupLazyCharts(){
  if(!('IntersectionObserver' in window)){
    Object.keys(lazyChartMap).forEach(function(id){
      if(lazyChartMap[id]) lazyChartMap[id]();
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
  }, { rootMargin: '200px 0px' });

  Object.keys(lazyChartMap).forEach(function(id){
    var el = document.getElementById(id);
    if(el){
      var container = el.closest('.chcon') || el.parentElement;
      lazyChartObserver.observe(container);
    }
  });
}

function initChartVisibilityBootstrap(){
  if(chartVisibilityBootstrapStarted) return;
  chartVisibilityBootstrapStarted = true;

  var targets = [];
  ['chBar','chER','chShare','chRadar','chTrend','chERTrend','chProjection','chH2H'].forEach(function(id){
    var el = document.getElementById(id);
    if(!el) return;
    var container = el.closest('.chcon') || el.parentElement;
    if(container) targets.push(container);
  });

  if(!targets.length){
    chartVisibilityBootstrapStarted = false;
    return;
  }

  if(!('IntersectionObserver' in window)){
    queueChartBootstrap();
    return;
  }

  if(chartVisibilityObserver) chartVisibilityObserver.disconnect();
  chartVisibilityObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        queueChartBootstrap();
        chartVisibilityObserver.disconnect();
      }
    });
  }, { threshold: 0.15, rootMargin: '0px' });

  targets.forEach(function(target){ chartVisibilityObserver.observe(target); });
}

function renderAllCharts(){
  return queueChartBootstrap();
}
window.setupLazyCharts = setupLazyCharts;
window.renderAllCharts = renderAllCharts;
window.queueChartBootstrap = queueChartBootstrap;
window.initChartVisibilityBootstrap = initChartVisibilityBootstrap;

// ===== EXPORT =====
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
window.exportPNG = exportPNG;
window.exportPDF = exportPDF;
