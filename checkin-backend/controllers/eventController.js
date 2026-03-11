const pool = require('../config/db');

// ── GET /api/events?from=&to= ──
exports.getAll = async (req, res) => {
  try {
    const { from, to } = req.query;
    let sql = 'SELECT * FROM events WHERE user_id = ?';
    const params = [req.user.id];

    if (from) { sql += ' AND date >= ?'; params.push(from); }
    if (to)   { sql += ' AND date <= ?'; params.push(to); }
    sql += ' ORDER BY date ASC, time ASC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Get events error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── POST /api/events ──
exports.create = async (req, res) => {
  try {
    const { title, date, time, type = 'meeting' } = req.body;
    if (!title || !date) return res.status(400).json({ error: 'Title and date required.' });

    const [result] = await pool.query(
      'INSERT INTO events (user_id, title, date, time, type) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, title, date, time || null, type]
    );

    const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── PUT /api/events/:id ──
exports.update = async (req, res) => {
  try {
    const { title, date, time, type } = req.body;
    const [event] = await pool.query('SELECT * FROM events WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (event.length === 0) return res.status(404).json({ error: 'Event not found.' });

    const fields = [];
    const params = [];
    if (title !== undefined) { fields.push('title = ?'); params.push(title); }
    if (date !== undefined)  { fields.push('date = ?');  params.push(date); }
    if (time !== undefined)  { fields.push('time = ?');  params.push(time); }
    if (type !== undefined)  { fields.push('type = ?');  params.push(type); }

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update.' });

    params.push(req.params.id);
    await pool.query(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`, params);

    const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── DELETE /api/events/:id ──
exports.remove = async (req, res) => {
  try {
    const [event] = await pool.query('SELECT * FROM events WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (event.length === 0) return res.status(404).json({ error: 'Event not found.' });

    await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ message: 'Event deleted.' });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};