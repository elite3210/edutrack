# 07 — Plan de trabajo: Frontend UI — EduTrack AI

> Guía ejecutable para construir las 23 pantallas del frontend con data dummy. El objetivo de este plan es obtener la UI final navegable que simula el funcionamiento completo del sistema antes de integrar el backend real. Cada fase debe quedar funcionando antes de pasar a la siguiente.

**Stack:** Vue 3 · Vite · Tailwind CSS v4 · Pinia · Vue Router 4 · MSW · vite-plugin-pwa  
**Referencia de diseño:** `docs/06-DISEÑO-UI.md`  
**Convenciones de código:** `docs/04-ESTANDARES-DE-CODIGO.md` (sección Vue 3)

---

## Fase 0 — Arquitectura base

> Sin esta fase no se puede avanzar. Toda la estructura, tokens y componentes que usan las fases siguientes nacen aquí.

### 0.1 Scaffold del proyecto

- [ ] Crear `frontend/` con Vite + Vue 3: `npm create vite@latest frontend -- --template vue`
- [ ] Instalar dependencias principales: `vue-router@4`, `pinia`, `@heroicons/vue`
- [ ] Instalar Tailwind CSS v4 + plugin Vite: `tailwindcss`, `@tailwindcss/vite`
- [ ] Instalar MSW v2: `msw` (devDependency)
- [ ] Instalar `vite-plugin-pwa`
- [ ] Instalar `vee-validate@4` + `@vee-validate/rules`
- [ ] Instalar `date-fns` + `vue-chartjs` + `chart.js`
- [ ] Configurar `vite.config.js`: plugin Vue, plugin Tailwind, plugin PWA, alias `@→src`, proxy `/api → http://localhost:8000`
- [ ] Configurar `.eslintrc` con `eslint-plugin-vue` (Composition API rules)
- [ ] Crear `.env.example`: `VITE_API_URL`, `VITE_WS_URL`, `VITE_USE_MOCK=true`
- [ ] Crear `.env` local con `VITE_USE_MOCK=true`

### 0.2 Design tokens

- [ ] Crear `src/assets/css/main.css` con:
  - Directiva `@import "tailwindcss"`
  - Variables CSS de color (`--color-primary`, `--color-success`, etc. — del `06-DISEÑO-UI.md §2.1`)
  - Variables de tipografía (`--text-h1` a `--text-caption` para desktop y mobile)
  - Variables de espaciado (`--space-1` a `--space-20`)
  - Variables de sombra, radius y transición
- [ ] Configurar `tailwind.config.js` extendiendo con los tokens del sistema de diseño
- [ ] Verificar que Inter se carga correctamente desde Google Fonts en `index.html`

### 0.3 PWA

- [ ] Crear `public/manifest.webmanifest` (nombre, colores, display standalone, start_url)
- [ ] Agregar íconos PWA: `public/icons/icon-192.png`, `icon-512.png`, `icon-512-maskable.png`
- [ ] Configurar estrategia de caché en `vite.config.js` (Workbox: CacheFirst assets, NetworkFirst API)
- [ ] Agregar meta tags PWA en `index.html` (viewport con `viewport-fit=cover`, theme-color, apple-mobile-web-app)

### 0.4 Router

- [ ] Crear `src/router/routes.js` con todas las rutas organizadas por rol y meta `{ requiresAuth, roles }`
- [ ] Crear `src/router/index.js` con `createRouter` + `createWebHistory`
- [ ] Crear `src/router/guards.js` con `beforeEach`: verificar auth → verificar rol → redirigir según caso
- [ ] Rutas protegidas por rol: `coordinador/`, `director/`, `tecnico/`, `admin/`
- [ ] Ruta pública: `/qr/:codigo` (docente, sin auth)
- [ ] Ruta de fallback: `/:pathMatch(.*)*` → `NotFoundView`

### 0.5 Pinia stores

