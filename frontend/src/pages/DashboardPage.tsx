import { Link } from 'react-router-dom'
import { BookOpen, Users, ArrowRight, LayoutDashboard } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function DashboardPage() {
  const { user } = useAuth()
  const name = user?.name ?? 'there'
  const initials = user ? getInitials(user.name) : '?'
  // role check done inline
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-3xl bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-2xl font-bold text-brand-700 dark:text-brand-300 mx-auto mb-4">
            {initials}
          </div>
          <h1 className="font-display font-bold text-2xl text-[var(--text-primary)] mb-1">
            Hi, {name.split(' ')[0]}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            What would you like to do today?
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <Link to="/dashboard/learner">
            <div className="card-hover p-7 text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={26} className="text-brand-500" />
              </div>
              <h2 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-2">My Learning</h2>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                View upcoming sessions, history, skill paths, and progress.
              </p>
              <div className="flex items-center justify-center gap-1 text-sm font-medium text-brand-500">
                Go to learner dashboard <ArrowRight size={15} />
              </div>
            </div>
          </Link>

          <Link to="/dashboard/teacher">
            <div className="card-hover p-7 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center mx-auto mb-4">
                <Users size={26} className="text-amber-500" />
              </div>
              <h2 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-2">My Teaching</h2>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Manage your sessions, view earnings, and track performance.
              </p>
              <div className="flex items-center justify-center gap-1 text-sm font-medium text-amber-500">
                Go to guide dashboard <ArrowRight size={15} />
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-6 card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard size={20} className="text-sage-500" />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Quick action</p>
              <p className="text-xs text-[var(--text-muted)]">Jump straight to discovering new sessions</p>
            </div>
          </div>
          <Link to="/discover" className="btn-primary text-sm">
            Discover sessions <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </Layout>
  )
}
