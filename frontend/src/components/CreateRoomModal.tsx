import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createRoomSchema, type CreateRoomData, type CreateRoomInput } from '../schemas/roomSchema'
import { STATUS_DOT_STYLES, STATUS_LABEL, STATUS_ORDER } from '../constants/roomStatus'

interface CreateRoomModalProps {
  open: boolean
  saving: boolean
  serverError: string | null
  initialFloor?: number
  onClose: () => void
  onSubmit: (input: CreateRoomData) => Promise<void>
}

const inputClass = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none'

export function CreateRoomModal({ open, saving, serverError, initialFloor = 1, onClose, onSubmit }: CreateRoomModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateRoomInput, unknown, CreateRoomData>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: { numero: '', tipo: 'SIMPLE', piso: 1, precio_base: 50, estado: 'LIBRE' },
  })
  const estadoValue = watch('estado')

  useEffect(() => {
    if (open) reset({ numero: '', tipo: 'SIMPLE', piso: initialFloor, precio_base: 50, estado: 'LIBRE' })
  }, [open, initialFloor, reset])

  useEffect(() => {
    if (serverError?.toLowerCase().includes('numero')) {
      setError('numero', { message: serverError })
    }
  }, [serverError, setError])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">Nueva habitación</h2>

        <form
          className="mt-4 flex flex-col gap-3"
          onSubmit={handleSubmit((data) => onSubmit(data))}
        >
          <div>
            <label className="text-sm font-medium">Número</label>
            <input {...register('numero')} placeholder="101" className={inputClass} />
            {errors.numero && <p className="text-sm text-red-600">{errors.numero.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Tipo</label>
            <select {...register('tipo')} className={inputClass}>
              <option value="SIMPLE">Simple</option>
              <option value="DOBLE">Doble</option>
              <option value="SUITE">Suite</option>
            </select>
            {errors.tipo && <p className="text-sm text-red-600">{errors.tipo.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Piso</label>
              <input {...register('piso', { valueAsNumber: true })} type="number" min={1} max={50} className={inputClass} />
              {errors.piso && <p className="text-sm text-red-600">{errors.piso.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Precio base</label>
              <input {...register('precio_base', { valueAsNumber: true })} type="number" min={0.01} step={0.01} className={inputClass} />
              {errors.precio_base && <p className="text-sm text-red-600">{errors.precio_base.message}</p>}
            </div>
          </div>

          <div>
            <span className="text-sm font-medium">Estado inicial</span>
            <div className="mt-1 flex flex-wrap gap-2" role="group" aria-label="Estado inicial">
              {STATUS_ORDER.map((s) => {
                const active = estadoValue === s
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setValue('estado', s, { shouldValidate: true })}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${active
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${STATUS_DOT_STYLES[s]}`} aria-hidden />
                    {STATUS_LABEL[s]}
                  </button>
                )
              })}
            </div>
            {errors.estado && <p className="text-sm text-red-600">{errors.estado.message}</p>}
          </div>

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
