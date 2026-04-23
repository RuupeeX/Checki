const pool = require('../config/db');
const { ERRORS, SUCCESS } = require('../config/constants');

// ── GET /api/notifications ──
exports.getAll = async (req, res) => {
  try {
    const limit = parseInt(process.env.NOTIFICATIONS_LIMIT) || 20;

    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [req.user.id, limit]
    );
    const [[{ count: unread }]] = await pool.query(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [req.user.id]
    );

    res.json({ notifications: rows, unread });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};

// ── PATCH /api/notifications/read-all ──
exports.markAllRead = async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id]);
    res.json({ message: SUCCESS.ALL_NOTIF_READ });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};

// ── PATCH /api/notifications/:id/read ──
exports.markRead = async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: SUCCESS.NOTIF_READ });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: ERRORS.INTERNAL });
  }
};