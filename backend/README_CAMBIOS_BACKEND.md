# 📘 Cambios en el Backend — Room Engine

Documentación de los cambios realizados en el backend para habilitar el flujo completo de gestión de habitaciones, check-in/check-out, y precios automáticos por tipo.

**Última actualización:** Octubre 2026

---

## 🗂 Índice de cambios

| # | Archivo | Tipo | Propósito |
|---|---------|------|-----------|
| 1 | `apps/frontdesk/models.py` | ✏️ Modificado | Modelos Huesped y Reserva |
| 2 | `apps/frontdesk/migrations/0001_initial.py` | 🆕 Generado | Migración inicial limpia |
| 3 | `apps/frontdesk/serializers.py` | 🆕 Creado | Serializers para API |
| 4 | `apps/frontdesk/services.py` | 🆕 Creado | Lógica transaccional |
| 5 | `apps/frontdesk/views.py` | 🆕 Creado | ViewSet de reservas |
| 6 | `apps/frontdesk/urls.py` | 🆕 Creado | Router de reservas |
| 7 | `config/urls.py` | ✏️ Modificado | Registra rutas de frontdesk |
| 8 | `apps/cashier/migrations/0001_initial.py` | 🔄 Regenerado | Limpieza de migraciones |
| 9 | `apps/rooms/views.py` | ✏️ Modificado | Upsert + AllowAny + endpoint precios |
| 10 | `apps/rooms/serializers.py` | ✏️ Modificado | Estado escribible + precio auto |
| 11 | `apps/rooms/pricing.py` | 🆕 Creado | Fuente única de precios |
| 12 | `config/settings.py` | ✏️ Modificado | Postgres + CORS + CSRF |
| 13 | `database/init.sql` | ✏️ Simplificado | Solo extensiones |
| 14 | `docker-compose.yml` | ✏️ Modificado | Variables POSTGRES_* |
| 15 | `docker-compose.override.yml` | 🆕 Creado | Volume mount del backend |

---

## 1️⃣ `apps/frontdesk/models.py`

**Qué cambió:** Se definieron los modelos `Huesped` y `Reserva`.

**Qué genera:**
- Tabla `huespedes`: `id`, `nombre_completo`, `documento_identidad` (único), `telefono`, `email`
- Tabla `reservas`: `id`, `huesped_id` (FK), `habitacion_id` (FK), `fecha_entrada`, `fecha_salida`, `estado`, `created_at`
- Constraint `reserva_salida_despues_de_entrada`

**Notas:**
- Se corrigió typo `huespeddes` → `huespedes`
- `documento_identidad` ahora es `unique=True`
- `estado` amplió `max_length` de 10 a 20

---

## 2️⃣ `apps/frontdesk/migrations/0001_initial.py`

**Qué cambió:** Migración inicial regenerada desde cero.

**Qué genera:** Crea las tablas `huespedes` y `reservas`.

**Notas:** Se revirtió `frontdesk` a zero y se borraron migraciones viejas.

---

## 3️⃣ `apps/frontdesk/serializers.py`

**Qué cambió:** Archivo nuevo con 3 serializers.

**Qué genera:**

| Serializer | Función |
|------------|---------|
| `HuespedSerializer` | Representa un huésped |
| `ReservaSerializer` | Reserva con huésped anidado |
| `CheckInSerializer` | Valida el input del check-in |

**Validaciones:**
- `validate_habitacion_id`: Verifica que esté `LIBRE`
- `validate`: Verifica que `fecha_salida > hoy`

---

## 4️⃣ `apps/frontdesk/services.py`

**Qué cambió:** Archivo nuevo con lógica de negocio.

**Qué genera:**

| Función | Qué hace |
|---------|----------|
| `registrar_checkin(...)` | Crea huésped + reserva + cambia a OCUPADA |
| `registrar_checkout(id)` | Cierra reserva + cambia a SUCIA |

**Notas críticas:**
- `@transaction.atomic` — rollback si falla
- `get_or_create` por documento — evita duplicados
- `select_for_update()` — evita condiciones de carrera

---

## 5️⃣ `apps/frontdesk/views.py`

**Qué cambió:** Archivo nuevo con `ReservaViewSet` (ReadOnly).

**Qué genera:**

| Método | Endpoint |
|--------|----------|
| `GET` | `/api/v1/reservas/` |
| `GET` | `/api/v1/reservas/{id}/` |
| `POST` | `/api/v1/reservas/checkin/` |
| `POST` | `/api/v1/reservas/{id}/checkout/` |

**Notas:** `AllowAny` **TEMPORAL** — quitar cuando el frontend use JWT.

---

## 6️⃣ `apps/frontdesk/urls.py`

**Qué cambió:** Archivo nuevo que registra el ViewSet.

**Qué genera:** Rutas bajo `/api/v1/reservas/`.

---

## 7️⃣ `config/urls.py`

**Qué cambió:** Se agregó include de `apps.frontdesk.urls`.

**Qué genera:** Endpoints de reservas visibles en Swagger.

```python
api_v1 = [
    path("health/", health_check, name="health"),
    path("auth/login/", TokenObtainPairView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("", include("apps.rooms.urls")),
    path("", include("apps.frontdesk.urls")),   # ← NUEVO
]
```

---

## 8️⃣ `apps/cashier/migrations/0001_initial.py`

**Qué cambió:** Migración inicial regenerada.

**Qué genera:** Tablas `turnos_caja` y `transacciones`.

---

## 9️⃣ `apps/rooms/views.py`

