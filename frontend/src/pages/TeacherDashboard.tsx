import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp, DollarSign, Users, Star, Plus, ChevronRight, ArrowUpRight, BarChart2, Loader2 } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { dashboardApi } from '../lib/services'
import { mapApiSession } from '../lib/mappers'
import { useAuth } from '../context/AuthContext'
import type { Session } from '../types'
import clsx from 'clsx'

export function TeacherDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'analytics'>('overview')
  const [loading, setLoading] = useState(true)
  const [dashData, setDashData] = useState<any>(null)

  // Redirect if not logged in or not a guide.
  // We intentionally delay the redirect check until auth has fully loaded
  // to avoid a false-negative on first render (accessToken lives in memory
  // and is restored asynchronously via the refresh-cookie flow).
  useEffect(() => {
    if (authLoading) return            // still hydrating – do nothing yet
    if (!isAuthenticated) {
      navigate('/', { replace: true })
      return
    }
    if (user?.role === 'LEARNER') {
      navigate('/dashboard/learner', { replace: true })
      return
    }
  }, [authLoading, isAuthenticated, user?.role, navigate])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated || user?.role === 'LEARNER') return
    dashboardApi.teacher()
      .then(res => setDashData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [authLoading, isAuthenticated, user])

  const mySessions: Session[] = (dashData?.sessions ?? []).map((s: any) => mapApiSession(s))
  const totalEarnings = dashData?.earnings?.totalPaidOut ?? 0
  const monthly: { month: string; amount: number; sessions: number }[] = dashData?.earnings?.monthly ?? []
  const thisMonth = monthly[monthly.length - 1]
  const lastMonth = monthly[monthly.length - 2]
  const growth = thisMonth && lastMonth && lastMonth.amount > 0
    ? Math.round(((thisMonth.amount - lastMonth.amount) / lastMonth.amount) * 100)
    : 0
  const maxAmount = monthly.length > 0 ? Math.max(...monthly.map(d => d.amount)) : 1

  // Show spinner while auth state is being restored (e.g. page refresh)
  if (authLoading || (loading && isAuthenticated)) {
    return <Layout><div className="flex items-center justify-center py-40"><Loader2 size={32} className="animate-spin text-brand-500" /></div></Layout>
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">Guide Dashboard</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              Welcome back, {dashData?.analytics ? "Guide" : "Guide"}
            </p>
          </div>
          <Link to="/templates" className="btn-primary">
            <Plus size={16} /> Create session
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pending payout', value: `$${(dashData?.earnings?.pendingBalance ?? 0).toLocaleString()}`, change: 'Not yet paid out', icon: <DollarSign size={18} className="text-sage-500" />, positive: true },
            { label: 'Total earned', value: `$${totalEarnings.toLocaleString()}`, change: 'All time', icon: <TrendingUp size={18} className="text-brand-500" />, positive: true },
            { label: 'Sessions this month', value: String(thisMonth?.sessions ?? 0), change: `+${(thisMonth?.sessions ?? 0) - (lastMonth?.sessions ?? 0)} vs last month`, icon: <Users size={18} className="text-amber-500" />, positive: true },
            { label: 'Avg. rating', value: '4.92', change: 'From 156 reviews', icon: <Star size={18} className="rating-star" />, positive: true },
          ].map((stat, i) => (
            <div key={i} className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                {stat.icon}
                <span className="text-xs text-[var(--text-muted)]">{stat.label}</span>
              </div>
              <p className="font-display font-bold text-2xl text-[var(--text-primary)] mb-0.5">{stat.value}</p>
              <p className={clsx('text-xs', stat.positive ? 'text-sage-600' : 'text-[var(--text-muted)]')}>{stat.change}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-1 p-1 rounded-2xl bg-[var(--bg-muted)] w-fit">
              {(['overview', 'sessions', 'analytics'] as const).map(tab => (
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

            {activeTab === 'overview' && (
              <div className="space-y-5">
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-semibold text-[var(--text-primary)]">Earnings overview</h3>
                    <div className="flex items-center gap-1 text-sm font-medium text-sage-600">
                      <ArrowUpRight size={16} />
                      +{growth}% this month
                    </div>
                  </div>

                  <div className="flex items-end gap-2 h-32 mb-3">
                    {monthly.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className={clsx(
                            'w-full rounded-t-lg transition-all',
                            i === monthly.length - 1 ? 'bg-brand-500' : 'bg-brand-100 dark:bg-brand-900'
                          )}
                          style={{ height: `${(d.amount / maxAmount) * 100}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    {monthly.map((d, i) => (
                      <div key={i} className="flex-1 text-center">
                        <p className="text-xs text-[var(--text-muted)]">{d.month}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm text-[var(--text-primary)]">Recent sessions</h3>
                    <button onClick={() => setActiveTab('sessions')} className="text-xs text-brand-500 hover:text-brand-600 font-medium">
                      View all →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { learner: 'Sarah K.', session: 'Understand ETFs in 40 Minutes', date: 'Today', rating: 5, amount: 25 },
                      { learner: 'Marcus T.', session: 'Understand ETFs in 40 Minutes', date: 'Yesterday', rating: 5, amount: 25 },
                      { learner: 'Priya N.', session: 'Understand ETFs in 40 Minutes', date: 'Mar 28', rating: 4, amount: 25 },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-xs font-bold text-brand-700">
                            {item.learner.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">{item.learner}</p>
                            <p className="text-xs text-[var(--text-muted)]">{item.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-0.5">
                            {[...Array(item.rating)].map((_, j) => <Star key={j} size={11} className="rating-star" />)}
                          </div>
                          <span className="text-sm font-semibold text-sage-600">+${item.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="space-y-4">
                {mySessions.map(session => (
                  <div key={session.id} className="card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                          style={{ backgroundColor: `${session.category.color}18` }}>
                          {session.category.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-[var(--text-primary)]">{session.title}</h4>
                          <p className="text-xs text-[var(--text-muted)]">{session.totalBooked} learners · ${session.price}</p>
                        </div>
                      </div>
                      <span className="badge-sage text-xs">Active</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="stat-card text-center">
                        <p className="font-bold text-sm text-[var(--text-primary)]">{session.rating}</p>
                        <p className="text-xs text-[var(--text-muted)]">Rating</p>
                      </div>
                      <div className="stat-card text-center">
                        <p className="font-bold text-sm text-[var(--text-primary)]">{session.reviewCount}</p>
                        <p className="text-xs text-[var(--text-muted)]">Reviews</p>
                      </div>
                      <div className="stat-card text-center">
                        <p className="font-bold text-sm text-[var(--text-primary)]">${session.price * session.reviewCount}</p>
                        <p className="text-xs text-[var(--text-muted)]">Earned</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link to={`/session/${session.id}`} className="btn-outline text-xs py-2 flex-1 justify-center">
                        View listing
                      </Link>
                      <button className="btn-ghost text-xs py-2 px-3">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}

                <button className="btn-primary w-full justify-center">
                  <Plus size={16} /> Create new session
                </button>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-5">
                <div className="card p-5">
                  <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <BarChart2 size={16} className="text-brand-500" />
                    Session performance
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Outcome achieved rate', value: 94, color: 'bg-sage-500' },
                      { label: 'Repeat learner rate', value: 67, color: 'bg-brand-500' },
                      { label: 'Profile view to booking', value: 38, color: 'bg-amber-500' },
                      { label: 'Session completion rate', value: 98, color: 'bg-violet-500' },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="text-[var(--text-secondary)]">{item.label}</span>
                          <span className="font-semibold text-[var(--text-primary)]">{item.value}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className={`h-full rounded-full transition-all duration-700 ${item.color}`} style={{ width: `${item.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-5">
                  <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-4">Top search terms finding you</h3>
                  <div className="flex flex-wrap gap-2">
                    {['ETF investing', 'portfolio basics', 'personal finance', 'beginner investing', 'index funds', 'Vanguard setup'].map(tag => (
                      <span key={tag} className="badge-neutral">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="card p-5">
              <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-4">Upcoming sessions</h3>
              <div className="space-y-3">
                {[
                  { learner: 'Alex M.', time: 'Today 4:00 PM', session: 'ETFs in 40 Min' },
                  { learner: 'Jordan K.', time: 'Tomorrow 10 AM', session: 'ETFs in 40 Min' },
                  { learner: 'Sam P.', time: 'Wed 2:00 PM', session: 'ETFs in 40 Min' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
                    <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-xs font-bold text-brand-700">
                      {item.learner.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.learner}</p>
                      <p className="text-xs text-[var(--text-muted)]">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-1">Payout schedule</h3>
              <p className="text-xs text-[var(--text-muted)] mb-4">Next payout on April 1st</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--text-secondary)]">Pending</span>
                <span className="font-semibold text-sage-600">$186.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)]">Processing</span>
                <span className="font-semibold text-[var(--text-primary)]">$0.00</span>
              </div>
              <div className="divider mt-4 pt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--text-primary)]">Available</span>
                <span className="font-bold text-lg text-sage-600">$874.00</span>
              </div>
              <button className="btn-outline w-full justify-center mt-3 text-sm">
                Withdraw funds
              </button>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-[var(--text-primary)]">Pro upgrade</h3>
                <span className="badge bg-amber-50 text-amber-700 text-xs">Unlock more</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mb-4">
                Get featured listings, advanced analytics, and custom branding for $19/mo.
              </p>
              <button className="btn-primary w-full justify-center text-sm">
                Upgrade to Pro <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}