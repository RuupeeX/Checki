require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');

const app  = express();
const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

// ── Seguridad ──
app.use(helmet());
app.use(cors({
  origin:      process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting — protege contra fuerza bruta
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // más estricto en login/register
  message: { error: 'Too many auth attempts, please try again later.' },
});

app.use(limiter);
app.use(express.json({ limit: '10kb' })); // previene payloads enormes

// ── Log de requests (solo en desarrollo) ──
if (isDev) {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () =>
      console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - start}ms)`)
    );
    next();
  });
}

// ── Rutas ──
app.use('/api/auth',          authLimiter, require('./routes/auth'));
app.use('/api/employees',     require('./routes/employees'));
app.use('/api/attendance',    require('./routes/attendance'));
app.use('/api/reports',       require('./routes/reports'));
app.use('/api/events',        require('./routes/events'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/settings',      require('./routes/settings'));

// ── Health check ──
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── 404 ──
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` }));

// ── Error handler global ──
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Start ──
app.listen(PORT, () => console.log(`🚀 CheckIn API running on http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`));