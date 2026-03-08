import { Router } from 'express'
import * as auth from '../controllers/auth.controller'
import { validate } from '../middleware/validate'
import { authenticate } from '../middleware/auth'
import { authRateLimit } from '../middleware/rateLimit'
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  changePasswordSchema,
} from '../schemas/auth.schema'

const router = Router()

router.post('/register', authRateLimit, validate(registerSchema), auth.register)
router.post('/login', authRateLimit, validate(loginSchema), auth.login)
router.post('/refresh', validate(refreshSchema), auth.refresh)
router.post('/logout', authenticate, auth.logout)
router.get('/me', authenticate, auth.me)
router.put('/change-password', authenticate, validate(changePasswordSchema), auth.changePassword)

export default router
