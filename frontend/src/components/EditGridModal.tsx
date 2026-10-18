import { EditGridContent } from './EditGridContent'
import type { Room } from '../types/room'
import type { GridLayout } from '../types/gridLayout'

interface EditGridModalProps {
  open: boolean
  rooms: Room[]
  initialLayout: GridLayout
  onClose: () => void
  onSave: (layout: GridLayout) => void
  onAddFloor: (floor: number) => void
  onToggleRoom: (roomId: string, oculta: boolean) => Promise<void>
  onToggleFloor: (floor: number, oculta: boolean) => Promise<void>
}

export function EditGridModal({
  open,
  rooms,
  initialLayout,
  onClose,
  onSave,
  onAddFloor,
  onToggleRoom,
  onToggleFloor,
}: EditGridModalProps) {
  if (!open) return null

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
              Reordena pisos, ocúltalos, ocultá habitaciones individuales y elegí columnas por fila.
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

        <EditGridContent
          rooms={rooms}
          initialLayout={initialLayout}
          resetSignal={open}
          onSave={(layout) => {
            onSave(layout)
            onClose()
          }}
          onAddFloor={onAddFloor}
          onToggleRoom={onToggleRoom}
          onToggleFloor={onToggleFloor}
          onCancel={onClose}
        />
      </div>
    </div>
  )
}
