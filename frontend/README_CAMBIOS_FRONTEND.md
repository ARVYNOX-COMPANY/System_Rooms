# 🎨 Cambios en el Frontend — Room Engine

Documentación de los cambios realizados en el frontend para integrarse con el backend real, gestión de grilla, precios automáticos y ocultamiento de habitaciones persistente.

**Última actualización:** Octubre 2026

---

## 🗂 Índice de cambios

| # | Archivo | Tipo | Propósito |
|---|---------|------|-----------|
| 1 | `src/types/room.ts` | ✏️ Modificado | `price` y `oculta` |
| 2 | `src/types/reserva.ts` | 🆕 Creado | Tipos de Reserva/Huesped |
| 3 | `src/types/gridLayout.ts` | ✏️ Modificado | Removido `hiddenRooms` |
| 4 | `src/api/rooms.ts` | ✏️ Modificado | Mapper + `toggleOculta` + `id` real |
| 5 | `src/api/reservas.ts` | 🆕 Creado | Cliente de reservas |
| 6 | `src/api/pricing.ts` | 🆕 Creado | Cliente de precios |
| 7 | `src/api/check.ts` | ✏️ Reemplazado | Endpoints reales |
| 8 | `src/hooks/useRooms.ts` | ✏️ Modificado | Expone `reload` |
| 9 | `src/pages/CheckPage.tsx` | ✏️ Modificado | Filtro por `r.oculta` |
| 10 | `src/pages/RoomsPage.tsx` | ✏️ Modificado | Handler `handleToggleRoom` |
| 11 | `src/components/EditGridModal.tsx` | ✏️ Modificado | Toggle oculta al backend |
| 12 | `src/components/CreateRoomModal.tsx` | ✏️ Modificado | Precio auto por tipo |
| 13 | `src/utils/checkoutInfo.ts` | 🗑️ Eliminado | Ya no se usa localStorage |
| 14 | `src/data/rooms.ts` | 🗑️ Eliminado | Ya no se usa el mock |
| 15 | `Dockerfile.dev` | 🆕 Creado | Modo dev con hot reload |
| 16 | `docker-compose.override.yml` | 🆕 Creado | Volume mount + Vite dev |
| 17 | `.env` | 🆕 Creado | `VITE_API_URL` |

---

## 1️⃣ `src/types/room.ts`

**Qué cambió:** Se agregaron los campos `price` y `oculta`.

```typescript
export interface Room {
  id: string
  number: string
  floor: number
  type: string
  status: RoomStatus
  price: number          // ← NUEVO
  oculta: boolean        // ← NUEVO
  guestName?: string
  checkOutDate?: string
}
```

**Qué genera:** El frontend sabe el precio real y si la habitación está oculta.

---

## 2️⃣ `src/types/reserva.ts`

**Qué cambió:** Archivo nuevo con tipos de Reserva y Huésped.

```typescript
export interface Reserva {
  id: number
  huesped: Huesped
  habitacion: number
  habitacion_numero: string
  fecha_entrada: string
  fecha_salida: string
  estado: ReservaEstado
  created_at: string
}
```

---

## 3️⃣ `src/types/gridLayout.ts`

**Qué cambió:** Se eliminó `hiddenRooms` porque el estado de ocultamiento ahora vive en la DB.

**Antes:**
```typescript
export interface GridLayout {
  floorOrder: number[]
  hiddenFloors: number[]
  hiddenRooms: string[]        // ← ELIMINADO
  columns: 4 | 5 | 6
}
```

**Ahora:**
```typescript
export interface GridLayout {
  floorOrder: number[]
  hiddenFloors: number[]
  columns: 4 | 5 | 6
}

export const DEFAULT_GRID_LAYOUT: GridLayout = {
  floorOrder: [],
  hiddenFloors: [],
  columns: 6,
}
```

**Aclaración importante:**
- `hiddenFloors` **sigue en localStorage** porque es una **preferencia personal de vista**
- `oculta` de cada habitación es **estado del sistema** → va en la DB

