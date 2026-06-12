require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const passport = require('./utils/passport');

const authRoutes = require('./routes/auth');
const accountsRoutes = require('./routes/accounts');
const tradesRoutes = require('./routes/trades');
const psychologyRoutes = require('./routes/psychology');
const checklistsRoutes = require('./routes/checklists');
const analyticsRoutes = require('./routes/analytics');
const weeklyReviewsRoutes = require('./routes/weekly-reviews');
const publicRoutes = require('./routes/public');

const app = express();

// Trust the platform's reverse proxy (Render, etc.) so secure cookies work
app.set('trust proxy', 1);

// ── Security & Logging ────────────────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (curl, server-to-server, health checks)
      const normalized = origin?.replace(/\/$/, '');
      if (!origin || allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }
      // Don't throw — just decline to set CORS headers for disallowed origins
      // so the response still completes normally instead of a 500.
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Session ───────────────────────────────────────────────────────────────────
app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: 'session',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// ── Passport ──────────────────────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/trades', tradesRoutes);
app.use('/api/psychology', psychologyRoutes);
app.use('/api/checklists', checklistsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/weekly-reviews', weeklyReviewsRoutes);
app.use('/api/public', publicRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack || err.message);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 10MB.' });
  }
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ error: err.message });
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'A record with that value already exists.' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found.' });
  }

  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  return res.status(status).json({ error: message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`TradeEdge server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = app;
