import { Router } from 'express'
import * as payments from '../controllers/payments.controller'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { createPaymentIntentSchema } from '../schemas/common.schema'
import { strictRateLimit } from '../middleware/rateLimit'

const router = Router()

router.post('/intent', authenticate, strictRateLimit, validate(createPaymentIntentSchema), payments.createPaymentIntent)
router.post('/webhook', payments.handleWebhook)
router.get('/earnings', authenticate, payments.getEarnings)

export default router
