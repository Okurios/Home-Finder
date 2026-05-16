'use strict';
/**
 * Direct Turso migration — creates all HomeFinder tables via @libsql/client.
 * Run once before first deploy: node prisma/turso-migrate.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@libsql/client');

const client = createClient({
  url:       process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const statements = [
  `CREATE TABLE IF NOT EXISTS "User" (
    "id"            INTEGER  PRIMARY KEY AUTOINCREMENT,
    "name"          TEXT     NOT NULL,
    "email"         TEXT     NOT NULL UNIQUE,
    "passwordHash"  TEXT     NOT NULL,
    "role"          TEXT     NOT NULL DEFAULT 'user',
    "status"        TEXT     NOT NULL DEFAULT 'Active',
    "emailVerified" INTEGER  NOT NULL DEFAULT 0,
    "createdAt"     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS "Session" (
    "id"        INTEGER  PRIMARY KEY AUTOINCREMENT,
    "userId"    INTEGER  NOT NULL,
    "token"     TEXT     NOT NULL UNIQUE,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS "OtpCode" (
    "id"        INTEGER  PRIMARY KEY AUTOINCREMENT,
    "userId"    INTEGER  NOT NULL,
    "code"      TEXT     NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "used"      INTEGER  NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS "Property" (
    "id"          INTEGER  PRIMARY KEY AUTOINCREMENT,
    "title"       TEXT     NOT NULL,
    "type"        TEXT     NOT NULL,
    "status"      TEXT     NOT NULL,
    "price"       REAL     NOT NULL,
    "address"     TEXT     NOT NULL,
    "city"        TEXT     NOT NULL DEFAULT '',
    "beds"        INTEGER  NOT NULL DEFAULT 0,
    "baths"       INTEGER  NOT NULL DEFAULT 0,
    "sqft"        INTEGER  NOT NULL DEFAULT 0,
    "parking"     INTEGER  NOT NULL DEFAULT 0,
    "description" TEXT     NOT NULL DEFAULT '',
    "features"    TEXT     NOT NULL DEFAULT '[]',
    "lat"         REAL     NOT NULL DEFAULT 0,
    "lng"         REAL     NOT NULL DEFAULT 0,
    "featured"    INTEGER  NOT NULL DEFAULT 0,
    "isActive"    INTEGER  NOT NULL DEFAULT 1,
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    FOREIGN KEY ("createdById") REFERENCES "User"("id"),
    FOREIGN KEY ("updatedById") REFERENCES "User"("id")
  )`,

  `CREATE TABLE IF NOT EXISTS "PropertyImage" (
    "id"         INTEGER  PRIMARY KEY AUTOINCREMENT,
    "propertyId" INTEGER  NOT NULL,
    "url"        TEXT     NOT NULL,
    "order"      INTEGER  NOT NULL DEFAULT 0,
    "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS "Inquiry" (
    "id"         INTEGER  PRIMARY KEY AUTOINCREMENT,
    "userId"     INTEGER  NOT NULL,
    "propertyId" INTEGER  NOT NULL,
    "message"    TEXT     NOT NULL,
    "status"     TEXT     NOT NULL DEFAULT 'Pending',
    "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId")     REFERENCES "User"("id")     ON DELETE CASCADE,
    FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS "InquiryReply" (
    "id"        INTEGER  PRIMARY KEY AUTOINCREMENT,
    "inquiryId" INTEGER  NOT NULL,
    "adminId"   INTEGER  NOT NULL,
    "message"   TEXT     NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE CASCADE,
    FOREIGN KEY ("adminId")   REFERENCES "User"("id")
  )`,

  `CREATE TABLE IF NOT EXISTS "ViewingRequest" (
    "id"         INTEGER  PRIMARY KEY AUTOINCREMENT,
    "userId"     INTEGER  NOT NULL,
    "propertyId" INTEGER  NOT NULL,
    "date"       TEXT     NOT NULL,
    "time"       TEXT     NOT NULL,
    "message"    TEXT     NOT NULL DEFAULT '',
    "status"     TEXT     NOT NULL DEFAULT 'Pending',
    "adminNote"  TEXT     NOT NULL DEFAULT '',
    "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId")     REFERENCES "User"("id")     ON DELETE CASCADE,
    FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS "Favourite" (
    "id"         INTEGER  PRIMARY KEY AUTOINCREMENT,
    "userId"     INTEGER  NOT NULL,
    "propertyId" INTEGER  NOT NULL,
    "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId")     REFERENCES "User"("id")     ON DELETE CASCADE,
    FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE,
    UNIQUE("userId", "propertyId")
  )`,

  `CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id"        INTEGER  PRIMARY KEY AUTOINCREMENT,
    "userId"    INTEGER,
    "action"    TEXT     NOT NULL,
    "detail"    TEXT     NOT NULL DEFAULT '',
    "ip"        TEXT     NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
  )`,
];

async function migrate() {
  console.log('🔗 Connecting to Turso:', process.env.TURSO_DATABASE_URL);
  for (const sql of statements) {
    const tableName = sql.match(/CREATE TABLE IF NOT EXISTS "(\w+)"/)?.[1];
    try {
      await client.execute(sql);
      console.log(`  ✔ ${tableName}`);
    } catch (err) {
      console.error(`  ✘ ${tableName}:`, err.message);
      process.exit(1);
    }
  }
  console.log('\n✅ All tables created in Turso successfully!\n');
  process.exit(0);
}

migrate();
