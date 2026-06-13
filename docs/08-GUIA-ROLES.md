# 08 — Guía de Roles y Pruebas — EduTrack AI

Esta guía describe qué puede hacer cada rol, cómo navegar por el sistema y qué esperar al probar. Está pensada para sesiones de QA con datos mock.

---

## Modo Mock — Qué funciona y qué no

El frontend corre con `VITE_USE_MOCK=true` (archivo `frontend/.env`). Esto activa **MSW (Mock Service Worker)**, que intercepta todas las llamadas HTTP en el navegador y responde con datos en memoria.

| Operación | ¿Funciona? | Detalle |
|---|---|---|
| Leer listas y detalle | ✅ Sí | Datos precargados en `src/mocks/data/` |
| Crear registros (POST) | ✅ Sí | El mock los agrega en memoria |
| Editar registros (PATCH) | ✅ Sí | El mock actualiza el objeto en memoria |
| Eliminar / revocar (DELETE) | ✅ Sí | El mock lo elimina en memoria |
| Persistencia entre recargas | ❌ No | MSW vive en memoria del navegador; al refrescar la página, todo vuelve al estado inicial de los datos mock |

> **Regla práctica:** todo lo que hagas en una sesión de prueba funciona correctamente, pero si refrescas el navegador (F5) los cambios desaparecen. Esto es el comportamiento esperado en modo demo.

---

## Credenciales de prueba

Todas las cuentas usan la contraseña **`123456`**.

| Rol | Email | URL de inicio |
|---|---|---|
| Coordinador | `coordinador@colegio.edu.pe` | `/coordinador/dashboard` |
| Director | `director@colegio.edu.pe` | `/director/dashboard` |
| Técnico | `tecnico@colegio.edu.pe` | `/tecnico/ordenes` |
| Super Admin | `admin@edutrack.ai` | `/admin/instituciones` |
| Docente | *(sin login)* | `/qr/:codigo` (acceso público) |

---

## Rol: Coordinador

**Perfil:** Gestiona todos los activos tecnológicos y el personal de la institución.

### Menú disponible
`Activos` · `Órdenes` · `Alertas` · `Usuarios`

### Funcionalidades

#### Dashboard (`/coordinador/dashboard`)
- Tarjetas KPI: total de activos, activos críticos, órdenes pendientes, alertas activas.
- Gráfico de salud del parque tecnológico.
- Acceso rápido a crear activo o crear orden.

#### Activos (`/coordinador/activos`)
- **Listar** todos los activos con filtros por estado, tipo y búsqueda por nombre/serie.
- **Ver detalle** (`/coordinador/activos/:id`): ficha completa con score de salud, historial de mantenimiento y órdenes relacionadas.
- **Crear activo** (`/coordinador/activos/nuevo`): formulario con campos obligatorios (nombre, tipo, número de serie, fecha de compra, fabricante, modelo). Al guardar, el activo aparece en la lista.
- **Editar activo** (`/coordinador/activos/:id/editar`): modifica cualquier campo. Al guardar, el detalle refleja los cambios.

#### Órdenes de Trabajo (`/coordinador/ordenes`)
- **Listar** órdenes con filtros por estado y prioridad.
- **Ver detalle** (`/coordinador/ordenes/:id`): descripción, técnico asignado, evidencias fotográficas (mock), historial de cambios.
- **Crear orden** (`/coordinador/ordenes/nueva`): selecciona activo, técnico, prioridad y descripción. La orden queda en estado `pendiente`.

#### Alertas (`/coordinador/alertas`)
- Lista de alertas generadas por el motor de ciclo de vida (garantías por vencer, activos críticos, mantenimientos vencidos).
- Marcar alerta como leída.
- La campana en el TopNav muestra el contador de alertas pendientes.

#### Usuarios (`/coordinador/usuarios`)
- **Listar** todos los usuarios de la institución con rol y estado.
- **Crear usuario** (`/coordinador/usuarios/nuevo`): nombre, email, rol (coordinador / director / técnico / docente), contraseña inicial.
- **Editar usuario** (`/coordinador/usuarios/:id/editar`): cambiar nombre, rol o estado (activo/inactivo).

#### Perfil (`/perfil`)
- Ver y editar nombre y contraseña del usuario autenticado.

---

## Rol: Director

**Perfil:** Visión ejecutiva y financiera del parque tecnológico. Solo lectura estratégica.

### Menú disponible
`Dashboard` · `Proyección`

### Funcionalidades

#### Dashboard Ejecutivo (`/director/dashboard`)
- KPIs de alto nivel: inversión total, activos en riesgo, presupuesto estimado de mantenimiento.
- Gráfico de evolución del score de salud promedio del parque.
- Distribución de activos por estado (operativo, en mantenimiento, crítico, dado de baja).
- Panel de alertas críticas resumidas.

#### Proyección Financiera (`/director/proyeccion`)
- Tabla de activos con proyección de costos de mantenimiento para los próximos 12 meses.
- Estimado de reemplazos sugeridos por el motor de ciclo de vida.
- Exportar reporte (en mock, dispara una notificación de éxito pero no descarga archivo real).

#### Perfil (`/perfil`)
- Ver y editar nombre y contraseña.

> El Director **no puede crear, editar ni eliminar** activos, órdenes ni usuarios. Su acceso es de consulta.

