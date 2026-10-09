import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppLayout() {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <main className="min-w-0 flex-1 p-6">
                <Outlet />
            </main>
        </div>
    )
}