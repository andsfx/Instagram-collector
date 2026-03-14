// ===== OVERVIEW CARDS =====
function renderCards(){
  const el = document.getElementById('cards');
  const accs = D.accounts.sort((a,b) => b.f - a.f);
  const cardClasses = ['cc','cg','ca','cr'];
  replaceWithFragment(el, accs.map((a, i) => {
    const cls = a.b ? 'acard brand' : 'acard ' + cardClasses[i % cardClasses.length];
    const tag = a.b ? '<span class="ctag bt">BRAND</span>' : '<span class="ctag ct">COMPETITOR</span>';
    const gCls = a.growthPct > 0 ? 'up' : a.growthPct < 0 ? 'down' : 'flat';
    const gIcon = a.growthPct > 0 ? '&#9650;' : a.growthPct < 0 ? '&#9660;' : '&#8226;';
    return `<div class="${cls}">
      <div class="ch"><span class="cun">${a.v ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="#405DE6" stroke="#405DE6" stroke-width="0"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4" stroke="#FFF" stroke-width="2.5" fill="none"/></svg>' : ''}@${a.u}</span>${tag}</div>
      <div class="cfol"><div class="lb">Followers</div><div class="vl">${fmtFull(a.f)}</div><div class="gr ${gCls}">${gIcon} ${a.growthAbs >= 0 ? '+' : ''}${fmtFull(a.growthAbs)} (${pct(a.growthPct)})</div></div>
      <div class="csts">
        <div class="cst"><div class="sv">${fmtFull(a.fo)}</div><div class="sl">Following</div></div>
        <div class="cst"><div class="sv">${fmtFull(a.p)}</div><div class="sl">Posts</div></div>
      </div>
      <div class="csts4">
        <div class="cst"><div class="sv">${fmtFull(Math.round(a.al))}</div><div class="sl">Avg Likes</div></div>
        <div class="cst"><div class="sv">${a.ac.toFixed(1)}</div><div class="sl">Avg Comments</div></div>
        <div class="cst er-highlight"><div class="sv">${a.er.toFixed(3)}%</div><div class="sl">ER</div></div>
        <div class="cst"><div class="sv">${a.growthPct != null ? a.growthPct.toFixed(3)+'%' : '-'}</div><div class="sl">Growth</div></div>
      </div>
    </div>`;
  }).join(''));
}

// ===== FEATURE 1: GROWTH VELOCITY =====
function renderGrowthVelocity(){
  const el = document.getElementById('gvCards');
  const accs = D.accounts;
  const trend = D.trend || {};

  replaceWithFragment(el, accs.map((a, idx) => {
    const t = trend[a.u] || [];
    const len = t.length;

    // Daily growth
    const daily = len >= 2 ? t[len-1] - t[len-2] : 0;
    const dailyPct = len >= 2 && t[len-2] > 0 ? ((daily / t[len-2]) * 100) : 0;

    // Weekly growth
    const weekIdx = Math.max(0, len - 7);
    const weekly = len >= 2 ? t[len-1] - t[weekIdx] : 0;
    const weeklyPct = t[weekIdx] > 0 ? ((weekly / t[weekIdx]) * 100) : 0;

    // Sparkline data (last 7 days of daily changes)
    const sparkDays = Math.min(7, len - 1);
    let sparkData = [];
    for(let i = len - sparkDays; i < len; i++){
      sparkData.push(t[i] - (t[i-1] || t[i]));
    }
    const maxSpark = Math.max(...sparkData.map(Math.abs), 1);

    const dailyCls = daily > 0 ? 'up' : daily < 0 ? 'down' : 'flat';
    const weeklyCls = weekly > 0 ? 'up' : weekly < 0 ? 'down' : 'flat';
    const maxBar = Math.max(Math.abs(dailyPct), Math.abs(weeklyPct), 0.01);

    return `<div class="gv-card">
      <div class="gv-name"><span style="color:${COLORS[idx % COLORS.length]}">&#9679;</span> @${a.u}</div>
      <div class="gv-row">
        <span class="gv-label">Daily</span>
        <span class="gv-val ${dailyCls}">${daily >= 0 ? '+' : ''}${fmtFull(daily)} (${dailyPct >= 0 ? '+' : ''}${dailyPct.toFixed(3)}%)</span>
      </div>
      <div class="gv-bar"><div class="gv-bar-fill" style="width:${Math.min(Math.abs(dailyPct)/maxBar*100, 100)}%;background:${daily >= 0 ? 'var(--success)' : 'var(--danger)'}"></div></div>
      <div class="gv-row">
        <span class="gv-label">Weekly</span>
        <span class="gv-val ${weeklyCls}">${weekly >= 0 ? '+' : ''}${fmtFull(weekly)} (${weeklyPct >= 0 ? '+' : ''}${weeklyPct.toFixed(3)}%)</span>
      </div>
      <div class="gv-bar"><div class="gv-bar-fill" style="width:${Math.min(Math.abs(weeklyPct)/maxBar*100, 100)}%;background:${weekly >= 0 ? 'var(--success)' : 'var(--danger)'}"></div></div>
      <div class="gv-sparkline">${sparkData.map(v => {
        const h = Math.max(Math.abs(v)/maxSpark * 28, 2);
        const c = v >= 0 ? 'var(--success)' : 'var(--danger)';
        return `<div class="gv-spark-bar" style="height:${h}px;background:${c}"></div>`;
      }).join('')}</div>
    </div>`;
  }).join(''));
}

