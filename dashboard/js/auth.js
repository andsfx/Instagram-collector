/* Auth Module - Demo/Internal UI Gating Only
 * Bukan security boundary yang kuat.
 * Untuk dashboard demo/internal, jangan anggap auth client-side ini aman untuk proteksi data sensitif.
 */
(function(global){
  'use strict';

  var STORAGE_KEYS = {
    users: 'ig_dash_users',
    session: 'ig_dash_session',
    settings: 'ig_dash_admin_settings',
    lockout: 'ig_dash_lockout'
  };

  var MAX_USERS = 10;
  var MAX_LOGIN_ATTEMPTS = 3;
  var LOCKOUT_DURATION = 5 * 60 * 1000;

  function hashPasswordSync(password){
    var hash = 0;
    for(var i = 0; i < password.length; i++){
      var char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }

  function generateId(){
    return Date.now() + Math.random().toString(36).substr(2, 9);
  }

  function getUsers(){
    try {
      var stored = localStorage.getItem(STORAGE_KEYS.users);
      if(stored){
        return JSON.parse(stored);
      }
    } catch(e){}
    return getDefaultUsers();
  }

  function getDefaultUsers(){
    return [{
      id: 1,
      username: 'admin',
      passwordHash: hashPasswordSync('admin'),
      role: 'admin',
      createdAt: new Date().toISOString()
    }];
  }

  function saveUsers(users){
    try {
      localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
      return true;
    } catch(e){
      return false;
    }
  }

  function findUser(username){
    var users = getUsers();
    for(var i = 0; i < users.length; i++){
      if(users[i].username.toLowerCase() === username.toLowerCase()){
        return users[i];
      }
    }
    return null;
  }

  function idsEqual(a, b){
    return String(a) === String(b);
  }

  function findUserById(id){
    var users = getUsers();
    for(var i = 0; i < users.length; i++){
      if(idsEqual(users[i].id, id)){
        return users[i];
      }
    }
    return null;
  }

  function getLockoutKey(username){
    return STORAGE_KEYS.lockout + '_' + username.toLowerCase();
  }

  function getLockout(username){
    try {
      var stored = sessionStorage.getItem(getLockoutKey(username));
      if(stored){
        var data = JSON.parse(stored);
        if(Date.now() < data.lockedUntil){
          return data;
        } else {
          sessionStorage.removeItem(getLockoutKey(username));
        }
      }
    } catch(e){}
    return null;
  }

  function setLockout(username, attempts){
    sessionStorage.setItem(getLockoutKey(username), JSON.stringify({
      attempts: attempts,
      lockedUntil: Date.now() + LOCKOUT_DURATION
    }));
  }

  function clearLockout(username){
    sessionStorage.removeItem(getLockoutKey(username));
  }

  function login(username, password){
    if(!username || !password){
      return { success: false, message: 'Username dan password harus diisi' };
    }

    var lockout = getLockout(username);
    if(lockout){
      var remaining = Math.ceil((lockout.lockedUntil - Date.now()) / 1000 / 60);
      return { success: false, message: 'Akun terkunci. Coba lagi dalam ' + remaining + ' menit' };
    }

    var user = findUser(username);
    if(!user){
      return { success: false, message: 'Username atau password salah' };
    }

    var inputHash = hashPasswordSync(password);
    if(inputHash !== user.passwordHash){
      var lockData = getLockout(username) || { attempts: 0 };
      lockData.attempts++;
      if(lockData.attempts >= MAX_LOGIN_ATTEMPTS){
        setLockout(username, lockData.attempts);
        return { success: false, message: 'Terlalu banyak percobaan. Akun terkunci selama 5 menit' };
      } else {
        setLockout(username, lockData.attempts);
        var remaining = MAX_LOGIN_ATTEMPTS - lockData.attempts;
        return { success: false, message: 'Username atau password salah. Sisa percobaan: ' + remaining };
      }
    }

    clearLockout(username);

    var session = {
      isLoggedIn: true,
      userId: user.id,
      username: user.username,
      role: user.role,
      loginAt: new Date().toISOString()
    };

    try {
      sessionStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
    } catch(e){}

    return { success: true, message: 'Login berhasil', user: user };
  }

  function logout(){
    try {
      sessionStorage.removeItem(STORAGE_KEYS.session);
    } catch(e){}
  }

  function getSession(){
    try {
      var stored = sessionStorage.getItem(STORAGE_KEYS.session);
      if(stored){
        return JSON.parse(stored);
      }
    } catch(e){}
    return null;
  }

  function isLoggedIn(){
    var session = getSession();
    return session && session.isLoggedIn === true;
  }

  function isAdmin(){
    var session = getSession();
    return session && session.role === 'admin';
  }

  function getCurrentUser(){
    var session = getSession();
    if(session && session.userId){
      return findUserById(session.userId);
    }
    return null;
  }

  function addUser(username, password, role){
    if(!username || !password){
      return { success: false, message: 'Username dan password harus diisi' };
    }

    if(username.length < 3){
      return { success: false, message: 'Username minimal 3 karakter' };
    }

    if(findUser(username)){
      return { success: false, message: 'Username sudah digunakan' };
    }

    var users = getUsers();
    if(users.length >= MAX_USERS){
      return { success: false, message: 'Maksimal ' + MAX_USERS + ' user. Hapus user lain terlebih dahulu.' };
    }

    var newUser = {
      id: generateId(),
      username: username,
      passwordHash: hashPasswordSync(password),
      role: role || 'viewer',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    return { success: true, message: 'User berhasil ditambahkan', user: newUser };
  }

  function updateUser(userId, updates){
    var users = getUsers();
    var found = false;

    for(var i = 0; i < users.length; i++){
      if(users[i].id === userId){
        if(updates.username && updates.username !== users[i].username){
          if(findUser(updates.username)){
            return { success: false, message: 'Username sudah digunakan' };
          }
          users[i].username = updates.username;
        }
        if(updates.password){
          users[i].passwordHash = hashPasswordSync(updates.password);
        }
        if(updates.role && !idsEqual(userId, 1)){
          users[i].role = updates.role;
        }
        found = true;
        break;
      }
    }

    if(!found){
      return { success: false, message: 'User tidak ditemukan' };
    }

    saveUsers(users);
    return { success: true, message: 'User berhasil diupdate' };
  }

  function deleteUser(userId){
    if(idsEqual(userId, 1)){
      return { success: false, message: 'Admin utama tidak dapat dihapus' };
    }

    var users = getUsers();
    var newUsers = [];

    for(var i = 0; i < users.length; i++){
      if(!idsEqual(users[i].id, userId)){
        newUsers.push(users[i]);
      }
    }

    if(newUsers.length === users.length){
      return { success: false, message: 'User tidak ditemukan' };
    }

    saveUsers(newUsers);
    return { success: true, message: 'User berhasil dihapus' };
  }

  function getUserCount(){
    return getUsers().length;
  }

  function requireAuth(callback){
    return function(){
      if(!isLoggedIn()){
        var loginFn = (typeof window !== 'undefined' && typeof window.showLoginModal === 'function')
          ? window.showLoginModal
          : (typeof globalThis !== 'undefined' && typeof globalThis.showLoginModal === 'function')
            ? globalThis.showLoginModal
            : null;
        if(loginFn){
          loginFn();
        } else if(typeof console !== 'undefined' && typeof console.warn === 'function'){
          console.warn('showLoginModal is not available in this environment.');
        }
        return;
      }
      if(typeof callback === 'function'){
        callback.apply(this, arguments);
      }
    };
  }

  function initAuth(){
    var users = getUsers();
    if(!users || users.length === 0){
      saveUsers(getDefaultUsers());
      if(typeof console !== 'undefined' && typeof console.warn === 'function'){
        console.warn('AuthModule seeded with demo admin credentials (admin/admin). Demo/internal only; not a real security boundary.');
      }
    }
  }

  global.AuthModule = {
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
    isAdmin: isAdmin,
    getSession: getSession,
    getCurrentUser: getCurrentUser,
    getUsers: getUsers,
    addUser: addUser,
    updateUser: updateUser,
    deleteUser: deleteUser,
    getUserCount: getUserCount,
    requireAuth: requireAuth,
    initAuth: initAuth,
    MAX_USERS: MAX_USERS
  };

})(window);