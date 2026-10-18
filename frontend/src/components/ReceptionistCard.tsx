import { CheckIcon, NoSymbolIcon } from '@heroicons/react/24/outline'
import type { Receptionist } from '../api/receptionists'

interface ReceptionistCardProps {
  receptionist: Receptionist
  onAccept: (id: number) => void
  onBlock: (id: number) => void
}

export function ReceptionistCard({ receptionist, onAccept, onBlock }: ReceptionistCardProps) {
  const blocked = receptionist.status === 'bloqueado'
  const accepted = receptionist.status === 'aceptado'
  const initial = receptionist.name.trim().charAt(0).toUpperCase()

  return (
    <article
      className={`flex flex-col gap-2 rounded-lg border p-3 text-center transition ${
        accepted
          ? 'border-green-300 bg-green-50'
          : blocked
            ? 'border-slate-200 bg-slate-50 opacity-50'
            : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-2 text-left">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{receptionist.name}</p>
          <p className="truncate text-xs text-slate-500">{receptionist.email}</p>
          <p className="text-xs text-slate-500">Edad: {receptionist.age ?? '—'}</p>
        </div>
      </div>

      {accepted && <p className="text-xs font-medium text-green-700">Estado: Activo (Aprobado)</p>}
      {blocked && <p className="text-xs font-medium text-slate-500">Estado: Bloqueado</p>}
      {receptionist.status === 'pendiente' && (
        <p className="text-xs font-medium text-amber-700">Estado: Pendiente</p>
      )}

      <div className="flex gap-2">
        {(receptionist.status === 'pendiente' || blocked) && (
          <button
            type="button"
            onClick={() => onAccept(receptionist.id)}
            title="Aceptar recepcionista"
            aria-label={`Aceptar a ${receptionist.name}`}
            className="flex flex-1 items-center justify-center rounded-md bg-green-600 px-2 py-1.5 text-white transition hover:bg-green-700"
          >
            <CheckIcon className="h-4 w-4" />
          </button>
        )}
        {(receptionist.status === 'pendiente' || accepted) && (
          <button
            type="button"
            onClick={() => onBlock(receptionist.id)}
            title="Bloquear recepcionista"
            aria-label={`Bloquear a ${receptionist.name}`}
            className="flex flex-1 items-center justify-center rounded-md bg-slate-500 px-2 py-1.5 text-white transition hover:bg-slate-600"
          >
            <NoSymbolIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </article>
  )
}