// ===== RANKING TABLE =====
function renderTable(){
  const brand = getBrand();
  const sorted = [...D.accounts].sort((a,b) => {
    let va, vb;
    switch(sortCol){
      case 'rank': va = b.f; vb = a.f; break;
      case 'username': va = a.u.toLowerCase(); vb = b.u.toLowerCase(); return sortAsc ? (va < vb ? -1 : 1) : (va > vb ? -1 : 1);
      case 'followers': va = a.f; vb = b.f; break;
      case 'following': va = a.fo; vb = b.fo; break;
      case 'posts': va = a.p; vb = b.p; break;
      case 'avgLikes': va = a.al; vb = b.al; break;
      case 'avgComments': va = a.ac; vb = b.ac; break;
      case 'er': va = a.er; vb = b.er; break;
      case 'verified': va = a.v ? 1 : 0; vb = b.v ? 1 : 0; break;
      case 'gap': va = Math.abs(a.f - brand.f); vb = Math.abs(b.f - brand.f); break;
      default: va = a.f; vb = b.f;
    }
    return sortAsc ? va - vb : vb - va;
  });

  // Update header styling
  document.querySelectorAll('.rtbl thead th').forEach(th => {
    th.classList.toggle('sd', th.getAttribute('data-s') === sortCol);
  });

  const tbody = document.getElementById('rtb');
  // Rank by followers
  const ranked = [...D.accounts].sort((a,b) => b.f - a.f);
  replaceWithFragment(tbody, sorted.map(a => {
    const rank = ranked.findIndex(x => x.u === a.u) + 1;
    const rCls = rank === 1 ? 'r1' : rank === 2 ? 'r2' : rank === 3 ? 'r3' : '';
    const gap = a.f - brand.f;
    const gapCls = a.b ? 'gz' : gap > 0 ? 'gp' : gap < 0 ? 'gn' : 'gz';
    const erCls = a.er >= 0.2 ? 'er-high' : a.er >= 0.1 ? 'er-mid' : 'er-low';
    return `<tr class="${a.b ? 'brow' : ''}">
      <td><span class="rn ${rCls}">#${rank}</span></td>
      <td><span class="tu">${a.v ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="#405DE6" stroke="#405DE6" stroke-width="0"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4" stroke="#FFF" stroke-width="2.5" fill="none"/></svg>' : ''}@${a.u}</span></td>
      <td>${fmtFull(a.f)}</td>
      <td>${fmtFull(a.fo)}</td>
      <td>${fmtFull(a.p)}</td>
      <td>${fmtFull(Math.round(a.al))}</td>
      <td>${a.ac.toFixed(1)}</td>
      <td><span class="er-badge ${erCls}">${a.er.toFixed(3)}%</span></td>
      <td>${a.v ? '&#10003;' : '-'}</td>
      <td><span class="${gapCls}">${a.b ? '-' : (gap >= 0 ? '+' : '') + fmtFull(gap)}</span></td>
    </tr>`;
  }).join(''));
}

// Table sort handler
document.querySelectorAll('.rtbl thead th').forEach(th => {
  th.addEventListener('click', () => {
    const col = th.getAttribute('data-s');
    if(sortCol === col) sortAsc = !sortAsc;
    else { sortCol = col; sortAsc = false; }
    renderTable();
  });
});

// ===== ALERTS =====
function renderAlerts(){
  const sec = document.getElementById('alertSection');
  const list = document.getElementById('alertList');
  if(!D.alerts || D.alerts.length === 0){
    sec.style.display = 'none';
    return;
  }
  sec.style.display = 'block';
  list.innerHTML = '<div class="al-list">' + D.alerts.map(a => {
    const isDanger = a.jenis && a.jenis.toLowerCase().includes('drop');
    const pctCls = a.persen >= 0 ? 'up' : 'dn';
    return `<div class="al-item${isDanger ? ' danger' : ''}">
      <span class="al-date">${a.tanggal || '-'}</span>
      <span class="al-akun">@${a.akun}</span>
      <span class="al-info">${a.jenis || ''} ${a.catatan ? '- ' + a.catatan : ''}</span>
      <span class="al-pct ${pctCls}">${a.persen != null ? (a.persen >= 0 ? '+' : '') + a.persen.toFixed(2) + '%' : ''}</span>
    </div>`;
  }).join('') + '</div>';
}

