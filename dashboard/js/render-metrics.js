function renderDailyMetrics() {
  const container = document.getElementById('dailyMetricsContainer');
  if (!container) return;

  const data = getDashboardData();
  if (!data || !data.accounts || !data.history || data.history.length === 0) {
    container.innerHTML = '<div class="al-empty">Data performa histori tidak cukup untuk menampilkan Daily Metrics.</div>';
    return;
  }

  const { history, latest } = data;
  const accounts = (data.accounts || []).map(a => typeof a === 'string' ? a : (a.u || a));

  // Add Account Selector Dropdown
  let html = `
    <div class="hm-select" style="margin-bottom: 20px; background: var(--card); padding: 16px 20px; border-radius: var(--radius); border: 1px solid var(--border); display: flex; align-items: center; gap: 12px; box-shadow: var(--shadow);">
      <label style="font-size:13px;font-weight:600;color:var(--t2)">Pilih akun:</label>
      <select id="dmAccountSelector" class="fbtn on" style="font-size: 13px; font-weight: 600; padding: 6px 16px;" onchange="switchDailyMetricsAccount(this.value)">
        ${accounts.map(acc => `<option value="${acc}" style="background: var(--card); color: var(--t1);">@${acc}</option>`).join('')}
      </select>
    </div>
  `;

  accounts.forEach((account, idx) => {
    const displayStyle = idx === 0 ? 'block' : 'none';
    html += `
    <div class="dm-card neo" id="dm-card-${account}" style="display: ${displayStyle}">
      <div class="dm-card-hdr">
        <div class="dm-acc">@${account} <span class="dm-acc-badge">${account === data.meta?.brand_account || accounts[0] === account ? 'Brand' : 'Kompetitor'}</span></div>
        <select class="fbtn on" style="padding: 4px 12px; font-size: 11px;" onchange="filterMetricsTable(this, '${account}')">
          <option value="7" selected style="background: var(--card); color: var(--t1);">Last 7 Days</option>
          <option value="14" style="background: var(--card); color: var(--t1);">Last 14 Days</option>
          <option value="30" style="background: var(--card); color: var(--t1);">Last 30 Days</option>
        </select>
      </div>
      <div class="dm-wrap">
        <table class="dm-tbl" id="dm-tbl-${account}">
          <thead>
            <tr>
              <th style="width: 15%">Date</th>
              <th colspan="2" style="text-align: center">Followers</th>
              <th colspan="2" style="text-align: center">Following</th>
              <th colspan="2" style="text-align: center">Posts (Media)</th>
            </tr>
          </thead>
          <tbody>
    `;

    const rowsData = [];
    
    let chronologicalHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (latest && latest.date && chronologicalHistory.length > 0 && latest.date !== chronologicalHistory[chronologicalHistory.length - 1].date) {
        let latestEntry = { date: latest.date };
        accounts.forEach(acc => { latestEntry[acc] = latest[acc]; });
        chronologicalHistory.push(latestEntry);
    }
    
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    for (let i = 0; i < chronologicalHistory.length; i++) {
        const curr = chronologicalHistory[i];
        const prev = i > 0 ? chronologicalHistory[i - 1] : null;

        const currData = curr[account];
        const prevData = prev ? prev[account] : null;

        if (!currData) continue;

        const dateObj = new Date(curr.date);
        const dayStr = dayNames[dateObj.getDay()];
        const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
        const dateHtml = `<div style="font-size: 11px; color: var(--t3); font-weight: 500; text-transform: uppercase;">${dayStr}</div><div style="font-size: 13px; font-weight: 600;">${formattedDate}</div>`;

        const followers = currData.followers || 0;
        const following = currData.following || 0;
        const posts = currData.posts || 0;

        let dFol = 0, dFing = 0, dPos = 0;
        if (prevData) {
            dFol = followers - (prevData.followers || 0);
            dFing = following - (prevData.following || 0);
            dPos = posts - (prevData.posts || 0);
        }

        rowsData.unshift({
            dateHtml,
            followers, following, posts,
            dFol, dFing, dPos,
            isFirst: i === 0
        });
    }

    let displayRows = rowsData.slice(0, 7);
    
    const renderDelta = (val, isFirst) => {
        if (isFirst) return '<span class="dm-d-z">--</span>';
        if (val > 0) return `<span class="dm-d-p">+${val.toLocaleString()}</span>`;
        if (val < 0) return `<span class="dm-d-n">${val.toLocaleString()}</span>`;
        return '<span class="dm-d-z">--</span>';
    };

    displayRows.forEach(r => {
        html += `
        <tr class="dm-data-row" data-account="${account}">
          <td>${r.dateHtml}</td>
          <td class="dm-num-cell" style="text-align:right">${renderDelta(r.dFol, r.isFirst)}</td>
          <td class="dm-num-cell" style="font-weight:700">${r.followers.toLocaleString()}</td>
          <td class="dm-num-cell" style="text-align:right">${renderDelta(r.dFing, r.isFirst)}</td>
          <td class="dm-num-cell" style="font-weight:700">${r.following.toLocaleString()}</td>
          <td class="dm-num-cell" style="text-align:right">${renderDelta(r.dPos, r.isFirst)}</td>
          <td class="dm-num-cell" style="font-weight:700">${r.posts.toLocaleString()}</td>
        </tr>
        `;
    });

    const calcAvg = (days) => {
        const validRows = rowsData.slice(0, days).filter(r => !r.isFirst);
        if (validRows.length === 0) return { fol: 0, fing: 0, pos: 0 };
        return {
            fol: Math.round(validRows.reduce((sum, r) => sum + r.dFol, 0) / validRows.length),
            fing: Math.round(validRows.reduce((sum, r) => sum + r.dFing, 0) / validRows.length),
            pos: Math.round(validRows.reduce((sum, r) => sum + r.dPos, 0) / validRows.length)
        };
    };

    const calcTotalDelta = (days) => {
        const validRows = rowsData.slice(0, days).filter(r => !r.isFirst);
        if (validRows.length === 0) return { fol: 0, fing: 0, pos: 0 };
        return {
            fol: validRows.reduce((sum, r) => sum + r.dFol, 0),
            fing: validRows.reduce((sum, r) => sum + r.dFing, 0),
            pos: validRows.reduce((sum, r) => sum + r.dPos, 0)
        };
    };

    const avg7 = calcAvg(7);
    const avgAll = calcAvg(rowsData.length);
    const total30 = calcTotalDelta(30);
    const total14 = calcTotalDelta(14);

    html += `
          <tr class="avg-row avg-top">
            <td style="font-weight:600; color:var(--t2);">Daily Average</td>
            <td style="text-align:right" colspan="2">${renderDelta(avgAll.fol, false)}</td>
            <td style="text-align:right" colspan="2">${renderDelta(avgAll.fing, false)}</td>
            <td style="text-align:right" colspan="2">${renderDelta(avgAll.pos, false)}</td>
          </tr>
          <tr class="avg-row">
            <td style="font-weight:600; color:var(--t2);">Weekly Average</td>
            <td style="text-align:right" colspan="2">${renderDelta(avg7.fol, false)}</td>
            <td style="text-align:right" colspan="2">${renderDelta(avg7.fing, false)}</td>
            <td style="text-align:right" colspan="2">${renderDelta(avg7.pos, false)}</td>
          </tr>
          <tr class="avg-row">
            <td style="font-weight:600; color:var(--t2);">Last 30 Days</td>
            <td style="text-align:right" colspan="2">${renderDelta(total30.fol, false)}</td>
            <td style="text-align:right" colspan="2">${renderDelta(total30.fing, false)}</td>
            <td style="text-align:right" colspan="2">${renderDelta(total30.pos, false)}</td>
          </tr>
          <tr class="avg-row">
            <td style="font-weight:600; color:var(--t2);">Last 14 Days</td>
            <td style="text-align:right" colspan="2">${renderDelta(total14.fol, false)}</td>
            <td style="text-align:right" colspan="2">${renderDelta(total14.fing, false)}</td>
            <td style="text-align:right" colspan="2">${renderDelta(total14.pos, false)}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    `;
  });

  container.innerHTML = html;
  
  window.__DM_ROWS_DATA = window.__DM_ROWS_DATA || {};
  accounts.forEach(acc => {
      const accRows = [];
      let chron = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
      if (latest && latest.date && chron.length > 0 && latest.date !== chron[chron.length - 1].date) {
          let latestEntry = { date: latest.date };
          accounts.forEach(a => { latestEntry[a] = latest[a]; });
          chron.push(latestEntry);
      }
      
      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

      for (let i = 0; i < chron.length; i++) {
        const curr = chron[i];
        const prev = i > 0 ? chron[i - 1] : null;
        if (!curr[acc]) continue;
        const dFol = prev && prev[acc] ? curr[acc].followers - (prev[acc].followers || 0) : 0;
        const dFing = prev && prev[acc] ? curr[acc].following - (prev[acc].following || 0) : 0;
        const dPos = prev && prev[acc] ? curr[acc].posts - (prev[acc].posts || 0) : 0;
        
        const dateObj = new Date(curr.date);
        const dayStr = dayNames[dateObj.getDay()];
        const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
        const dateHtml = `<div style="font-size: 11px; color: var(--t3); font-weight: 500; text-transform: uppercase;">${dayStr}</div><div style="font-size: 13px; font-weight: 600;">${formattedDate}</div>`;

        accRows.unshift({
            dateHtml,
            followers: curr[acc].followers || 0,
            following: curr[acc].following || 0,
            posts: curr[acc].posts || 0,
            dFol, dFing, dPos,
            isFirst: i === 0
        });
      }
      window.__DM_ROWS_DATA[acc] = accRows;
  });
}

