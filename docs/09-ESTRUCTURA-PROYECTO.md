# 09 — Estructura del Proyecto y Stack Tecnológico — EduTrack AI

Este documento describe qué es el proyecto, qué tecnologías usa y para qué sirve cada directorio y archivo importante. Es la referencia rápida para entender y explicar el sistema.

---

## ¿Qué es EduTrack AI?

EduTrack AI es una **plataforma SaaS multi-tenant** para la gestión inteligente del ciclo de vida de activos tecnológicos (computadoras, laptops, proyectores, tablets, etc.) en colegios privados del Perú.

### Problemas que resuelve
- Los colegios no saben cuándo un equipo necesita mantenimiento hasta que falla en clase.
- No existe un registro centralizado del estado de salud de los activos.
- Los docentes no tienen una forma rápida de reportar una falla sin llamar al técnico.
- Los directores no tienen visibilidad del gasto futuro en equipos.

### Cómo lo resuelve
- Un **motor de ciclo de vida (Lifecycle Intelligence Engine)** calcula un **score de salud** por activo (0–100) basado en antigüedad, historial de fallas y el catálogo del fabricante.
- Genera **alertas automáticas** cuando un activo está en riesgo (garantía por vencer, mantenimiento vencido, score crítico).
- Los docentes reportan fallas escaneando un **código QR** pegado en el equipo con su celular — sin necesidad de cuenta.
- Los directores acceden a una **proyección financiera** de mantenimientos y reemplazos.
- Todo está aislado por institución (**multi-tenant**): cada colegio ve solo sus propios datos.

---

## Stack Tecnológico

### Frontend (lo que está implementado)

| Tecnología | Versión | Para qué se usa |
|---|---|---|
| **Vue 3** | 3.x | Framework principal. Composition API (`<script setup>`). |
| **Vite** | 5.x | Bundler y servidor de desarrollo. Build ultrarrápido. |
| **Pinia** | 2.x | Manejo de estado global (stores por módulo). Reemplaza Vuex. |
| **Vue Router 4** | 4.x | Enrutamiento SPA con guardias por rol. |
| **Tailwind CSS v4** | 4.x | Utilidades CSS. Usado via variables CSS personalizadas. |
| **MSW (Mock Service Worker)** | 2.x | Intercepta llamadas HTTP en el navegador para simular el backend. |
| **vite-plugin-pwa** | latest | Convierte la app en una PWA con service worker y caché offline. |
| **Workbox** | (vía plugin) | Estrategias de caché para modo offline. |
| **Heroicons** | 2.x | Librería de íconos SVG (outline style). |
| **IndexedDB** | nativo | Almacena operaciones offline para sincronizar al volver a conectarse. |

### Backend (planificado / pendiente de integración)

| Tecnología | Para qué se usa |
|---|---|
| **Python 3.12** | Lenguaje del backend. |
| **FastAPI** | Framework web. Genera OpenAPI automáticamente. |
| **Pydantic v2** | Validación de datos (schemas request/response). |
| **SQLAlchemy 2.0** | ORM con sesiones async. Estilo declarativo moderno. |
| **Alembic** | Migraciones de base de datos. |
| **PostgreSQL 16** | Base de datos principal. |
| **pgvector** | Extensión de PostgreSQL para búsqueda vectorial (base RAG del asistente IA). |
| **python-jose + passlib** | JWT para autenticación y bcrypt para contraseñas. |
| **APScheduler** | Jobs programados (alertas nocturnas, recálculo de scores). |
| **FastMCP** | Servidor MCP para el asistente IA integrado. |
| **WebSockets** | Notificaciones en tiempo real (alertas y cambios de estado). |

### Infraestructura

| Tecnología | Para qué se usa |
|---|---|
| **Docker Compose** | Orquesta todos los servicios (API, PostgreSQL, frontend, Nginx). |
| **Nginx** | Reverse proxy y servidor de archivos estáticos (evidencias fotográficas). |
| **VPS Ubuntu** | Servidor de producción. |

---

## Mapa del repositorio

```
edutrack/
├── docs/               → Documentación del proyecto
├── frontend/           → Aplicación Vue 3 (todo lo implementado hasta ahora)
├── backend/            → API FastAPI (pendiente de integración)
├── recursos/           → Logos y assets del proyecto
├── CLAUDE.md           → Memoria del proyecto para Claude Code
├── README.md           → Presentación general del proyecto
└── docker-compose.yml  → Orquestación de servicios
```

