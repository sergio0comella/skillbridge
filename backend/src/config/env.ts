import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),

  DATABASE_URL: z.string().url(),

  REDIS_URL: z.string().default('redis://localhost:6379'),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  BCRYPT_ROUNDS: z.coerce.number().default(12),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional(),
  PLATFORM_FEE_PERCENT: z.coerce.number().default(12),

  UPLOAD_MAX_SIZE_MB: z.coerce.number().default(5),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
})

function validateEnv() {
  const parsed = schema.safeParse(process.env)
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:')
    for (const [key, issues] of Object.entries(parsed.error.flatten().fieldErrors)) {
      console.error(`  ${key}: ${(issues as string[]).join(', ')}`)
    }
    process.exit(1)
  }
  return parsed.data
}

export const env = validateEnv()
export type Env = typeof env