---

## Rol: Técnico

**Perfil:** Ejecuta las órdenes de trabajo asignadas a él. Ve solo sus órdenes.

### Menú disponible
`Órdenes` (solo las propias)

### Funcionalidades

#### Lista de Órdenes (`/tecnico/ordenes`)
- Visualiza únicamente las órdenes asignadas a este técnico.
- Filtros por estado: pendiente, en progreso, completada.

#### Detalle de Orden (`/tecnico/ordenes/:id`)
- Descripción completa, activo afectado, prioridad y historial.
- Botón **"Ejecutar orden"** si el estado es `pendiente`.

#### Ejecutar Orden (`/tecnico/ordenes/:id/ejecutar`)
- Formulario para registrar el trabajo realizado: descripción de la intervención, estado resultante del activo, subir evidencia fotográfica (mock: acepta el archivo pero no lo persiste).
- Al guardar, la orden cambia a `completada` y aparece el diagnóstico en el historial.

#### Perfil (`/perfil`)
- Ver y editar nombre y contraseña.

> El Técnico **no ve activos generales, alertas ni usuarios**. Solo accede a sus órdenes.

---

## Rol: Super Admin

**Perfil:** Administra la plataforma multi-tenant. Gestiona instituciones y el catálogo global de fabricantes/modelos.

### Menú disponible
`Instituciones` · `Catálogo`

### Funcionalidades

#### Instituciones (`/admin/instituciones`)
- **Listar** todas las instituciones registradas en la plataforma.
- **Crear institución** (`/admin/instituciones/nueva`): nombre, RUC, plan (básico / profesional / enterprise), cuota de activos, datos de contacto.
- **Editar institución** (`/admin/instituciones/:id/editar`): modificar plan, cuota o datos de contacto.

#### Catálogo de Fabricantes y Modelos (`/admin/catalogo`)
- **Listar** todos los modelos del catálogo global (marca, modelo, tipo, vida útil estimada, ciclo de mantenimiento recomendado).
- **Crear modelo** (`/admin/catalogo/nuevo`): formulario completo con fabricante, modelo, tipo de activo, vida útil en meses, ciclo de mantenimiento preventivo en días.
- **Editar modelo** (`/admin/catalogo/:id/editar`): actualizar cualquier campo del modelo.

#### Perfil (`/perfil`)
- Ver y editar nombre y contraseña.

> El Super Admin **no accede a los datos operativos** (activos, órdenes, alertas) de ninguna institución. Su alcance es la configuración de la plataforma.

---

## Rol: Docente (acceso público)

**Perfil:** Usuario sin cuenta. Reporta una falla escaneando un QR pegado al activo.

### Flujo completo

1. El docente escanea el **código QR** pegado en el equipo con su celular.
2. El navegador abre `/qr/:codigo` (no requiere login).
3. Se muestra la ficha del activo: nombre, tipo, estado actual.
4. El docente completa el formulario de reporte: descripción de la falla, sala/ubicación, su nombre (opcional).
5. Al enviar, se crea una alerta en el sistema que el Coordinador verá en su módulo de Alertas.

> Esta ruta es **completamente pública**. No requiere autenticación ni rol.

---

## Navegación y seguridad

### Guardias de ruta
- Todas las rutas con `requiresAuth: true` redirigen a `/login` si no hay token válido en `localStorage`.
- Cada ruta tiene `meta.roles[]`. Si el usuario autenticado tiene un rol distinto al permitido, es redirigido a su dashboard correspondiente (nunca a una pantalla en blanco).
- El botón "Cerrar sesión" limpia el token y redirige a `/login`.

### Aislamiento multi-tenant (mock)
- Todos los datos mock están filtrados por `institucion_id: 'inst-001'`.
- Las cuentas de coordinador, director y técnico pertenecen a esa institución.
- El Super Admin opera a nivel plataforma y no comparte datos con los demás roles.

### Ruta 404
- Cualquier URL no reconocida muestra `NotFoundView` con botón para volver atrás o ir al inicio según el rol autenticado.

---

## Playground de componentes (desarrollo)

Ruta: `/dev/components` — no requiere autenticación.

Muestra todos los componentes UI del sistema (EduButton, EduInput, EduCard, EduBadge, EduToast, etc.) con todas sus variantes. Útil para revisar el design system sin navegar por el flujo completo.

---

## Flujo de prueba sugerido

### Sesión básica (30 minutos)

1. **Login como coordinador** → recorrer Dashboard → crear un activo nuevo → abrir el activo → crear una orden sobre ese activo → ir a Alertas y marcar una como leída.
2. **Cerrar sesión** → **Login como técnico** → ver la orden creada en el paso anterior → ejecutarla con una descripción de prueba.
3. **Cerrar sesión** → **Login como director** → revisar Dashboard y Proyección — verificar que los KPIs reflejan el estado del parque.
4. **Cerrar sesión** → **Login como super_admin** → crear una institución nueva → agregar un modelo al catálogo.
5. **Sin login** → abrir `/qr/PC-001` en el navegador → enviar un reporte de falla como docente.

### Verificar persistencia mock
Después de cualquier creación, refrescar la página (F5) y confirmar que el registro desaparece. Esto es correcto — es el comportamiento esperado del modo mock.
