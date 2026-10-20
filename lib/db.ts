import { PrismaClient } from "@/prisma/generated/client/client";

// Use require to load pg and adapter in CommonJS style for compatibility
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { hostname } = require("os");

// The name each database connection gives itself. The change log
// (scripts/data-change-log.sql) records it with every write, so a write
// from the deployed site, from someone's computer, or from outside the app
// can be told apart.
const connectionName = () =>
  process.env.VERCEL
    ? `cealdb-vercel-${process.env.VERCEL_ENV || "unknown"}`
    : `cealdb-local-${hostname()}`.slice(0, 63);

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/dummy';

  const pool = new Pool({
    connectionString,
    application_name: connectionName(),
    ssl: {
      rejectUnauthorized: true, // Enforce SSL certificate validation
    }
  });
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({
    adapter,
    log: ['error'],
  });
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const db = globalThis.prismaGlobal ?? prismaClientSingleton()

export default db
 
if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = db