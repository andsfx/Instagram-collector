(function(window){
  function fmt(n){
    if(n == null) return '-';
    if(n >= 1e6) return (n/1e6).toFixed(1)+'M';
    if(n >= 1e3) return (n/1e3).toFixed(1)+'K';
    return n.toLocaleString('id-ID');
  }

  function fmtFull(n){
    if(n == null) return '-';
    return Math.round(n).toLocaleString('id-ID');
  }

  function pct(n){
    if(n == null) return '-';
    return n >= 0 ? '+'+n.toFixed(3)+'%' : n.toFixed(3)+'%';
  }

  function num(n){
    if(n == null || n === 0) return '0';
    return Number(n).toLocaleString('id-ID',{maximumFractionDigits:1});
  }

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

  function getChartTextColor(){
    return document.documentElement.getAttribute('data-theme') === 'dark' ? '#B0B0B0' : '#555555';
  }

  function getChartGridColor(){
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  }

  function destroyChart(key){
    var charts = window.getDashboardCharts ? window.getDashboardCharts() : null;
    if(charts && charts[key]){
      charts[key].destroy();
      delete charts[key];
    }
  }

  function replaceWithFragment(container, htmlStr){
    var frag = document.createDocumentFragment();
    var temp;
    var tag = container.tagName;
    if(tag === 'TBODY' || tag === 'THEAD' || tag === 'TFOOT'){
      temp = document.createElement('table');
      temp.innerHTML = '<tbody>' + htmlStr + '</tbody>';
      temp = temp.querySelector('tbody');
    } else if(tag === 'TABLE'){
      temp = document.createElement('table');
      temp.innerHTML = htmlStr;
    } else {
      temp = document.createElement('div');
      temp.innerHTML = htmlStr;
    }
    while(temp.firstChild) frag.appendChild(temp.firstChild);
    container.textContent = '';
    container.appendChild(frag);
  }

  function getBrand(){
    var data = window.getDashboardData();
    return data.accounts.find(a => a.b) || data.accounts[0];
  }

  function getCompetitors(){
    var data = window.getDashboardData();
    return data.accounts.filter(a => !a.b);
  }

  window.fmt = fmt;
  window.fmtFull = fmtFull;
  window.pct = pct;
  window.num = num;
  window.fmtInt = fmtInt;
  window.fmtDec = fmtDec;
  window.fmtPct = fmtPct;
  window.prettyLastUpdate = prettyLastUpdate;
  window.getChartTextColor = getChartTextColor;
  window.getChartGridColor = getChartGridColor;
  window.destroyChart = destroyChart;
  window.replaceWithFragment = replaceWithFragment;
  window.getBrand = getBrand;
  window.getCompetitors = getCompetitors;
})(window);
