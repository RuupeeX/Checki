const pool = require('../config/db');

// ── GET /api/notifications ──
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    const [unreadCount] = await pool.query(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [req.user.id]
    );
    res.json({ notifications: rows, unread: unreadCount[0].count });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── PATCH /api/notifications/read-all ──
exports.markAllRead = async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── PATCH /api/notifications/:id/read ──
exports.markRead = async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};