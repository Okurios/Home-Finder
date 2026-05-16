'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const bcrypt = require('bcryptjs');

const libsql = createClient({
  url:       process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const adapter = new PrismaLibSQL(libsql);
const prisma  = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Users ────────────────────────────────────────────────────────────────
  const hash = await bcrypt.hash('Password1!', 12);

  const alice = await prisma.user.upsert({
    where: { email: 'user@demo.com' },
    update: {},
    create: { name: 'Alice Johnson', email: 'user@demo.com', passwordHash: hash, role: 'user', status: 'Active' },
  });
  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: { name: 'David Brown', email: 'admin@demo.com', passwordHash: hash, role: 'admin', status: 'Active' },
  });
  await prisma.user.upsert({
    where: { email: 'super@demo.com' },
    update: {},
    create: { name: 'Carol White', email: 'super@demo.com', passwordHash: hash, role: 'supervisor', status: 'Active' },
  });
  console.log('  ✓ Users created');

  // ─── Properties ───────────────────────────────────────────────────────────
  const props = [
    {
      title: 'Modern Family Home', type: 'house', status: 'For Sale', price: 485000,
      address: '14 Maple Grove, London, SW12 4RJ', city: 'London',
      beds: 4, baths: 2, sqft: 1850, parking: true, featured: true,
      lat: 51.45, lng: -0.14,
      description: 'A beautifully presented four-bedroom family home set on a quiet residential street. Features an open-plan kitchen/diner, landscaped garden, and recently renovated bathrooms.',
      features: JSON.stringify(['Open-plan kitchen', 'Landscaped garden', 'Double garage', 'Central heating', 'Recently renovated']),
      images: [
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
      ],
    },
    {
      title: 'City Centre Apartment', type: 'apartment', status: 'For Rent', price: 1850,
      address: 'Apt 7B, The Riverside, Manchester, M3 1LW', city: 'Manchester',
      beds: 2, baths: 1, sqft: 820, parking: false, featured: true,
      lat: 53.48, lng: -2.24,
      description: 'Stunning riverside apartment with floor-to-ceiling windows and panoramic city views. Fully furnished. 24-hour concierge, gym, and rooftop terrace included.',
      features: JSON.stringify(['River views', 'Fully furnished', '24hr concierge', 'Rooftop terrace', 'Gym access']),
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80'],
    },
    {
      title: 'Victorian Terraced House', type: 'house', status: 'For Sale', price: 320000,
      address: '82 Rosewood Lane, Birmingham, B15 2TH', city: 'Birmingham',
      beds: 3, baths: 1, sqft: 1200, parking: false, featured: false,
      lat: 52.48, lng: -1.9,
      description: 'Charming period property retaining original features. Recently updated kitchen and bathroom. Private rear garden.',
      features: JSON.stringify(['Period features', 'Private garden', 'Updated kitchen', 'Gas central heating']),
      images: ['https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=800&q=80'],
    },
    {
      title: 'Luxury Penthouse', type: 'apartment', status: 'For Sale', price: 1200000,
      address: 'Penthouse, One Canary Wharf, London, E14 5AB', city: 'London',
      beds: 3, baths: 3, sqft: 2100, parking: true, featured: true,
      lat: 51.50, lng: -0.02,
      description: 'An exceptional penthouse apartment offering breathtaking Thames views from every room. Bespoke designer kitchen, private terrace, and underground parking.',
      features: JSON.stringify(['Thames views', 'Private terrace', 'Designer kitchen', 'Pool & Spa', '2 parking spaces']),
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
        'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&q=80',
      ],
    },
    {
      title: 'Prime Office Space', type: 'commercial', status: 'For Rent', price: 4500,
      address: '3rd Floor, Exchange Tower, Leeds, LS1 1BA', city: 'Leeds',
      beds: 0, baths: 2, sqft: 3200, parking: true, featured: false,
      lat: 53.80, lng: -1.55,
      description: 'Modern open-plan office suite in a prestigious city centre tower. Climate control and high-speed fibre. Ideal for 20-35 person team.',
      features: JSON.stringify(['Open plan', 'Climate control', 'Fibre broadband', '10 parking spaces']),
      images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'],
    },
    {
      title: 'Development Land Plot', type: 'land', status: 'For Sale', price: 210000,
      address: 'Plot 4, Greenfield Estate, Bristol, BS10 6AA', city: 'Bristol',
      beds: 0, baths: 0, sqft: 8500, parking: false, featured: false,
      lat: 51.49, lng: -2.6,
      description: 'Serviced development plot with outline planning permission for up to 4 detached dwellings. Mains services connected.',
      features: JSON.stringify(['Planning permission', 'Mains services', 'Road frontage', '0.2 acres']),
      images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'],
    },
    {
      title: 'Semi-Detached Family Home', type: 'house', status: 'For Sale', price: 390000,
      address: '27 Chestnut Avenue, Edinburgh, EH4 3DQ', city: 'Edinburgh',
      beds: 4, baths: 2, sqft: 1650, parking: true, featured: false,
      lat: 55.95, lng: -3.2,
      description: 'Well-proportioned semi-detached home in a sought-after area. Large south-facing garden. Walking distance to Stockbridge village.',
      features: JSON.stringify(['South-facing garden', 'Integral garage', 'Modern kitchen', 'Near schools']),
      images: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80'],
    },
    {
      title: 'Studio Apartment', type: 'apartment', status: 'For Rent', price: 950,
      address: 'Studio 3, Park View, Glasgow, G1 2TT', city: 'Glasgow',
      beds: 0, baths: 1, sqft: 380, parking: false, featured: false,
      lat: 55.86, lng: -4.25,
      description: 'Stylish studio apartment ideal for young professionals. Bills included. Private balcony.',
      features: JSON.stringify(['Bills included', 'Private balcony', 'Furnished', 'Near transport']),
      images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80'],
    },
    {
      title: 'New Build Detached', type: 'house', status: 'For Sale', price: 550000,
      address: 'Plot 12, Oakwood Gardens, Nottingham, NG7 1BX', city: 'Nottingham',
      beds: 5, baths: 3, sqft: 2200, parking: true, featured: true,
      lat: 52.95, lng: -1.14,
      description: 'Stunning new-build detached home with the latest energy-efficient design. 10-year NHBC warranty.',
      features: JSON.stringify(['A+ energy rating', '10yr NHBC warranty', 'Home office', 'Double garage', 'Underfloor heating']),
      images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'],
    },
  ];

  for (const p of props) {
    const { images, ...data } = p;
    const existing = await prisma.property.findFirst({ where: { title: p.title, address: p.address } });
    if (existing) continue;
    const prop = await prisma.property.create({
      data: { ...data, createdById: admin.id },
    });
    for (let i = 0; i < images.length; i++) {
      await prisma.propertyImage.create({ data: { propertyId: prop.id, url: images[i], order: i } });
    }
  }
  console.log('  ✓ Properties & images created');

  // ─── Sample inquiries & viewings ──────────────────────────────────────────
  const prop1 = await prisma.property.findFirst({ where: { title: 'Modern Family Home' } });
  const prop2 = await prisma.property.findFirst({ where: { title: 'City Centre Apartment' } });
  const prop4 = await prisma.property.findFirst({ where: { title: 'Luxury Penthouse' } });

  if (prop1) {
    const inq = await prisma.inquiry.findFirst({ where: { userId: alice.id, propertyId: prop1.id } });
    if (!inq) {
      const newInq = await prisma.inquiry.create({
        data: { userId: alice.id, propertyId: prop1.id, message: 'Is the property still available? Would love to arrange a viewing.', status: 'Responded' },
      });
      await prisma.inquiryReply.create({
        data: { inquiryId: newInq.id, adminId: admin.id, message: 'Yes, absolutely available! We can arrange a viewing this weekend.' },
      });
    }
  }
  if (prop4) {
    const inq2 = await prisma.inquiry.findFirst({ where: { userId: alice.id, propertyId: prop4.id } });
    if (!inq2) {
      await prisma.inquiry.create({
        data: { userId: alice.id, propertyId: prop4.id, message: 'What is the service charge per annum? Are pets allowed?', status: 'Pending' },
      });
    }
  }
  if (prop1) {
    const v = await prisma.viewingRequest.findFirst({ where: { userId: alice.id, propertyId: prop1.id } });
    if (!v) {
      await prisma.viewingRequest.create({
        data: { userId: alice.id, propertyId: prop1.id, date: '2026-05-20', time: '14:00', message: 'Interested in a full tour including the garden.', status: 'Confirmed' },
      });
    }
  }
  if (prop2) {
    const fav = await prisma.favourite.findFirst({ where: { userId: alice.id, propertyId: prop2.id } });
    if (!fav) await prisma.favourite.create({ data: { userId: alice.id, propertyId: prop2.id } });
  }
  console.log('  ✓ Sample inquiries, viewings, and favourites created');

  // ─── Audit logs ───────────────────────────────────────────────────────────
  const logExists = await prisma.auditLog.findFirst();
  if (!logExists) {
    await prisma.auditLog.createMany({
      data: [
        { userId: alice.id, action: 'REGISTER', detail: 'New user registered: user@demo.com', ip: '127.0.0.1' },
        { userId: admin.id, action: 'REGISTER', detail: 'New user registered: admin@demo.com', ip: '127.0.0.1' },
        { userId: alice.id, action: 'LOGIN_SUCCESS', detail: 'Logged in as user', ip: '127.0.0.1' },
        { userId: admin.id, action: 'PROPERTY_CREATE', detail: 'Created property: Modern Family Home', ip: '127.0.0.1' },
        { userId: alice.id, action: 'INQUIRY_CREATE', detail: 'Inquiry for Modern Family Home', ip: '127.0.0.1' },
        { userId: admin.id, action: 'INQUIRY_REPLY', detail: 'Replied to inquiry #1', ip: '127.0.0.1' },
      ],
    });
  }
  console.log('  ✓ Audit logs created');
  console.log('\n✅ Seed complete!\n');
  console.log('  Demo login credentials:');
  console.log('    user@demo.com   / Password1!  (regular user)');
  console.log('    admin@demo.com  / Password1!  (administrator)');
  console.log('    super@demo.com  / Password1!  (supervisor)\n');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
