/* Runtime init: startup wiring and page interaction bootstrap */

window.addEventListener('DOMContentLoaded', function(){
  if(typeof AuthModule !== 'undefined'){
    AuthModule.initAuth();
  }
  initAuthUI();
  var saved = localStorage.getItem('ig-dash-theme');
  if(saved === 'dark'){
    document.documentElement.setAttribute('data-theme', 'dark');
    updateDarkBtn('dark');
  } else {
    updateDarkBtn('light');
  }
  if(typeof applyDashboardDensity === 'function'){
    applyDashboardDensity(typeof getDashboardDensity === 'function' ? getDashboardDensity() : 'full');
  }
  if (DEBUG_MODE) {
    var debugBtn = document.getElementById('debugToggleBtn');
    if (debugBtn) debugBtn.style.display = 'inline-flex';
  }
  initDashboard();
  if(typeof SettingsModule !== 'undefined'){
    SettingsModule.initSettings();
  }
  // Live relative time updater — refresh #lastUpdate text tiap 60 detik
  setInterval(function(){
    var data = typeof getDashboardData === 'function' ? getDashboardData() : null;
    if(!data || !data.lastUpdate) return;
    var el = document.getElementById('lastUpdate');
    if(el && typeof prettyLastUpdate === 'function'){
      el.textContent = 'Update terakhir: ' + prettyLastUpdate(data.lastUpdate);
    }
  }, 60000);
});


function initRevealAnimations(){
  document.body.classList.add('reveal-ready');

  if(typeof IntersectionObserver === 'undefined') {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('visible'); });
    return;
  }

  var aboveFold = [
    {sel:'.hdr.reveal', delay:300},
    {sel:'.nav-bar.reveal', delay:550},
    {sel:'#sec-overview .sec-group-header.reveal', delay:800},
    {sel:'.cards-s.reveal', delay:1000},
    {sel:'.gv-sec.reveal', delay:1200}
  ];
  var aboveFoldEls = new Set();

  aboveFold.forEach(function(item){
    var el = document.querySelector(item.sel);
    if(el){
      aboveFoldEls.add(el);
      setTimeout(function(){ el.classList.add('visible'); }, item.delay);
    }
  });

  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:0.12, rootMargin:'0px 0px -60px 0px'});

  document.querySelectorAll('.reveal').forEach(function(el){
    if(!aboveFoldEls.has(el) && !el.classList.contains('visible')){
      observer.observe(el);
    }
  });
}

