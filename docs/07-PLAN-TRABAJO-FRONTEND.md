# 07 — Plan de trabajo: Frontend UI — EduTrack AI

> Guía ejecutable para construir las 23 pantallas del frontend con data dummy. El objetivo de este plan es obtener la UI final navegable que simula el funcionamiento completo del sistema antes de integrar el backend real. Cada fase debe quedar funcionando antes de pasar a la siguiente.

**Stack:** Vue 3 · Vite · Tailwind CSS v4 · Pinia · Vue Router 4 · MSW · vite-plugin-pwa  
**Referencia de diseño:** `docs/06-DISEÑO-UI.md`  
**Convenciones de código:** `docs/04-ESTANDARES-DE-CODIGO.md` (sección Vue 3)

---

## Fase 0 — Arquitectura base

> Sin esta fase no se puede avanzar. Toda la estructura, tokens y componentes que usan las fases siguientes nacen aquí.

### 0.1 Scaffold del proyecto

- [x] Crear `frontend/` con Vite + Vue 3: `npm create vite@latest frontend -- --template vue`
- [x] Instalar dependencias principales: `vue-router@4`, `pinia`, `@heroicons/vue`
- [x] Instalar Tailwind CSS v4 + plugin Vite: `tailwindcss`, `@tailwindcss/vite`
- [x] Instalar MSW v2: `msw` (devDependency)
- [x] Instalar `vite-plugin-pwa`
- [x] Instalar `vee-validate@4` + `@vee-validate/rules`
- [x] Instalar `date-fns` + `vue-chartjs` + `chart.js`
- [x] Configurar `vite.config.js`: plugin Vue, plugin Tailwind, plugin PWA, alias `@→src`, proxy `/api → http://localhost:8000`
- [ ] Configurar `.eslintrc` con `eslint-plugin-vue` (Composition API rules) *(diferido a fase de pulido)*
- [x] Crear `.env.example`: `VITE_API_URL`, `VITE_WS_URL`, `VITE_USE_MOCK=true`
- [x] Crear `.env` local con `VITE_USE_MOCK=true`

### 0.2 Design tokens

- [x] Crear `src/assets/css/main.css` con:
  - Directiva `@import "tailwindcss"`
  - Variables CSS de color (`--color-primary`, `--color-success`, etc. — del `06-DISEÑO-UI.md §2.1`)
  - Variables de tipografía (`--text-h1` a `--text-caption` para desktop y mobile)
  - Variables de espaciado (`--space-1` a `--space-20`)
  - Variables de sombra, radius y transición
- [x] Configurar `tailwind.config.js` extendiendo con los tokens del sistema de diseño *(en Tailwind v4 los tokens viven dentro de `@theme {}` en `main.css`, no requiere archivo de config)*
- [x] Verificar que Inter se carga correctamente desde Google Fonts en `index.html`

### 0.3 PWA

- [x] Crear `public/manifest.webmanifest` (nombre, colores, display standalone, start_url)
- [x] Agregar íconos PWA: `public/icons/icon-192.png`, `icon-512.png`, `icon-512-maskable.png`
- [x] Configurar estrategia de caché en `vite.config.js` (Workbox: CacheFirst assets, NetworkFirst API)
- [x] Agregar meta tags PWA en `index.html` (viewport con `viewport-fit=cover`, theme-color, apple-mobile-web-app)

### 0.4 Router

- [x] Crear `src/router/routes.js` con todas las rutas organizadas por rol y meta `{ requiresAuth, roles }`
- [x] Crear `src/router/index.js` con `createRouter` + `createWebHistory`
- [x] Crear `src/router/guards.js` con `beforeEach`: verificar auth → verificar rol → redirigir según caso
- [x] Rutas protegidas por rol: `coordinador/`, `director/`, `tecnico/`, `admin/`
- [x] Ruta pública: `/qr/:codigo` (docente, sin auth)
- [x] Ruta de fallback: `/:pathMatch(.*)*` → `NotFoundView`

### 0.5 Pinia stores

