import { api, type ApiResponse, type PaginatedResponse } from './api'
import type { ApiUser, ApiSession, ApiBooking, ApiCategory, ApiReview, ApiNotification } from '../types/api'
import type { Template } from '../types'

// ── AUTH ──────────────────────────────────────────────────────────────────────
export interface RegisterPayload { email: string; password: string; name: string; role?: 'LEARNER' | 'GUIDE' | 'DUAL' }
export interface LoginPayload { email: string; password: string }
export interface AuthData { user: ApiUser; accessToken: string }

export const authApi = {
  register: (data: RegisterPayload) =>
    api.post<ApiResponse<AuthData>>('/auth/register', data),
  login: (data: LoginPayload) =>
    api.post<ApiResponse<AuthData>>('/auth/login', data),
  logout: () => api.post<ApiResponse<null>>('/auth/logout'),
  me: () => api.get<ApiResponse<ApiUser>>('/auth/me'),
  refresh: () => api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<ApiResponse<null>>('/auth/change-password', data),
}

// ── SESSIONS ──────────────────────────────────────────────────────────────────
export interface SessionQuery {
  page?: number
  limit?: number
  category?: string
  level?: string
  format?: string
  minPrice?: number
  maxPrice?: number
  sort?: 'POPULAR' | 'RATING' | 'PRICE_ASC' | 'PRICE_DESC' | 'NEWEST'
  q?: string
  featured?: boolean
  trending?: boolean
}

export const sessionsApi = {
  list: (query?: SessionQuery) => {
    const params = new URLSearchParams()
    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params.set(k, String(v))
      })
    }
    const qs = params.toString()
    return api.get<PaginatedResponse<ApiSession>>(`/sessions${qs ? `?${qs}` : ''}`)
  },
  get: (id: string) => api.get<ApiResponse<ApiSession>>(`/sessions/${id}`),
  create: (data: unknown) => api.post<ApiResponse<ApiSession>>('/sessions', data),
  update: (id: string, data: unknown) => api.put<ApiResponse<ApiSession>>(`/sessions/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/sessions/${id}`),
  categories: () => api.get<ApiResponse<ApiCategory[]>>('/sessions/categories'),
  reviews: (sessionId: string, page = 1) =>
    api.get<PaginatedResponse<ApiReview>>(`/sessions/${sessionId}/reviews?page=${page}`),
}

// ── BOOKINGS ──────────────────────────────────────────────────────────────────
export const bookingsApi = {
  create: (data: { sessionId: string; scheduledAt: string; notes?: string }) =>
    api.post<ApiResponse<ApiBooking>>('/bookings', data),
  mine: (params?: { status?: string; page?: number }) => {
    const qs = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
    return api.get<PaginatedResponse<ApiBooking>>(`/bookings/mine${qs}`)
  },
  guideBookings: (params?: { status?: string; page?: number }) => {
    const qs = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
    return api.get<PaginatedResponse<ApiBooking>>(`/bookings/guide${qs}`)
  },
  cancel: (id: string) => api.delete<ApiResponse<ApiBooking>>(`/bookings/${id}`),
  review: (data: { bookingId: string; rating: number; outcomeAchieved: boolean; comment: string }) =>
    api.post<ApiResponse<ApiReview>>('/bookings/reviews', data),
}

// ── PAYMENTS ──────────────────────────────────────────────────────────────────
export const paymentsApi = {
  createIntent: (bookingId: string) =>
    api.post<ApiResponse<{ clientSecret: string; paymentIntentId: string; amount: number; currency: string }>>('/payments/intent', { bookingId }),
  earnings: () => api.get<ApiResponse<{
    recentEarnings: unknown[]
    totalPaidOut: number
    pendingBalance: number
    monthlyBreakdown: { month: string; amount: number; sessions: number }[]
  }>>('/payments/earnings'),
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  learner: () => api.get<ApiResponse<{
    upcomingBookings: ApiBooking[]
    completedBookings: ApiBooking[]
    stats: { totalSessions: number; uniqueSkills: number; hoursLearned: number }
    recentActivity: unknown[]
    skillPaths: unknown[]
  }>>('/dashboard/learner'),
  teacher: () => api.get<ApiResponse<{
    sessions: ApiSession[]
    upcomingBookings: ApiBooking[]
    earnings: { totalPaidOut: number; pendingBalance: number; monthly: { month: string; amount: number; sessions: number }[] }
    analytics: { averageRating: number; totalReviews: number; completionRate: number; totalSessions: number }
    recentReviews: ApiReview[]
  }>>('/dashboard/teacher'),
  templates: () => api.get<ApiResponse<Template[]>>('/dashboard/templates'),
  notifications: () => api.get<ApiResponse<ApiNotification[]>>('/dashboard/notifications'),
}

// ── USERS ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  get: (id: string) => api.get<ApiResponse<ApiUser>>(`/users/${id}`),
  updateMe: (data: Partial<ApiUser> & { skills?: string[]; availability?: string[] }) =>
    api.put<ApiResponse<ApiUser>>('/users/me', data),
  sessions: (id: string, page = 1) =>
    api.get<PaginatedResponse<ApiSession>>(`/users/${id}/sessions?page=${page}`),
}