(function initNav(){
  const nav = document.getElementById('navBar');
  if(!nav) return;
  const navInner = nav.querySelector('.nav-inner');
  const items = nav.querySelectorAll('.nav-item');
  const sectionIds = ['sec-overview','sec-engagement','sec-content','sec-history'];
  let lastScroll = 0;
  let ticking = false;

  function updateNavScroll(){
    if(navInner){
      const isScrolled = navInner.scrollLeft > 10;
      navInner.classList.toggle('scrolled-right', isScrolled);
    }
  }

  if(navInner){
    navInner.addEventListener('scroll', updateNavScroll, {passive:true});
    updateNavScroll();
  }

  items.forEach(item => {
    item.addEventListener('click', function(e){
      e.preventDefault();
      const target = document.getElementById(this.dataset.sec);
      if(target){
        target.scrollIntoView({behavior:'smooth',block:'start'});
        items.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });

  function updateNav(){
    const scrollY = window.scrollY;
    const navH = nav.offsetHeight + 20;

    if(scrollY > 200){
      nav.classList.add('scrolled');
      if(scrollY > lastScroll && scrollY > 400){
        nav.classList.add('hidden');
      } else {
        nav.classList.remove('hidden');
      }
    } else {
      nav.classList.remove('scrolled');
      nav.classList.remove('hidden');
    }
    const btt = document.getElementById('btnBackToTop');
    if(btt) {
      if(scrollY > 500) btt.classList.add('show');
      else btt.classList.remove('show');
    }

    lastScroll = scrollY;

    let activeId = sectionIds[0];
    for(let i = sectionIds.length - 1; i >= 0; i--){
      const sec = document.getElementById(sectionIds[i]);
      if(sec && sec.getBoundingClientRect().top <= navH + 60){
        activeId = sectionIds[i];
        break;
      }
    }
    items.forEach(item => {
      item.classList.toggle('active', item.dataset.sec === activeId);
    });
    ticking = false;
  }

  window.addEventListener('scroll', function(){
    if(!ticking){
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, {passive:true});
})();

window.initRevealAnimations = initRevealAnimations;

/* ===== AUTH UI FUNCTIONS ===== */
function initAuthUI(){
  updateAuthButtons();
  var loginUsername = document.getElementById('loginUsername');
  var loginPassword = document.getElementById('loginPassword');
  if(loginUsername){
    loginUsername.addEventListener('keypress', function(e){
      if(e.key === 'Enter') handleLogin();
    });
  }
  if(loginPassword){
    loginPassword.addEventListener('keypress', function(e){
      if(e.key === 'Enter') handleLogin();
    });
  }
  var loginModal = document.getElementById('loginModal');
  if(loginModal){
    loginModal.addEventListener('click', function(e){
      if(e.target === this) hideLoginModal();
    });
  }
  var settingsModal = document.getElementById('settingsModal');
  if(settingsModal){
    settingsModal.addEventListener('click', function(e){
      if(e.target === this) closeSettingsModal();
    });
  }
  var userModal = document.getElementById('userModal');
  if(userModal){
    userModal.addEventListener('click', function(e){
      if(e.target === this) closeUserModal();
    });
  }
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      if(loginModal && loginModal.classList.contains('show')) hideLoginModal();
      if(settingsModal && settingsModal.classList.contains('show')) closeSettingsModal();
      if(userModal && userModal.classList.contains('show')) closeUserModal();
    }
  });
  document.addEventListener('click', function(e){
    var dropdown = document.getElementById('userDropdown');
    var menu = document.getElementById('userMenu');
    if(dropdown && menu && !menu.contains(e.target)){
      dropdown.classList.remove('show');
    }
  });
}

function updateAuthButtons(){
  var loggedIn = typeof AuthModule !== 'undefined' && AuthModule.isLoggedIn();
  var isAdmin = typeof AuthModule !== 'undefined' && AuthModule.isAdmin();
  var loginBtn = document.getElementById('loginBtn');
  var userMenu = document.getElementById('userMenu');
  var userMenuName = document.getElementById('userMenuName');
  var settingsBtn = document.getElementById('settingsBtn');
  var usersTab = document.getElementById('usersTab');
  var protectedBtns = document.querySelectorAll('.protected-btn');
  
  if(loggedIn){
    if(loginBtn) loginBtn.style.display = 'none';
    if(userMenu) userMenu.style.display = 'flex';
    var session = AuthModule.getSession();
    if(userMenuName && session) userMenuName.textContent = session.username;
    if(settingsBtn) settingsBtn.style.display = 'inline-flex';
    protectedBtns.forEach(function(btn){ btn.classList.remove('locked'); });
    if(usersTab) usersTab.style.display = isAdmin ? 'block' : 'none';
  } else {
    if(loginBtn) loginBtn.style.display = 'inline-flex';
    if(userMenu) userMenu.style.display = 'none';
    if(settingsBtn) settingsBtn.style.display = 'none';
    protectedBtns.forEach(function(btn){ btn.classList.add('locked'); });
  }
}

function showLoginModal(){
  var modal = document.getElementById('loginModal');
  if(modal) modal.classList.add('show');
  var username = document.getElementById('loginUsername');
  if(username) username.focus();
}

function hideLoginModal(){
  var modal = document.getElementById('loginModal');
  if(modal) modal.classList.remove('show');
  var username = document.getElementById('loginUsername');
  var password = document.getElementById('loginPassword');
  var error = document.getElementById('loginError');
  if(username) username.value = '';
  if(password) password.value = '';
  if(error) error.classList.remove('show');
}

function handleLogin(){
  var username = document.getElementById('loginUsername');
  var password = document.getElementById('loginPassword');
  var errorEl = document.getElementById('loginError');
  var errorText = document.getElementById('loginErrorText');
  
  if(!username || !password) return;
  var u = username.value.trim();
  var p = password.value;
  
  if(!u || !p){
    if(errorText) errorText.textContent = 'Username dan password harus diisi';
    if(errorEl) errorEl.classList.add('show');
    return;
  }
  
  var result = AuthModule.login(u, p);
  if(result.success){
    hideLoginModal();
    updateAuthButtons();
    showToast('Login berhasil!', 'success');
    if(typeof SettingsModule !== 'undefined') SettingsModule.initSettings();
  } else {
    if(errorText) errorText.textContent = result.message;
    if(errorEl) errorEl.classList.add('show');
  }
}

function handleLogout(){
  if(typeof AuthModule !== 'undefined') AuthModule.logout();
  updateAuthButtons();
  closeSettingsModal();
  showToast('Logout berhasil', 'info');
}

function handleProtectedAction(callback){
  if(typeof AuthModule !== 'undefined' && !AuthModule.isLoggedIn()){
    showLoginModal();
    return;
  }
  if(typeof callback === 'function') callback();
}

function togglePasswordVisibility(inputId, btn){
  var input = document.getElementById(inputId);
  var eyeOpen = btn.querySelector('.eye-open');
  var eyeClosed = btn.querySelector('.eye-closed');
  if(!input) return;
  if(input.type === 'password'){
    input.type = 'text';
    if(eyeOpen) eyeOpen.style.display = 'none';
    if(eyeClosed) eyeClosed.style.display = 'block';
  } else {
    input.type = 'password';
    if(eyeOpen) eyeOpen.style.display = 'block';
    if(eyeClosed) eyeClosed.style.display = 'none';
  }
}

function toggleUserDropdown(){
  var dropdown = document.getElementById('userDropdown');
  if(dropdown) dropdown.classList.toggle('show');
}

/* ===== SETTINGS MODAL ===== */
function openSettingsModal(){
  if(typeof AuthModule !== 'undefined' && !AuthModule.isLoggedIn()){
    showLoginModal();
    return;
  }
  var modal = document.getElementById('settingsModal');
  if(modal) modal.classList.add('show');
  renderPanelToggles();
  renderUserTable();
  loadCurrentSettings();
}

function closeSettingsModal(){
  var modal = document.getElementById('settingsModal');
  if(modal) modal.classList.remove('show');
}

function switchSettingsTab(tabName){
  document.querySelectorAll('.settings-tab').forEach(function(tab){
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  document.querySelectorAll('.settings-panel').forEach(function(panel){
    panel.classList.toggle('active', panel.id === 'panel-' + tabName);
  });
}

function renderPanelToggles(){
  var container = document.getElementById('panelToggles');
  if(!container || typeof SettingsModule === 'undefined') return;
  var panels = SettingsModule.getPanels();
  var settings = SettingsModule.getSettings();
  var html = '';
  for(var key in panels){
    var checked = settings.panels[key] ? 'checked' : '';
    html += '<div class="settings-row"><div class="settings-label">' + panels[key].name + '</div>';
    html += '<label class="settings-toggle"><input type="checkbox" ' + checked + ' onchange="updatePanelVisibility(\'' + key + '\', this.checked)"><span class="settings-toggle-slider"></span></label></div>';
  }
  container.innerHTML = html;
}

function loadCurrentSettings(){
  if(typeof SettingsModule === 'undefined') return;
  var settings = SettingsModule.getSettings();
  var select = document.getElementById('presetSelect');
  if(select) select.value = settings.preset || 'full';
}

function applySettingsPreset(preset){
  if(typeof SettingsModule === 'undefined') return;
  SettingsModule.applyPreset(preset);
  renderPanelToggles();
  showToast('Preset diterapkan', 'success');
}

function updatePanelVisibility(panelKey, visible){
  if(typeof SettingsModule === 'undefined') return;
  SettingsModule.updatePanelVisibility(panelKey, visible);
  var select = document.getElementById('presetSelect');
  if(select) select.value = 'custom';
}

function applySettings(){
  closeSettingsModal();
  showToast('Settings disimpan', 'success');
}

function resetSettingsToDefault(){
  if(typeof SettingsModule === 'undefined') return;
  SettingsModule.resetToDefault();
  renderPanelToggles();
  loadCurrentSettings();
  showToast('Settings direset ke default', 'info');
}

/* ===== USER MANAGEMENT ===== */
function renderUserTable(){
  var tbody = document.getElementById('userTableBody');
  var countEl = document.getElementById('userCount');
  if(!tbody || typeof AuthModule === 'undefined') return;
  var users = AuthModule.getUsers();
  var session = AuthModule.getSession();
  var currentUserId = session ? session.userId : null;
  var isAdmin = AuthModule.isAdmin();
  if(countEl) countEl.textContent = '(' + users.length + '/' + AuthModule.MAX_USERS + ')';
  var html = '';
  users.forEach(function(user){
    var roleClass = user.role === 'admin' ? 'admin' : 'viewer';
    var canEdit = isAdmin && (user.id !== 1 || user.id === currentUserId);
    var canDelete = isAdmin && user.id !== 1 && user.id !== currentUserId;
    html += '<tr><td>' + escapeHtml(user.username) + '</td>';
    html += '<td><span class="user-badge ' + escapeHtml(roleClass) + '">' + escapeHtml(user.role) + '</span></td>';
    html += '<td class="user-actions">';
    if(canEdit) html += '<button class="user-action-btn edit" onclick="editUser(\'' + escapeHtml(String(user.id)) + '\')">Edit</button>';
    if(canDelete) html += '<button class="user-action-btn delete" onclick="deleteUser(\'' + escapeHtml(String(user.id)) + '\')">Delete</button>';
    html += '</td></tr>';
  });
  tbody.innerHTML = html;
}

function showAddUserModal(){
  var title = document.getElementById('userModalTitle');
  var editId = document.getElementById('editUserId');
  var username = document.getElementById('userUsername');
  var password = document.getElementById('userPassword');
  var role = document.getElementById('userRole');
  if(title) title.textContent = 'Add User';
  if(editId) editId.value = '';
  if(username){ username.value = ''; username.disabled = false; }
  if(password){ password.value = ''; password.placeholder = 'Password'; }
  if(role) role.value = 'viewer';
  var modal = document.getElementById('userModal');
  if(modal) modal.classList.add('show');
}

function editUser(userId){
  if(typeof AuthModule === 'undefined') return;
  var users = AuthModule.getUsers();
  var user = null;
  for(var i = 0; i < users.length; i++){ if(users[i].id == userId){ user = users[i]; break; } }
  if(!user) return;
  var title = document.getElementById('userModalTitle');
  var editId = document.getElementById('editUserId');
  var username = document.getElementById('userUsername');
  var password = document.getElementById('userPassword');
  var role = document.getElementById('userRole');
  if(title) title.textContent = 'Edit User';
  if(editId) editId.value = userId;
  if(username){ username.value = user.username; username.disabled = true; }
  if(password){ password.value = ''; password.placeholder = 'Leave blank to keep current'; }
  if(role) role.value = user.role;
  var modal = document.getElementById('userModal');
  if(modal) modal.classList.add('show');
}

function closeUserModal(){
  var el = document.getElementById('userModal');
  if(el) el.classList.remove('show');
}

function saveUser(){
  var editIdEl = document.getElementById('editUserId');
  var usernameEl = document.getElementById('userUsername');
  var passwordEl = document.getElementById('userPassword');
  var roleEl = document.getElementById('userRole');
  if(!editIdEl || !usernameEl || !passwordEl || !roleEl) return;
  var editId = editIdEl.value;
  var username = usernameEl.value.trim();
  var password = passwordEl.value;
  var role = roleEl.value;
  var errorEl = document.getElementById('userModalError');
  
  if(!username){
    if(errorEl){ var errSpan = errorEl.querySelector('span'); if(errSpan) errSpan.textContent = 'Username harus diisi'; else errorEl.textContent = 'Username harus diisi'; errorEl.classList.add('show'); }
    return;
  }
  
  var result;
  if(editId){
    var updates = {};
    if(password) updates.password = password;
    if(role) updates.role = role;
    result = AuthModule.updateUser(editId, updates);
  } else {
    if(!password){
      if(errorEl){ var errSpan = errorEl.querySelector('span'); if(errSpan) errSpan.textContent = 'Password harus diisi'; else errorEl.textContent = 'Password harus diisi'; errorEl.classList.add('show'); }
      return;
    }
    result = AuthModule.addUser(username, password, role);
  }
  
  if(result.success){
    closeUserModal();
    renderUserTable();
    showToast(editId ? 'User berhasil diupdate' : 'User berhasil ditambahkan', 'success');
  } else {
    if(errorEl){ var errSpan = errorEl.querySelector('span'); if(errSpan) errSpan.textContent = result.message; else errorEl.textContent = result.message; errorEl.classList.add('show'); }
  }
}

function deleteUser(userId){
  if(!confirm('Yakin ingin menghapus user ini?')) return;
  if(typeof AuthModule === 'undefined') return;
  var result = AuthModule.deleteUser(userId);
  if(result.success){
    renderUserTable();
    showToast('User berhasil dihapus', 'success');
  } else {
    showToast(result.message, 'error');
  }
}

function changePassword(){
  var current = document.getElementById('currentPassword');
  var newPass = document.getElementById('newPassword');
  var confirmEl = document.getElementById('confirmPassword');
  
  if(!current || !newPass || !confirmEl) return;
  if(!current.value || !newPass.value || !confirmEl.value){
    showToast('Semua field harus diisi', 'error');
    return;
  }
  if(newPass.value !== confirmEl.value){
    showToast('Password baru tidak cocok', 'error');
    return;
  }
  if(typeof AuthModule === 'undefined') return;
  // Verify current password before allowing change
  var session = AuthModule.getSession();
  if(!session) return;
  var users = AuthModule.getUsers();
  var currentUser = null;
  for(var i = 0; i < users.length; i++){
    if(String(users[i].id) === String(session.userId)){ currentUser = users[i]; break; }
  }
  if(!currentUser){
    showToast('User tidak ditemukan', 'error');
    return;
  }
  // Use verifyPassword to check current password without login side effects
  if(typeof AuthModule.verifyPassword === 'function'){
    if(!AuthModule.verifyPassword(current.value, currentUser.passwordHash)){
      showToast('Password saat ini salah', 'error');
      return;
    }
  }
  var result = AuthModule.updateUser(session.userId, { password: newPass.value });
  if(result.success){
    showToast('Password berhasil diubah', 'success');
    current.value = ''; newPass.value = ''; confirmEl.value = '';
  } else {
    showToast(result.message, 'error');
  }
}

/* ===== TOAST NOTIFICATIONS ===== */
function showToast(message, type){
  var container = document.getElementById('toastContainer');
  if(!container) return;
  type = type || 'info';
  var icons = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };
  var toast = document.createElement('div');
  toast.className = 'toast ' + type;
  var safeMessage = String(message).replace(/[<>"'&]/g, function(c){ return {'<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','&':'&amp;'}[c]; });
  toast.innerHTML = (icons[type] || icons.info) + '<span>' + safeMessage + '</span><button class="toast-close" onclick="this.parentElement.remove()">&times;</button>';
  container.appendChild(toast);
  setTimeout(function(){ toast.classList.add('show'); }, 10);
  setTimeout(function(){
    toast.classList.remove('show');
    setTimeout(function(){ if(toast.parentElement) toast.remove(); }, 300);
  }, 4000);
}
window.showToast = showToast;
