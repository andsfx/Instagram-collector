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
  const accs = [...dashData().accounts].sort((a,b) => b.f - a.f);
  dashState().chartInstances.bar = new Chart(ctx, {
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
  const accs = [...dashData().accounts].sort((a,b) => b.er - a.er);
  dashState().chartInstances.erbar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: accs.map(a => '@'+a.u),
      datasets: [{
        label: 'Engagement Rate (%)',
        data: accs.map(a => a.er != null ? a.er * 100 : 0),
        backgroundColor: accs.map((a,i) => a.b ? '#833AB4' : COLORS[(i+2)%COLORS.length] + '88'),
        borderColor: accs.map((a,i) => a.b ? '#833AB4' : COLORS[(i+2)%COLORS.length]),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: { 
      ...chartDefaults(), 
      plugins: { 
        ...chartDefaults().plugins, 
        legend: { display: false },
        tooltip: { 
          backgroundColor: 'rgba(0,0,0,0.8)', 
          titleFont: { family: 'Inter', weight: '700' }, 
          bodyFont: { family: 'Inter' }, 
          cornerRadius: 8, 
          padding: 12,
          callbacks: { 
            label: function(ctx){ return 'ER: ' + (ctx.raw != null ? ctx.raw.toFixed(2) + '%' : 'N/A'); } 
          }
        }
      },
      scales: {
        ...chartDefaults().scales,
        y: { 
          ...chartDefaults().scales.y, 
          ticks: { 
            ...chartDefaults().scales.y.ticks, 
            callback: function(v){ return v.toFixed(1) + '%'; } 
          } 
        }
      }
    }
  });
}

function mkShare(){
  destroyChart('share');
  const ctx = document.getElementById('chShare').getContext('2d');
  const total = dashData().accounts.reduce((s,a) => s + a.f, 0);
  dashState().chartInstances.share = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: dashData().accounts.map(a => '@'+a.u),
      datasets: [{
        data: dashData().accounts.map(a => a.f),
        backgroundColor: dashData().accounts.map((a,i) => COLORS[i%COLORS.length]),
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
  const maxF = Math.max(...dashData().accounts.map(a=>a.f));
  const maxFo = Math.max(...dashData().accounts.map(a=>a.fo));
  const maxP = Math.max(...dashData().accounts.map(a=>a.p));
  const maxAL = Math.max(...dashData().accounts.map(a=>a.al));
  const maxER = Math.max(...dashData().accounts.map(a=>a.er));
  const maxAC = Math.max(...dashData().accounts.map(a=>a.ac));

  dashState().chartInstances.radar = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Followers','Following','Posts','Avg Likes','Avg Comments','ER'],
      datasets: dashData().accounts.map((a,i) => ({
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
  dashState().chartInstances.trend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dashData().dates,
      datasets: dashData().accounts.map((a,i) => ({
        label: '@'+a.u,
        data: (dashData().trend && dashData().trend[a.u]) || [],
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
  if(!dashData().engTrend){
    ctx.canvas.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--t3);font-size:13px">Data engagement trend belum tersedia</div>';
    return;
  }
  dashState().chartInstances.ertrend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dashData().dates,
      datasets: dashData().accounts.map((a,i) => ({
        label: '@'+a.u,
        data: (dashData().engTrend && dashData().engTrend[a.u] && dashData().engTrend[a.u].map(v => v != null ? v * 100 : null)) || [],
        borderColor: COLORS[i%COLORS.length],
        borderWidth: a.b ? 3 : 2,
        fill: false,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: COLORS[i%COLORS.length]
      }))
    },
    options: {
      ...chartDefaults(),
      scales: {
        ...chartDefaults().scales,
        y: {
          ...chartDefaults().scales.y,
          ticks: {
            ...chartDefaults().scales.y.ticks,
            callback: function(v){ return v.toFixed(1) + '%'; }
          }
        }
      },
      plugins: {
        ...chartDefaults().plugins,
        tooltip: {
          ...chartDefaults().plugins.tooltip,
          callbacks: {
            label: function(ctx){ return ctx.dataset.label + ': ' + (ctx.raw != null ? ctx.raw.toFixed(2) + '%' : 'N/A'); }
          }
        }
      }
    }
  });
}

// ===== PROJECTION CHART (Feature 2) =====
function mkProjection(){
  destroyChart('projection');
  var ctx = document.getElementById('chProjection').getContext('2d');
  var note = document.getElementById('projNote');
  if(!dashData().trend || !dashData().dates || dashData().dates.length < 3){
    ctx.canvas.parentElement.querySelector('.chcon').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--t3);font-size:13px">Minimal 3 hari data diperlukan untuk proyeksi</div>';
    if(note) note.textContent = '';
    return;
  }
  var nDays = dashData().dates.length;
  var projDays = 30;
  var datasets = [];
  var crossings = [];
  var brandData = null;
  var brandU = '';
  dashData().accounts.forEach(function(a){
    if(a.b){ brandU = a.u; brandData = dashData().trend[a.u]; }
  });

  // Generate future date labels
  var lastDate = dashData().dates[dashData().dates.length - 1];
  var futureDates = [];
  for(var d = 1; d <= projDays; d++){
    var dt = new Date();
    dt.setDate(dt.getDate() + d);
    futureDates.push(dt.getDate() + '/' + (dt.getMonth()+1));
  }
  var allLabels = dashData().dates.concat(futureDates);

  dashData().accounts.forEach(function(a, i){
    var hist = dashData().trend[a.u];
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

  dashState().chartInstances.projection = new Chart(ctx, {
    type: 'line',
    data: { labels: allLabels, datasets: datasets },
    options: Object.assign({}, chartDefaults(), {
      plugins: Object.assign({}, chartDefaults().plugins, {
        legend: { display: true, position: 'bottom', labels: { usePointStyle: true, padding: 12, font: { size: 11 }, color: getChartTextColor(),
          filter: function(item){ return item.text.indexOf('proyeksi') === -1; }
        }},
        annotation: crossings.length > 0 ? { annotations: { line1: { type: 'line', xMin: dashData().dates.length - 1, xMax: dashData().dates.length - 1, borderColor: 'rgba(150,150,150,0.5)', borderWidth: 1, borderDash: [4,4], label: { display: true, content: 'Hari Ini', position: 'start', font: { size: 10 } } } } } : {}
      })
    })
  });
}

