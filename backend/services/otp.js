'use strict';
const prisma = require('../db');

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function createOTP(userId) {
  // Invalidate any existing unused OTPs for this user
  await prisma.otpCode.updateMany({
    where: { userId, used: false },
    data: { used: true },
  });

  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await prisma.otpCode.create({ data: { userId, code, expiresAt } });
  return code;
}

async function verifyOTP(userId, code) {
  const record = await prisma.otpCode.findFirst({
    where: { userId, code, used: false },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) return { valid: false, reason: 'Invalid code.' };
  if (new Date() > record.expiresAt) return { valid: false, reason: 'Code has expired.' };

  // Mark as used
  await prisma.otpCode.update({ where: { id: record.id }, data: { used: true } });
  return { valid: true };
}

module.exports = { createOTP, verifyOTP };
