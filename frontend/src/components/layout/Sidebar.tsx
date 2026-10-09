import { NavLink } from 'react-router-dom'

interface NavItem {
    label: string
    to: string
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Inicio', to: '/' },
    { label: 'Habitaciones', to: '/rooms' },
    { label: 'Check-in / Check-out', to: '/check-in' },
]

export function Sidebar() {
    return (
        <aside className="hidden w-60 shrink-0 flex-col bg-slate-900 text-slate-100 md:flex">
            <div className="px-5 py-5 text-lg font-semibold">PMS Hotel</div>

            <nav aria-label="Navegación principal" className="flex flex-col gap-1 px-3">
                <p className="px-2 pb-1 text-xs uppercase tracking-wide text-slate-400">Recepción</p>
                {NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) =>
                            `rounded-md px-3 py-2 text-sm ${isActive
                                ? 'bg-slate-700 font-medium text-white'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    )
}