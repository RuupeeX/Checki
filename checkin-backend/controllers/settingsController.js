const bcrypt = require('bcryptjs');
const pool   = require('../config/db');
const { ERRORS, SUCCESS } = require('../config/constants');

const SETTINGS_ALLOWED = [
  'theme', 'language', 'timezone', 'date_format', 'time_format',
  'notif_enabled', 'email_checkin', 'email_late', 'email_reports',
  'push_checkin', 'push_late', 'gps_enabled',
  'quiet_hours', 'quiet_from', 'quiet_to',
];

// ── GET /api/settings ──
exports.get = async (req, res) => {
  try {
    let [rows] = await pool.query('SELECT * FROM user_settings WHERE user_id = ?', [req.user.id]);

    if (rows.length === 0) {
      await pool.query('INSERT INTO user_settings (user_id) VALUES (?)', [req.user.id]);
      [rows] = await pool.query('SELECT * FROM user_settings WHERE user_id = ?', [req.user.id]);
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};

// ── PUT /api/settings ──
exports.update = async (req, res) => {
  try {
    const fields = [];
    const params = [];

    for (const key of SETTINGS_ALLOWED) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(req.body[key]);
      }
    }
    if (fields.length === 0) return res.status(400).json({ error: ERRORS.NO_FIELDS });

    params.push(req.user.id);

    const [existing] = await pool.query('SELECT id FROM user_settings WHERE user_id = ?', [req.user.id]);
    if (existing.length === 0) {
      await pool.query('INSERT INTO user_settings (user_id) VALUES (?)', [req.user.id]);
    }

    await pool.query(`UPDATE user_settings SET ${fields.join(', ')} WHERE user_id = ?`, params);

    const [rows] = await pool.query('SELECT * FROM user_settings WHERE user_id = ?', [req.user.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};

// ── PUT /api/settings/profile ──
exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'email', 'job_title', 'dept_id', 'phone'];
    const fields  = [];
    const params  = [];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(req.body[key]);
      }
    }
    if (fields.length === 0) return res.status(400).json({ error: ERRORS.NO_FIELDS });

    params.push(req.user.id);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);

    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.name, u.role, u.job_title, u.phone, u.avatar_url,
              u.shift_start, u.shift_end, u.join_date, d.name AS dept_name
       FROM users u LEFT JOIN departments d ON u.dept_id = d.id
       WHERE u.id = ?`,
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: ERRORS.EMAIL_IN_USE });
    console.error('Update profile error:', err);
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};

// ── PUT /api/settings/password ──
exports.updatePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const minLen = parseInt(process.env.MIN_PASSWORD_LENGTH) || 4;

    if (new_password.length < minLen) return res.status(400).json({ error: ERRORS.PASSWORD_TOO_SHORT });

    const [[user]] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const valid    = await bcrypt.compare(current_password, user.password);
    if (!valid) return res.status(401).json({ error: ERRORS.WRONG_PASSWORD });

    const hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.id]);

    res.json({ message: SUCCESS.PASSWORD_UPDATED });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};