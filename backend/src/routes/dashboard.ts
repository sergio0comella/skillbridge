import { Router } from 'express'
import * as dashboard from '../controllers/dashboard.controller'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/learner', authenticate, dashboard.getLearnerDashboard)
router.get('/teacher', authenticate, dashboard.getTeacherDashboard)
router.get('/templates', dashboard.getTemplates)
router.get('/notifications', authenticate, dashboard.getNotifications)

export default router
