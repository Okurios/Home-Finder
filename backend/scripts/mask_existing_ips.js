'use strict';
/**
 * One-time migration: retroactively mask the last octet of every IP address
 * already stored in the AuditLog table.
 *
 * Run with:  node backend/scripts/mask_existing_ips.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const prisma = require('../db');

function maskIp(ip) {
  if (!ip) return '';
  // Already masked
  if (ip.endsWith('.xxx') || ip.endsWith(':xxxx')) return ip;
  // IPv4: 1.2.3.4 → 1.2.3.xxx
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return ip.replace(/\.\d+$/, '.xxx');
  // IPv4-mapped IPv6: ::ffff:1.2.3.4
  if (ip.startsWith('::ffff:')) return '::ffff:' + maskIp(ip.slice(7));
  // IPv6: mask last colon-separated group
  if (ip.includes(':')) return ip.replace(/:[^:]+$/, ':xxxx');
  return ip;
}

async function run() {
  console.log('Fetching all AuditLog rows with non-empty IPs…');
  const rows = await prisma.auditLog.findMany({
    where: { ip: { not: '' } },
    select: { id: true, ip: true },
  });
  console.log(`Found ${rows.length} rows to process.`);

  let updated = 0;
  for (const row of rows) {
    const masked = maskIp(row.ip);
    if (masked !== row.ip) {
      await prisma.auditLog.update({ where: { id: row.id }, data: { ip: masked } });
      updated++;
    }
  }

  console.log(`Done. ${updated} rows updated (${rows.length - updated} already masked or unchanged).`);
  await prisma.$disconnect();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
