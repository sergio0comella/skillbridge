import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowRight, Star, CheckCircle, Zap, Users, Shield, TrendingUp, Clock, Play, ChevronRight } from 'lucide-react'
import { SessionCard } from '../components/cards/SessionCard'
import { Layout } from '../components/layout/Layout'
import { sessionsApi } from '../lib/services'
import { mapApiSession, mapApiCategory } from '../lib/mappers'
import type { Session, Category } from '../types'

export function LandingPage() {
  const [featured, setFeatured] = useState<Session[]>([])
  const [trending, setTrending] = useState<Session[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    sessionsApi.list({ featured: true, limit: 3 }).then(r => setFeatured(r.data.map(mapApiSession))).catch(() => {})
    sessionsApi.list({ trending: true, limit: 4 }).then(r => setTrending(r.data.map(mapApiSession))).catch(() => {})
    sessionsApi.categories().then(r => setCategories(r.data.map(mapApiCategory))).catch(() => {})
  }, [])

  return (
    <Layout>
      <div className="mesh-bg">
        <HeroSection featured={featured} />
        <TrustBar />
        <CategoriesSection categories={categories} />
        <FeaturedSessions sessions={featured} />
        <HowItWorks />
        <TemplatesPreview />
        <TrendingSessions sessions={trending} />
        <SocialProof />
        <GuideSection />
        <PricingSection />
        <FinalCTA />
      </div>
    </Layout>
  )
}

