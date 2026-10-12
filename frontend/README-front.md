# Frontend — Room Engine (PMS Hotel)

SPA de recepción del hotel: ver habitaciones por piso, filtrar, crear con modal y operar check-in/out.
Rutas en `src/App.tsx` bajo `AppLayout + Sidebar`: `/` Home, `/rooms` Habitaciones, `/check` Recepción.

## Stack + scripts

- React 19 + Vite 8 + Tailwind CSS 4 + React Router 7
- Formularios: `react-hook-form` + `zod` + `@hookform/resolvers` + iconos `Heroicons`
- Scripts: `npm run dev` (`0.0.0.0:5173` con polling), `npm run build` (`tsc -b && vite build`), `npm run lint` (`oxlint`), `npm run preview`

## Estructura (`src/`)

- `api/client.ts` — `apiFetch` base (`VITE_API_URL` + JSON + error por status)
- `api/rooms.ts` — `GET /habitaciones/`, `POST /habitaciones/` (desempaqueta `{ habitacion }` del upsert del backend)
- `api/check.ts` — `PATCH /habitaciones/{id}/` (`OCUPADA`/`SUCIA`) y `POST .../marcar-limpia/`, con `findBackendId(numero → id)`. Guarda además huésped/fechas en `localStorage` (ver `utils/checkoutInfo.ts`)
- `hooks/useRooms.ts` — lista + `addRoom` (crea y luego `load()` para dejar la grilla idéntica al GET)
- `hooks/useGridLayout.ts` — orden/ocultos/columnas en `localStorage['room-grid-layout']`
- `components/` — `RoomGrid`, `RoomCard`, `RoomFilters`, `RoomSummary`, `AddRoomCard`, `CreateRoomModal`, `EditGridModal`, `layout/`
- `schemas/roomSchema.ts` — Zod (`numero ≤10, tipo SIMPLE/DOBLE/SUITE, piso 1-50, precio >0, estado default LIBRE`), con `valueAsNumber` en números
- `types/room.ts` + `types/gridLayout.ts` — `Room`, `RoomStatus`, `GridLayout { floorOrder, hiddenFloors, columns 4|5|6 }`
- `utils/filterRooms.ts` — `filterRooms`, `sortRooms` (piso asc + número natural), `groupRoomsByFloor`, `getUniqueFloors/Types`
- `utils/checkoutInfo.ts` — guarda/lee/limpia datos del huésped por habitación en `localStorage` (`checkout-info-NUMERO`) + `nightsBetween`

## Habitaciones (`RoomsPage` + `RoomGrid`)

Flujo: `GET` → filtro (`status/floor/type/search`) → `groupRoomsByFloor` → una fila por piso con sus cards + card gris `+` al final.
El `+` de cada piso abre `CreateRoomModal` con ese `piso` prellenado; el botón superior crea con piso 1.
Crear envía `numero/tipo/piso/precio_base/estado` y usa `id: String(h.id)` como key estable.
Editar grilla es solo visual (no toca backend): reordena pisos, oculta pisos, elige columnas 4-6 y previsualiza con las `RoomCard` reales (sin `+`). Botón icono `Squares2X2Icon` con `title="Editar grilla"` debajo de los filtros.

## Home

`HomePage.tsx`: portada `PMS Hotel` con bienvenida y dos accesos (`/rooms` Ver habitaciones, `/check` Check-in/out).
Sin datos ni llamadas API, solo punto de entrada y navegación.

## Recepción / Check-in-out

`CheckPage.tsx` + `api/check.ts`: tres tabs con contadores (libres/ocupadas/sucias).
Check-in: elige habitación LIBRE + nombre/documento/fecha de salida, calcula noches y depósito, hace `PATCH estado → OCUPADA` y guarda huésped/fechas en `localStorage`.
Check-out: click en OCUPADA abre el panel con habitación (tipo/piso/tarifa) + huésped (nombre/documento/entrada/salida) + precio final (noches × tarifa) leídos de `localStorage`; si no hay datos (otro equipo o versión anterior) muestra aviso. Confirmar hace `PATCH → SUCIA` y limpia la clave local. Limpiar: lista SUCIAS con `POST marcar-limpia/` para volver a LIBRE.

## Pendiente backend — reserva en check-in

Que el check-in guarde al huésped en el servidor para que el checkout lo lea “de la reserva” y lo vea cualquier recepcionista desde cualquier equipo.
Hoy el check-in (`api/check.ts:checkIn`, llamado en `CheckPage.tsx`) solo hace `PATCH estado → OCUPADA` y descarta nombre/documento/salida en el servidor: no crea fila `Reserva`/`Huesped`. El front lo resolvió en local (`utils/checkoutInfo.ts`, clave `checkout-info-NUMERO`), que solo funciona en el mismo navegador. El trabajo pendiente es que el check-in cree `Huesped + Reserva(CHECKIN)` en transacción junto al cambio a `OCUPADA`; entonces el front puede volver a leer del endpoint y tirar el `localStorage`.

## Config y Docker

- `.env`: `VITE_API_URL=http://localhost:8000/api/v1` (se congela en el build, hay que reconstruir para cambiarla)
- `Dockerfile` multistage (node:22 build → nginx con fallback SPA en `nginx.conf`)
- Tras cambios: `docker compose up -d --build frontend` (puerto 80) o `npm run dev` (:5173) en local

Notas: Zod 4 requiere tipos `z.input/output` (no usar `z.coerce` con RHF); columnas fijas 4-6, breakpoints por tamaño quedan como mejora futura.

## Cómo probarlo y ejecutarlo

Requiere el backend corriendo (`http://localhost:8000`) con migraciones aplicadas; si `GET /habitaciones/` da `relation does not exist`, corre `docker compose exec backend python manage.py migrate`.

- Local: `npm i`, `npm run dev` → `http://localhost:5173`. Verifica `/` (links), `/rooms` (grilla, filtros, crear 101/SIMPLE/piso 1/50, card verde al instante), `+` del piso 2 (modal con piso 2), icono grilla (ocultar/reordenar/columnas, persiste tras reload por `localStorage`), `/check` (tabs con contadores y `PATCH`/`marcar-limpia`).
- Docker: `docker compose up -d --build frontend` → `http://localhost` (puerto 80, puede pedir admin en Windows; usa `FRONTEND_PORT=8080` si falla).

A tener presente: `VITE_API_URL` se congela en el build (editar `.env` exige rebuild); el frontend llama directo al backend así que `CORS_ORIGINS` debe incluir el origen (5173 o 80); lista vacía `[]` es normal sin seed (crea desde la UI o `POST /api/v1/habitaciones/`); `400` en crear suele ser `numero` duplicado (el backend hace upsert y lo actualiza); si no ves cambios en Docker, es build vieja — reconstruye el frontend.
