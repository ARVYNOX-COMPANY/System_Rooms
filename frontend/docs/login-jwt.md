# Login JWT — Frontend

Pantalla y sesión del PMS Hotel. Cubre solo frontend: el endpoint `POST /api/v1/auth/login/` ya existía en el backend.

## Alcance

- Incluye: pantalla de login, guardado de sesión, `Authorization` en los requests, protección de rutas y logout.
- No incluye: registro de usuarios, roles en la UI ni cierre real en la API (ver nota al final del historial si se retoma).

## Mapa de archivos

| Archivo | Responsabilidad |
|---|---|
| `src/api/auth.ts` | `login()`, `refreshAccessToken()`, helpers de tokens en `localStorage` (`access_token`, `refresh_token`) |
| `src/api/client.ts` | Adjunta `Authorization: Bearer <token>`; ante `401` limpia sesión y manda a `/login` |
| `src/schemas/loginSchema.ts` | Zod: `username` y `password` requeridos |
| `src/pages/LoginPage.tsx` | Form RHF+Zod, diseño split con panel de marca, mostrar/ocultar contraseña, error visible, al éxito guarda tokens y va a `/check` |
| `src/components/auth/RequireAuth.tsx` | Guard de rutas: sin `access` intenta renovar con el refresh antes de redirigir a `/login` |
| `src/App.tsx` | `/login` pública; `/`, `/rooms`, `/check` bajo `RequireAuth + AppLayout` |
| `src/components/layout/Sidebar.tsx` | Botón “Salir” (limpia sesión y va a `/login`) |

## Flujos

- **Login OK:** usuario + clave → `POST /auth/login/` → `{access, refresh}` guardados → navega a `/check`.
- **Login malo:** el backend responde 400/401 con `detail`; se muestra en el form (“No active account found…” si el usuario no existe).
- **Recarga con sesión:** `RequireAuth` ve `access_token` y deja pasar sin parpadeo.
- **Access vencido (12h) pero refresh vivo:** al entrar a una ruta protegida se renueva en silencio y se entra.
- **Sin sesión o refresh vencido:** redirige a `/login` (con mensaje breve “Verificando sesión…” mientras intenta).
- **401 en cualquier request:** limpia tokens y manda a `/login` con “Sesión vencida: vuelve a ingresar.” (recarga completa, no reintenta refresh ahí para evitar loops).
- **Logout:** “Salir” limpia ambos tokens y va a `/login`.

## Decisiones

- Tokens en `localStorage` (simple para este MVP; mismo patrón que el resto del front).
- Se guardan **ambos** tokens aunque el pedido original era solo `access`: sin `refresh` no hay renovación silenciosa.
- El login pide `username` (no email): es lo que espera SimpleJWT con el `User` actual.
- Aterrizaje en `/check`, como pedía la tarea.
- `window.location` en el 401 en vez de `navigate()`: `client.ts` vive fuera del router; recarga la app, aceptable en MVP.

## Cómo probarlo

1. Crear el usuario de prueba (usuario `admin`, email `admin@admin.com`, contraseña `admin`). Interactivo:
   ```powershell
   docker compose exec backend python manage.py createsuperuser
   ```
   (responde `admin`, `admin@admin.com`, `admin` dos veces). O en un solo comando:
   ```powershell
   docker compose exec backend python manage.py shell -c "from django.contrib.auth import get_user_model; U=get_user_model(); u,_=U.objects.update_or_create(username='admin', defaults={'email':'admin@admin.com','is_staff':True,'is_superuser':True,'role':'ADMIN'}); u.set_password('admin'); u.save(); print('ok')"
   ```
   Si se pierde la clave: `docker compose exec backend python manage.py changepassword admin`. Verificar antes por curl:
   ```powershell
   curl.exe -s -X POST http://localhost:8000/api/v1/auth/login/ -H "Content-Type: application/json" -d '{"username":"admin","password":"admin"}'
   ```
   Debe devolver `access` y `refresh`.
