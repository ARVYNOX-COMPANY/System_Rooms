import type { RoomFilterValues, RoomStatus } from '../types/room'
import { STATUS_DOT_STYLES, STATUS_LABEL, STATUS_ORDER } from '../constants/roomStatus'

interface RoomFiltersProps {
  filters: RoomFilterValues
  floors: number[]
  types: string[]
  onChange: (filters: RoomFilterValues) => void
}

const STATUS_OPTIONS: { value: RoomStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  ...STATUS_ORDER.map((status) => ({ value: status, label: STATUS_LABEL[status] })),
]

const controlClass = 'rounded-md border border-slate-300 bg-white px-3 py-2 text-sm'

export function RoomFilters({ filters, floors, types, onChange }: RoomFiltersProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
        {STATUS_OPTIONS.map((option) => {
          const active = filters.status === option.value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ ...filters, status: option.value })}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${active
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                }`}
            >
              {option.value !== 'all' && (
                <span
                  className={`h-2 w-2 rounded-full ${STATUS_DOT_STYLES[option.value]}`}
                  aria-hidden
                />
              )}
              {option.label}
            </button>
          )
        })}
      </div>

      <select
        aria-label="Filtrar por piso"
        className={controlClass}
        value={String(filters.floor)}
        onChange={(e) =>
          onChange({
            ...filters,
            floor: e.target.value === 'all' ? 'all' : Number(e.target.value),
          })
        }
      >
        <option value="all">Todos los pisos</option>
        {floors.map((floor) => (
          <option key={floor} value={floor}>
            Piso {floor}
          </option>
        ))}
      </select>

      <select
        aria-label="Filtrar por tipo"
        className={controlClass}
        value={filters.type}
        onChange={(e) => onChange({ ...filters, type: e.target.value })}
      >
        <option value="all">Todos los tipos</option>
        {types.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      <input
        type="search"
        aria-label="Buscar habitación o huésped"
        placeholder="Buscar habitación o huésped…"
        className={`${controlClass} w-64`}
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
      />
    </div>
  )
}