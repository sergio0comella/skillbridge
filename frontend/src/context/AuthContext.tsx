import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { authApi, type AuthData } from '../lib/services'
import { setAccessToken } from '../lib/api'
import type { ApiUser } from '../types/api'

interface AuthContextType {
  user: ApiUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role?: 'LEARNER' | 'GUIDE' | 'DUAL') => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const applyAuth = (data: AuthData) => {
    setAccessToken(data.accessToken)
    setUser(data.user)
  }

  const refreshUser = useCallback(async () => {
    try {
      // Try to refresh the access token using the httpOnly refresh cookie
      const res = await authApi.refresh()
      setAccessToken(res.data.accessToken)
      // Fetch current user profile
      const meRes = await authApi.me()
      setUser(meRes.data)
    } catch {
      setUser(null)
      setAccessToken(null)
    }
  }, [])

  // On mount: try to restore session via refresh cookie
  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false))
  }, [refreshUser])

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password })
    applyAuth(res.data)
  }

  const register = async (name: string, email: string, password: string, role: 'LEARNER' | 'GUIDE' | 'DUAL' = 'LEARNER') => {
    const res = await authApi.register({ name, email, password, role })
    applyAuth(res.data)
  }

  const logout = async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    setUser(null)
    setAccessToken(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
