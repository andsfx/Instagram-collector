// ===== HEAD-TO-HEAD (Feature 5) =====
function getH2HMetricOptions(){
  return {
    followers: { label: 'Followers', value: function(a){ return a.f || 0; }, series: function(u){ return (dashData().trend && dashData().trend[u]) || []; }, formatter: fmtFull, sub: 'Perbandingan followers seiring waktu' },
    engagement: { label: 'Engagement Rate', value: function(a){ return a.er || 0; }, series: function(u){ return (dashData().engTrend && dashData().engTrend[u]) || []; }, formatter: function(v){ return fmtPct(v, 3); }, sub: 'Perbandingan engagement rate seiring waktu' },
    avgLikes: { label: 'Avg Likes', value: function(a){ return a.al || 0; }, series: function(){ return []; }, formatter: fmtFull, sub: 'Metrik perbandingan ringkas untuk rata-rata likes' },
    growth: { label: 'Growth', value: function(a){ return a.growthPct || 0; }, series: function(){ return []; }, formatter: function(v){ return pct(v || 0); }, sub: 'Metrik perbandingan ringkas untuk growth periodik' }
  };
}

function setH2HPreset(kind){
  var brand = getBrand();
  var comps = getCompetitors();
  var selA = document.getElementById('h2hA');
  var selB = document.getElementById('h2hB');
  if (!selA || !selB || !brand) return;
  if (kind === 'brand-top-followers') {
    var topFollowers = comps.slice().sort(function(a,b){ return (b.f||0) - (a.f||0); })[0];
    if (topFollowers) { selA.value = brand.u; selB.value = topFollowers.u; }
  } else if (kind === 'brand-top-er') {
    var topER = comps.slice().sort(function(a,b){ return (b.er||0) - (a.er||0); })[0];
    if (topER) { selA.value = brand.u; selB.value = topER.u; }
  } else if (kind === 'top-two') {
    var ranked = dashData().accounts.slice().sort(function(a,b){ return (b.f||0) - (a.f||0); });
    if (ranked[0] && ranked[1]) { selA.value = ranked[0].u; selB.value = ranked[1].u; }
  }
  renderH2H();
}

function setH2HMetric(metric){
  setDashboardH2HMetric(metric);
  renderH2H();
}

function renderH2HSelectors(){
  var selA = document.getElementById('h2hA');
  var selB = document.getElementById('h2hB');
  var presetsEl = document.getElementById('h2hPresets');
  var metricsEl = document.getElementById('h2hMetrics');
  if(!selA || !selB) return;
  var prev = [selA.value, selB.value];
  selA.innerHTML = '';
  selB.innerHTML = '';
  dashData().accounts.forEach(function(a){
    var optA = document.createElement('option');
    optA.value = a.u; optA.textContent = '@' + a.u;
    var optB = optA.cloneNode(true);
    selA.appendChild(optA);
    selB.appendChild(optB);
  });
  if(prev[0] && Array.from(selA.options).some(function(o){ return o.value === prev[0]; })){
    selA.value = prev[0];
  } else {
    var brand = getBrand();
    if(brand) selA.value = brand.u;
  }
  if(prev[1] && Array.from(selB.options).some(function(o){ return o.value === prev[1]; })){
    selB.value = prev[1];
  } else {
    var comps = getCompetitors();
    if(comps.length > 0) selB.value = comps[0].u;
  }
  if (presetsEl) {
    var presets = [
      { id: 'brand-top-followers', label: 'Brand vs Top Followers' },
      { id: 'brand-top-er', label: 'Brand vs Top ER' },
      { id: 'top-two', label: 'Top 2 Accounts' }
    ];
    presetsEl.innerHTML = presets.map(function(p){ return '<button class="h2h-chip" data-preset="' + p.id + '">' + p.label + '</button>'; }).join('');
    Array.from(presetsEl.querySelectorAll('.h2h-chip')).forEach(function(btn){
      btn.addEventListener('click', function(){ setH2HPreset(btn.getAttribute('data-preset')); });
    });
  }
  if (metricsEl) {
    var metricOptions = getH2HMetricOptions();
    metricsEl.innerHTML = Object.keys(metricOptions).map(function(key){
      return '<button class="h2h-chip ' + (dashState().h2hMetric === key ? 'active' : '') + '" data-metric="' + key + '">' + metricOptions[key].label + '</button>';
    }).join('');
    Array.from(metricsEl.querySelectorAll('.h2h-chip')).forEach(function(btn){
      btn.addEventListener('click', function(){ setH2HMetric(btn.getAttribute('data-metric')); });
    });
  }
}

