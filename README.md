# 🏨 System Rooms — Guía del usuario

Este documento explica **cómo funciona el sistema completo**, desde quién puede entrar hasta qué hace cada persona día a día.

Está escrito para que lo entienda **cualquier persona**, no hace falta saber de programación.

---

## 📋 Índice

1. [¿Qué es System Rooms?](#-qué-es-system-rooms)
2. [¿Quién puede usar el sistema?](#-quién-puede-usar-el-sistema)
3. [Primer día: cómo se arma el equipo](#-primer-día-cómo-se-arma-el-equipo)
4. [El día a día del Recepcionista](#-el-día-a-día-del-recepcionista)
5. [El día a día del Administrador](#-el-día-a-día-del-administrador)
6. [El día a día del Supervisor](#-el-día-a-día-del-supervisor)
7. [Los estados de una habitación](#-los-estados-de-una-habitación)
8. [Casos especiales](#-casos-especiales)
9. [Preguntas frecuentes](#-preguntas-frecuentes)
10. [Qué viene en el futuro](#-qué-viene-en-el-futuro)

---

## 🎯 ¿Qué es System Rooms?

Es un **programa para hoteles** que reemplaza las planillas de papel y las libretas.

Permite:

- Ver **el estado de cada habitación** en una sola pantalla (como un tablero).
- Hacer **check-in** (cuando llega un huésped).
- Hacer **check-out** (cuando se va).
- Avisar cuándo una habitación está **lista para limpiar**.
- Gestionar **quién puede entrar al sistema** (recepcionistas, supervisores, administradores).

Todo se maneja desde el **navegador de internet**, igual que usar WhatsApp Web o Gmail. No hay que instalar nada.

---

## 👥 ¿Quién puede usar el sistema?

Hay **tres tipos de personas** que usan el sistema, cada una con permisos distintos:

### 🟢 Administrador (o "Admin")

Es **el dueño** del sistema. Puede hacer **todo**:

- Aprobar o bloquear cuentas de recepcionistas.
- Crear, editar y ocultar habitaciones.
- Reorganizar los pisos del hotel.
- Ver estadísticas y reportes.
- Hacer check-in y check-out también (si quiere).

**Piensa en él como el "gerente general".**

### 🔵 Supervisor

Es **el encargado de supervisar**. Puede:

- Ver estadísticas y reportes del hotel.
- Editar la configuración visual del hotel (pisos, columnas).
- **No** puede crear ni aprobar recepcionistas.

**Piensa en él como el "jefe de operaciones".**

### 🟡 Recepcionista

Es **la persona en el mostrador**. Su trabajo es:

- Hacer check-in de los huéspedes que llegan.
- Hacer check-out de los que se van.
- Marcar habitaciones limpias.
- **No** puede crear habitaciones ni aprobar cuentas.

**Es la persona que atiende al público.**

---

## 🛠️ Primer día: cómo se arma el equipo

Antes de empezar a usar el sistema, hay que **preparar las cuentas**.

### Paso 1 — El administrador se crea su cuenta

La cuenta del administrador **no se crea desde la página web**. Se crea directamente en el "motor" del sistema (una persona con conocimientos técnicos lo hace en el servidor).

Una vez creada, el administrador ya puede entrar con su usuario y contraseña.

### Paso 2 — Los recepcionistas se registran

Los recepcionistas **sí pueden registrarse solos** desde la página web del hotel:

1. Entrar a la página principal del sistema.
2. Hacer click en **"Registrate como recepcionista"**.
3. Completar el formulario:
   - Nombre y apellido.
   - Email.
   - Teléfono.
   - DNI.
   - Domicilio.
   - Fecha de nacimiento (el sistema calcula la edad automáticamente).
   - Contraseña.
4. Hacer click en **"Crear cuenta"**.

⚠️ **Importante:** después del registro, la cuenta **todavía no está activa**. Aparece un mensaje que dice:

> *"¡Cuenta creada! Tu cuenta está pendiente de aprobación. Un administrador debe activarla antes de que puedas iniciar sesión."*

### Paso 3 — El administrador aprueba las cuentas

Cuando el recepcionista se registra, el administrador lo ve en su panel:

1. Entrar al sistema con su cuenta de admin.
2. Ir a **"Dashboard"** en el menú lateral.
3. En la sección **"Aceptar Recepcionistas"**, verá tarjetas con los datos de cada persona que se registró.
4. Cada tarjeta tiene dos botones:
   - **✓ (tilde verde)** → **Aprobar** la cuenta.
   - **🚫 (círculo gris)** → **Bloquear** la cuenta.

Cuando el admin hace click en ✓, la cuenta del recepcionista pasa a **"Activo"** y ya puede entrar al sistema.

### Paso 4 — El recepcionista ya puede entrar

Después de la aprobación, el recepcionista puede loguearse con su **email** y contraseña. Entra directamente a la pantalla de habitaciones.

---

## 🔑 El día a día del Recepcionista

### Al llegar al trabajo

**1. Iniciar sesión:**

- Abrir la página del sistema.
- Ingresar **email** y **contraseña**.
- Hacer click en **"Ingresar al turno"**.

**2. Ver el tablero de habitaciones:**

Una vez adentro, ve una pantalla como esta:

- Cada cuadrado representa una habitación.
- Los colores indican el estado:
  - 🟢 **Verde** → LIBRE (disponible para un huésped).
  - 🔴 **Rojo** → OCUPADA (tiene un huésped adentro).
  - 🟡 **Amarillo** → SUCIA (esperando que la limpien).

Arriba del tablero hay filtros para ver solo ciertos pisos, tipos de habitación o estados.

### Cuando llega un huésped (Check-in)

**1.** Ir a la sección **"Check-in / Check-out"** en el menú lateral.

**2.** En la pestaña **"Check-in"**, aparecen todas las habitaciones libres.

**3.** Hacer click en la habitación donde va a dormir el huésped.

**4.** Completar el formulario:

- Nombre completo del huésped.
- Número de documento (DNI, pasaporte, etc.).
- Teléfono (opcional).
- Email (opcional).
- Fecha de salida.

**5.** El sistema **calcula automáticamente**:

- Cuántas noches se va a quedar.
- Cuánto hay que cobrar de depósito.

**6.** Hacer click en **"Confirmar Check-in"**.

✅ La habitación pasa automáticamente a estado **OCUPADA** (rojo).

### Cuando se va un huésped (Check-out)

**1.** Ir a la sección **"Check-in / Check-out"**.

**2.** En la pestaña **"Check-out"**, aparecen las habitaciones ocupadas.

**3.** Hacer click en la habitación del huésped que se va.

**4.** El sistema muestra los datos del huésped y el **total a cobrar**.

**5.** Cobrar el saldo pendiente.

**6.** Hacer click en **"Confirmar Check-out"**.

✅ La habitación pasa automáticamente a estado **SUCIA** (amarillo).

### Cuando termina la limpieza (Marcar limpia)

**1.** Ir a la sección **"Check-in / Check-out"**.

**2.** En la pestaña **"Limpiar"**, aparecen las habitaciones sucias.

**3.** Cuando la persona de limpieza termina, hacer click en **"✓ Marcar como limpia"**.

✅ La habitación vuelve a estado **LIBRE** (verde) y ya puede asignarse a otro huésped.

---

## 👑 El día a día del Administrador

El administrador tiene **más responsabilidades**. Su panel principal se llama **"Dashboard"** y tiene dos pestañas:

### Pestaña 1 — Aceptar Recepcionistas

Acá ve las tarjetas de todas las personas que se registraron.

**Los estados posibles de cada tarjeta son:**

| Color de la tarjeta | Estado | Qué significa |
|---|---|---|
| ⚪ **Blanca** | Pendiente | Se registró pero todavía no fue aprobada |
| 🟢 **Verde** | Aceptado | Puede usar el sistema normalmente |
| ⚫ **Gris (con opacidad)** | Bloqueado | No puede entrar al sistema |

**Botones de acción:**

- **✓ Aprobar**: activa la cuenta. Solo aparece si la tarjeta está pendiente o bloqueada.
- **🚫 Bloquear**: desactiva la cuenta. Solo aparece si la tarjeta está pendiente o aprobada.

⚠️ **Bloquear NO elimina la cuenta.** La persona sigue existiendo en el sistema pero no puede entrar. Se puede reactivar en cualquier momento apretando ✓ de nuevo.

### Pestaña 2 — Editar Hotel

Acá el administrador puede **configurar el hotel**:

- **Crear nuevas habitaciones** (con número, tipo, piso y precio).
- **Agregar nuevos pisos**.
- **Reordenar los pisos** (subir o bajar).
- **Ocultar pisos completos** (por ejemplo, si un piso está en refacción).
- **Ocultar habitaciones individuales**.
- **Elegir cuántas columnas mostrar** en el tablero (4, 5 o 6).

### Estadísticas

En **"Estadísticas"** (próximamente), el admin verá:

- Ocupación del día.
- Check-ins y check-outs realizados.
- Ingresos del día.
- Reportes por período.

---

## 🔍 El día a día del Supervisor

El supervisor tiene un menú más reducido. Su trabajo se centra en:

### Estadísticas

Ve la misma sección de estadísticas que el administrador. Ahí puede:

- Consultar la ocupación del hotel.
- Ver cuántos check-ins y check-outs se hicieron.
- Analizar los ingresos por día o período.

### Editar Hotel

También puede acceder a la configuración del hotel para:

- Reordenar pisos.
- Ajustar el diseño del tablero.

⚠️ **Lo que el supervisor NO puede hacer:**

- Aprobar o bloquear recepcionistas.
- Crear nuevas habitaciones.

---

## 🎨 Los estados de una habitación

Cada habitación tiene un **estado** que indica qué se puede hacer con ella:

| Estado | Color | Significado | ¿Se puede hacer check-in? |
|---|---|---|---|
| 🟢 **LIBRE** | Verde | Está limpia y disponible | ✅ Sí |
| 🔴 **OCUPADA** | Rojo | Tiene un huésped adentro | ❌ No |
| 🟡 **SUCIA** | Amarillo | Se fue el huésped, esperando limpieza | ❌ No |

### Flujo visual de una habitación


🟢 LIBRE → [check-in] → 🔴 OCUPADA → [check-out] → 🟡 SUCIA → [marcar limpia] → 🟢 LIBRE



### ¿Y las habitaciones "ocultas"?

El administrador puede **ocultar** habitaciones (individuales o pisos enteros). Esto se usa cuando:

- Un piso está en refacción.
- Una habitación se convirtió en depósito.
- Cualquier situación donde la habitación **no debe aparecer en el tablero** por un tiempo.

Una habitación oculta:

- **No aparece** en el tablero principal.
- **No aparece** en la lista de check-in.
- **No aparece** en el check-out.
- **No aparece** en el reporte de limpieza.

**Para volver a mostrarla**, el admin va al "Editor de Hotel" y hace click en **"Mostrar"** (o en el ícono 👁).

---

## 🔧 Casos especiales

### "Mi cuenta está pendiente"

Al intentar entrar, ves el mensaje:

> *"Tu cuenta está pendiente de aprobación por un administrador."*

**Solución:** esperá a que el administrador apruebe tu cuenta. Si pasan más de 24 horas, contactalo.

### "Mi cuenta está bloqueada"

Al intentar entrar, ves el mensaje:

> *"Tu cuenta ha sido bloqueada. Contacta al administrador."*

**Solución:** el administrador bloqueó tu cuenta. Puede volver a activarla cuando quiera. Hablá con él para saber por qué.

### "Olvidé mi contraseña"

Por ahora **no hay un botón para recuperar contraseñas**. Tenés que pedirle al administrador que te genere una nueva (o que te avise un técnico).

### "La habitación no aparece en el tablero"

Puede ser por dos motivos:

1. **Está oculta** → el admin la ocultó. Solo el admin puede volver a mostrarla.
2. **Filtro activo** → arriba del tablero podés tener activado un filtro por piso o por estado. Desactivalo para ver todas.

### "Hice check-in pero la habitación sigue libre"

Puede ser que la página no se haya actualizado. **Refrescá** el navegador (tecla F5) o volvé a cargar la lista.

---

## ❓ Preguntas frecuentes

### ¿Cómo creo un recepcionista?

**No podés crearlo vos.** El recepcionista se registra solo desde la página web. Después vos (como admin) lo aprobás desde el dashboard.

### ¿Puedo cambiar la contraseña de un recepcionista?

Por ahora **no**. El recepcionista debe recordar su contraseña. En el futuro habrá un botón para esto.

### ¿Qué pasa si un recepcionista se va del hotel?

Bloqueá su cuenta desde el dashboard. Así ya no puede entrar al sistema, pero queda el registro de lo que hizo en el pasado.

### ¿Puedo eliminar completamente una cuenta?

No desde la interfaz. Solo se puede **bloquear**. Si querés eliminarla de la base de datos, un técnico tiene que hacerlo.

### ¿Los huéspedes pueden usar el sistema?

No. Este sistema es **solo para el personal del hotel**, no para los huéspedes. Los huéspedes se registran en el mostrador como siempre.

### ¿Funciona en el celular?

Sí, pero está diseñado para usarse en **computadora**. En el celular se ve el tablero pero es incómodo hacer check-in.

### ¿Se guarda todo automáticamente?

Sí. Cada acción (check-in, check-out, aprobar cuenta, etc.) se guarda **en el momento**. No hay un botón de "guardar" separado. Todo se guarda en el servidor del hotel.

### ¿Puedo deshacer un check-in equivocado?

Hoy no hay un botón para "deshacer". Si hiciste un check-in por error, tenés que hacer el check-out correspondiente y marcar la habitación como limpia manualmente.

---

## 🚀 Qué viene en el futuro

Estas son las cosas que **están planificadas** pero todavía no están funcionando:

- 📊 **Estadísticas reales** — números y gráficos del hotel en vivo.
- 💰 **Módulo de caja** — abrir y cerrar turno con arqueo.
- 🧾 **Imprimir facturas** al hacer check-out.
- 🔧 **Modo "mantenimiento"** — habitaciones fuera de servicio temporalmente (se ven en gris).
- 📱 **Notificaciones por WhatsApp** a los huéspedes.
- 🌙 **Modo oscuro** para el turno noche.
- 🔑 **Recuperar contraseña** desde la web.
- 📈 **Reportes descargables** en PDF o Excel.
- 💳 **Pagos con tarjeta** integrados.

---

## 📞 ¿Necesitás ayuda?

Si tenés un problema técnico o no podés hacer algo:

1. Revisá las [Preguntas frecuentes](#-preguntas-frecuentes).
2. Contactá al administrador del sistema.
3. Si el problema es técnico, avisale al equipo de desarrollo.

---

**Última actualización:** Octubre 2026

**Versión del sistema:** 1.0