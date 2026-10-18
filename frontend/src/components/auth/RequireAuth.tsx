import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { fetchMe, isLoggedIn, refreshAccessToken } from '../../api/auth'

/** Protege rutas: sin access intenta renovar con el refresh antes de mandar a /login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    let cancelled = false

    const verify = async () => {
      // Con token: refrescar el rol real desde la DB (fallback al JWT si falla).
      if (isLoggedIn()) {
        await fetchMe()
        if (!cancelled) setAllowed(true)
        if (!cancelled) setChecking(false)
        return
      }
      // Sin token: intentar renovar con el refresh.
      try {
        await refreshAccessToken()
        await fetchMe()
        if (!cancelled) setAllowed(true)
      } catch {
        if (!cancelled) setAllowed(false)
      } finally {
        if (!cancelled) setChecking(false)
      }
    }

    verify()

    return () => {
      cancelled = true
    }
  }, [])

  if (checking) {
    return <p className="p-6 text-sm text-slate-500">Verificando sesión...</p>
  }
  if (!allowed) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
