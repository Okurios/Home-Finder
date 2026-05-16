'use strict';
const router = require('express').Router();
const { requireAuth, requireAdmin, auditLog } = require('../middleware/auth');
const { sendConfirmation } = require('../services/email');
const prisma = require('../db');

// ─── POST /api/inquiries ──────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  try {
    const { propertyId, message } = req.body;
    if (!propertyId || !message?.trim()) {
      return res.status(400).json({ error: 'Property ID and message are required.' });
    }
    if (message.length > 500) {
      return res.status(400).json({ error: 'Message must not exceed 500 characters.' });
    }

    const property = await prisma.property.findUnique({ where: { id: parseInt(propertyId), isActive: true } });
    if (!property) return res.status(404).json({ error: 'Property not found.' });

    // Duplicate prevention: same user + property within 60 seconds (SRS)
    const recent = await prisma.inquiry.findFirst({
      where: {
        userId: req.user.id, propertyId: parseInt(propertyId),
        createdAt: { gte: new Date(Date.now() - 60_000) },
      },
    });
    if (recent) {
      return res.status(429).json({ error: 'You already submitted an inquiry for this property. Please wait 60 seconds.' });
    }

    const inquiry = await prisma.inquiry.create({
      data: { userId: req.user.id, propertyId: parseInt(propertyId), message: message.trim() },
      include: { property: { select: { title: true, address: true } } },
    });

    // Send confirmation email
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    try {
      await sendConfirmation(
        user.email,
        `Inquiry submitted — ${property.title}`,
        `<p>Hi ${user.name},</p><p>Your inquiry about <strong>${property.title}</strong> has been received and is marked as <strong>Pending</strong>. An agent will respond within 1 working week.</p><p>Your message: <em>${message}</em></p>`
      );
    } catch (_) {}

    await auditLog(req.user.id, 'INQUIRY_CREATE', `Inquiry #${inquiry.id} for property ${propertyId}`, req.ip);
    res.status(201).json({ inquiry });
  } catch (err) {
    console.error('[Inquiries] Create error:', err);
    res.status(500).json({ error: 'Could not submit inquiry.' });
  }
});

// ─── GET /api/inquiries ───────────────────────────────────────────────────────
// Admin: all inquiries | User: own inquiries
router.get('/', requireAuth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = parseInt(req.query.limit || '20');
    const skip = (page - 1) * limit;

    const where = isAdmin
      ? req.query.status ? { status: req.query.status } : {}
      : { userId: req.user.id };

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          property: { select: { id: true, title: true, address: true } },
          user: { select: { id: true, name: true, email: true } },
          replies: { include: { admin: { select: { name: true } } }, orderBy: { createdAt: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
      prisma.inquiry.count({ where }),
    ]);

    res.json({ inquiries, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve inquiries.' });
  }
});

// ─── POST /api/inquiries/:id/reply (admin only) ───────────────────────────────
router.post('/:id/reply', requireAdmin, async (req, res) => {
  try {
    const inquiryId = parseInt(req.params.id);
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Reply message is required.' });
    if (message.length > 500) return res.status(400).json({ error: 'Reply must not exceed 500 characters.' });

    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: { user: true, property: { select: { title: true } } },
    });
    if (!inquiry) return res.status(404).json({ error: 'Inquiry not found.' });

    const reply = await prisma.inquiryReply.create({
      data: { inquiryId, adminId: req.user.id, message: message.trim() },
    });
    await prisma.inquiry.update({ where: { id: inquiryId }, data: { status: 'Responded' } });

    try {
      await sendConfirmation(
        inquiry.user.email,
        `Reply to your inquiry — ${inquiry.property.title}`,
        `<p>Hi ${inquiry.user.name},</p><p>An agent has replied to your inquiry about <strong>${inquiry.property.title}</strong>:</p><blockquote>${message}</blockquote>`
      );
    } catch (_) {}

    await auditLog(req.user.id, 'INQUIRY_REPLY', `Replied to inquiry #${inquiryId}`, req.ip);
    res.status(201).json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'Could not send reply.' });
  }
});

// ─── PUT /api/inquiries/:id (admin: update status directly) ──────────────────
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (!['Pending', 'Responded', 'Closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    const inquiry = await prisma.inquiry.update({ where: { id }, data: { status } });
    res.json({ inquiry });
  } catch (err) {
    res.status(500).json({ error: 'Could not update inquiry.' });
  }
});

// ─── PUT /api/inquiries/:id/status (admin: close) ────────────────────────────
router.put('/:id/status', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (!['Pending', 'Responded', 'Closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    const inquiry = await prisma.inquiry.update({ where: { id }, data: { status } });
    res.json({ inquiry });
  } catch (err) {
    res.status(500).json({ error: 'Could not update inquiry status.' });
  }
});

module.exports = router;
