import type { Room } from '../types/room'
import { STATUS_ORDER, STATUS_TEXT_STYLES, SUMMARY_LABEL } from '../constants/roomStatus'
import { countByStatus } from '../utils/countByStatus'

interface SummaryCardProps {
    label: string
    value: number
    valueClass?: string
}

function SummaryCard({ label, value, valueClass = 'text-slate-900' }: SummaryCardProps) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className={`text-3xl font-semibold ${valueClass}`}>{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
        </div>
    )
}

interface RoomSummaryProps {
    rooms: Room[]
}

export function RoomSummary({ rooms }: RoomSummaryProps) {
    const counts = countByStatus(rooms)

    return (
        <section aria-label="Resumen de habitaciones" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryCard label="Total" value={rooms.length} />
            {STATUS_ORDER.map((status) => (
                <SummaryCard
                    key={status}
                    label={SUMMARY_LABEL[status]}
                    value={counts[status]}
                    valueClass={STATUS_TEXT_STYLES[status]}
                />
            ))}
        </section>
    )
}