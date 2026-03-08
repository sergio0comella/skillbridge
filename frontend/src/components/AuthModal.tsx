import { useState } from 'react'
import { X, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'
import clsx from 'clsx'

interface AuthModalProps {
  onClose: () => void
  defaultMode?: 'login' | 'register'
  onSuccess?: () => void
}

type Mode = 'login' | 'register'

export function AuthModal({ onClose, defaultMode = 'login', onSuccess }: AuthModalProps) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<Mode>(defaultMode)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'LEARNER' as 'LEARNER' | 'GUIDE' | 'DUAL',
  })

  const set = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }))
    setFieldErrors(fe => ({ ...fe, [field]: '' }))
  }

  const handleSubmit = async () => {
    setError(null)
    setFieldErrors({})
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await register(form.name, form.email, form.password, form.role)
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors?.length) {
          const fe: Record<string, string> = {}
          err.errors.forEach(e => { fe[e.field] = e.message })
          setFieldErrors(fe)
        } else {
          setError(err.message)
        }
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md card p-8 animate-fade-up">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 btn-ghost p-2 rounded-full"
        >
          <X size={16} />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {mode === 'login' ? 'Sign in to your SkillBridge account' : 'Join thousands of learners and guides'}
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-sm font-medium text-[var(--text-secondary)] block mb-1.5">Full name</label>
              <input
                type="text"
                className={clsx('input w-full', fieldErrors.name && 'border-red-400')}
                placeholder="Alex Chen"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                disabled={loading}
              />
              {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-[var(--text-secondary)] block mb-1.5">Email</label>
            <input
              type="email"
              className={clsx('input w-full', fieldErrors.email && 'border-red-400')}
              placeholder="you@example.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              disabled={loading}
            />
            {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--text-secondary)] block mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={clsx('input w-full pr-10', fieldErrors.password && 'border-red-400')}
                placeholder={mode === 'register' ? 'Min. 8 chars, 1 uppercase, 1 number' : '••••••••'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                disabled={loading}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-sm font-medium text-[var(--text-secondary)] block mb-2">I want to…</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'LEARNER', label: 'Learn', icon: '📚' },
                  { value: 'GUIDE', label: 'Teach', icon: '🎓' },
                  { value: 'DUAL', label: 'Both', icon: '🔄' },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('role', opt.value)}
                    className={clsx(
                      'flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-sm font-medium transition-all',
                      form.role === opt.value
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300'
                        : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]',
                    )}
                  >
                    <span className="text-xl">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full justify-center py-3 text-base"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              mode === 'login' ? 'Sign in' : 'Create account'
            )}
          </button>
        </div>

        <p className="text-sm text-center text-[var(--text-muted)] mt-6">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}
            className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
