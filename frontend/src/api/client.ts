import { clearTokens, getAccessToken } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

function redirectToLogin(): void {
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401 && !path.startsWith('/auth/')) {
    // Sesión inválida o vencida: limpiar y pedir login de nuevo.
    // (No se intenta refresh automático aquí para evitar loops; lo hace RequireAuth.)
    clearTokens()
    redirectToLogin()
    throw new Error('Sesión vencida: vuelve a ingresar.')
  }

  if (!res.ok) {
    try {
      const body = (await res.json()) as { detail?: string }
      if (body?.detail) throw new Error(body.detail)
    } catch (e) {
      if (e instanceof Error && !e.message.startsWith('Error ')) throw e
    }
    throw new Error(`Error ${res.status}: ${res.statusText}`)
  }
  return res.json()
}
