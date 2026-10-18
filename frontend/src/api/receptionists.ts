import { apiFetch } from './client'

/* ---------- Tipos ---------- */

export type ReceptionistStatus = 'pendiente' | 'aceptado' | 'bloqueado'

export interface Receptionist {
  id: number
  username: string
  name: string           // mapeado de nombre_completo
  email: string
  telefono: string | null
  dni: string | null
  domicilio: string | null
  age: number | null     // mapeado de edad
  status: ReceptionistStatus
}

/** Lo que devuelve el backend tal cual (snake_case + status en inglés). */
interface ReceptionistApiData {
  id: number
  username: string
  nombre_completo: string
  email: string
  telefono: string | null
  dni: string | null
  domicilio: string | null
  edad: number | null
  status: 'PENDING' | 'ACTIVE' | 'BLOCKED'
  role: 'RECEPCIONISTA'
}

/* ---------- Mapeo backend ↔ frontend ---------- */

const STATUS_FROM_API: Record<ReceptionistApiData['status'], ReceptionistStatus> = {
  PENDING: 'pendiente',
  ACTIVE: 'aceptado',
  BLOCKED: 'bloqueado',
}

function mapReceptionist(raw: ReceptionistApiData): Receptionist {
  return {
    id: raw.id,
    username: raw.username,
    name: raw.nombre_completo || raw.username,
    email: raw.email,
    telefono: raw.telefono,
    dni: raw.dni,
    domicilio: raw.domicilio,
    age: raw.edad,
    status: STATUS_FROM_API[raw.status] ?? 'pendiente',
  }
}

/* ---------- Endpoints ---------- */

export async function getReceptionists(): Promise<Receptionist[]> {
  const data = await apiFetch<ReceptionistApiData[]>('/auth/receptionists/')
  return data.map(mapReceptionist)
}

export async function updateReceptionistStatus(
  id: number,
  action: 'accept' | 'block',
): Promise<Receptionist> {
  const status = action === 'accept' ? 'ACTIVE' : 'BLOCKED'
  const data = await apiFetch<ReceptionistApiData>(
    `/auth/receptionists/${id}/status/`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
  )
  return mapReceptionist(data)
}