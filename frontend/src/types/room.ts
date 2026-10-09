export type RoomStatus = 'LIBRE' | 'OCUPADA' | 'SUCIA'

export interface Room {
  id: string
  number: string
  floor: number
  type: string
  status: RoomStatus
  guestName?: string
  checkOutDate?: string
}

export interface RoomFilterValues {
  status: RoomStatus | 'all'
  floor: number | 'all'
  type: string 
  search: string
}