import { apiFetch } from './client'

const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'
const USERNAME_KEY = 'session_username'
const SUPERUSER_KEY = 'is_superuser'
const ROLE_KEY = 'role'

export interface TokenPair {
  access: string
  refresh: string
}

export interface MeResponse {
  id: number
  username: string
  role: SessionRole
  is_superuser: boolean
}

export type SessionRole = 'ADMIN' | 'SUPERVISOR' | 'RECEPCIONISTA'

const VALID_ROLES: SessionRole[] = ['ADMIN', 'SUPERVISOR', 'RECEPCIONISTA']

function normalizeRole(raw: unknown, isSuper: boolean): SessionRole {
  const value = typeof raw === 'string' ? raw.toUpperCase() : ''
  return VALID_ROLES.includes(value as SessionRole)
    ? (value as SessionRole)
    : isSuper
      ? 'ADMIN'
      : 'RECEPCIONISTA'
}

/** Escribe rol, is_superuser y username en localStorage. */
function persistSession(role: SessionRole, isSuper: boolean, username: string | null): void {
  try {
    localStorage.setItem(SUPERUSER_KEY, String(isSuper))
    localStorage.setItem(ROLE_KEY, role)
    if (username) localStorage.setItem(USERNAME_KEY, username)
  } catch {}
}

/* ---------- Tokens ---------- */

export function getAccessToken(): string | null {
  try { return localStorage.getItem(ACCESS_KEY) } catch { return null }
}

function getRefreshToken(): string | null {
  try { return localStorage.getItem(REFRESH_KEY) } catch { return null }
}

export function setTokens(pair: TokenPair): void {
  try {
    localStorage.setItem(ACCESS_KEY, pair.access)
    localStorage.setItem(REFRESH_KEY, pair.refresh)
  } catch {}
}

export function clearTokens(): void {
  try {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USERNAME_KEY)
    localStorage.removeItem(SUPERUSER_KEY)
    localStorage.removeItem(ROLE_KEY)
  } catch {}
}

export function isLoggedIn(): boolean {
  return getAccessToken() !== null
}

/* ---------- Username ---------- */

export function getSessionUsername(): string | null {
  try { return localStorage.getItem(USERNAME_KEY) } catch { return null }
}

export function setSessionUsername(username: string): void {
  try { localStorage.setItem(USERNAME_KEY, username.trim()) } catch {}
}

/* ---------- Rol automático desde el JWT ---------- */

/** Decodifica el payload del JWT sin validar firma. */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1]
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

/** Lee el rol directamente del access token y lo sincroniza en localStorage. */
export function syncSessionFromToken(): void {
  const token = getAccessToken()
  if (!token) return

  const payload = decodeJwtPayload(token)
  if (!payload) return

  const isSuper = payload.is_superuser === true
  const role = normalizeRole(payload.role, isSuper)
  const username = (payload.username as string) || null

  persistSession(role, isSuper, username)
}

/* ---------- Lectura del rol (desde localStorage, sincronizado en login) ---------- */

export function IsSuperuser(): boolean {
  try { return localStorage.getItem(SUPERUSER_KEY) === 'true' } catch { return false }
}

export function getSessionRole(): SessionRole {
  if (IsSuperuser()) return 'ADMIN'
  try {
    const saved = localStorage.getItem(ROLE_KEY)
    if (saved === 'ADMIN' || saved === 'SUPERVISOR' || saved === 'RECEPCIONISTA') return saved
  } catch {}
  return 'RECEPCIONISTA'
}

/* ---------- API ---------- */

/**
 * GET /auth/me/ — rol en vivo desde la DB (fuente de verdad).
 * Si falla (red/401/500), devuelve null y se conservan los valores del JWT.
 */
export async function fetchMe(): Promise<MeResponse | null> {
  try {
    const data = await apiFetch<MeResponse>('/auth/me/')
    const isSuper = data.is_superuser === true
    persistSession(normalizeRole(data.role, isSuper), isSuper, data.username)
    return data
  } catch {
    return null
  }
}

export async function login(username: string, password: string): Promise<TokenPair> {
  const data = await apiFetch<TokenPair>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username: username.trim(), password }),
  })

  setTokens({ access: data.access, refresh: data.refresh })
  setSessionUsername(username)
  syncSessionFromToken()   // 🔥 Sincroniza is_superuser y role desde el JWT
  await fetchMe()          // 🔥 Refresca el rol real desde la DB antes del redirect

  return data
}

export async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken()
  if (!refresh) throw new Error('Sin sesión: vuelve a ingresar.')
  const data = await apiFetch<{ access: string }>('/auth/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh }),
  })
  try {
    localStorage.setItem(ACCESS_KEY, data.access)
    syncSessionFromToken()   // 🔥 Re-sincroniza al renovar
  } catch {}
  return data.access
}
