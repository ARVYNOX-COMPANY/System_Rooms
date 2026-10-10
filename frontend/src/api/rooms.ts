import type { CreateRoomInput } from '../schemas/roomSchema'
import type { Room, RoomStatus } from '../types/room'
import { apiFetch } from './client'

interface RoomApiData {
  id: number
  numero: string
  tipo: string
  piso: number
  estado: RoomStatus
  precio_base: number
}

function mapRoom(h: RoomApiData): Room {
  return {
    id: String(h.id),
    number: h.numero,
    floor: h.piso,
    type: h.tipo,
    status: h.estado,
    price: Number(h.precio_base) // Asegurarse de que el precio sea un número
  }
}

export async function getRooms(): Promise<Room[]> {
  const data = await apiFetch<RoomApiData[]>('/habitaciones/')
  return data.map(mapRoom)
}

export async function createRoom(input: CreateRoomInput): Promise<Room> {
  const data = await apiFetch<RoomApiData | { habitacion: RoomApiData }>('/habitaciones/', {
    method: 'POST',
    body: JSON.stringify({
      numero: input.numero.trim(),
      tipo: input.tipo,
      piso: Number(input.piso),
      precio_base: Number(input.precio_base),
      estado: input.estado ?? 'LIBRE',
    }),
  })

  const raw = 'habitacion' in data ? data.habitacion : data
  return mapRoom(raw)
}