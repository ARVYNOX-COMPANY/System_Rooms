import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { CreateRoomModal } from '../components/CreateRoomModal'
import { EditGridContent } from '../components/EditGridContent'
import { ReceptionistCard } from '../components/ReceptionistCard'
import { getSessionRole } from '../api/auth'
import {
  getReceptionists,
  updateReceptionistStatus,
  type Receptionist,
} from '../api/receptionists'
import { toggleOculta, togglePisoOculta } from '../api/rooms'
import { useGridLayout } from '../hooks/useGridLayout'
import { useRooms } from '../hooks/useRooms'
import type { CreateRoomData } from '../schemas/roomSchema'
import type { GridLayout } from '../types/gridLayout'
import { getUniqueFloors } from '../utils/filterRooms'

type Tab = 'aceptar' | 'hotel'

export function DashboardPage() {
  const role = getSessionRole()
  const isAdmin = role === 'ADMIN'
  const isSupervisor = role === 'SUPERVISOR'
  const canAccess = isAdmin || isSupervisor

  const [tab, setTab] = useState<Tab>(isAdmin ? 'aceptar' : 'hotel')
  const [items, setItems] = useState<Receptionist[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadReceptionists = useCallback(async () => {
    if (!isAdmin) return
    setLoading(true)
    setError(null)
    try {
      const data = await getReceptionists()
      setItems(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar la lista')
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    if (isAdmin && tab === 'aceptar') {
      loadReceptionists()
    }
  }, [isAdmin, tab, loadReceptionists])

  useEffect(() => {
    if (isSupervisor && tab === 'aceptar') {
      setTab('hotel')
    }
  }, [isSupervisor, tab])

  if (!canAccess) {
    return <Navigate to="/" replace />
  }

  const handleStatusChange = async (id: number, action: 'accept' | 'block') => {
    try {
      await updateReceptionistStatus(id, action)
      await loadReceptionists()
    } catch (e) {
      console.error('Error al cambiar estado del recepcionista:', e)
    }
  }

  const pendingCount = items.filter((r) => r.status === 'pendiente').length

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-500">
        Dashboard <span aria-hidden="true">›</span>{' '}
        {tab === 'aceptar' ? 'Recepcionistas' : 'Editar Hotel'}
      </p>

      <div className="flex gap-2 border-b border-slate-200">
        {isAdmin && (
          <TabButton active={tab === 'aceptar'} onClick={() => setTab('aceptar')}>
            Aceptar Recepcionistas ({pendingCount} pendientes)
          </TabButton>
        )}
        <TabButton active={tab === 'hotel'} onClick={() => setTab('hotel')}>
          Editar Hotel
        </TabButton>
      </div>

      {isAdmin && tab === 'aceptar' && (
        <section className="flex flex-col gap-3">
          <h1 className="text-xl font-semibold">Recepcionistas por aceptar</h1>

          {loading && <p className="text-slate-600">Cargando recepcionistas...</p>}

          {!loading && error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
              <button
                type="button"
                onClick={loadReceptionists}
                className="ml-2 underline"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <p className="text-slate-600">No hay recepcionistas registrados.</p>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((r) => (
                <ReceptionistCard
                  key={r.id}
                  receptionist={r}
                  onAccept={(id) => handleStatusChange(id, 'accept')}
                  onBlock={(id) => handleStatusChange(id, 'block')}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'hotel' && <HotelGridEditor />}
    </div>
  )
}

/** Misma edición de grilla del modal, embebida en la tab (solo admin). */
function HotelGridEditor() {
  const { rooms, loading, error, saving, addRoom, reload } = useRooms()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [prefillFloor, setPrefillFloor] = useState(1)
  const [serverError, setServerError] = useState<string | null>(null)

  const allFloors = useMemo(() => getUniqueFloors(rooms), [rooms])
  const { layout, syncFloors, setLayout } = useGridLayout()

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
  }

  const handleToggleRoom = async (roomId: string, oculta: boolean) => {
    try {
      await toggleOculta(roomId, oculta)
      reload()
    } catch (err) {
      console.error('Error al ocultar habitación:', err)
    }
  }

  const handleToggleFloor = async (floor: number, oculta: boolean) => {
    try {
      await togglePisoOculta(floor, oculta)
      reload()
    } catch (err) {
      console.error('Error al ocultar piso:', err)
      throw err
    }
  }

  if (loading) return <p className="text-slate-600">Cargando habitaciones...</p>
  if (error) return <p className="text-red-600">Error al cargar: {error}</p>

  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold">Editar Hotel</h1>
      <div className="rounded-lg border border-slate-200 bg-white">
        <EditGridContent
          rooms={rooms}
          initialLayout={layout}
          resetSignal={`order:${layout.floorOrder.join(',')}|cols:${layout.columns}`}
          onSave={handleSaveGrid}
          onAddFloor={openForFloor}
          onToggleRoom={handleToggleRoom}
          onToggleFloor={handleToggleFloor}
        />
      </div>

      <CreateRoomModal
        open={isModalOpen}
        saving={saving}
        serverError={serverError}
        initialFloor={prefillFloor}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
      />
    </section>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'border-b-2 border-slate-900 text-slate-900'
          : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      {children}
    </button>
  )
}