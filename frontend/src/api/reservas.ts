import { apiFetch } from './client'
import type { Reserva } from '../types/reserva'

export async function getReservas(): Promise<Reserva[]> {
  return apiFetch<Reserva[]>('/reservas/')
}

export async function getReservaActivaPorHabitacion(
  numeroHabitacion: string,
): Promise<Reserva | null> {
  const reservas = await getReservas()
  return (
    reservas.find(
      r => r.habitacion_numero === numeroHabitacion && r.estado === 'CHECKIN',
    ) ?? null
  )
}

export async function getReserva(id: number): Promise<Reserva> {
  return apiFetch<Reserva>(`/reservas/${id}/`)
}