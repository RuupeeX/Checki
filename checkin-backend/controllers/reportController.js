const pool = require('../config/db');
const { ERRORS, SUCCESS, REPORT_STATUSES } = require('../config/constants');

// ── GET /api/reports ──
exports.getAll = async (req, res) => {
  try {
    const { type, status, dept, search, page, limit } = req.query;
    const isAdmin = req.user.role === 'admin';
    const params  = [];

    let sql = `SELECT r.*, u.name AS employee_name, d.name AS dept_name
               FROM reports r
               JOIN users u ON r.user_id = u.id
               LEFT JOIN departments d ON u.dept_id = d.id
               WHERE 1=1`;

    if (!isAdmin) { sql += ' AND r.user_id = ?'; params.push(req.user.id); }
    if (type   && type   !== 'all') { sql += ' AND r.type = ?';   params.push(type); }
    if (status && status !== 'all') { sql += ' AND r.status = ?'; params.push(status); }
    if (dept   && dept   !== 'All') { sql += ' AND d.name = ?';   params.push(dept); }
    if (search) {
      sql += ' AND (r.description LIKE ? OR u.name LIKE ? OR d.name LIKE ?)';
      const q = `%${search}%`;
      params.push(q, q, q);
    }

    const [[{ total }]] = await pool.query(
      sql.replace(/SELECT .+? FROM/, 'SELECT COUNT(*) AS total FROM'), params
    );

    sql += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const [rows] = await pool.query(sql, params);
    res.json({ reports: rows, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Get reports error:', err);
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};

// ── POST /api/reports ──
exports.create = async (req, res) => {
  try {
    const { type, reason, description, date } = req.body;

    const [result] = await pool.query(
      'INSERT INTO reports (user_id, type, reason, description, date) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, type, reason || null, description || '', date]
    );

    const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin' AND is_active = TRUE");
    const [[user]] = await pool.query('SELECT name FROM users WHERE id = ?', [req.user.id]);

    const notifValues = admins.map(a => [a.id, `New ${type} request`, `${user.name} submitted a ${type} request`, 'request']);
    if (notifValues.length > 0) {
      await pool.query(
        'INSERT INTO notifications (user_id, title, description, type) VALUES ?', [notifValues]
      );
    }

    const [rows] = await pool.query(
      `SELECT r.*, u.name AS employee_name, d.name AS dept_name
       FROM reports r JOIN users u ON r.user_id = u.id LEFT JOIN departments d ON u.dept_id = d.id
       WHERE r.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create report error:', err);
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};

// ── PATCH /api/reports/:id/status ──
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!REPORT_STATUSES.includes(status)) return res.status(400).json({ error: ERRORS.INVALID_REPORT_STATUS });

    const [report] = await pool.query('SELECT * FROM reports WHERE id = ?', [req.params.id]);
    if (report.length === 0) return res.status(404).json({ error: ERRORS.REPORT_NOT_FOUND });

    await pool.query(
      'UPDATE reports SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?',
      [status, req.user.id, req.params.id]
    );

    const label    = status.charAt(0).toUpperCase() + status.slice(1);
    const notifType = status === 'approved' ? 'success' : 'error';
    await pool.query(
      'INSERT INTO notifications (user_id, title, description, type) VALUES (?, ?, ?, ?)',
      [report[0].user_id, `Request ${label}`, `Your ${report[0].type} request has been ${status}.`, notifType]
    );

    const [rows] = await pool.query(
      `SELECT r.*, u.name AS employee_name, d.name AS dept_name
       FROM reports r JOIN users u ON r.user_id = u.id LEFT JOIN departments d ON u.dept_id = d.id
       WHERE r.id = ?`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Update report status error:', err);
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};

// ── DELETE /api/reports/:id ──
exports.remove = async (req, res) => {
  try {
    const [report] = await pool.query('SELECT * FROM reports WHERE id = ?', [req.params.id]);
    if (report.length === 0) return res.status(404).json({ error: ERRORS.REPORT_NOT_FOUND });

    if (req.user.role !== 'admin' && report[0].user_id !== req.user.id)
      return res.status(403).json({ error: ERRORS.NOT_AUTHORIZED });

    if (report[0].status !== 'pending' && req.user.role !== 'admin')
      return res.status(400).json({ error: ERRORS.ONLY_PENDING });

    await pool.query('DELETE FROM reports WHERE id = ?', [req.params.id]);
    res.json({ message: SUCCESS.REPORT_DELETED });
  } catch (err) {
    console.error('Delete report error:', err);
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};

// ── GET /api/reports/stats ──
exports.stats = async (req, res) => {
  try {
    const isAdmin    = req.user.role === 'admin';
    const userFilter = isAdmin ? '' : 'WHERE r.user_id = ?';
    const params     = isAdmin ? [] : [req.user.id];

    const [rows] = await pool.query(
      `SELECT r.status, COUNT(*) AS count FROM reports r ${userFilter} GROUP BY r.status`, params
    );

    const stats = { total: 0, pending: 0, approved: 0, rejected: 0, resolved: 0 };
    rows.forEach(r => { stats[r.status] = r.count; stats.total += r.count; });
    res.json(stats);
  } catch (err) {
    console.error('Report stats error:', err);
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};