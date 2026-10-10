import { useMemo, useState } from 'react'
import { Squares2X2Icon } from '@heroicons/react/24/outline'
import type { Room, RoomFilterValues } from '../types/room'
import type { GridLayout } from '../types/gridLayout'
import { AddRoomCard } from './AddRoomCard'
import { RoomCard } from './RoomCard'
import { RoomFilters } from './RoomFilters'
import {
    DEFAULT_FILTERS,
    filterRooms,
    getUniqueFloors,
    getUniqueTypes,
    groupRoomsByFloor,
} from '../utils/filterRooms'

interface RoomGridProps {
    rooms: Room[]
    layout: GridLayout
    onAddFloor: (floor: number) => void
    onEditGrid: () => void
}

function gridClass(columns: GridLayout['columns']): string {
    if (columns === 4) return 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4'
    if (columns === 5) return 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
    return 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
}

export function RoomGrid({ rooms, layout, onAddFloor, onEditGrid }: RoomGridProps) {
    const [filters, setFilters] = useState<RoomFilterValues>(DEFAULT_FILTERS)

    const visibleRooms = useMemo(
        () => filterRooms(rooms, filters).filter((r) => !layout.hiddenFloors.includes(r.floor)),
        [rooms, filters, layout.hiddenFloors],
    )
    const groups = useMemo(() => {
        const grouped = groupRoomsByFloor(visibleRooms)
        const orderIdx = new Map(layout.floorOrder.map((f, i) => [f, i]))
        return [...grouped].sort((a, b) => (orderIdx.get(a.floor) ?? 999) - (orderIdx.get(b.floor) ?? 999))
    }, [visibleRooms, layout.floorOrder])
    const cls = gridClass(layout.columns)

    return (
        <section className="flex flex-col gap-4">
            <RoomFilters
                filters={filters}
                floors={getUniqueFloors(rooms)}
                types={getUniqueTypes(rooms)}
                onChange={setFilters}
            />
            <div className="flex justify-end">
                <button
                    type="button"
                    title="Editar grilla"
                    aria-label="Editar grilla"
                    onClick={onEditGrid}
                    className="rounded-full border border-slate-300 bg-white p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                >
                    <Squares2X2Icon className="h-4 w-4" />
                </button>
            </div>

            {visibleRooms.length === 0 ? (
                <div className="flex flex-col gap-3">
                    <p className="text-slate-600">Ninguna habitación coincide con los filtros.</p>
                    {filters.floor !== 'all' && (
                        <div className={cls}>
                            <AddRoomCard floor={filters.floor} onClick={() => onAddFloor(filters.floor as number)} />
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {groups.map(({ floor, rooms: floorRooms }) => (
                        <div key={floor} className={cls}>
                            {floorRooms.map((room) => (
                                <RoomCard key={room.id} room={room} />
                            ))}
                            <AddRoomCard floor={floor} onClick={() => onAddFloor(floor)} />
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}
