import { RoomGrid } from '../components/RoomGrid'
import { RoomSummary } from '../components/RoomSummary'
import { useRooms } from '../hooks/useRooms'

export function RoomsPage() {
    const { rooms, loading, error } = useRooms()

    if (loading) {
        return (
            <div className="flex flex-col gap-4">
                <h1 className="text-xl font-semibold">Habitaciones</h1>
                <p className="text-slate-600">Cargando habitaciones...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col gap-4">
                <h1 className="text-xl font-semibold">Habitaciones</h1>
                <p className="text-red-600">Error al cargar: {error}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-xl font-semibold">Habitaciones</h1>
            <RoomSummary rooms={rooms} />
            <RoomGrid rooms={rooms} />
        </div>
    )
}