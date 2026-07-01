/**
 * Authentication – session tokens & user management
 */

var SHEET_USERS = '_Users';
var SESSION_TTL_SEC = 21600; // 6 hours
var AUTH_SALT = 'ggl_dashboard_v1';

function setupUsers_() {
  var ss = getSpreadsheet_();
  var sheet = getOrCreateSheet_(ss, SHEET_USERS, ['email', 'password_hash', 'name', 'role', 'active']);
  if (sheet.getLastRow() <= 1) {
    sheet.appendRow([
      'admin@ggl.com',
      hashPassword_('Ggl@2026'),
      'GGL Admin',
      'admin',
      'TRUE'
    ]);
  }
}

function hashPassword_(password) {
  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password + AUTH_SALT,
    Utilities.Charset.UTF_8
  );
  return Utilities.base64Encode(digest);
}

function login(email, password) {
  email = String(email || '').trim().toLowerCase();
  password = String(password || '');
  if (!email || !password) {
    throw new Error('Email dan password wajib diisi.');
  }

  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(SHEET_USERS);
  if (!sheet || sheet.getLastRow() < 2) {
    throw new Error('User belum dikonfigurasi. Jalankan setupSpreadsheet().');
  }

  var data = sheet.getDataRange().getValues();
  var user = null;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === email) {
      user = data[i];
      break;
    }
  }

  if (!user) throw new Error('Email atau password salah.');
  if (String(user[4]).toUpperCase() !== 'TRUE') throw new Error('Akun tidak aktif.');
  if (user[1] !== hashPassword_(password)) throw new Error('Email atau password salah.');

  var token = Utilities.getUuid();
  var session = {
    email: String(user[0]),
    name: String(user[2] || user[0]),
    role: String(user[3] || 'user'),
    created: Date.now()
  };
  CacheService.getScriptCache().put('session_' + token, JSON.stringify(session), SESSION_TTL_SEC);

  return { token: token, user: session };
}

function validateSession(token) {
  if (!token) return null;
  var raw = CacheService.getScriptCache().get('session_' + token);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function requireAuth_(token) {
  var session = validateSession(token);
  if (!session) {
    throw new Error('SESSION_EXPIRED');
  }
  return session;
}

function logout(token) {
  if (token) {
    CacheService.getScriptCache().remove('session_' + token);
  }
  return { success: true };
}

function getAppUrl() {
  return ScriptApp.getService().getUrl();
}

function addUser(token, email, password, name, role) {
  requireAuth_(token);
  email = String(email || '').trim().toLowerCase();
  if (!email || !password) throw new Error('Email dan password wajib diisi.');

  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(SHEET_USERS);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === email) {
      throw new Error('Email sudah terdaftar.');
    }
  }
  sheet.appendRow([email, hashPassword_(password), name || email, role || 'user', 'TRUE']);
  return { email: email, name: name || email };
}
