import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Clock, BookOpen, TrendingUp, Star, CheckCircle, Wifi, ChevronRight, Play, Target, Loader2 } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { SessionCard } from '../components/cards/SessionCard'
import { dashboardApi } from '../lib/services'
import { mapApiBooking } from '../lib/mappers'
import { useAuth } from '../context/AuthContext'
import type { Booking, Session } from '../types'
import clsx from 'clsx'

export function LearnerDashboard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'paths'>('upcoming')
  const [loading, setLoading] = useState(true)
  const [dashData, setDashData] = useState<{
    upcomingBookings: Booking[]
    completedBookings: Booking[]
    recommendedSessions: Session[]
    stats: { totalSessions: number; uniqueSkills: number; hoursLearned: number }
  } | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) { navigate('/', { replace: true }); return }
    dashboardApi.learner().then(res => {
      const d = res.data
      setDashData({
        upcomingBookings: d.upcomingBookings.map((b: any) => mapApiBooking(b)),
        completedBookings: d.completedBookings.map((b: any) => mapApiBooking(b)),
        recommendedSessions: [],
        stats: d.stats,
      })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [authLoading, isAuthenticated])

  const upcomingBookings = dashData?.upcomingBookings ?? []
  const completedBookings = dashData?.completedBookings ?? []
  const stats = dashData?.stats

  const statCards = [
    { label: 'Sessions completed', value: String(stats?.totalSessions ?? 0), icon: <CheckCircle size={18} className="text-sage-500" />, change: '' },
    { label: 'Skills explored', value: String(stats?.uniqueSkills ?? 0), icon: <Target size={18} className="text-brand-500" />, change: 'categories' },
    { label: 'Hours learning', value: `${Math.round(stats?.hoursLearned ?? 0)}h`, icon: <Clock size={18} className="text-amber-500" />, change: '' },
    { label: 'Avg. outcome score', value: '4.9', icon: <Star size={18} className="rating-star" />, change: 'Based on 12 reviews' },
  ]

  if (authLoading || loading) return <Layout><div className="flex items-center justify-center py-40"><Loader2 size={32} className="animate-spin text-brand-500" /></div></Layout>

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">My Learning</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">Track your sessions and skill progress</p>
          </div>
          <Link to="/discover" className="btn-primary">
            Find sessions <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <div key={i} className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                {stat.icon}
                <span className="text-xs text-[var(--text-muted)]">{stat.label}</span>
              </div>
              <p className="font-display font-bold text-2xl text-[var(--text-primary)] mb-0.5">{stat.value}</p>
              <p className="text-xs text-[var(--text-muted)]">{stat.change}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex gap-1 p-1 rounded-2xl bg-[var(--bg-muted)] mb-5 w-fit">
              {(['upcoming', 'history', 'paths'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx('px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize', {
                    'bg-[var(--bg)] text-[var(--text-primary)] shadow-soft-sm': activeTab === tab,
                    'text-[var(--text-muted)] hover:text-[var(--text-secondary)]': activeTab !== tab,
                  })}
                >
                  {tab === 'upcoming' ? 'Upcoming' : tab === 'history' ? 'History' : 'Skill Paths'}
                  {tab === 'upcoming' && upcomingBookings.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-brand-500 text-white text-xs">
                      {upcomingBookings.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'upcoming' && (
              <div className="space-y-4">
                {upcomingBookings.length === 0 ? (
                  <EmptyState
                    icon="📅"
                    title="No upcoming sessions"
                    description="Browse sessions and book your next learning session."
                    cta="Discover sessions"
                    ctaLink="/discover"
                  />
                ) : (
                  upcomingBookings.map(booking => (
                    <UpcomingBookingCard key={booking.id} booking={booking} />
                  ))
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                {completedBookings.map(booking => (
                  <CompletedBookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}

            {activeTab === 'paths' && (
              <div className="space-y-4">
                <div className="text-center py-16 text-[var(--text-muted)]">
                  <div className="text-4xl mb-3">🛤️</div>
                  <p className="font-medium text-[var(--text-secondary)]">Skill paths coming soon</p>
                  <p className="text-sm mt-1">Curated learning journeys across multiple sessions</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-display font-semibold text-[var(--text-primary)] mb-4">Recommended for you</h3>
              <div className="space-y-3">
                {(dashData?.recommendedSessions ?? []).map(s => (
                  <SessionCard key={s.id} session={s} compact />
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-4">Learning streak</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-2xl">
                  🔥
                </div>
                <div>
                  <p className="font-display font-bold text-2xl text-[var(--text-primary)]">4 weeks</p>
                  <p className="text-xs text-[var(--text-muted)]">Current streak</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className={clsx('flex-1 h-8 rounded-lg', i < 5 ? 'bg-brand-500' : 'bg-[var(--bg-muted)]')}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <span key={i} className="text-xs text-[var(--text-muted)] flex-1 text-center">{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function UpcomingBookingCard({ booking }: { booking: import('../types').Booking }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ backgroundColor: `${booking.session.category.color}18` }}>
            {booking.session.category.icon}
          </div>
          <div>
            <h4 className="font-semibold text-sm text-[var(--text-primary)] leading-snug">{booking.session.title}</h4>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">with {booking.session.guide.name}</p>
          </div>
        </div>
        <span className="badge bg-sage-50 text-sage-700 text-xs">Confirmed</span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <Calendar size={13} />
          {booking.date} · {booking.time}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <Clock size={13} />
          {booking.session.duration} min
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <Wifi size={13} />
          Remote
        </div>
      </div>

      {booking.notes && (
        <div className="px-3 py-2 rounded-xl bg-[var(--bg-muted)] text-xs text-[var(--text-secondary)] mb-4">
          <span className="font-medium">Your note:</span> {booking.notes}
        </div>
      )}

      <div className="flex gap-2">
        {booking.meetingLink && (
          <a href={booking.meetingLink} className="btn-primary flex-1 justify-center text-sm py-2.5">
            <Play size={14} /> Join session
          </a>
        )}
        <button className="btn-outline text-sm py-2.5 px-4">
          Reschedule
        </button>
      </div>
    </div>
  )
}

function CompletedBookingCard({ booking }: { booking: import('../types').Booking }) {
  const [showRecap, setShowRecap] = useState(false)

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ backgroundColor: `${booking.session.category.color}18` }}>
            {booking.session.category.icon}
          </div>
          <div>
            <h4 className="font-semibold text-sm text-[var(--text-primary)] leading-snug">{booking.session.title}</h4>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">with {booking.session.guide.name} · {booking.date}</p>
          </div>
        </div>
        <span className="badge-neutral text-xs">Completed</span>
      </div>

      {booking.recap && (
        <div>
          <button
            className="flex items-center gap-1.5 text-xs font-medium text-brand-500 hover:text-brand-600 mb-2"
            onClick={() => setShowRecap(s => !s)}
          >
            <BookOpen size={13} />
            {showRecap ? 'Hide' : 'View'} session recap
            <ChevronRight size={12} className={clsx('transition-transform', showRecap && 'rotate-90')} />
          </button>

          {showRecap && (
            <div className="px-4 py-3 rounded-xl bg-brand-50 dark:bg-brand-950 text-xs text-[var(--text-secondary)] leading-relaxed">
              {booking.recap}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mt-3">
        <Link to={`/session/${booking.sessionId}`} className="btn-ghost text-xs py-1.5">
          <TrendingUp size={13} /> Book again
        </Link>
        <button className="btn-ghost text-xs py-1.5">
          <Star size={13} /> Leave review
        </button>
      </div>
    </div>
  )
}

function EmptyState({ icon, title, description, cta, ctaLink }: {
  icon: string
  title: string
  description: string
  cta: string
  ctaLink: string
}) {
  return (
    <div className="text-center py-14 card">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-xs mx-auto">{description}</p>
      <Link to={ctaLink} className="btn-primary">{cta}</Link>
    </div>
  )
}