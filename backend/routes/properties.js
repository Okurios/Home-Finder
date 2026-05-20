'use strict';
const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAdmin, optionalAuth, auditLog } = require('../middleware/auth');
const prisma = require('../db');

// ─── File upload (images) ────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `prop_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter(req, file, cb) {
    // Check MIME type (SRS: verify file headers, not just extension)
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG and WebP images are allowed.'));
    }
    cb(null, true);
  },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseProperty(p) {
  return { ...p, features: JSON.parse(p.features || '[]') };
}

function buildWhereClause(q) {
  const where = { isActive: true };
  if (q.type) where.type = q.type;
  if (q.status) where.status = q.status;
  if (q.minPrice || q.maxPrice) {
    where.price = {};
    if (q.minPrice) where.price.gte = parseFloat(q.minPrice);
    if (q.maxPrice) where.price.lte = parseFloat(q.maxPrice);
  }
  if (q.minBeds) where.beds = { gte: parseInt(q.minBeds) };
  if (q.city) where.city = { contains: q.city };
  if (q.q) {
    where.OR = [
      { title: { contains: q.q } },
      { address: { contains: q.q } },
      { city: { contains: q.q } },
    ];
  }
  return where;
}

// ─── GET /api/properties ─────────────────────────────────────────────────────
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(50, parseInt(req.query.limit || '12'));
    const skip = (page - 1) * limit;

    const where = buildWhereClause(req.query);
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: { images: { orderBy: { order: 'asc' } } },
        orderBy: req.query.sort === 'price_asc' ? { price: 'asc' }
          : req.query.sort === 'price_desc' ? { price: 'desc' }
          : { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    res.json({
      properties: properties.map(parseProperty),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[Properties] List error:', err);
    res.status(500).json({ error: 'Could not retrieve properties.' });
  }
});

// ─── GET /api/properties/featured ────────────────────────────────────────────
router.get('/featured', async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: { isActive: true, featured: true },
      include: { images: { orderBy: { order: 'asc' }, take: 1 } },
      take: 6,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ properties: properties.map(parseProperty) });
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve featured properties.' });
  }
});

// ─── GET /api/properties/stats ───────────────────────────────────────────────
// Public: returns real counts for the homepage stats row
router.get('/stats', async (req, res) => {
  try {
    const [totalActive, cities] = await Promise.all([
      prisma.property.count({ where: { isActive: true } }),
      prisma.property.findMany({
        where: { isActive: true, city: { not: '' } },
        distinct: ['city'],
        select: { city: true },
      }),
    ]);
    res.json({ totalActive, citiesCount: cities.length });
  } catch (err) {
    console.error('[Properties] Stats error:', err);
    res.status(500).json({ error: 'Could not retrieve stats.' });
  }
});

// ─── GET /api/properties/:id ─────────────────────────────────────────────────
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { images: { orderBy: { order: 'asc' } }, createdBy: { select: { name: true } } },
    });
    if (!property || (!property.isActive && req.user?.role !== 'admin')) {
      return res.status(404).json({ error: 'Property not found.' });
    }
    res.json({ property: parseProperty(property) });
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve property.' });
  }
});

