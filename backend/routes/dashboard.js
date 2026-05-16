'use strict';
const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const prisma = require('../db');

function parseProperty(p) {
  return { ...p, features: JSON.parse(p.features || '[]') };
}

// ─── GET /api/dashboard/summary ──────────────────────────────────────────────
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const [favCount, inquiryCount, viewingCount] = await Promise.all([
      prisma.favourite.count({ where: { userId } }),
      prisma.inquiry.count({ where: { userId } }),
      prisma.viewingRequest.count({ where: { userId } }),
    ]);
    res.json({ favourites: favCount, inquiries: inquiryCount, viewings: viewingCount });
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve dashboard summary.' });
  }
});

// ─── GET /api/dashboard/favourites ───────────────────────────────────────────
router.get('/favourites', requireAuth, async (req, res) => {
  try {
    const favs = await prisma.favourite.findMany({
      where: { userId: req.user.id },
      include: {
        property: {
          include: { images: { orderBy: { order: 'asc' }, take: 1 } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const properties = favs.map(f => parseProperty(f.property));
    res.json({ properties });
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve favourites.' });
  }
});

// ─── POST /api/dashboard/favourites/:propertyId ───────────────────────────────
router.post('/favourites/:propertyId', requireAuth, async (req, res) => {
  try {
    const propertyId = parseInt(req.params.propertyId);
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return res.status(404).json({ error: 'Property not found.' });

    try {
      await prisma.favourite.create({ data: { userId: req.user.id, propertyId } });
      res.status(201).json({ saved: true });
    } catch (e) {
      // Unique constraint violation — already saved
      res.json({ saved: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Could not save favourite.' });
  }
});

// ─── DELETE /api/dashboard/favourites/:propertyId ────────────────────────────
router.delete('/favourites/:propertyId', requireAuth, async (req, res) => {
  try {
    const propertyId = parseInt(req.params.propertyId);
    await prisma.favourite.deleteMany({ where: { userId: req.user.id, propertyId } });
    res.json({ saved: false });
  } catch (err) {
    res.status(500).json({ error: 'Could not remove favourite.' });
  }
});

// ─── GET /api/dashboard/favourites/ids ───────────────────────────────────────
router.get('/favourites/ids', requireAuth, async (req, res) => {
  try {
    const favs = await prisma.favourite.findMany({
      where: { userId: req.user.id },
      select: { propertyId: true },
    });
    res.json({ ids: favs.map(f => f.propertyId) });
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve favourite IDs.' });
  }
});

// ─── GET /api/dashboard/admin-summary (admin only) ───────────────────────────
router.get('/admin-summary', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    const [totalListings, activeListings, pendingInquiries, pendingViewings, totalUsers] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { isActive: true } }),
      prisma.inquiry.count({ where: { status: 'Pending' } }),
      prisma.viewingRequest.count({ where: { status: 'Pending' } }),
      prisma.user.count({ where: { role: 'user' } }),
    ]);
    res.json({ totalListings, activeListings, pendingInquiries, pendingViewings, totalUsers });
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve admin summary.' });
  }
});

// ─── GET /api/dashboard/users (admin only) ────────────────────────────────────
router.get('/users', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true, status: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve users.' });
  }
});

module.exports = router;