window.switchDailyMetricsAccount = function(selectedAccount) {
    const data = getDashboardData();
    if (!data || !data.accounts) return;
    const accounts = (data.accounts || []).map(a => typeof a === 'string' ? a : (a.u || a));
    
    accounts.forEach(acc => {
        const card = document.getElementById(`dm-card-${acc}`);
        if (card) {
            card.style.display = acc === selectedAccount ? 'block' : 'none';
        }
    });
};

window.filterMetricsTable = function(selectEl, account) {
    const val = selectEl.value;
    const limit = val === 'all' ? 9999 : parseInt(val, 10);
    
    const rows = window.__DM_ROWS_DATA[account];
    if (!rows) return;
    
    const displayRows = rows.slice(0, limit);
    
    const renderDelta = (val, isFirst) => {
        if (isFirst) return '<span class="dm-d-z">--</span>';
        if (val > 0) return `<span class="dm-d-p">+${val.toLocaleString()}</span>`;
        if (val < 0) return `<span class="dm-d-n">${val.toLocaleString()}</span>`;
        return '<span class="dm-d-z">--</span>';
    };
    
    let rowsHtml = '';
    displayRows.forEach(r => {
        rowsHtml += `
        <tr class="dm-data-row" data-account="${account}">
          <td>${r.dateHtml}</td>
          <td class="dm-num-cell" style="text-align:right">${renderDelta(r.dFol, r.isFirst)}</td>
          <td class="dm-num-cell" style="font-weight:700">${r.followers.toLocaleString()}</td>
          <td class="dm-num-cell" style="text-align:right">${renderDelta(r.dFing, r.isFirst)}</td>
          <td class="dm-num-cell" style="font-weight:700">${r.following.toLocaleString()}</td>
          <td class="dm-num-cell" style="text-align:right">${renderDelta(r.dPos, r.isFirst)}</td>
          <td class="dm-num-cell" style="font-weight:700">${r.posts.toLocaleString()}</td>
        </tr>
        `;
    });
    
    const tbody = document.querySelector(`#dm-tbl-${account} tbody`);
    if(tbody) {
        const avgRows = Array.from(tbody.querySelectorAll('.avg-row'));
        const avgHtml = avgRows.map(tr => tr.outerHTML).join('');
        tbody.innerHTML = rowsHtml + avgHtml;
    }
};

window.renderDailyMetrics = renderDailyMetrics;
