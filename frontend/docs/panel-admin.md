# Panel Admin (mock solo-front)

Panel del administrador para validar recepcionistas. Adaptación de `../prototypes-ideas/idea-para-panel-admin.md` + `panel-admin.webp` (no fiel: sin tabs “Limpiar”, sin notas de endpoints).

> Mock temporal: todo vive en el front hasta que el backend exponga los endpoints (ver “Para cablear a futuro”).

## Alcance

- Badge de rol en el Sidebar + item Dashboard (solo admin) + página `/dashboard` con tabs.
- Tab **Aceptar Recepcionistas**: cards mock con aceptar/bloquear y toggle local de estados.
- Tab **Editar Hotel**: el mismo editor de grilla del modal (`EditGridContent`), embebido; incluye crear habitación con piso prellenado.
- Botón icono “Editar grilla” en `/rooms`: visible solo para admin (usa `getSessionRole()`).

## Mapa de archivos

| Archivo | Responsabilidad |
|---|---|
| `src/api/auth.ts` | `getSessionUsername/setSessionUsername/getSessionRole()` — rol mock: `username === 'admin'` → `ADMIN`, resto `RECEPCIONISTA` |
| `src/pages/LoginPage.tsx` | Guarda el username al ingresar (lo limpia “Salir”) |
| `src/components/layout/Sidebar.tsx` | Badge bajo “PMS Hotel” (verde Administrador / ámbar Recepcionista) + item Dashboard solo admin |
| `src/pages/DashboardPage.tsx` | Breadcrumb, tabs, guard mock (no-admin → `/`); tab Editar Hotel embebe `EditGridContent` + `CreateRoomModal` |
| `src/components/EditGridContent.tsx` | Cuerpo del editor (config + preview + guardar), compartido por modal y tab |
| `src/components/EditGridModal.tsx` | Wrapper delgado: overlay + header + `EditGridContent` (usado en `/rooms`) |
| `src/components/ReceptionistCard.tsx` | Card con avatar inicial, datos y botones ✓ / 🚫 |
| `src/data/mockReceptionists.ts` | 6 recepcionistas fijos |
| `src/App.tsx` | Ruta `/dashboard` bajo `RequireAuth` |

## Máquina de estados (local, se pierde al recargar)

- `pendiente` → muestra ✓ y 🚫.
- Click ✓ → `aceptado`: card verde pálido, texto “Activo (Aprobado)”, queda solo 🚫.
- Click 🚫 → `bloqueado`: card tenue (`opacity-50`), texto “Bloqueado”, queda solo ✓.
- Reversible en ambos sentidos, como el diagrama de la imagen.

## Cómo probarlo

1. Entrar como `admin` → badge verde + item Dashboard visible → `/dashboard` muestra pendientes.
2. Entrar con otro usuario → badge ámbar, sin Dashboard; ir directo a `/dashboard` redirige a `/`.
3. Aceptar/bloquear alterna estilos y botones; recargar restaura el mock.
4. Tab Editar Hotel (admin): reordena/oculta igual que el modal y muestra “Guardado ✓”; recepcionista no ve ni el botón de `/rooms` ni `/dashboard`.
5. `npm run build` sin errores.

## Para cablear a futuro (backend)

- `GET /usuarios/?role=NEW` reemplaza `mockReceptionists.ts`; `POST aceptar/bloquear` reemplaza el toggle local.
- Rol real desde `GET /auth/me/` reemplaza `getSessionRole()` (badge, item y guard pasan a leerlo).
- El spec de estos endpoints está en `login.md` (“Requerimiento backend”).
