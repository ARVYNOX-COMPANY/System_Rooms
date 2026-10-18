import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRightOnRectangleIcon,
  BuildingOffice2Icon,
  ClipboardDocumentCheckIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline'
import { getSessionRole, login } from '../api/auth'
import { loginSchema, type LoginInput } from '../schemas/loginSchema'

const baseInputClass =
  'w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-slate-900 caret-slate-900 shadow-sm transition placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70'
const validInputClass = 'border-slate-300 focus:border-slate-900'
const errorInputClass =
  'border-red-500 focus:border-red-500 focus:ring-red-500/15'

export function LoginPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const onSubmit = async (data: LoginInput) => {
    setServerError(null)
    setSaving(true)
    try {
      await login(data.username, data.password)
      // login() ya guarda tokens y sincroniza rol desde el JWT
      navigate(getSessionRole() === 'ADMIN' ? '/dashboard' : '/check', { replace: true })
    } catch (e) {
      setServerError(
        e instanceof Error ? e.message : 'No se pudo iniciar sesión',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-white text-slate-900 antialiased selection:bg-slate-900 selection:text-white">
      {/* Panel de marca — adaptación de la idea split al mundo PMS (slate-950, no azul eléctrico) */}
      <aside className="relative hidden w-[52%] shrink-0 flex-col justify-around overflow-hidden bg-slate-950 p-10 text-white lg:flex xl:p-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgb(255 255 255 / 0.055) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.055) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage:
              'radial-gradient(75% 65% at 30% 25%, black 30%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(75% 65% at 30% 25%, black 30%, transparent 100%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-slate-700/40 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-slate-800/50 blur-[140px]"
        />

        <div className="relative flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-white text-lg font-bold text-slate-950">
            P
          </div>
          <div>
            <p className="text-[15px] font-semibold leading-tight">PMS Hotel</p>
          </div>
        </div>

        <div className="relative max-w-lg">
          <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.02em] xl:text-5xl">
            System Rooms.
            <br />
            Gestión de habitación de hoteles.
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-300">
            Mapa vivo de habitaciones, check-in y check-out sin fricción.
            Todo lo que necesitas para entregar el turno en orden.
          </p>

          <ul className="mt-9 flex flex-col gap-3.5">
            {[
              {
                title: 'Check-in / check-out en segundos',
                desc: 'Cobra, asigna y libera sin salir de la vista.',
                icon: ArrowRightOnRectangleIcon,
              },
              {
                title: 'Habitaciones por piso, de un vistazo',
                desc: 'Ocupación, limpieza y pendientes en el mapa.',
                icon: BuildingOffice2Icon,
              },
              {
                title: 'Corte y pendientes visibles',
                desc: 'Resumen del día siempre a la mano.',
                icon: ClipboardDocumentCheckIcon,
              },
            ].map((f) => (
              <li
                key={f.title}
                className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5"
              >
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-slate-200">
                  <f.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-white">
                    {f.title}
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-relaxed text-slate-400">
                    {f.desc}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Formulario */}
      <main className="flex min-w-0 flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-base font-bold text-white">
              P
            </div>
            <p className="text-[15px] font-semibold">PMS Hotel</p>
          </div>

          <h2 className="mt-6 text-2xl font-semibold tracking-[-0.01em] lg:mt-0">
            Bienvenido de nuevo
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
            Ingresa con tu usuario admin para continuar al turno.
          </p>

          <form
            className="mt-8 flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div>
              <label htmlFor="username" className="text-sm font-medium text-slate-700">
                Usuario
              </label>
              <input
                id="username"
                {...register('username')}
                placeholder="admin"
                autoComplete="username"
                aria-invalid={!!errors.username}
                className={`${baseInputClass} mt-1.5 ${errors.username ? errorInputClass : validInputClass}`}
              />
              {errors.username && (
                <p role="alert" className="mt-1.5 text-[13px] text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  className={`${baseInputClass} pr-11 ${errors.password ? errorInputClass : validInputClass}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-slate-500 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-900/30"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p role="alert" className="mt-1.5 text-[13px] text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <p
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-relaxed text-red-700"
              >
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-[0_1px_2px_rgba(15,23,42,0.25),0_8px_24px_-12px_rgba(15,23,42,0.5)] transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 active:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && (
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                  <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
              {saving ? 'Ingresando...' : 'Ingresar al turno'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="font-medium text-slate-900 hover:underline">
              Registrate como recepcionista
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
