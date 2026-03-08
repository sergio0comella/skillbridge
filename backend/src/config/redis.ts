import Redis from 'ioredis'
import { env } from './env'

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  retryStrategy: (times) => Math.min(times * 100, 3000),
  maxRetriesPerRequest: 3,
})

redis.on('connect', () => console.log('✅ Redis connected'))
redis.on('error', (err) => console.error('Redis error:', err.message))

export async function connectRedis(): Promise<void> {
  await redis.connect()
}

export async function disconnectRedis(): Promise<void> {
  await redis.quit()
  console.log('Redis disconnected')
}

export const RedisKeys = {
  refreshToken: (token: string) => `rt:${token}`,
  rateLimit: (ip: string) => `rl:${ip}`,
  sessionCache: (id: string) => `sess:${id}`,
  userCache: (id: string) => `user:${id}`,
  blacklist: (token: string) => `bl:${token}`,
} as const