- [ ] `src/stores/auth.js` — `user`, `token`, `institucionId`, `login()`, `logout()`, `isAuthenticated`
- [ ] `src/stores/activos.js` — `list`, `current`, `fetchAll()`, `fetchOne()`, `create()`, `update()`
- [ ] `src/stores/catalogo.js` — `marcas`, `modelos`, `fetchMarcas()`, `fetchModelosByMarca()`
- [ ] `src/stores/ordenes.js` — `list`, `current`, `fetchAll()`, `create()`, `updateEstado()`
- [ ] `src/stores/alertas.js` — `list`, `fetchAll()`, `marcarAtendida()`
- [ ] `src/stores/dashboard.js` — `metricas`, `semaforo`, `heatmap`, `fetchDashboard()`
- [ ] `src/stores/notificaciones.js` — `queue`, `agregar()`, `limpiar()`
- [ ] `src/stores/usuarios.js` — `list`, `fetchAll()`, `create()`, `update()`

### 0.6 Composables base

- [ ] `src/composables/useApi.js` — `apiFetch(url, options)` con JWT desde authStore, refresh automático, manejo de errores globales
- [ ] `src/composables/useWebSocket.js` — conexión a `/ws/notificaciones`, reconexión exponencial, despacha eventos al store de notificaciones
- [ ] `src/composables/useOffline.js` — detecta `navigator.onLine`, cola de operaciones en IndexedDB (idb), sync al reconectar

### 0.7 API service layer

- [ ] `src/api/auth.api.js` — `login(email, password)`, `refresh(token)`
- [ ] `src/api/activos.api.js` — `getActivos(filters)`, `getActivo(id)`, `createActivo(data)`, `updateActivo(id, data)`, `getScore(id)`, `getHistorial(id)`
- [ ] `src/api/catalogo.api.js` — `getMarcas()`, `getModelos(marca)`
- [ ] `src/api/reportes.api.js` — `getActivoByQr(codigo)`, `createReporte(data)`
- [ ] `src/api/ordenes.api.js` — `getOrdenes(filters)`, `getOrden(id)`, `createOrden(data)`, `updateEstado(id, estado)`, `subirEvidencia(id, file)`
- [ ] `src/api/alertas.api.js` — `getAlertas()`, `atenderAlerta(id)`
- [ ] `src/api/dashboard.api.js` — `getDashboard()`
- [ ] `src/api/proyeccion.api.js` — `getProyeccion(anio)`
- [ ] `src/api/usuarios.api.js` — `getUsuarios()`, `createUsuario(data)`, `updateUsuario(id, data)`
- [ ] `src/api/admin.api.js` — `getInstituciones()`, `createInstitucion(data)`, `getCatalogo()`, `createModelo(data)`

### 0.8 MSW — Mock Service Worker

- [ ] `src/mocks/browser.js` — setup del worker MSW para browser
- [ ] `src/mocks/data/auth.js` — usuarios dummy por rol (coordinador, director, tecnico, super_admin)
- [ ] `src/mocks/data/instituciones.js` — 2 instituciones demo
- [ ] `src/mocks/data/catalogo.js` — ≥ 15 modelos (Epson, HP, Dell, LG, Daikin) con reglas
- [ ] `src/mocks/data/activos.js` — ≥ 20 activos con scores variados (verde/amarillo/rojo)
- [ ] `src/mocks/data/ordenes.js` — OTs en todos los estados (pendiente, aceptada, en_ejecucion, cerrada)
- [ ] `src/mocks/data/alertas.js` — alertas a 5 días, 15 días y vencidas
- [ ] `src/mocks/data/usuarios.js` — técnicos y directores de la institución demo
- [ ] `src/mocks/data/dashboard.js` — métricas del semáforo y heatmap
- [ ] `src/mocks/handlers.js` — handlers MSW que interceptan todas las rutas de `src/api/`
- [ ] Inicializar MSW en `src/main.js` condicionado a `VITE_USE_MOCK=true`

### 0.9 Layouts

