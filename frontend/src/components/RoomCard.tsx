import type { Room } from '../types/room'
import {
    STATUS_BADGE_STYLES,
    STATUS_CARD_STYLES,
    STATUS_LABEL,
} from '../constants/roomStatus'
import { formatDate } from '../utils/formatDate'

interface RoomCardProps {
    room: Room
}

export function RoomCard({ room }: RoomCardProps) {
    return (
        <article
            className={`flex min-h-44 w-full flex-col items-center rounded-lg border-2 p-3 text-center ${STATUS_CARD_STYLES[room.status]}`}
        >
            <span className="text-3xl font-semibold">{room.number}</span>
            <span className="text-sm text-slate-700">{room.type}</span>
            <span className="text-xs text-slate-500">Piso {room.floor}</span>

            <span
                className={`mt-2 rounded-full px-3 py-0.5 text-xs font-semibold uppercase ${STATUS_BADGE_STYLES[room.status]}`}
            >
                {STATUS_LABEL[room.status]}
            </span>

            {room.guestName && (
                <div className="mt-auto w-full pt-2 text-xs">
                    <p className="truncate font-medium">{room.guestName}</p>
                    {room.checkOutDate && (
                        <p className="text-slate-600">Sale: {formatDate(room.checkOutDate)}</p>
                    )}
                </div>
            )}
        </article>
    )
}