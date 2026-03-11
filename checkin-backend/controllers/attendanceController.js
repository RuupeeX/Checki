const pool = require('../config/db');

// ── POST /api/attendance/check-in ──
exports.checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const { location = 'office' } = req.body; // 'office' | 'home' | 'remote'
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Verificar si ya hizo check-in hoy
    const [existing] = await pool.query(
      'SELECT id FROM attendance WHERE user_id = ? AND date = ?', [userId, today]
    );
    if (existing.length > 0) return res.status(409).json({ error: 'Already checked in today.' });

    // Determinar si llega tarde
    const [user] = await pool.query('SELECT shift_start FROM users WHERE id = ?', [userId]);
    const shiftStart = user[0].shift_start;
    const currentTime = now.toTimeString().slice(0, 8);
    const status = currentTime > shiftStart ? 'late' : 'on_time';

    const [result] = await pool.query(
      'INSERT INTO attendance (user_id, date, check_in, status, location) VALUES (?, ?, ?, ?, ?)',
      [userId, today, now, status, location]
    );

    res.status(201).json({
      id: result.insertId,
      user_id: userId,
      date: today,
      check_in: now,
      check_out: null,
      status,
    });
  } catch (err) {
    console.error('Check-in error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── POST /api/attendance/check-out ──
exports.checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    const [rows] = await pool.query(
      'SELECT id, check_in FROM attendance WHERE user_id = ? AND date = ? AND check_out IS NULL', [userId, today]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'No active check-in found for today.' });

    // Cerrar breaks abiertos
    await pool.query(
      'UPDATE breaks SET end_time = ?, duration_minutes = TIMESTAMPDIFF(MINUTE, start_time, ?) WHERE attendance_id = ? AND end_time IS NULL',
      [now, now, rows[0].id]
    );

    // Calcular minutos trabajados
    const checkInTime = new Date(rows[0].check_in);
    const totalMinutes = Math.floor((now - checkInTime) / 60000);
    
    // Restar breaks
    const [breakRows] = await pool.query(
      'SELECT COALESCE(SUM(duration_minutes), 0) AS total_break FROM breaks WHERE attendance_id = ?', [rows[0].id]
    );
    const workedMinutes = Math.max(0, totalMinutes - breakRows[0].total_break);

    await pool.query('UPDATE attendance SET check_out = ?, worked_minutes = ? WHERE id = ?', [now, workedMinutes, rows[0].id]);

    res.json({ message: 'Checked out successfully.', check_out: now });
  } catch (err) {
    console.error('Check-out error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── POST /api/attendance/break/start ──
exports.startBreak = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    const [att] = await pool.query(
      'SELECT id FROM attendance WHERE user_id = ? AND date = ? AND check_out IS NULL', [userId, today]
    );
    if (att.length === 0) return res.status(404).json({ error: 'No active check-in found.' });

    // Verificar que no hay un break abierto
    const [openBreak] = await pool.query(
      'SELECT id FROM breaks WHERE attendance_id = ? AND end_time IS NULL', [att[0].id]
    );
    if (openBreak.length > 0) return res.status(409).json({ error: 'Break already in progress.' });

    const [result] = await pool.query(
      'INSERT INTO breaks (attendance_id, start_time) VALUES (?, ?)',
      [att[0].id, now]
    );

    res.status(201).json({ id: result.insertId, start_time: now });
  } catch (err) {
    console.error('Start break error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── POST /api/attendance/break/end ──
exports.endBreak = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    const [att] = await pool.query(
      'SELECT id FROM attendance WHERE user_id = ? AND date = ? AND check_out IS NULL', [userId, today]
    );
    if (att.length === 0) return res.status(404).json({ error: 'No active check-in found.' });

    const [openBreak] = await pool.query(
      'SELECT id FROM breaks WHERE attendance_id = ? AND end_time IS NULL', [att[0].id]
    );
    if (openBreak.length === 0) return res.status(404).json({ error: 'No active break found.' });

    await pool.query('UPDATE breaks SET end_time = ? WHERE id = ?', [now, openBreak[0].id]);

    res.json({ message: 'Break ended.', end_time: now });
  } catch (err) {
    console.error('End break error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── GET /api/attendance/today ──
exports.getToday = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const [att] = await pool.query(
      'SELECT * FROM attendance WHERE user_id = ? AND date = ?', [userId, today]
    );
    if (att.length === 0) return res.json({ checked_in: false });

    const [breaks] = await pool.query(
      'SELECT * FROM breaks WHERE attendance_id = ? ORDER BY start_time', [att[0].id]
    );

    res.json({ checked_in: true, ...att[0], breaks });
  } catch (err) {
    console.error('Get today error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── GET /api/attendance/history?from=&to=&user_id= ──
exports.getHistory = async (req, res) => {
  try {
    const { from, to, user_id } = req.query;
    const targetUser = req.user.role === 'admin' && user_id ? user_id : req.user.id;

    let sql = `SELECT a.*, u.name AS user_name, d.name AS dept_name
               FROM attendance a JOIN users u ON a.user_id = u.id LEFT JOIN departments d ON u.dept_id = d.id
               WHERE a.user_id = ?`;
    const params = [targetUser];

    if (from) { sql += ' AND a.date >= ?'; params.push(from); }
    if (to)   { sql += ' AND a.date <= ?'; params.push(to); }
    sql += ' ORDER BY a.date DESC LIMIT 30';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── GET /api/attendance/weekly-stats ── (admin dashboard chart)
exports.weeklyStats = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        DAYNAME(a.date) AS day_name,
        DAYOFWEEK(a.date) AS day_num,
        SUM(CASE WHEN a.status = 'on_time' THEN 1 ELSE 0 END) AS present,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) AS late,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) AS absent
      FROM attendance a
      WHERE a.date >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
        AND a.date <= DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 4 DAY)
      GROUP BY DAYNAME(a.date), DAYOFWEEK(a.date)
      ORDER BY day_num
    `);
    res.json(rows);
  } catch (err) {
    console.error('Weekly stats error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};