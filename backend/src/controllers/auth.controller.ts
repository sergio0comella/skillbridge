import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '../config/database'
import { env } from '../config/env'
import {
  generateAccessToken,
  generateRefreshToken,
  revokeAccessToken,
  AuthPayload,
} from '../middleware/auth'
import { success, created } from '../utils/response'
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} from '../middleware/error'
import type { RegisterInput, LoginInput, RefreshInput, ChangePasswordInput } from '../schemas/auth.schema'
import jwt from 'jsonwebtoken'

const REFRESH_TOKEN_TTL_DAYS = 7

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, name, role } = req.body as RegisterInput

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) throw new ConflictError('An account with this email already exists')

    const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS)
    const user = await prisma.user.create({
      data: { email, passwordHash, name, role },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    })

    const payload: AuthPayload = { userId: user.id, email: user.email, role: user.role }
    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS)
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    })

    created(res, { user, accessToken }, 'Account created successfully')
  } catch (err) {
    next(err)
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as LoginInput

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.isActive) throw new UnauthorizedError('Invalid email or password')

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) throw new UnauthorizedError('Invalid email or password')

    const payload: AuthPayload = { userId: user.id, email: user.email, role: user.role }
    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS)
    await prisma.refreshToken.deleteMany({ where: { userId: user.id, isRevoked: true } })
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    })

    const { passwordHash: _, ...safeUser } = user
    success(res, { user: safeUser, accessToken }, 'Logged in successfully')
  } catch (err) {
    next(err)
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = (req.body as RefreshInput).refreshToken || req.cookies?.refreshToken
    if (!token) throw new UnauthorizedError('Refresh token required')

    const stored = await prisma.refreshToken.findUnique({ where: { token } })
    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token')
    }

    let payload: AuthPayload
    try {
      payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as AuthPayload
    } catch {
      await prisma.refreshToken.update({ where: { token }, data: { isRevoked: true } })
      throw new UnauthorizedError('Invalid refresh token')
    }

    await prisma.refreshToken.update({ where: { token }, data: { isRevoked: true } })

    const newRefreshToken = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS)

    const newPayload: AuthPayload = { userId: payload.userId, email: payload.email, role: payload.role }
    const accessToken = generateAccessToken(newPayload)
    const refreshToken = generateRefreshToken(newPayload)

    await prisma.refreshToken.create({ data: { token: refreshToken, userId: payload.userId, expiresAt } })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    })

    void newRefreshToken
    success(res, { accessToken }, 'Token refreshed')
  } catch (err) {
    next(err)
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      await revokeAccessToken(authHeader.slice(7))
    }

    const refreshToken = req.cookies?.refreshToken
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { isRevoked: true },
      })
    }

    res.clearCookie('refreshToken')
    success(res, null, 'Logged out successfully')
  } catch (err) {
    next(err)
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError()
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true, email: true, name: true, role: true, bio: true, location: true,
        avatarUrl: true, verified: true, responseTime: true, completionRate: true,
        createdAt: true, isActive: true,
        badges: { select: { badge: true, awardedAt: true } },
        skills: { select: { skill: true } },
        _count: {
          select: { guidedSessions: true, bookingsAsLearner: true, reviewsGiven: true },
        },
      },
    })
    if (!user) throw new NotFoundError('User')
    success(res, user)
  } catch (err) {
    next(err)
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError()
    const { currentPassword, newPassword } = req.body as ChangePasswordInput

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } })
    if (!user) throw new NotFoundError('User')

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValid) throw new BadRequestError('Current password is incorrect')

    const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS)
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })
    await prisma.refreshToken.updateMany({ where: { userId: user.id }, data: { isRevoked: true } })

    res.clearCookie('refreshToken')
    success(res, null, 'Password changed successfully')
  } catch (err) {
    next(err)
  }
}
