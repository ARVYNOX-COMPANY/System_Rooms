import { useEffect, useMemo, useState } from 'react'
import { RoomCard } from './RoomCard'
import type { Room } from '../types/room'
import type { GridLayout } from '../types/gridLayout'
import { groupRoomsByFloor } from '../utils/filterRooms'

interface EditGridModalProps {
  open: boolean
  rooms: Room[]
  initialLayout: GridLayout
  onClose: () => void
  onSave: (layout: GridLayout) => void
  onAddFloor: (floor: number) => void
}

const gridClassFor = (columns: number) =>
  `grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 ${columns === 4 ? 'xl:grid-cols-4' : columns === 5 ? 'xl:grid-cols-5' : 'xl:grid-cols-6'}`

export function EditGridModal({
  open,
  rooms,
  initialLayout,
  onClose,
  onSave,
  onAddFloor,
}: EditGridModalProps) {
  const allFloors = useMemo(
    () => [...new Set(rooms.map((r) => r.floor))].sort((a, b) => a - b),
    [rooms],
  )
  const [floorOrder, setFloorOrder] = useState<number[]>(initialLayout.floorOrder)
  const [hidden, setHidden] = useState<number[]>(initialLayout.hiddenFloors)
  const [hiddenRooms, setHiddenRooms] = useState<string[]>(
    initialLayout.hiddenRooms ?? [],
  )
  const [columns, setColumns] = useState<4 | 5 | 6>(initialLayout.columns)
  const [newFloor, setNewFloor] = useState('')     // ← estado del input de nuevo piso

  useEffect(() => {
    if (!open) return
    const sorted = [...allFloors].sort((a, b) => a - b)
    const existing = initialLayout.floorOrder.filter(
      (f) => sorted.includes(f) || allFloors.includes(f),
    )
    const merged =
      existing.length > 0
        ? [...existing, ...sorted.filter((f) => !existing.includes(f))]
        : sorted
    setFloorOrder(merged.length > 0 ? merged : sorted)
    setHidden(initialLayout.hiddenFloors)
    setHiddenRooms(initialLayout.hiddenRooms ?? [])
    setColumns(initialLayout.columns)
    setNewFloor('')                                 // ← limpiar input al abrir
  }, [open, allFloors, initialLayout])

  const counts = useMemo(() => {
    const map = new Map<number, number>()
    for (const r of rooms) map.set(r.floor, (map.get(r.floor) ?? 0) + 1)
    return map
  }, [rooms])

  const previewGroups = useMemo(() => {
    const visible = rooms.filter((r) => !hidden.includes(r.floor))
    const groups = groupRoomsByFloor(visible)
    const orderIdx = new Map(floorOrder.map((f, i) => [f, i]))
    return [...groups].sort(
      (a, b) => (orderIdx.get(a.floor) ?? 999) - (orderIdx.get(b.floor) ?? 999),
    )
  }, [rooms, hidden, floorOrder])

  if (!open) return null

  const move = (floor: number, dir: -1 | 1) => {
    setFloorOrder((prev) => {
      const idx = prev.indexOf(floor)
      const next = idx + dir
      if (idx === -1 || next < 0 || next >= prev.length) return prev
      const copy = [...prev]
      ;[copy[idx], copy[next]] = [copy[next], copy[idx]]
      return copy
    })
  }

  const toggleFloor = (floor: number) =>
    setHidden((prev) =>
      prev.includes(floor) ? prev.filter((f) => f !== floor) : [...prev, floor],
    )

  const toggleRoom = (roomId: string) =>
    setHiddenRooms((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId],
    )

  const handleAddFloor = (e: React.FormEvent) => {
    e.preventDefault()
    const num = Number(newFloor)
    if (!num || num < 1) return
    onAddFloor(num)
    setNewFloor('')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-lg font-semibold">Editar grilla de habitaciones</h2>
            <p className="text-sm text-slate-500">
              Reordena pisos, oculta los que no uses, ocultá habitaciones individuales y elegí columnas por fila.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-md px-2 py-1 text-xl text-slate-500 hover:bg-slate-100"
          >
            ×
          </button>
        </div>

        <div className="grid flex-1 gap-4 overflow-auto p-5 md:grid-cols-[280px_1fr]">
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">Configuración de pisos</h3>
            {floorOrder.length === 0 && (
              <p className="text-sm text-slate-500">Aún no hay pisos.</p>
            )}
            {floorOrder.map((floor) => {
              const isHidden = hidden.includes(floor)
              return (
                <div
                  key={floor}
                  className={`flex items-center gap-2 rounded-lg border p-3 ${
                    isHidden
                      ? 'border-slate-200 bg-slate-50 opacity-70'
                      : 'border-slate-200'
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm text-white">
                    {floor}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Piso {floor}</p>
                    <p className="text-xs text-slate-500">
                      Habitaciones: {counts.get(floor) ?? 0}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <button
                      type="button"
                      aria-label="Subir"
                      onClick={() => move(floor, -1)}
                      className="px-1 text-slate-500 hover:text-slate-900"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      aria-label="Bajar"
                      onClick={() => move(floor, 1)}
                      className="px-1 text-slate-500 hover:text-slate-900"
                    >
                      ▼
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label={isHidden ? 'Mostrar piso' : 'Ocultar piso'}
                    aria-pressed={isHidden}
                    onClick={() => toggleFloor(floor)}
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                  >
                    {isHidden ? 'Mostrar' : 'Ocultar'}
                  </button>
                </div>
              )
            })}

            {/* ⭐ Nuevo piso: input vacío, no auto-rellena */}
            <form onSubmit={handleAddFloor} className="flex gap-2">
              <input
                type="number"
                min={1}
                value={newFloor}
                onChange={(e) => setNewFloor(e.target.value)}
                placeholder="Nuevo piso"
                className="input flex-1"
              />
              <button
                type="submit"
                disabled={!newFloor}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                title="Agregar piso"
              >
                +
              </button>
            </form>

            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-medium">Columnas por fila</p>
              <div className="mt-2 flex gap-2" role="group" aria-label="Columnas">
                {[4, 5, 6].map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={columns === c}
                    onClick={() => setColumns(c as 4 | 5 | 6)}
                    className={`flex-1 rounded-md border px-3 py-1.5 text-sm ${
                      columns === c
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4">
            <div className="rounded-md bg-slate-100 p-3 text-sm">
              <p className="font-medium">Vista previa de la grilla</p>
              <p className="text-xs text-slate-500">
                Hacé click en 👁 para ocultar habitaciones individuales.
              </p>
            </div>
            <div className="flex max-h-[50vh] flex-col gap-3 overflow-auto">
              {previewGroups.map(({ floor, rooms: floorRooms }) => (
                <div key={floor}>
                  <p className="mb-2 text-xs font-semibold text-slate-500">
                    Piso {floor}
                  </p>
                  <div className={gridClassFor(columns)}>
                    {floorRooms.map((room) => {
                      const isRoomHidden = hiddenRooms.includes(room.id)
                      return (
                        <div key={room.id} className="relative">
                          <div className={isRoomHidden ? 'opacity-40' : ''}>
                            <RoomCard room={room} />
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleRoom(room.id)}
                            className="absolute right-1 top-1 rounded-md bg-white/90 px-2 py-0.5 text-xs shadow hover:bg-white"
                            title={isRoomHidden ? 'Mostrar habitación' : 'Ocultar habitación'}
                          >
                            {isRoomHidden ? '👁' : '🚫'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
              {previewGroups.length === 0 && (
                <p className="text-sm text-slate-500">Todos los pisos están ocultos.</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 p-5">
          <p className="text-xs text-slate-500">
            Los cambios se aplican inmediatamente en la grilla.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() =>
                onSave({ floorOrder, hiddenFloors: hidden, hiddenRooms, columns })
              }
              className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
            >
              ✓ Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}