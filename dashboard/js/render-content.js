// ===== CONTENT PERFORMANCE (Feature 3) =====
function renderContentBreakdown(){
  var el = document.getElementById('cbContent');
  var highlights = document.getElementById('contentHighlights');
  if(!el) return;
  if(!dashData().contentBreakdown || Object.keys(dashData().contentBreakdown).length === 0){
    if (highlights) highlights.innerHTML = '';
    el.innerHTML = '<div class="neo" style="padding:24px;text-align:center;color:var(--t3);font-size:13px">' +
      '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" stroke-width="1.5" style="margin-bottom:8px"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg><br>' +
      'Data content performance belum tersedia.<br><small>Data belum tersedia pada dataset terbaru.</small></div>';
    return;
  }

  var types = ['reels','carousel','image','video'];
  var typeLabels = {reels:'Reels',carousel:'Carousel',image:'Image',video:'Video'};
  var formatTotals = { reels:0, carousel:0, image:0, video:0 };
  var bestOwner = null;
  Object.entries(dashData().contentBreakdown).forEach(function(entry){
    var username = entry[0];
    var cb = entry[1] || {};
    types.forEach(function(t){ formatTotals[t] += Number(cb[t] || 0); });
    if (cb.bestPost && cb.bestPost.likes > 0) {
      if (!bestOwner || (cb.bestPost.likes || 0) > (bestOwner.likes || 0)) {
        bestOwner = { username: username, likes: cb.bestPost.likes || 0, type: cb.bestPost.type || '' };
      }
    }
  });
  var topFormat = Object.entries(formatTotals).sort((a,b) => b[1]-a[1])[0] || ['reels',0];
  var mostEfficient = Object.entries(dashData().contentBreakdown).sort(function(a,b){ return (b[1].avgER || 0) - (a[1].avgER || 0); })[0];
  if (highlights) {
    highlights.innerHTML = [
      { k:'Format Terbanyak', v:typeLabels[topFormat[0]] || topFormat[0], s:fmtFull(topFormat[1]) + ' post' },
      { k:'ER Tertinggi', v:mostEfficient ? ('@' + mostEfficient[0]) : '—', s:mostEfficient ? pct(mostEfficient[1].avgER || 0) : '—' },
      { k:'Best Post Owner', v:bestOwner ? ('@' + bestOwner.username) : '—', s:bestOwner ? (fmtFull(bestOwner.likes) + ' likes · ' + ((typeLabels[bestOwner.type] || bestOwner.type || 'Post'))) : '—' }
    ].map(function(card){ return '<div class="cp-mini"><div class="k">' + card.k + '</div><div class="v">' + card.v + '</div><div class="s">' + card.s + '</div></div>'; }).join('');
  }
  var html = '<div class="cp-grid">';

  dashData().accounts.forEach(function(a){
    var cb = dashData().contentBreakdown[a.u];
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
    var topType = types.slice().sort(function(x,y){ return (cb[y] || 0) - (cb[x] || 0); })[0];
    // Header
    var erTone = (cb.avgER || 0) >= 0.03 ? 'strong' : (cb.avgER || 0) >= 0.01 ? 'watch' : 'weak';
    var erText = erTone === 'strong' ? 'ER kuat' : erTone === 'watch' ? 'ER moderat' : 'ER perlu perhatian';
    html += '<div class="cp-hdr">' +
      '<span class="cp-user">@' + a.u + '</span>' +
      '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span class="cp-topformat">Top Format: ' + (typeLabels[topType] || topType) + '</span><span class="cp-er-badge ' + erTone + '"><span aria-hidden="true">' + (erTone === 'strong' ? '&#9733;' : erTone === 'watch' ? '&#9673;' : '&#33;') + '</span> ER ' + pct(cb.avgER || 0) + ' · ' + erText + '</span></div>' +
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

    html += '<div class="cp-insight">Format paling aktif: <strong>' + (typeLabels[topType] || topType) + '</strong> · total ' + fmtFull(cb[topType] || 0) + ' post · rerata ER akun ' + pct(cb.avgER || 0) + '</div>';

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
  dashData().accounts.forEach(function(a){
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
  if(dashData().heatmap && dashData().heatmap[user]){
    rawData = dashData().heatmap[user];
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
      var intensity = val === 0 ? 'belum ada aktivitas' : val >= Math.ceil(maxVal * 0.75) ? 'slot terpadat' : val >= Math.ceil(maxVal * 0.4) ? 'aktivitas menengah' : 'aktivitas ringan';
      html += '<td style="background:'+c.bg+';color:'+c.col+'" title="'+day+' · '+slots[si].label+' ('+slots[si].sub+') · '+val+' post · '+intensity+'">' + (val > 0 ? val : '-') + '</td>';
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
      insights.push({ type: 'positive', icon: '↗', text: '@' + brand.u + ' tumbuh ' + pct(brand.growthPct) + ' periode ini. Keep it up!' });
    } else if(brand.growthPct < 0){
      insights.push({ type: 'warning', icon: '↘', text: '@' + brand.u + ' turun ' + pct(Math.abs(brand.growthPct)) + '. Perlu evaluasi strategi konten.' });
    }

    // Closest competitor
    if(comps.length > 0){
      var sorted = comps.slice().sort(function(a,b){ return Math.abs(a.f - brand.f) - Math.abs(b.f - brand.f); });
      var closest = sorted[0];
      var gap = brand.f - closest.f;
      if(gap > 0){
        insights.push({ type: 'info', icon: '◎', text: 'Kompetitor terdekat: @' + closest.u + ' (gap ' + fmtFull(gap) + ' followers). ' + (gap < (settings.gapAlert || 500) ? 'Gap sangat tipis!' : 'Posisi aman.') });
      } else {
        insights.push({ type: 'danger', icon: '⚠', text: '@' + closest.u + ' sudah unggul ' + fmtFull(Math.abs(gap)) + ' followers dari brand. Perlu strategi catch-up.' });
      }
    }

    // Engagement insight
    if(brand.er){
      if(brand.er > 0.03){
        insights.push({ type: 'positive', icon: '★', text: 'Engagement rate brand (' + pct(brand.er) + ') sangat baik (>3%). Konten beresonansi dengan audience.' });
      } else if(brand.er < 0.01){
        insights.push({ type: 'warning', icon: '⚠', text: 'Engagement rate brand (' + pct(brand.er) + ') di bawah 1%. Coba variasikan format konten.' });
      }
    }
  }

  // Fastest growing competitor
  if(comps.length > 0){
    var fastest = comps.slice().sort(function(a,b){ return (b.growthPct||0) - (a.growthPct||0); })[0];
    if(fastest.growthPct > 0){
      insights.push({ type: 'info', icon: '↗', text: 'Kompetitor paling cepat tumbuh: @' + fastest.u + ' (+' + pct(fastest.growthPct) + '). Pantau strategi mereka.' });
    }
  }

  // Best ER among competitors
  if(comps.length > 0){
    var bestER = comps.slice().sort(function(a,b){ return (b.er||0) - (a.er||0); })[0];
    if(bestER.er > (brand ? brand.er : 0)){
      insights.push({ type: 'info', icon: '★', text: '@' + bestER.u + ' punya ER tertinggi (' + pct(bestER.er) + '). Analisis konten mereka untuk inspirasi.' });
    }
  }

  if(insights.length === 0){
    insights.push({ type: 'info', icon: 'ℹ', text: 'Belum cukup data untuk menghasilkan insights. Tambahkan lebih banyak data historis.' });
  }

  el.innerHTML = insights.map(function(ins){
    return '<div class="icard ' + ins.type + '">' +
      '<div class="iicon">' + ins.icon + '</div>' +
      '<div class="itext">' + ins.text + '</div>' +
    '</div>';
  }).join('');
}

