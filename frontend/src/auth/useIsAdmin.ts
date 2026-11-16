import { useEffect, useState } from 'react'
import { adminApi } from '../api/endpoints'
import { useAuth } from './AuthContext'

/** True when the signed-in user is the story author (asked once per signed-in user). */
export function useIsAdmin(): boolean {
  const { user } = useAuth()
  const [admin, setAdmin] = useState<{ id: number; admin: boolean } | null>(null)
  useEffect(() => {
    if (!user) return
    let alive = true
    adminApi
      .status()
      .then((r) => alive && setAdmin({ id: user.id, admin: r.admin === true }))
      .catch(() => alive && setAdmin({ id: user.id, admin: false }))
    return () => {
      alive = false
    }
  }, [user])
  return !!user && admin?.id === user.id && admin.admin
}