- [ ] `src/components/layout/AppShell.vue` — top nav + `<RouterView>` + fondo `#F7F4FB`
- [ ] `src/components/layout/MobileShell.vue` — mobile header + `<RouterView>` + safe areas CSS
- [ ] `src/components/layout/TopNav.vue` — logo, nav items por rol, campana, avatar + dropdown
- [ ] `src/components/layout/MobileHeader.vue` — hamburger, título, campana
- [ ] `src/components/layout/NavDrawer.vue` — drawer lateral mobile con ítems por rol
- [ ] `src/components/layout/UserMenu.vue` — dropdown de usuario (perfil, tokens API, logout)

### 0.10 Biblioteca de componentes base

- [ ] `src/components/ui/EduButton.vue` — variantes: primary, secondary, danger, ghost, outline-gray · tamaños: sm, md, lg, lg-mobile · estados: hover, focus, disabled, loading
- [ ] `src/components/ui/EduInput.vue` — label, helper, error, required marker, estados: default, focus, error, success, disabled
- [ ] `src/components/ui/EduSelect.vue` — mismo sistema que EduInput + chevron + dropdown custom (desktop) / nativo (mobile)
- [ ] `src/components/ui/EduTextarea.vue` — resize vertical, contador de caracteres opcional
- [ ] `src/components/ui/EduCard.vue` — slots: header, default, footer · hover elevación en cards clicables
- [ ] `src/components/ui/EduBadge.vue` — tamaños: sm, md, lg · colores semánticos por prop `variant`
- [ ] `src/components/ui/EduModal.vue` — tamaños: sm, md, lg · bottom sheet en mobile · transición
- [ ] `src/components/ui/EduToast.vue` + composable `useToast()` — variantes: success, warning, danger, info · duración configurable · apilado
- [ ] `src/components/ui/EduSpinner.vue` — tamaños sm/md/lg, color heredado
- [ ] `src/components/ui/SkeletonLoader.vue` — animación shimmer, slots para formas personalizadas
- [ ] `src/components/ui/OfflineBanner.vue` — detecta `navigator.onLine`, sticky bajo nav
- [ ] `src/components/ui/EmptyState.vue` — slot para ilustración, título, descripción, CTA opcional

### 0.11 Verificación de cierre de Fase 0

- [ ] `npm run dev` levanta sin errores
- [ ] Tailwind aplica correctamente los tokens de color y tipografía
- [ ] Router redirige correctamente según rol del mock
- [ ] MSW intercepta llamadas y devuelve datos dummy (verificar en Network tab)
- [ ] AppShell muestra top nav con ítems del rol coordinador
- [ ] MobileShell muestra header con hamburger en viewport 390px
- [ ] Todos los componentes base renderizan en una página de prueba temporal `/dev/components`
- [ ] PWA: manifest válido, service worker registrado (DevTools → Application)

---

## Fase 1 — Auth + Docente
**2 vistas**

- [ ] `src/views/auth/LoginView.vue`
  - [ ] Formulario: email + contraseña con EduInput
  - [ ] Validación con vee-validate: campos requeridos, formato email
  - [ ] Estado loading en botón durante autenticación
  - [ ] Error de credenciales con EduAlert danger inline
  - [ ] Redirección por rol al autenticar (coordinador→`/coordinador/dashboard`, etc.)
  - [ ] Logo EduTrack centrado, fondo `#F7F4FB`, card blanca 400px
  - [ ] Responsive: full-width en mobile

- [ ] `src/views/docente/ReporteFallaView.vue` *(ruta pública `/qr/:codigo`)*
  - [ ] **Paso 1 — Info del activo:** nombre, categoría, ubicación, foto del equipo (readonly desde mock)
  - [ ] **Paso 2 — Formulario:** descripción (textarea), nombre docente, email institucional, foto opcional (FotoCapture)
  - [ ] **Paso 3 — Confirmación:** número de reporte, mensaje de éxito, botón "Reportar otra falla"
  - [ ] Indicador de pasos (1/2/3) en la parte superior
  - [ ] Sin top nav ni header de app — pantalla completa con logo pequeño
  - [ ] Totalmente mobile-first: botones lg-mobile, fuente 16px+
  - [ ] Estado offline: muestra banner y guarda en cola al reconectar

