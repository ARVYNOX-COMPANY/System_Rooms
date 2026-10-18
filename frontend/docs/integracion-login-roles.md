# Integración login + roles (merge `back` → `tobiroz` → `front`)

Reporte de lo hecho al integrar la rama `back` en `bug-login-front`: fusión del flujo de login con roles, resolución de conflictos, migraciones aplicadas, restauración de tablas y errores encontrados.

- **Rama:** `front`
- **Merge:** `5c4715a` — *"Merge branch 'back' into bug-login-front: fusionar auth (LoginSerializer con role real + is_superuser, LoginView + /auth/me, rutas en accounts.urls)"*
- **Padres:** `df2fa64` (front, con el fix de JWT de `tobiroz`) + `b03bf38` (`back`, con `/auth/me` y rol real)
- **Fecha:** 16-Oct-2026

## Contexto: por qué se fusionó

Existían **dos soluciones al mismo bug de login por roles**, cada una con una fuente de verdad distinta:

| Rama | Fuente del rol | Problema |
|---|---|---|
| `tobiroz` → `bug-login-front` | `is_superuser` (deriva `ADMIN`/`RECEPCIONISTA`) | Ignoraba el campo `role` de la DB; `SUPERVISOR` inalcanzable; usuario `role=ADMIN + is_superuser=False` entraba como recepcionista |
| `back` | `role` real (`user.role`) | No exponía `is_superuser`; sin endpoint `/auth/me` para el front |

La integración toma lo mejor de ambas: **rol real como fuente de verdad + `is_superuser` como dato de compatibilidad + `/auth/me`**.

## Conflictos resueltos

Git detectó 6 archivos en conflicto; 3 se resolvieron a mano (`AA`/`UU`) y el resto se auto-fusionó.

| Archivo | Conflicto | Resolución |
|---|---|---|
| `backend/apps/accounts/serializers.py` | `AA` (added in both): `CustomTokenObtainPairSerializer` vs `LoginSerializer` | Se conservó **`LoginSerializer`** con `username` + `role` real + `is_superuser` |
| `backend/apps/accounts/views.py` | `UU` (changed in both): `CustomTokenObtainPairView` vs `LoginView` + `me` | Se conservó **`LoginView`** + se mantuvo `me` |
| `backend/config/urls.py` | `UU`: rutas directas (`back`) vs `include("apps.accounts.urls")` (front) | Se dejó **solo el `include`**; las rutas viven en `apps/accounts/urls.py` |
| `backend/apps/rooms/views.py` | Cambios en zonas distintas | Se combinaron (filtro `en_mantenimiento` + fix de `get_queryset` en detail) |
| `frontend/src/api/auth.ts` | `AA`: versión mock vs versión JWT | Se conservó la versión JWT |
| `frontend/src/App.tsx` | Cambios de imports/rutas | Se conservaron las rutas + `syncSessionFromToken()` |

Decisión de nombres: **`LoginView` / `LoginSerializer`** (estilo `back`), en vez de `CustomTokenObtainPair*`.

## Backend — login y `/auth/me`

### `backend/apps/accounts/serializers.py`

`LoginSerializer(TokenObtainPairSerializer)` inyecta en el JWT **y** en el body de la respuesta:

```python
token["username"] = user.username
token["role"] = user.role              # rol real — SUPERVISOR sí viaja
token["is_superuser"] = user.is_superuser   # compatibilidad con el front de tobiroz
```

### `backend/apps/accounts/views.py`

```python
class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    u = request.user
    return Response({"id": u.id, "username": u.username, "role": u.role, "is_superuser": u.is_superuser})
```

### `backend/apps/accounts/models.py`

`User.save()` fuerza `role = ADMIN` cuando `is_superuser = True`. Esto elimina de raíz la inconsistencia observada (`admin` con `is_superuser=true` pero `role=RECEPCIONISTA`).

### Rutas (un solo lugar)

`backend/apps/accounts/urls.py`:

