import { useParams, Link } from 'react-router-dom'
import { Star, Clock, Wifi, MapPin, CheckCircle, ChevronRight, Award, Users, BookOpen, ArrowLeft, Heart, Share2, Shield, Loader2 } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { useState, useEffect } from 'react'
import { sessionsApi } from '../lib/services'
import { mapApiSession } from '../lib/mappers'
import type { Session, Review } from '../types'
import clsx from 'clsx'

export function SessionDetailPage() {
  const { id } = useParams()
  const [session, setSession] = useState<Session | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'guide' | 'reviews'>('overview')
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      sessionsApi.get(id),
      sessionsApi.reviews(id),
    ]).then(([sessRes, revRes]) => {
      setSession(mapApiSession(sessRes.data))
      // Map reviews from API
      const mapped: Review[] = revRes.data.map((r: any) => ({
        id: r.id,
        sessionId: r.sessionId,
        learner: { id: r.learner?.id ?? '', name: r.learner?.name ?? 'Anonymous', initials: (r.learner?.name ?? 'A').slice(0, 2).toUpperCase(), role: 'learner' as const },
        rating: r.rating,
        outcomeAchieved: r.outcomeAchieved,
        comment: r.comment,
        date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        helpful: r.helpfulCount,
      }))
      setReviews(mapped)
    }).catch(() => {
      setSession(null)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-40">
          <Loader2 size={32} className="animate-spin text-brand-500" />
        </div>
      </Layout>
    )
  }

  if (!session) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="font-display font-bold text-2xl text-[var(--text-primary)] mb-2">Session not found</h1>
          <Link to="/discover" className="btn-primary">Back to Discover</Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/discover" className="btn-ghost py-1.5 px-2.5">
            <ArrowLeft size={16} />
            Back
          </Link>
          <ChevronRight size={14} className="text-[var(--text-muted)]" />
          <span className="text-sm text-[var(--text-secondary)]">{session.category.label}</span>
          <ChevronRight size={14} className="text-[var(--text-muted)]" />
          <span className="text-sm text-[var(--text-primary)] font-medium line-clamp-1">{session.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="badge-brand">{session.category.icon} {session.category.label}</span>
                <span className={clsx('badge', {
                  'bg-sage-50 text-sage-700': session.level === 'beginner',
                  'bg-amber-50 text-amber-700': session.level === 'intermediate',
                  'bg-rose-50 text-rose-700': session.level === 'advanced',
                })}>
                  {session.level.charAt(0).toUpperCase() + session.level.slice(1)}
                </span>
                {session.trending && <span className="badge bg-rose-50 text-rose-600">Trending</span>}
              </div>

              <h1 className="font-display font-bold text-2xl sm:text-3xl text-[var(--text-primary)] mb-4 leading-tight">
                {session.title}
              </h1>

              <div className="card p-5 border-l-4 border-l-brand-400 rounded-l-none bg-brand-50 dark:bg-brand-950">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-2">
                  Session Outcome
                </p>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed font-medium">
                  {session.outcome}
                </p>
              </div>
            </div>

            <div className="flex gap-1 p-1 rounded-2xl bg-[var(--bg-muted)]">
              {(['overview', 'guide', 'reviews'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx('flex-1 py-2.5 text-sm font-medium rounded-xl transition-all capitalize', {
                    'bg-[var(--bg)] text-[var(--text-primary)] shadow-soft-sm': activeTab === tab,
                    'text-[var(--text-muted)] hover:text-[var(--text-secondary)]': activeTab !== tab,
                  })}
                >
                  {tab}
                  {tab === 'reviews' && reviews.length > 0 && (
                    <span className="ml-1 text-xs text-[var(--text-muted)]">({session.reviewCount})</span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-[var(--text-primary)] mb-4">Session structure</h3>
                  <div className="space-y-3">
                    {session.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-4 card p-4">
                        <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-xs font-bold text-brand-600 dark:text-brand-400 flex-shrink-0">
                          {step.order}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm text-[var(--text-primary)]">{step.title}</h4>
                            <span className="text-xs text-[var(--text-muted)] flex-shrink-0 ml-2">{step.duration} min</span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="card p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-sage-50 dark:bg-sage-950 flex items-center justify-center">
                        <CheckCircle size={16} className="text-sage-600" />
                      </div>
                      <h4 className="font-semibold text-sm text-[var(--text-primary)]">You'll leave with</h4>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{session.takeaway}</p>
                  </div>

                  <div className="card p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
                        <BookOpen size={16} className="text-amber-600" />
                      </div>
                      <h4 className="font-semibold text-sm text-[var(--text-primary)]">Follow-up exercise</h4>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{session.followUpExercise}</p>
                  </div>
                </div>

                {session.materials.length > 0 && (
                  <div className="card p-5">
                    <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-3">Materials included</h4>
                    <div className="space-y-2">
                      {session.materials.map((m, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                          <span className="text-sm text-[var(--text-secondary)]">{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="card p-5">
                  <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-1">Session template</h4>
                  <p className="text-xs text-[var(--text-muted)] mb-3">This session uses the following teaching framework</p>
                  <Link to="/templates" className="badge-brand flex items-center gap-2 w-fit">
                    <span className="text-lg">
                      {session.template === 'concept-to-action' ? '⚡' :
                       session.template === 'skill-breakdown' ? '🧩' :
                       session.template === 'quick-start' ? '🚀' : '🎯'}
                    </span>
                    <span className="capitalize">{session.template.replace(/-/g, ' ')}</span>
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'guide' && (
              <div className="card p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-xl font-bold text-brand-700 dark:text-brand-300 flex-shrink-0">
                    {session.guide.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-semibold text-lg text-[var(--text-primary)]">{session.guide.name}</h3>
                      {session.guide.verified && (
                        <CheckCircle size={16} className="text-sage-500 fill-sage-500" />
                      )}
                    </div>
                    {session.guide.location && (
                      <div className="flex items-center gap-1 mb-2">
                        <MapPin size={13} className="text-[var(--text-muted)]" />
                        <span className="text-sm text-[var(--text-muted)]">{session.guide.location}</span>
                      </div>
                    )}
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{session.guide.bio}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-5">
                  <div className="stat-card text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star size={14} className="rating-star" />
                      <span className="font-bold text-[var(--text-primary)]">{session.guide.rating}</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">Rating</p>
                  </div>
                  <div className="stat-card text-center">
                    <p className="font-bold text-[var(--text-primary)] mb-1">{session.guide.sessionsCompleted}</p>
                    <p className="text-xs text-[var(--text-muted)]">Sessions</p>
                  </div>
                  <div className="stat-card text-center">
                    <p className="font-bold text-[var(--text-primary)] mb-1">{session.guide.completionRate}%</p>
                    <p className="text-xs text-[var(--text-muted)]">Completion</p>
                  </div>
                </div>

                {session.guide.badges && session.guide.badges.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {session.guide.badges.map(b => (
                      <span key={b.id} className={`badge badge-${b.color}`}>
                        <Award size={11} /> {b.label}
                      </span>
                    ))}
                  </div>
                )}

                <div className="divider mt-5 pt-5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-[var(--text-muted)]">
                      <span className="w-2 h-2 rounded-full bg-sage-500" />
                      Responds in {session.guide.responseTime}
                    </div>
                    <Link to={`/guide/${session.guide.id}`} className="text-brand-500 font-medium hover:text-brand-600">
                      View full profile →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex items-center gap-6 card p-5">
                  <div className="text-center">
                    <p className="font-display font-bold text-4xl text-[var(--text-primary)]">{session.rating}</p>
                    <div className="flex items-center justify-center gap-0.5 my-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < Math.floor(session.rating) ? 'rating-star' : 'text-[var(--border)]'} />
                      ))}
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{session.reviewCount} reviews</p>
                  </div>
                  <div className="flex-1">
                    {[5,4,3,2,1].map(star => {
                      const pct = star === 5 ? 78 : star === 4 ? 16 : star === 3 ? 4 : star === 2 ? 1 : 1
                      return (
                        <div key={star} className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs text-[var(--text-muted)] w-3 text-right">{star}</span>
                          <Star size={10} className="text-amber-400 fill-amber-400" />
                          <div className="progress-bar flex-1">
                            <div className="progress-fill bg-amber-400" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-[var(--text-muted)] w-8">{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="card p-4 flex items-center gap-3">
                  <CheckCircle size={18} className="text-sage-500 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">94%</span>
                    <span className="text-sm text-[var(--text-secondary)] ml-1.5">of learners achieved the stated outcome</span>
                  </div>
                </div>

                {reviews.map(review => (
                  <div key={review.id} className="card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-xs font-bold text-brand-700">
                          {review.learner.initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{review.learner.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(review.rating)].map((_, i) => <Star key={i} size={13} className="rating-star" />)}
                      </div>
                    </div>
                    {review.outcomeAchieved && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <CheckCircle size={12} className="text-sage-500" />
                        <span className="text-xs font-medium text-sage-600">Outcome achieved</span>
                      </div>
                    )}
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{review.comment}</p>
                    {review.helpful && (
                      <p className="text-xs text-[var(--text-muted)] mt-3">{review.helpful} people found this helpful</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="font-display font-bold text-3xl text-[var(--text-primary)]">${session.price}</span>
                  <span className="text-sm text-[var(--text-muted)] ml-1">per session</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setLiked(l => !l)}
                    className={clsx('w-9 h-9 rounded-xl flex items-center justify-center transition-all', liked ? 'text-rose-500 bg-rose-50' : 'btn-ghost')}
                  >
                    <Heart size={18} className={liked ? 'fill-rose-500' : ''} />
                  </button>
                  <button className="btn-ghost w-9 h-9 rounded-xl p-0">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Duration</span>
                  <div className="flex items-center gap-1 font-medium text-[var(--text-primary)]">
                    <Clock size={14} /> {session.duration} minutes
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Format</span>
                  <div className="flex items-center gap-2">
                    {session.remote && (
                      <div className="flex items-center gap-1 font-medium text-[var(--text-primary)]">
                        <Wifi size={14} /> Remote
                      </div>
                    )}
                    {session.local && (
                      <div className="flex items-center gap-1 font-medium text-[var(--text-primary)]">
                        <MapPin size={14} /> Local
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Rating</span>
                  <div className="flex items-center gap-1 font-medium text-[var(--text-primary)]">
                    <Star size={14} className="rating-star" />
                    {session.rating} ({session.reviewCount})
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Total learners</span>
                  <div className="flex items-center gap-1 font-medium text-[var(--text-primary)]">
                    <Users size={14} />
                    {session.totalBooked.toLocaleString()}
                  </div>
                </div>
              </div>

              {session.nextAvailable && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-sage-50 dark:bg-sage-950 mb-4">
                  <div className="w-2 h-2 rounded-full bg-sage-500 animate-pulse flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-sage-700 dark:text-sage-300">Next available</p>
                    <p className="text-xs text-sage-600 dark:text-sage-400">{session.nextAvailable}</p>
                  </div>
                </div>
              )}

              <Link
                to={`/book/${session.id}`}
                className="btn-primary w-full justify-center text-base py-3.5"
              >
                Book this session
              </Link>

              <p className="text-center text-xs text-[var(--text-muted)] mt-3">
                You won't be charged until you select a time
              </p>
            </div>

            <div className="card p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Platform Guarantee</h4>
              <div className="space-y-2.5">
                {[
                  { icon: <Shield className="text-sage-500" size={14} />, text: 'Full refund if outcome not met' },
                  { icon: <CheckCircle className="text-brand-500" size={14} />, text: 'Secure payment via Stripe' },
                  { icon: <Users className="text-amber-500" size={14} />, text: 'Guide vetted and verified' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    {item.icon}
                    <span className="text-xs text-[var(--text-secondary)]">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

