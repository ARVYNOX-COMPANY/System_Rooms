import { useEffect, useMemo, useState } from 'react'
import { useRooms } from '../hooks/useRooms'
import { checkIn, checkOut, marcarLimpia  } from '../api/check'
// import { getCheckoutInfo, nightsBetween } from '../utils/checkoutInfo'
import type { Room } from '../types/room'
import type { Reserva } from '../types/reserva'
import { getReservaActivaPorHabitacion } from '../api/reservas'
import { loadGridLayout } from '../types/gridLayout'


type Tab = 'checkin' | 'checkout' | 'limpiar'


export function CheckPage() {
    const [tab, setTab] = useState<Tab>('checkin')
    const { rooms, loading, error, reload } = useRooms()
    const layout = loadGridLayout()

    // ⭐ Filtrar habitaciones ocultas (por piso o individuales)
    const visibleRooms = useMemo(
        () =>
            rooms.filter(
                (r) =>
                    !layout.hiddenFloors.includes(r.floor) &&
                    !layout.hiddenRooms.includes(r.id),
            ),
        [rooms, layout],
    )

    const habitacionesLibres = useMemo(
        () => visibleRooms.filter(r => r.status === 'LIBRE'),
        [visibleRooms],
    )
    const habitacionesOcupadas = useMemo(
        () => visibleRooms.filter(r => r.status === 'OCUPADA'),
        [visibleRooms],
    )
    const habitacionesSucias = useMemo(
        () => visibleRooms.filter(r => r.status === 'SUCIA'),
        [visibleRooms],
    )

    if (loading) return <p className="text-slate-600">Cargando habitaciones...</p>
    if (error) return <p className="text-red-600">Error: {error}</p>

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-xl font-semibold">Recepción</h1>
                <p className="text-sm text-slate-500">
                    Realizá check-in y check-out de huéspedes.
                </p>
            </div>

            <div className="flex gap-2 border-b border-slate-200">
                <TabButton active={tab === 'checkin'} onClick={() => setTab('checkin')}>
                    Check-in ({habitacionesLibres.length} libres)
                </TabButton>
                <TabButton active={tab === 'checkout'} onClick={() => setTab('checkout')}>
                    Check-out ({habitacionesOcupadas.length} ocupadas)
                </TabButton>
                <TabButton active={tab === 'limpiar'} onClick={() => setTab('limpiar')}>
                    Limpiar ({habitacionesSucias.length} sucias)
                </TabButton>
            </div>

            {tab === 'checkin' && (
                <CheckInSection habitacionesLibres={habitacionesLibres} onSuccess={reload} />
            )}
            {tab === 'checkout' && (
                <CheckOutSection
                    habitacionesOcupadas={habitacionesOcupadas}
                    onSuccess={reload}
                />
            )}
            {tab === 'limpiar' && (
                <LimpiezaSection habitacionesSucias={habitacionesSucias} onSuccess={reload} />
            )}
        </div>
    )
}

/* ---------- Tab Button ---------- */

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
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                active
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
            {children}
        </button>
    )
}

/* ---------- CHECK-IN ---------- */

function calcularNoches(desde: string, hasta: string): number {
    if (!hasta) return 0
    const d1 = new Date(desde)
    const d2 = new Date(hasta)
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
}

function hoyISO(): string {
    return new Date().toISOString().split('T')[0]
}

