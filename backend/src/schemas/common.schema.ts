import { z } from 'zod'

export const createBookingSchema = z.object({
  sessionId: z.string().cuid(),
  scheduledAt: z.string().datetime(),
  notes: z.string().max(500).optional(),
})

export const createReviewSchema = z.object({
  bookingId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  outcomeAchieved: z.boolean(),
  comment: z.string().min(10).max(1000),
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export const createPaymentIntentSchema = z.object({
  bookingId: z.string().cuid(),
})

export const updateUserSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  role: z.enum(['LEARNER', 'GUIDE', 'DUAL']).optional(),
  skills: z.array(z.string().min(1).max(50)).max(20).optional(),
  availability: z.array(z.string()).optional(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