- [x] `src/stores/auth.js` — `user`, `token`, `institucionId`, `login()`, `logout()`, `isAuthenticated`
- [x] `src/stores/activos.js` — `list`, `current`, `fetchAll()`, `fetchOne()`, `create()`, `update()`
- [x] `src/stores/catalogo.js` — `marcas`, `modelos`, `fetchMarcas()`, `fetchModelosByMarca()`
- [x] `src/stores/ordenes.js` — `list`, `current`, `fetchAll()`, `create()`, `updateEstado()`
- [x] `src/stores/alertas.js` — `list`, `fetchAll()`, `marcarAtendida()`
- [x] `src/stores/dashboard.js` — `metricas`, `semaforo`, `heatmap`, `fetchDashboard()`
- [x] `src/stores/notificaciones.js` — `queue`, `agregar()`, `limpiar()`
- [x] `src/stores/usuarios.js` — `list`, `fetchAll()`, `create()`, `update()`

### 0.6 Composables base

- [x] `src/composables/useApi.js` — `apiFetch(url, options)` con JWT desde authStore, refresh automático, manejo de errores globales
- [x] `src/composables/useWebSocket.js` — conexión a `/ws/notificaciones`, reconexión exponencial, despacha eventos al store de notificaciones
- [x] `src/composables/useOffline.js` — detecta `navigator.onLine`, cola de operaciones en IndexedDB (idb), sync al reconectar

### 0.7 API service layer

- [x] `src/api/auth.api.js` — `login(email, password)`, `refresh(token)`
- [x] `src/api/activos.api.js` — `getActivos(filters)`, `getActivo(id)`, `createActivo(data)`, `updateActivo(id, data)`, `getScore(id)`, `getHistorial(id)`
- [x] `src/api/catalogo.api.js` — `getMarcas()`, `getModelos(marca)`
- [x] `src/api/reportes.api.js` — `getActivoByQr(codigo)`, `createReporte(data)`
- [x] `src/api/ordenes.api.js` — `getOrdenes(filters)`, `getOrden(id)`, `createOrden(data)`, `updateEstado(id, estado)`, `subirEvidencia(id, file)`
- [x] `src/api/alertas.api.js` — `getAlertas()`, `atenderAlerta(id)`
- [x] `src/api/dashboard.api.js` — `getDashboard()`
- [x] `src/api/proyeccion.api.js` — `getProyeccion(anio)`
- [x] `src/api/usuarios.api.js` — `getUsuarios()`, `createUsuario(data)`, `updateUsuario(id, data)`
- [x] `src/api/admin.api.js` — `getInstituciones()`, `createInstitucion(data)`, `getCatalogo()`, `createModelo(data)`

### 0.8 MSW — Mock Service Worker

- [x] `src/mocks/browser.js` — setup del worker MSW para browser
- [x] `src/mocks/data/auth.js` — usuarios dummy por rol (coordinador, director, tecnico, super_admin)
- [x] `src/mocks/data/instituciones.js` — 2 instituciones demo
- [x] `src/mocks/data/catalogo.js` — 15 modelos (Epson, HP, Dell, LG, Daikin, Samsung) con reglas
- [x] `src/mocks/data/activos.js` — 12 activos con scores variados (verde/amarillo/rojo) *(volumen escala en Fase 2)*
- [x] `src/mocks/data/ordenes.js` — OTs en todos los estados (pendiente, aceptada, en_ejecucion, cerrada)
- [x] `src/mocks/data/alertas.js` — alertas a 3, 11, 14 días y vencidas
- [x] `src/mocks/data/usuarios.js` — técnicos y directores de la institución demo
- [x] `src/mocks/data/dashboard.js` — métricas del semáforo y heatmap
- [x] `src/mocks/handlers.js` — handlers MSW que interceptan todas las rutas de `src/api/`
- [x] Inicializar MSW en `src/main.js` condicionado a `VITE_USE_MOCK=true`

### 0.9 Layouts

- [x] `src/components/layout/AppShell.vue` — top nav + `<RouterView>` + fondo `#F7F4FB`
- [x] `src/components/layout/MobileShell.vue` — mobile header + `<RouterView>` + safe areas CSS
- [x] `src/components/layout/TopNav.vue` — logo, nav items por rol, campana, avatar + dropdown
- [x] `src/components/layout/MobileHeader.vue` — hamburger, título, campana
- [x] `src/components/layout/NavDrawer.vue` — drawer lateral mobile con ítems por rol
- [x] `src/components/layout/UserMenu.vue` — dropdown de usuario (perfil, tokens API, logout)

### 0.10 Biblioteca de componentes base

