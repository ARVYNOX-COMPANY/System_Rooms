import { NavLink, useNavigate } from 'react-router-dom'
import { clearTokens, getSessionRole } from '../../api/auth'

type Role = 'ADMIN' | 'SUPERVISOR' | 'RECEPCIONISTA'

interface NavItem {
  label: string
  to: string
  roles: Role[]
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Inicio',
    to: '/',
    roles: ['ADMIN', 'SUPERVISOR', 'RECEPCIONISTA'],
  },
  {
    label: 'Dashboard',
    to: '/dashboard',
    roles: ['ADMIN', 'SUPERVISOR'],
  },
  {
    label: 'Habitaciones',
    to: '/rooms',
    roles: ['ADMIN', 'RECEPCIONISTA'],
  },
  {
    label: 'Check-in / Check-out',
    to: '/check',
    roles: ['ADMIN', 'RECEPCIONISTA'],
  },
  {
    label: 'Estadísticas',
    to: '/stats',
    roles: ['ADMIN', 'SUPERVISOR'],
  },
]

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Administrador',
  SUPERVISOR: 'Supervisor',
  RECEPCIONISTA: 'Recepcionista',
}

const ROLE_BADGE: Record<Role, string> = {
  ADMIN: 'border-green-500/40 bg-green-500/15 text-green-300',
  SUPERVISOR: 'border-sky-500/40 bg-sky-500/15 text-sky-300',
  RECEPCIONISTA: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
}

const ROLE_SECTION: Record<Role, string> = {
  ADMIN: 'Administración y Recepción',
  SUPERVISOR: 'Análisis',
  RECEPCIONISTA: 'Recepción',
}

export function Sidebar() {
  const navigate = useNavigate()
  const role = getSessionRole()

  const items = NAV_ITEMS.filter((item) => item.roles.includes(role))

  const handleLogout = () => {
    clearTokens()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-slate-900 text-slate-100 md:sticky md:top-0 md:flex md:h-screen">
      <div className="px-5 pt-5 text-lg font-semibold">PMS Hotel</div>

      <div className="px-5 pb-4 pt-2">
        <span
          className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${ROLE_BADGE[role]}`}
        >
          {ROLE_LABEL[role]}
        </span>
      </div>

      <nav aria-label="Navegación principal" className="flex flex-col gap-1 px-3">
        <p className="px-2 pb-1 text-xs uppercase tracking-wide text-slate-400">
          {ROLE_SECTION[role]}
        </p>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm ${
                isActive
                  ? 'bg-slate-700 font-medium text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-3 pb-4">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800"
        >
          Salir
        </button>
      </div>
    </aside>
  )
}