---

## Fase 2 — Coordinador: Activos
**4 vistas**

- [ ] `src/views/coordinador/DashboardCoordinador.vue`
  - [ ] Saludo personalizado con nombre del usuario
  - [ ] Fila de MetricCards: total activos, activos críticos, OTs abiertas, alertas pendientes
  - [ ] Panel de alertas recientes (últimas 5) con CTA "Ver todas"
  - [ ] Panel de OTs abiertas asignadas hoy (últimas 5) con CTA "Ver todas"
  - [ ] Actualización en tiempo real vía notificaciones store (simulated con MSW)

- [ ] `src/views/coordinador/ActivosListView.vue`
  - [ ] EduTable con columnas: nombre/modelo, marca, categoría, ubicación, score, estado, acciones
  - [ ] Filtros: búsqueda por texto, categoría (select), score (verde/amarillo/rojo), ordenamiento
  - [ ] ScoreBadge en columna score con color dinámico
  - [ ] Filas críticas (score < 40) con borde izquierdo rojo
  - [ ] Botón "+ Registrar activo" en PageHeader
  - [ ] Paginación 10 items/página
  - [ ] EmptyState si no hay activos

- [ ] `src/views/coordinador/ActivoFormView.vue` *(crear y editar — misma vista)*
  - [ ] Sección "Información del equipo": CatalogoSelector (marca → modelo → autocompletado de specs)
  - [ ] Sección "Ubicación": edificio, piso, aula (3 inputs)
  - [ ] Sección "Registro": fecha de instalación, número de serie (opcional), notas (opcional)
  - [ ] Campos autocompletados desde catálogo: categoría, vida útil, especificaciones (readonly)
  - [ ] Preview del QR generado (mockup) al guardar en modo crear
  - [ ] Validación completa vee-validate con errores por campo
  - [ ] Barra de acciones: Cancelar + Guardar activo
  - [ ] En modo editar: pre-rellena todos los campos, título "Editar activo"

- [ ] `src/views/coordinador/ActivoDetailView.vue`
  - [ ] Header: nombre del activo, marca, modelo, estado badge
  - [ ] Fila superior: EduScoreRing (lg, 96px) + desglose de 4 factores + botón "Crear OT"
  - [ ] Tab "Información": ubicación, fecha instalación, specs del catálogo, número de serie
  - [ ] Tab "Plan de mantenimiento": tabla de tareas programadas con estado y fecha
  - [ ] Tab "Historial": timeline de intervenciones (OTs cerradas) con fecha, técnico, tipo, descripción
  - [ ] QrCodeDisplay con botón de descarga PNG
  - [ ] Componente shared: `src/components/activos/`
    - [ ] `ScoreBadge.vue`
    - [ ] `EduScoreRing.vue`
    - [ ] `QrCodeDisplay.vue`
    - [ ] `CatalogoSelector.vue`

---

## Fase 3 — Coordinador: Órdenes, Alertas y Usuarios
**5 vistas**

- [ ] `src/views/coordinador/OrdenesListView.vue`
  - [ ] EduTable: número OT, activo, tipo, técnico asignado, prioridad, estado, fecha límite, acciones
  - [ ] Filtros: estado (chips seleccionables), prioridad, técnico asignado, búsqueda por texto
  - [ ] PrioridadBadge y EstadoBadge en columnas correspondientes
  - [ ] Filas vencidas (fecha límite pasada + no cerrada) con fondo rojo sutil
  - [ ] Botón "+ Nueva OT" en PageHeader