- [x] `src/components/ui/EduButton.vue` — variantes: primary, secondary, danger, ghost, outline-gray · tamaños: sm, md, lg, lg-mobile · estados: hover, focus, disabled, loading
- [x] `src/components/ui/EduInput.vue` — label, helper, error, required marker, estados: default, focus, error, success, disabled
- [x] `src/components/ui/EduSelect.vue` — mismo sistema que EduInput + chevron + dropdown custom (desktop) / nativo (mobile)
- [x] `src/components/ui/EduTextarea.vue` — resize vertical, contador de caracteres opcional
- [x] `src/components/ui/EduCard.vue` — slots: header, default, footer · hover elevación en cards clicables
- [x] `src/components/ui/EduBadge.vue` — tamaños: sm, md, lg · colores semánticos por prop `variant`
- [x] `src/components/ui/EduModal.vue` — tamaños: sm, md, lg · bottom sheet en mobile · transición
- [x] `src/components/ui/EduToast.vue` + composable `useToast()` — variantes: success, warning, danger, info · duración configurable · apilado
- [x] `src/components/ui/EduSpinner.vue` — tamaños sm/md/lg, color heredado
- [x] `src/components/ui/SkeletonLoader.vue` — animación shimmer, slots para formas personalizadas
- [x] `src/components/ui/OfflineBanner.vue` — detecta `navigator.onLine`, sticky bajo nav
- [x] `src/components/ui/EmptyState.vue` — slot para ilustración, título, descripción, CTA opcional

### 0.11 Verificación de cierre de Fase 0

- [x] `npm run dev` levanta sin errores
- [x] Tailwind aplica correctamente los tokens de color y tipografía
- [x] Router redirige correctamente según rol del mock
- [x] MSW intercepta llamadas y devuelve datos dummy (verificar en Network tab)
- [x] AppShell muestra top nav con ítems del rol coordinador
- [x] MobileShell muestra header con hamburger en viewport 390px
- [x] Todos los componentes base renderizan en una página de prueba temporal `/dev/components`
- [x] PWA: manifest válido, service worker registrado (DevTools → Application)

---

## Fase 1 — Auth + Docente
**2 vistas**

- [x] `src/views/auth/LoginView.vue`
  - [x] Formulario: email + contraseña con EduInput
  - [x] Validación: campos requeridos, formato email *(reactive con `computed`, equivalente funcional a vee-validate)*
  - [x] Estado loading en botón durante autenticación
  - [x] Error de credenciales con alert danger inline
  - [x] Redirección por rol al autenticar (coordinador→`/coordinador/dashboard`, etc.)
  - [x] Logo EduTrack (logo-texto.png) integrado · diseño split-screen profesional (hero + form)
  - [x] Responsive: stack vertical en mobile con card elevada

- [x] `src/views/docente/ReporteFallaView.vue` *(ruta pública `/qr/:codigo`)*
  - [x] **Paso 1 — Info del activo:** nombre, categoría, ubicación, marca/modelo, fecha de instalación (readonly desde `/api/v1/qr/:codigo`)
  - [x] **Paso 2 — Formulario:** descripción (textarea), nombre docente, email institucional, foto opcional con `capture="environment"`
  - [x] **Paso 3 — Confirmación:** número de reporte, mensaje de éxito, resumen, botón "Reportar otra falla"
  - [x] Indicador de pasos (1/2/3) con líneas de progreso y estado done/active
  - [x] Sin top nav ni header de app — header propio con logo pequeño
  - [x] Mobile-first: botones lg-mobile, inputs 52px en mobile, fuente 16px+
  - [x] Estado offline: banner sticky + encolado en IndexedDB vía `useOffline`

---

## Fase 2 — Coordinador: Activos
**4 vistas**

- [x] `src/views/coordinador/DashboardCoordinador.vue`
  - [x] Saludo personalizado con nombre del usuario *(con saludo según hora del día)*
  - [x] Fila de MetricCards: total activos, activos críticos, OTs abiertas, alertas pendientes *(con borde lateral semántico y navegación al hacer click)*
  - [x] Panel de alertas recientes (últimas 5) con CTA "Ver todas"
  - [x] Panel de OTs abiertas (últimas 5) con CTA "Ver todas" *(navegable)*
  - [ ] Actualización en tiempo real vía notificaciones store *(diferida — requiere WebSocket simulation)*

