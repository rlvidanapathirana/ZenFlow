// ╔══════════════════════════════════════════════════════════════╗
// ║         ZenFlow — Google Apps Script Backend API            ║
// ║   Auth + User DB + Track CRUD + Gmail Email Sender          ║
// ║                                                              ║
// ║  DEPLOY: Extensions → Apps Script → Deploy → Web App        ║
// ║  Execute as: Me | Access: Anyone                             ║
// ╚══════════════════════════════════════════════════════════════╝

// ─── CONFIG ───────────────────────────────────────────────────
const CONFIG = {
  SHEET_ID:    '13Fk7AfmSEEaMV6V38U2aij6qbjkrgLgLOKYxZxdGadU', // ← ඔබේ Sheet ID
  TRACKS_TAB:  'Sheet1',       // Audio tracks tab
  USERS_TAB:   'Users',        // Users tab (auto-created)
  ADMIN_EMAIL: Session.getActiveUser().getEmail(), // Script owner email
  APP_NAME:    'ZenFlow',
  SESSION_HOURS: 24,           // Login session duration
  RESET_MINUTES: 30,           // Password reset code expiry
};

// ─── SHEET COLUMN MAPS ────────────────────────────────────────
const USER_COLS = {
  id: 0, name: 1, email: 2, password_hash: 3, salt: 4,
  role: 5, status: 6, created_at: 7, last_login: 8,
  session_token: 9, session_expires: 10,
  reset_code: 11, reset_expires: 12,
};

const TRACK_COLS = {
  id: 0, title: 1, category: 2, drive_link: 3,
  duration: 4, tags: 5, description: 6,
};

// ─── DYNAMIC TRACK COLUMN MAP ─────────────────────────────────
// Reads the actual header row so the code works even if the Sheet
// column order differs from TRACK_COLS.
function getTrackColumnMap() {
  const sheet = getSheet(CONFIG.TRACKS_TAB);
  if (!sheet) return TRACK_COLS; // fallback
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = {};
  headers.forEach((h, i) => {
    // Normalise: lowercase + replace spaces with underscores
    const key = String(h).toLowerCase().replace(/\s+/g, '_').trim();
    map[key] = i;
  });
  // Always ensure default fallback keys
  const fallbackKeys = ['id','title','category','drive_link','duration','tags','description'];
  fallbackKeys.forEach(k => { if (map[k] === undefined) map[k] = TRACK_COLS[k]; });
  return map;
}

// ─── DURATION FORMAT HELPER ──────────────────────────────────
// Google Sheets auto-converts "1:11:10" to a time serial.
// This converts a Date (or string) back to H:MM:SS / M:SS
function formatDurationCell(val) {
  if (!val && val !== 0) return '';
  if (val instanceof Date) {
    const h = val.getHours();
    const m = val.getMinutes();
    const s = val.getSeconds();
    return h > 0
      ? h + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0')
      : m + ':' + String(s).padStart(2,'0');
  }
  return String(val);
}

// ═══════════════════════════════════════════════════════════════
//  ENTRY POINTS  (Web App හරහා auto-call වෙනවා — directly Run කරන්න එපා!)
// ═══════════════════════════════════════════════════════════════
function doGet(e) {
  // e is undefined when run from editor — handle gracefully
  if (!e || !e.parameter) return testRun();
  return handleRequest(e, e.parameter);
}

function doPost(e) {
  if (!e) return testRun();
  let body = {};
  try { body = JSON.parse(e.postData.contents); } catch (_) {}
  const params = Object.assign({}, e.parameter, body);
  return handleRequest(e, params);
}

// ─── EDITOR TEST RUNNER ────────────────────────────────────────
// Editor ඇතුළෙන් test කරන්න මෙම function Run කරන්න ↓
function testRun() {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  // ── Test: Sheet connection ──────────────────────────────────
  ensureUsersSheet();
  const tracks = getTracks({});
  const users  = getAllUsers();

  const result = {
    success: true,
    message: '✅ Apps Script is working correctly!',
    sheet_id:    CONFIG.SHEET_ID,
    tracks_tab:  CONFIG.TRACKS_TAB,
    users_tab:   CONFIG.USERS_TAB,
    admin_email: CONFIG.ADMIN_EMAIL,
    track_count: tracks.tracks.length,
    user_count:  users.length,
    timestamp:   new Date().toISOString(),
    instructions: [
      '1. Run setupFirstAdmin() to create your first admin account',
      '2. Deploy as Web App: Deploy → New deployment → Web App',
      '3. Execute as: Me | Access: Anyone',
      '4. Copy the Web App URL to admin.html',
    ],
  };

  Logger.log(JSON.stringify(result, null, 2));
  output.setContent(JSON.stringify(result));
  return output;
}