**Por qué:**
Antes había 2 sistemas mezclados:
1. `hiddenFloors` (localStorage) → "no quiero ver este piso en MI vista"
2. `hiddenRooms` (localStorage) → "esta habitación está fuera de servicio"

El segundo era un error de diseño: **el estado operativo de una habitación debe compartirse entre todos los usuarios**, no vivir en el navegador de cada uno.

---

## 4️⃣ `src/api/rooms.ts`

**Qué cambió:** 2 modificaciones importantes.

### A. El mapper usa el `id` real del backend y mapea `oculta`

**Antes:**
```typescript
function mapHabitacion(h: HabitacionBackend): Room {
  return {
    id: h.numero,              // ← rompía si editabas el número
    number: h.numero,
    floor: h.piso,
    type: h.tipo,
    status: h.estado,
    price: Number(h.precio_base),
  }
}
```

**Ahora:**
```typescript
interface HabitacionBackend {
  id: number
  numero: string
  tipo: string
  piso: number
  estado: RoomStatus
  precio_base: number
  oculta: boolean              // ← NUEVO
}

function mapHabitacion(h: HabitacionBackend): Room {
  return {
    id: String(h.id),          // ← id real del backend
    number: h.numero,
    floor: h.piso,
    type: h.tipo,
    status: h.estado,
    price: Number(h.precio_base),
    oculta: h.oculta,          // ← NUEVO
  }
}
```

**Por qué:**
- Si el admin edita el número (101 → 105), el `id` interno sigue siendo el mismo
- React mantiene los `key={room.id}` estables (no re-renderiza toda la lista)
- Las APIs REST usan el id numérico real

### B. Nueva función `toggleOculta`

```typescript
export async function toggleOculta(id: string, oculta: boolean): Promise<void> {
  await apiFetch(`/habitaciones/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ oculta }),
  })
}
```

**Qué genera:**
- Una sola función para ocultar/mostrar
- `PATCH /habitaciones/{id}/` con `{ "oculta": true/false }`

---

## 5️⃣ `src/api/reservas.ts`

**Qué cambió:** Archivo nuevo con funciones de reserva.

**Qué genera:**

| Función | Endpoint |
|---------|----------|
| `getReservas()` | `GET /reservas/` |
| `getReservaActivaPorHabitacion(numero)` | Filtra en cliente |
| `getReserva(id)` | `GET /reservas/{id}/` |

---

## 6️⃣ `src/api/pricing.ts`

**Qué cambió:** Archivo nuevo para obtener precios por tipo.

```typescript
import { apiFetch } from './client'

export type PreciosPorTipo = Record<string, number>