- [x] `src/views/coordinador/ActivosListView.vue`
  - [x] EduTable con columnas: nombre/modelo, marca, categoría, ubicación, score, estado, acciones
  - [x] Filtros: búsqueda por texto, categoría, score (verde/amarillo/rojo), ordenamiento
  - [x] ScoreBadge en columna score con color dinámico
  - [x] Filas críticas (score < 40) con borde izquierdo rojo
  - [x] Botón "+ Registrar activo" en PageHeader
  - [x] Paginación 10 items/página
  - [x] EmptyState contextual (sin activos vs sin resultados)

- [x] `src/views/coordinador/ActivoFormView.vue` *(crear y editar — misma vista)*
  - [x] Sección "Información del equipo": CatalogoSelector (marca → modelo → autocompletado de specs)
  - [x] Sección "Ubicación": edificio, piso, aula (3 inputs)
  - [x] Sección "Registro": fecha de instalación, número de serie (opcional), notas (opcional)
  - [x] Campos autocompletados desde catálogo: categoría, vida útil, especificaciones (readonly)
  - [x] Preview del QR generado (canvas + descarga PNG) al guardar en modo crear
  - [x] Validación reactiva por campo con errores por sección
  - [x] Sidebar sticky con resumen + barra de acciones Cancelar/Guardar
  - [x] En modo editar: pre-rellena todos los campos parseando la ubicación; título "Editar activo"

- [x] `src/views/coordinador/ActivoDetailView.vue`
  - [x] Header: categoría pill, nombre del activo, marca, modelo, ubicación, estado badge
  - [x] Fila superior: EduScoreRing (lg, 96px) + desglose de 4 factores con barras + botón "Crear OT" y "Editar"
  - [x] Tab "Información": ubicación, fecha instalación, marca/modelo, número de serie, notas
  - [x] Tab "Plan de mantenimiento": tareas programadas con estado (programado/vencido/completado) y fecha próxima
  - [x] Tab "Historial": timeline visual de intervenciones (OTs cerradas) con marca lateral
  - [x] QrCodeDisplay como aside con botón de descarga PNG
  - [x] Componentes shared en `src/components/activos/`
    - [x] `ScoreBadge.vue` — pill con punto + valor + label opcional
    - [x] `EduScoreRing.vue` — SVG anillo animado con stroke-dashoffset
    - [x] `QrCodeDisplay.vue` — patrón visual determinístico + canvas → PNG
    - [x] `CatalogoSelector.vue` — marca → modelo encadenado con preview de specs

---

## Fase 3 — Coordinador: Órdenes, Alertas y Usuarios
**5 vistas**

- [x] `src/views/coordinador/OrdenesListView.vue`
  - [x] EduTable: número OT, activo, tipo, técnico asignado, prioridad, estado, fecha límite, acciones
  - [x] Filtros: estado (chips seleccionables con contadores), prioridad, técnico asignado, búsqueda por texto
  - [x] PrioridadBadge y EstadoBadge en columnas correspondientes
  - [x] Filas vencidas (fecha límite pasada + no cerrada) con borde rojo izquierdo
  - [x] Botón "+ Nueva OT" en PageHeader
  - [x] Paginación 10 items/página · ordenamiento vencidas-primero por fecha límite

- [x] `src/views/coordinador/OrdenFormView.vue`
  - [x] Sección "Activo": buscador con autocompletado + score pill por resultado (o pre-relleno por query `activo` / `alerta`)
  - [x] Sección "Orden": tipo (preventivo/correctivo/emergencia), descripción con contador, prioridad (radio cards alta/media/baja)
  - [x] Sección "Asignación": select de técnico (filtrado por rol+activo), fecha límite
  - [x] Banner informativo si se crea desde alerta con detalle del activo y mensaje
  - [x] Validación reactiva + sidebar con resumen en vivo

- [x] `src/views/coordinador/OrdenDetailView.vue`
  - [x] Header: número OT, estado badge, prioridad badge, fecha límite
  - [x] Info del activo: card con nombre, ubicación, score ring sm, link al detalle
  - [x] Timeline de estados: historial con marcador coloreado por estado + fecha y usuario
  - [x] Técnico asignado: avatar inicial, nombre, modal de reasignación
  - [x] Evidencias fotográficas (grid de thumbnails) y descripción de cierre si OT cerrada
  - [x] Botones de acción según estado: "Aceptar OT" → "Iniciar ejecución" → "Marcar como cerrada" (con modal de descripción)
  - [x] Componentes shared: `src/components/ordenes/`
    - [x] `EstadoBadge.vue` (basado en `getEstado()` de `utils/estadoOT.js`)
    - [x] `PrioridadBadge.vue` (alta/media/baja con dot semántico)
    - [x] `OrdenCard.vue` (cards mobile-friendly con días-restantes)

