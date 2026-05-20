'use strict';
require('dotenv').config();
const jwt = require('jsonwebtoken');
const prisma = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Attach req.user if a valid JWT is present; does NOT reject unauthenticated requests
async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) return next();

    const payload = jwt.verify(token, JWT_SECRET);
    // Check token is still in the Session table (single-session enforcement)
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) return next();

    req.user = payload;
    req.token = token;
  } catch (_) { /* invalid token — continue as guest */ }
  next();
}

// Require a valid, active JWT
async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: 'Authentication required.' });

    const payload = jwt.verify(token, JWT_SECRET);
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }
    req.user = payload;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
}

// Require admin role
async function requireAdmin(req, res, next) {
  await requireAuth(req, res, async () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    next();
  });
}

// Require supervisor or admin role
async function requireSupervisor(req, res, next) {
  await requireAuth(req, res, async () => {
    if (!req.user || (req.user.role !== 'supervisor' && req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Supervisor access required.' });
    }
    next();
  });
}

function extractToken(req) {
  // Prefer Authorization header, fallback to cookie
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  if (req.cookies && req.cookies.hf_token) return req.cookies.hf_token;
  return null;
}

// Helper: create a JWT + store in Session table (invalidates previous sessions)
async function issueSession(user) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  const payload = { id: user.id, email: user.email, name: user.name, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });

  // Invalidate all existing sessions (single-session rule)
  await prisma.session.deleteMany({ where: { userId: user.id } });
  // Create new session
  await prisma.session.create({ data: { userId: user.id, token, expiresAt } });

  return token;
}

// Anonymise an IP address: mask last IPv4 octet or last IPv6 group
function maskIp(ip) {
  if (!ip) return '';
  // IPv4: 1.2.3.4 → 1.2.3.xxx
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
    return ip.replace(/\.\d+$/, '.xxx');
  }
  // IPv4-mapped IPv6: ::ffff:1.2.3.4
  if (ip.startsWith('::ffff:')) {
    return '::ffff:' + maskIp(ip.slice(7));
  }
  // IPv6: mask last colon-separated group
  if (ip.includes(':')) {
    return ip.replace(/:[^:]+$/, ':xxxx');
  }
  return ip;
}

// Helper: log audit action — IP is intentionally not stored (GDPR data minimisation)
async function auditLog(userId, action, detail) {
  try {
    await prisma.auditLog.create({ data: { userId: userId || null, action, detail: detail || '', ip: '' } });
  } catch (_) {}
}

module.exports = { optionalAuth, requireAuth, requireAdmin, requireSupervisor, issueSession, auditLog };
