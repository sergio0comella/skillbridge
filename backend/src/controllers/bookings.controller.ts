import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { success, paginated } from '../utils/response'
import { NotFoundError, ForbiddenError, UnauthorizedError, BadRequestError } from '../middleware/error'
import type { CreateBookingInput, CreateReviewInput } from '../schemas/common.schema'
import { v4 as uuidv4 } from 'uuid'

export async function createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError()
    const { sessionId, scheduledAt, notes } = req.body as CreateBookingInput

    const session = await prisma.session.findUnique({ where: { id: sessionId, isActive: true } })
    if (!session) throw new NotFoundError('Session')
    if (session.guideId === req.user.userId) throw new BadRequestError('You cannot book your own session')

    const existing = await prisma.booking.findFirst({
      where: {
        sessionId,
        learnerId: req.user.userId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        scheduledAt: new Date(scheduledAt),
      },
    })
    if (existing) throw new BadRequestError('You already have a booking for this session at this time')

    const booking = await prisma.booking.create({
      data: {
        sessionId,
        learnerId: req.user.userId,
        scheduledAt: new Date(scheduledAt),
        notes,
        meetingLink: `https://meet.skillbridge.app/${uuidv4().slice(0, 8)}`,
        status: 'PENDING',
      },
      include: {
        session: {
          include: {
            guide: { select: { id: true, name: true, email: true, avatarUrl: true } },
            category: true,
          },
        },
      },
    })

    await prisma.notification.create({
      data: {
        userId: session.guideId,
        type: 'NEW_BOOKING',
        title: 'New booking request',
        message: `${req.user.email} booked "${session.title}"`,
        data: { bookingId: booking.id },
      },
    })

    success(res, booking, 'Booking created', 201)
  } catch (err) {
    next(err)
  }
}

export async function getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError()
    const { status, page = 1, limit = 10 } = req.query as { status?: string; page?: number; limit?: number }
    const skip = (+page - 1) * +limit

    const where: Record<string, unknown> = { learnerId: req.user.userId }
    if (status) where['status'] = status.toUpperCase()

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          session: {
            include: {
              guide: { select: { id: true, name: true, avatarUrl: true, verified: true } },
              category: true,
            },
          },
          payment: { select: { status: true, amount: true } },
        },
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: +limit,
      }),
      prisma.booking.count({ where }),
    ])

    paginated(res, bookings, { page: +page, limit: +limit, total })
  } catch (err) {
    next(err)
  }
}

export async function getGuideBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError()
    const { status, page = 1, limit = 10 } = req.query as { status?: string; page?: number; limit?: number }
    const skip = (+page - 1) * +limit

    const where: Record<string, unknown> = { session: { guideId: req.user.userId } }
    if (status) where['status'] = status.toUpperCase()

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          learner: { select: { id: true, name: true, avatarUrl: true } },
          session: { select: { id: true, title: true, price: true, duration: true } },
          payment: { select: { status: true, amount: true } },
        },
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: +limit,
      }),
      prisma.booking.count({ where }),
    ])

    paginated(res, bookings, { page: +page, limit: +limit, total })
  } catch (err) {
    next(err)
  }
}

export async function cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError()

    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { session: { select: { guideId: true, title: true } } },
    })
    if (!booking) throw new NotFoundError('Booking')

    const isLearner = booking.learnerId === req.user.userId
    const isGuide = booking.session.guideId === req.user.userId
    if (!isLearner && !isGuide) throw new ForbiddenError()

    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      throw new BadRequestError('This booking cannot be cancelled')
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    })

    const notifyUserId = isLearner ? booking.session.guideId : booking.learnerId
    await prisma.notification.create({
      data: {
        userId: notifyUserId,
        type: 'BOOKING_CANCELLED',
        title: 'Booking cancelled',
        message: `Booking for "${booking.session.title}" was cancelled`,
        data: { bookingId: booking.id },
      },
    })

    success(res, updated, 'Booking cancelled')
  } catch (err) {
    next(err)
  }
}

export async function createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError()
    const { bookingId, rating, outcomeAchieved, comment } = req.body as CreateReviewInput

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { session: { select: { id: true, guideId: true } }, review: true },
    })
    if (!booking) throw new NotFoundError('Booking')
    if (booking.learnerId !== req.user.userId) throw new ForbiddenError()
    if (booking.status !== 'COMPLETED') throw new BadRequestError('You can only review completed sessions')
    if (booking.review) throw new BadRequestError('You have already reviewed this session')

    const review = await prisma.review.create({
      data: {
        sessionId: booking.session.id,
        learnerId: req.user.userId,
        guideId: booking.session.guideId,
        bookingId,
        rating,
        outcomeAchieved,
        comment,
      },
    })

    const [reviewStats] = await prisma.$queryRaw<[{ avg: number; count: number }]>`
      SELECT AVG(rating)::float as avg, COUNT(*)::int as count
      FROM reviews WHERE session_id = ${booking.session.id} AND is_published = true
    `
    await prisma.session.update({
      where: { id: booking.session.id },
      data: { averageRating: reviewStats.avg, reviewCount: reviewStats.count },
    })

    success(res, review, 'Review submitted', 201)
  } catch (err) {
    next(err)
  }
}

export async function getSessionReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = 1, limit = 10 } = req.query as { page?: number; limit?: number }
    const skip = (+page - 1) * +limit

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { sessionId: req.params.id, isPublished: true },
        include: { learner: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: +limit,
      }),
      prisma.review.count({ where: { sessionId: req.params.id, isPublished: true } }),
    ])

    paginated(res, reviews, { page: +page, limit: +limit, total })
  } catch (err) {
    next(err)
  }
}