2. En `http://localhost:5173/login`: clave mala → error visible; `admin/admin` → entra a `/check`.
3. Recargar `/rooms` con sesión → se queda dentro; darle “Salir” → `/login`.
4. Sin sesión, entrar directo a `/rooms` o `/check` → redirige a `/login`.
5. Reglas: `npm run build` sin errores antes de pushear, no tocar `docker-compose.yml` ni `.env` raíz, no subir `node_modules/` ni `dist/`.

## Flujo planeado a futuro — registro, aprobación y roles

Aún no implementado; queda anotado para cuando se haga (requiere backend + front).

- **Admin base:** `admin@admin.com / admin` (ver paso 1). Ingresa a la web y ve la sección **Dashboard** (`/dashboard`) con los usuarios recién registrados pendientes.
- **Registro:** un usuario nuevo se registra y queda con rol `new`; al entrar lo redirige a una pantalla de **“aguarde un momento”** (único endpoint visible para ese rol).
- **Aprobación:** el admin ve al nuevo usuario en el Dashboard y lo acepta con la tilde → el usuario pasa a `recepcionista`.
- **Post-aprobación:** al usuario nuevo lo redirige al home (`/`).

**Matriz de roles (objetivo):**

| Rol | Ve |
|---|---|
| `new` | Solo pantalla “aguarde un momento” |
| `recepcionista` | Inicio, Habitaciones, Check-in/Check-out |
| `admin` | Todo lo anterior + Dashboard de recepcionistas (`/dashboard`) |

**Implica a futuro:** endpoint de registro, endpoint de listado/aprobación de pendientes, `role` en el token o en `GET /auth/me/`, y guards por rol en `RequireAuth` + menú por rol en `Sidebar`. Detalle para backend abajo.

## Requerimiento backend — registro, aprobación y roles

Contexto verificado: hoy solo existen `POST /auth/login/` y `POST /auth/refresh/` (SimpleJWT estándar, `{access, refresh}`, access 12h). `apps/accounts/` no tiene vistas ni rutas; el `User` trae `role` (`RECEPCIONISTA`/`SUPERVISOR`/`ADMIN`, default `RECEPCIONISTA`). Para el flujo hacen falta:

Esto lo apunto como idea propuesta por si se desea implementar ya que puede encajar con el flujo del proyecto.

**1. Modelo** — agregar el valor `NEW` a `User.Role` + migración (los nuevos se crean activos con rol `NEW`; el gate es por rol, no por `is_active`, para que puedan ver la pantalla de espera).

**2. Endpoints** (base `/api/v1/`, errores con `{detail}`, como el resto):

| Método y ruta | Auth | Body | Respuesta |
|---|---|---|---|
| `POST /auth/register/` | pública | `{username, email, password}` (+ `nombre` opcional) | `201 {id, username, email, role: "NEW", access, refresh}` (con tokens se ahorra un login) |
| `GET /auth/me/` | Bearer | — | `200 {id, username, email, role}` (fuente de verdad para guards y menú del front) |
| `GET /usuarios/?role=NEW` | solo admin | — | `200` lista paginada `{id, username, email, role, date_joined}` (el Dashboard) |
| `POST /usuarios/{id}/aprobar/` | solo admin | — | `200 {id, username, role: "RECEPCIONISTA"}` (la tilde del Dashboard) |

**3. Permisos** — 1 y login/refresh públicos (con throttle anti-spam en `register/`); 2 cualquier autenticado; 3 y 4 solo `role=ADMIN` (o `is_staff`). Validar en `register/`: username único, password con validadores de Django.

**4. Opcional (lindo de tener):** incluir `role` como claim del access token para que el front no dependa solo de `/me/`.

**5. Criterio de aceptación:** registrar `nuevo1` → login → `me` dice `NEW`; el admin lo ve en `GET /usuarios/?role=NEW`, lo aprueba → `me` dice `RECEPCIONISTA`; el front (cuando lo hagamos) lo manda al home. Sin romper `login`/`refresh` actuales.