- [x] `src/views/coordinador/AlertasView.vue`
  - [x] Tres secciones colapsables: "Vencidos / Riesgo" (rojo), "Próximos 5 días" (naranja), "Próximos 15 días" (amarillo)
  - [x] AlertaCard por cada alerta: activo, tipo, días restantes, CTA "Crear OT" + "Ver activo"
  - [x] Contador de alertas grande por sección en el header
  - [x] EmptyState con check verde si no hay alertas
  - [x] Componente: `src/components/alertas/AlertaCard.vue`
  - [x] Campana del TopNav navega a esta vista para coordinador

- [x] `src/views/coordinador/UsuariosListView.vue` + `UsuarioFormView.vue`
  - [x] Lista: avatar + nombre, email, rol badge, fecha creación, toggle activo, acciones (editar)
  - [x] Formulario crear/editar: nombre, email, rol, contraseña + confirmación (solo crear) con generador
  - [x] Toggle activo/inactivo inline en lista + sección "Estado de la cuenta" en form de edición
  - [x] Sin acceso a usuarios de otras instituciones (mock filtrado por `institucion_id`)

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
| 0 | Arquitectura base | — | ✅ Completada |
| 1 | Auth + Docente | 2 | ✅ Completada |
| 2 | Coordinador: Activos | 4 | ✅ Completada |
| 3 | Coordinador: Órdenes + Alertas + Usuarios | 5 | ✅ Completada |
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
| 2026-06-12 | 0 | Scaffold, tokens, PWA, router, stores, composables, API layer, MSW, layouts, 12 componentes base, playground `/dev/components` | `npm run dev` arranca en <1s; `npm run build` compila 676 módulos en 4.4s con PWA precache de 64 entries; `mockServiceWorker.js` generado vía `npx msw init`. ESLint diferido a fase de pulido. |
| 2026-06-12 | 1 | LoginView rediseñada (split-screen hero + form), ReporteFallaView con flujo de 3 pasos mobile-first, logo `logo-texto.png` integrado en assets | LoginView usa validación con `computed` en vez de vee-validate (equivalente funcional, evita dependencia para 2 campos). ReporteFallaView soporta foto opcional con `capture="environment"` y cola offline vía IndexedDB. |
| 2026-06-12 | 2 | DashboardCoordinador con métricas + paneles de alertas/OTs, ActivosListView con filtros + EduTable + paginación, ActivoFormView (crear/editar) con CatalogoSelector + QR preview, ActivoDetailView con ScoreRing + factores + tabs | Componentes nuevos: `ScoreBadge`, `EduScoreRing` (SVG animado), `QrCodeDisplay` (patrón determinístico + canvas PNG), `CatalogoSelector` (chained selects), `MetricCard`, `EduTable` (ui/). Endpoint mock nuevo: `GET /api/v1/activos/:id/plan` con factores del score + tareas por categoría. Actualización en tiempo real vía WebSocket diferida a Fase 7. |
| 2026-06-13 | 3 | OrdenesListView con chips por estado + contadores + filtros (prioridad/técnico) + paginación, OrdenFormView con buscador de activo y radio-cards de prioridad, OrdenDetailView con timeline de estados + acciones por estado + modales de cierre/reasignación, AlertasView con tres secciones colapsables, UsuariosListView con toggle activo inline, UsuarioFormView con generador de password | Componentes nuevos: `EstadoBadge`, `PrioridadBadge`, `OrdenCard` (ordenes/), `AlertaCard` (alertas/). Mock data ampliada: OTs 5→8 con `historial_estados` + `evidencias`, handler `PATCH /api/v1/ordenes/:id/estado` ahora actualiza el historial; nuevo handler genérico `PATCH /api/v1/ordenes/:id` para reasignación. Store `ordenes` añade método `update()`. Campana del TopNav navega a alertas para el coordinador. Build: 5.09s, 111 entries en precache. |