function handleRequest(e, params) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  // Ensure Users sheet exists
  ensureUsersSheet();

  try {
    const action = params.action || '';
    let result;

    switch (action) {
      // ── Auth ──────────────────────────────────────────────
      case 'register':       result = register(params);       break;
      case 'login':          result = login(params);          break;
      case 'logout':         result = logout(params);         break;
      case 'verify_session': result = verifySession(params);  break;
      case 'forgot_password':result = forgotPassword(params); break;
      case 'reset_password': result = resetPassword(params);  break;
      case 'get_profile':    result = getProfile(params);     break;
      case 'update_profile': result = updateProfile(params);  break;

      // ── Tracks CRUD ───────────────────────────────────────
      case 'get_tracks':     result = getTracks(params);      break;
      case 'add_track':      result = addTrack(params);       break;
      case 'update_track':   result = updateTrack(params);    break;
      case 'delete_track':   result = deleteTrack(params);    break;

      // ── Admin ─────────────────────────────────────────────
      case 'get_users':      result = getUsers(params);       break;
      case 'toggle_user':    result = toggleUser(params);     break;
      case 'delete_user':    result = deleteUser(params);     break;

      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }

    output.setContent(JSON.stringify(result));
  } catch (err) {
    output.setContent(JSON.stringify({ success: false, error: err.message }));
  }

  return output;
}

// ═══════════════════════════════════════════════════════════════
//  SHEET HELPERS
// ═══════════════════════════════════════════════════════════════
function getSheet(tabName) {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  return ss.getSheetByName(tabName);
}

function ensureUsersSheet() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sheet = ss.getSheetByName(CONFIG.USERS_TAB);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.USERS_TAB);
    // Add headers
    sheet.getRange(1, 1, 1, 13).setValues([[
      'id', 'name', 'email', 'password_hash', 'salt',
      'role', 'status', 'created_at', 'last_login',
      'session_token', 'session_expires',
      'reset_code', 'reset_expires',
    ]]);
    sheet.getRange(1, 1, 1, 13).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getAllUsers() {
  const sheet = getSheet(CONFIG.USERS_TAB);
  const data  = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  return data.slice(1).map((row, i) => ({
    _row: i + 2,
    ...Object.fromEntries(Object.entries(USER_COLS).map(([k, v]) => [k, row[v]]))
  }));
}

function findUserByEmail(email) {
  return getAllUsers().find(u => String(u.email).toLowerCase() === email.toLowerCase());
}

function findUserByToken(token) {
  return getAllUsers().find(u => u.session_token === token);
}

function updateUserRow(rowNum, updates) {
  const sheet = getSheet(CONFIG.USERS_TAB);
  Object.entries(updates).forEach(([key, value]) => {
    const col = USER_COLS[key];
    if (col !== undefined) {
      sheet.getRange(rowNum, col + 1).setValue(value);
    }
  });
}