| Método | Endpoint | Notas |
|---|---|---|
| `POST` | `/api/v1/auth/login/` | `LoginView` |
| `POST` | `/api/v1/auth/refresh/` | `TokenRefreshView` estándar |
| `GET` | `/api/v1/auth/me/` | Requiere `Authorization: Bearer`; devuelve rol en vivo desde la DB |

`backend/config/urls.py` solo incluye `apps.accounts.urls` (se quitaron las rutas directas duplicadas y los imports sin uso).

## Frontend — roles y redirect

### `frontend/src/api/auth.ts`

- `SessionRole` ampliado a `'ADMIN' | 'SUPERVISOR' | 'RECEPCIONISTA'`.
- `syncSessionFromToken()` decodifica el JWT, valida el `role` contra los 3 válidos (tolerante a mayúsculas) y hace fallback a `is_superuser` si viene raro.
- `getSessionRole()` ya reconoce `SUPERVISOR` guardado (antes lo degradaba a recepcionista).
- `fetchMe()` consume `GET /auth/me/` y persiste el **rol real desde la DB** (fuente de verdad). Si falla (red/401/500) devuelve `null` y se conservan los valores del JWT (fallback).
- `login()` llama a `fetchMe()` antes de retornar, para que el rol venga del servidor antes del redirect.
- `normalizeRole()` / `persistSession()` centralizan la normalización y el guardado en `localStorage`.

### `frontend/src/components/auth/RequireAuth.tsx`

- En cada arranque con sesión activa llama a `fetchMe()` antes de renderizar las rutas protegidas, de modo que el badge y los guards lean el rol actualizado.
- Si `/auth/me/` falla, continúa con los valores del JWT (no bloquea la sesión).

### `frontend/src/pages/LoginPage.tsx`

Tras login exitoso redirige **según rol**: `ADMIN → /dashboard`, cualquier otro → `/check`. Se quitó el `setTokens`/`setSessionUsername` duplicado (`login()` ya lo hace).

### `frontend/src/components/layout/Sidebar.tsx`

Badge con 3 estilos: **Administrador** (verde), **Supervisor** (celeste), **Recepcionista** (ámbar). El item `/dashboard` sigue visible solo para admin.

### Matriz de roles

| Rol | Redirect post-login | Badge | Ve `/dashboard` |
|---|---|---|---|
| `ADMIN` | `/dashboard` | Administrador | Sí |
| `SUPERVISOR` | `/check` | Supervisor | No (rebota a `/`) |
| `RECEPCIONISTA` | `/check` | Recepcionista | No (rebota a `/`) |

## Migración y restauración de la base de datos

### 1. Migraciones sin aplicar → error 500

Tras el merge, `/habitaciones/` y los endpoints de check devolvían **500**:

```
django.db.utils.ProgrammingError: column habitaciones.en_mantenimiento does not exist
GET /api/v1/habitaciones/?todas=true HTTP/1.1" 500
```

El merge trajo el campo `en_mantenimiento` (modelo + migración `rooms/0003`) y la app `cashier`, pero la DB local no los tenía. El 500 de check venía del mismo origen vía `select_related("habitacion")`.

Pendientes detectadas con `showmigrations`:

```
rooms
 [X] 0001_initial
 [X] 0002_habitacion_oculta
 [ ] 0003_habitacion_en_mantenimiento   ← faltaba
cashier
 [ ] 0001_initial                        ← sin aplicar
```

### 2. Tablas huérfanas → `relation "turnos_caja" already exists`

El `migrate` falló al aplicar `cashier 0001`:

```
django.db.utils.ProgrammingError: relation "turnos_caja" already exists
```

**Causa:** las tablas `turnos_caja` y `transacciones` ya existían en Postgres con el esquema idéntico a la migración (se verificó con `\d turnos_caja`: columnas, PK, FK a `accounts_user`, índice único parcial `un_turno_abierto_por_usuario`), pero **sin registro en `django_migrations`**. No era un bug del merge, sino estado previo de la DB local.

