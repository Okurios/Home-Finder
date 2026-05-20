'use strict';
const router = require('express').Router();
const { stringify } = require('csv-stringify/sync');
const { requireSupervisor } = require('../middleware/auth');
const prisma = require('../db');

// Validates & parses a date-range query; enforces 12-month cap (SRS)
function parseDateRange(from, to) {
  const start = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end   = to   ? new Date(to)   : new Date();
  if (isNaN(start) || isNaN(end)) throw new Error('Invalid date range.');
  // SRS: max 12-month window
  const diff = (end - start) / (1000 * 60 * 60 * 24);
  if (diff > 366) throw new Error('Date range must not exceed 12 months.');
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// ─── GET /api/reports/summary ─────────────────────────────────────────────────
router.get('/summary', requireSupervisor, async (req, res) => {
  try {
    const [totalUsers, totalListings, totalInquiries, totalViewings,
           pendingInquiries, pendingViewings, respondedInquiries, confirmedViewings] = await Promise.all([
      prisma.user.count({ where: { role: 'user' } }),
      prisma.property.count({ where: { isActive: true } }),
      prisma.inquiry.count(),
      prisma.viewingRequest.count(),
      prisma.inquiry.count({ where: { status: 'Pending' } }),
      prisma.viewingRequest.count({ where: { status: 'Pending' } }),
      prisma.inquiry.count({ where: { status: 'Responded' } }),
      prisma.viewingRequest.count({ where: { status: 'Confirmed' } }),
    ]);

    // New users in last 30 days
    const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsers30d = await prisma.user.count({ where: { createdAt: { gte: last30 } } });
    const newInquiries30d = await prisma.inquiry.count({ where: { createdAt: { gte: last30 } } });

    // Property type breakdown
    const typeGroups = await prisma.property.groupBy({
      by: ['type'],
      where: { isActive: true },
      _count: { id: true },
    });

    res.json({
      totalUsers, totalListings, totalInquiries, totalViewings,
      pendingInquiries, pendingViewings, respondedInquiries, confirmedViewings,
      newUsers30d, newInquiries30d,
      typeBreakdown: typeGroups.map(g => ({ type: g.type, count: g._count.id })),
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve summary.' });
  }
});

// ─── GET /api/reports/inquiries ───────────────────────────────────────────────
router.get('/inquiries', requireSupervisor, async (req, res) => {
  try {
    const { start, end } = parseDateRange(req.query.from, req.query.to);
    const groupBy = req.query.groupBy || 'day'; // day | week | month

    const inquiries = await prisma.inquiry.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { id: true, createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day/week/month
    const buckets = {};
    for (const inq of inquiries) {
      const d = new Date(inq.createdAt);
      let key;
      if (groupBy === 'month') key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      else if (groupBy === 'week') {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        key = weekStart.toISOString().slice(0, 10);
      } else {
        key = d.toISOString().slice(0, 10);
      }
      if (!buckets[key]) buckets[key] = { date: key, total: 0, pending: 0, responded: 0, closed: 0 };
      buckets[key].total++;
      buckets[key][inq.status.toLowerCase()]++;
    }

    const data = Object.values(buckets).sort((a, b) => a.date.localeCompare(b.date));
    res.json({ data, rows: data, headers: ['date','total','pending','responded','closed'], total: inquiries.length, from: start, to: end });
  } catch (err) {
    if (err.message.includes('month')) return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Could not retrieve inquiry report.' });
  }
});

// ─── GET /api/reports/viewings ───────────────────────────────────────────────
router.get('/viewings', requireSupervisor, async (req, res) => {
  try {
    const { start, end } = parseDateRange(req.query.from, req.query.to);
    const groupBy = req.query.groupBy || 'day';

    const viewings = await prisma.viewingRequest.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { id: true, createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    });

    const buckets = {};
    for (const v of viewings) {
      const d = new Date(v.createdAt);
      let key;
      if (groupBy === 'month') key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      else if (groupBy === 'week') {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        key = weekStart.toISOString().slice(0, 10);
      } else {
        key = d.toISOString().slice(0, 10);
      }
      if (!buckets[key]) buckets[key] = { date: key, total: 0, pending: 0, confirmed: 0, closed: 0 };
      buckets[key].total++;
      buckets[key][(v.status || 'pending').toLowerCase()]++;
    }

    const data = Object.values(buckets).sort((a, b) => a.date.localeCompare(b.date));
    res.json({ data, rows: data, headers: ['date','total','pending','confirmed','closed'], total: viewings.length, from: start, to: end });
  } catch (err) {
    if (err.message.includes('month')) return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Could not retrieve viewings report.' });
  }
});

// ─── GET /api/reports/activity (alias for audit-log) ─────────────────────────
router.get('/activity', requireSupervisor, async (req, res) => {
  try {
    const limit = Math.min(200, parseInt(req.query.limit || '50'));
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve activity log.' });
  }
});

// ─── GET /api/reports/audit-log ───────────────────────────────────────────────
router.get('/audit-log', requireSupervisor, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(200, parseInt(req.query.limit || '50'));
    const skip  = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
      prisma.auditLog.count(),
    ]);
    res.json({ logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve audit log.' });
  }
});

// ─── GET /api/reports/export ──────────────────────────────────────────────────
router.get('/export', requireSupervisor, async (req, res) => {
  try {
    const type   = req.query.type || 'inquiries'; // inquiries | viewings | users | audit
    const { start, end } = parseDateRange(req.query.from, req.query.to);

    let rows = [];
    let filename = '';

    if (type === 'inquiries') {
      const data = await prisma.inquiry.findMany({
        where: { createdAt: { gte: start, lte: end } },
        include: {
          user: { select: { name: true, email: true } },
          property: { select: { title: true, address: true } },
          replies: { orderBy: { createdAt: 'asc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (data.length > 50000) return res.status(413).json({ error: 'Report too large. Please narrow your date range.' });
      rows = data.map(i => ({
        ID: i.id,
        Date: i.createdAt.toISOString().slice(0, 10),
        User: i.user.name,
        Email: i.user.email,
        Property: i.property.title,
        Address: i.property.address,
        Message: i.message,
        Status: i.status,
        Reply: i.replies[0]?.message || '',
      }));
      filename = `inquiries_${start.toISOString().slice(0,10)}_${end.toISOString().slice(0,10)}.csv`;

    } else if (type === 'viewings') {
      const data = await prisma.viewingRequest.findMany({
        where: { createdAt: { gte: start, lte: end } },
        include: {
          user: { select: { name: true, email: true } },
          property: { select: { title: true, address: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (data.length > 50000) return res.status(413).json({ error: 'Report too large. Please narrow your date range.' });
      rows = data.map(v => ({
        ID: v.id,
        Requested: v.createdAt.toISOString().slice(0, 10),
        User: v.user.name,
        Email: v.user.email,
        Property: v.property.title,
        Date: v.date,
        Time: v.time,
        Status: v.status,
        Note: v.adminNote,
      }));
      filename = `viewings_${start.toISOString().slice(0,10)}_${end.toISOString().slice(0,10)}.csv`;

    } else if (type === 'users') {
      const data = await prisma.user.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      });
      rows = data.map(u => ({
        ID: u.id, Name: u.name, Email: u.email, Role: u.role, Status: u.status,
        Joined: u.createdAt.toISOString().slice(0, 10),
      }));
      filename = `users_${start.toISOString().slice(0,10)}_${end.toISOString().slice(0,10)}.csv`;

    } else if (type === 'audit') {
      const data = await prisma.auditLog.findMany({
        where: { createdAt: { gte: start, lte: end } },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });
      rows = data.map(l => ({
        ID: l.id,
        DateTime: l.createdAt.toISOString(),
        User: l.user?.name || 'System',
        Email: l.user?.email || '',
        Action: l.action,
        Detail: l.detail,
        // IP intentionally excluded — GDPR data minimisation (supervisors do not need IP data)
      }));
      filename = `audit_${start.toISOString().slice(0,10)}_${end.toISOString().slice(0,10)}.csv`;
    } else {
      return res.status(400).json({ error: 'Invalid report type.' });
    }

    const csv = stringify(rows, { header: true });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    if (err.message.includes('month') || err.message.includes('Invalid')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('[Reports] Export error:', err);
    res.status(500).json({ error: 'Could not generate export. Please try again.' });
  }
});

module.exports = router;
