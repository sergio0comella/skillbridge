import { Star, CheckCircle, MapPin, Award } from 'lucide-react'
import type { User } from '../../types'
import { Link } from 'react-router-dom'

interface GuideCardProps {
  guide: User
  compact?: boolean
}

export function GuideCard({ guide, compact = false }: GuideCardProps) {
  return (
    <Link to={`/guide/${guide.id}`}>
      <div className="card-hover p-5 text-center">
        <div className="relative w-14 h-14 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-lg font-bold text-brand-700 dark:text-brand-300 mx-auto mb-3">
          {guide.initials}
          {guide.verified && (
            <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-sage-500 flex items-center justify-center">
              <CheckCircle size={11} className="text-white" />
            </span>
          )}
        </div>

        <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-0.5">{guide.name}</h4>
        {guide.location && (
          <div className="flex items-center justify-center gap-1 mb-2">
            <MapPin size={11} className="text-[var(--text-muted)]" />
            <span className="text-xs text-[var(--text-muted)]">{guide.location}</span>
          </div>
        )}

        {!compact && guide.bio && (
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3 leading-relaxed">{guide.bio}</p>
        )}

        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="flex items-center gap-1">
            <Star size={12} className="rating-star" />
            <span className="text-xs font-semibold text-[var(--text-primary)]">{guide.rating}</span>
          </div>
          <div className="w-px h-3 bg-[var(--border)]" />
          <span className="text-xs text-[var(--text-muted)]">{guide.sessionsCompleted} sessions</span>
        </div>

        {guide.badges && guide.badges.length > 0 && (
          <div className="flex items-center justify-center gap-1 flex-wrap">
            {guide.badges.slice(0, 2).map(b => (
              <span key={b.id} className={`badge badge-${b.color} text-2xs`}>
                <Award size={10} />
                {b.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
