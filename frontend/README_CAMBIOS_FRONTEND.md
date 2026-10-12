# 🎨 Cambios en el Frontend — Room Engine

Documentación de los cambios realizados en el frontend para integrarse con el backend real, gestión de grilla, y precios automáticos.

**Última actualización:** Octubre 2026

---

## 🗂 Índice de cambios

| # | Archivo | Tipo | Propósito |
|---|---------|------|-----------|
| 1 | `src/types/room.ts` | ✏️ Modificado | Agregado `price` |
| 2 | `src/types/reserva.ts` | 🆕 Creado | Tipos de Reserva/Huesped |
| 3 | `src/types/gridLayout.ts` | ✏️ Modificado | Agregado `hiddenRooms` |
| 4 | `src/api/rooms.ts` | ✏️ Modificado | Mapea `precio_base` → `price` |
| 5 | `src/api/reservas.ts` | 🆕 Creado | Cliente de reservas |
| 6 | `src/api/pricing.ts` | 🆕 Creado | Cliente de precios |
| 7 | `src/api/check.ts` | ✏️ Reemplazado | Endpoints reales |
| 8 | `src/hooks/useRooms.ts` | ✏️ Modificado | Expone `reload` |
| 9 | `src/pages/CheckPage.tsx` | ✏️ Modificado | Check-in/out reales + filtro ocultos |
| 10 | `src/pages/RoomsPage.tsx` | ✏️ Modificado | Usa `useRooms` + filtra ocultos |
| 11 | `src/components/EditGridModal.tsx` | ✏️ Modificado | Ocultar habitaciones + nuevo piso |
| 12 | `src/components/CreateRoomModal.tsx` | ✏️ Modificado | Precio auto por tipo |
| 13 | `src/utils/checkoutInfo.ts` | 🗑️ Eliminado | Ya no se usa localStorage |
| 14 | `src/data/rooms.ts` | 🗑️ Eliminado | Ya no se usa el mock |
| 15 | `Dockerfile.dev` | 🆕 Creado | Modo dev con hot reload |
| 16 | `docker-compose.override.yml` | 🆕 Creado | Volume mount + Vite dev |
| 17 | `.env` | 🆕 Creado | `VITE_API_URL` |

---

## 1️⃣ `src/types/room.ts`

**Qué cambió:** Se agregó el campo `price: number`.

```typescript
export interface Room {
  id: string
  number: string
  floor: number
  type: string
  status: RoomStatus
  price: number          // ← NUEVO
  guestName?: string
  checkOutDate?: string
}
```

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

**Qué cambió:** Se agregó `hiddenRooms` para permitir ocultar habitaciones individuales.

```typescript
export interface GridLayout {
  floorOrder: number[]
  hiddenFloors: number[]
  hiddenRooms: string[]        // ← NUEVO
  columns: 4 | 5 | 6
}
```

**Qué genera:**
- Compatibilidad con layouts viejos en localStorage (default vacío)
- Se puede ocultar un piso completo **o** una habitación individual

---

## 4️⃣ `src/api/rooms.ts`

**Qué cambió:** El mapper convierte `precio_base` (string del backend) a `price` (number).

```typescript
function mapHabitacion(h: HabitacionBackend): Room {
  return {
    id: h.numero,
    number: h.numero,
    floor: h.piso,
    type: h.tipo,
    status: h.estado,
    price: Number(h.precio_base),   // ← CONVERSIÓN CRÍTICA
  }
}
```

**Qué genera:** `room.price` es un número real, `.toFixed()` funciona sin errores.

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
  reload: load,     // ← usado por CheckPage
  addRoom,
}
```

---

## 9️⃣ `src/pages/CheckPage.tsx`

**Qué cambió:**

- Imports: se agregó `getReservaActivaPorHabitacion`, `useEffect`, `Reserva`, `loadGridLayout`
- `useRooms()`: usa `reload` en vez de `refresh`
- **NUEVO:** Filtra habitaciones según el `GridLayout` (oculta las que están en `hiddenFloors` o `hiddenRooms`)
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
const layout = loadGridLayout()

const visibleRooms = useMemo(
  () =>
    rooms.filter(
      (r) =>
        !layout.hiddenFloors.includes(r.floor) &&
        !layout.hiddenRooms.includes(r.id),
    ),
  [rooms, layout],
)
```

**Qué genera:** El check-in solo muestra habitaciones visibles. Las ocultas no aparecen en ninguna pestaña.

---

## 🔟 `src/pages/RoomsPage.tsx`

**Qué cambió:** Eliminado el mock, usa `useRooms()` + filtro de ocultos.

```tsx
const { rooms, loading, error } = useRooms()
const layout = loadGridLayout()

const visibleRooms = useMemo(
  () =>
    rooms.filter(
      (r) =>
        !layout.hiddenFloors.includes(r.floor) &&
        !layout.hiddenRooms.includes(r.id),
    ),
  [rooms, layout],
)

return (
  <div className="flex flex-col gap-4">
    <h1 className="text-xl font-semibold">Habitaciones</h1>
    <RoomSummary rooms={visibleRooms} />
    <RoomGrid rooms={visibleRooms} />
  </div>
)
```

**Qué genera:** El grid principal respeta lo que el admin ocultó desde el modal de edición.

---

## 1️⃣1️⃣ `src/components/EditGridModal.tsx`

**Qué cambió:** 3 modificaciones clave.

### A. Ocultar habitaciones individuales
Se agregó estado `hiddenRooms` y un botón `👁 / 🚫` sobre cada tarjeta de la vista previa. Al guardar, se persiste en el `GridLayout`.

### B. Crear piso sin auto-rellenar
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

### C. onSave incluye `hiddenRooms`
```tsx
onSave({ floorOrder, hiddenFloors: hidden, hiddenRooms, columns })
```

**Qué genera:**
- El admin puede ocultar habitaciones individuales (no solo pisos)
- El campo de nuevo piso arranca **vacío** con placeholder
- Los cambios se persisten en localStorage

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
| Ocultar habitación con `🚫` | Se ve con opacidad reducida |
| Guardar y volver al grid | La habitación no aparece |
| Hacer check-in | Huésped + reserva guardados en DB |
| Hacer check-out | Carga datos del huésped automáticamente |
| Marcar limpia | Habitación vuelve a LIBRE |

**4. F12 → Network para verificar las peticiones:**
- `GET /api/v1/habitaciones/precios-por-tipo/` → 200
- `POST /api/v1/reservas/checkin/` → 201
- `POST /api/v1/reservas/{id}/checkout/` → 200
- `POST /api/v1/habitaciones/{id}/marcar-limpia/` → 200

---

## ⚠️ Deuda técnica pendiente

| Item | Prioridad |
|------|-----------|
| Login JWT en frontend | 🔴 Alta |
| Toast notifications en vez de feedback inline | 🟡 Media |
| Aplicar precios automáticos en `EditRoomModal` | 🟡 Media |
| Tests con vitest | 🟢 Baja |

---

## 🎨 Flujo de estados

```
LIBRE (🟢)  ──check-in──▶  OCUPADA (🔴)  ──check-out──▶  SUCIA (🟤)
   ▲                                                          │
   │                    marcar-limpia                         │
   └──────────────────────────────────────────────────────────┘
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