**Qué cambió:**
1. Agregado `permission_classes = [AllowAny]` (**TEMPORAL**)
2. Sobrescrito `create()` para hacer upsert por `numero`
3. Agregada acción `precios_por_tipo()` que expone el endpoint `GET /habitaciones/precios-por-tipo/`

**Qué genera:**
- Endpoint público sin JWT
- POST con `numero` existente → actualiza en vez de duplicar
- Nuevo endpoint que devuelve el mapa de precios:

```python
@action(detail=False, methods=["get"], url_path="precios-por-tipo")
def precios_por_tipo(self, request):
    """Devuelve el mapa de precios por tipo."""
    return Response(PRECIOS_POR_TIPO)
```

**Respuesta esperada:**
```json
{ "SIMPLE": 50, "DOBLE": 80, "SUITE": 150 }
```

---

## 🔟 `apps/rooms/serializers.py`

**Qué cambió:**
- Eliminado `read_only_fields = ["estado"]` (ahora es escribible)
- Agregado `validate_estado` que valida `LIBRE`, `OCUPADA`, `SUCIA`
- **`precio_base` ahora es `read_only`** — nunca se acepta del cliente
- `create()` y `update()` **calculan automáticamente** el precio según el tipo

**Qué genera:**

```python
class HabitacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habitacion
        fields = ["id", "numero", "tipo", "piso", "estado", "precio_base"]
        read_only_fields = ["precio_base"]

    def validate_estado(self, value):
        if value not in ["LIBRE", "OCUPADA", "SUCIA"]:
            raise serializers.ValidationError("Estado inválido.")
        return value

    def create(self, validated_data):
        validated_data["precio_base"] = precio_para_tipo(validated_data["tipo"])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "tipo" in validated_data:
            validated_data["precio_base"] = precio_para_tipo(validated_data["tipo"])
        return super().update(instance, validated_data)
```

**Blindaje:** Aunque el cliente mande un `precio_base` falso, el backend lo **ignora** y usa el correcto según el tipo.

---

## 1️⃣1️⃣ `apps/rooms/pricing.py`

**Qué cambió:** Archivo nuevo con la fuente única de precios.

**Qué genera:**

```python
PRECIOS_POR_TIPO = {
    "SIMPLE": 50,
    "DOBLE": 80,
    "SUITE": 150,
}

def precio_para_tipo(tipo: str) -> int:
    """Devuelve el precio base para un tipo. Lanza si el tipo no existe."""
    try:
        return PRECIOS_POR_TIPO[tipo]
    except KeyError:
        raise ValueError(f"Tipo de habitación inválido: {tipo}")
```

**Por qué importa:** Si un día cambia el precio de las SUITE, se modifica **en un solo lugar** y se propaga a todo el sistema.

---

## 1️⃣2️⃣ `config/settings.py`

**Qué cambió:**

| Bloque | Cambio |
|--------|--------|
| `DATABASES` | Siempre PostgreSQL |
| `ALLOWED_HOSTS` | Incluye `backend` y `*` |
| `CORS_ALLOWED_ORIGINS` | Puerto `5173` |
| `CSRF_TRUSTED_ORIGINS` | Agregado |
| `CORS_ALLOW_CREDENTIALS` | Agregado |

**Qué genera:** Backend siempre lee de Postgres, sin errores de CORS/CSRF.

---

## 1️⃣3️⃣ `database/init.sql`

**Qué cambió:** Se eliminó todo excepto:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**Qué genera:** Django crea las tablas con `migrate`. El SQL solo prepara extensiones.

---

## 1️⃣4️⃣ `docker-compose.yml`

**Qué cambió:** El backend recibe variables `POSTGRES_*` en vez de `DATABASE_URL`.

**Qué genera:** Django puede leer `os.getenv("POSTGRES_HOST")` y conectarse.

---

## 1️⃣5️⃣ `docker-compose.override.yml`

**Qué cambió:** Agregado volume mount del backend.

**Qué genera:** Hot reload del código Python en el contenedor.

```yaml
backend:
  volumes:
    - ./backend:/app
```

---

## 🧪 Cómo verificar

### Migraciones
```bash
docker exec -it hotel_backend python manage.py migrate
```

### Probar endpoint de precios
```bash
curl http://localhost:8000/api/v1/habitaciones/precios-por-tipo/
```
Respuesta esperada:
```json
{ "SIMPLE": 50, "DOBLE": 80, "SUITE": 150 }
```

### Probar check-in
```bash
curl -X POST http://localhost:8000/api/v1/reservas/checkin/ \
  -H "Content-Type: application/json" \
  -d '{
    "habitacion_id": 1,
    "nombre_completo": "Juan Pérez",
    "documento_identidad": "12345678",
    "fecha_salida": "2026-10-15"
  }'
```

### Probar blindaje del precio
```bash
# Intento de mandar precio falso
curl -X POST http://localhost:8000/api/v1/habitaciones/ \
  -H "Content-Type: application/json" \
  -d '{
    "numero": "999",
    "tipo": "SIMPLE",
    "piso": 9,
    "precio_base": 99999
  }'
# El backend ignora el precio y usa el correcto (50 para SIMPLE)
```

### Verificar en pgAdmin
```sql
SELECT id, numero, tipo, precio_base FROM habitaciones ORDER BY numero;
SELECT * FROM huespedes;
SELECT * FROM reservas;
```

---

## ⚠️ Deuda técnica pendiente

| Item | Prioridad |
|------|-----------|
| `AllowAny` en views | 🔴 Alta |
| Cuenta con cargos/pagos | 🟡 Media |
| Módulo de caja | 🟡 Media |
| Precios configurables desde DB (en vez de hardcoded) | 🟡 Media |
| Tests automatizados | 🟢 Baja |