import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'

import { env } from './config/env'
import { connectDatabase, disconnectDatabase } from './config/database'
import { connectRedis, disconnectRedis } from './config/redis'
import { globalRateLimit } from './middleware/rateLimit'
import { errorHandler, notFoundHandler } from './middleware/error'

import authRoutes from './routes/auth'
import sessionRoutes from './routes/sessions'
import bookingRoutes from './routes/bookings'
import paymentRoutes from './routes/payments'
import dashboardRoutes from './routes/dashboard'
import userRoutes from './routes/users'

const app = express()

// ── Security ─────────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── Raw body for Stripe webhooks ──────────────────────────────────────────────
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))

// ── General middleware ────────────────────────────────────────────────────────
app.use(compression())
app.use(cookieParser())
app.use(express.json({ limit: `${env.UPLOAD_MAX_SIZE_MB}mb` }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(globalRateLimit)

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: env.NODE_ENV })
})

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/users', userRoutes)

// ── 404 & Error handlers ──────────────────────────────────────────────────────
app.use(notFoundHandler)
app.use(errorHandler)

// ── Startup ───────────────────────────────────────────────────────────────────
async function start() {
  try {
    await connectDatabase()
    await connectRedis()
    const server = app.listen(env.PORT, () => {
      console.log(`🚀 SkillBridge API running on http://localhost:${env.PORT}`)
      console.log(`   Environment: ${env.NODE_ENV}`)
    })

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received — shutting down gracefully`)
      server.close(async () => {
        await disconnectDatabase()
        await disconnectRedis()
        process.exit(0)
      })
      setTimeout(() => process.exit(1), 10_000)
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

start()