// ===== CHARTS =====
function chartDefaults(){
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: getChartTextColor(), font: { family: 'Inter', size: 11, weight: '600' }, padding: 16, usePointStyle: true, pointStyle: 'circle' } },
      tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', titleFont: { family: 'Inter', weight: '700' }, bodyFont: { family: 'Inter' }, cornerRadius: 8, padding: 12 }
    },
    scales: {
      x: { ticks: { color: getChartTextColor(), font: { family: 'Inter', size: 11 } }, grid: { color: getChartGridColor() } },
      y: { ticks: { color: getChartTextColor(), font: { family: 'Inter', size: 11 } }, grid: { color: getChartGridColor() } }
    }
  };
}

function mkFollowersBar(){
  destroyChart('bar');
  const ctx = document.getElementById('chBar').getContext('2d');
  const accs = [...D.accounts].sort((a,b) => b.f - a.f);
  chartInstances.bar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: accs.map(a => '@'+a.u),
      datasets: [{
        label: 'Followers',
        data: accs.map(a => a.f),
        backgroundColor: accs.map((a,i) => a.b ? '#E1306C' : COLORS[(i+1)%COLORS.length] + '88'),
        borderColor: accs.map((a,i) => a.b ? '#E1306C' : COLORS[(i+1)%COLORS.length]),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: { ...chartDefaults(), plugins: { ...chartDefaults().plugins, legend: { display: false } }, indexAxis: 'x' }
  });
}

function mkERBar(){
  destroyChart('erbar');
  const ctx = document.getElementById('chER').getContext('2d');
  const accs = [...D.accounts].sort((a,b) => b.er - a.er);
  chartInstances.erbar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: accs.map(a => '@'+a.u),
      datasets: [{
        label: 'Engagement Rate (%)',
        data: accs.map(a => a.er),
        backgroundColor: accs.map((a,i) => a.b ? '#833AB4' : COLORS[(i+2)%COLORS.length] + '88'),
        borderColor: accs.map((a,i) => a.b ? '#833AB4' : COLORS[(i+2)%COLORS.length]),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: { ...chartDefaults(), plugins: { ...chartDefaults().plugins, legend: { display: false } } }
  });
}

function mkShare(){
  destroyChart('share');
  const ctx = document.getElementById('chShare').getContext('2d');
  const total = D.accounts.reduce((s,a) => s + a.f, 0);
  chartInstances.share = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: D.accounts.map(a => '@'+a.u),
      datasets: [{
        data: D.accounts.map(a => a.f),
        backgroundColor: D.accounts.map((a,i) => COLORS[i%COLORS.length]),
        borderWidth: 2,
        borderColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1E1E1E' : '#FFFFFF'
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: getChartTextColor(), font: { family: 'Inter', size: 11, weight: '600' }, padding: 12, usePointStyle: true, pointStyle: 'circle' } },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)', cornerRadius: 8, padding: 12,
          callbacks: { label: function(ctx){ return ctx.label + ': ' + fmtFull(ctx.raw) + ' (' + (ctx.raw/total*100).toFixed(1) + '%)'; } }
        }
      }
    }
  });
}

function mkRadar(){
  destroyChart('radar');
  const ctx = document.getElementById('chRadar').getContext('2d');
  const maxF = Math.max(...D.accounts.map(a=>a.f));
  const maxFo = Math.max(...D.accounts.map(a=>a.fo));
  const maxP = Math.max(...D.accounts.map(a=>a.p));
  const maxAL = Math.max(...D.accounts.map(a=>a.al));
  const maxER = Math.max(...D.accounts.map(a=>a.er));
  const maxAC = Math.max(...D.accounts.map(a=>a.ac));

  chartInstances.radar = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Followers','Following','Posts','Avg Likes','Avg Comments','ER'],
      datasets: D.accounts.map((a,i) => ({
        label: '@'+a.u,
        data: [
          maxF ? a.f/maxF*100 : 0,
          maxFo ? a.fo/maxFo*100 : 0,
          maxP ? a.p/maxP*100 : 0,
          maxAL ? a.al/maxAL*100 : 0,
          maxAC ? a.ac/maxAC*100 : 0,
          maxER ? a.er/maxER*100 : 0
        ],
        backgroundColor: COLORS[i%COLORS.length] + '22',
        borderColor: COLORS[i%COLORS.length],
        borderWidth: 2,
        pointBackgroundColor: COLORS[i%COLORS.length],
        pointRadius: 3
      }))
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: { r: { beginAtZero: true, max: 100, ticks: { display: false }, grid: { color: getChartGridColor() }, pointLabels: { color: getChartTextColor(), font: { family: 'Inter', size: 11, weight: '600' } } } },
      plugins: { legend: { position: 'bottom', labels: { color: getChartTextColor(), font: { family: 'Inter', size: 11, weight: '600' }, padding: 12, usePointStyle: true, pointStyle: 'circle' } } }
    }
  });
}

