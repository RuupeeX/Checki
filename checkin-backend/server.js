require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware global ──
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ── Log de requests (desarrollo) ──
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// ── Rutas ──
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/employees',     require('./routes/employees'));
app.use('/api/attendance',    require('./routes/attendance'));
app.use('/api/reports',       require('./routes/reports'));
app.use('/api/events',        require('./routes/events'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/settings',      require('./routes/settings'));

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 ──
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ── Error handler global ──
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Start ──
app.listen(PORT, () => {
  console.log(`\n🚀 CheckIn API running on http://localhost:${PORT}`);
  console.log(`📋 Endpoints:`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   POST   /api/auth/register`);
  console.log(`   GET    /api/auth/me`);
  console.log(`   GET    /api/employees`);
  console.log(`   GET    /api/employees/stats/departments`);
  console.log(`   POST   /api/employees`);
  console.log(`   PUT    /api/employees/:id`);
  console.log(`   DELETE /api/employees/:id`);
  console.log(`   POST   /api/attendance/check-in`);
  console.log(`   POST   /api/attendance/check-out`);
  console.log(`   POST   /api/attendance/break/start`);
  console.log(`   POST   /api/attendance/break/end`);
  console.log(`   GET    /api/attendance/today`);
  console.log(`   GET    /api/attendance/history`);
  console.log(`   GET    /api/attendance/weekly-stats`);
  console.log(`   GET    /api/reports`);
  console.log(`   GET    /api/reports/stats`);
  console.log(`   POST   /api/reports`);
  console.log(`   PATCH  /api/reports/:id/status`);
  console.log(`   DELETE /api/reports/:id`);
  console.log(`   GET    /api/events`);
  console.log(`   POST   /api/events`);
  console.log(`   PUT    /api/events/:id`);
  console.log(`   DELETE /api/events/:id`);
  console.log(`   GET    /api/notifications`);
  console.log(`   PATCH  /api/notifications/read-all`);
  console.log(`   PATCH  /api/notifications/:id/read`);
  console.log(`   GET    /api/settings`);
  console.log(`   PUT    /api/settings`);
  console.log(`   PUT    /api/settings/profile`);
  console.log(`   PUT    /api/settings/password`);
  console.log(`   GET    /api/health\n`);
});