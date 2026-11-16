import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '../api/endpoints'
import { ApiError, BACKEND_UNAVAILABLE, backendUnavailable } from '../api/http'
import type { User } from '../api/types'

type AuthState = {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

/** Only a real user object counts as signed in (never an HTML page or other junk). */
function isUser(u: unknown): u is User {
  return !!u && typeof u === 'object' && typeof (u as User).id === 'number' && typeof (u as User).username === 'string'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    authApi
      .me()
      .then((u) => alive && setUser(isUser(u) ? u : null))
      .catch((e: unknown) => {
        if (alive) setUser(null)
        if (!(e instanceof ApiError && (e.status === 401 || e.code === BACKEND_UNAVAILABLE))) console.warn('Session check failed', e)
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const u: unknown = await authApi.login(username, password)
    if (!isUser(u)) throw backendUnavailable()
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => undefined)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