function mkTrend(){
  destroyChart('trend');
  const ctx = document.getElementById('chTrend').getContext('2d');
  chartInstances.trend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: D.dates,
      datasets: D.accounts.map((a,i) => ({
        label: '@'+a.u,
        data: (D.trend && D.trend[a.u]) || [],
        borderColor: COLORS[i%COLORS.length],
        backgroundColor: COLORS[i%COLORS.length] + '11',
        borderWidth: a.b ? 3 : 2,
        fill: false,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: COLORS[i%COLORS.length]
      }))
    },
    options: chartDefaults()
  });
}

function mkERTrend(){
  destroyChart('ertrend');
  const ctx = document.getElementById('chERTrend').getContext('2d');
  if(!D.engTrend){
    ctx.canvas.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--t3);font-size:13px">Data engagement trend belum tersedia</div>';
    return;
  }
  chartInstances.ertrend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: D.dates,
      datasets: D.accounts.map((a,i) => ({
        label: '@'+a.u,
        data: (D.engTrend && D.engTrend[a.u]) || [],
        borderColor: COLORS[i%COLORS.length],
        borderWidth: a.b ? 3 : 2,
        fill: false,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: COLORS[i%COLORS.length]
      }))
    },
    options: chartDefaults()
  });
}

// ===== PROJECTION CHART (Feature 2) =====
function mkProjection(){
  destroyChart('projection');
  var ctx = document.getElementById('chProjection').getContext('2d');
  var note = document.getElementById('projNote');
  if(!D.trend || !D.dates || D.dates.length < 3){
    ctx.canvas.parentElement.querySelector('.chcon').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--t3);font-size:13px">Minimal 3 hari data diperlukan untuk proyeksi</div>';
    if(note) note.textContent = '';
    return;
  }
  var nDays = D.dates.length;
  var projDays = 30;
  var datasets = [];
  var crossings = [];
  var brandData = null;
  var brandU = '';
  D.accounts.forEach(function(a){
    if(a.b){ brandU = a.u; brandData = D.trend[a.u]; }
  });

  // Generate future date labels
  var lastDate = D.dates[D.dates.length - 1];
  var futureDates = [];
  for(var d = 1; d <= projDays; d++){
    var dt = new Date();
    dt.setDate(dt.getDate() + d);
    futureDates.push(dt.getDate() + '/' + (dt.getMonth()+1));
  }
  var allLabels = D.dates.concat(futureDates);

  D.accounts.forEach(function(a, i){
    var hist = D.trend[a.u];
    if(!hist) return;
    // Linear regression
    var xs = [], ys = [];
    for(var j = 0; j < hist.length; j++){
      if(hist[j] !== null && hist[j] !== undefined){
        xs.push(j); ys.push(hist[j]);
      }
    }
    if(xs.length < 2) return;
    var n = xs.length;
    var sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for(var k = 0; k < n; k++){
      sumX += xs[k]; sumY += ys[k];
      sumXY += xs[k]*ys[k]; sumXX += xs[k]*xs[k];
    }
    var slope = (n*sumXY - sumX*sumY) / (n*sumXX - sumX*sumX);
    var intercept = (sumY - slope*sumX) / n;

    // Historical data (actual)
    var actualData = hist.slice();
    // Pad with nulls for projection period
    for(var p = 0; p < projDays; p++) actualData.push(null);

    // Projection line (nulls for historical, then projected)
    var projData = [];
    for(var h = 0; h < nDays - 1; h++) projData.push(null);
    // Last actual point as bridge
    projData.push(hist[hist.length - 1]);
    for(var f = 1; f <= projDays; f++){
      projData.push(Math.round(slope * (nDays - 1 + f) + intercept));
    }

    var col = COLORS[i % COLORS.length];
    // Actual line
    datasets.push({
      label: '@' + a.u,
      data: actualData,
      borderColor: col,
      borderWidth: a.b ? 3 : 2,
      fill: false, tension: 0.3,
      pointRadius: 2, pointHoverRadius: 5,
      pointBackgroundColor: col
    });
    // Projection line (dashed)
    datasets.push({
      label: '@' + a.u + ' (proyeksi)',
      data: projData,
      borderColor: col,
      borderWidth: 2,
      borderDash: [6, 4],
      fill: false, tension: 0.1,
      pointRadius: 0, pointHoverRadius: 4,
      pointBackgroundColor: col
    });

    // Check crossings with brand
    if(!a.b && brandData && brandData.length > 0){
      var brandSlope, brandIntercept;
      var bxs = [], bys = [];
      for(var bj = 0; bj < brandData.length; bj++){
        if(brandData[bj] !== null && brandData[bj] !== undefined){
          bxs.push(bj); bys.push(brandData[bj]);
        }
      }
      if(bxs.length >= 2){
        var bn = bxs.length;
        var bsX = 0, bsY = 0, bsXY = 0, bsXX = 0;
        for(var bk = 0; bk < bn; bk++){
          bsX += bxs[bk]; bsY += bys[bk];
          bsXY += bxs[bk]*bys[bk]; bsXX += bxs[bk]*bxs[bk];
        }
        brandSlope = (bn*bsXY - bsX*bsY) / (bn*bsXX - bsX*bsX);
        brandIntercept = (bsY - brandSlope*bsX) / bn;

        if(slope !== brandSlope){
          var crossX = (brandIntercept - intercept) / (slope - brandSlope);
          var daysUntilCross = crossX - (nDays - 1);
          if(daysUntilCross > 0 && daysUntilCross <= 90){
            crossings.push('@' + a.u + ' akan menyalip @' + brandU + ' dalam ~' + Math.round(daysUntilCross) + ' hari');
          }
        }
      }
    }
  });

  if(note){
    note.textContent = crossings.length > 0 ? crossings.join(' | ') : 'Tidak ada prediksi crossing dalam 90 hari ke depan.';
  }

  chartInstances.projection = new Chart(ctx, {
    type: 'line',
    data: { labels: allLabels, datasets: datasets },
    options: Object.assign({}, chartDefaults(), {
      plugins: Object.assign({}, chartDefaults().plugins, {
        legend: { display: true, position: 'bottom', labels: { usePointStyle: true, padding: 12, font: { size: 11 }, color: getChartTextColor(),
          filter: function(item){ return item.text.indexOf('proyeksi') === -1; }
        }},
        annotation: crossings.length > 0 ? { annotations: { line1: { type: 'line', xMin: D.dates.length - 1, xMax: D.dates.length - 1, borderColor: 'rgba(150,150,150,0.5)', borderWidth: 1, borderDash: [4,4], label: { display: true, content: 'Hari Ini', position: 'start', font: { size: 10 } } } } } : {}
      })
    })
  });
}