function CheckInSection({
    habitacionesLibres,
    onSuccess,
}: {
    habitacionesLibres: Room[]
    onSuccess: () => void
}) {
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
    const [guestName, setGuestName] = useState('')
    const [documentId, setDocumentId] = useState('')
    const [telefono, setTelefono] = useState('')
    const [email, setEmail] = useState('')
    const [checkOutDate, setCheckOutDate] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'ok' | 'error'; msg: string } | null>(null)

    const noches = selectedRoom ? calcularNoches(hoyISO(), checkOutDate) : 0
    const deposito = selectedRoom ? Number(selectedRoom.price) * noches : 0

    const canSubmit =
        selectedRoom && guestName.trim() && documentId.trim() && checkOutDate && !submitting

    async function handleCheckIn(e: React.FormEvent) {
        e.preventDefault()
        if (!canSubmit || !selectedRoom) return

        setSubmitting(true)
        setFeedback(null)

        try {
            await checkIn(selectedRoom, {
                guestName,
                documentId,
                telefono,
                email,
                checkInDate: hoyISO(),
                checkOutDate,
            })
            setFeedback({
                type: 'ok',
                msg: `Check-in exitoso en habitación ${selectedRoom.number}`,
            })
            setSelectedRoom(null)
            setGuestName('')
            setDocumentId('')
            setTelefono('')
            setEmail('')
            setCheckOutDate('')
            onSuccess()
        } catch (err) {
            setFeedback({ type: 'error', msg: (err as Error).message })
        } finally {
            setSubmitting(false)
        }
    }

    if (habitacionesLibres.length === 0) {
        return (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                No hay habitaciones libres. Marcá alguna como limpia antes de continuar.
            </div>
        )
    }

    return (
        <form onSubmit={handleCheckIn} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Columna izquierda: selector de habitación */}
            <div className="flex flex-col gap-3">
                <h2 className="text-sm font-medium text-slate-700">Habitaciones libres</h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {habitacionesLibres.map(room => (
                        <button
                            type="button"
                            key={room.id}
                            onClick={() => setSelectedRoom(room)}
                            className={`rounded-lg border p-3 text-left transition-colors ${
                                selectedRoom?.id === room.id
                                    ? 'border-slate-900 bg-slate-50'
                                    : 'border-slate-200 hover:border-slate-400'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-semibold">{room.number}</span>
                                <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                    LIBRE
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-600">
                                {room.type} · Piso {room.floor}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Columna derecha: formulario */}
            <div className="flex flex-col gap-4">
                {!selectedRoom ? (
                    <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                        Seleccioná una habitación para continuar
                    </div>
                ) : (
                    <>
                        {/* Detalle de la habitación */}
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">
                                    Habitación {selectedRoom.number}
                                </h3>
                                <span className="text-xs text-slate-500">
                                    Piso {selectedRoom.floor}
                                </span>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-slate-500">Tipo:</span>{' '}
                                    <span className="font-medium">{selectedRoom.type}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500">Precio/noche:</span>{' '}
                                    <span className="font-mono font-medium">
                                        {/* ${selectedRoom.price.toFixed(2)} */}
                                        ${Number(selectedRoom.price).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Field label="Fecha de salida *">
                            <input
                                type="date"
                                value={checkOutDate}
                                min={hoyISO()}
                                onChange={e => setCheckOutDate(e.target.value)}
                                className="input"
                                required
                            />
                        </Field>

                        <Field label="Nombre del huésped *">
                            <input
                                type="text"
                                value={guestName}
                                onChange={e => setGuestName(e.target.value)}
                                placeholder="Juan Pérez"
                                className="input"
                                required
                            />
                        </Field>

                        <Field label="Documento *">
                            <input
                                type="text"
                                value={documentId}
                                onChange={e => setDocumentId(e.target.value)}
                                placeholder="12345678"
                                className="input"
                                required
                            />
                        </Field>

                        <Field label="Teléfono (opcional)">
                            <input
                                type="tel"
                                value={telefono}
                                onChange={e => setTelefono(e.target.value)}
                                placeholder="555-1234"
                                className="input"
                            />
                        </Field>

                        <Field label="Email (opcional)">
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="juan@mail.com"
                                className="input"
                            />
                        </Field>

                        {/* Depósito calculado */}
                        <div className="rounded-lg border border-slate-200 bg-white p-4">
                            <div className="flex items-center justify-between text-sm text-slate-600">
                                <span>Noches</span>
                                <span className="font-mono">{noches}</span>
                            </div>
                            <div className="mt-1 flex items-center justify-between text-sm text-slate-600">
                                <span>Precio × noche</span>
                                <span className="font-mono">
                                    {/* ${selectedRoom.price.toFixed(2)} */}
                                    ${Number(selectedRoom.price).toFixed(2)}
                                </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                                <span className="font-medium">Depósito a cobrar</span>
                                <span className="text-lg font-semibold font-mono">
                                    ${deposito.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {feedback && (
                            <div
                                className={`rounded-md p-3 text-sm ${
                                    feedback.type === 'ok'
                                        ? 'bg-green-50 text-green-800 border border-green-200'
                                        : 'bg-red-50 text-red-800 border border-red-200'
                                }`}
                            >
                                {feedback.msg}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                                {submitting ? 'Procesando...' : 'Confirmar Check-in'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </form>
    )
}

/* ---------- CHECK-OUT ---------- */

function CheckOutSection({
    habitacionesOcupadas,
    onSuccess,
}: {
    habitacionesOcupadas: Room[]
    onSuccess: () => void
}) {
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

    if (habitacionesOcupadas.length === 0) {
        return (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                No hay habitaciones ocupadas en este momento.
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {habitacionesOcupadas.map(room => (
                    <button
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        className={`rounded-lg border p-4 text-left transition-colors ${
                            selectedRoom?.id === room.id
                                ? 'border-slate-900 bg-slate-50'
                                : 'border-slate-200 hover:border-slate-400'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold">{room.number}</span>
                            <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                OCUPADA
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                            {room.type} · Piso {room.floor}
                        </p>
                    </button>
                ))}
            </div>

            {selectedRoom && (
                <CheckOutDetail
                    room={selectedRoom}
                    onSuccess={onSuccess}
                    onClose={() => setSelectedRoom(null)}
                />
            )}
        </div>
    )
}

