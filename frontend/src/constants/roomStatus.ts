import type { RoomStatus } from '../types/room'

export const STATUS_ORDER: RoomStatus[] = ['LIBRE', 'OCUPADA', 'SUCIA']

export const STATUS_LABEL: Record<RoomStatus, string> = {
  LIBRE: 'Libre',
  OCUPADA: 'Ocupada',
  SUCIA: 'Sucia',
}

export const STATUS_CARD_STYLES: Record<RoomStatus, string> = {
  LIBRE: 'bg-green-100 border-green-300',
  OCUPADA: 'bg-red-100 border-red-300',
  SUCIA: 'bg-yellow-100 border-yellow-300',
}

export const STATUS_DOT_STYLES: Record<RoomStatus, string> = {
  LIBRE: 'bg-green-400',
  OCUPADA: 'bg-red-400',
  SUCIA: 'bg-yellow-400',
}

export const SUMMARY_LABEL: Record<RoomStatus, string> = {
  LIBRE: 'Libres',
  OCUPADA: 'Ocupadas',
  SUCIA: 'Sucias',
}

export const STATUS_TEXT_STYLES: Record<RoomStatus, string> = {
  LIBRE: 'text-green-700',
  OCUPADA: 'text-red-700',
  SUCIA: 'text-yellow-700',
}

export const STATUS_BADGE_STYLES: Record<RoomStatus, string> = {
  LIBRE: 'bg-green-700 text-white',
  OCUPADA: 'bg-red-700 text-white',
  SUCIA: 'bg-yellow-700 text-white',
}