(function(global){
  const REQUIRED_ACCOUNTS = ['metmalbekasi','grandmetropolitan','metmalcileungsi','summareconmal.bekasi','pakuwonmallbekasi'];
  const CACHE_KEY = 'ig-dash-data';
  const CACHE_TS_KEY = 'ig-dash-data-ts';
  const CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 jam

  function clearDashboardCache() {
    try {
      global.localStorage.removeItem(CACHE_KEY);
      global.localStorage.removeItem(CACHE_TS_KEY);
    } catch (e) {}
  }

  function todayWibDate(){
    var now = new Date();
    var wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    var yyyy = wib.getUTCFullYear();
    var mm = String(wib.getUTCMonth() + 1).padStart(2, '0');
    var dd = String(wib.getUTCDate()).padStart(2, '0');
    return yyyy + '-' + mm + '-' + dd;
  }

  function getCacheAgeMs(ts){
    return Date.now() - ts;
  }

  function isStaleLegacyCache(parsed){
    return !!(parsed && parsed.version === 2 && !parsed.content_breakdown);
  }

  function shouldUseFreshPayload(currentRaw, nextRaw){
    if (!currentRaw || !currentRaw.generated_at) return true;
    if (!nextRaw || !nextRaw.generated_at) return true;
    return nextRaw.generated_at !== currentRaw.generated_at;
  }

  function validateDashboardRaw(raw){
    var issues = [];
    if (!raw || typeof raw !== 'object') issues.push('Payload bukan object');
    if (!raw || raw.version !== 2) issues.push('Schema version bukan v2');
    if (!raw || !Array.isArray(raw.accounts) || raw.accounts.length === 0) issues.push('accounts kosong');
    if (!raw || !raw.latest || !raw.latest.date) issues.push('latest.date tidak ada');
    if (!raw || !raw.generated_at_wib) issues.push('generated_at_wib tidak ada');
    if (!raw || !Array.isArray(raw.history) || raw.history.length === 0) issues.push('history kosong');
    if (!raw || typeof raw.content_breakdown !== 'object' || raw.content_breakdown === null) issues.push('content_breakdown tidak ada');
    var accounts = raw && Array.isArray(raw.accounts) ? raw.accounts : [];
    REQUIRED_ACCOUNTS.forEach(function(u){ if (accounts.indexOf(u) === -1) issues.push('akun wajib hilang: ' + u); });
    if (raw && raw.latest && raw.latest.date && raw.history && raw.history.length) {
      var lastHistoryDate = raw.history[raw.history.length - 1] && raw.history[raw.history.length - 1].date;
      if (lastHistoryDate && raw.latest.date !== lastHistoryDate) issues.push('latest.date tidak sinkron dengan history terakhir');
    }
    return { ok: issues.length === 0, issues: issues };
  }

  function saveToCache(data) {
    try {
      global.localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      global.localStorage.setItem(CACHE_TS_KEY, String(Date.now()));
    } catch(e) {}
  }

  function loadFromCache() {
    try {
      var raw = global.localStorage.getItem(CACHE_KEY);
      var ts = parseInt(global.localStorage.getItem(CACHE_TS_KEY) || '0', 10);
      if (!raw || !ts) return null;
      var parsed = JSON.parse(raw);
      var age = getCacheAgeMs(ts);
      if (age > CACHE_MAX_AGE || isStaleLegacyCache(parsed)) {
        clearDashboardCache();
        return null;
      }
      return { data: parsed, ageMs: age };
    } catch(e) { return null; }
  }

  function formatAge(ms) {
    var mins = Math.floor(ms / 60000);
    if (mins < 60) return mins + ' menit lalu';
    var hrs = Math.floor(mins / 60);
    return hrs + ' jam lalu';
  }

  function normalizeDashboardData(raw){
    if (!raw || raw.version !== 2) return raw;
    const latest = raw.latest || {};
    const history = raw.history || [];
    const brand = (raw.meta && raw.meta.brand_account) || (raw.accounts && raw.accounts[0]) || null;
    const accounts = (raw.accounts || []).map((u) => {
      const x = latest[u] || {};
      const g = (raw.growth || {})[u] || {};
      return {
        u,
        f: x.followers ?? 0,
        fo: x.following ?? 0,
        p: x.posts ?? 0,
        al: x.avg_likes ?? 0,
        ac: x.avg_comments ?? 0,
        er: x.engagement_rate ?? 0,
        b: u === brand,
        v: !!x.verified,
        growthAbs: g.followers_change_1d ?? 0,
        growthPct: g.pct_change_7d ?? 0
      };
    });
    const dates = history.map((h) => h.date || '-');
    const trend = {};
    (raw.accounts || []).forEach((u) => { trend[u] = history.map((h) => (h[u] && h[u].followers) || 0); });
    const engTrend = {};
    (raw.accounts || []).forEach((u) => { engTrend[u] = history.map((h) => (h[u] && h[u].engagement_rate) || null); });
    const contentBreakdown = {};
    Object.entries(raw.content_breakdown || {}).forEach(([u, cb]) => {
      contentBreakdown[u] = {
        reels: cb.reels ?? 0,
        carousel: cb.carousel ?? 0,
        image: cb.image ?? 0,
        video: cb.video ?? 0,
        avgER: cb.engagement_rate ?? 0,
        typePerf: {
          reels: {
            avgLikes: cb.reels_avg_likes ?? 0,
            avgComments: cb.reels_avg_comments ?? 0,
            er: cb.reels_er ?? 0
          },
          carousel: {
            avgLikes: cb.carousel_avg_likes ?? 0,
            avgComments: cb.carousel_avg_comments ?? 0,
            er: cb.carousel_er ?? 0
          },
          image: {
            avgLikes: cb.image_avg_likes ?? 0,
            avgComments: cb.image_avg_comments ?? 0,
            er: cb.image_er ?? 0
          },
          video: {
            avgLikes: cb.video_avg_likes ?? 0,
            avgComments: cb.video_avg_comments ?? 0,
            er: cb.video_er ?? 0
          }
        },
        bestPost: {
          url: cb.best_post_url || '',
          type: cb.best_post_type || '',
          likes: cb.best_post_likes ?? 0,
          comments: cb.best_post_comments ?? 0
        }
      };
    });
    return {
      ...raw,
      lastUpdate: raw.generated_at_wib || raw.generated_at || '-',
      generated_at: raw.generated_at || null,
      totalDataPoints: dates.length,
      accounts,
      dates,
      trend,
      engTrend,
      contentBreakdown
    };
  }

  global.REQUIRED_ACCOUNTS = REQUIRED_ACCOUNTS;
  global.CACHE_KEY = CACHE_KEY;
  global.CACHE_TS_KEY = CACHE_TS_KEY;
  global.CACHE_MAX_AGE = CACHE_MAX_AGE;
  global.clearDashboardCache = clearDashboardCache;
  global.todayWibDate = todayWibDate;
  global.getCacheAgeMs = getCacheAgeMs;
  global.isStaleLegacyCache = isStaleLegacyCache;
  global.shouldUseFreshPayload = shouldUseFreshPayload;
  global.validateDashboardRaw = validateDashboardRaw;
  global.saveToCache = saveToCache;
  global.loadFromCache = loadFromCache;
  global.formatAge = formatAge;
  global.normalizeDashboardData = normalizeDashboardData;
})(window);
