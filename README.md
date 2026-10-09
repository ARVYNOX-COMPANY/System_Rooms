# 🏨 Room Engine — Sistema de Gestión Hotelera

Sistema integral para la gestión de un hotel: control de habitaciones, check-in, check-out y caja. Diseñado con una arquitectura de tres capas (base de datos, backend y frontend) contenerizada con Docker para facilitar el desarrollo y despliegue.

---

## 📋 Tabla de Contenidos

- [¿Qué es?](#-qué-es)
- [¿Para qué sirve?](#-para-qué-sirve)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Flujo de Trabajo](#-flujo-de-trabajo)
- [Instalación y Ejecución](#-instalación-y-ejecución)
- [Roadmap](#-roadmap)
<!-- - [Variables de Entorno](#-variables-de-entorno)
- [API Endpoints](#-api-endpoints)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Estrategia de Ramas](#-estrategia-de-ramas)
- [Persistencia de Datos](#-persistencia-de-datos) -->

---

## 🎯 ¿Qué es?

**Room Engine** es un sistema de gestión hotelera (PMS — *Property Management System*) que permite a la recepción de un hotel:

- Visualizar en tiempo real el estado de todas las habitaciones.
- Realizar check-in y check-out de huéspedes.
- Gestionar la caja diaria (apertura y cierre de turno).
- Administrar reservas y huéspedes.

Está diseñado como un proyecto modular que separa claramente la base de datos, la lógica de negocio (API) y la interfaz de usuario.

---

## 💡 ¿Para qué sirve?

Centraliza la operación diaria de un hotel en una sola aplicación web. Reemplaza el uso de planillas y libretas por un sistema que:

- **Refleja el estado real** de cada habitación (`LIBRE`, `OCUPADA`, `SUCIA`).
- **Automatiza el cambio de estados** según las acciones de recepción (check-in, check-out, marcar limpia).
- **Registra cada movimiento de dinero** para auditoría y cierre de caja.
- **Previene errores** al no permitir, por ejemplo, hacer check-in en una habitación ocupada.

## 🛠 Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|------------|-----------|
| **Base de Datos** | PostgreSQL 15 | Almacenamiento relacional de datos |
| **Backend** | Django + Django REST Framework | API REST y lógica de negocio |
| **Autenticación** | SimpleJWT | Autenticación con tokens JWT |
| **Documentación API** | drf-spectacular (Swagger/OpenAPI) | Documentación interactiva |
| **Frontend** | TypeScript + Vite + React | Interfaz de usuario |
| **Estilos** | Tailwind CSS | Diseño responsivo |
| **Servidor Web** | Nginx | Sirve los archivos estáticos del frontend |
| **Administrador DB** | pgAdmin 4 | Interfaz gráfica para PostgreSQL |
| **Contenedores** | Docker + Docker Compose | Orquestación de servicios |

## 🏗 Arquitectura

┌─────────────────────────────────────────────────────────────────┐
│ USUARIO (Navegador) │
└────────────────────────────┬────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND (React + Vite + TypeScript) │
│ Servido por Nginx en http://localhost:80 │
└────────────────────────────┬────────────────────────────────────┘
│ HTTP (JSON + JWT)
▼
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND (Django REST Framework) │
│ API en http://localhost:8000/api/v1/ │
│ Docs en http://localhost:8000/api/docs/ │
└────────────────────────────┬────────────────────────────────────┘
│ psycopg (TCP)
▼
┌─────────────────────────────────────────────────────────────────┐
│ POSTGRESQL │
│ Puerto 5432 — Base de datos: hotel_db │
└────────────────────────────┬────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────┐
│ PGADMIN 4 │
│ http://localhost:5050 — Administración visual de la DB │
└─────────────────────────────────────────────────────────────────┘

## 🔄 Flujo de Trabajo

El sistema sigue el flujo descrito a continuación:

1. **Abrir turno de caja** → El recepcionista inicia su jornada.
2. **Grid de habitaciones** → Vista principal con el estado de cada habitación.
3. A partir del grid, el recepcionista puede realizar 3 acciones:

### 🔵 Check-in
- Buscar reserva o crear *walk-in*.
- Elegir habitación `LIBRE` y `LIMPIA`.
- Cobrar depósito.
- Cambiar estado a `OCUPADA`.

### 🔴 Check-out
- Ver cuenta (cargos y pagos).
- Cobrar saldo pendiente.
- Cambiar estado a `SUCIA`.

### 🟢 Marcar Limpia
- Recepción/limpieza confirma que la habitación fue aseada.
- Cambiar estado a `LIBRE`.
- Vuelve al grid.

4. **Cerrar turno de caja** → Comparar monto esperado vs. contado.

---

## 🚀 Instalación y Ejecución

### Requisitos Previos

- Docker
- Docker Compose
- Git

### Pasos

**1. Clonar el repositorio:**
```bash
git clone <url-del-repo>
cd Room_Engine
```

2. Crear el archivo .env en la raíz (ver sección Variables de Entorno):

``` bash
cp .env.example .env
# Editar .env con tus valores
```
3. Levantar los servicios:

```bash
docker-compose up --build -d
```

4. Aplicar migraciones:

```bash
docker exec -it hotel_backend python manage.py migrate
```
5. Crear superusuario para el admin:

```bash
docker exec -it hotel_backend python manage.py createsuperuser
```
6. Cargar habitaciones de prueba (opcional):

```bash
docker exec -it hotel_backend python manage.py seed_rooms
```

7. Acceder a los servicios:
``` bash
Servicio	URL	Credenciales
Frontend	http://localhost	—
Backend API	http://localhost:8000/api/v1/	JWT
Swagger Docs	http://localhost:8000/api/docs/	—
Django Admin	http://localhost:8000/admin/	superuser
pgAdmin	http://localhost:5050	admin@hotel.com / admin
PostgreSQL	localhost:5432	admin / secretpassword
```
---

# 🗺 Roadmap

### ✅ Completado
- ☑ Base de datos PostgreSQL con volumen persistente
- ☑ Backend Django + DRF con autenticación JWT
- ☑ Modelo de habitaciones con estados (LIBRE, OCUPADA, SUCIA)
- ☑ Endpoint /marcar-limpia/
- ☑ Frontend Vite + TypeScript con grid de habitaciones
- ☑ Integración Frontend ↔ Backend
- ☑ Swagger UI para documentación de la API
- ☑ pgAdmin pre-configurado con la conexión

### 🚧 En desarrollo
- □ Flujo completo de Check-in
- □ Flujo completo de Check-out con cuenta
- □ Gestión de caja (apertura/cierre de turno)
- □ Login en el frontend con JWT
- □ Modelo de huéspedes y reservas
### 🔮 Futuro
- □ Reportes y estadísticas
- □ Notificaciones en tiempo real (WebSockets)
- □ Tests automatizados (pytest + vitest)
- □ Despliegue en producción