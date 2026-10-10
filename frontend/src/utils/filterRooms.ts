import type { Room, RoomFilterValues } from '../types/room'

export const DEFAULT_FILTERS: RoomFilterValues = {
    status: 'all',
    floor: 'all',
    type: 'all',
    search: '',
}

function normalizeText(text: string): string {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
}

export function filterRooms(rooms: Room[], filters: RoomFilterValues): Room[] {
    const query = normalizeText(filters.search)

    return rooms.filter((room) => {
        if (filters.status !== 'all' && room.status !== filters.status) return false
        if (filters.floor !== 'all' && room.floor !== filters.floor) return false
        if (filters.type !== 'all' && room.type !== filters.type) return false

        if (query) {
            const text = normalizeText(`${room.number} ${room.guestName ?? ''}`)
            if (!text.includes(query)) return false
        }

        return true
    })
}

export function getUniqueFloors(rooms: Room[]): number[] {
    return [...new Set(rooms.map((room) => room.floor))].sort((a, b) => a - b)
}

export function getUniqueTypes(rooms: Room[]): string[] {
    return [...new Set(rooms.map((room) => room.type))].sort()
}

export function sortRooms(rooms: Room[]): Room[] {
    return [...rooms].sort((a, b) => {
        if (a.floor !== b.floor) return a.floor - b.floor
        return a.number.localeCompare(b.number, undefined, { numeric: true })
    })
}

export function groupRoomsByFloor(rooms: Room[]): { floor: number; rooms: Room[] }[] {
    const sorted = sortRooms(rooms)
    const map = new Map<number, Room[]>()
    for (const room of sorted) {
        const list = map.get(room.floor) ?? []
        list.push(room)
        map.set(room.floor, list)
    }
    return [...map.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([floor, floorRooms]) => ({ floor, rooms: floorRooms }))
}