### Solución aplicada

```powershell
docker compose exec backend python manage.py migrate cashier 0001 --fake
docker compose exec backend python manage.py migrate
docker compose restart backend
```

- El `--fake` marca `cashier 0001` como aplicada **sin tocar las tablas** (seguro: esquema ya coincidía y `turnos_caja` estaba vacía).
- El segundo `migrate` aplicó de verdad `rooms 0003` (`en_mantenimiento`), resolviendo el 500.

Verificación: `showmigrations rooms cashier` → todo `[X]`. `/habitaciones/?todas=true` y check responden de nuevo.

## Endpoints del frontend verificados

Solo los que consume el front actualmente (los de `cashier` todavía no están cableados).

| Grupo | Endpoint | Estado |
|---|---|---|
| Login | `POST /auth/login/`, `POST /auth/refresh/` | OK |
| Rooms | `GET /habitaciones/?todas=true` | OK (era el 500) |
| Rooms | `POST /habitaciones/`, `PATCH /habitaciones/{id}/`, `POST /habitaciones/ocultar-piso/` | OK |
| Rooms/Check | `GET /habitaciones/`, `GET /habitaciones/precios-por-tipo/`, `POST /habitaciones/{id}/marcar-limpia/` | OK |
| Check | `GET /reservas/`, `GET /reservas/{id}/`, `POST /reservas/checkin/`, `POST /reservas/{id}/checkout/` | OK |
| Auth | `GET /auth/me/` | OK — consumido por `fetchMe()` en login y en `RequireAuth` |

## Notas y asuntos conocidos

- **Ocultar habitación/piso con habitaciones ocupadas:** el backend lo bloquea a propósito (400). Se revisó y se decidió **dejarlo tal cual** por ahora (no es un bug pendiente de esta integración).
- **`is_superuser` en localStorage:** con el nuevo serializer sí viaja; si en el futuro se quiere que el JWT deje de incluirlo, `getSessionRole()` seguiría funcionando porque prioriza `role`.
- **Frescura del rol:** al consumir `/auth/me/` en el arranque, cambiar el `role` de un usuario en la DB y recargar la app refleja el cambio **sin re-login**. Tradeoff: aparece un instante "Verificando sesión..." en cada recarga mientras responde `/me`.
- **Fallback:** si `/auth/me/` falla, se usan los claims del JWT (que ya traen `role`/`is_superuser`), así que una caída del endpoint no bloquea el acceso.
- **`cashier` con `--fake`:** conviene validar `GET /caja/actual/` con un token cuando se cablee esa parte, por si el fake esconde alguna divergencia de esquema.
- **Sin commitear** al cierre de este reporte: cambios de frontend del redirect por rol + Supervisor + `/auth/me` (`auth.ts`, `LoginPage.tsx`, `Sidebar.tsx`, `RequireAuth.tsx`) y este mismo doc.

## Cómo probarlo

1. Levantar y migrar: `docker compose up -d` → `docker compose exec backend python manage.py migrate`.
2. Login con `admin`: el JWT (jwt.io o `/auth/me/`) debe traer `role: ADMIN`, `is_superuser: true`; la UI aterriza en `/dashboard` con badge verde.
3. Login con un recepcionista (`is_superuser=False`, `role=RECEPCIONISTA`) → badge ámbar, aterriza en `/check`, `/dashboard` rebota a `/`.
4. (Opcional) Crear un `SUPERVISOR` en `/admin` → badge celeste, aterriza en `/check`.
5. Probar frescura: cambiar el `role` del usuario en la DB y recargar la app → badge y redirect reflejan el nuevo rol sin re-login.
6. Recorrer `/rooms` (crear/ocultar) y `/check` (check-in/check-out/marcar limpia) → sin 500.
7. `npx tsc --noEmit` en `frontend` sin errores antes de pushear.