function HeroSection({ featured }: { featured: Session[] }) {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 dark:bg-brand-950 dark:border-brand-900 mb-6 animate-fade-up">
            <div className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
            <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">12,400+ skills learned this month</span>
          </div>

          <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-[var(--text-primary)] leading-[1.05] mb-6 animate-fade-up">
            Learn anything in
            <span className="block text-gradient">45 minutes</span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto mb-8 animate-fade-up">
            Peer-to-peer micro-sessions with real people who know their craft.
            Structured, outcome-driven, and actually affordable.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 animate-fade-up">
            <Link to="/discover" className="btn-primary text-base px-7 py-3.5 shadow-brand-lg">
              Find a session
              <ArrowRight size={18} />
            </Link>
            <Link to="/onboarding?role=guide" className="btn-outline text-base px-7 py-3.5">
              <Play size={16} className="text-brand-500" />
              Teach your skill
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-[var(--text-muted)] animate-fade-up">
            {['No subscription', 'Pay per session', 'Cancel anytime'].map((t, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-sage-500" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 relative max-w-5xl mx-auto animate-fade-up">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg)] z-10 pointer-events-none" style={{ top: '70%' }} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featured.slice(0, 3).map((s, i) => (
              <div key={s.id} className="animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                <SessionCard session={s} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function TrustBar() {
  const stats = [
    { value: '48K+', label: 'Skill Guides' },
    { value: '4.93', label: 'Avg. Rating', icon: <Star size={14} className="rating-star" /> },
    { value: '230K+', label: 'Sessions Completed' },
    { value: '94%', label: 'Outcome Achieved' },
  ]

  return (
    <div className="bg-[var(--bg-subtle)] border-y border-[var(--border)] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {s.icon}
                <span className="font-display font-bold text-2xl text-[var(--text-primary)]">{s.value}</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CategoriesSection({ categories }: { categories: Category[] }) {
  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title text-2xl">Browse by skill</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Find expert Guides in your area of interest</p>
          </div>
          <Link to="/discover" className="hidden sm:flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600">
            View all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map(cat => (
            <Link key={cat.id} to={`/discover?category=${cat.id}`}>
              <div className="card-hover p-4 text-center group">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${cat.color}15` }}
                >
                  {cat.icon}
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{cat.label}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{cat.count} sessions</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedSessions({ sessions }: { sessions: Session[] }) {
  return (
    <section className="py-16 px-4 sm:px-6 bg-[var(--bg-subtle)]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="badge-brand mb-2">Featured</span>
            <h2 className="section-title">Top-rated sessions</h2>
            <p className="section-subtitle mt-2">Handpicked for quality and learner outcomes.</p>
          </div>
          <Link to="/discover" className="hidden sm:flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600">
            All sessions <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sessions.map(s => <SessionCard key={s.id} session={s} />)}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: '🔍',
      title: 'Find your session',
      description: 'Search by skill or browse by category. Filter by price, duration, and format. Every session has a clear outcome statement.',
      color: 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400',
    },
    {
      number: '02',
      icon: '⚡',
      title: 'Book in 60 seconds',
      description: 'Pick a time, confirm, pay. Instant calendar sync and meeting link. No back-and-forth, no waiting for approval.',
      color: 'bg-sage-50 dark:bg-sage-950 text-sage-600 dark:text-sage-400',
    },
    {
      number: '03',
      icon: '🎯',
      title: 'Learn with structure',
      description: 'Every session follows a proven template. Built-in timer, shared notes, and a clear agenda keep things focused.',
      color: 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
    },
    {
      number: '04',
      icon: '✅',
      title: 'Walk away with a result',
      description: 'Auto-generated session recap, actionable takeaway, and a follow-up exercise. Real progress, not just time spent.',
      color: 'bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400',
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="badge-sage mb-3">Simple by design</span>
          <h2 className="section-title">How SkillBridge works</h2>
          <p className="section-subtitle mx-auto mt-3">From intent to outcome in four frictionless steps.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px border-t-2 border-dashed border-[var(--border)] z-0 -translate-x-6" />
              )}
              <div className="card p-6 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 ${step.color}`}>
                  {step.icon}
                </div>
                <div className="text-xs font-bold text-[var(--text-muted)] mb-2 font-mono">{step.number}</div>
                <h3 className="font-display font-semibold text-[var(--text-primary)] mb-2">{step.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TemplatesPreview() {
  const templates = [
    { icon: '🧩', title: 'Skill Breakdown', color: '#1a6aff', count: '2.8K sessions' },
    { icon: '🚀', title: 'Quick Start', color: '#368e52', count: '2.0K sessions' },
    { icon: '🎯', title: 'Practical Drill', color: '#e05c2a', count: '3.2K sessions' },
    { icon: '⚡', title: 'Concept to Action', color: '#7c3aed', count: '2.1K sessions' },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 bg-[var(--bg-subtle)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="badge-brand mb-3">Built-in structure</span>
            <h2 className="section-title mb-4">Teaching templates that actually work</h2>
            <p className="section-subtitle mb-6">
              Every Guide uses a proven session template. No more rambling or wasted time — just focused, structured learning that produces real outcomes.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Every session has a clear outcome statement',
                'Structured step-by-step breakdown',
                '1 actionable takeaway guaranteed',
                '1 follow-up exercise to reinforce',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-sage-100 dark:bg-sage-950 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle size={12} className="text-sage-600" />
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/templates" className="btn-primary">
              View all templates <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {templates.map((t, i) => (
              <Link key={i} to="/templates">
                <div className="card-hover p-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3"
                    style={{ backgroundColor: `${t.color}18` }}
                  >
                    {t.icon}
                  </div>
                  <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-1">{t.title}</h4>
                  <p className="text-xs text-[var(--text-muted)]">{t.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function TrendingSessions({ sessions }: { sessions: Session[] }) {
  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={18} className="text-brand-500" />
              <span className="badge-brand">Trending this week</span>
            </div>
            <h2 className="section-title">Most booked right now</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {sessions.map(s => <SessionCard key={s.id} session={s} />)}
        </div>
      </div>
    </section>
  )
}

function SocialProof() {
  const testimonials = [
    {
      quote: 'I tried 3 courses on ETFs and learned more from Alex\'s 40-minute session than all of them combined. The outcome-driven format changes everything.',
      name: 'Sarah K.',
      title: 'Marketing Manager',
      initials: 'SK',
      rating: 5,
    },
    {
      quote: 'As someone who teaches guitar, SkillBridge gave me the templates I needed to actually structure my knowledge. My sessions went from 3 stars to 4.9 in a month.',
      name: 'Marcus T.',
      title: 'Music Teacher & Guide',
      initials: 'MT',
      rating: 5,
    },
    {
      quote: 'The booking flow is absurdly fast. Found a session at 2pm, booked by 2:03pm, was in the call by 6pm. Unprecedented.',
      name: 'Priya N.',
      title: 'Product Designer',
      initials: 'PN',
      rating: 5,
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 bg-[var(--bg-subtle)]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="section-title">Loved by learners and guides</h2>
          <p className="section-subtitle mx-auto mt-2">Real outcomes from real people on SkillBridge.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="card p-6">
              <div className="flex items-center gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} size={14} className="rating-star" />
                ))}
              </div>
              <blockquote className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5 italic">
                "{t.quote}"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-sm font-bold text-brand-700 dark:text-brand-300">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{t.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{t.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function GuideSection() {
  const benefits = [
    { icon: <Zap size={20} className="text-amber-500" />, title: 'Earn in 24 hours', description: 'Create your first session, get approved, and start earning the same day. No waiting, no gatekeeping.' },
    { icon: <Users size={20} className="text-brand-500" />, title: 'Built-in audience', description: 'Thousands of learners actively browsing sessions in your skill area. You bring the knowledge, we bring the students.' },
    { icon: <Shield size={20} className="text-sage-500" />, title: 'You\'re protected', description: 'Secure payments, session insurance, and our Guide Promise means you always get paid for your time.' },
    { icon: <TrendingUp size={20} className="text-violet-500" />, title: 'Analytics that matter', description: 'Track outcome ratings, repeat learners, and session performance. Know exactly what to improve.' },
  ]

  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div className="grid grid-cols-2 gap-4">
            {benefits.map((b, i) => (
              <div key={i} className="card p-5">
                <div className="mb-3">{b.icon}</div>
                <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-1.5">{b.title}</h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>

          <div>
            <span className="badge bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 mb-3">Become a Guide</span>
            <h2 className="section-title mb-4">Turn what you know into income</h2>
            <p className="section-subtitle mb-4">
              You don't need to be a professor. You need to be 2 steps ahead of your learner. SkillBridge gives you the structure, the platform, and the audience.
            </p>

            <div className="stat-card mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-1">Avg. monthly earnings</p>
                  <p className="font-display font-bold text-2xl text-[var(--text-primary)]">$620</p>
                  <p className="text-xs text-sage-600 mt-0.5">+34% YoY growth</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Top Guides earn</p>
                  <p className="font-display font-bold text-2xl text-brand-500">$3,200+</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">per month</p>
                </div>
              </div>
            </div>

            <Link to="/onboarding?role=guide" className="btn-primary">
              Start teaching today <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  const plans = [
    {
      name: 'Learner',
      price: 'Free',
      description: 'Pay per session. No subscription needed.',
      features: ['Browse all sessions', 'Book instantly', 'Calendar sync', 'Session recordings', 'Session recap + notes'],
      cta: 'Start learning',
      ctaLink: '/discover',
      highlight: false,
    },
    {
      name: 'Guide Pro',
      price: '$19',
      period: '/mo',
      description: 'For serious guides building a teaching business.',
      features: ['Featured listing boost', 'Advanced analytics', 'Custom session branding', 'Priority support', 'Bulk discount tools', 'Team session packages'],
      cta: 'Become a Guide',
      ctaLink: '/onboarding?role=guide',
      highlight: true,
    },
    {
      name: 'Teams',
      price: 'Custom',
      description: 'Corporate learning packages for your organization.',
      features: ['Dedicated account manager', 'Custom onboarding sessions', 'Team analytics dashboard', 'Invoice billing', 'Bulk session credits', 'Compliance reporting'],
      cta: 'Contact sales',
      ctaLink: '/contact',
      highlight: false,
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 bg-[var(--bg-subtle)]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="badge-brand mb-3">Transparent pricing</span>
          <h2 className="section-title">Simple, fair, and flexible</h2>
          <p className="section-subtitle mx-auto mt-2">10–15% platform fee per session. No hidden costs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <div key={i} className={`card p-6 ${plan.highlight ? 'border-brand-400 bg-brand-50 dark:bg-brand-950 shadow-brand' : ''}`}>
              {plan.highlight && (
                <div className="badge-brand text-xs mb-3 w-fit">Most Popular</div>
              )}
              <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-display font-bold text-3xl text-[var(--text-primary)]">{plan.price}</span>
                {plan.period && <span className="text-sm text-[var(--text-muted)]">{plan.period}</span>}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mb-5">{plan.description}</p>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-sage-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-[var(--text-secondary)]">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={plan.ctaLink}
                className={plan.highlight ? 'btn-primary w-full justify-center' : 'btn-outline w-full justify-center'}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="card p-12 sm:p-16 border-brand-200 dark:border-brand-900 bg-gradient-to-br from-brand-50 to-white dark:from-brand-950 dark:to-[var(--bg)]">
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => <Star key={i} size={20} className="rating-star" />)}
          </div>
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-[var(--text-primary)] mb-4">
            Stop planning to learn.
            <br />
            <span className="text-gradient">Start learning today.</span>
          </h2>
          <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
            Join 230,000+ learners who've replaced hours of unstructured content with focused 45-minute sessions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/discover" className="btn-primary text-base px-8 py-4 shadow-brand-lg">
              Browse sessions — it's free
              <ArrowRight size={18} />
            </Link>
            <Link to="/onboarding" className="btn-outline text-base px-8 py-4">
              <Clock size={16} />
              Book your first session
            </Link>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-5">No subscription. Pay per session. Cancel anytime.</p>
        </div>
      </div>
    </section>
  )
}
