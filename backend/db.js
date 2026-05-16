'use strict';
const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');

// @prisma/adapter-libsql v6+ API: pass config object directly (no separate createClient needed)
const adapter = new PrismaLibSQL({
  url:       process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });
module.exports = prisma;
