import { apiFetch } from './client'
import type { Room } from '../types/room'
import type { Reserva } from '../types/reserva'

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
 * Crea huésped + reserva en el backend y cambia la habitación a OCUPADA.
 * POST /api/v1/reservas/checkin/
 */
export async function checkIn(
  room: Room,
  guest: {
    guestName: string
    documentId: string
    telefono?: string
    email?: string
    checkInDate: string
    checkOutDate: string
  },
): Promise<Reserva> {
  const habitacionId = await findBackendId(room.number)

  return apiFetch<Reserva>('/reservas/checkin/', {
    method: 'POST',
    body: JSON.stringify({
      habitacion_id: habitacionId,
      nombre_completo: guest.guestName,
      documento_identidad: guest.documentId,
      telefono: guest.telefono || '',
      email: guest.email || '',
      fecha_salida: guest.checkOutDate,
    }),
  })
}

/**
 * CHECK-OUT
 * Cierra la reserva y cambia la habitación a SUCIA.
 * POST /api/v1/reservas/{id}/checkout/
 */
export async function checkOut(reservaId: number): Promise<Reserva> {
  return apiFetch<Reserva>(`/reservas/${reservaId}/checkout/`, {
    method: 'POST',
  })
}

/**
 * MARCAR LIMPIA
 * Cambia la habitación de SUCIA a LIBRE.
 */
export async function marcarLimpia(room: Room): Promise<void> {
  const habitacionId = await findBackendId(room.number)
  await apiFetch(`/habitaciones/${habitacionId}/marcar-limpia/`, {
    method: 'POST',
  })
}