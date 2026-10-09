import type { Room, RoomStatus } from '../types/room'
import { apiFetch } from './client'

interface HabitacionBackend {
  id: number
  numero: string
  tipo: string
  piso: number
  estado: RoomStatus
  precio_base: number
}

function mapHabitacion(h: HabitacionBackend): Room {
  return {
    id: h.numero,
    number: h.numero,
    floor: h.piso,
    type: h.tipo,
    status: h.estado,
  }
}

export async function getRooms(): Promise<Room[]> {
  const data = await apiFetch<HabitacionBackend[]>('/habitaciones/')
  return data.map(mapHabitacion)
}