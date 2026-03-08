import { Router } from 'express'
import * as bookings from '../controllers/bookings.controller'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { createBookingSchema, createReviewSchema, paginationSchema } from '../schemas/common.schema'

const router = Router()

// Learner routes
router.post('/', authenticate, validate(createBookingSchema), bookings.createBooking)
router.get('/mine', authenticate, validate(paginationSchema, 'query'), bookings.getMyBookings)
router.get('/guide', authenticate, validate(paginationSchema, 'query'), bookings.getGuideBookings)
router.delete('/:id', authenticate, bookings.cancelBooking)

// Reviews
router.post('/reviews', authenticate, validate(createReviewSchema), bookings.createReview)

export default router
