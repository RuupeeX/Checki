const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// ── GET /api/employees ──
exports.getAll = async (req, res) => {
  try {
    const { dept, status, search, page = 1, limit = 20 } = req.query;
    let sql = `SELECT u.id, u.email, u.name, u.role, u.job_title, u.phone, u.location, u.shift_start, u.shift_end, u.join_date, u.is_active, d.name AS dept_name
               FROM users u LEFT JOIN departments d ON u.dept_id = d.id WHERE u.is_active = TRUE AND u.role = 'employee'`;
    const params = [];

    if (dept && dept !== 'All') {
      sql += ' AND d.name = ?';
      params.push(dept);
    }
    if (search) {
      sql += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.job_title LIKE ? OR d.name LIKE ?)';
      const q = `%${search}%`;
      params.push(q, q, q, q);
    }

    // Contar total
    let countSql = `SELECT COUNT(*) as total FROM users u LEFT JOIN departments d ON u.dept_id = d.id WHERE u.is_active = TRUE AND u.role = 'employee'`;
    const countParams = [];

    if (dept && dept !== 'All') {
      countSql += ' AND d.name = ?';
      countParams.push(dept);
    }
    if (search) {
      countSql += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.job_title LIKE ? OR d.name LIKE ?)';
      const q = `%${search}%`;
      countParams.push(q, q, q, q);
    }

    const [countRows] = await pool.query(countSql, countParams);
    const total = countRows[0].total;

    // Paginar
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ' ORDER BY u.name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await pool.query(sql, params);

    // Añadir estado de asistencia de hoy
    const today = new Date().toISOString().split('T')[0];
    const [attendance] = await pool.query(
      'SELECT user_id, status FROM attendance WHERE date = ?', [today]
    );
    const attMap = {};
    attendance.forEach(a => { attMap[a.user_id] = a.status; });

    const employees = rows.map(emp => ({
      ...emp,
      attendance_status: attMap[emp.id] || 'absent',
    }));

    res.json({ employees, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('GetAll employees error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── GET /api/employees/:id ──
exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.*, d.name AS dept_name FROM users u LEFT JOIN departments d ON u.dept_id = d.id WHERE u.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Employee not found.' });
    const { password, ...emp } = rows[0];
    res.json(emp);
  } catch (err) {
    console.error('GetById employee error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── POST /api/employees ──
exports.create = async (req, res) => {
  try {
    const { email, name, job_title, dept_id, phone, shift_start, shift_end, password = '1234' } = req.body;
    if (!email || !name) return res.status(400).json({ error: 'Email and name required.' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (email, password, name, role, job_title, dept_id, phone, shift_start, shift_end, join_date)
       VALUES (?, ?, ?, 'employee', ?, ?, ?, ?, ?, CURDATE())`,
      [email, hash, name, job_title || null, dept_id || null, phone || null, shift_start || '08:30:00', shift_end || '17:30:00']
    );

    await pool.query('INSERT INTO user_settings (user_id) VALUES (?)', [result.insertId]);

    const [rows] = await pool.query(
      `SELECT u.*, d.name AS dept_name FROM users u LEFT JOIN departments d ON u.dept_id = d.id WHERE u.id = ?`,
      [result.insertId]
    );
    const { password: _, ...emp } = rows[0];
    res.status(201).json(emp);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists.' });
    console.error('Create employee error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── PUT /api/employees/:id ──
exports.update = async (req, res) => {
  try {
    const { name, job_title, dept_id, phone, shift_start, shift_end, email } = req.body;
    const fields = [];
    const params = [];

    if (name !== undefined)        { fields.push('name = ?');        params.push(name); }
    if (email !== undefined)       { fields.push('email = ?');       params.push(email); }
    if (job_title !== undefined)   { fields.push('job_title = ?');   params.push(job_title); }
    if (dept_id !== undefined)     { fields.push('dept_id = ?');     params.push(dept_id); }
    if (phone !== undefined)       { fields.push('phone = ?');       params.push(phone); }
    if (shift_start !== undefined) { fields.push('shift_start = ?'); params.push(shift_start); }
    if (shift_end !== undefined)   { fields.push('shift_end = ?');   params.push(shift_end); }

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update.' });

    params.push(req.params.id);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);

    const [rows] = await pool.query(
      `SELECT u.*, d.name AS dept_name FROM users u LEFT JOIN departments d ON u.dept_id = d.id WHERE u.id = ?`,
      [req.params.id]
    );
    const { password, ...emp } = rows[0];
    res.json(emp);
  } catch (err) {
    console.error('Update employee error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── DELETE /api/employees/:id (soft delete) ──
exports.remove = async (req, res) => {
  try {
    await pool.query('UPDATE users SET is_active = FALSE WHERE id = ?', [req.params.id]);
    res.json({ message: 'Employee deactivated.' });
  } catch (err) {
    console.error('Delete employee error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── GET /api/employees/stats/departments ──
exports.departmentStats = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.name, COUNT(u.id) AS total FROM departments d LEFT JOIN users u ON u.dept_id = d.id AND u.is_active = TRUE GROUP BY d.id, d.name`
    );
    const today = new Date().toISOString().split('T')[0];
    const [att] = await pool.query(
      `SELECT d.name, COUNT(a.id) AS present FROM attendance a JOIN users u ON a.user_id = u.id JOIN departments d ON u.dept_id = d.id WHERE a.date = ? AND a.status IN ('on_time','late') GROUP BY d.name`,
      [today]
    );
    const attMap = {};
    att.forEach(a => { attMap[a.name] = a.present; });

    const stats = rows.map(d => ({
      name: d.name,
      total: d.total,
      present: attMap[d.name] || 0,
    }));
    res.json(stats);
  } catch (err) {
    console.error('Dept stats error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};