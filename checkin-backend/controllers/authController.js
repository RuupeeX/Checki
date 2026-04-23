const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../config/db');
const { ERRORS } = require('../config/constants');

// ── POST /api/auth/login ──
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      `SELECT u.*, d.name AS dept_name
       FROM users u LEFT JOIN departments d ON u.dept_id = d.id
       WHERE u.email = ? AND u.is_active = TRUE`,
      [email]
    );
    if (rows.length === 0) return res.status(401).json({ error: ERRORS.INVALID_CREDENTIALS });

    const user  = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: ERRORS.INVALID_CREDENTIALS });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { password: _, ...userData } = user;
    res.json({ token, user: userData });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};

// ── POST /api/auth/register ──
exports.register = async (req, res) => {
  try {
    const { email, password, name, role = 'employee', job_title, dept_id, phone } = req.body;

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ error: ERRORS.EMAIL_EXISTS });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (email, password, name, role, job_title, dept_id, phone, join_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
      [email, hash, name, role, job_title || null, dept_id || null, phone || null]
    );

    await pool.query('INSERT INTO user_settings (user_id) VALUES (?)', [result.insertId]);

    const token = jwt.sign(
      { id: result.insertId, email, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({ token, user: { id: result.insertId, email, name, role } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};

// ── GET /api/auth/me ──
exports.me = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.name, u.role, u.job_title, u.phone, u.avatar_url,
              u.shift_start, u.shift_end, u.join_date, d.name AS dept_name
       FROM users u LEFT JOIN departments d ON u.dept_id = d.id
       WHERE u.id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: ERRORS.USER_NOT_FOUND });
    res.json(rows[0]);
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};