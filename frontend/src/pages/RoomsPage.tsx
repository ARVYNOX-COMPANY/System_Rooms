import { useEffect, useMemo, useState } from 'react'
import { CreateRoomModal } from '../components/CreateRoomModal'
import { EditGridModal } from '../components/EditGridModal'
import { RoomGrid } from '../components/RoomGrid'
import { RoomSummary } from '../components/RoomSummary'
import { useGridLayout } from '../hooks/useGridLayout'
import { useRooms } from '../hooks/useRooms'
import type { CreateRoomData } from '../schemas/roomSchema'
import type { GridLayout } from '../types/gridLayout'
import { getUniqueFloors } from '../utils/filterRooms'
import { getSessionRole } from '../api/auth'
// import { toggleOculta } from '../api/rooms'
import { toggleOculta, togglePisoOculta } from '../api/rooms'

export function RoomsPage() {
    const { rooms, loading, error, saving, addRoom, reload } = useRooms()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isGridOpen, setIsGridOpen] = useState(false)
    const [prefillFloor, setPrefillFloor] = useState(1)
    const [serverError, setServerError] = useState<string | null>(null)

    const isAdmin = getSessionRole() === 'ADMIN'

    const allFloors = useMemo(() => getUniqueFloors(rooms), [rooms])
    const { layout, syncFloors, setLayout } = useGridLayout()

    // Filtrar habitaciones ocultas
    const visibleRooms = useMemo(
        () => rooms.filter((r) => !r.oculta),
        [rooms],
    )

    useEffect(() => {
        syncFloors(allFloors)
    }, [allFloors, syncFloors])

    const openForFloor = (floor: number) => {
        setPrefillFloor(floor)
        setServerError(null)
        setIsModalOpen(true)
    }

    const handleCreate = async (input: CreateRoomData) => {
        setServerError(null)
        try {
            await addRoom(input)
            setIsModalOpen(false)
        } catch (e) {
            setServerError(e instanceof Error ? e.message : 'No se pudo crear la habitación')
        }
    }

    const handleSaveGrid = (next: GridLayout) => {
        setLayout(next)
        try {
            localStorage.setItem('room-grid-layout', JSON.stringify(next))
        } catch {
            // ignorar errores de storage
        }
        setIsGridOpen(false)
    }

    // Handler dentro del componente (tiene acceso a reload)
    const handleToggleRoom = async (roomId: string, oculta: boolean) => {
        try {
            await toggleOculta(roomId, oculta)
            reload()
        } catch (err) {
            console.error('Error al ocultar habitación:', err)
        }
    }

    // Handler para ocultar/mostrar todas las habitaciones de un piso
    const handleToggleFloor = async (floor: number, oculta: boolean) => {
        try {
            await togglePisoOculta(floor, oculta)
            reload()
        } catch (err) {
            console.error('Error al ocultar piso:', err)
            throw err
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Habitaciones</h1>
                {isAdmin && (
                    <button
                        type="button"
                        onClick={() => openForFloor(1)}
                        className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
                    >
                        Nueva habitación
                    </button>
                )}
            </div>

            {loading ? (
                <p className="text-slate-600">Cargando habitaciones...</p>
            ) : error ? (
                <p className="text-red-600">Error al cargar: {error}</p>
            ) : (
                <>
                    <RoomSummary rooms={visibleRooms} />
                    <RoomGrid
                        rooms={visibleRooms}
                        layout={layout}
                        onAddFloor={isAdmin ? openForFloor : undefined}
                        onEditGrid={() => setIsGridOpen(true)}
                    />
                </>
            )}

            <CreateRoomModal
                open={isModalOpen}
                saving={saving}
                serverError={serverError}
                initialFloor={prefillFloor}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreate}
            />

            <EditGridModal
                open={isGridOpen}
                rooms={rooms}
                initialLayout={layout}
                onClose={() => setIsGridOpen(false)}
                onSave={handleSaveGrid}
                onAddFloor={(floor) => {
                    setIsGridOpen(false)
                    openForFloor(floor)
                }}
                onToggleRoom={handleToggleRoom}
                onToggleFloor={handleToggleFloor}
            />
        </div>
    )
}