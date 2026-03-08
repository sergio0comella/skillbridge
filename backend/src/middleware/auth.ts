import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { prisma } from '../config/database'
import { redis, RedisKeys } from '../config/redis'
import { UnauthorizedError, ForbiddenError } from './error'
import { Role } from '@prisma/client'

export interface AuthPayload {
  userId: string
  email: string
  role: Role
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid authorization header'))
  }

  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload
    void (async () => {
      const isBlacklisted = await redis.get(RedisKeys.blacklist(token))
      if (isBlacklisted) return next(new UnauthorizedError('Token has been revoked'))
      req.user = payload
      next()
    })()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Token expired'))
    }
    return next(new UnauthorizedError('Invalid token'))
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new UnauthorizedError())
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'))
    }
    next()
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return next()
  const token = authHeader.slice(7)
  try {
    req.user = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload
  } catch {
    // ignore
  }
  next()
}

export function generateAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions)
}

export function generateRefreshToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions)
}

export async function revokeAccessToken(token: string): Promise<void> {
  const decoded = jwt.decode(token) as { exp?: number } | null
  if (!decoded?.exp) return
  const ttl = decoded.exp - Math.floor(Date.now() / 1000)
  if (ttl > 0) {
    await redis.setex(RedisKeys.blacklist(token), ttl, '1')
  }
}

export function isSelf(paramName = 'id') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new UnauthorizedError())
    if (req.user.userId !== req.params[paramName] && req.user.role !== Role.ADMIN) {
      return next(new ForbiddenError())
    }
    next()
  }
}

export async function loadUser(userId: string) {
  const cached = await redis.get(RedisKeys.userCache(userId))
  if (cached) return JSON.parse(cached)
  const user = await prisma.user.findUnique({ where: { id: userId }, select: {
    id: true, email: true, name: true, role: true, isActive: true,
  }})
  if (user) await redis.setex(RedisKeys.userCache(userId), 300, JSON.stringify(user))
  return user
}
