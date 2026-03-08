import { Star, MapPin, Clock, Wifi, CheckCircle } from 'lucide-react'
import type { Session } from '../../types'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

interface SessionCardProps {
  session: Session
  compact?: boolean
}

export function SessionCard({ session, compact = false }: SessionCardProps) {
  return (
    <Link to={`/session/${session.id}`}>
      <div className={clsx('card-hover group', compact ? 'p-4' : 'p-5')}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{session.category.icon}</span>
            <span className="badge-brand text-xs">{session.category.label}</span>
            {session.featured && (
              <span className="badge bg-amber-50 text-amber-700 text-xs dark:bg-amber-950 dark:text-amber-300">Featured</span>
            )}
            {session.trending && (
              <span className="badge bg-rose-50 text-rose-700 text-xs dark:bg-rose-950 dark:text-rose-300">Trending</span>
            )}
          </div>
          <span className="text-sm font-bold text-[var(--text-primary)] whitespace-nowrap">${session.price}</span>
        </div>

        <h3 className={clsx('font-display font-semibold text-[var(--text-primary)] leading-snug group-hover:text-brand-600 transition-colors mb-2', compact ? 'text-sm' : 'text-base')}>
          {session.title}
        </h3>

        {!compact && (
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-3">
            {session.outcome}
          </p>
        )}

        <div className="flex items-center gap-1 mb-3">
          <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300 flex-shrink-0">
            {session.guide.initials}
          </div>
          <span className="text-xs text-[var(--text-secondary)] font-medium">{session.guide.name}</span>
          {session.guide.verified && (
            <CheckCircle size={11} className="text-sage-500 fill-sage-500 flex-shrink-0" />
          )}
        </div>

        <div className="divider mb-3" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock size={12} className="text-[var(--text-muted)]" />
              <span className="text-xs text-[var(--text-muted)]">{session.duration} min</span>
            </div>
            <div className="flex items-center gap-1">
              {session.remote && <Wifi size={12} className="text-[var(--text-muted)]" />}
              {session.local && <MapPin size={12} className="text-[var(--text-muted)]" />}
              <span className="text-xs text-[var(--text-muted)]">
                {session.remote && session.local ? 'Remote & Local' : session.remote ? 'Remote' : 'Local'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star size={12} className="rating-star" />
            <span className="text-xs font-semibold text-[var(--text-primary)]">{session.rating}</span>
            <span className="text-xs text-[var(--text-muted)]">({session.reviewCount})</span>
          </div>
        </div>

        {!compact && session.nextAvailable && (
          <div className="mt-3 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sage-50 dark:bg-sage-950">
            <div className="w-1.5 h-1.5 rounded-full bg-sage-500 animate-pulse" />
            <span className="text-xs font-medium text-sage-700 dark:text-sage-300">Next: {session.nextAvailable}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

export function SessionCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="skeleton w-6 h-6 rounded-full" />
        <div className="skeleton w-20 h-5" />
      </div>
      <div className="skeleton w-full h-5 mb-1" />
      <div className="skeleton w-3/4 h-5 mb-3" />
      <div className="skeleton w-full h-3 mb-1" />
      <div className="skeleton w-5/6 h-3 mb-3" />
      <div className="skeleton w-32 h-4 mb-3" />
      <div className="divider mb-3" />
      <div className="flex items-center justify-between">
        <div className="skeleton w-24 h-3" />
        <div className="skeleton w-16 h-3" />
      </div>
    </div>
  )
}