---

## Directorio: `docs/`

Toda la documentación técnica y de producto del proyecto.

| Archivo | Contenido |
|---|---|
| `01-PRD.md` | Product Requirements Document — historias de usuario y criterios de aceptación. |
| `02-ARQUITECTURA.md` | Decisiones de arquitectura, modelo de datos, módulos del backend. |
| `03-PLAN-DE-TAREAS.md` | Backlog ejecutable con tareas completadas y pendientes. |
| `04-ESTANDARES-DE-CODIGO.md` | Convenciones de Python, Vue, tests y mensajes de commit. |
| `05-FLUJO-DE-TRABAJO.md` | Cómo se trabaja con Claude Code en este repositorio. |
| `06-DISEÑO-UI.md` | Sistema de diseño: colores, tipografía, componentes visuales. |
| `07-PLAN-TRABAJO-FRONTEND.md` | Plan detallado de las 7 fases del frontend (todas completadas). |
| `08-GUIA-ROLES.md` | Qué puede hacer cada rol y cómo probarlo. |
| `09-ESTRUCTURA-PROYECTO.md` | Este archivo. |

---

## Directorio: `frontend/`

Todo el código del cliente web. Tecnología: Vue 3 + Vite.

### `frontend/public/`

Archivos que Vite copia tal cual al build final sin procesarlos.

- `mockServiceWorker.js` — Script de MSW que intercepta las peticiones HTTP en el navegador durante el modo mock.
- `manifest.webmanifest` — Manifiesto de la PWA (nombre, íconos, colores, modo standalone).
- `icons/` — Íconos de la PWA en distintos tamaños (192px, 512px, maskable).

### `frontend/src/`

Todo el código fuente de la aplicación.

---

### `frontend/src/main.js`

**Punto de entrada de la aplicación.** Hace tres cosas:
1. Crea la instancia de Vue y monta la app.
2. Registra plugins globales: Vue Router, Pinia, directiva `v-click-outside`.
3. Si `VITE_USE_MOCK=true`, inicia el worker de MSW antes de montar la app para que todas las peticiones queden interceptadas desde el primer render.

### `frontend/src/App.vue`

**Componente raíz.** Contiene el `<RouterView>` y el `<EduToast>` (sistema de notificaciones) que se muestra en todas las páginas vía Teleport.

### `frontend/src/style.css` y `frontend/src/assets/css/main.css`

**Estilos globales.** Definen las variables CSS del design system (colores, sombras, radios, transiciones). Todos los componentes usan estas variables (`var(--color-primary)`, `var(--shadow-md)`, etc.) en lugar de valores hardcodeados.

---

### `frontend/src/router/`

Configuración del enrutador Vue Router.

| Archivo | Qué hace |
|---|---|
| `routes.js` | Define las 23 rutas con sus metadatos (`requiresAuth`, `roles[]`, componente). |
| `guards.js` | `beforeEach`: verifica autenticación y rol antes de cada navegación. Redirige a `/login` si no hay token, o al dashboard propio si el rol no tiene acceso. |
| `index.js` | Crea el router y registra el guard. |

**Flujo de un guard:**
```
Usuario navega a /coordinador/activos
  → guard: ¿hay token? No → redirige a /login
  → guard: ¿hay token? Sí → ¿rol === 'coordinador'? Sí → permite acceso
  → guard: ¿hay token? Sí → ¿rol === 'director'? No → redirige a /director/dashboard
```

---

### `frontend/src/stores/`

Estado global de la aplicación con **Pinia**. Un archivo por módulo de negocio.

| Store | Estado que maneja |
|---|---|
| `auth.js` | Usuario autenticado, token JWT, acciones de login/logout. |
| `activos.js` | Lista de activos, activo seleccionado, filtros activos. |
| `ordenes.js` | Lista de órdenes, orden seleccionada, filtros. |
| `alertas.js` | Lista de alertas, contador de pendientes (muestra el badge en la campana). |
| `dashboard.js` | KPIs y datos de los gráficos del dashboard. |
| `usuarios.js` | Lista de usuarios de la institución. |
| `catalogo.js` | Modelos del catálogo global (para Super Admin). |
| `notificaciones.js` | Notificaciones en tiempo real vía WebSocket. |