export async function getPreciosPorTipo(): Promise<PreciosPorTipo> {
  return apiFetch<PreciosPorTipo>('/habitaciones/precios-por-tipo/')
}
```

**Qué genera:** El frontend puede consultar el mapa de precios sin hardcodearlos.

---

## 7️⃣ `src/api/check.ts`

**Qué cambió:** Reemplazo completo de la lógica.

**Antes:**
- `checkIn` → `PATCH /habitaciones/{id}/` + `localStorage`
- `checkOut` → `PATCH /habitaciones/{id}/` + `clear localStorage`

**Ahora:**
- `checkIn(room, guest)` → `POST /reservas/checkin/`
- `checkOut(reservaId)` → `POST /reservas/{id}/checkout/`
- `marcarLimpia(room)` → `POST /habitaciones/{id}/marcar-limpia/`

**Qué genera:**
- Check-in crea huésped + reserva + cambia estado a OCUPADA
- Check-out cierra reserva + cambia estado a SUCIA
- Se elimina toda dependencia de `localStorage`

---

## 8️⃣ `src/hooks/useRooms.ts`

**Qué cambió:** Se expone `reload` para recargar después de cada operación.

```typescript
return {
  rooms,
  loading,
  error,
  saving,
  reload: load,     // ← usado por CheckPage y RoomsPage
  addRoom,
}
```

---

## 9️⃣ `src/pages/CheckPage.tsx`

**Qué cambió:**

- Imports: se agregó `getReservaActivaPorHabitacion`, `useEffect`, `Reserva`
- `useRooms()`: usa `reload` en vez de `refresh`
- **Filtro simplificado:** lee de `room.oculta` (DB) en lugar de `layout.hiddenRooms` (localStorage)
- `CheckInSection`:
  - Nuevos `useState`: `telefono`, `email`
  - 2 nuevos `<Field>` en el formulario
  - `handleCheckIn` llama a `checkIn(room, {...})` con datos reales
- `CheckOutDetail`:
  - Ahora carga la reserva activa desde el backend
  - Muestra datos del huésped real
  - Calcula noches y total
  - Llama a `checkOut(reserva.id)`

**Filtro nuevo:**

```tsx
const visibleRooms = useMemo(
  () => rooms.filter((r) => !r.oculta),
  [rooms],
)
```

**Qué genera:** El check-in solo muestra habitaciones visibles. Las ocultas no aparecen en ninguna pestaña.

---

## 🔟 `src/pages/RoomsPage.tsx`

**Qué cambió:** 3 modificaciones.

### A. `reload` destructurado del hook

```typescript
const { rooms, loading, error, saving, addRoom, reload } = useRooms()
```

### B. Handler `handleToggleRoom` **dentro** del componente

**Antes (roto):** estaba fuera del componente, sin acceso a `reload`:
```typescript
async function handleToggleRoom(roomId: string, oculta: boolean) {
  await toggleOculta(roomId, oculta)
  reload()   // ← error: reload no existe acá
}
```

**Ahora (correcto):**
```typescript
const handleToggleRoom = async (roomId: string, oculta: boolean) => {
  try {
    await toggleOculta(roomId, oculta)
    reload()
  } catch (err) {
    console.error('Error al ocultar habitación:', err)
  }
}
```

### C. `visibleRooms` filtra por `r.oculta`

```typescript
const visibleRooms = useMemo(
  () => rooms.filter((r) => !r.oculta),
  [rooms],
)
```

### D. Import agregado

```typescript
import { toggleOculta } from '../api/rooms'
```

**Qué genera:**
- El grid principal respeta las habitaciones ocultas
- Al ocultar/mostrar, la lista se recarga automáticamente
- Sin errores de `reload undefined`

---

## 1️⃣1️⃣ `src/components/EditGridModal.tsx`

**Qué cambió:** El toggle de habitación ahora llama al backend.

### A. Nueva prop `onToggleRoom`

```typescript
interface EditGridModalProps {
  open: boolean
  rooms: Room[]
  initialLayout: GridLayout
  onClose: () => void
  onSave: (layout: GridLayout) => void
  onAddFloor: (floor: number) => void
  onToggleRoom: (roomId: string, oculta: boolean) => Promise<void>   // ← NUEVO
}
```

### B. Se eliminó el estado `hiddenRooms` local

**Antes:**
```typescript
const [hiddenRooms, setHiddenRooms] = useState<string[]>(
  initialLayout.hiddenRooms ?? [],
)

const toggleRoom = (roomId: string) =>
  setHiddenRooms((prev) =>
    prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId],
  )
```

**Ahora:** No existe. El estado vive en `room.oculta` (DB).

### C. El botón `🚫` llama directamente al backend

**Antes:**
```tsx
<button onClick={() => toggleRoom(room.id)}>
  {isRoomHidden ? '👁' : '🚫'}
</button>
```

**Ahora:**
```tsx
<button onClick={() => onToggleRoom(room.id, !room.oculta)}>
  {room.oculta ? '👁' : '🚫'}
</button>
```

### D. La opacidad refleja `room.oculta` (del backend)

```tsx
<div className={room.oculta ? 'opacity-40' : ''}>
  <RoomCard room={room} />
</div>
```

### E. El `onSave` ya no manda `hiddenRooms`

**Antes:**
```typescript
onSave({ floorOrder, hiddenFloors: hidden, hiddenRooms, columns })
```

**Ahora:**
```typescript
onSave({ floorOrder, hiddenFloors: hidden, columns })
```

### F. Nuevo piso sin auto-rellenar

**Antes:**
```tsx
<button onClick={() => onAddFloor(nextFloor)}>
  + Agregar piso {nextFloor}
