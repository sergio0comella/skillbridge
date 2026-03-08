import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Sun, Moon, Bell, Search, Menu, X, ChevronDown, LayoutDashboard, BookOpen, Users, Compass, Layers, LogIn, CheckCheck } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import { AuthModal } from '../AuthModal'
import { dashboardApi } from '../../lib/services'
import type { ApiNotification } from '../../types/api'
import clsx from 'clsx'

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function Navbar() {
  const { dark, toggle } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<ApiNotification[]>([])
  const [notifRead, setNotifRead] = useState<Set<string>>(new Set())
  const notifRef = useRef<HTMLDivElement>(null)
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'register' }>({ open: false, mode: 'login' })

  // Load notifications when authenticated
  useEffect(() => {
    if (!isAuthenticated) return
    dashboardApi.notifications()
      .then(res => setNotifications(res.data ?? []))
      .catch(() => {})
  }, [isAuthenticated])

  // Close notif panel on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [notifOpen])

  const unreadCount = notifications.filter(n => !n.isRead && !notifRead.has(n.id)).length

  const handleNotifOpen = () => {
    setNotifOpen(o => !o)
    setProfileOpen(false)
  }

  const markAllRead = () => {
    setNotifRead(new Set(notifications.map(n => n.id)))
  }

  const formatNotifTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  const navItems = [
    { label: 'Discover', path: '/discover', icon: <Compass size={16} /> },
    { label: 'Templates', path: '/templates', icon: <Layers size={16} /> },
  ]

  const handleLogout = async () => {
    setProfileOpen(false)
    await logout()
    navigate('/')
  }

  const roleLabel = () => {
    if (!user) return ''
    if (user.role === 'DUAL') return 'Learner & Guide'
    return user.role.charAt(0) + user.role.slice(1).toLowerCase()
  }

  return (
    <>
      <nav className="sticky top-0 z-50 glass border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center shadow-brand">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M2 9 C2 5.5 5.5 3 9 3 C12.5 3 16 5.5 16 9" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                    <path d="M5 12 L9 8 L13 12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="9" cy="8" r="1.5" fill="white"/>
                  </svg>
                </div>
                <span className="font-display font-bold text-[var(--text-primary)] text-lg tracking-tight">
                  Skill<span className="text-brand-500">Bridge</span>
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                {navItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={clsx(
                      'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive(item.path)
                        ? 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]'
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex-1 max-w-sm hidden sm:block">
              <button
                onClick={() => navigate('/discover')}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] text-sm text-[var(--text-muted)] hover:border-brand-300 transition-all"
              >
                <Search size={15} />
                <span>Search sessions...</span>
                <kbd className="ml-auto text-xs bg-[var(--bg-muted)] px-1.5 py-0.5 rounded-md font-mono">⌘K</kbd>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button className="btn-ghost w-9 h-9 rounded-xl p-0" onClick={toggle}>
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {isAuthenticated ? (
                <>
                  <div className="relative" ref={notifRef}>
                    <button
                      className="btn-ghost w-9 h-9 rounded-xl p-0 relative"
                      onClick={handleNotifOpen}
                      aria-label="Notifications"
                    >
                      <Bell size={18} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500" />
                      )}
                    </button>

                    {notifOpen && (
                      <div className="absolute right-0 top-full mt-2 w-80 card shadow-soft-lg z-50 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                            Notifications
                            {unreadCount > 0 && (
                              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-500 text-white text-xs font-bold">
                                {unreadCount}
                              </span>
                            )}
                          </h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllRead}
                              className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 font-medium"
                            >
                              <CheckCheck size={13} /> Mark all read
                            </button>
                          )}
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                              <Bell size={24} className="mx-auto mb-2 text-[var(--text-muted)] opacity-40" />
                              <p className="text-sm text-[var(--text-muted)]">No notifications yet</p>
                            </div>
                          ) : (
                            notifications.map(n => {
                              const isUnread = !n.isRead && !notifRead.has(n.id)
                              return (
                                <div
                                  key={n.id}
                                  className={clsx(
                                    'flex items-start gap-3 px-4 py-3 border-b border-[var(--border)] last:border-0 transition-colors',
                                    isUnread ? 'bg-brand-50/60 dark:bg-brand-950/40' : 'hover:bg-[var(--bg-muted)]'
                                  )}
                                >
                                  <div className={clsx(
                                    'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                                    isUnread ? 'bg-brand-500' : 'bg-transparent'
                                  )} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[var(--text-primary)] leading-snug">{n.title}</p>
                                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">{n.message}</p>
                                    <p className="text-xs text-[var(--text-muted)] mt-1">{formatNotifTime(n.createdAt)}</p>
                                  </div>
                                </div>
                              )
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-2xl hover:bg-[var(--bg-muted)] transition-all"
                      onClick={() => setProfileOpen(o => !o)}
                    >
                      <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-xs font-bold text-brand-700 dark:text-brand-300">
                        {user ? getInitials(user.name) : '?'}
                      </div>
                      <ChevronDown size={14} className={clsx('text-[var(--text-muted)] transition-transform', profileOpen && 'rotate-180')} />
                    </button>
                    {profileOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 w-56 card shadow-soft-lg z-50 py-1.5 overflow-hidden">
                          <div className="px-4 py-3 border-b border-[var(--border)]">
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{user?.name}</p>
                            <p className="text-xs text-[var(--text-muted)]">{roleLabel()}</p>
                          </div>
                          {[
                            { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={15} /> },
                            { label: 'My Bookings', path: '/dashboard/learner', icon: <BookOpen size={15} /> },
                            ...(user?.role === 'GUIDE' || user?.role === 'DUAL'
                              ? [{ label: 'Teaching', path: '/dashboard/teacher', icon: <Users size={15} /> }]
                              : []),
                            { label: 'Profile', path: '/profile', icon: null },
                          ].map(item => (
                            <Link key={item.path} to={item.path}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)] transition-colors"
                              onClick={() => setProfileOpen(false)}
                            >
                              {item.icon}{item.label}
                            </Link>
                          ))}
                          <div className="border-t border-[var(--border)] mt-1 pt-1">
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors">
                              Sign out
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => setAuthModal({ open: true, mode: 'login' })} className="btn-ghost text-sm px-3 py-2 hidden sm:flex items-center gap-1.5">
                    <LogIn size={15} />Sign in
                  </button>
                  <button onClick={() => setAuthModal({ open: true, mode: 'register' })} className="btn-primary text-sm px-4 py-2">
                    Get started
                  </button>
                </div>
              )}

              <button className="btn-ghost w-9 h-9 rounded-xl p-0 md:hidden" onClick={() => setMobileOpen(o => !o)}>
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg)] px-4 py-3 space-y-1">
            <div className="mb-3">
              <button onClick={() => { navigate('/discover'); setMobileOpen(false) }} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] text-sm text-[var(--text-muted)]">
                <Search size={15} />Search sessions...
              </button>
            </div>
            {navItems.map(item => (
              <Link key={item.path} to={item.path}
                className={clsx('flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors', isActive(item.path) ? 'bg-brand-50 text-brand-600 dark:bg-brand-950' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}
                onClick={() => setMobileOpen(false)}
              >
                {item.icon}{item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {authModal.open && (
        <AuthModal defaultMode={authModal.mode} onClose={() => setAuthModal({ open: false, mode: 'login' })} />
      )}
    </>
  )
}