- [ ] `src/views/coordinador/OrdenFormView.vue`
  - [ ] Sección "Activo": selector de activo (buscar por nombre/ubicación) o pre-relleno si viene de alerta/reporte
  - [ ] Sección "Orden": tipo (preventivo/correctivo/emergencia), descripción, prioridad (radio: alta/media/baja)
  - [ ] Sección "Asignación": select de técnico con disponibilidad simulada, fecha límite
  - [ ] Banner informativo si se crea desde alerta: "Generando OT para la alerta: [nombre alerta]"
  - [ ] Validación completa

- [ ] `src/views/coordinador/OrdenDetailView.vue`
  - [ ] Header: número OT, estado badge, prioridad badge
  - [ ] Info del activo: card compacta con nombre, ubicación, score ring sm
  - [ ] Timeline de estados: muestra el historial de cambios de estado con fecha y usuario
  - [ ] Técnico asignado: avatar, nombre, botón "Reasignar"
  - [ ] Evidencias fotográficas (grid de thumbnails si OT cerrada)
  - [ ] Descripción del trabajo realizado (si cerrada)
  - [ ] Botones de acción según estado actual: "Aceptar" / "Iniciar ejecución" / "Ver cierre"
  - [ ] Componentes shared: `src/components/ordenes/`
    - [ ] `EstadoBadge.vue`
    - [ ] `PrioridadBadge.vue`
    - [ ] `OrdenCard.vue`

- [ ] `src/views/coordinador/AlertasView.vue`
  - [ ] Tres secciones colapsables: "Vencidos" (rojo), "Próximos 5 días" (naranja), "Próximos 15 días" (amarillo)
  - [ ] AlertaCard por cada alerta: activo, tipo de tarea, días restantes, CTA "Crear OT"
  - [ ] Contador de alertas por sección en el header de cada una
  - [ ] EmptyState si no hay alertas
  - [ ] Componente: `src/components/alertas/AlertaCard.vue`

- [ ] `src/views/coordinador/UsuariosListView.vue` + `UsuarioFormView.vue`
  - [ ] Lista: nombre, email, rol badge, fecha creación, acciones (editar, desactivar)
  - [ ] Formulario crear/editar: nombre, email, rol (select: técnico/director), contraseña temporal (solo crear)
  - [ ] Toggle activo/inactivo en la lista
  - [ ] Sin acceso a usuarios de otras instituciones (filtrado por tenant en mock)

---

## Fase 4 — Director
**2 vistas**

- [ ] `src/views/director/DashboardDirector.vue`
  - [ ] SemaforoChart (donut Chart.js) grande como elemento principal — % verde/amarillo/rojo
  - [ ] Fila de MetricCards: total activos, activos críticos, OTs abiertas, costo estimado mes
  - [ ] HeatmapGrid por aula: grilla de celdas coloreadas por score promedio del aula
  - [ ] Top 5 activos críticos: lista con ScoreRing sm, nombre, ubicación, score, botón "Ver"
  - [ ] Actualización simulada vía notificaciones store cada 30s (setInterval en mock)
  - [ ] Sin botones de acción (rol solo lectura ejecutiva)
  - [ ] Filtros: categoría, edificio
  - [ ] Componentes: `src/components/dashboard/`
    - [ ] `SemaforoChart.vue`
    - [ ] `MetricCard.vue`
    - [ ] `HeatmapGrid.vue`

- [ ] `src/views/director/ProyeccionView.vue`
  - [ ] Selector de año (año actual y siguiente)
  - [ ] Tabla: activo, tipo de mantenimiento, fecha programada, costo de referencia
  - [ ] Resumen: costo total preventivos, costo estimado correctivos, total del periodo
  - [ ] Sección "Candidatos a reemplazo": activos con score < 40 + vida útil < 20% restante
  - [ ] Botón "Exportar PDF" (html2pdf.js sobre el DOM de la vista)
  - [ ] Costos de referencia editables por el coordinador (nota al pie en esta vista: "Configurable desde el perfil del coordinador")

---

