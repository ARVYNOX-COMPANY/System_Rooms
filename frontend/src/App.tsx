import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { RequireAuth } from './components/auth/RequireAuth'
import { DashboardPage } from './pages/DashboardPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RoomsPage } from './pages/RoomsPage'
import { CheckPage } from './pages/CheckPage'
import { syncSessionFromToken } from './api/auth'
import { AdminStatsPage } from './pages/AdminStatsPage'
import { RegisterPage } from './pages/RegisterPage'

syncSessionFromToken()

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="rooms" element={<RoomsPage />} />
          <Route path="check" element={<CheckPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="stats" element={<AdminStatsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