Cada store expone: **state** (datos), **getters** (derivados computados) y **actions** (llama a la capa API y actualiza el state).

---

### `frontend/src/api/`

**Capa de acceso a datos.** Cada archivo exporta funciones que hacen `fetch` al backend (o a MSW en modo mock). Los stores llaman a estas funciones.

| Archivo | Endpoints que cubre |
|---|---|
| `auth.api.js` | `POST /auth/login`, `POST /auth/logout` |
| `activos.api.js` | CRUD de activos: listar, detalle, crear, editar |
| `ordenes.api.js` | CRUD de órdenes, cambio de estado |
| `alertas.api.js` | Listar alertas, marcar como leída |
| `dashboard.api.js` | KPIs del coordinador |
| `usuarios.api.js` | CRUD de usuarios de la institución |
| `perfil.api.js` | Ver y actualizar perfil propio |
| `proyeccion.api.js` | Datos de proyección financiera del director |
| `reportes.api.js` | Reporte de falla del docente vía QR |
| `admin.api.js` | CRUD de instituciones (Super Admin) |
| `catalogo.api.js` | CRUD del catálogo de modelos (Super Admin) |

---

### `frontend/src/composables/`

Funciones de Vue 3 reutilizables (`use...`) que encapsulan lógica con reactividad.

| Composable | Qué hace |
|---|---|
| `useApi.js` | Wrapper sobre `fetch` con manejo de token, errores y loading state. |
| `useToast.js` | Sistema de notificaciones toast. Expone `success()`, `danger()`, `warning()`, `info()`. Las notificaciones aparecen en la esquina superior derecha y se auto-eliminan. |
| `useOffline.js` | Detecta si el navegador está offline y encola operaciones en **IndexedDB** para sincronizar al volver a conectarse. |
| `useWebSocket.js` | Maneja la conexión WebSocket con el backend para recibir alertas en tiempo real. |

---

### `frontend/src/mocks/`

Simulación del backend usando **MSW v2**.

| Archivo/Directorio | Qué hace |
|---|---|
| `browser.js` | Configura y exporta el worker de MSW para el navegador. |
| `handlers.js` | Define todos los interceptores HTTP: GET, POST, PATCH, DELETE para cada endpoint. Importa los datos de `data/` y aplica la lógica de respuesta (crear, filtrar, actualizar). |
| `data/activos.js` | Array inicial de activos con datos realistas. |
| `data/ordenes.js` | Array inicial de órdenes de trabajo. |
| `data/alertas.js` | Array inicial de alertas. |
| `data/usuarios.js` | Array inicial de usuarios de la institución. |
| `data/auth.js` | Credenciales de los 4 usuarios de prueba. |
| `data/tokens.js` | Tokens JWT mock para cada rol. |
| `data/dashboard.js` | KPIs y datos de gráficos para el dashboard del coordinador. |
| `data/proyeccion.js` | Datos de proyección financiera para el director. |
| `data/instituciones.js` | Array de instituciones para el Super Admin. |
| `data/catalogo.js` | Array de modelos del catálogo global. |

---

### `frontend/src/directives/`

- `clickOutside.js` — Directiva `v-click-outside`. Detecta clics fuera de un elemento para cerrar dropdowns y modales.

### `frontend/src/utils/`

Funciones puras de utilidad (sin reactividad).

| Archivo | Utilidad |
|---|---|
| `date.js` | Formatea fechas (ej: `"15 jun 2025"`, `"hace 3 días"`). |
| `score.js` | Convierte un score numérico (0–100) a color y etiqueta (`crítico`, `regular`, `bueno`, `excelente`). |
| `estadoOT.js` | Mapea el estado de una orden de trabajo a etiqueta y color. |

---

### `frontend/src/components/`

Componentes Vue organizados por dominio.

#### `components/ui/` — Design System

Componentes base reutilizables en toda la app. No conocen el negocio.

