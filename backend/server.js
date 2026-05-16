'use strict';
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const cookieParser = require('cookie-parser');
const path    = require('path');
const { apiLimiter } = require('./middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust Render's load balancer so express-rate-limit can read the real client IP
app.set('trust proxy', 1);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: function(origin, callback) {
    // No origin = same-origin request or server-to-server — always allow
    if (!origin) return callback(null, true);
    const allowed = [
      'http://localhost:3000', 'http://127.0.0.1:3000',
      'http://localhost:5500', 'http://127.0.0.1:5500',
      'null',
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    if (allowed.includes(origin)) return callback(null, true);
    // In production single-service mode the frontend and API share the same
    // Render URL, so allow any *.onrender.com origin automatically
    if (process.env.NODE_ENV === 'production' && /\.onrender\.com$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api', apiLimiter);

// ─── Static file serving ──────────────────────────────────────────────────────
// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve the frontend HTML files directly from the parent folder
app.use(express.static(path.join(__dirname, '..')));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/inquiries',  require('./routes/inquiries'));
app.use('/api/viewings',   require('./routes/viewings'));
app.use('/api/dashboard',  require('./routes/dashboard'));
app.use('/api/reports',    require('./routes/reports'));

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use('/api/*rest', (req, res) => res.status(404).json({ error: 'Endpoint not found.' }));

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏠 HomeFinder API running at http://localhost:${PORT}`);
  console.log(`   Frontend:  http://localhost:${PORT}/index.html`);
  console.log(`   API docs:  http://localhost:${PORT}/api/health`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`   Mode:      development (OTP codes logged to console)\n`);
  }
});

module.exports = app;