</button>
```

**Ahora:**
```tsx
const [newFloor, setNewFloor] = useState('')

<form onSubmit={handleAddFloor} className="flex gap-2">
  <input
    type="number"
    value={newFloor}
    onChange={(e) => setNewFloor(e.target.value)}
    placeholder="Nuevo piso"
    className="input flex-1"
  />
  <button type="submit" disabled={!newFloor}>+</button>
</form>
```

**Qué genera:**
- Click en `🚫` → `PATCH /habitaciones/{id}/` con `{ "oculta": true }`
- La opacidad se actualiza al instante
- Al guardar el modal, solo persiste la config de pisos y columnas
- El estado de oculta **ya se guardó** con cada click (no espera a "Guardar")
- El campo de nuevo piso arranca **vacío** con placeholder

---

## 1️⃣2️⃣ `src/components/CreateRoomModal.tsx`

**Qué cambió:** El precio se auto-rellena según el tipo y es read-only.

### Cambios:
- Nuevo estado `precios` cargado del backend
- `useEffect` que carga `getPreciosPorTipo()` al abrir
- `useEffect` que auto-rellena `precio_base` al cambiar `tipo`
- Input de precio con `readOnly`, `tabIndex={-1}` y estilos de "no editable"

```tsx
const [precios, setPrecios] = useState<PreciosPorTipo>({})
const tipoValue = watch('tipo')

// Cargar precios al abrir
useEffect(() => {
  if (!open) return
  getPreciosPorTipo().then(setPrecios)
}, [open])

// Auto-rellenar al cambiar tipo
useEffect(() => {
  if (!tipoValue || precios[tipoValue] === undefined) return
  setValue('precio_base', precios[tipoValue], {
    shouldValidate: true,
    shouldDirty: true,
  })
}, [tipoValue, precios, setValue])
```

**Qué genera:**
- El admin **no puede** escribir el precio
- Al cambiar el tipo, el precio se actualiza automáticamente
- El usuario ve el precio calculado en tiempo real
- Aunque manipule el HTML, el backend lo ignora

---

## 1️⃣3️⃣ `src/utils/checkoutInfo.ts`

**Qué cambió:** **ELIMINADO**.

**Qué genera:** Se elimina toda la lógica de localStorage que ya no se necesita.

**Verificar antes de borrar:**
```bash
grep -rn "checkoutInfo" src/
```

---

## 1️⃣4️⃣ `src/data/rooms.ts`

**Qué cambió:** **ELIMINADO** (mock viejo).

**Verificar antes de borrar:**
```bash
grep -rn "from '../data/rooms'" src/
```

---

## 1️⃣5️⃣ `Dockerfile.dev`

**Qué cambió:** Archivo nuevo para desarrollo con hot reload.

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

**Nota:** El `Dockerfile` original (producción con Nginx) queda intacto.

---

## 1️⃣6️⃣ `docker-compose.override.yml`

**Qué cambió:** Archivo nuevo en la raíz del proyecto.

**Qué genera:**
- Frontend corre con Vite en puerto 5173
- Hot reload al editar archivos
- Volume mount de `frontend/` y `backend/`

```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - CHOKIDAR_USEPOLLING=true
      - VITE_API_URL=http://localhost:8000/api/v1
    command: npm run dev -- --host 0.0.0.0

  backend:
    volumes:
      - ./backend:/app
```

---

## 1️⃣7️⃣ `.env` (frontend)

**Qué cambió:** Archivo nuevo con la URL del backend.

```env
VITE_API_URL=http://localhost:8000/api/v1
```

**Nota:** Vite inyecta las variables en **build time**, así que hay que reconstruir el frontend si cambia.

---

## 🧪 Cómo verificar que funciona

**1. Levantar todo:**
```bash
docker-compose up --build
```

**2. Abrir el frontend:**
- Grid: `http://localhost:5173/`
- Check-in/out: `http://localhost:5173/check`

**3. Probar el flujo:**

