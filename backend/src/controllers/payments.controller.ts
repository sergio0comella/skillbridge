import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { stripe } from '../config/stripe'
import { env } from '../config/env'
import { success } from '../utils/response'
import { NotFoundError, UnauthorizedError, BadRequestError } from '../middleware/error'
import type { CreatePaymentIntentInput } from '../schemas/common.schema'
import type Stripe from 'stripe'

export async function createPaymentIntent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError()
    const { bookingId } = req.body as CreatePaymentIntentInput

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { session: { select: { price: true, title: true, guideId: true } }, payment: true },
    })
    if (!booking) throw new NotFoundError('Booking')
    if (booking.learnerId !== req.user.userId) throw new UnauthorizedError()
    if (booking.payment?.status === 'SUCCEEDED') throw new BadRequestError('Booking already paid')

    const amount = Number(booking.session.price)
    const platformFee = Math.round(amount * (env.PLATFORM_FEE_PERCENT / 100) * 100)
    const totalCents = Math.round(amount * 100)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      metadata: {
        bookingId,
        learnerId: req.user.userId,
        guideId: booking.session.guideId,
      },
      application_fee_amount: platformFee,
      description: `SkillBridge: ${booking.session.title}`,
    })

    const guideEarning = (totalCents - platformFee) / 100

    await prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        amount: amount,
        platformFee: platformFee / 100,
        guideEarning,
        currency: 'usd',
        stripePaymentIntentId: paymentIntent.id,
        status: 'PENDING',
      },
      update: {
        stripePaymentIntentId: paymentIntent.id,
        status: 'PENDING',
      },
    })

    success(res, {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalCents,
      currency: 'usd',
    })
  } catch (err) {
    next(err)
  }
}

export async function handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sig = req.headers['stripe-signature'] as string
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) { res.status(400).send('Webhook secret not configured'); return }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret)
    } catch {
      res.status(400).send('Invalid webhook signature')
      return
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent
        const payment = await prisma.payment.findUnique({
          where: { stripePaymentIntentId: pi.id },
          include: { booking: { include: { session: { select: { guideId: true, title: true } } } } },
        })
        if (!payment) break

        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'SUCCEEDED', stripeChargeId: pi.latest_charge as string },
          }),
          prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: 'CONFIRMED' },
          }),
          prisma.earning.create({
            data: {
              guideId: payment.booking.session.guideId,
              paymentId: payment.id,
              amount: payment.guideEarning,
            },
          }),
          prisma.session.update({
            where: { id: payment.booking.sessionId },
            data: { totalBooked: { increment: 1 } },
          }),
        ])

        await prisma.notification.createMany({
          data: [
            {
              userId: payment.booking.learnerId,
              type: 'PAYMENT_CONFIRMED',
              title: 'Booking confirmed',
              message: `Your session "${payment.booking.session.title}" is confirmed!`,
              data: { bookingId: payment.bookingId },
            },
            {
              userId: payment.booking.session.guideId,
              type: 'NEW_PAID_BOOKING',
              title: 'New paid booking',
              message: `Someone booked "${payment.booking.session.title}"`,
              data: { bookingId: payment.bookingId },
            },
          ],
        })
        break
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent
        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: pi.id },
          data: { status: 'FAILED' },
        })
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const payment = await prisma.payment.findFirst({
          where: { stripeChargeId: charge.id },
          include: { booking: true },
        })
        if (!payment) break

        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'REFUNDED', refundedAt: new Date() },
          }),
          prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: 'REFUNDED' },
          }),
          prisma.earning.updateMany({
            where: { paymentId: payment.id },
            data: { paidOut: false },
          }),
        ])
        break
      }
    }

    res.json({ received: true })
  } catch (err) {
    next(err)
  }
}

export async function getEarnings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError()

    const [earnings, total, pending] = await Promise.all([
      prisma.earning.findMany({
        where: { guideId: req.user.userId },
        include: {
          payment: {
            include: { booking: { include: { session: { select: { title: true } }, learner: { select: { name: true } } } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.earning.aggregate({
        where: { guideId: req.user.userId, paidOut: true },
        _sum: { amount: true },
      }),
      prisma.earning.aggregate({
        where: { guideId: req.user.userId, paidOut: false },
        _sum: { amount: true },
      }),
    ])

    const monthlyEarnings = await prisma.$queryRaw<{ month: string; amount: number; sessions: number }[]>`
      SELECT
        TO_CHAR(e.created_at, 'Mon') as month,
        SUM(e.amount)::float as amount,
        COUNT(*)::int as sessions
      FROM earnings e
      WHERE e.guide_id = ${req.user.userId}
        AND e.created_at >= NOW() - INTERVAL '7 months'
      GROUP BY TO_CHAR(e.created_at, 'Mon'), DATE_TRUNC('month', e.created_at)
      ORDER BY DATE_TRUNC('month', e.created_at) ASC
    `

    success(res, {
      recentEarnings: earnings,
      totalPaidOut: Number(total._sum.amount ?? 0),
      pendingBalance: Number(pending._sum.amount ?? 0),
      monthlyBreakdown: monthlyEarnings,
    })
  } catch (err) {
    next(err)
  }
}