## Fase 5 — Técnico PWA
**3 vistas — mobile-first obligatorio**

- [ ] `src/views/tecnico/MisOrdenesView.vue`
  - [ ] Lista de cards (no tabla) de OTs asignadas, ordenadas por prioridad + fecha límite
  - [ ] OrdenCard mobile: número OT, activo, tipo, estado badge, días restantes
  - [ ] Filtro simple: tabs "Pendientes / En ejecución / Cerradas"
  - [ ] EmptyState con mensaje motivacional si no hay OTs
  - [ ] Touch targets ≥ 48px en toda la lista

- [ ] `src/views/tecnico/OrdenDetailTecnico.vue`
  - [ ] Info del activo: nombre, ubicación, foto de referencia
  - [ ] Acordeón "Historial del activo": últimas 3 intervenciones
  - [ ] Descripción de la tarea asignada
  - [ ] Botón principal lg-mobile: "Iniciar ejecución" (si pendiente/aceptada) o "Ver cierre" (si cerrada)
  - [ ] Estado "aceptada": botón "Confirmar que estoy en el lugar" antes de ejecutar

- [ ] `src/views/tecnico/EjecutarOrdenView.vue`
  - [ ] **Paso 1 — Verificar equipo:** QrScanner activo + botón "Ingresar código manualmente" como fallback
  - [ ] QR correcto: checkmark animado + nombre del activo + botón "Continuar"
  - [ ] QR incorrecto: mensaje de error + reintentar
  - [ ] **Paso 2 — Evidencias:** EvidenciaUploader (mín. 2 fotos), contador "2 de 2 fotos requeridas"
  - [ ] FotoCapture abre cámara del dispositivo directamente
  - [ ] **Paso 3 — Cierre:** textarea "Descripción del trabajo realizado" + timestamp automático + botón "Cerrar orden"
  - [ ] Confirmación final: modal con resumen + "Confirmar cierre"
  - [ ] Toda la vista funciona offline: operaciones van a cola IndexedDB
  - [ ] Componentes: `src/components/shared/`
    - [ ] `QrScanner.vue`
    - [ ] `FotoCapture.vue`
    - [ ] `EvidenciaUploader.vue`

---

## Fase 6 — Super Admin
**4 vistas**

- [ ] `src/views/admin/InstitucionesListView.vue`
  - [ ] Tabla: nombre, RUC, activos registrados, usuarios, estado activo/inactivo, acciones
  - [ ] Toggle rápido activo/inactivo inline
  - [ ] Botón "+ Nueva institución"

- [ ] `src/views/admin/InstitucionFormView.vue`
  - [ ] Campos: nombre legal, nombre corto, RUC, email de contacto, teléfono, dirección
  - [ ] Sección "Primer coordinador": nombre, email (se crea la cuenta al guardar la institución)
  - [ ] Estado activo/inactivo toggle en edición

- [ ] `src/views/admin/CatalogoListView.vue`
  - [ ] Tabla agrupada por marca: expandible, modelos por marca con categoría y vida útil
  - [ ] Botón "+ Nuevo modelo" por marca o global
  - [ ] Columna "Reglas de mantenimiento": número de reglas + ícono para expandir
  - [ ] Botón "Cargar PDF de manual" por modelo (simulado en mock)

- [ ] `src/views/admin/CatalogoModeloFormView.vue`
  - [ ] Sección "Modelo": marca (input), nombre del modelo, categoría (select), vida útil en meses
  - [ ] Sección "Especificaciones": campos dinámicos clave-valor (agregar/quitar)
  - [ ] Sección "Reglas de mantenimiento": tabla editable (tipo de tarea + intervalo en días), agregar/quitar filas
  - [ ] Sección "Manual PDF": input de archivo + estado de indexación simulado

---

## Fase 7 — Comunes y pulido final
**2 vistas + revisión global**