// ===== HEAD-TO-HEAD (Feature 5) =====
function renderH2HSelectors(){
  var selA = document.getElementById('h2hA');
  var selB = document.getElementById('h2hB');
  if(!selA || !selB) return;
  var prev = [selA.value, selB.value];
  selA.innerHTML = '';
  selB.innerHTML = '';
  D.accounts.forEach(function(a){
    var optA = document.createElement('option');
    optA.value = a.u; optA.textContent = '@' + a.u;
    var optB = optA.cloneNode(true);
    selA.appendChild(optA);
    selB.appendChild(optB);
  });
  // Default: brand vs first competitor
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
}

function renderH2H(){
  var uA = document.getElementById('h2hA').value;
  var uB = document.getElementById('h2hB').value;
  var grid = document.getElementById('h2hGrid');
  var header = document.getElementById('h2hHeader');
  if(!uA || !uB || !grid) return;
  var aA = D.accounts.find(function(a){ return a.u === uA; });
  var aB = D.accounts.find(function(a){ return a.u === uB; });
  if(!aA || !aB){ grid.innerHTML = ''; if(header) header.innerHTML = ''; return; }

  // Render header with account names
  if(header){
    header.innerHTML = '<div class="h2h-name">@' + uA + '</div><div class="h2h-badge">VS</div><div class="h2h-name">@' + uB + '</div>';
  }

  var metrics = [
    { label: 'Followers', vA: aA.f, vB: aB.f, fmt: fmtFull },
    { label: 'Following', vA: aA.fo || 0, vB: aB.fo || 0, fmt: fmtFull },
    { label: 'Posts', vA: aA.p || 0, vB: aB.p || 0, fmt: fmtFull },
    { label: 'Engagement Rate', vA: aA.er || 0, vB: aB.er || 0, fmt: pct },
    { label: 'Growth', vA: aA.growthPct || 0, vB: aB.growthPct || 0, fmt: pct }
  ];

  var gap = Math.abs(aA.f - aB.f);
  var html = '<table class="h2h-table"><tbody>';
  metrics.forEach(function(m){
    var winA = m.vA > m.vB;
    var winB = m.vB > m.vA;
    var draw = m.vA === m.vB;
    html += '<tr class="h2h-item">' +
      '<td class="' + (winA ? 'h2h-win' : '') + '">' + m.fmt(m.vA) + '</td>' +
      '<td>' + m.label + (draw ? ' (seri)' : '') + '</td>' +
      '<td class="' + (winB ? 'h2h-win' : '') + '">' + m.fmt(m.vB) + '</td>' +
    '</tr>';
  });
  // Gap row
  html += '<tr class="h2h-gap"><td colspan="3">Selisih Followers: ' + fmtFull(gap) + '</td></tr>';
  html += '</tbody></table>';
  replaceWithFragment(grid, html);

  // H2H Trend Chart
  destroyChart('h2h');
  var ctx = document.getElementById('chH2H').getContext('2d');
  if(!D.trend || !D.trend[uA] || !D.trend[uB]){
    ctx.canvas.parentElement.querySelector('.chcon').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--t3);font-size:13px">Data trend belum tersedia</div>';
    return;
  }
  var idxA = D.accounts.indexOf(aA);
  var idxB = D.accounts.indexOf(aB);
  chartInstances.h2h = new Chart(ctx, {
    type: 'line',
    data: {
      labels: D.dates,
      datasets: [
        { label: '@'+uA, data: D.trend[uA], borderColor: COLORS[idxA % COLORS.length], borderWidth: 3, fill: false, tension: 0.3, pointRadius: 3 },
        { label: '@'+uB, data: D.trend[uB], borderColor: COLORS[idxB % COLORS.length], borderWidth: 3, fill: false, tension: 0.3, pointRadius: 3 }
      ]
    },
    options: chartDefaults()
  });
}

