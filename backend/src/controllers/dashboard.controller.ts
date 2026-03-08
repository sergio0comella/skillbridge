import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { success } from '../utils/response'
import { UnauthorizedError } from '../middleware/error'

export async function getLearnerDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError()
    const userId = req.user.userId

    const [
      upcomingBookings,
      completedBookings,
      stats,
      recentActivity,
      skillPaths,
    ] = await Promise.all([
      prisma.booking.findMany({
        where: { learnerId: userId, status: { in: ['CONFIRMED', 'PENDING'] } },
        include: {
          session: {
            include: {
              guide: { select: { id: true, name: true, avatarUrl: true, verified: true } },
              category: true,
            },
          },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
      }),

      prisma.booking.findMany({
        where: { learnerId: userId, status: 'COMPLETED' },
        include: {
          session: { include: { category: true, guide: { select: { id: true, name: true, avatarUrl: true } } } },
          review: true,
        },
        orderBy: { completedAt: 'desc' },
        take: 10,
      }),

      prisma.booking.aggregate({
        where: { learnerId: userId },
        _count: { id: true },
      }),

      prisma.notification.findMany({
        where: { userId, isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      prisma.userSkillPath.findMany({
        where: { userId },
        include: {
          skillPath: {
            include: {
              sessions: {
                include: { session: { include: { category: true } } },
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      }),
    ])

    const categoriesLearned = await prisma.booking.findMany({
      where: { learnerId: userId, status: 'COMPLETED' },
      include: { session: { include: { category: true } } },
      distinct: ['sessionId'],
    })

    const uniqueCategories = new Set(categoriesLearned.map(b => b.session.category.slug)).size

    success(res, {
      upcomingBookings,
      completedBookings,
      stats: {
        totalSessions: stats._count.id,
        uniqueSkills: uniqueCategories,
        hoursLearned: completedBookings.reduce((acc, b) => acc + b.session.duration, 0) / 60,
      },
      recentActivity,
      skillPaths,
    })
  } catch (err) {
    next(err)
  }
}

export async function getTeacherDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError()
    const guideId = req.user.userId

    const [
      mySessions,
      upcomingBookings,
      totalEarned,
      pendingBalance,
      monthlyStats,
      recentReviews,
    ] = await Promise.all([
      prisma.session.findMany({
        where: { guideId, isActive: true },
        include: {
          category: true,
          guide: { select: { id: true, name: true, avatarUrl: true, verified: true, role: true, bio: true, location: true, responseTime: true, completionRate: true, createdAt: true } },
          tags: true,
          steps: { orderBy: { order: 'asc' } },
          materials: true,
          _count: { select: { bookings: { where: { status: 'COMPLETED' } }, reviews: true } },
        },
        orderBy: { totalBooked: 'desc' },
        take: 10,
      }),

      prisma.booking.findMany({
        where: { session: { guideId }, status: { in: ['CONFIRMED', 'PENDING'] } },
        include: {
          learner: { select: { id: true, name: true, avatarUrl: true } },
          session: { select: { id: true, title: true, duration: true } },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 10,
      }),

      prisma.earning.aggregate({
        where: { guideId, paidOut: true },
        _sum: { amount: true },
      }),

      prisma.earning.aggregate({
        where: { guideId, paidOut: false },
        _sum: { amount: true },
      }),

      prisma.$queryRaw<{ month: string; amount: number; sessions: number }[]>`
        SELECT
          TO_CHAR(e.created_at, 'Mon') as month,
          SUM(e.amount)::float as amount,
          COUNT(*)::int as sessions
        FROM earnings e
        WHERE e.guide_id = ${guideId}
          AND e.created_at >= NOW() - INTERVAL '7 months'
        GROUP BY TO_CHAR(e.created_at, 'Mon'), DATE_TRUNC('month', e.created_at)
        ORDER BY DATE_TRUNC('month', e.created_at) ASC
      `,

      prisma.review.findMany({
        where: { guideId },
        include: { learner: { select: { name: true, avatarUrl: true } }, session: { select: { title: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

    const avgRating = await prisma.review.aggregate({
      where: { guideId },
      _avg: { rating: true },
      _count: { id: true },
    })

    const completionRate = await prisma.booking.groupBy({
      by: ['status'],
      where: { session: { guideId } },
      _count: true,
    })
    const total = completionRate.reduce((a, b) => a + b._count, 0)
    const completed = completionRate.find(s => s.status === 'COMPLETED')?._count ?? 0

    success(res, {
      sessions: mySessions,
      upcomingBookings,
      earnings: {
        totalPaidOut: Number(totalEarned._sum.amount ?? 0),
        pendingBalance: Number(pendingBalance._sum.amount ?? 0),
        monthly: monthlyStats,
      },
      analytics: {
        averageRating: avgRating._avg.rating ?? 0,
        totalReviews: avgRating._count.id,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 100,
        totalSessions: total,
      },
      recentReviews,
    })
  } catch (err) {
    next(err)
  }
}

export async function getTemplates(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const templates = await prisma.template.findMany({
      include: { steps: { orderBy: { order: 'asc' } } },
    })
    success(res, templates)
  } catch (err) {
    next(err)
  }
}

export async function getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError()
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    await prisma.notification.updateMany({
      where: { userId: req.user.userId, isRead: false },
      data: { isRead: true },
    })
    success(res, notifications)
  } catch (err) {
    next(err)
  }
}
