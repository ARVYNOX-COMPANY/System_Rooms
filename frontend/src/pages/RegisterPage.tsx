import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../api/client'

/* ---------- Helpers ---------- */

function calcularEdad(fechaISO: string): number | null {
  if (!fechaISO) return null
  const hoy = new Date()
  const nac = new Date(fechaISO)
  if (isNaN(nac.getTime())) return null

  let edad = hoy.getFullYear() - nac.getFullYear()
  const m = hoy.getMonth() - nac.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
  return edad >= 0 ? edad : null
}

/* ---------- Componente ---------- */

export function RegisterPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    telefono: '',
    dni: '',
    domicilio: '',
    fechaNacimiento: '',
    password: '',
    passwordConfirm: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const edad = useMemo(() => calcularEdad(form.fechaNacimiento), [form.fechaNacimiento])

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const validate = (): string | null => {
    if (!form.firstName.trim()) return 'Falta el nombre.'
    if (!form.lastName.trim()) return 'Falta el apellido.'
    if (!form.email.trim()) return 'Falta el email.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'El email no es válido.'
    if (!form.telefono.trim()) return 'Falta el teléfono.'
    if (!form.dni.trim()) return 'Falta el DNI.'
    if (!form.domicilio.trim()) return 'Falta el domicilio.'
    if (!form.fechaNacimiento) return 'Falta la fecha de nacimiento.'
    if (edad === null) return 'La fecha de nacimiento no es válida.'
    if (edad < 18) return 'Debés ser mayor de 18 años para registrarte.'
    if (form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.'
    if (form.password !== form.passwordConfirm) return 'Las contraseñas no coinciden.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validation = validate()
    if (validation) {
      setError(validation)
      return
    }

    setSubmitting(true)
    try {
      await apiFetch('/auth/register/', {
        method: 'POST',
        body: JSON.stringify({
          username: form.email.trim().toLowerCase(),   // usamos el email como username
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          telefono: form.telefono.trim(),
          dni: form.dni.trim(),
          domicilio: form.domicilio.trim(),
          fecha_nacimiento: form.fechaNacimiento,
        }),
      })

      setSuccess(true)
      // Redirigir al login después de 2.5 segundos
      setTimeout(() => navigate('/login', { replace: true }), 2500)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo crear la cuenta'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  /* ---------- Vista de éxito ---------- */

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-xl">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">¡Cuenta creada!</h2>
          <p className="mt-2 text-sm text-slate-600">
            Tu cuenta está pendiente de aprobación. Un administrador debe activarla antes de que
            puedas iniciar sesión.
          </p>
          <p className="mt-3 text-xs text-slate-400">Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  /* ---------- Formulario ---------- */

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Crear cuenta</h1>
          <p className="mt-1 text-sm text-slate-500">
            Registrate como recepcionista. Tu cuenta quedará pendiente hasta que un administrador
            la apruebe.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nombre + Apellido */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nombre *">
              <input
                type="text"
                value={form.firstName}
                onChange={update('firstName')}
                placeholder="Juan"
                className="input"
                required
              />
            </Field>
            <Field label="Apellido *">
              <input
                type="text"
                value={form.lastName}
                onChange={update('lastName')}
                placeholder="Pérez"
                className="input"
                required
              />
            </Field>
          </div>

          {/* Email */}
          <Field label="Email *">
            <input
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="juan.perez@email.com"
              className="input"
              required
            />
            <span className="text-xs text-slate-400">
              Vas a usar este email para iniciar sesión.
            </span>
          </Field>

          {/* Teléfono + DNI */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Teléfono *">
              <input
                type="tel"
                value={form.telefono}
                onChange={update('telefono')}
                placeholder="11 2345 6789"
                className="input"
                required
              />
            </Field>
            <Field label="DNI *">
              <input
                type="text"
                inputMode="numeric"
                value={form.dni}
                onChange={update('dni')}
                placeholder="12345678"
                className="input"
                required
              />
            </Field>
          </div>

          {/* Domicilio */}
          <Field label="Domicilio actual *">
            <input
              type="text"
              value={form.domicilio}
              onChange={update('domicilio')}
              placeholder="Av. Siempre Viva 742, La Plata"
              className="input"
              required
            />
          </Field>

          {/* Fecha de nacimiento + Edad calculada */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
            <Field label="Fecha de nacimiento *">
              <input
                type="date"
                value={form.fechaNacimiento}
                onChange={update('fechaNacimiento')}
                max={new Date().toISOString().split('T')[0]}
                className="input"
                required
              />
            </Field>
            <Field label="Edad">
              <div className="input flex items-center justify-center bg-slate-50 font-mono text-sm text-slate-600">
                {edad !== null ? `${edad} años` : '—'}
              </div>
            </Field>
          </div>

          {/* Contraseñas */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Contraseña *">
              <input
                type="password"
                value={form.password}
                onChange={update('password')}
                placeholder="Mínimo 6 caracteres"
                className="input"
                required
                minLength={6}
              />
            </Field>
            <Field label="Repetir contraseña *">
              <input
                type="password"
                value={form.passwordConfirm}
                onChange={update('passwordConfirm')}
                placeholder="Repetir contraseña"
                className="input"
                required
                minLength={6}
              />
            </Field>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/login"
              className="text-sm text-slate-500 hover:text-slate-800 hover:underline"
            >
              ← Ya tengo cuenta
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </div>
        </form>
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