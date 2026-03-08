import type { ApiSession, ApiUser, ApiCategory, ApiBooking } from '../types/api'
import type { Session, User, Category, Booking } from '../types'

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function mapApiUser(u: ApiUser): User {
  return {
    id: u.id,
    name: u.name,
    initials: getInitials(u.name),
    role: u.role.toLowerCase() as 'learner' | 'guide' | 'dual',
    bio: u.bio,
    location: u.location,
    avatar: u.avatarUrl ?? undefined,
    verified: u.verified,
    responseTime: u.responseTime,
    completionRate: u.completionRate,
    joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : undefined,
    badges: u.badges?.map(b => ({
      id: b.badge.toLowerCase(),
      label: b.badge.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      color: badgeColor(b.badge),
      icon: badgeIcon(b.badge),
    })),
    skills: u.skills?.map(s => s.skill),
  }
}

export function mapApiCategory(c: ApiCategory): Category {
  return {
    id: c.slug,
    label: c.label,
    icon: c.icon,
    color: c.color,
    count: c.count ?? c._count?.sessions,
  }
}

export function mapApiSession(s: ApiSession): Session {
  return {
    id: s.id,
    title: s.title,
    outcome: s.outcome,
    duration: s.duration,
    price: Number(s.price),
    category: s.category ? mapApiCategory(s.category) : { id: '', label: '', icon: '📚', color: '#888', count: 0 },
    guide: s.guide ? mapApiUser(s.guide) : { id: s.guideId ?? '', name: 'Guide', initials: 'G', role: 'guide' },
    rating: s.averageRating,
    reviewCount: s.reviewCount,
    totalBooked: s.totalBooked,
    remote: s.remote,
    local: s.local,
    tags: (s.tags ?? []).map(t => t.tag),
    steps: (s.steps ?? []).map(step => ({
      order: step.order,
      title: step.title,
      duration: step.duration,
      description: step.description,
    })),
    materials: (s.materials ?? []).map(m => m.label),
    takeaway: s.takeaway,
    followUpExercise: s.followUpExercise,
    template: mapTemplate(s.template),
    nextAvailable: s.nextAvailable,
    featured: s.featured,
    trending: s.trending,
    level: (s.level ?? 'BEGINNER').toLowerCase() as 'beginner' | 'intermediate' | 'advanced',
  }
}

export function mapApiBooking(b: ApiBooking): Booking {
  const d = new Date(b.scheduledAt)
  const fallbackSession: Session = {
    id: b.sessionId, title: 'Session', duration: 45, price: 0,
    outcome: '', takeaway: '', followUpExercise: '', nextAvailable: undefined,
    featured: false, trending: false, template: 'skill-breakdown',
    remote: true, local: false, level: 'beginner',
    rating: 0, reviewCount: 0, totalBooked: 0,
    tags: [], steps: [], materials: [],
    category: { id: '', label: '', icon: '📚', color: '#888' },
    guide: { id: '', name: '', initials: '', role: 'guide' },
  }
  return {
    id: b.id,
    sessionId: b.sessionId,
    session: b.session ? mapApiSession(b.session) : fallbackSession,
    learnerId: b.learnerId,
    guideId: b.session?.guideId,
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    status: mapBookingStatus(b.status),
    meetingLink: b.meetingLink,
    notes: b.notes,
    recap: b.recap,
  }
}

function mapBookingStatus(s: string): 'upcoming' | 'completed' | 'cancelled' {
  if (s === 'COMPLETED') return 'completed'
  if (s === 'CANCELLED' || s === 'REFUNDED') return 'cancelled'
  return 'upcoming'
}

function mapTemplate(t: string): import('../types').TemplateType {
  const map: Record<string, import('../types').TemplateType> = {
    SKILL_BREAKDOWN: 'skill-breakdown',
    QUICK_START: 'quick-start',
    PRACTICAL_DRILL: 'practical-drill',
    CONCEPT_TO_ACTION: 'concept-to-action',
  }
  return map[t] ?? 'skill-breakdown'
}

function badgeColor(badge: string): 'brand' | 'sage' | 'amber' | 'neutral' {
  if (badge === 'TOP_GUIDE') return 'brand'
  if (badge === 'VERIFIED') return 'sage'
  if (badge === 'RISING_STAR' || badge === 'PERFECT_SCORE') return 'amber'
  return 'neutral'
}

function badgeIcon(badge: string): string {
  const icons: Record<string, string> = {
    TOP_GUIDE: '⭐',
    RISING_STAR: '🌟',
    VERIFIED: '✓',
    PERFECT_SCORE: '💯',
    FOUNDER: '🏆',
    ACTIVE_LEARNER: '📚',
    STREAK: '🔥',
  }
  return icons[badge] ?? '🏅'
}
