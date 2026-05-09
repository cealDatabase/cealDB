import 'dotenv/config'
import { defineConfig } from 'prisma/config'
// import { PrismaPg } from '@prisma/adapter-pg'
// import { Pool } from 'pg'

// Create PostgreSQL pool for migrations (needs unpooled connection)
// const getMigrateAdapter = () => {
//   const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
//   if (!connectionString) {
//     throw new Error('DATABASE_URL or DATABASE_URL_UNPOOLED is required for migrations')
//   }
  
//   const pool = new Pool({
//     connectionString,
//     ssl: {
//       rejectUnauthorized: false, // Required for Neon
//     },
//   })
  
//   return new PrismaPg(pool)
// }

export default defineConfig({
  schema: 'prisma/schema',
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
})