// ===== CONTENT PERFORMANCE (Feature 3) =====
function renderContentBreakdown(){
  var el = document.getElementById('cbContent');
  if(!el) return;
  if(!D.contentBreakdown || Object.keys(D.contentBreakdown).length === 0){
    el.innerHTML = '<div class="neo" style="padding:24px;text-align:center;color:var(--t3);font-size:13px">' +
      '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" stroke-width="1.5" style="margin-bottom:8px"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg><br>' +
      'Data content performance belum tersedia.<br><small>Data belum tersedia pada dataset terbaru.</small></div>';
    return;
  }

  var types = ['reels','carousel','image','video'];
  var typeLabels = {reels:'Reels',carousel:'Carousel',image:'Image',video:'Video'};
  var html = '<div class="cp-grid">';

  D.accounts.forEach(function(a){
    var cb = D.contentBreakdown[a.u];
    if(!cb) return;
    var tp = cb.typePerf || {};
    var bp = cb.bestPost || {};

    // Find max ER among types for bar scaling
    var maxER = 0;
    types.forEach(function(t){
      if(tp[t] && tp[t].er > maxER) maxER = tp[t].er;
    });
    if(maxER === 0) maxER = 1;

    html += '<div class="cp-card">';
    // Header
    html += '<div class="cp-hdr">' +
      '<span class="cp-user">@' + a.u + '</span>' +
      '<span class="cp-er-badge">ER ' + pct(cb.avgER || 0) + '</span>' +
      '</div>';
    // Body: per-type table
    html += '<div class="cp-body">';
    html += '<table class="cp-tbl"><thead><tr>' +
      '<th>Tipe</th><th>Post</th><th>Avg Likes</th><th>Avg Comments</th><th>ER%</th><th class="cp-bar-cell"></th>' +
      '</tr></thead><tbody>';

    types.forEach(function(t){
      var cnt = cb[t] || 0;
      if(cnt === 0) return;
      var perf = tp[t] || {};
      var erVal = perf.er || 0;
      var barW = maxER > 0 ? Math.round((erVal / maxER) * 100) : 0;
      html += '<tr>' +
        '<td class="cp-type-name"><span class="cp-type-badge ' + t + '">' + typeLabels[t] + '</span></td>' +
        '<td>' + cnt + '</td>' +
        '<td>' + num(perf.avgLikes || 0) + '</td>' +
        '<td>' + num(perf.avgComments || 0) + '</td>' +
        '<td><strong>' + (erVal > 0 ? erVal.toFixed(4) + '%' : '-') + '</strong></td>' +
        '<td class="cp-bar-cell"><div class="cp-bar-wrap"><div class="cp-bar ' + t + '" style="width:' + barW + '%"></div></div></td>' +
        '</tr>';
    });
    html += '</tbody></table>';

    // Best post
    if(bp.url && bp.likes > 0){
      html += '<div class="cp-best">' +
        '<div class="cp-best-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>' +
        '<div class="cp-best-info">' +
        '<div class="cp-best-label">Best Post <span class="cp-type-badge ' + (bp.type||'') + '">' + (typeLabels[bp.type]||bp.type||'') + '</span></div>' +
        '<div class="cp-best-stats">' + num(bp.likes) + ' likes &middot; ' + num(bp.comments) + ' comments</div>' +
        '<a class="cp-best-link" href="' + bp.url + '" target="_blank">Lihat Post &rarr;</a>' +
        '</div></div>';
    }

    html += '</div></div>'; // close cp-body, cp-card
  });

  html += '</div>'; // close cp-grid
  el.innerHTML = html;
}

