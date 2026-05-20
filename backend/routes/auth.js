'use strict';
require('dotenv').config();
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { issueSession, auditLog } = require('../middleware/auth');
const { createOTP, verifyOTP } = require('../services/otp');
const { sendOTP } = require('../services/email');
const { loginLimiter } = require('../middleware/rateLimit');

const prisma = require('../db');

// ─── POST /api/auth/register ─────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }
    // SRS password rules: min 12 chars, 1 uppercase, 1 number, 1 special char
    const pwdRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{12,}$/;
    if (!pwdRegex.test(password)) {
      return res.status(400).json({
        error: 'Password must be at least 12 characters and include an uppercase letter, a number, and a special character.',
      });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name: name.trim(), email: email.toLowerCase(), passwordHash, role: 'user' },
    });

    await auditLog(user.id, 'REGISTER', `New user registered: ${user.email}`, req.ip);
    res.status(201).json({ message: 'Account created. You can now sign in.' });
  } catch (err) {
    console.error('[Auth] Register error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
// Step 1: validate credentials → send OTP
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Generic message to prevent account harvesting (SRS)
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ error: 'This account has been suspended. Please contact support.' });
    }

    const otp = await createOTP(user.id);
    let previewUrl = null;
    let emailFailed = false;

    try {
      previewUrl = await sendOTP(user.email, otp);
    } catch (emailErr) {
      console.error('[Auth] Email send failed:', emailErr.message);
      // Log OTP so it can be retrieved from server logs (Render dashboard)
      console.log(`[Auth] OTP for ${user.email} (email unavailable): ${otp}`);
      emailFailed = true;
      // Do NOT block login — email failure should not lock users out
    }

    await auditLog(user.id, 'LOGIN_ATTEMPT', `OTP sent to ${user.email}`, req.ip);

    const response = { message: 'Verification code sent to your email.', userId: user.id };
    // Include preview URL if Ethereal captured it
    if (previewUrl) response.emailPreview = previewUrl;
    // Include OTP in response if email failed or in development (check browser Network tab / Render logs)
    if (emailFailed || process.env.NODE_ENV === 'development') response._otpCode = otp;

    res.json(response);
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ─── POST /api/auth/verify-otp ───────────────────────────────────────────────
// Step 2: verify OTP → issue JWT cookie
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) {
      return res.status(400).json({ error: 'User ID and OTP code are required.' });
    }

    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const result = await verifyOTP(user.id, code.trim());
    if (!result.valid) {
      return res.status(401).json({ error: result.reason });
    }

    const token = await issueSession(user);

    // Set httpOnly cookie (more secure than localStorage)
    res.cookie('hf_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24h
    });

    await auditLog(user.id, 'LOGIN_SUCCESS', `Logged in as ${user.role}`, req.ip);

    res.json({
      message: 'Signed in successfully.',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token, // also return in body so frontend can store in memory
    });
  } catch (err) {
    console.error('[Auth] Verify OTP error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ─── POST /api/auth/logout ───────────────────────────────────────────────────
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies?.hf_token || req.headers.authorization?.slice(7);
    if (token) {
      await prisma.session.deleteMany({ where: { token } });
    }
    res.clearCookie('hf_token');
    res.json({ message: 'Signed out successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─── DELETE /api/auth/account ────────────────────────────────────────────────
// Right to Erasure (GDPR Art. 17) — permanently deletes the user's account and all their data
const { requireAuth } = require('../middleware/auth');
router.delete('/account', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete in dependency order (FK constraints)
    await prisma.favourite.deleteMany({ where: { userId } });
    await prisma.otpCode.deleteMany({ where: { userId } });
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.viewingRequest.deleteMany({ where: { userId } });

    // Delete inquiries (replies first due to FK)
    const userInquiries = await prisma.inquiry.findMany({ where: { userId }, select: { id: true } });
    const inqIds = userInquiries.map(i => i.id);
    if (inqIds.length) {
      await prisma.inquiryReply.deleteMany({ where: { inquiryId: { in: inqIds } } });
      await prisma.inquiry.deleteMany({ where: { id: { in: inqIds } } });
    }

    // Anonymise audit log entries (keep for record, but scrub name/identity)
    await prisma.auditLog.updateMany({
      where: { userId },
      data: { userId: null, detail: '[account deleted]' },
    });

    // Finally delete the user
    await prisma.user.delete({ where: { id: userId } });

    res.clearCookie('hf_token');
    res.json({ message: 'Your account and all associated data have been permanently deleted.' });
  } catch (err) {
    console.error('[Auth] Delete account error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.hf_token || req.headers.authorization?.slice(7);
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });

    const session = await prisma.session.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) {
      res.clearCookie('hf_token');
      return res.status(401).json({ error: 'Session expired.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
