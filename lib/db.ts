import { PrismaClient } from "@/prisma/generated/client/client";

// Use require to load pg and adapter in CommonJS style for compatibility
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/dummy';
  
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const db = globalThis.prismaGlobal ?? prismaClientSingleton()

export default db
 
if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = db