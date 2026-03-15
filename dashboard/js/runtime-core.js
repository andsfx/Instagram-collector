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
function titleCase(value){
  if(!value) return '-';
  return String(value).split(/[_\s-]+/).filter(Boolean).map(function(part){ return part.charAt(0).toUpperCase() + part.slice(1); }).join(' ');
}
window.COLORS = COLORS;
window.DEFAULTS = DEFAULTS;
window.DEBUG_MODE = DEBUG_MODE;
window.titleCase = titleCase;
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


function _getPresentationReport(){
  var data = window.getDashboardData ? window.getDashboardData() : window.IG_DASH_STATE && window.IG_DASH_STATE.data;
  return data && data.presentation_report ? data.presentation_report : null;
}

function _formatPresentationDate(value){
  if(!value) return '-';
  var d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta'
  }) + ' WIB';
}

function _loadBrandLogoDataURL(){
  var logoPath = './assets/metropolitan-mall-logo.png';
  return fetch(logoPath).then(function(res){
    if(!res.ok) throw new Error('logo fetch failed');
    return res.blob();
  }).then(function(blob){
    return new Promise(function(resolve, reject){
      var reader = new FileReader();
      reader.onload = function(){
        var dataUrl = reader.result;
        var img = new Image();
        img.onload = function(){ resolve({ dataUrl: dataUrl, width: img.width, height: img.height }); };
        img.onerror = function(){ resolve({ dataUrl: dataUrl, width: 0, height: 0 }); };
        img.src = dataUrl;
      };
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
      var BRAND = {
        pink: [225, 55, 125],
        pinkSoft: [246, 213, 226],
        tosca: [31, 184, 176],
        toscaSoft: [214, 244, 240],
        dark: [24, 34, 52],
        bg: [248, 248, 246],
        line: [222, 225, 231],
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
      function drawBrandPill(label, x, y, invert){
        if(invert){
          pdf.setFillColor(255,255,255);
          pdf.roundedRect(x, y, 118, 20, 8, 8, 'F');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
          pdf.text(label, x + 10, y + 13);
        } else {
          pdf.setFillColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
          pdf.roundedRect(x, y, 118, 20, 8, 8, 'F');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.setTextColor(255,255,255);
          pdf.text(label, x + 10, y + 13);
        }
      }

      function drawDecorativeCircles(style){
        style = style || 'light';
        var topColor = style === 'cover' ? BRAND.tosca : BRAND.line;
        var accentColor = style === 'cover' ? BRAND.pink : [196, 198, 204];
        pdf.setDrawColor(topColor[0], topColor[1], topColor[2]);
        pdf.circle(pageW - 88, 48, 26, 'S');
        pdf.circle(28, 110, 22, 'S');
        pdf.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
        pdf.circle(86, pageH - 46, 26, 'S');
        pdf.circle(pageW - 120, pageH - 36, 40, 'S');
        var dots = style === 'cover' ? [BRAND.pink, BRAND.tosca, [196,198,204]] : [[196,198,204],[196,198,204],[196,198,204]];
        dots.forEach(function(c, idx){
          pdf.setFillColor(c[0], c[1], c[2]);
          pdf.circle(pageW - 86 + idx * 36, pageH - 46, 14, 'F');
        });
      }

      function drawFooter(){
        pdf.setDrawColor(226, 231, 239);
        pdf.line(marginX, pageH - 24, pageW - marginX, pageH - 24);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
        pdf.text('Competitor Performance Report · Metropolitan Mall Bekasi', marginX, pageH - 11);
        pdf.setTextColor(BRAND.pink[0], BRAND.pink[1], BRAND.pink[2]);
        pdf.text('Halaman ' + pageCount, pageW - marginX - 44, pageH - 11);
      }

      function header(title, subtitle){
        pdf.setFillColor(BRAND.bg[0], BRAND.bg[1], BRAND.bg[2]);
        pdf.rect(0, 0, pageW, 82, 'F');
        drawDecorativeCircles('light');
        drawBrandPill('COMPETITOR REPORT', marginX, 18, false);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(22);
        pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
        pdf.text(title, marginX, 56);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10.5);
        pdf.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
        pdf.text(subtitle || '', pageW - marginX - 220, 30);
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
      drawDecorativeCircles('cover');
      drawBrandPill('COMPETITOR REPORT', marginX, 28, false);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(15);
      pdf.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
      pdf.text('Instagram', marginX, 128);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(34);
      pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
      pdf.text('competitor', marginX, 176);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(34);
      pdf.setTextColor(BRAND.tosca[0], BRAND.tosca[1], BRAND.tosca[2]);
      pdf.text('performance', marginX + 176, 176);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(16);
      pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
      pdf.text('report', marginX, 212);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11.5);
      pdf.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
      pdf.text('Laporan ringkas performa kompetitor Instagram', marginX, 238);
      var dateLabel = 'Dibuat: ' + _formatPresentationDate(new Date().toISOString());
      pdf.text(dateLabel, marginX, 258);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(marginX, 294, 286, 84, 14, 14, 'F');
      pdf.setDrawColor(230,233,238);
      pdf.roundedRect(marginX, 294, 286, 84, 14, 14, 'S');
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
      pdf.setFontSize(12);
      pdf.text('Tujuan Laporan', marginX + 16, 320);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10.5);
      pdf.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
      pdf.text('• Memantau posisi kompetitor dari sisi audience, growth, dan engagement', marginX + 16, 342);
      pdf.text('• Mengidentifikasi campaign, format konten, dan akun yang paling menonjol', marginX + 16, 360);
      drawFooter();

      var report = _getPresentationReport();

      function drawKpiCards(cards, startY, options){
        options = options || {};
        var cols = options.cols || 3;
        var gap = options.gap || 12;
        var cardW = (contentW - gap * (cols - 1)) / cols;
        var cardH = options.cardH || 84;
        cards.forEach(function(card, idx){
          var col = idx % cols;
          var row = Math.floor(idx / cols);
          var x = marginX + (cardW + gap) * col;
          var y = startY + row * (cardH + 12);
          pdf.setFillColor(255,255,255);
          pdf.roundedRect(x, y, cardW, cardH, 10, 10, 'F');
          pdf.setDrawColor(228,232,240);
          pdf.roundedRect(x, y, cardW, cardH, 10, 10, 'S');
          pdf.setFillColor(BRAND.tosca[0], BRAND.tosca[1], BRAND.tosca[2]);
          pdf.roundedRect(x, y, 8, cardH, 10, 10, 'F');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
          pdf.text(String(card.label || '-').toUpperCase(), x + 18, y + 16);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(18);
          pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
          pdf.text(String(card.value || '-'), x + 18, y + 40);
          if(card.account){
            pdf.setFillColor(BRAND.pinkSoft[0], BRAND.pinkSoft[1], BRAND.pinkSoft[2]);
            pdf.roundedRect(x + 16, y + 50, 86, 18, 8, 8, 'F');
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.setTextColor(BRAND.pink[0], BRAND.pink[1], BRAND.pink[2]);
            pdf.text('@' + card.account, x + 24, y + 62);
          }
        });
        return startY + Math.ceil(cards.length / cols) * (cardH + 12);
      }

      function drawBullets(items, startY, title){
        pdf.setFillColor(255,255,255);
        pdf.roundedRect(marginX, startY - 14, contentW, 118, 10, 10, 'F');
        pdf.setDrawColor(228,232,240);
        pdf.roundedRect(marginX, startY - 14, contentW, 118, 10, 10, 'S');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
        pdf.text(title, marginX + 12, startY + 4);
        var y = startY + 24;
        (items || []).slice(0, 4).forEach(function(item){
          pdf.setFillColor(BRAND.pink[0], BRAND.pink[1], BRAND.pink[2]);
          pdf.circle(marginX + 18, y - 3, 2.5, 'F');
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10.5);
          pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
          var lines = pdf.splitTextToSize(String(item || '-'), contentW - 38);
          pdf.text(lines, marginX + 28, y);
          y += lines.length * 12 + 7;
        });
      }

      function drawOverviewTable(rows){
        startNewPage('Competitive Overview', 'Perbandingan lintas akun pada update ' + _formatPresentationDate(report?.meta?.generatedAtWib || report?.meta?.generatedAt));
        var headers = ['Akun','Followers','Growth','ER','Avg Post ER','Format','Viral'];
        var widths = [150, 92, 72, 62, 96, 90, 52];
        var totalW = widths.reduce((a,b)=>a+b,0);
        var x = marginX;
        var y = contentTop;
        pdf.setFillColor(243,247,248);
        pdf.roundedRect(marginX, y, totalW, 26, 8, 8, 'F');
        headers.forEach(function(h, i){
          pdf.setFont('helvetica','bold'); pdf.setFontSize(9.5); pdf.setTextColor(BRAND.tosca[0], BRAND.tosca[1], BRAND.tosca[2]);
          pdf.text(h, x + 8, y + 16); x += widths[i];
        });
        y += 32;
        (rows || []).slice(0, 5).forEach(function(row, idx){
          x = marginX;
          var isLeader = row.positioningTag === 'Leader';
          if(isLeader){ pdf.setFillColor(240,252,248); pdf.roundedRect(marginX, y-2, totalW, 28, 4, 4, 'F'); }
          else if(idx % 2 === 0){ pdf.setFillColor(252,253,254); pdf.roundedRect(marginX, y-2, totalW, 28, 0, 0, 'F'); }
          pdf.setDrawColor(isLeader ? 190 : 232, isLeader ? 229 : 236, isLeader ? 220 : 242);
          pdf.rect(marginX, y-2, totalW, 28);
          var vals = ['@'+row.account, row.followersLabel, row.growthLabel, row.engagementRateLabel, row.avgPostErLabel, titleCase(row.dominantType), String(row.viralPosts || 0)];
          vals.forEach(function(v, i){
            pdf.setFont(i===0 ? 'helvetica':'helvetica', i===0 ? 'bold':'normal'); pdf.setFontSize(9.5); pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
            if(i===2 && String(v).startsWith('+')) pdf.setTextColor(BRAND.tosca[0], BRAND.tosca[1], BRAND.tosca[2]);
            if(i===6 && Number(v) >= 3) pdf.setTextColor(BRAND.pink[0], BRAND.pink[1], BRAND.pink[2]);
            pdf.text(String(v), x + 8, y + 15); x += widths[i];
          });
          if(isLeader){
            pdf.setFillColor(BRAND.toscaSoft[0], BRAND.toscaSoft[1], BRAND.toscaSoft[2]);
            pdf.roundedRect(marginX + totalW - 58, y + 3, 46, 14, 7, 7, 'F');
            pdf.setFont('helvetica','bold'); pdf.setFontSize(7.5); pdf.setTextColor(BRAND.tosca[0], BRAND.tosca[1], BRAND.tosca[2]);
            pdf.text('LEADER', marginX + totalW - 48, y + 13);
          }
          y += 30;
        });
      }

      function drawGrowthPositioning(gp){
        startNewPage('Growth & Positioning', 'Posisi kompetitif dan peran tiap akun');
        var leftX = marginX;
        var rightX = pageW / 2 + 10;
        pdf.setFont('helvetica','bold'); pdf.setFontSize(12); pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
        pdf.text('Ranking Growth', leftX, contentTop);
        var y = contentTop + 18;
        (gp?.growthRanking || []).slice(0,5).forEach(function(item, idx){
          pdf.setFillColor(255,255,255); pdf.roundedRect(leftX, y, 230, 24, 6, 6, 'F');
          pdf.setDrawColor(232,236,242); pdf.roundedRect(leftX, y, 230, 24, 6, 6, 'S');
          pdf.text((idx+1)+'. @'+item.account, leftX+8, y+15);
          pdf.setTextColor(BRAND.pink[0], BRAND.pink[1], BRAND.pink[2]); pdf.text(item.label, leftX+180, y+15);
          pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
          y += 30;
        });
        pdf.setFont('helvetica','bold'); pdf.setFontSize(12); pdf.text('Positioning', rightX, contentTop);
        y = contentTop + 18;
        (gp?.roles || []).slice(0,5).forEach(function(item){
          var accent = item.role === 'Leader' ? BRAND.tosca : item.role === 'High Engagement' ? BRAND.pink : item.role === 'Challenger' ? [95,205,191] : [140,150,165];
          pdf.setFillColor(255,255,255); pdf.roundedRect(rightX, y, 260, 50, 8, 8, 'F');
          pdf.setDrawColor(232,236,242); pdf.roundedRect(rightX, y, 260, 50, 8, 8, 'S');
          pdf.setFillColor(accent[0], accent[1], accent[2]); pdf.roundedRect(rightX, y, 8, 50, 8, 8, 'F');
          pdf.setFont('helvetica','bold'); pdf.setFontSize(10); pdf.setTextColor(accent[0], accent[1], accent[2]);
          pdf.text('@'+item.account+' · '+item.role, rightX+14, y+16);
          pdf.setFont('helvetica','normal'); pdf.setFontSize(9); pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
          pdf.text(pdf.splitTextToSize(item.reason, 234), rightX+14, y+32);
          y += 58;
        });
      }

      function drawCampaignAnalysis(ca){
        startNewPage('Campaign & Theme Analysis', 'Tema campaign, hashtag, dan format dominan');
        var y = contentTop;
        var cards = [
          { label: 'Tema Campaign Teratas', value: ca?.topCampaignTerm || 'Belum dominan' },
          { label: 'Hashtag Paling Sering', value: ca?.topHashtag || '-' },
          { label: 'Format Dominan', value: titleCase(ca?.topContentFormat || '-') }
        ];
        drawKpiCards(cards, y, { cardH: 70 });
        y += 142;
        pdf.setFont('helvetica','bold'); pdf.setFontSize(12); pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
        pdf.text('Ringkasan per akun', marginX, y);
        y += 16;
        (ca?.accounts || []).slice(0,5).forEach(function(item){
          pdf.setFillColor(255,255,255); pdf.roundedRect(marginX, y, contentW, 48, 8, 8, 'F');
          pdf.setDrawColor(232,236,242); pdf.roundedRect(marginX, y, contentW, 48, 8, 8, 'S');
          pdf.setFillColor(BRAND.toscaSoft[0], BRAND.toscaSoft[1], BRAND.toscaSoft[2]); pdf.roundedRect(marginX, y, 84, 48, 8, 8, 'F');
          pdf.setFont('helvetica','bold'); pdf.setFontSize(10); pdf.setTextColor(BRAND.tosca[0], BRAND.tosca[1], BRAND.tosca[2]);
          pdf.text('@'+item.account, marginX+10, y+20);
          pdf.setFont('helvetica','normal'); pdf.setFontSize(9); pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
          var line1 = 'Tema: ' + ((item.campaignTerms || []).join(', ') || '-');
          var line2 = 'Hashtag: ' + ((item.topHashtags || []).join(', ') || '-') + ' · Format: ' + titleCase(item.dominantType || '-');
          pdf.text(pdf.splitTextToSize(line1, 210), marginX+96, y+18);
          pdf.text(pdf.splitTextToSize(line2, 360), marginX+320, y+18);
          y += 56;
        });
        drawBullets(ca?.summary || [], y + 4, 'Insight Campaign');
      }

      function drawContentSnapshot(cards){
        startNewPage('12-Post Content Snapshot', 'Ringkasan kualitas konten terbaru per akun');
        var cols = 2;
        var gap = 14;
        var cardW = (contentW - gap) / cols;
        var cardH = 108;
        (cards || []).slice(0,5).forEach(function(item, idx){
          var col = idx % cols;
          var row = Math.floor(idx / cols);
          var x = marginX + col * (cardW + gap);
          var y = contentTop + row * (cardH + 12);
          pdf.setFillColor(255,255,255); pdf.roundedRect(x, y, cardW, cardH, 10, 10, 'F');
          pdf.setDrawColor(232,236,242); pdf.roundedRect(x, y, cardW, cardH, 10, 10, 'S');
          pdf.setFillColor(BRAND.toscaSoft[0], BRAND.toscaSoft[1], BRAND.toscaSoft[2]); pdf.roundedRect(x, y, cardW, 24, 10, 10, 'F');
          pdf.setFont('helvetica','bold'); pdf.setFontSize(11); pdf.setTextColor(BRAND.tosca[0], BRAND.tosca[1], BRAND.tosca[2]);
          pdf.text('@'+item.account, x+10, y+16);
          pdf.setFont('helvetica','bold'); pdf.setFontSize(10); pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
          pdf.text(item.averagePostErLabel, x + cardW - 52, y + 16);
          pdf.setFont('helvetica','normal'); pdf.setFontSize(9); pdf.text('Rata-rata ER', x + cardW - 110, y + 16);
          pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
          pdf.text('Avg likes: ' + item.averageLikesLabel, x+10, y+42);
          pdf.text('Avg komentar: ' + item.averageCommentsLabel, x+10, y+56);
          pdf.text('Format dominan: ' + titleCase(item.dominantType), x+10, y+70);
          pdf.setFillColor(248,233,239); pdf.roundedRect(x+10, y+80, 78, 18, 8, 8, 'F');
          pdf.setFillColor(BRAND.toscaSoft[0], BRAND.toscaSoft[1], BRAND.toscaSoft[2]); pdf.roundedRect(x+96, y+80, 104, 18, 8, 8, 'F');
          pdf.setFont('helvetica','normal'); pdf.setFontSize(8.5); pdf.setTextColor(BRAND.pink[0], BRAND.pink[1], BRAND.pink[2]);
          pdf.text('Post viral: ' + item.viralPosts, x+18, y+92);
          pdf.setTextColor(BRAND.tosca[0], BRAND.tosca[1], BRAND.tosca[2]);
          pdf.text('Perlu optimasi: ' + item.underperformPosts, x+104, y+92);
          pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
          pdf.text('Kualitas: ' + item.qualityTag, x+220, y+92);
        });
      }

      function drawViralHighlights(items){
        startNewPage('Viral Content Highlights', 'Konten dengan performa post terbaik lintas akun');
        var y = contentTop;
        (items || []).slice(0,5).forEach(function(item, idx){
          pdf.setFillColor(255,255,255); pdf.roundedRect(marginX, y, contentW, 64, 10, 10, 'F');
          pdf.setDrawColor(232,236,242); pdf.roundedRect(marginX, y, contentW, 64, 10, 10, 'S');
          pdf.setFillColor(248,233,239); pdf.roundedRect(marginX, y, 64, 64, 10, 10, 'F');
          pdf.setFont('helvetica','bold'); pdf.setFontSize(14); pdf.setTextColor(BRAND.pink[0], BRAND.pink[1], BRAND.pink[2]);
          pdf.text('#' + (idx+1), marginX + 22, y + 36);
          pdf.setFont('helvetica','bold'); pdf.setFontSize(10); pdf.text('@' + item.account + ' · ' + titleCase(item.type), marginX+76, y+18);
          pdf.setFont('helvetica','normal'); pdf.setFontSize(9); pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
          var snippet = String(item.captionSnippet || '-');
          if (snippet.length > 100) snippet = snippet.slice(0, 97) + '...';
          pdf.text(pdf.splitTextToSize(snippet, contentW - 92), marginX+76, y+33);
          pdf.setTextColor(BRAND.tosca[0], BRAND.tosca[1], BRAND.tosca[2]);
          pdf.text('ER ' + item.postErLabel, marginX+76, y+54);
          pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
          pdf.text('· ' + item.likes + ' likes · ' + item.comments + ' komentar · ' + item.publishedAtLabel, marginX+120, y+54);
          y += 72;
        });
      }

      function drawTakeawaysAndRecommendations(report){
        startNewPage('Strategic Takeaways & Recommendations', 'Insight utama dan langkah yang disarankan');
        drawBullets((report?.strategicTakeaways || []).map(function(item){ return item.title + ': ' + item.detail; }), contentTop, 'Strategic Takeaways');
        var recY = contentTop + 146;
        var blocks = [
          { title: 'Scale', items: report?.recommendations?.scale || [], color: BRAND.tosca },
          { title: 'Improve', items: report?.recommendations?.improve || [], color: BRAND.pink },
          { title: 'Watchlist', items: report?.recommendations?.watchlist || [], color: BRAND.dark }
        ];
        var blockW = (contentW - 24) / 3;
        blocks.forEach(function(block, idx){
          var x = marginX + idx * (blockW + 12);
          pdf.setFillColor(255,255,255); pdf.roundedRect(x, recY, blockW, 132, 10, 10, 'F');
          pdf.setDrawColor(232,236,242); pdf.roundedRect(x, recY, blockW, 132, 10, 10, 'S');
          pdf.setFillColor(block.color[0], block.color[1], block.color[2]); pdf.roundedRect(x, recY, blockW, 24, 10, 10, 'F');
          pdf.setFont('helvetica','bold'); pdf.setFontSize(11); pdf.setTextColor(255,255,255);
          pdf.text(block.title, x+10, recY+16);
          var yy = recY + 40;
          (block.items || []).slice(0,3).forEach(function(item){
            pdf.setFont('helvetica','normal'); pdf.setFontSize(9); pdf.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
            var lines = pdf.splitTextToSize('• ' + item, blockW - 18);
            pdf.text(lines, x+10, yy);
            yy += lines.length * 11 + 7;
          });
        });
      }

      if(report){
        startNewPage('Executive Summary', _formatPresentationDate(report.meta?.generatedAtWib || report.meta?.generatedAt));
        var y1 = drawKpiCards(report.executiveSummary?.kpis || [], contentTop + 4);
        drawBullets(report.executiveSummary?.bullets || [], y1 + 10, 'Key Takeaways');
        drawOverviewTable(report.competitiveOverview || []);
        drawGrowthPositioning(report.growthPositioning || {});
        drawCampaignAnalysis(report.campaignAnalysis || {});
        drawContentSnapshot(report.contentSnapshot || []);
        drawViralHighlights(report.viralHighlights || []);
        drawTakeawaysAndRecommendations(report);
      } else {
        var insight = _collectPresentationInsights();
        startNewPage('Executive Summary', insight.updatedAt || 'Ringkasan performa terbaru');
        var y1 = drawInsightsTable('Ringkasan Umum', insight.summaryPairs, contentTop + 4);
        drawInsightsTable('Ringkasan Campaign', insight.campaignPairs, y1 + 14);
        await addSectionCapture('sec-content', 'Performa Konten', 'Breakdown konten dan heatmap posting');
        await addSectionCapture('sec-history', 'Riwayat & Insight', 'Insight utama dari data historis');
      }

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
