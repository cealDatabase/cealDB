import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  // Schema location
  schema: 'prisma/schema',
  
  // Database configuration
  datasource: {
    url: env('DATABASE_URL'),
  },
  
  // Migrations configuration
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
})
