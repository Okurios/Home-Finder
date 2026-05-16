'use strict';
const router = require('express').Router();
const { requireAuth, requireAdmin, auditLog } = require('../middleware/auth');
const { sendConfirmation } = require('../services/email');
const prisma = require('../db');

// ─── POST /api/viewings ───────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  try {
    const { propertyId, date, time, message } = req.body;
    if (!propertyId || !date || !time) {
      return res.status(400).json({ error: 'Property ID, date and time are required.' });
    }
    if (message && message.length > 400) {
      return res.status(400).json({ error: 'Message must not exceed 400 characters.' });
    }

    const property = await prisma.property.findUnique({ where: { id: parseInt(propertyId), isActive: true } });
    if (!property) return res.status(404).json({ error: 'Property not found.' });

    const viewing = await prisma.viewingRequest.create({
      data: {
        userId: req.user.id,
        propertyId: parseInt(propertyId),
        date, time,
        message: message?.trim() || '',
      },
      include: { property: { select: { title: true, address: true } } },
    });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    try {
      await sendConfirmation(
        user.email,
        `Viewing request received — ${property.title}`,
        `<p>Hi ${user.name},</p><p>Your viewing request for <strong>${property.title}</strong> on <strong>${date} at ${time}</strong> has been received. An agent will confirm shortly.</p>`
      );
    } catch (_) {}

    await auditLog(req.user.id, 'VIEWING_REQUEST', `Viewing request #${viewing.id} for property ${propertyId}`, req.ip);
    res.status(201).json({ viewing });
  } catch (err) {
    console.error('[Viewings] Create error:', err);
    res.status(500).json({ error: 'Could not submit viewing request.' });
  }
});

// ─── GET /api/viewings/availability (public: booked dates for a property) ─────
router.get('/availability', async (req, res) => {
  try {
    const propertyId = parseInt(req.query.propertyId);
    if (!propertyId) return res.status(400).json({ error: 'propertyId is required.' });

    // Return all dates that are Pending or Confirmed (i.e. not available)
    const viewings = await prisma.viewingRequest.findMany({
      where: {
        propertyId,
        status: { in: ['Pending', 'Confirmed'] },
      },
      select: { date: true, time: true, status: true },
    });

    // Group by date so the frontend knows which dates + times are taken
    const byDate = {};
    for (const v of viewings) {
      if (!byDate[v.date]) byDate[v.date] = [];
      byDate[v.date].push(v.time);
    }

    res.json({ bookedDates: Object.keys(byDate), byDate });
  } catch (err) {
    res.status(500).json({ error: 'Could not check availability.' });
  }
});

// ─── GET /api/viewings ────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = parseInt(req.query.limit || '20');
    const skip = (page - 1) * limit;

    const where = isAdmin
      ? req.query.status ? { status: req.query.status } : {}
      : { userId: req.user.id };

    const [viewings, total] = await Promise.all([
      prisma.viewingRequest.findMany({
        where,
        include: {
          property: { select: { id: true, title: true, address: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
      prisma.viewingRequest.count({ where }),
    ]);

    res.json({ viewings, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve viewing requests.' });
  }
});

// ─── PUT /api/viewings/:id (admin: confirm / reschedule / close) ──────────────
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, adminNote, date, time } = req.body;

    if (!['Confirmed', 'Rescheduled', 'Closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be Confirmed, Rescheduled, or Closed.' });
    }
    if (adminNote && adminNote.length > 500) {
      return res.status(400).json({ error: 'Note must not exceed 500 characters.' });
    }

    const existing = await prisma.viewingRequest.findUnique({
      where: { id },
      include: { user: true, property: { select: { title: true } } },
    });
    if (!existing) return res.status(404).json({ error: 'Viewing request not found.' });

    const viewing = await prisma.viewingRequest.update({
      where: { id },
      data: {
        status,
        adminNote: adminNote?.trim() || '',
        ...(date && { date }),
        ...(time && { time }),
      },
    });

    const subjectMap = { Confirmed: 'Viewing Confirmed', Rescheduled: 'Viewing Rescheduled', Closed: 'Viewing Request Closed' };
    try {
      await sendConfirmation(
        existing.user.email,
        `${subjectMap[status]} — ${existing.property.title}`,
        `<p>Hi ${existing.user.name},</p><p>Your viewing request for <strong>${existing.property.title}</strong> has been <strong>${status}</strong>.</p>${adminNote ? `<p>Note from agent: <em>${adminNote}</em></p>` : ''}${status === 'Rescheduled' ? `<p>New time: ${date} at ${time}</p>` : ''}`
      );
    } catch (_) {}

    await auditLog(req.user.id, 'VIEWING_UPDATE', `Viewing #${id} marked ${status}`, req.ip);
    res.json({ viewing });
  } catch (err) {
    res.status(500).json({ error: 'Could not update viewing request.' });
  }
});

module.exports = router;
