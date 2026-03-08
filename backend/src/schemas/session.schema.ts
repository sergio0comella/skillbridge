import { z } from 'zod'

export const createSessionSchema = z.object({
  title: z.string().min(10).max(100),
  outcome: z.string().min(20).max(500),
  duration: z.number().int().min(15).max(120),
  price: z.number().positive().max(500),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  template: z.enum(['SKILL_BREAKDOWN', 'QUICK_START', 'PRACTICAL_DRILL', 'CONCEPT_TO_ACTION']),
  remote: z.boolean().default(true),
  local: z.boolean().default(false),
  categoryId: z.string().cuid(),
  takeaway: z.string().min(10).max(500),
  followUpExercise: z.string().min(10).max(500),
  steps: z.array(z.object({
    order: z.number().int().min(1),
    title: z.string().min(3).max(100),
    duration: z.number().int().min(1).max(60),
    description: z.string().min(10).max(500),
  })).min(2).max(8),
  materials: z.array(z.string().min(2).max(100)).max(10),
  tags: z.array(z.string().min(1).max(30)).max(8),
})

export const updateSessionSchema = createSessionSchema.partial().omit({ categoryId: true })

export const sessionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  category: z.string().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  format: z.enum(['REMOTE', 'LOCAL', 'ALL']).default('ALL'),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(['POPULAR', 'RATING', 'PRICE_ASC', 'PRICE_DESC', 'NEWEST']).default('POPULAR'),
  q: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  trending: z.coerce.boolean().optional(),
})

export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>
export type SessionQueryInput = z.infer<typeof sessionQuerySchema>
