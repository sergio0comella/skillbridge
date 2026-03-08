export interface User {
  id: string
  name: string
  avatar?: string
  initials: string
  role: 'learner' | 'guide' | 'dual'
  bio?: string
  location?: string
  rating?: number
  reviewCount?: number
  sessionsCompleted?: number
  earnings?: number
  badges?: Badge[]
  skills?: string[]
  joinedDate?: string
  verified?: boolean
  responseTime?: string
  completionRate?: number
}

export interface Badge {
  id: string
  label: string
  color: 'brand' | 'sage' | 'amber' | 'neutral'
  icon: string
}

export interface Session {
  id: string
  title: string
  outcome: string
  duration: number
  price: number
  category: Category
  guide: User
  rating: number
  reviewCount: number
  totalBooked: number
  remote: boolean
  local: boolean
  tags: string[]
  steps: SessionStep[]
  materials: string[]
  takeaway: string
  followUpExercise: string
  template: TemplateType
  nextAvailable?: string
  featured?: boolean
  trending?: boolean
  level: 'beginner' | 'intermediate' | 'advanced'
}

export interface SessionStep {
  order: number
  title: string
  duration: number
  description: string
}

export interface Review {
  id: string
  sessionId: string
  learner: User
  rating: number
  outcomeAchieved: boolean
  comment: string
  date: string
  helpful?: number
}

export interface Booking {
  id: string
  sessionId: string
  session: Session
  learnerId: string
  guideId: string
  date: string
  time: string
  status: 'upcoming' | 'completed' | 'cancelled'
  meetingLink?: string
  notes?: string
  recap?: string
}

export type Category = {
  id: string
  label: string
  icon: string
  color: string
  count?: number
}

export type TemplateType = 'skill-breakdown' | 'quick-start' | 'practical-drill' | 'concept-to-action'

export interface Template {
  id: TemplateType
  title: string
  subtitle: string
  description: string
  color: string
  icon: string
  steps: TemplateStep[]
  bestFor: string[]
  sessionCount: number
}

export interface TemplateStep {
  order: number
  title: string
  description: string
  duration: string
  tip: string
}

export interface EarningsData {
  month: string
  amount: number
  sessions: number
}

export interface SkillPath {
  id: string
  title: string
  description: string
  sessions: number
  completedSessions: number
  nextSession?: Session
  category: Category
}
