// Types that match the backend API responses exactly
// The frontend types/index.ts has the UI-facing types (slightly different naming)

export interface ApiUser {
  id: string
  email?: string
  name: string
  role: 'LEARNER' | 'GUIDE' | 'DUAL' | 'ADMIN'
  bio?: string
  location?: string
  avatarUrl?: string
  verified: boolean
  responseTime?: string
  completionRate: number
  createdAt: string
  isActive?: boolean
  badges?: { badge: string; awardedAt: string }[]
  skills?: { skill: string }[]
  _count?: {
    guidedSessions?: number
    bookingsAsLearner?: number
    reviewsGiven?: number
    reviewsReceived?: number
  }
}

export interface ApiCategory {
  id: string
  slug: string
  label: string
  icon: string
  color: string
  count?: number
  _count?: { sessions: number }
}

export interface ApiSession {
  id: string
  title: string
  outcome: string
  duration: number
  price: string // Decimal comes as string from Prisma
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  template: 'SKILL_BREAKDOWN' | 'QUICK_START' | 'PRACTICAL_DRILL' | 'CONCEPT_TO_ACTION'
  remote: boolean
  local: boolean
  featured: boolean
  trending: boolean
  isActive: boolean
  totalBooked: number
  averageRating: number
  reviewCount: number
  takeaway: string
  followUpExercise: string
  nextAvailable?: string
  createdAt: string
  updatedAt: string
  categoryId: string
  category: ApiCategory
  guideId: string
  guide: ApiUser
  steps: ApiSessionStep[]
  materials: { id: string; label: string }[]
  tags: { id: string; tag: string }[]
  reviews?: ApiReview[]
}

export interface ApiSessionStep {
  id: string
  order: number
  title: string
  duration: number
  description: string
}

export interface ApiBooking {
  id: string
  sessionId: string
  session: ApiSession
  learnerId: string
  learner?: ApiUser
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'
  scheduledAt: string
  completedAt?: string
  cancelledAt?: string
  meetingLink?: string
  notes?: string
  recap?: string
  createdAt: string
  updatedAt: string
  payment?: { status: string; amount: string }
  review?: ApiReview
}

export interface ApiReview {
  id: string
  sessionId: string
  learnerId: string
  guideId: string
  bookingId: string
  rating: number
  outcomeAchieved: boolean
  comment: string
  helpfulCount: number
  isPublished: boolean
  createdAt: string
  learner?: Pick<ApiUser, 'id' | 'name' | 'avatarUrl'>
  session?: Pick<ApiSession, 'id' | 'title'>
}

export interface ApiNotification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  data?: unknown
  isRead: boolean
  createdAt: string
}

// Re-export UI types from main types file for convenience
export type { User, Session, Booking, Review, Category, Template } from './index'
