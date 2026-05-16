'use strict';
const rateLimit = require('express-rate-limit');

// FR: 5 failed login attempts per IP in 10 minutes → 15-minute lockout
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,   // 10 minutes
  max: 5,
  skipSuccessfulRequests: true,  // only count failed (non-2xx) attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many failed login attempts. Please try again in 15 minutes.' },
  handler(req, res, next, options) {
    res.status(429).json(options.message);
  },
});

// General API limiter — 200 req / 15 min per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

module.exports = { loginLimiter, apiLimiter };
