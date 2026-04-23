const pool = require('../config/db');
const { ERRORS, SUCCESS, EVENT_TYPES } = require('../config/constants');

// ── GET /api/events?from=&to= ──
exports.getAll = async (req, res) => {
  try {
    const { from, to } = req.query;
    let sql    = 'SELECT * FROM events WHERE user_id = ?';
    const params = [req.user.id];

    if (from) { sql += ' AND date >= ?'; params.push(from); }
    if (to)   { sql += ' AND date <= ?'; params.push(to); }
    sql += ' ORDER BY date ASC, time ASC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Get events error:', err);
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};

// ── POST /api/events ──
exports.create = async (req, res) => {
  try {
    const { title, date, time, type } = req.body;
    const eventType = EVENT_TYPES.includes(type) ? type : 'meeting';

    const [result] = await pool.query(
      'INSERT INTO events (user_id, title, date, time, type) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, title, date, time || null, eventType]
    );

    const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};

// ── PUT /api/events/:id ──
exports.update = async (req, res) => {
  try {
    const [event] = await pool.query(
      'SELECT * FROM events WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]
    );
    if (event.length === 0) return res.status(404).json({ error: ERRORS.EVENT_NOT_FOUND });

    const allowed = ['title', 'date', 'time', 'type'];
    const fields  = [];
    const params  = [];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(key === 'type' && !EVENT_TYPES.includes(req.body[key]) ? 'meeting' : req.body[key]);
      }
    }
    if (fields.length === 0) return res.status(400).json({ error: ERRORS.NO_FIELDS });

    params.push(req.params.id);
    await pool.query(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`, params);

    const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};

// ── DELETE /api/events/:id ──
exports.remove = async (req, res) => {
  try {
    const [event] = await pool.query(
      'SELECT id FROM events WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]
    );
    if (event.length === 0) return res.status(404).json({ error: ERRORS.EVENT_NOT_FOUND });

    await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ message: SUCCESS.EVENT_DELETED });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};