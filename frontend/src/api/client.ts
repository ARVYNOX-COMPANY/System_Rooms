const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

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