// ─── POST /api/properties ────────────────────────────────────────────────────
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, type, status, price, address, city, beds, baths, sqft, parking, description, features, lat, lng, featured, imageUrl, imageUrls } = req.body;
    if (!title || !type || !status || !price || !address) {
      return res.status(400).json({ error: 'Title, type, status, price, and address are required.' });
    }
    // Check for duplicate listing (same title + address)
    const dup = await prisma.property.findFirst({ where: { title, address, isActive: true } });
    if (dup) return res.status(409).json({ error: 'A listing with this title and address already exists.' });

    const property = await prisma.property.create({
      data: {
        title, type, status,
        price: parseFloat(price),
        address, city: city || '',
        beds: parseInt(beds || 0), baths: parseInt(baths || 0),
        sqft: parseInt(sqft || 0),
        parking: !!parking,
        description: description || '',
        features: JSON.stringify(Array.isArray(features) ? features : []),
        lat: parseFloat(lat || 0), lng: parseFloat(lng || 0),
        featured: !!featured,
        createdById: req.user.id,
      },
    });
    // Save image URLs (base64 or external) — imageUrls array takes priority over single imageUrl
    const urlsToSave = Array.isArray(imageUrls) && imageUrls.length > 0
      ? imageUrls
      : (imageUrl ? [imageUrl] : []);
    if (urlsToSave.length > 0) {
      await Promise.all(urlsToSave.map((url, idx) =>
        prisma.propertyImage.create({ data: { propertyId: property.id, url, order: idx } })
      ));
    }
    await auditLog(req.user.id, 'PROPERTY_CREATE', `Created property ID ${property.id}: ${title}`, req.ip);
    res.status(201).json({ property: parseProperty(property) });
  } catch (err) {
    console.error('[Properties] Create error:', err);
    res.status(500).json({ error: 'Could not create property.' });
  }
});

// ─── PUT /api/properties/:id ─────────────────────────────────────────────────
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Property not found.' });

    const { title, type, status, price, address, city, beds, baths, sqft, parking, description, features, lat, lng, featured } = req.body;
    const { imageUrl: imgUrl, imageUrls: imgUrls } = req.body;
    const property = await prisma.property.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(type && { type }),
        ...(status && { status }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(address && { address }),
        ...(city !== undefined && { city }),
        ...(beds !== undefined && { beds: parseInt(beds) }),
        ...(baths !== undefined && { baths: parseInt(baths) }),
        ...(sqft !== undefined && { sqft: parseInt(sqft) }),
        ...(parking !== undefined && { parking: !!parking }),
        ...(description !== undefined && { description }),
        ...(features !== undefined && { features: JSON.stringify(Array.isArray(features) ? features : []) }),
        ...(lat !== undefined && { lat: parseFloat(lat) }),
        ...(lng !== undefined && { lng: parseFloat(lng) }),
        ...(featured !== undefined && { featured: !!featured }),
        updatedById: req.user.id,
      },
    });
    // Add new images (base64 or external URLs) to the property
    const newUrls = Array.isArray(imgUrls) && imgUrls.length > 0
      ? imgUrls
      : (imgUrl ? [imgUrl] : []);
    if (newUrls.length > 0) {
      const existingCount = await prisma.propertyImage.count({ where: { propertyId: id } });
      await Promise.all(newUrls.map((url, idx) =>
        prisma.propertyImage.create({ data: { propertyId: id, url, order: existingCount + idx } })
      ));
    }
    await auditLog(req.user.id, 'PROPERTY_UPDATE', `Updated property ID ${id}`, req.ip);
    res.json({ property: parseProperty(property) });
  } catch (err) {
    res.status(500).json({ error: 'Could not update property.' });
  }
});

// ─── DELETE /api/properties/:id (soft delete) ────────────────────────────────
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Property not found.' });

    await prisma.property.update({ where: { id }, data: { isActive: false, updatedById: req.user.id } });
    await auditLog(req.user.id, 'PROPERTY_DELETE', `Soft-deleted property ID ${id}`, req.ip);
    res.json({ message: 'Property removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not remove property.' });
  }
});

// ─── POST /api/properties/:id/images ─────────────────────────────────────────
router.post('/:id/images', requireAdmin, upload.array('images', 10), async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return res.status(404).json({ error: 'Property not found.' });

    const images = await Promise.all(
      req.files.map((file, idx) =>
        prisma.propertyImage.create({
          data: { propertyId, url: `/uploads/${file.filename}`, order: idx },
        })
      )
    );
    res.status(201).json({ images });
  } catch (err) {
    res.status(500).json({ error: 'Image upload failed.' });
  }
});

module.exports = router;
