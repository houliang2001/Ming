import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.__lingxiPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__lingxiPrisma = prisma
}

export default prisma