function renderH2H(){
  var selA = document.getElementById('h2hA');
  var selB = document.getElementById('h2hB');
  if(!selA || !selB) return;
  var uA = selA.value;
  var uB = selB.value;
  var grid = document.getElementById('h2hGrid');
  var header = document.getElementById('h2hHeader');
  var metricSub = document.getElementById('h2hTrendSub');
  var metricsEl = document.getElementById('h2hMetrics');
  if(!uA || !uB || !grid) return;
  var aA = dashData().accounts.find(function(a){ return a.u === uA; });
  var aB = dashData().accounts.find(function(a){ return a.u === uB; });
  if(!aA || !aB){ grid.innerHTML = ''; if(header) header.innerHTML = ''; return; }
  if (metricsEl) {
    Array.from(metricsEl.querySelectorAll('.h2h-chip')).forEach(function(btn){
      btn.classList.toggle('active', btn.textContent === getH2HMetricOptions()[dashState().h2hMetric].label);
    });
  }

  if(header){
    header.innerHTML = '<div class="h2h-name" title="@' + escapeHtml(uA) + '">@' + escapeHtml(uA) + '</div><div class="h2h-badge">VS</div><div class="h2h-name" title="@' + escapeHtml(uB) + '">@' + escapeHtml(uB) + '</div>';
  }

  var metricOptions = getH2HMetricOptions();
  var activeMetric = metricOptions[dashState().h2hMetric] || metricOptions.followers;
  var metrics = [
    { label: 'Followers', vA: aA.f, vB: aB.f, fmt: fmtFull },
    { label: 'Following', vA: aA.fo || 0, vB: aB.fo || 0, fmt: fmtFull },
    { label: 'Posts', vA: aA.p || 0, vB: aB.p || 0, fmt: fmtFull },
    { label: 'Engagement Rate', vA: aA.er || 0, vB: aB.er || 0, fmt: pct },
    { label: 'Growth', vA: aA.growthPct || 0, vB: aB.growthPct || 0, fmt: pct }
  ];

  var gap = Math.abs(aA.f - aB.f);
  var winsA = 0, winsB = 0;
  metrics.forEach(function(m){ if (m.vA > m.vB) winsA += 1; else if (m.vB > m.vA) winsB += 1; });
  var winner = winsA === winsB ? null : (winsA > winsB ? aA : aB);
  var loser = winsA === winsB ? null : (winsA > winsB ? aB : aA);
  var activeA = activeMetric.value(aA);
  var activeB = activeMetric.value(aB);
  var totalWins = Math.max(winsA + winsB, 1);
  var verdictHtml = '<div class="h2h-verdict"><div class="ttl">Quick Verdict</div><div class="txt">';
  if (winner) {
    verdictHtml += '@' + escapeHtml(winner.u) + ' unggul keseluruhan atas @' + escapeHtml(loser.u) + ' (' + (winsA > winsB ? winsA : winsB) + ' dari ' + metrics.length + ' metrik).';
  } else {
    verdictHtml += '@' + escapeHtml(aA.u) + ' dan @' + escapeHtml(aB.u) + ' masih berimbang pada metrik utama.';
  }
  verdictHtml += '</div><div class="sub">Pada metrik aktif <strong>' + activeMetric.label + '</strong>, ' + (activeA === activeB ? 'keduanya masih imbang.' : ('@' + escapeHtml(activeA > activeB ? aA.u : aB.u) + ' lebih unggul dengan nilai ' + activeMetric.formatter((activeA > activeB ? activeA : activeB)))) + '</div>' +
    '<div class="h2h-scorebar" aria-label="Distribusi kemenangan per metrik"><div class="h2h-scorebar-side a" style="width:' + Math.max((winsA / totalWins) * 100, winsA ? 18 : 0) + '%">@' + escapeHtml(aA.u) + ': ' + winsA + '</div><div class="h2h-scorebar-side b" style="width:' + Math.max((winsB / totalWins) * 100, winsB ? 18 : 0) + '%">' + winsB + ' :@' + escapeHtml(aB.u) + '</div></div></div>';
  var html = verdictHtml + '<table class="h2h-table"><tbody>';
  metrics.forEach(function(m){
    var winA = m.vA > m.vB;
    var winB = m.vB > m.vA;
    var draw = m.vA === m.vB;
    var total = Math.max(Math.abs(m.vA) + Math.abs(m.vB), 1);
    var barA = draw ? 50 : Math.max((Math.abs(m.vA) / total) * 100, winA ? 12 : 6);
    var barB = draw ? 50 : Math.max((Math.abs(m.vB) / total) * 100, winB ? 12 : 6);
    html += '<tr class="h2h-item">' +
      '<td class="' + (winA ? 'h2h-win' : '') + '"><div class="h2h-metric-value">' + m.fmt(m.vA) + '</div><div class="h2h-mini-bar"><span class="fill a" style="width:' + Math.min(barA, 100) + '%"></span></div></td>' +
      '<td>' + m.label + (draw ? ' (seri)' : '') + '</td>' +
      '<td class="' + (winB ? 'h2h-win' : '') + '"><div class="h2h-metric-value">' + m.fmt(m.vB) + '</div><div class="h2h-mini-bar is-right"><span class="fill b" style="width:' + Math.min(barB, 100) + '%"></span></div></td>' +
    '</tr>';
  });
  html += '<tr class="h2h-gap"><td colspan="3">Selisih Followers: ' + fmtFull(gap) + '</td></tr>';
  html += '</tbody></table>';
  replaceWithFragment(grid, html);

  if(typeof Chart === 'undefined'){
    if(typeof queueChartBootstrap === 'function') queueChartBootstrap();
    return;
  }
  destroyChart('h2h');
  var ctx = document.getElementById('chH2H').getContext('2d');
  var seriesA = activeMetric.series(uA);
  var seriesB = activeMetric.series(uB);
  if (metricSub) metricSub.textContent = activeMetric.sub;
  if(!seriesA || !seriesA.length || !seriesB || !seriesB.length){
    var noDataEl = ctx.canvas.parentElement.querySelector('.h2h-no-data');
    if(!noDataEl){
      noDataEl = document.createElement('div');
      noDataEl.className = 'h2h-no-data';
      noDataEl.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100%;color:var(--t3);font-size:13px;position:absolute;inset:0;background:var(--card)';
      ctx.canvas.parentElement.style.position = 'relative';
      ctx.canvas.parentElement.appendChild(noDataEl);
    }
    noDataEl.textContent = 'Trend untuk metrik ini belum tersedia';
    noDataEl.style.display = 'flex';
    ctx.canvas.style.display = 'none';
    return;
  }
  // Ensure canvas is visible and no-data overlay is hidden when data exists
  ctx.canvas.style.display = '';
  var existingNoData = ctx.canvas.parentElement.querySelector('.h2h-no-data');
  if(existingNoData) existingNoData.style.display = 'none';
  var idxA = dashData().accounts.indexOf(aA);
  var idxB = dashData().accounts.indexOf(aB);
  dashState().chartInstances.h2h = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dashData().dates,
      datasets: [
        { label: '@'+uA, data: seriesA, borderColor: COLORS[idxA % COLORS.length], borderWidth: 3, fill: false, tension: 0.3, pointRadius: 3 },
        { label: '@'+uB, data: seriesB, borderColor: COLORS[idxB % COLORS.length], borderWidth: 3, fill: false, tension: 0.3, pointRadius: 3 }
      ]
    },
    options: chartDefaults()
  });
  if(ctx.canvas.closest('.chcon')) ctx.canvas.closest('.chcon').classList.add('loaded');
}

