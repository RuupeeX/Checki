const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// ── GET /api/settings ──
exports.get = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM user_settings WHERE user_id = ?', [req.user.id]);
    if (rows.length === 0) {
      // Crear settings por defecto si no existen
      await pool.query('INSERT INTO user_settings (user_id) VALUES (?)', [req.user.id]);
      const [newRows] = await pool.query('SELECT * FROM user_settings WHERE user_id = ?', [req.user.id]);
      return res.json(newRows[0]);
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── PUT /api/settings ──
exports.update = async (req, res) => {
  try {
    const allowed = [
      'theme', 'language', 'timezone', 'date_format', 'time_format',
      'notif_enabled', 'email_checkin', 'email_late', 'email_reports',
      'push_checkin', 'push_late', 'gps_enabled',
      'quiet_hours', 'quiet_from', 'quiet_to',
    ];

    const fields = [];
    const params = [];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(req.body[key]);
      }
    }

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update.' });

    params.push(req.user.id);

    // Upsert: crear si no existe
    const [existing] = await pool.query('SELECT id FROM user_settings WHERE user_id = ?', [req.user.id]);
    if (existing.length === 0) {
      await pool.query('INSERT INTO user_settings (user_id) VALUES (?)', [req.user.id]);
    }

    await pool.query(`UPDATE user_settings SET ${fields.join(', ')} WHERE user_id = ?`, params);

    const [rows] = await pool.query('SELECT * FROM user_settings WHERE user_id = ?', [req.user.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── PUT /api/settings/profile ──
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, job_title, dept_id, phone } = req.body;
    const fields = [];
    const params = [];

    if (name !== undefined)      { fields.push('name = ?');      params.push(name); }
    if (email !== undefined)     { fields.push('email = ?');     params.push(email); }
    if (job_title !== undefined) { fields.push('job_title = ?'); params.push(job_title); }
    if (dept_id !== undefined)   { fields.push('dept_id = ?');   params.push(dept_id); }
    if (phone !== undefined)     { fields.push('phone = ?');     params.push(phone); }

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update.' });

    params.push(req.user.id);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);

    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.name, u.role, u.job_title, u.phone, u.avatar_url, u.shift_start, u.shift_end, u.join_date, d.name AS dept_name
       FROM users u LEFT JOIN departments d ON u.dept_id = d.id WHERE u.id = ?`,
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already in use.' });
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── PUT /api/settings/password ──
exports.updatePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) return res.status(400).json({ error: 'Both passwords required.' });
    if (new_password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters.' });

    const [user] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const valid = await bcrypt.compare(current_password, user[0].password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' });

    const hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.id]);

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};