import { Link } from 'react-router-dom'

export function HomePage() {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-xl font-semibold">PMS Hotel</h1>
            <p className="text-sm text-slate-600">
                Bienvenido al panel de recepción. Gestiona habitaciones, check-in y check-out desde un solo lugar.
            </p>
            <div>
                <Link
                    to="/rooms"
                    className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                    Ver habitaciones
                </Link>
            </div>
        </div>
    )
}
