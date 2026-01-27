import { PrismaClient } from "@/prisma/generated/client/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const prismaClientSingleton = () => {
  // Prisma 7 requires either adapter or accelerateUrl
  // Create connection pool for PostgreSQL adapter
  const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/dummy';
  
  const pool = new Pool({
    connectionString,
  });
  
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ adapter });
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const db = globalThis.prismaGlobal ?? prismaClientSingleton()

export default db
 
if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = db