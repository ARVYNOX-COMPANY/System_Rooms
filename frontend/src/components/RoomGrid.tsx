import { useState } from 'react'
import type { Room, RoomFilterValues } from '../types/room'
import { RoomCard } from './RoomCard'
import { RoomFilters } from './RoomFilters'
import {
    DEFAULT_FILTERS,
    filterRooms,
    getUniqueFloors,
    getUniqueTypes,
} from '../utils/filterRooms'

interface RoomGridProps {
    rooms: Room[]
}

export function RoomGrid({ rooms }: RoomGridProps) {
    const [filters, setFilters] = useState<RoomFilterValues>(DEFAULT_FILTERS)

    const visibleRooms = filterRooms(rooms, filters)

    return (
        <section className="flex flex-col gap-4">
            <RoomFilters
                filters={filters}
                floors={getUniqueFloors(rooms)}
                types={getUniqueTypes(rooms)}
                onChange={setFilters}
            />

            {visibleRooms.length === 0 ? (
                <p className="text-slate-600">Ninguna habitación coincide con los filtros.</p>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {visibleRooms.map((room) => (
                        <RoomCard key={room.id} room={room} />
                    ))}
                </div>
            )}
        </section>
    )
}