| Componente | Qué es |
|---|---|
| `EduButton.vue` | Botón con variantes: `primary`, `secondary`, `outline`, `outline-gray`, `danger`, `ghost`. Soporta loading y disabled. |
| `EduInput.vue` | Input de texto con label, mensaje de error y estado de error. |
| `EduSelect.vue` | Select con opciones y label. |
| `EduTextarea.vue` | Textarea con label y error. |
| `EduCard.vue` | Contenedor con borde, sombra y radio de esquinas. |
| `EduBadge.vue` | Etiqueta pequeña de color (`success`, `warning`, `danger`, `info`, `neutral`). |
| `EduTable.vue` | Tabla responsiva con cabecera, filas y estado vacío. |
| `EduModal.vue` | Modal con overlay, slot de contenido y botón de cierre. |
| `EduSpinner.vue` | Indicador de carga circular. |
| `EduToast.vue` | Contenedor de notificaciones toast (se monta vía Teleport en `<body>`). |
| `EmptyState.vue` | Pantalla vacía con ícono, título, descripción y slot de acción. |
| `OfflineBanner.vue` | Banner que aparece en la parte superior cuando el navegador pierde conexión. |
| `SkeletonLoader.vue` | Placeholder animado mientras cargan los datos (efecto shimmer). |

#### `components/layout/` — Estructura de Página

| Componente | Qué es |
|---|---|
| `AppShell.vue` | Layout de escritorio: TopNav arriba + área de contenido con padding. Acepta `title`, `subtitle` y slot `#actions` para el encabezado de página. |
| `MobileShell.vue` | Layout móvil: MobileHeader arriba + NavDrawer lateral + área de contenido. |
| `TopNav.vue` | Barra de navegación horizontal (escritorio). Logo, menú por rol, campana de alertas, menú de usuario. |
| `MobileHeader.vue` | Cabecera móvil con menú hamburguesa y logo. |
| `NavDrawer.vue` | Panel lateral deslizante en móvil con los ítems de navegación. |
| `UserMenu.vue` | Dropdown del usuario autenticado (nombre, email, ir a perfil, cerrar sesión). |

#### `components/activos/`

| Componente | Qué es |
|---|---|
| `EduScoreRing.vue` | Anillo circular SVG que visualiza el score de salud (0–100) con color según el rango. |
| `ScoreBadge.vue` | Badge compacto con el score y su color. |
| `QrCodeDisplay.vue` | Muestra el código QR generado para un activo. |
| `CatalogoSelector.vue` | Selector de modelo del catálogo al crear un activo (autocompletado). |

#### `components/dashboard/`

| Componente | Qué es |
|---|---|
| `MetricCard.vue` | Tarjeta KPI con valor, etiqueta, ícono y variante de color. |
| `SemaforoChart.vue` | Gráfico de distribución por estado con barras de colores. |
| `HeatmapGrid.vue` | Grilla visual del parque tecnológico donde cada celda representa un activo y su color indica el score. |

#### `components/ordenes/`

| Componente | Qué es |
|---|---|
| `OrdenCard.vue` | Tarjeta resumen de una orden de trabajo (activo, estado, prioridad, técnico). |
| `EstadoBadge.vue` | Badge de estado de orden (pendiente / en progreso / completada / cancelada). |
| `PrioridadBadge.vue` | Badge de prioridad (baja / media / alta / crítica). |

#### `components/alertas/`
- `AlertaCard.vue` — Tarjeta de una alerta con tipo, activo afectado, mensaje y botón de marcar como leída.

#### `components/shared/`

| Componente | Qué es |
|---|---|
| `EvidenciaUploader.vue` | Input de archivo para subir fotos de evidencia en órdenes de trabajo. |
| `FotoCapture.vue` | Captura foto desde la cámara del dispositivo móvil. |
| `QrScanner.vue` | Lector de código QR usando la cámara (para la vista del docente). |

---

### `frontend/src/views/`

Páginas completas de la aplicación, organizadas por rol. Cada view corresponde a una ruta.

#### `views/auth/`
- `LoginView.vue` — Pantalla de login con formulario de email y contraseña. Al autenticarse, redirige al dashboard del rol.