// ═══════════════════════════════════════════════════════════════
//  SECURITY UTILITIES
// ═══════════════════════════════════════════════════════════════
function sha256(str) {
  const raw  = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str, Utilities.Charset.UTF_8);
  return raw.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function generateToken(len = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result  = '';
  for (let i = 0; i < len; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function generateResetCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
}

function hashPassword(password, salt) {
  return sha256(salt + password + 'zenflow_secret_2024');
}

function requireAuth(params) {
  const token = params.session_token || params.token || '';
  if (!token) throw new Error('Not authenticated. Please login.');
  const user = findUserByToken(token);
  if (!user) throw new Error('Invalid session. Please login again.');
  if (new Date(user.session_expires) < new Date()) throw new Error('Session expired. Please login again.');
  if (user.status !== 'active') throw new Error('Account is inactive.');
  return user;
}

function requireAdmin(params) {
  const user = requireAuth(params);
  if (user.role !== 'admin') throw new Error('Admin access required.');
  return user;
}

// ═══════════════════════════════════════════════════════════════
//  AUTH FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/** REGISTER — Create new account */
function register(params) {
  const name     = (params.name     || '').trim();
  const email    = (params.email    || '').trim().toLowerCase();
  const password = (params.password || '').trim();
  const role     = (params.role     || 'user'); // 'admin' or 'user'
  const adminKey = (params.admin_key || '');

  if (!name)     throw new Error('Name is required');
  if (!email)    throw new Error('Email is required');
  if (!password) throw new Error('Password is required');
  if (password.length < 6) throw new Error('Password must be at least 6 characters');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email format');

  // Check duplicate
  if (findUserByEmail(email)) throw new Error('An account with this email already exists');

  // Admin role requires secret key
  const finalRole = (role === 'admin' && adminKey === 'ZENFLOW_ADMIN_2024') ? 'admin' : 'user';

  const salt          = generateToken(16);
  const password_hash = hashPassword(password, salt);
  const session_token = generateToken(32);
  const session_expires = new Date(Date.now() + CONFIG.SESSION_HOURS * 60 * 60 * 1000).toISOString();
  const created_at    = new Date().toISOString();
  const id            = Date.now().toString();

  const sheet = getSheet(CONFIG.USERS_TAB);
  sheet.appendRow([
    id, name, email, password_hash, salt,
    finalRole, 'active', created_at, '',
    session_token, session_expires, '', '',
  ]);

  // Send welcome email
  sendWelcomeEmail(email, name);

  return {
    success: true,
    message: 'Account created successfully!',
    user: { id, name, email, role: finalRole },
    session_token,
    session_expires,
  };
}

/** LOGIN — Verify credentials, return session token */
function login(params) {
  const email    = (params.email    || '').trim().toLowerCase();
  const password = (params.password || '').trim();

  if (!email || !password) throw new Error('Email and password are required');

  const user = findUserByEmail(email);
  if (!user) throw new Error('No account found with this email');
  if (user.status !== 'active') throw new Error('Account is inactive. Contact admin.');

  const hash = hashPassword(password, user.salt);
  if (hash !== user.password_hash) throw new Error('Incorrect password');

  // Create new session
  const session_token   = generateToken(32);
  const session_expires = new Date(Date.now() + CONFIG.SESSION_HOURS * 60 * 60 * 1000).toISOString();
  const last_login      = new Date().toISOString();

  updateUserRow(user._row, { session_token, session_expires, last_login });

  return {
    success: true,
    message: 'Login successful!',
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    session_token,
    session_expires,
  };
}

/** LOGOUT — Invalidate session */
function logout(params) {
  const user = requireAuth(params);
  updateUserRow(user._row, { session_token: '', session_expires: '' });
  return { success: true, message: 'Logged out successfully' };
}

/** VERIFY SESSION — Check if token is still valid */
function verifySession(params) {
  try {
    const user = requireAuth(params);
    return {
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/** GET PROFILE */
function getProfile(params) {
  const user = requireAuth(params);
  return {
    success: true,
    user: {
      id: user.id, name: user.name, email: user.email,
      role: user.role, created_at: user.created_at, last_login: user.last_login,
    },
  };
}

/** UPDATE PROFILE */
function updateProfile(params) {
  const user    = requireAuth(params);
  const newName = (params.name || '').trim();
  if (newName) updateUserRow(user._row, { name: newName });

  // Change password if provided
  if (params.new_password) {
    if (!params.current_password) throw new Error('Current password required');
    const currentHash = hashPassword(params.current_password, user.salt);
    if (currentHash !== user.password_hash) throw new Error('Current password is incorrect');
    const newHash = hashPassword(params.new_password, user.salt);
    updateUserRow(user._row, { password_hash: newHash });
  }

  return { success: true, message: 'Profile updated!' };
}

/** FORGOT PASSWORD — Send reset code via Gmail */
function forgotPassword(params) {
  const email = (params.email || '').trim().toLowerCase();
  if (!email) throw new Error('Email is required');

  const user = findUserByEmail(email);
  // Always return success (don't reveal if email exists — security)
  if (!user) return { success: true, message: 'If this email exists, a reset code has been sent.' };

  const reset_code    = generateResetCode();
  const reset_expires = new Date(Date.now() + CONFIG.RESET_MINUTES * 60 * 1000).toISOString();

  updateUserRow(user._row, { reset_code, reset_expires });

  // Send email
  sendResetEmail(email, user.name, reset_code);

  return {
    success: true,
    message: `Reset code sent to ${email}. Check your inbox (expires in ${CONFIG.RESET_MINUTES} minutes).`,
  };
}

/** RESET PASSWORD — Verify code and set new password */
function resetPassword(params) {
  const email     = (params.email     || '').trim().toLowerCase();
  const code      = (params.code      || '').trim();
  const password  = (params.password  || '').trim();

  if (!email || !code || !password) throw new Error('Email, code, and new password are required');
  if (password.length < 6) throw new Error('Password must be at least 6 characters');

  const user = findUserByEmail(email);
  if (!user) throw new Error('No account found with this email');
  if (!user.reset_code || user.reset_code !== code) throw new Error('Invalid reset code');
  if (new Date(user.reset_expires) < new Date()) throw new Error('Reset code has expired. Request a new one.');

  const newHash = hashPassword(password, user.salt);
  updateUserRow(user._row, {
    password_hash: newHash,
    reset_code: '',
    reset_expires: '',
  });

  sendPasswordChangedEmail(email, user.name);

  return { success: true, message: 'Password reset successfully! You can now login.' };
}

// ═══════════════════════════════════════════════════════════════
//  TRACK CRUD
// ═══════════════════════════════════════════════════════════════

function getTracks(params) {
  // Public read — no auth needed
  const sheet = getSheet(CONFIG.TRACKS_TAB);
  if (!sheet) return { success: true, tracks: [] };

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return { success: true, tracks: [] };

  // Build dynamic column map from actual header row
  const colMap = {};
  const headers = data[0];
  headers.forEach((h, i) => {
    const key = String(h).toLowerCase().replace(/\s+/g, '_').trim();
    colMap[key] = i;
  });
  // Fallback to TRACK_COLS if headers not found
  const col = (name) => colMap[name] !== undefined ? colMap[name] : TRACK_COLS[name];

  const rows = data.slice(1);
  const tracks = rows.map((row, i) => ({
    _row:        i + 2,
    id:          row[col('id')]          || '',
    title:       row[col('title')]       || '',
    category:    row[col('category')]    || '',
    drive_link:  row[col('drive_link')]  || '',
    duration:    formatDurationCell(row[col('duration')]),
    tags:        row[col('tags')]        || '',
    description: row[col('description')] || '',
  })).filter(t => t.title);

  return { success: true, tracks };
}

function addTrack(params) {
  requireAuth(params); // Must be logged in

  const sheet = getSheet(CONFIG.TRACKS_TAB);
  const data  = sheet.getDataRange().getValues();
  const maxId = data.slice(1).reduce((max, row) => Math.max(max, parseInt(row[0]) || 0), 0);
  const newId = maxId + 1;

  sheet.appendRow([
    newId,
    params.title       || '',
    params.category    || '',
    params.drive_link  || '',
    params.duration    || '',
    params.tags        || '',
    params.description || '',
  ]);

  // Force duration cell to plain text so Sheets doesn't parse it as time
  const newRow = sheet.getLastRow();
  const durColIndex = (TRACK_COLS.duration || 4) + 1; // 1-indexed
  sheet.getRange(newRow, durColIndex).setNumberFormat('@STRING@');

  return { success: true, message: 'Track added!', id: newId };
}

function updateTrack(params) {
  requireAuth(params);

  // DEBUG — check Apps Script Logs to see what arrives
  Logger.log('updateTrack called. duration received: [' + params.duration + '] | row: ' + params.row_index);
  Logger.log('Full params keys: ' + Object.keys(params).join(', '));

  const rowIndex = parseInt(params.row_index);
  if (!rowIndex || rowIndex < 2) throw new Error('Invalid row index');

  const sheet  = getSheet(CONFIG.TRACKS_TAB);
  // Build dynamic column map from actual header row
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const colMap  = {};
  headers.forEach((h, i) => {
    const key = String(h).toLowerCase().replace(/\s+/g, '_').trim();
    colMap[key] = i;
  });
  Logger.log('Sheet headers: ' + JSON.stringify(headers));
  Logger.log('colMap: ' + JSON.stringify(colMap));
  const col = (name) => colMap[name] !== undefined ? colMap[name] : TRACK_COLS[name];

  // Write each field to its correct column individually
  const updates = {
    id:          params.id          || '',
    title:       params.title       || '',
    category:    params.category    || '',
    drive_link:  params.drive_link  || '',
    duration:    params.duration    || '',
    tags:        params.tags        || '',
    description: params.description || '',
  };

  Object.entries(updates).forEach(([key, value]) => {
    const colIndex = col(key);
    Logger.log('Writing [' + key + '] = [' + value + '] to col ' + (colIndex + 1));
    if (colIndex !== undefined) {
      const cellRange = sheet.getRange(rowIndex, colIndex + 1);
      // Force duration to plain text so Sheets doesn't parse "1:11:10" as a time value
      if (key === 'duration') {
        cellRange.setNumberFormat('@STRING@');
      }
      cellRange.setValue(value);
    }
  });

  return { success: true, message: 'Track updated!', received_duration: params.duration || '(empty)' };
}


function deleteTrack(params) {
  requireAdmin(params); // Only admin can delete

  const rowIndex = parseInt(params.row_index);
  if (!rowIndex || rowIndex < 2) throw new Error('Invalid row index');

  const sheet = getSheet(CONFIG.TRACKS_TAB);
  sheet.deleteRow(rowIndex);

  return { success: true, message: 'Track deleted!' };
}

// ═══════════════════════════════════════════════════════════════
//  ADMIN FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function getUsers(params) {
  requireAdmin(params);
  const users = getAllUsers().map(u => ({
    id: u.id, name: u.name, email: u.email,
    role: u.role, status: u.status,
    created_at: u.created_at, last_login: u.last_login,
    _row: u._row,
  }));
  return { success: true, users };
}

function toggleUser(params) {
  requireAdmin(params);
  const targetEmail = (params.target_email || '').toLowerCase();
  const user = findUserByEmail(targetEmail);
  if (!user) throw new Error('User not found');
  const newStatus = user.status === 'active' ? 'inactive' : 'active';
  updateUserRow(user._row, { status: newStatus });
  return { success: true, message: `User ${newStatus}`, status: newStatus };
}

function deleteUser(params) {
  requireAdmin(params);
  const targetEmail = (params.target_email || '').toLowerCase();
  const user = findUserByEmail(targetEmail);
  if (!user) throw new Error('User not found');
  getSheet(CONFIG.USERS_TAB).deleteRow(user._row);
  return { success: true, message: 'User deleted' };
}

// ═══════════════════════════════════════════════════════════════
//  EMAIL TEMPLATES (Gmail — free via MailApp / GmailApp)
// ═══════════════════════════════════════════════════════════════

function sendEmail(to, subject, htmlBody) {
  GmailApp.sendEmail(to, subject, '', {
    htmlBody: htmlBody,
    name:     CONFIG.APP_NAME,
    replyTo:  CONFIG.ADMIN_EMAIL,
  });
}

function emailTemplate(title, content) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body{margin:0;padding:0;background:#030712;font-family:'Helvetica Neue',Arial,sans-serif}
  .wrap{max-width:520px;margin:0 auto;padding:32px 16px}
  .card{background:#0f172a;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)}
  .header{background:linear-gradient(135deg,#6366f1,#a78bfa);padding:32px;text-align:center}
  .logo{font-size:32px;margin-bottom:8px}
  .app-name{color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px}
  .body{padding:32px}
  .greeting{font-size:18px;font-weight:700;color:#f1f5f9;margin-bottom:12px}
  p{color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 16px}
  .code-box{
    background:#1e293b;border:2px solid #6366f1;border-radius:14px;
    padding:20px;text-align:center;margin:20px 0;
  }
  .code{font-size:36px;font-weight:900;letter-spacing:8px;color:#818cf8;font-family:monospace}
  .code-label{font-size:12px;color:#475569;margin-top:6px}
  .btn{
    display:inline-block;background:linear-gradient(135deg,#6366f1,#a78bfa);
    color:#fff;padding:14px 32px;border-radius:12px;
    text-decoration:none;font-weight:700;font-size:15px;
    margin:8px 0;
  }
  .footer{text-align:center;padding:20px;font-size:11px;color:#334155}
  .divider{border:none;border-top:1px solid rgba(255,255,255,0.06);margin:20px 0}
  .warning{background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);
    border-radius:10px;padding:12px 16px;font-size:12px;color:#f59e0b;margin-top:16px}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="header">
      <div class="logo">◎</div>
      <div class="app-name">ZenFlow</div>
    </div>
    <div class="body">
      ${content}
    </div>
  </div>
  <div class="footer">
    © 2024 ZenFlow Hypnotherapy Audio · Ad-free · Zero cost<br>
    This email was sent automatically. Please do not reply.
  </div>
</div>
</body>
</html>`;
}

function sendWelcomeEmail(to, name) {
  const content = `
    <div class="greeting">Welcome to ZenFlow, ${name}! 🎉</div>
    <p>Your account has been created successfully. You now have access to our complete library of hypnotherapy audio sessions — completely free, zero ads.</p>
    <p><strong style="color:#f1f5f9">What you can do:</strong></p>
    <p>◎ Stream binaural beats & guided sessions<br>
    ♃ Download tracks for offline playback<br>
    ◈ Mix ambient layers with voice guides<br>
    ◉ Access everything from any device</p>
    <hr class="divider">
    <p style="font-size:12px;color:#475569">If you did not create this account, please ignore this email.</p>
  `;
  sendEmail(to, `Welcome to ${CONFIG.APP_NAME}! Your sanctuary awaits ◎`, emailTemplate('Welcome!', content));
}

function sendResetEmail(to, name, code) {
  const content = `
    <div class="greeting">Reset your password</div>
    <p>Hi ${name}, we received a request to reset your ZenFlow password. Use this code:</p>
    <div class="code-box">
      <div class="code">${code}</div>
      <div class="code-label">Expires in ${CONFIG.RESET_MINUTES} minutes</div>
    </div>
    <p>Enter this code in the password reset form to create a new password.</p>
    <div class="warning">⚠️ If you did not request this, please ignore this email. Your password will not change.</div>
  `;
  sendEmail(to, `${code} — Your ZenFlow password reset code`, emailTemplate('Reset Password', content));
}

function sendPasswordChangedEmail(to, name) {
  const content = `
    <div class="greeting">Password changed ✅</div>
    <p>Hi ${name}, your ZenFlow password has been successfully changed.</p>
    <p>If you made this change, no further action is needed. You can now login with your new password.</p>
    <div class="warning">⚠️ If you did NOT make this change, please contact us immediately by replying to this email.</div>
  `;
  sendEmail(to, `ZenFlow — Your password was changed`, emailTemplate('Password Changed', content));
}

// ═══════════════════════════════════════════════════════════════
//  SETUP HELPER — Run once manually in Apps Script editor
// ═══════════════════════════════════════════════════════════════
function setupFirstAdmin() {
  // Run this ONCE from the Apps Script editor to create your first admin account
  // Change the values below, then click Run
  const FIRST_ADMIN_NAME     = 'Admin';
  const FIRST_ADMIN_EMAIL    = 'your@gmail.com'; // ← CHANGE THIS
  const FIRST_ADMIN_PASSWORD = 'Admin@1234';     // ← CHANGE THIS

  ensureUsersSheet();

  const existing = findUserByEmail(FIRST_ADMIN_EMAIL);
  if (existing) {
    Logger.log('Admin already exists: ' + FIRST_ADMIN_EMAIL);
    return;
  }

  const salt   = generateToken(16);
  const hash   = hashPassword(FIRST_ADMIN_PASSWORD, salt);
  const id     = Date.now().toString();
  const now    = new Date().toISOString();

  getSheet(CONFIG.USERS_TAB).appendRow([
    id, FIRST_ADMIN_NAME, FIRST_ADMIN_EMAIL, hash, salt,
    'admin', 'active', now, '', '', '', '', '',
  ]);

  Logger.log('✅ Admin account created: ' + FIRST_ADMIN_EMAIL);
}
