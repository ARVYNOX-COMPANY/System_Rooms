const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
  return res.json()
}