#### `views/coordinador/` — 10 vistas
| Vista | Ruta | Qué hace |
|---|---|---|
| `DashboardCoordinador.vue` | `/coordinador/dashboard` | KPIs, gráfico de salud, acciones rápidas. |
| `ActivosListView.vue` | `/coordinador/activos` | Lista de activos con filtros y búsqueda. |
| `ActivoFormView.vue` | `/coordinador/activos/nuevo` y `…/:id/editar` | Formulario de creación/edición de activo. |
| `ActivoDetailView.vue` | `/coordinador/activos/:id` | Ficha completa del activo con score, historial y órdenes. |
| `OrdenesListView.vue` | `/coordinador/ordenes` | Lista de órdenes con filtros. |
| `OrdenFormView.vue` | `/coordinador/ordenes/nueva` | Formulario para crear una orden de trabajo. |
| `OrdenDetailView.vue` | `/coordinador/ordenes/:id` | Detalle de la orden con historial y evidencias. |
| `AlertasView.vue` | `/coordinador/alertas` | Lista de alertas, marcar como leídas. |
| `UsuariosListView.vue` | `/coordinador/usuarios` | Lista de usuarios de la institución. |
| `UsuarioFormView.vue` | `/coordinador/usuarios/nuevo` y `…/:id/editar` | Formulario de creación/edición de usuario. |

#### `views/director/` — 2 vistas
| Vista | Ruta | Qué hace |
|---|---|---|
| `DashboardDirector.vue` | `/director/dashboard` | KPIs ejecutivos y gráficos estratégicos. |
| `ProyeccionView.vue` | `/director/proyeccion` | Proyección financiera de mantenimientos y reemplazos. |

#### `views/tecnico/` — 3 vistas
| Vista | Ruta | Qué hace |
|---|---|---|
| `MisOrdenesView.vue` | `/tecnico/ordenes` | Lista de órdenes asignadas al técnico. |
| `OrdenDetailTecnico.vue` | `/tecnico/ordenes/:id` | Detalle de la orden desde la perspectiva del técnico. |
| `EjecutarOrdenView.vue` | `/tecnico/ordenes/:id/ejecutar` | Formulario para registrar el trabajo realizado y subir evidencias. |

#### `views/admin/` — 4 vistas
| Vista | Ruta | Qué hace |
|---|---|---|
| `InstitucionesListView.vue` | `/admin/instituciones` | Lista de todas las instituciones en la plataforma. |
| `InstitucionFormView.vue` | `/admin/instituciones/nueva` y `…/:id/editar` | Crear o editar una institución. |
| `CatalogoListView.vue` | `/admin/catalogo` | Lista del catálogo global de modelos. |
| `CatalogoModeloFormView.vue` | `/admin/catalogo/nuevo` y `…/:id/editar` | Crear o editar un modelo del catálogo. |

#### `views/docente/` — 1 vista
- `ReporteFallaView.vue` (`/qr/:codigo`) — Formulario público de reporte de falla. No requiere autenticación.

#### `views/shared/` — 2 vistas
- `PerfilView.vue` (`/perfil`) — Ver y editar el perfil del usuario autenticado. Adaptable a escritorio (AppShell) y móvil (MobileShell).
- `NotFoundView.vue` (`/:pathMatch(.*)`) — Página 404 con redirección inteligente según rol.

#### `views/dev/` — 1 vista
- `ComponentsPlayground.vue` (`/dev/components`) — Muestra todos los componentes UI con sus variantes. Solo para desarrollo.

---

## Flujo de datos (resumen)

```
Vista (View)
  → llama a action del Store (Pinia)
    → Store llama a función del API layer
      → API layer hace fetch()
        → MSW intercepta (modo mock) o va al backend real
          → respuesta vuelve al API layer
        → Store actualiza su state
      → Vista se re-renderiza reactivamente
```

---

## Archivos de configuración importantes

| Archivo | Para qué sirve |
|---|---|
| `frontend/vite.config.js` | Configura Vite: alias `@` apunta a `src/`, plugin PWA con Workbox, puerto de desarrollo. |
| `frontend/index.html` | HTML base de la SPA. Punto de entrada del bundle. |
| `frontend/package.json` | Dependencias y scripts (`dev`, `build`, `lint`). |
| `frontend/.env` | Variables de entorno locales. `VITE_USE_MOCK=true` activa MSW. **No se commitea.** |
| `CLAUDE.md` | Memoria del proyecto para Claude Code: stack, reglas críticas, comandos y estructura. |
| `docker-compose.yml` | Orquesta API + PostgreSQL + frontend + Nginx para el entorno completo. |