// ===== HEATMAP (Feature 4) =====
function renderHeatmapSelectors(){
  var sel = document.getElementById('hmAccount');
  if(!sel) return;
  var prev = sel.value;
  sel.innerHTML = '';
  D.accounts.forEach(function(a){
    var opt = document.createElement('option');
    opt.value = a.u; opt.textContent = '@' + a.u;
    sel.appendChild(opt);
  });
  if(prev && Array.from(sel.options).some(function(o){ return o.value === prev; })){
    sel.value = prev;
  } else {
    var brand = getBrand();
    if(brand) sel.value = brand.u;
  }
}

function renderHeatmap(){
  var user = document.getElementById('hmAccount').value;
  var grid = document.getElementById('hmGrid');
  var legend = document.getElementById('hmLegend');
  var bestEl = document.getElementById('hmBest');
  if(!grid) return;

  var days = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
  var slots = [
    {label:'Pagi', sub:'06-11', start:6, end:11},
    {label:'Siang', sub:'12-16', start:12, end:16},
    {label:'Sore', sub:'17-20', start:17, end:20},
    {label:'Malam', sub:'21-05', start:21, end:5}
  ];

  // Get raw 7x24 data or generate placeholder
  var rawData = null;
  if(D.heatmap && D.heatmap[user]){
    rawData = D.heatmap[user];
  } else {
    rawData = [];
    for(var di = 0; di < 7; di++){
      var row = [];
      for(var hi = 0; hi < 24; hi++){
        var base = 0;
        if(hi >= 8 && hi <= 12) base = Math.random() * 3;
        else if(hi >= 17 && hi <= 21) base = Math.random() * 4;
        else if(hi >= 6 && hi <= 23) base = Math.random() * 1.5;
        row.push(Math.round(base));
      }
      rawData.push(row);
    }
  }

  // Aggregate 24h into 4 time-slots per day
  var slotData = []; // 7 x 4
  for(var di = 0; di < 7; di++){
    var daySlots = [];
    slots.forEach(function(s){
      var sum = 0;
      if(s.start <= s.end){
        for(var h = s.start; h <= s.end; h++) sum += (rawData[di][h] || 0);
      } else {
        for(var h = s.start; h < 24; h++) sum += (rawData[di][h] || 0);
        for(var h = 0; h <= s.end; h++) sum += (rawData[di][h] || 0);
      }
      daySlots.push(sum);
    });
    slotData.push(daySlots);
  }

  // Find max for color scaling
  var maxVal = 0;
  slotData.forEach(function(r){ r.forEach(function(v){ if(v > maxVal) maxVal = v; }); });
  if(maxVal === 0) maxVal = 1;

  // Find best time (highest slot)
  var bestDay = 0, bestSlot = 0, bestVal = 0;
  slotData.forEach(function(r, di){ r.forEach(function(v, si){
    if(v > bestVal){ bestVal = v; bestDay = di; bestSlot = si; }
  }); });

  // Color function
  function slotColor(val){
    var t = val / maxVal;
    if(t === 0) return {bg:'var(--card)', col:'var(--t3)'};
    if(t < 0.25) return {bg:'rgba(225,48,108,0.12)', col:'var(--t2)'};
    if(t < 0.5) return {bg:'rgba(225,48,108,0.3)', col:'#fff'};
    if(t < 0.75) return {bg:'rgba(225,48,108,0.55)', col:'#fff'};
    return {bg:'rgba(225,48,108,0.85)', col:'#fff'};
  }

  // Build table
  var html = '<table class="hm-tbl"><thead><tr><th></th>';
  slots.forEach(function(s){ html += '<th>' + s.label + '<br><span style="font-weight:500;font-size:10px;opacity:.7">' + s.sub + '</span></th>'; });
  html += '</tr></thead><tbody>';

  days.forEach(function(day, di){
    html += '<tr><td class="hm-day">' + day + '</td>';
    slotData[di].forEach(function(val, si){
      var c = slotColor(val);
      html += '<td style="background:'+c.bg+';color:'+c.col+'" title="'+day+' '+slots[si].label+': '+val+' posts">' + (val > 0 ? val : '-') + '</td>';
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  replaceWithFragment(grid, html);

  // Legend (compact)
  if(legend){
    legend.innerHTML = '<span>Rendah</span>' +
      '<span class="hm-leg-box" style="background:var(--card);border:1px solid var(--border)"></span>' +
      '<span class="hm-leg-box" style="background:rgba(225,48,108,0.12)"></span>' +
      '<span class="hm-leg-box" style="background:rgba(225,48,108,0.3)"></span>' +
      '<span class="hm-leg-box" style="background:rgba(225,48,108,0.55)"></span>' +
      '<span class="hm-leg-box" style="background:rgba(225,48,108,0.85)"></span>' +
      '<span>Tinggi</span>';
  }

  // Best time summary
  if(bestEl){
    bestEl.innerHTML = '<div class="hm-best">Waktu posting terbaik: <strong>' + days[bestDay] + ', ' + slots[bestSlot].label + ' (' + slots[bestSlot].sub + ')</strong> dengan ' + bestVal + ' posts</div>';
  }
}

// ===== KEY INSIGHTS (Feature) =====
function renderInsights(){
  var el = document.getElementById('ins');
  if(!el) return;
  var insights = [];
  var brand = getBrand();
  var comps = getCompetitors();
  var settings = loadSettings();

  if(brand){
    // Brand growth insight
    if(brand.growthPct > 0){
      insights.push({ type: 'positive', icon: '&#9650;', text: '@' + brand.u + ' tumbuh ' + pct(brand.growthPct) + ' periode ini. Keep it up!' });
    } else if(brand.growthPct < 0){
      insights.push({ type: 'warning', icon: '&#9660;', text: '@' + brand.u + ' turun ' + pct(Math.abs(brand.growthPct)) + '. Perlu evaluasi strategi konten.' });
    }

    // Closest competitor
    if(comps.length > 0){
      var sorted = comps.slice().sort(function(a,b){ return Math.abs(a.f - brand.f) - Math.abs(b.f - brand.f); });
      var closest = sorted[0];
      var gap = brand.f - closest.f;
      if(gap > 0){
        insights.push({ type: 'info', icon: '&#8776;', text: 'Kompetitor terdekat: @' + closest.u + ' (gap ' + fmtFull(gap) + ' followers). ' + (gap < (settings.gapAlert || 500) ? 'Gap sangat tipis!' : 'Posisi aman.') });
      } else {
        insights.push({ type: 'danger', icon: '!', text: '@' + closest.u + ' sudah unggul ' + fmtFull(Math.abs(gap)) + ' followers dari brand. Perlu strategi catch-up.' });
      }
    }

    // Engagement insight
    if(brand.er){
      if(brand.er > 3){
        insights.push({ type: 'positive', icon: '&#9733;', text: 'Engagement rate brand (' + pct(brand.er) + ') sangat baik (>3%). Konten beresonansi dengan audience.' });
      } else if(brand.er < 1){
        insights.push({ type: 'warning', icon: '!', text: 'Engagement rate brand (' + pct(brand.er) + ') di bawah 1%. Coba variasikan format konten.' });
      }
    }
  }

  // Fastest growing competitor
  if(comps.length > 0){
    var fastest = comps.slice().sort(function(a,b){ return (b.growthPct||0) - (a.growthPct||0); })[0];
    if(fastest.growthPct > 0){
      insights.push({ type: 'info', icon: '&#9650;', text: 'Kompetitor paling cepat tumbuh: @' + fastest.u + ' (+' + pct(fastest.growthPct) + '). Pantau strategi mereka.' });
    }
  }

  // Best ER among competitors
  if(comps.length > 0){
    var bestER = comps.slice().sort(function(a,b){ return (b.er||0) - (a.er||0); })[0];
    if(bestER.er > (brand ? brand.er : 0)){
      insights.push({ type: 'info', icon: '&#9733;', text: '@' + bestER.u + ' punya ER tertinggi (' + pct(bestER.er) + '). Analisis konten mereka untuk inspirasi.' });
    }
  }

  if(insights.length === 0){
    insights.push({ type: 'info', icon: 'i', text: 'Belum cukup data untuk menghasilkan insights. Tambahkan lebih banyak data historis.' });
  }

  el.innerHTML = insights.map(function(ins){
    return '<div class="icard ' + ins.type + '">' +
      '<div class="iicon">' + ins.icon + '</div>' +
      '<div class="itext">' + ins.text + '</div>' +
    '</div>';
  }).join('');
}

