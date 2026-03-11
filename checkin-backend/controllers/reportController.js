const pool = require('../config/db');

// ── GET /api/reports ──
exports.getAll = async (req, res) => {
  try {
    const { type, status, dept, search, page = 1, limit = 20 } = req.query;
    const isAdmin = req.user.role === 'admin';

    let sql = `SELECT r.*, u.name AS employee_name, d.name AS dept_name
               FROM reports r JOIN users u ON r.user_id = u.id LEFT JOIN departments d ON u.dept_id = d.id WHERE 1=1`;
    const params = [];

    // Empleado solo ve los suyos
    if (!isAdmin) {
      sql += ' AND r.user_id = ?';
      params.push(req.user.id);
    }

    if (type && type !== 'all')     { sql += ' AND r.type = ?';   params.push(type); }
    if (status && status !== 'all') { sql += ' AND r.status = ?'; params.push(status); }
    if (dept && dept !== 'All') {
      sql += ' AND d.name = ?';
      params.push(dept);
    }
    if (search) {
      sql += ' AND (r.description LIKE ? OR u.name LIKE ? OR d.name LIKE ?)';
      const q = `%${search}%`;
      params.push(q, q, q);
    }

    const countSql = sql.replace(/SELECT .+ FROM/, 'SELECT COUNT(*) as total FROM');
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    sql += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [rows] = await pool.query(sql, params);
    res.json({ reports: rows, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('Get reports error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── POST /api/reports ──
exports.create = async (req, res) => {
  try {
    const { type, reason, description, date } = req.body;
    if (!type || !date) return res.status(400).json({ error: 'Type and date required.' });

    const [result] = await pool.query(
      'INSERT INTO reports (user_id, type, reason, description, date) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, type, reason || null, description || '', date]
    );

    // Notificar admins
    const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin' AND is_active = TRUE");
    const [user] = await pool.query('SELECT name FROM users WHERE id = ?', [req.user.id]);
    for (const admin of admins) {
      await pool.query(
        'INSERT INTO notifications (user_id, title, description, type) VALUES (?, ?, ?, ?)',
        [admin.id, `New ${type} request`, `${user[0].name} submitted a ${type} request`, 'request']
      );
    }

    const [rows] = await pool.query(
      `SELECT r.*, u.name AS employee_name, d.name AS dept_name FROM reports r JOIN users u ON r.user_id = u.id LEFT JOIN departments d ON u.dept_id = d.id WHERE r.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create report error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── PATCH /api/reports/:id/status ── (admin: approve/reject)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' | 'rejected' | 'resolved'
    if (!['approved', 'rejected', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const [report] = await pool.query('SELECT * FROM reports WHERE id = ?', [req.params.id]);
    if (report.length === 0) return res.status(404).json({ error: 'Report not found.' });

    await pool.query(
      'UPDATE reports SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?',
      [status, req.user.id, req.params.id]
    );

    // Notificar al empleado
    const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
    await pool.query(
      'INSERT INTO notifications (user_id, title, description, type) VALUES (?, ?, ?, ?)',
      [report[0].user_id, `Request ${statusLabel}`, `Your ${report[0].type} request has been ${status}.`, status === 'approved' ? 'success' : 'error']
    );

    const [rows] = await pool.query(
      `SELECT r.*, u.name AS employee_name, d.name AS dept_name FROM reports r JOIN users u ON r.user_id = u.id LEFT JOIN departments d ON u.dept_id = d.id WHERE r.id = ?`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Update report status error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── DELETE /api/reports/:id ── (empleado cancela su request pendiente)
exports.remove = async (req, res) => {
  try {
    const [report] = await pool.query('SELECT * FROM reports WHERE id = ?', [req.params.id]);
    if (report.length === 0) return res.status(404).json({ error: 'Report not found.' });

    // Solo el dueño o admin puede borrar, y solo si está pending
    if (req.user.role !== 'admin' && report[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized.' });
    }
    if (report[0].status !== 'pending' && req.user.role !== 'admin') {
      return res.status(400).json({ error: 'Only pending requests can be cancelled.' });
    }

    await pool.query('DELETE FROM reports WHERE id = ?', [req.params.id]);
    res.json({ message: 'Report deleted.' });
  } catch (err) {
    console.error('Delete report error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── GET /api/reports/stats ──
exports.stats = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const userFilter = isAdmin ? '' : 'WHERE r.user_id = ?';
    const params = isAdmin ? [] : [req.user.id];

    const [rows] = await pool.query(
      `SELECT r.status, COUNT(*) AS count FROM reports r ${userFilter} GROUP BY r.status`,
      params
    );

    const stats = { total: 0, pending: 0, approved: 0, rejected: 0, resolved: 0 };
    rows.forEach(r => { stats[r.status] = r.count; stats.total += r.count; });
    res.json(stats);
  } catch (err) {
    console.error('Report stats error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};