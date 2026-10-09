import type { Room, RoomStatus } from '../types/room'

export function countByStatus(rooms: Room[]): Record<RoomStatus, number> {
    const counts: Record<RoomStatus, number> = { LIBRE: 0, OCUPADA: 0, SUCIA: 0 }

    for (const room of rooms) {
        counts[room.status] += 1
    }

    return counts
}