const bcrypt = require('bcryptjs');
const pool   = require('../config/db');
const { ERRORS, SUCCESS } = require('../config/constants');

// ── GET /api/employees ──
exports.getAll = async (req, res) => {
  try {
    const { dept, search, page, limit } = req.query; // paginación ya normalizada por middleware
    const params      = [];
    const countParams = [];

    let baseWhere = `WHERE u.is_active = TRUE AND u.role = 'employee'`;

    if (dept && dept !== 'All') {
      baseWhere += ' AND d.name = ?';
      params.push(dept);
      countParams.push(dept);
    }
    if (search) {
      baseWhere += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.job_title LIKE ? OR d.name LIKE ?)';
      const q = `%${search}%`;
      params.push(q, q, q, q);
      countParams.push(q, q, q, q);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM users u LEFT JOIN departments d ON u.dept_id = d.id ${baseWhere}`,
      countParams
    );

    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.name, u.role, u.job_title, u.phone, u.location,
              u.shift_start, u.shift_end, u.join_date, u.is_active, d.name AS dept_name
       FROM users u LEFT JOIN departments d ON u.dept_id = d.id
       ${baseWhere} ORDER BY u.name ASC LIMIT ? OFFSET ?`,
      params
    );

    const today = new Date().toISOString().split('T')[0];
    const [attendance] = await pool.query(
      'SELECT user_id, status FROM attendance WHERE date = ?', [today]
    );
    const attMap = Object.fromEntries(attendance.map(a => [a.user_id, a.status]));

    const employees = rows.map(emp => ({
      ...emp,
      attendance_status: attMap[emp.id] || 'absent',
    }));

    res.json({ employees, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('GetAll employees error:', err);
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};

// ── GET /api/employees/:id ──
exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.*, d.name AS dept_name FROM users u LEFT JOIN departments d ON u.dept_id = d.id WHERE u.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: ERRORS.EMPLOYEE_NOT_FOUND });
    const { password, ...emp } = rows[0];
    res.json(emp);
  } catch (err) {
    console.error('GetById employee error:', err);
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};

// ── POST /api/employees ──
exports.create = async (req, res) => {
  try {
    const {
      email, name, job_title, dept_id, phone, shift_start, shift_end,
      password = process.env.DEFAULT_EMPLOYEE_PASSWORD || '1234',
    } = req.body;

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (email, password, name, role, job_title, dept_id, phone, shift_start, shift_end, join_date)
       VALUES (?, ?, ?, 'employee', ?, ?, ?, ?, ?, CURDATE())`,
      [
        email, hash, name, job_title || null, dept_id || null, phone || null,
        shift_start || process.env.DEFAULT_SHIFT_START || '08:30:00',
        shift_end   || process.env.DEFAULT_SHIFT_END   || '17:30:00',
      ]
    );

    await pool.query('INSERT INTO user_settings (user_id) VALUES (?)', [result.insertId]);

    const [rows] = await pool.query(
      `SELECT u.*, d.name AS dept_name FROM users u LEFT JOIN departments d ON u.dept_id = d.id WHERE u.id = ?`,
      [result.insertId]
    );
    const { password: _, ...emp } = rows[0];
    res.status(201).json(emp);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: ERRORS.EMAIL_EXISTS });
    console.error('Create employee error:', err);
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};

// ── PUT /api/employees/:id ──
exports.update = async (req, res) => {
  try {
    const allowed = ['name', 'email', 'job_title', 'dept_id', 'phone', 'shift_start', 'shift_end'];
    const fields  = [];
    const params  = [];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(req.body[key]);
      }
    }
    if (fields.length === 0) return res.status(400).json({ error: ERRORS.NO_FIELDS });

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
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};

// ── DELETE /api/employees/:id ──
exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM users WHERE id = ? AND role = "employee"', [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: ERRORS.EMPLOYEE_NOT_FOUND });
    res.json({ message: SUCCESS.EMPLOYEE_DELETED });
  } catch (err) {
    console.error('Delete employee error:', err);
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};

// ── GET /api/employees/stats/departments ──
exports.departmentStats = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.name, COUNT(u.id) AS total
       FROM departments d LEFT JOIN users u ON u.dept_id = d.id AND u.is_active = TRUE
       GROUP BY d.id, d.name`
    );

    const today = new Date().toISOString().split('T')[0];
    const [att] = await pool.query(
      `SELECT d.name, COUNT(a.id) AS present
       FROM attendance a
       JOIN users u ON a.user_id = u.id
       JOIN departments d ON u.dept_id = d.id
       WHERE a.date = ? AND a.status IN ('on_time','late')
       GROUP BY d.name`,
      [today]
    );
    const attMap = Object.fromEntries(att.map(a => [a.name, a.present]));

    res.json(rows.map(d => ({ name: d.name, total: d.total, present: attMap[d.name] || 0 })));
  } catch (err) {
    console.error('Dept stats error:', err);
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};