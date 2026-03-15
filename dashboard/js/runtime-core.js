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

function _collectPresentationInsights(){
  var summaryPairs = [];
  document.querySelectorAll('#summaryStrip .summary-card').forEach(function(card){
    var k = (card.querySelector('.k') && card.querySelector('.k').textContent || '').trim();
    var v = (card.querySelector('.v') && card.querySelector('.v').textContent || '').trim();
    if(k && v) summaryPairs.push({ key: k, value: v });
  });

  var campaignPairs = [];
  document.querySelectorAll('#postCampaignSummary .ps-summary-card').forEach(function(card){
    var k = (card.querySelector('.ps-summary-k') && card.querySelector('.ps-summary-k').textContent || '').trim();
    var v = (card.querySelector('.ps-summary-v') && card.querySelector('.ps-summary-v').textContent || '').trim();
    if(k && v) campaignPairs.push({ key: k, value: v });
  });

  return {
    updatedAt: (document.getElementById('lastUpdate') && document.getElementById('lastUpdate').textContent || '').trim(),
    summaryPairs: summaryPairs,
    campaignPairs: campaignPairs
  };
}


function _loadBrandLogoDataURL(){
  var logoPath = './assets/metropolitan-mall-logo.png';
  return fetch(logoPath).then(function(res){
    if(!res.ok) throw new Error('logo fetch failed');
    return res.blob();
  }).then(function(blob){
    return new Promise(function(resolve, reject){
      var reader = new FileReader();
      reader.onload = function(){ resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }).catch(function(){ return null; });
}

function exportPDF(){
  var overlay = document.getElementById('exportOverlay');
  var msg = document.getElementById('exportMsg');
  overlay.style.display = 'flex';
  msg.textContent = 'Loading export libraries...';

  loadExportLibs().then(async function(){
    try {
      msg.textContent = 'Menyiapkan template presentasi...';
      await queueChartBootstrap();
      await new Promise(function(resolve){ setTimeout(resolve, 500); });
      var logoDataURL = await _loadBrandLogoDataURL();

      var BRAND = {
        pink: [225, 48, 108],
        tosca: [33, 190, 176],
        dark: [24, 34, 52],
        bg: [246, 248, 251],
        muted: [96, 108, 126]
      };

      var pdf = new jspdf.jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4'
      });
      var pageW = pdf.internal.pageSize.getWidth();
      var pageH = pdf.internal.pageSize.getHeight();
      var marginX = 34;
      var marginTop = 30;
      var contentTop = 96;
      var contentW = pageW - marginX * 2;
      var contentH = pageH - contentTop - 34;
      var pageCount = 1;

      function drawFooter(){
        pdf.setDrawColor(226, 231, 239);
        pdf.line(marginX, pageH - 24, pageW - marginX, pageH - 24);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
        pdf.text('Instagram Dashboard · Metropolitan Mall Bekasi', marginX, pageH - 11);
        pdf.setTextColor(BRAND.pink[0], BRAND.pink[1], BRAND.pink[2]);
        pdf.text('Halaman ' + pageCount, pageW - marginX - 44, pageH - 11);
      }

      function header(title, subtitle){
        pdf.setFillColor(BRAND.bg[0], BRAND.bg[1], BRAND.bg[2]);
        pdf.rect(0, 0, pageW, 82, 'F');
        pdf.setFillColor(BRAND.tosca[0], BRAND.tosca[1], BRAND.tosca[2]);
        pdf.rect(0, 0, pageW * 0.42, 8, 'F');
        pdf.setFillColor(BRAND.pink[0], BRAND.pink[1], BRAND.pink[2]);
        pdf.rect(pageW * 0.42, 0, pageW * 0.58, 8, 'F');
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(marginX, 16, 92, 44, 8, 8, 'F');
        if(logoDataURL){
          try { pdf.addImage(logoDataURL, 'PNG', marginX + 6, 21, 80, 34, undefined, 'FAST'); } catch(_) {}
        }
        pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.text(title, marginX + 104, 36);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        pdf.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
        pdf.text(subtitle || '', marginX + 104, 56);
      }

      function startNewPage(title, subtitle){
        pdf.addPage();
        pageCount += 1;
        header(title, subtitle);
        drawFooter();
      }

      function drawInsightsTable(title, pairs, startY){
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
        pdf.text(title, marginX, startY);
        var y = startY + 14;
        pairs.slice(0, 6).forEach(function(item){
          pdf.setDrawColor(228, 232, 240);
          pdf.rect(marginX, y, contentW, 24);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.setTextColor(BRAND.tosca[0], BRAND.tosca[1], BRAND.tosca[2]);
          pdf.text(item.key, marginX + 8, y + 15);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
          var val = String(item.value || '-');
          if (val.length > 72) val = val.slice(0, 69) + '...';
          pdf.text(val, marginX + 210, y + 15);
          y += 28;
        });
        return y;
      }

      function addSectionCapture(sectionId, sectionTitle, subtitle){
        var section = document.getElementById(sectionId);
        if(!section) return Promise.resolve();
        msg.textContent = 'Menyusun slide: ' + sectionTitle + '...';
        return html2canvas(section, {
          backgroundColor: '#f4f5f7',
          scale: 2,
          useCORS: true,
          logging: false
        }).then(function(canvas){
          var ratio = contentW / canvas.width;
          var slicePixelHeight = Math.max(1, Math.floor(contentH / ratio));
          var totalSlices = Math.max(1, Math.ceil(canvas.height / slicePixelHeight));

          for (var i = 0; i < totalSlices; i++) {
            startNewPage(sectionTitle + (totalSlices > 1 ? ' (' + (i + 1) + '/' + totalSlices + ')' : ''), subtitle);
            var sy = i * slicePixelHeight;
            var sh = Math.min(slicePixelHeight, canvas.height - sy);

            var temp = document.createElement('canvas');
            temp.width = canvas.width;
            temp.height = sh;
            var ctx = temp.getContext('2d');
            ctx.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);

            var imgW = contentW;
            var imgH = sh * ratio;
            var x = marginX;
            var y = contentTop;
            pdf.addImage(temp.toDataURL('image/png'), 'PNG', x, y, imgW, imgH, undefined, 'FAST');
          }
        });
      }
      // Cover page
      pdf.setFillColor(BRAND.bg[0], BRAND.bg[1], BRAND.bg[2]);
      pdf.rect(0, 0, pageW, pageH, 'F');
      pdf.setFillColor(BRAND.tosca[0], BRAND.tosca[1], BRAND.tosca[2]);
      pdf.rect(0, 0, pageW * 0.65, 16, 'F');
      pdf.setFillColor(BRAND.pink[0], BRAND.pink[1], BRAND.pink[2]);
      pdf.rect(pageW * 0.65, 0, pageW * 0.35, 16, 'F');
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(marginX, 36, 180, 74, 12, 12, 'F');
      if(logoDataURL){
        try { pdf.addImage(logoDataURL, 'PNG', marginX + 12, 50, 156, 48, undefined, 'FAST'); } catch(_) {}
      }
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
      pdf.setFontSize(29);
      pdf.text('Instagram Dashboard Report', marginX, 170);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(14);
      pdf.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
      pdf.text('Deck siap presentasi · Tema brand tosca + pink', marginX, 198);
      pdf.setFontSize(11);
      var dateLabel = 'Generated: ' + new Date().toLocaleString('id-ID');
      pdf.text(dateLabel, marginX, 224);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(marginX, 254, pageW - marginX * 2, 74, 10, 10, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(BRAND.tosca[0], BRAND.tosca[1], BRAND.tosca[2]);
      pdf.setFontSize(13);
      pdf.text('Tujuan Laporan', marginX + 14, 278);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
      pdf.setFontSize(11);
      pdf.text('- Monitoring performa akun, campaign, dan konten paling efektif', marginX + 14, 298);
      pdf.text('- Menentukan prioritas optimasi konten berdasarkan ER dan tren terbaru', marginX + 14, 316);
      drawFooter();

      // Executive summary page
      var insight = _collectPresentationInsights();
      startNewPage('Executive Summary', insight.updatedAt || 'Ringkasan performa terbaru');
      var y1 = drawInsightsTable('Ringkasan Umum', insight.summaryPairs, contentTop + 4);
      drawInsightsTable('Ringkasan Campaign', insight.campaignPairs, y1 + 14);

      // Visual pages
      await addSectionCapture('sec-overview', '1) Ringkasan', 'Overview akun, growth, snapshot, dan ranking');
      await addSectionCapture('sec-engagement', '2) Interaksi', 'Grafik performa dan perbandingan head-to-head');
      await addSectionCapture('sec-content', '3) Performa Konten', 'Breakdown konten dan heatmap posting');
      await addSectionCapture('sec-history', '4) Riwayat & Insight', 'Insight utama dari data historis');

      pdf.save('instagram-dashboard-report-' + new Date().toISOString().slice(0,10) + '.pdf');
      overlay.style.display = 'none';
    } catch (err) {
      msg.textContent = 'Gagal export PDF: ' + (err && err.message ? err.message : err);
      setTimeout(function(){ overlay.style.display = 'none'; }, 2500);
    }
  }).catch(function(err){
    msg.textContent = 'Gagal load library: ' + err.message;
    setTimeout(function(){ overlay.style.display = 'none'; }, 2000);
  });
}
window.exportPNG = exportPNG;
window.exportPDF = exportPDF;
