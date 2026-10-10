import { apiFetch } from './client'
import type { Room } from '../types/room'

interface HabitacionBackend {
  id: number
  numero: string
  tipo: string
  piso: number
  estado: string
  precio_base: number
}

async function findBackendId(roomNumber: string): Promise<number> {
  const habitaciones = await apiFetch<HabitacionBackend[]>('/habitaciones/')
  const target = habitaciones.find(h => h.numero === roomNumber)
  if (!target) throw new Error(`Habitación ${roomNumber} no encontrada`)
  return target.id
}

/**
 * CHECK-IN
 * Cambia el estado de la habitación a OCUPADA.
 */
export async function checkIn(room: Room): Promise<void> {
  const backendId = await findBackendId(room.number)
  await apiFetch(`/habitaciones/${backendId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ estado: 'OCUPADA' }),
  })
}

/**
 * CHECK-OUT
 * Cambia el estado de la habitación a SUCIA.
 */
export async function checkOut(room: Room): Promise<void> {
  const backendId = await findBackendId(room.number)
  await apiFetch(`/habitaciones/${backendId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ estado: 'SUCIA' }),
  })
}

/**
 * LIMPIAR HABITACIÓN
 */
export async function marcarLimpia(room: Room): Promise<void> {
  const backendId = await findBackendId(room.number)
  await apiFetch(`/habitaciones/${backendId}/marcar-limpia/`, {
    method: 'POST',
  })
}