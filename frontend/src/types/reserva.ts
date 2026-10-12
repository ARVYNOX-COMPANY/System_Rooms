export type ReservaEstado = 'PENDIENTE' | 'CHECKIN' | 'CHECKOUT' | 'CANCELADA'

export interface Huesped {
  id: number
  nombre_completo: string
  documento_identidad: string
  telefono: string | null
  email: string | null
}

export interface Reserva {
  id: number
  huesped: Huesped
  habitacion: number
  habitacion_numero: string
  fecha_entrada: string
  fecha_salida: string
  estado: ReservaEstado
  created_at: string
}