- [ ] `src/views/shared/PerfilView.vue`
  - [ ] Datos personales: nombre, email (readonly), rol (readonly)
  - [ ] Cambiar contraseña: contraseña actual + nueva + confirmar
  - [ ] Tokens de API (solo coordinador y director): tabla de tokens activos + botón "Generar nuevo token" + revocar
  - [ ] Preferencias: *(reservado para futuras versiones)*

- [ ] `src/views/shared/NotFoundView.vue`
  - [ ] Ilustración simple, mensaje "404 — Página no encontrada", botón "Volver al inicio"

- [ ] **Revisión responsive global**
  - [ ] Verificar todas las vistas en 390px (mobile), 768px (tablet), 1280px (desktop)
  - [ ] Confirmar que ningún texto queda en < 16px en mobile
  - [ ] Confirmar touch targets ≥ 48px en todas las vistas del técnico y docente
  - [ ] Confirmar safe areas en vistas móviles (notch + home indicator)

- [ ] **Revisión PWA**
  - [ ] Instalabilidad verificada en Chrome DevTools (Lighthouse PWA score)
  - [ ] Modo offline: AppShell carga sin conexión, OfflineBanner visible
  - [ ] Cola IndexedDB del técnico funciona sin conexión y sincroniza al reconectar
  - [ ] Service worker actualiza sin romper la sesión activa

- [ ] **Revisión de accesibilidad**
  - [ ] Contraste verificado en los 5 colores semánticos sobre sus fondos
  - [ ] Foco visible en todos los elementos interactivos (keyboard navigation)
  - [ ] Todos los iconos funcionales tienen `aria-label`
  - [ ] Formularios con `for/id` correctos en todos los campos

---

## Resumen de vistas por fase

| Fase | Nombre | Vistas | Estado |
|---|---|---|---|
| 0 | Arquitectura base | — | ⬜ Pendiente |
| 1 | Auth + Docente | 2 | ⬜ Pendiente |
| 2 | Coordinador: Activos | 4 | ⬜ Pendiente |
| 3 | Coordinador: Órdenes + Alertas + Usuarios | 5 | ⬜ Pendiente |
| 4 | Director | 2 | ⬜ Pendiente |
| 5 | Técnico PWA | 3 | ⬜ Pendiente |
| 6 | Super Admin | 4 | ⬜ Pendiente |
| 7 | Comunes + pulido | 2 + revisión | ⬜ Pendiente |
| **Total** | | **23** | |

---

## Criterios de cierre por fase

| Fase | Criterio de cierre |
|---|---|
| 0 | `npm run dev` verde, todos los componentes base renderizan, MSW responde, router navega por rol |
| 1 | Login redirige por rol, flujo QR del docente completa los 3 pasos con datos mock |
| 2 | Coordinador puede ver lista de activos, registrar uno nuevo y ver su detalle con score |
| 3 | Ciclo completo: alerta → crear OT → ver detalle OT · gestión de usuarios funcional |
| 4 | Dashboard del director muestra semáforo + heatmap con datos del mock · exporta PDF |
| 5 | Técnico puede aceptar OT, escanear QR (mock), subir 2 fotos y cerrar OT sin conexión |
| 6 | Super admin puede crear institución con primer coordinador y agregar modelo al catálogo |
| 7 | Lighthouse PWA ≥ 90, sin textos < 16px en mobile, navegación completa sin errores |

---

## Dependencias entre fases

```
Fase 0 ──► Fase 1 ──► Fase 2 ──► Fase 3
                                     │
                  Fase 4 ◄───────────┤ (comparte componentes de dashboard)
                  Fase 5 ◄───────────┤ (comparte EvidenciaUploader, OrdenCard)
                  Fase 6 ◄───────────┘ (independiente, usa solo componentes base)
                     │
                  Fase 7 ◄─────── Todas las fases anteriores completas
```

---

## Registro de avance

| Fecha | Fase | Tareas completadas | Notas |
|---|---|---|---|
| _(agregar al completar cada fase)_ | | | |
