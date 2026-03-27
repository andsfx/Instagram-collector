/* Settings Module - Panel Visibility & Presets */
(function(global){
  'use strict';

  var STORAGE_KEY = 'ig_dash_admin_settings';

  var PANELS = {
    overview: { name: 'Ringkasan Akun', sectionId: 'sec-overview' },
    growth: { name: 'Growth Velocity', sectionId: 'gv-sec' },
    posts: { name: 'Post Snapshot', sectionId: 'sec-post-snapshot' },
    ranking: { name: 'Ranking Table', sectionId: 'ranking-section' },
    charts: { name: 'Engagement Charts', sectionId: 'sec-engagement' },
    content: { name: 'Content Breakdown', sectionId: 'sec-content' },
    heatmap: { name: 'Posting Heatmap', sectionId: 'heatmap-sec' },
    h2h: { name: 'Head-to-Head Comparison', sectionId: 'h2h-sec' },
    insights: { name: 'Insights & Recommendations', sectionId: 'sec-history' }
  };

  var PRESETS = {
    full: {
      name: 'Full Dashboard',
      description: 'Semua panel ditampilkan',
      panels: { overview: true, growth: true, posts: true, ranking: true, charts: true, content: true, heatmap: true, h2h: true, insights: true }
    },
    compact: {
      name: 'Compact View',
      description: 'Ringkasan, Growth, dan Charts saja',
      panels: { overview: true, growth: true, posts: false, ranking: false, charts: true, content: false, heatmap: false, h2h: false, insights: false }
    },
    presentation: {
      name: 'Presentation Mode',
      description: 'Ringkasan, Charts, dan Insights untuk presentasi',
      panels: { overview: true, growth: false, posts: false, ranking: false, charts: true, content: false, heatmap: false, h2h: false, insights: true }
    }
  };

  function getDefaultSettings(){
    return {
      preset: 'full',
      panels: PRESETS.full.panels,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'system'
    };
  }

  function getSettings(){
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if(stored){
        var parsed = JSON.parse(stored);
        return parsed;
      }
    } catch(e){}
    return getDefaultSettings();
  }

  function saveSettings(settings){
    try {
      var session = AuthModule.getSession();
      settings.lastUpdated = new Date().toISOString();
      settings.updatedBy = session ? session.username : 'unknown';
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      return true;
    } catch(e){
      return false;
    }
  }

  function applyPreset(presetKey){
    if(!PRESETS[presetKey]){
      return { success: false, message: 'Preset tidak ditemukan' };
    }

    var settings = {
      preset: presetKey,
      panels: PRESETS[presetKey].panels
    };

    saveSettings(settings);
    applyPanelVisibility(settings.panels);

    return { success: true, message: 'Preset berhasil diterapkan' };
  }

  function updatePanelVisibility(panelKey, visible){
    var settings = getSettings();
    settings.preset = 'custom';
    settings.panels[panelKey] = visible;
    saveSettings(settings);
    applyPanelVisibility(settings.panels);
  }

  function applyPanelVisibility(panels){
    for(var key in PANELS){
      var sectionId = PANELS[key].sectionId;
      var section = document.getElementById(sectionId);
      // Fallback: try querySelector with class if getElementById fails
      if(!section && sectionId){
        section = document.querySelector('.' + sectionId) || document.querySelector('[id="' + sectionId + '"]');
      }
      if(section){
        section.style.display = panels[key] ? '' : 'none';
      }
    }
  }

  function resetToDefault(){
    var settings = getDefaultSettings();
    saveSettings(settings);
    applyPanelVisibility(settings.panels);
    return { success: true, message: 'Settings berhasil direset' };
  }

  function getPanels(){
    return PANELS;
  }

  function getPresets(){
    return PRESETS;
  }

  function initSettings(){
    var settings = getSettings();
    applyPanelVisibility(settings.panels);
    return settings;
  }

  global.SettingsModule = {
    getSettings: getSettings,
    saveSettings: saveSettings,
    applyPreset: applyPreset,
    updatePanelVisibility: updatePanelVisibility,
    applyPanelVisibility: applyPanelVisibility,
    resetToDefault: resetToDefault,
    getPanels: getPanels,
    getPresets: getPresets,
    initSettings: initSettings
  };

})(window);