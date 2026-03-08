import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { redis, RedisKeys } from '../config/redis'
import { success, paginated } from '../utils/response'
import { NotFoundError, ForbiddenError, UnauthorizedError } from '../middleware/error'
import type { UpdateUserInput } from '../schemas/common.schema'
import type { SessionQueryInput } from '../schemas/session.schema'

const SESSION_INCLUDE = {
  category: true,
  guide: {
    select: {
      id: true, name: true, role: true, avatarUrl: true, verified: true,
      location: true, responseTime: true, completionRate: true,
      badges: { select: { badge: true } },
      _count: { select: { guidedSessions: true } },
    },
  },
  steps: { orderBy: { order: 'asc' as const } },
  materials: true,
  tags: true,
} as const

export async function getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = req.query as unknown as SessionQueryInput
    const { page, limit, category, level, format, minPrice, maxPrice, sort, q, featured, trending } = query

    const where: Record<string, unknown> = { isActive: true }
    if (category) where['category'] = { slug: category }
    if (level) where['level'] = level
    if (format === 'REMOTE') where['remote'] = true
    if (format === 'LOCAL') where['local'] = true
    if (minPrice !== undefined || maxPrice !== undefined) {
      where['price'] = {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      }
    }
    if (featured !== undefined) where['featured'] = featured
    if (trending !== undefined) where['trending'] = trending
    if (q) {
      where['OR'] = [
        { title: { contains: q, mode: 'insensitive' } },
        { outcome: { contains: q, mode: 'insensitive' } },
        { tags: { some: { tag: { contains: q, mode: 'insensitive' } } } },
        { guide: { name: { contains: q, mode: 'insensitive' } } },
      ]
    }

    const orderBy =
      sort === 'RATING' ? { averageRating: 'desc' as const } :
      sort === 'PRICE_ASC' ? { price: 'asc' as const } :
      sort === 'PRICE_DESC' ? { price: 'desc' as const } :
      sort === 'NEWEST' ? { createdAt: 'desc' as const } :
      { totalBooked: 'desc' as const }

    const skip = (page - 1) * limit
    const [sessions, total] = await Promise.all([
      prisma.session.findMany({ where, include: SESSION_INCLUDE, orderBy, skip, take: limit }),
      prisma.session.count({ where }),
    ])

    paginated(res, sessions, { page, limit, total })
  } catch (err) {
    next(err)
  }
}

export async function getSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cached = await redis.get(RedisKeys.sessionCache(req.params.id))
    if (cached) { success(res, JSON.parse(cached)); return }

    const session = await prisma.session.findUnique({
      where: { id: req.params.id, isActive: true },
      include: {
        ...SESSION_INCLUDE,
        reviews: {
          where: { isPublished: true },
          include: { learner: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })
    if (!session) throw new NotFoundError('Session')

    await redis.setex(RedisKeys.sessionCache(req.params.id), 300, JSON.stringify(session))
    success(res, session)
  } catch (err) {
    next(err)
  }
}

export async function createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError()
    const { steps, materials, tags, categoryId, price, ...rest } = req.body

    const session = await prisma.session.create({
      data: {
        ...rest,
        price,
        categoryId,
        guideId: req.user.userId,
        steps: { create: steps },
        materials: { create: materials.map((label: string) => ({ label })) },
        tags: { create: tags.map((tag: string) => ({ tag })) },
      },
      include: SESSION_INCLUDE,
    })

    success(res, session, 'Session created', 201)
  } catch (err) {
    next(err)
  }
}

export async function updateSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError()

    const session = await prisma.session.findUnique({ where: { id: req.params.id } })
    if (!session) throw new NotFoundError('Session')
    if (session.guideId !== req.user.userId) throw new ForbiddenError()

    const { steps, materials, tags, price, ...rest } = req.body

    await prisma.$transaction([
      ...(steps ? [
        prisma.sessionStep.deleteMany({ where: { sessionId: session.id } }),
        prisma.sessionStep.createMany({ data: steps.map((s: Record<string, unknown>) => ({ ...s, sessionId: session.id })) }),
      ] : []),
      ...(materials ? [
        prisma.sessionMaterial.deleteMany({ where: { sessionId: session.id } }),
        prisma.sessionMaterial.createMany({ data: materials.map((label: string) => ({ label, sessionId: session.id })) }),
      ] : []),
      ...(tags ? [
        prisma.sessionTag.deleteMany({ where: { sessionId: session.id } }),
        prisma.sessionTag.createMany({ data: tags.map((tag: string) => ({ tag, sessionId: session.id })) }),
      ] : []),
      prisma.session.update({
        where: { id: session.id },
        data: { ...rest, ...(price !== undefined && { price }) },
      }),
    ])

    await redis.del(RedisKeys.sessionCache(session.id))
    const updated = await prisma.session.findUnique({ where: { id: session.id }, include: SESSION_INCLUDE })
    success(res, updated, 'Session updated')
  } catch (err) {
    next(err)
  }
}

export async function deleteSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError()

    const session = await prisma.session.findUnique({ where: { id: req.params.id } })
    if (!session) throw new NotFoundError('Session')
    if (session.guideId !== req.user.userId) throw new ForbiddenError()

    await prisma.session.update({ where: { id: req.params.id }, data: { isActive: false } })
    await redis.del(RedisKeys.sessionCache(req.params.id))
    success(res, null, 'Session deactivated')
  } catch (err) {
    next(err)
  }
}

export async function getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { sessions: { where: { isActive: true } } } } },
    })
    const withCount = categories.map(c => ({ ...c, count: c._count.sessions }))
    success(res, withCount)
  } catch (err) {
    next(err)
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id, isActive: true },
      select: {
        id: true, name: true, role: true, bio: true, location: true, avatarUrl: true,
        verified: true, responseTime: true, completionRate: true, createdAt: true,
        badges: { select: { badge: true, awardedAt: true } },
        skills: { select: { skill: true } },
        _count: { select: { guidedSessions: { where: { isActive: true } }, reviewsReceived: true } },
      },
    })
    if (!user) throw new NotFoundError('User')
    success(res, user)
  } catch (err) {
    next(err)
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError()
    const { skills, availability, ...rest } = req.body as UpdateUserInput

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...rest,
        ...(skills !== undefined && {
          skills: {
            deleteMany: {},
            create: skills.map(skill => ({ skill })),
          },
        }),
        ...(availability !== undefined && {
          guideAvailability: {
            upsert: {
              create: { slots: availability },
              update: { slots: availability },
            },
          },
        }),
      },
      select: {
        id: true, name: true, role: true, bio: true, location: true,
        avatarUrl: true, verified: true, updatedAt: true,
        skills: true,
      },
    })

    await redis.del(RedisKeys.userCache(req.user.userId))
    success(res, user, 'Profile updated')
  } catch (err) {
    next(err)
  }
}

export async function getGuideSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = 1, limit = 10 } = req.query as { page?: number; limit?: number }
    const skip = (+page - 1) * +limit
    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where: { guideId: req.params.id, isActive: true },
        include: SESSION_INCLUDE,
        orderBy: { totalBooked: 'desc' },
        skip,
        take: +limit,
      }),
      prisma.session.count({ where: { guideId: req.params.id, isActive: true } }),
    ])
    paginated(res, sessions, { page: +page, limit: +limit, total })
  } catch (err) {
    next(err)
  }
}
