'use strict';
/**
 * Direct Turso seed — inserts all demo data via @libsql/client (no Prisma CLI).
 * Run: set NODE_PATH=...\backend\node_modules && node prisma/turso-seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

const client = createClient({
  url:       process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run(sql, args = []) {
  return client.execute({ sql, args });
}

async function seed() {
  console.log('🌱 Seeding Turso database...\n');

  // ─── Users ────────────────────────────────────────────────────────────────
  const hash = await bcrypt.hash('Password1!', 12);
  const now  = new Date().toISOString();

  await run(`INSERT OR IGNORE INTO "User" (name, email, passwordHash, role, status, emailVerified, createdAt, updatedAt)
             VALUES (?,?,?,'user','Active',0,?,?)`,
    ['Alice Johnson', 'user@demo.com', hash, now, now]);

  await run(`INSERT OR IGNORE INTO "User" (name, email, passwordHash, role, status, emailVerified, createdAt, updatedAt)
             VALUES (?,?,?,'admin','Active',0,?,?)`,
    ['David Brown', 'admin@demo.com', hash, now, now]);

  await run(`INSERT OR IGNORE INTO "User" (name, email, passwordHash, role, status, emailVerified, createdAt, updatedAt)
             VALUES (?,?,?,'supervisor','Active',0,?,?)`,
    ['Carol White', 'super@demo.com', hash, now, now]);

  const alice = (await run(`SELECT id FROM "User" WHERE email='user@demo.com'`)).rows[0];
  const admin = (await run(`SELECT id FROM "User" WHERE email='admin@demo.com'`)).rows[0];
  console.log('  ✔ Users');

  // ─── Properties ───────────────────────────────────────────────────────────
  const props = [
    { title:'Modern Family Home',    type:'house',      status:'For Sale', price:485000,  address:'14 Maple Grove, London, SW12 4RJ',             city:'London',     beds:4, baths:2, sqft:1850, parking:1, featured:1, lat:51.45, lng:-0.14,
      desc:'A beautifully presented four-bedroom family home set on a quiet residential street. Features an open-plan kitchen/diner, landscaped garden, and recently renovated bathrooms.',
      features:'["Open-plan kitchen","Landscaped garden","Double garage","Central heating","Recently renovated"]',
      images:['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80','https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80'] },

    { title:'City Centre Apartment',  type:'apartment',  status:'For Rent', price:1850,   address:'Apt 7B, The Riverside, Manchester, M3 1LW',       city:'Manchester', beds:2, baths:1, sqft:820,  parking:0, featured:1, lat:53.48, lng:-2.24,
      desc:'Stunning riverside apartment with floor-to-ceiling windows and panoramic city views. Fully furnished. 24-hour concierge, gym, and rooftop terrace included.',
      features:'["River views","Fully furnished","24hr concierge","Rooftop terrace","Gym access"]',
      images:['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80'] },

    { title:'Victorian Terraced House', type:'house',    status:'For Sale', price:320000, address:'82 Rosewood Lane, Birmingham, B15 2TH',           city:'Birmingham', beds:3, baths:1, sqft:1200, parking:0, featured:0, lat:52.48, lng:-1.9,
      desc:'Charming period property retaining original features. Recently updated kitchen and bathroom. Private rear garden.',
      features:'["Period features","Private garden","Updated kitchen","Gas central heating"]',
      images:['https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=800&q=80'] },

    { title:'Luxury Penthouse',       type:'apartment',  status:'For Sale', price:1200000,address:'Penthouse, One Canary Wharf, London, E14 5AB',     city:'London',     beds:3, baths:3, sqft:2100, parking:1, featured:1, lat:51.50, lng:-0.02,
      desc:'An exceptional penthouse apartment offering breathtaking Thames views. Bespoke designer kitchen, private terrace, and underground parking.',
      features:'["Thames views","Private terrace","Designer kitchen","Pool & Spa","2 parking spaces"]',
      images:['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80','https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&q=80'] },

    { title:'Prime Office Space',     type:'commercial', status:'For Rent', price:4500,   address:'3rd Floor, Exchange Tower, Leeds, LS1 1BA',        city:'Leeds',      beds:0, baths:2, sqft:3200, parking:1, featured:0, lat:53.80, lng:-1.55,
      desc:'Modern open-plan office suite in a prestigious city centre tower. Climate control and high-speed fibre. Ideal for 20-35 person team.',
      features:'["Open plan","Climate control","Fibre broadband","10 parking spaces"]',
      images:['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'] },

    { title:'Development Land Plot',  type:'land',       status:'For Sale', price:210000, address:'Plot 4, Greenfield Estate, Bristol, BS10 6AA',     city:'Bristol',    beds:0, baths:0, sqft:8500, parking:0, featured:0, lat:51.49, lng:-2.6,
      desc:'Serviced development plot with outline planning permission for up to 4 detached dwellings. Mains services connected.',
      features:'["Planning permission","Mains services","Road frontage","0.2 acres"]',
      images:['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'] },

    { title:'Semi-Detached Family Home', type:'house',   status:'For Sale', price:390000, address:'27 Chestnut Avenue, Edinburgh, EH4 3DQ',           city:'Edinburgh',  beds:4, baths:2, sqft:1650, parking:1, featured:0, lat:55.95, lng:-3.2,
      desc:'Well-proportioned semi-detached home in a sought-after area. Large south-facing garden. Walking distance to Stockbridge village.',
      features:'["South-facing garden","Integral garage","Modern kitchen","Near schools"]',
      images:['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80'] },

    { title:'Studio Apartment',       type:'apartment',  status:'For Rent', price:950,   address:'Studio 3, Park View, Glasgow, G1 2TT',              city:'Glasgow',    beds:0, baths:1, sqft:380,  parking:0, featured:0, lat:55.86, lng:-4.25,
      desc:'Stylish studio apartment ideal for young professionals. Bills included. Private balcony.',
      features:'["Bills included","Private balcony","Furnished","Near transport"]',
      images:['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80'] },

    { title:'New Build Detached',     type:'house',      status:'For Sale', price:550000, address:'Plot 12, Oakwood Gardens, Nottingham, NG7 1BX',    city:'Nottingham', beds:5, baths:3, sqft:2200, parking:1, featured:1, lat:52.95, lng:-1.14,
      desc:'Stunning new-build detached home with the latest energy-efficient design. 10-year NHBC warranty.',
      features:'["A+ energy rating","10yr NHBC warranty","Home office","Double garage","Underfloor heating"]',
      images:['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'] },
  ];

  for (const p of props) {
    const exists = (await run(`SELECT id FROM "Property" WHERE title=? AND address=?`, [p.title, p.address])).rows[0];
    if (exists) { console.log(`  ↷ Skip (exists): ${p.title}`); continue; }
    await run(
      `INSERT INTO "Property" (title,type,status,price,address,city,beds,baths,sqft,parking,description,features,lat,lng,featured,isActive,createdAt,updatedAt,createdById)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?,?)`,
      [p.title,p.type,p.status,p.price,p.address,p.city,p.beds,p.baths,p.sqft,p.parking,p.desc,p.features,p.lat,p.lng,p.featured,now,now,admin.id]
    );
    const prop = (await run(`SELECT id FROM "Property" WHERE title=? AND address=?`, [p.title, p.address])).rows[0];
    for (let i = 0; i < p.images.length; i++) {
      await run(`INSERT INTO "PropertyImage" (propertyId, url, "order", createdAt) VALUES (?,?,?,?)`,
        [prop.id, p.images[i], i, now]);
    }
    console.log(`  ✔ ${p.title}`);
  }
  console.log('  ✔ Properties & images\n');

  // ─── Sample Inquiry + Reply + Viewing + Favourite ─────────────────────────
  const prop1 = (await run(`SELECT id FROM "Property" WHERE title='Modern Family Home'`)).rows[0];
  const prop2 = (await run(`SELECT id FROM "Property" WHERE title='City Centre Apartment'`)).rows[0];
  const prop4 = (await run(`SELECT id FROM "Property" WHERE title='Luxury Penthouse'`)).rows[0];

  if (prop1) {
    const inqExists = (await run(`SELECT id FROM "Inquiry" WHERE userId=? AND propertyId=?`, [alice.id, prop1.id])).rows[0];
    if (!inqExists) {
      await run(`INSERT INTO "Inquiry" (userId,propertyId,message,status,createdAt,updatedAt) VALUES (?,?,?,'Responded',?,?)`,
        [alice.id, prop1.id, 'Is the property still available? Would love to arrange a viewing.', now, now]);
      const inq = (await run(`SELECT id FROM "Inquiry" WHERE userId=? AND propertyId=?`, [alice.id, prop1.id])).rows[0];
      await run(`INSERT INTO "InquiryReply" (inquiryId,adminId,message,createdAt) VALUES (?,?,?,?)`,
        [inq.id, admin.id, 'Yes, absolutely available! We can arrange a viewing this weekend.', now]);
    }
    const vExists = (await run(`SELECT id FROM "ViewingRequest" WHERE userId=? AND propertyId=?`, [alice.id, prop1.id])).rows[0];
    if (!vExists) {
      await run(`INSERT INTO "ViewingRequest" (userId,propertyId,date,time,message,status,adminNote,createdAt,updatedAt) VALUES (?,?,'2026-05-20','14:00',?,'Confirmed','',?,?)`,
        [alice.id, prop1.id, 'Interested in a full tour including the garden.', now, now]);
    }
  }
  if (prop4) {
    const inq2Exists = (await run(`SELECT id FROM "Inquiry" WHERE userId=? AND propertyId=?`, [alice.id, prop4.id])).rows[0];
    if (!inq2Exists) {
      await run(`INSERT INTO "Inquiry" (userId,propertyId,message,status,createdAt,updatedAt) VALUES (?,?,?,'Pending',?,?)`,
        [alice.id, prop4.id, 'What is the service charge per annum? Are pets allowed?', now, now]);
    }
  }
  if (prop2) {
    const favExists = (await run(`SELECT id FROM "Favourite" WHERE userId=? AND propertyId=?`, [alice.id, prop2.id])).rows[0];
    if (!favExists) {
      await run(`INSERT INTO "Favourite" (userId,propertyId,createdAt) VALUES (?,?,?)`, [alice.id, prop2.id, now]);
    }
  }
  console.log('  ✔ Inquiries, viewings & favourites');

  // ─── Audit logs ───────────────────────────────────────────────────────────
  const logExists = (await run(`SELECT id FROM "AuditLog" LIMIT 1`)).rows[0];
  if (!logExists) {
    const logs = [
      [alice.id,'REGISTER',  'New user registered: user@demo.com', '127.0.0.1', now],
      [admin.id,'REGISTER',  'New user registered: admin@demo.com','127.0.0.1', now],
      [alice.id,'LOGIN_SUCCESS','Logged in as user',               '127.0.0.1', now],
      [admin.id,'PROPERTY_CREATE','Created property: Modern Family Home','127.0.0.1',now],
      [alice.id,'INQUIRY_CREATE','Inquiry for Modern Family Home', '127.0.0.1', now],
      [admin.id,'INQUIRY_REPLY','Replied to inquiry #1',           '127.0.0.1', now],
    ];
    for (const [uid,action,detail,ip,ts] of logs) {
      await run(`INSERT INTO "AuditLog" (userId,action,detail,ip,createdAt) VALUES (?,?,?,?,?)`, [uid,action,detail,ip,ts]);
    }
  }
  console.log('  ✔ Audit logs\n');

  console.log('✅ Seed complete!\n');
  console.log('  Demo credentials (password: Password1!):');
  console.log('    user@demo.com   → regular user');
  console.log('    admin@demo.com  → administrator');
  console.log('    super@demo.com  → supervisor\n');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
