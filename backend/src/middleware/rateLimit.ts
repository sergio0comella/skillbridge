import rateLimit from 'express-rate-limit'
import { env } from '../config/env'
import { StatusCodes } from 'http-status-codes'

const baseOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: unknown, res: { status: (c: number) => { json: (b: unknown) => void } }) => {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many requests, please try again later.',
      code: 'RATE_LIMITED',
    })
  },
}

export const globalRateLimit = rateLimit({
  ...baseOptions,
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
})

export const authRateLimit = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts.',
})

export const strictRateLimit = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  max: 5,
})
