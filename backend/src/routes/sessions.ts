import { Router } from 'express'
import * as sessions from '../controllers/sessions.controller'
import { validate } from '../middleware/validate'
import { authenticate, optionalAuth } from '../middleware/auth'
import { createSessionSchema, updateSessionSchema, sessionQuerySchema } from '../schemas/session.schema'
import { createReviewSchema, paginationSchema } from '../schemas/common.schema'
import * as bookings from '../controllers/bookings.controller'

const router = Router()

router.get('/', optionalAuth, validate(sessionQuerySchema, 'query'), sessions.getSessions)
router.post('/', authenticate, validate(createSessionSchema), sessions.createSession)
router.get('/categories', sessions.getCategories)

router.get('/:id', optionalAuth, sessions.getSession)
router.put('/:id', authenticate, validate(updateSessionSchema), sessions.updateSession)
router.delete('/:id', authenticate, sessions.deleteSession)

router.get('/:id/reviews', validate(paginationSchema, 'query'), bookings.getSessionReviews)
router.post('/reviews', authenticate, validate(createReviewSchema), bookings.createReview)

export default router
