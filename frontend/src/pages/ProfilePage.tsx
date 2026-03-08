import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { sessionsApi } from '../lib/services'
import { mapApiUser, mapApiSession } from '../lib/mappers'
import { MapPin, Star, CheckCircle, Edit3, BookOpen, Users, TrendingUp, ChevronRight } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import clsx from 'clsx'

export function ProfilePage() {
  const { user: authUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'about' | 'sessions' | 'reviews'>('about')
  const [guideSessions, setGuideSessions] = useState<any[]>([])

  useEffect(() => {
    if (authUser?.id && (authUser.role === 'GUIDE' || authUser.role === 'DUAL')) {
      sessionsApi.list({ limit: 6 }).then(r => setGuideSessions(r.data.map(mapApiSession))).catch(() => {})
    }
  }, [authUser])

  if (!authUser) return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="font-display font-bold text-2xl text-[var(--text-primary)] mb-2">Sign in to view your profile</h2>
      </div>
    </Layout>
  )

  const user = mapApiUser(authUser)

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-2xl font-bold text-brand-700 dark:text-brand-300">
                {user.initials}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center shadow-brand">
                <Edit3 size={13} className="text-white" />
              </button>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="font-display font-bold text-xl text-[var(--text-primary)]">{user.name}</h1>
                    {user.verified && (
                      <CheckCircle size={18} className="text-sage-500 fill-sage-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {user.location && (
                      <div className="flex items-center gap-1 text-sm text-[var(--text-muted)]">
                        <MapPin size={13} />
                        {user.location}
                      </div>
                    )}
                    <span className="text-[var(--text-muted)]">·</span>
                    <span className="text-sm text-[var(--text-muted)]">
                      {user.role === 'dual' || authUser?.role === 'DUAL' ? 'Learner & Guide' : user.role}
                    </span>
                    <span className="text-[var(--text-muted)]">·</span>
                    <span className="text-sm text-[var(--text-muted)]">Member since {user.joinedDate}</span>
                  </div>
                  {user.bio && (
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-lg">{user.bio}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link to="/settings" className="btn-ghost py-2 px-3 text-sm">
                    ⚙️ Settings
                  </Link>
                  <button className="btn-outline py-2 px-3 text-sm">
                    <Edit3 size={15} /> Edit profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Sessions completed', value: String(authUser?._count?.guidedSessions ?? 0), icon: <BookOpen size={16} className="text-brand-500" /> },
              { label: 'Skills learned', value: '7', icon: <TrendingUp size={16} className="text-sage-500" /> },
              { label: 'Reviews given', value: String(authUser?._count?.reviewsGiven ?? 0), icon: <Star size={16} className="rating-star" /> },
              { label: 'Sessions taught', value: '5', icon: <Users size={16} className="text-amber-500" /> },
            ].map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="flex items-center gap-2 mb-1">
                  {stat.icon}
                  <span className="font-bold text-[var(--text-primary)]">{stat.value}</span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {!user.verified && (
          <div className="card p-4 mb-6 flex items-center gap-4 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-xl flex-shrink-0">
              🔒
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--text-primary)]">Verify your identity</p>
              <p className="text-xs text-[var(--text-secondary)]">Verified guides get 3× more bookings and earn the Trust badge.</p>
            </div>
            <button className="btn-primary text-sm py-2 flex-shrink-0">Verify now</button>
          </div>
        )}

        <div className="flex gap-1 p-1 rounded-2xl bg-[var(--bg-muted)] mb-6 w-fit">
          {(['about', 'sessions', 'reviews'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx('px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize', {
                'bg-[var(--bg)] text-[var(--text-primary)] shadow-soft-sm': activeTab === tab,
                'text-[var(--text-muted)] hover:text-[var(--text-secondary)]': activeTab !== tab,
              })}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'about' && (
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="card p-5">
              <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-3">Skills I teach</h3>
              <div className="flex flex-wrap gap-2">
                {(user.skills || ['Design', 'Figma', 'Prototyping']).map(skill => (
                  <span key={skill} className="badge-brand">{skill}</span>
                ))}
                <button className="badge-neutral">+ Add skill</button>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-3">Badges</h3>
              <div className="space-y-2.5">
                {[
                  { icon: '⭐', label: 'Active Learner', desc: 'Completed 25+ sessions', earned: true },
                  { icon: '🔥', label: '4-Week Streak', desc: 'Consistent weekly learner', earned: true },
                  { icon: '💎', label: 'Top Guide', desc: 'Complete 50+ sessions as guide', earned: false },
                  { icon: '✓', label: 'Verified Identity', desc: 'Submit verification documents', earned: false },
                ].map((badge, i) => (
                  <div key={i} className={clsx('flex items-center gap-3', !badge.earned && 'opacity-40')}>
                    <span className="text-xl">{badge.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{badge.label}</p>
                      <p className="text-xs text-[var(--text-muted)]">{badge.earned ? 'Earned' : badge.desc}</p>
                    </div>
                    {badge.earned && <CheckCircle size={14} className="text-sage-500 ml-auto" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5 sm:col-span-2">
              <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-4">Skill interests</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Finance', icon: '💰', progress: 25 },
                  { label: 'Language', icon: '🌍', progress: 0 },
                  { label: 'Tech', icon: '💻', progress: 50 },
                  { label: 'Creative', icon: '🎨', progress: 80 },
                ].map(item => (
                  <div key={item.label} className="stat-card">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-xs font-medium text-[var(--text-primary)]">{item.label}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${item.progress}%` }} />
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{item.progress}% path complete</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--text-primary)]">My teaching sessions</h3>
              <Link to="/dashboard/teacher" className="text-sm text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1">
                Manage all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {guideSessions.slice(0, 2).map(s => (
                <div key={s.id} className="card-hover p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${s.category.color}18` }}>
                      {s.category.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-[var(--text-primary)] leading-snug">{s.title}</h4>
                      <p className="text-xs text-[var(--text-muted)]">${s.price} · {s.duration} min</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="rating-star" />
                      <span className="text-xs font-semibold text-[var(--text-primary)]">{s.rating}</span>
                      <span className="text-xs text-[var(--text-muted)]">({s.reviewCount})</span>
                    </div>
                    <span className="badge-sage text-xs">Active</span>
                  </div>
                </div>
              ))}
              <div className="card border-dashed flex items-center justify-center p-8 cursor-pointer hover:border-brand-400 transition-colors">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center mx-auto mb-2">
                    <span className="text-brand-500 text-xl font-bold">+</span>
                  </div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Create new session</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {[
              { from: 'Sarah K.', rating: 5, comment: 'Incredibly helpful and structured session. Left with exactly what I came for.', date: '2 days ago' },
              { from: 'Tom B.', rating: 5, comment: 'Great teaching approach. Very patient and clear explanations.', date: '1 week ago' },
            ].map((r, i) => (
              <div key={i} className="card p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-xs font-bold text-brand-700">
                      {r.from.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{r.from}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(r.rating)].map((_, j) => <Star key={j} size={12} className="rating-star" />)}
                    <span className="text-xs text-[var(--text-muted)] ml-1">{r.date}</span>
                  </div>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
