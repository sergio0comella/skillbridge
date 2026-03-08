import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  role: z.enum(['LEARNER', 'GUIDE', 'DUAL']).default('LEARNER'),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1).optional(),  // can also come from httpOnly cookie
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RefreshInput = z.infer<typeof refreshSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
