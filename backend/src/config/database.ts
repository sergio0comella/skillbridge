import { PrismaClient } from '@prisma/client'
import { env } from './env'

declare global {
  var __prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    log: env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['warn', 'error'],
    errorFormat: env.NODE_ENV === 'production' ? 'minimal' : 'pretty',
  })
}

export const prisma = globalThis.__prisma ?? createPrismaClient()

if (env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

export async function connectDatabase(): Promise<void> {
  await prisma.$connect()
  console.log('✅ Database connected')
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
  console.log('Database disconnected')
}