| Acción | Resultado esperado |
|--------|---------------------|
| Abrir "Nueva habitación" | Precio arranca en `50` (SIMPLE) |
| Cambiar tipo a `DOBLE` | Precio se actualiza a `80` |
| Cambiar tipo a `SUITE` | Precio se actualiza a `150` |
| Intentar editar precio | No se puede (read-only) |
| Crear habitación | Se guarda con el precio correcto |
| Abrir "Editar grilla" | Campo "Nuevo piso" vacío |
| Click en `🚫` sobre habitación | Se ve con opacidad reducida |
| Cerrar modal | La habitación no aparece en el grid |
| Recargar página (F5) | La habitación **sigue oculta** ✅ |
| Hacer check-in | Huésped + reserva guardados en DB |
| Hacer check-out | Carga datos del huésped automáticamente |
| Marcar limpia | Habitación vuelve a LIBRE |

**4. F12 → Network para verificar las peticiones:**
- `GET /api/v1/habitaciones/precios-por-tipo/` → 200
- `PATCH /api/v1/habitaciones/{id}/` (oculta) → 200
- `POST /api/v1/reservas/checkin/` → 201
- `POST /api/v1/reservas/{id}/checkout/` → 200
- `POST /api/v1/habitaciones/{id}/marcar-limpia/` → 200

---

## 🎯 Diferencia clave: ocultamiento antes vs ahora

| Aspecto | Antes (localStorage) | Ahora (DB) |
|---------|----------------------|------------|
| **Persistencia** | Solo en tu navegador | En el servidor |
| **Compartición** | No, cada uno tenía su vista | Sí, todos ven lo mismo |
| **Si editás el número** | Se perdía el estado oculto | Se mantiene (por `id`) |
| **Si borrás caché** | Se perdía | Se mantiene |
| **Aparece en pgAdmin** | No | Sí |
| **Entre dispositivos** | No se sincroniza | Se sincroniza |

---

## ⚠️ Deuda técnica pendiente

| Item | Prioridad |
|------|-----------|
| Login JWT en frontend | 🔴 Alta |
| Toast notifications en vez de feedback inline | 🟡 Media |
| Editar habitaciones (número, tipo, piso) | 🟡 Media |
| Mostrar habitaciones ocultas en gris con cartel "Deshabilitada" | 🟡 Media |
| Tests con vitest | 🟢 Baja |

---

## 🎨 Flujo de estados

```
LIBRE (🟢)  ──check-in──▶  OCUPADA (🔴)  ──check-out──▶  SUCIA (🟤)
   ▲                                                          │
   │                    marcar-limpia                         │
   └──────────────────────────────────────────────────────────┘

Estados independientes:
oculta = false  →  La habitación aparece en el grid
oculta = true   →  La habitación desaparece del grid
```

---

## 💰 Precios automáticos por tipo

```
┌──────────────────────────────────────────────────┐
│  El admin elige tipo: SIMPLE                     │
│              ↓                                   │
│  Frontend consulta precios del backend           │
│              ↓                                   │
│  Auto-rellena precio_base con $50                │
│              ↓                                   │
│  El campo se marca read-only                     │
│              ↓                                   │
│  Envía el form                                   │
│              ↓                                   │
│  Backend RECALCULA el precio (blindaje)          │
│              ↓                                   │
│  Se guarda en DB con el precio correcto          │
└──────────────────────────────────────────────────┘
```

---

## 🔒 Ocultamiento de habitaciones

```
┌──────────────────────────────────────────────────┐
│  Admin hace click en 🚫 sobre la habitación      │
│              ↓                                   │
│  Frontend: PATCH /habitaciones/{id}/             │
│            { "oculta": true }                    │
│              ↓                                   │
│  Backend actualiza la DB                         │
│              ↓                                   │
│  RoomsPage llama a reload()                      │
│              ↓                                   │
│  La habitación desaparece del grid               │
│              ↓                                   │
│  Otros usuarios ven el cambio al recargar        │
│              ↓                                   │
│  Al recargar el navegador, sigue oculta ✅       │
└──────────────────────────────────────────────────┘
```