interface AddRoomCardProps {
  floor: number
  onClick: () => void
}

export function AddRoomCard({ floor, onClick }: AddRoomCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Nueva habitación en piso ${floor}`}
      className="flex min-h-44 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 bg-slate-100 p-3 text-center text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
    >
      <span className="text-3xl font-semibold leading-none">+</span>
      <span className="text-sm">Nueva</span>
      <span className="text-xs text-slate-400">Piso {floor}</span>
    </button>
  )
}
