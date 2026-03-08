import { Router } from 'express'
import * as sessions from '../controllers/sessions.controller'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { updateUserSchema, paginationSchema } from '../schemas/common.schema'

const router = Router()

router.get('/:id', sessions.getUser)
router.put('/me', authenticate, validate(updateUserSchema), sessions.updateUser)
router.get('/:id/sessions', validate(paginationSchema, 'query'), sessions.getGuideSessions)

export default router