function CheckOutDetail({
    room,
    onSuccess,
    onClose,
}: {
    room: Room
    onSuccess: () => void
    onClose: () => void
}) {
    const [reserva, setReserva] = useState<Reserva | null>(null)
    const [loadingReserva, setLoadingReserva] = useState(true)
    const [errorReserva, setErrorReserva] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'ok' | 'error'; msg: string } | null>(
        null,
    )

    useEffect(() => {
        setLoadingReserva(true)
        setErrorReserva(null)
        getReservaActivaPorHabitacion(room.number)
            .then(r => {
                if (!r) throw new Error('No hay reserva activa para esta habitación')
                setReserva(r)
            })
            .catch(e => setErrorReserva(e.message))
            .finally(() => setLoadingReserva(false))
    }, [room.number])

    async function handleCheckOut() {
        if (!reserva) return
        setSubmitting(true)
        setFeedback(null)
        try {
            await checkOut(reserva.id)
            setFeedback({ type: 'ok', msg: `Check-out exitoso de ${room.number}` })
            onSuccess()
            setTimeout(onClose, 1200)
        } catch (err) {
            setFeedback({ type: 'error', msg: (err as Error).message })
        } finally {
            setSubmitting(false)
        }
    }

    if (loadingReserva) {
        return (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">Cargando reserva...</p>
            </div>
        )
    }

    if (errorReserva) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-800">{errorReserva}</p>
                <button
                    onClick={onClose}
                    className="mt-2 text-sm underline text-red-700"
                >
                    Cerrar
                </button>
            </div>
        )
    }

    if (!reserva) return null

    const noches = Math.ceil(
        (new Date(reserva.fecha_salida).getTime() -
            new Date(reserva.fecha_entrada).getTime()) /
            (1000 * 60 * 60 * 24),
    )
    const total = noches * Number(room.price)

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                    Check-out — Habitación {room.number}
                </h2>
                <button
                    onClick={onClose}
                    className="text-sm text-slate-500 hover:text-slate-700"
                >
                    Cerrar
                </button>
            </div>

            {/* Huésped */}
            <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
                <h3 className="text-sm font-medium text-slate-700">Huésped</h3>
                <p className="mt-1 text-sm font-semibold">
                    {reserva.huesped.nombre_completo}
                </p>
                <p className="text-xs text-slate-500">
                    Doc: {reserva.huesped.documento_identidad}
                </p>
                {reserva.huesped.telefono && (
                    <p className="text-xs text-slate-500">
                        Tel: {reserva.huesped.telefono}
                    </p>
                )}
                {reserva.huesped.email && (
                    <p className="text-xs text-slate-500">{reserva.huesped.email}</p>
                )}
            </div>

            {/* Estadía */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                    <span className="text-slate-500">Entrada:</span>{' '}
                    <span className="font-medium">{reserva.fecha_entrada}</span>
                </div>
                <div>
                    <span className="text-slate-500">Salida:</span>{' '}
                    <span className="font-medium">{reserva.fecha_salida}</span>
                </div>
                <div>
                    <span className="text-slate-500">Noches:</span>{' '}
                    <span className="font-medium">{noches}</span>
                </div>
                <div>
                    <span className="text-slate-500">Precio/noche:</span>{' '}
                    <span className="font-mono font-medium">
                        ${Number(room.price).toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-md bg-slate-900 px-4 py-3 text-white">
                <span className="text-sm">Total a cobrar</span>
                <span className="text-lg font-semibold font-mono">
                    ${total.toFixed(2)}
                </span>
            </div>

            {feedback && (
                <div
                    className={`mt-4 rounded-md p-3 text-sm ${
                        feedback.type === 'ok'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                >
                    {feedback.msg}
                </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
                <button
                    onClick={handleCheckOut}
                    disabled={submitting}
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                    {submitting ? 'Procesando...' : 'Confirmar Check-out'}
                </button>
            </div>
        </div>
    )
}

/* ---------- LIMPIEZA ---------- */

function LimpiezaSection({
    habitacionesSucias,
    onSuccess,
}: {
    habitacionesSucias: Room[]
    onSuccess: () => void
}) {
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [feedback, setFeedback] = useState<{ type: 'ok' | 'error'; msg: string } | null>(
        null,
    )

    async function handleMarcarLimpia(room: Room) {
        setProcessingId(room.id)
        setFeedback(null)
        try {
            await marcarLimpia(room)
            setFeedback({
                type: 'ok',
                msg: `Habitación ${room.number} marcada como LIBRE`,
            })
            onSuccess()
        } catch (err) {
            setFeedback({ type: 'error', msg: (err as Error).message })
        } finally {
            setProcessingId(null)
        }
    }

    if (habitacionesSucias.length === 0) {
        return (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                🎉 No hay habitaciones pendientes de limpieza.
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {feedback && (
                <div
                    className={`rounded-md p-3 text-sm ${
                        feedback.type === 'ok'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                >
                    {feedback.msg}
                </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {habitacionesSucias.map(room => {
                    const processing = processingId === room.id
                    return (
                        <div
                            key={room.id}
                            className="rounded-lg border border-amber-200 bg-amber-50 p-4"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-semibold">{room.number}</span>
                                <span className="rounded bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-900">
                                    SUCIA
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-600">
                                {room.type} · Piso {room.floor}
                            </p>
                            <p className="mt-1 text-xs text-slate-500 font-mono">
                                ${Number(room.price).toFixed(2)} / noche
                            </p>

                            <button
                                onClick={() => handleMarcarLimpia(room)}
                                disabled={processing}
                                className="mt-3 w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                            >
                                {processing ? 'Procesando...' : '✓ Marcar como limpia'}
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

/* ---------- Field helper ---------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            {children}
        </label>
    )
}