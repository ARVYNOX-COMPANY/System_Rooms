// frontend/src/pages/AdminStatsPage.tsx
import { Navigate } from 'react-router-dom'
import { getSessionRole } from '../api/auth'

export function AdminStatsPage() {
  const role = getSessionRole()

  // Solo ADMIN y SUPERVISOR
  if (role !== 'ADMIN' && role !== 'SUPERVISOR') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Estadísticas</h1>
        <p className="text-sm text-slate-500">
          Reportes de actividad, ocupación y movimientos del hotel.
        </p>
      </div>

      {/* Placeholder: acá van los gráficos y métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ocupación hoy" value="—" />
        <StatCard label="Check-ins del día" value="—" />
        <StatCard label="Check-outs del día" value="—" />
        <StatCard label="Ingresos del día" value="—" />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        Próximamente: gráficos de ocupación, ingresos por período y reportes por recepcionista.
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  )
}