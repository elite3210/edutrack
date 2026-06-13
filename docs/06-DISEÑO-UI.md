# 06 — Sistema de Diseño UI — EduTrack AI

> Documento de referencia obligatorio antes de implementar cualquier componente o vista del frontend. Define tokens, anatomía de componentes, patrones de formulario y comportamiento por rol. Ante cualquier duda visual, este documento prevalece sobre suposiciones.

---

## 1. Principios de diseño

| # | Principio | Aplicación concreta |
|---|---|---|
| 1 | **Mínima fricción en flujos críticos** | Docente reporta en ≤ 3 pasos; técnico cierra OT sin salir de una sola pantalla |
| 2 | **Jerarquía visual orientada a la decisión** | Cada pantalla tiene un único CTA principal; el semáforo del director aparece sin scroll |
| 3 | **Mobile-first para roles de campo** | Técnico y docente: diseño base en 390px; coordinador/director: base en 1280px |
| 4 | **Retroalimentación inmediata** | Todo estado visible por color + icono + texto (nunca solo color); respuesta visual ≤ 300ms |
| 5 | **Accesibilidad como requisito base** | Contraste ≥ 4.5:1 WCAG AA; iconos con texto; foco visible; fuente mínima 16px en inputs |

---

## 2. Tokens de diseño

### 2.1 Paleta de color

```css
/* Marca */
--color-primary:       #6400BE;   /* ratio contraste 7.2:1 sobre blanco — uso WCAG AAA */
--color-primary-hover: #5200A0;
--color-primary-light: #EDE0FF;   /* fondo tint de elementos activos, chips */
--color-secondary:     #8A2BE2;   /* links, iconos activos, gráficas secundarias */

/* Semánticos de estado */
--color-success:       #1E8449;   /* score alto, OT cerrada, activo saludable */
--color-success-bg:    #EAFAF1;
--color-warning:       #D35400;   /* score medio, OT pendiente, mantenimiento próximo */
--color-warning-bg:    #FEF5EC;
--color-danger:        #C0392B;   /* score crítico, vencido, error de formulario */
--color-danger-bg:     #FDEDEC;
--color-info:          #2471A3;   /* OT aceptada, notificaciones informativas */
--color-info-bg:       #EBF5FB;
--color-in-progress:   #1A5276;   /* OT en ejecución */
--color-in-progress-bg:#EAF2FF;
--color-reassigned:    #D35400;   /* OT reasignada — mismo tono advertencia + icono distinto */

/* Superficies */
--color-bg:            #F7F4FB;   /* fondo de todas las pantallas */
--color-surface:       #FFFFFF;   /* cards, modales, formularios */
--color-border:        #E0D9EE;   /* bordes de inputs y divisores */
--color-border-focus:  #6400BE;   /* borde en foco */

/* Texto */
--color-text-primary:  #1A1A2E;   /* texto general, títulos */
--color-text-secondary:#555555;   /* metadatos, descripciones, fechas */
--color-text-disabled: #AAAAAA;
--color-text-on-primary:#FFFFFF;  /* texto sobre fondo --color-primary */
```

#### Tabla de estados OT (colores semánticos completos)

| Estado OT | Color texto | Color fondo | HEX texto |
|---|---|---|---|
| `pendiente` | Naranja | `#FEF5EC` | `#D35400` |
| `aceptada` | Azul | `#EBF5FB` | `#2471A3` |
| `en_ejecucion` | Azul oscuro | `#EAF2FF` | `#1A5276` |
| `cerrada` | Verde | `#EAFAF1` | `#1E8449` |
| `reasignada` | Naranja | `#FEF5EC` | `#D35400` + icono ↩ |

#### Escala del score de salud

| Rango | Label | Color | Uso visual |
|---|---|---|---|
| 70 – 100 | Saludable | `#1E8449` | Badge verde, ring verde |
| 40 – 69 | Atención | `#D35400` | Badge naranja, ring naranja |
| 0 – 39 | Crítico | `#C0392B` | Badge rojo, ring rojo, fila resaltada |

---

### 2.2 Tipografía

**Fuente:** Inter (Google Fonts). Cargar pesos: 400, 500, 600, 700.

```html
<!-- En index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

#### Escala desktop (≥ 1024px)

| Token | Elemento | Fuente | Tamaño | Line-height | Letter-spacing | Peso |
|---|---|---|---|---|---|---|
| `--text-h1` | Título de página | Inter | 28px | 1.2 | -0.5px | 700 Bold |
| `--text-h2` | Título de sección | Inter | 22px | 1.25 | -0.3px | 600 SemiBold |
| `--text-h3` | Cabecera de card/tabla | Inter | 18px | 1.3 | 0px | 500 Medium |
| `--text-body` | Contenido general | Inter | 16px | 1.6 | 0px | 400 Regular |
| `--text-label` | Labels de formulario | Inter | 14px | 1.4 | 0.1px | 500 Medium |
| `--text-caption` | Timestamps, notas | Inter | 12px | 1.5 | 0.2px | 400 Regular |

#### Escala mobile PWA (< 1024px)

| Token | Elemento | Tamaño | Notas |
|---|---|---|---|
| `--text-h1` | Título pantalla | 24px | Reducido vs desktop |
| `--text-h2` | Título de sección | 20px | |
| `--text-h3` | Cabecera card | 17px | |
| `--text-body` | Contenido | 16px | **Mínimo obligatorio** — inputs < 16px disparan zoom en iOS |
| `--text-label` | Labels form | 15px | Subir 1px vs desktop para legibilidad táctil |
| `--text-caption` | Timestamps | 13px | Usar con moderación; nunca para info crítica |

> **Regla de oro:** ningún texto interactivo o de contenido principal en menos de 16px en mobile. Los 12-13px son solo para metadatos claramente secundarios (timestamps ya leídos, contadores pequeños).

---

### 2.3 Sistema de espaciado

Base: **4px**. Todo padding, margin y gap usa esta escala exclusivamente.

```
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px   ← unidad base de referencia
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
```

**Guías de uso frecuente:**

| Contexto | Valor |
|---|---|
| Padding interno de card | `24px` (desktop) / `16px` (mobile) |
| Gap entre cards en grid | `24px` (desktop) / `16px` (mobile) |
| Separación entre campos de formulario | `20px` |
| Padding de botones | `12px 20px` (md) |
| Padding de inputs | `12px 16px` |
| Margen de sección a sección | `32px` |
| Padding de página (contenedor) | `32px` (desktop) / `16px` (mobile) |

---

### 2.4 Sombras

```css
--shadow-sm:  0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);  /* cards por defecto */
--shadow-md:  0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04); /* cards elevadas, dropdowns */
--shadow-lg:  0 20px 40px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.06); /* modales */
--shadow-ring: 0 0 0 3px rgba(100,0,190,0.2); /* foco de accesibilidad */
```

---

### 2.5 Border radius

```css
--radius-sm:   4px   /* badges pequeños, chips */
--radius-md:   8px   /* inputs, botones, cards — radio estándar del sistema */
--radius-lg:   12px  /* cards grandes, modales */
--radius-xl:   16px  /* bottom sheets, drawers */
--radius-full:  9999px /* pills, avatares, nav active state */
```

---

### 2.6 Transiciones

```css
--transition-fast:   150ms ease-out   /* hover, micro-interacciones */
--transition-base:   200ms ease-out   /* botones, badges de estado */
--transition-slow:   300ms ease-in-out /* modales, drawers, toasts */
```

---

## 3. Navegación

### 3.1 Top Navigation — Desktop

La navegación principal es horizontal (top nav), diferenciando EduTrack de los dashboards con sidebar típicos. El menú lateral no existe en desktop.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  [🎓 EduTrack]   [Activos]  [●Órdenes]  [Alertas]  [Historial]    [🔍][🔔²][👤▼]  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Anatomía del top nav:**

| Zona | Contenido | Notas |
|---|---|---|
| Izquierda | Logo + wordmark | `#6400BE`, 24px, SemiBold |
| Centro | Ítems de navegación | Espaciado `gap: 4px`; no se usa flex-grow, se centra el grupo |
| Derecha | Búsqueda + campana + avatar | Siempre visible |

**Estados de nav item:**

| Estado | Apariencia |
|---|---|
| Default | Texto `#555555`, 14px Medium, sin fondo |
| Hover | Fondo `#EDE0FF` redondeado pill, texto `#6400BE` |
| Activo | Fondo `#6400BE`, texto blanco, pill `border-radius: 9999px`, padding `8px 16px` |
| Disabled | Texto `#AAAAAA`, sin interacción |

**Badge de notificaciones:** círculo `#C0392B` sobre el icono de campana, número blanco 10px, máximo "9+".

**Menú de usuario (dropdown):**
- Nombre completo + rol como subtexto
- Opciones: Mi perfil / Tokens de API (si coordinador o director) / Cerrar sesión
- Separador visual antes de "Cerrar sesión"
- Ancho fijo: 220px; `border-radius: 8px`; `shadow-md`

---

### 3.2 Ítems por rol

| Rol | Ítems del top nav |
|---|---|
| `coordinador` | Activos · Órdenes · Alertas · Historial |
| `director` | Dashboard · Proyección |
| `tecnico` | *(sin top nav — ver layout mobile)* |
| `docente` | *(flujo público sin navegación)* |
| `super_admin` | Instituciones · Catálogo |

---

### 3.3 Mobile Header (< 768px)

```
┌──────────────────────────────────────┐
│  [≡]    EduTrack AI    [🔔²]          │
└──────────────────────────────────────┘
```

- Altura: 56px; fondo `#6400BE`; texto blanco
- El `≡` abre un **Drawer lateral** desde la izquierda con los ítems del rol
- El título de la pantalla reemplaza el wordmark cuando la pantalla tiene nombre propio
- El técnico y docente NO muestran el menú hamburger en sus flujos críticos — pantalla completa limpia

**Drawer mobile:**
- Ancho: 280px; fondo `#FFFFFF`; `shadow-lg`
- Cabecera del drawer: avatar + nombre + rol en chip
- Ítems: `48px` de altura mínima (touch target), icono + texto, separador visual entre grupos
- Cierre: tap fuera del drawer o botón ✕

---

## 4. Layouts

### 4.1 AppShell — Desktop

```
┌─────────────────────── TopNav (64px) ───────────────────────────┐
│                                                                   │
│  ┌──────────── PageHeader ────────────────────────────────────┐  │
│  │  H1 título    subtítulo gris                    [Acción]   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────── Contenido (max-width: 1280px, centrado) ───────┐  │
│  │                    <slot />                                 │  │
│  └────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

- `TopNav`: posición `sticky top-0`; `z-index: 100`; altura `64px`; fondo `#FFFFFF`; `shadow-sm`
- `PageHeader`: padding `32px 32px 0`; siempre contiene H1 + subtítulo opcional + CTA principal derecho
- Contenedor de contenido: `padding: 24px 32px 48px`; `max-width: 1280px`; centrado con `margin: 0 auto`
- Fondo de página: `#F7F4FB`

---

### 4.2 MobileShell — PWA

```
┌─────── MobileHeader (56px) ───────┐
│                                    │
│         <slot />                   │
│   (contenido con padding-bottom    │
│    para safe-area-inset-bottom)    │
│                                    │
└────────────────────────────────────┘
```

- Safe area top: `padding-top: env(safe-area-inset-top)` — evita notch en iPhone
- Safe area bottom: `padding-bottom: env(safe-area-inset-bottom)` — evita barra home
- Scroll: `-webkit-overflow-scrolling: touch` en el contenedor principal
- Sin footer nav fijo — los CTAs van dentro del contenido de cada pantalla

---

### 4.3 Grid de contenido

```css
/* Desktop: 12 columnas */
.content-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

/* Tablet (768-1023px): 8 columnas */
/* Mobile (< 768px): 4 columnas o column único */
```

**Anchos de columnas frecuentes:**

| Contenido | Desktop | Tablet | Mobile |
|---|---|---|---|
| Métrica card | 3 cols (25%) | 4 cols (50%) | full |
| Card estándar | 4 cols (33%) | 8 cols (full) | full |
| Formulario | 6 cols (50%) | 8 cols (full) | full |
| Tabla | 12 cols (full) | 8 cols (full) | full |
| Dashboard semáforo | 8 cols + 4 side | 8 cols | full |

---

## 5. Componentes base

### 5.1 EduButton

**Variantes y estados:**

| Variante | Fondo | Texto | Borde | Uso |
|---|---|---|---|---|
| `primary` | `#6400BE` | blanco | ninguno | Acción principal de pantalla |
| `secondary` | `#FFFFFF` | `#6400BE` | `1px #6400BE` | Acción secundaria |
| `danger` | `#C0392B` | blanco | ninguno | Eliminar, acción destructiva |
| `ghost` | transparente | `#6400BE` | ninguno | Acción terciaria, links de acción |
| `outline-gray` | `#FFFFFF` | `#555555` | `1px #E0D9EE` | Filtros, controles neutros |

**Tamaños:**

| Tamaño | Alto | Padding | Fuente |
|---|---|---|---|
| `sm` | 32px | `6px 12px` | 13px Medium |
| `md` | 40px | `10px 20px` | 14px Medium — **default** |
| `lg` | 48px | `12px 24px` | 16px Medium |
| `lg-mobile` | 56px | `14px 24px` | 16px Medium — para CTA únicos en mobile |

**Estados:**

| Estado | Apariencia |
|---|---|
| `hover` | Oscurecer fondo 8%; `transition-fast` |
| `focus` | `shadow-ring` (ring púrpura 3px) |
| `disabled` | Opacidad 40%; `cursor: not-allowed` |
| `loading` | Spinner inline izquierdo + texto; no se puede volver a pulsar |

**Iconos en botón:** icono de 16px (sm/md) o 18px (lg), gap de 8px con el texto. Nunca icono sin texto en botones de acción principal.

---

### 5.2 EduInput

**Anatomía de campo de formulario:**

```
* Nombre del activo                    ← label: 14px Medium, #1A1A2E
  Descripción breve del campo          ← helper: 12px Regular, #555555 (opcional)
┌─────────────────────────────────────┐
│  Placeholder descriptivo            │  ← input: 16px Regular
└─────────────────────────────────────┘
  ⚠ Mensaje de error aquí             ← error: 12px Regular, #C0392B
```

**Especificaciones del input:**

| Propiedad | Desktop | Mobile |
|---|---|---|
| Altura | 44px | 52px |
| Padding | `10px 16px` | `14px 16px` |
| Fuente | 16px Regular | 16px Regular |
| Borde default | `1px solid #E0D9EE` | igual |
| Borde focus | `2px solid #6400BE` | igual |
| Borde error | `2px solid #C0392B` | igual |
| Border-radius | `8px` | `8px` |
| Fondo | `#FFFFFF` | `#FFFFFF` |
| Fondo disabled | `#F7F4FB` | igual |

**Asterisco de campo requerido:** `color: #C0392B`, antes del label, separado por espacio.

**Reglas de validación visual:**
- El error se muestra al perder el foco (`blur`), no mientras escribe
- Al corregir el error, el estado success aparece con borde verde y ✓ interno
- Nunca mostrar todos los errores del formulario a la vez — solo el campo activo con error

---

### 5.3 EduSelect

- Mismo aspecto que EduInput
- Flecha chevron ▾ derecha en `#555555`; rota 180° al abrir
- Dropdown: `border-radius: 8px`; `shadow-md`; max-height 240px con scroll
- Opción hover: fondo `#EDE0FF`; texto `#6400BE`
- Opción seleccionada: texto `#6400BE` + checkmark ✓ derecho
- En mobile: usar `<select>` nativo del sistema operativo (evita problemas de zoom y accesibilidad)

---

### 5.4 EduTextarea

- Igual que EduInput en borde, fondo y estados
- Altura mínima: 96px (desktop), 120px (mobile)
- `resize: vertical` permitido; no horizontal
- Contador de caracteres en esquina inferior derecha si hay límite (12px, gris)

---

### 5.5 EduCard

**Variante base:**
```
┌─────────────────────────────────────────────────┐  border-radius: 12px
│  [Cabecera opcional]               [Acción]      │  background: #FFFFFF
├─────────────────────────────────────────────────┤  shadow-sm
│                                                   │  padding: 24px (desktop)
│  <contenido>                                      │  padding: 16px (mobile)
│                                                   │
├─────────────────────────────────────────────────┤
│  [Footer opcional]                               │  border-top: 1px solid #E0D9EE
└─────────────────────────────────────────────────┘
```

**Variante MetricCard (dashboard):**
```
┌──────────────────────────────────────────────────┐
│  Activos Saludables                              │
│                                                   │
│    42          ● +8 este mes                      │  número: 40px Bold
│                                                   │
│  ████████████████░░░░░░░░  83%                   │  mini barra opcio nal
└──────────────────────────────────────────────────┘
```
- Número grande: 40px Bold, `#1A1A2E`
- Badge de tendencia: pill con bg `#EAFAF1` texto `#1E8449` para positivo; inverso para negativo

**Variante ActivoCard:**
```
┌──────────────────────────────────────────────────┐
│  [ScoreRing 52px]  Epson EB-X41              [⋮]  │
│                    Proyector · Aula 3B            │
│                    Instalado: Mar 2023            │
│                                         [●85 ↑]  │
└──────────────────────────────────────────────────┘
```

**Hover en cards clicables:** `translateY(-2px)` + `shadow-md`; `transition-fast`.

---

### 5.6 EduBadge

**Tamaños:**
- `sm`: 18px alto, 10px font, padding `2px 8px` — para tablas y listas densas
- `md`: 22px alto, 12px font, padding `3px 10px` — **default**
- `lg`: 28px alto, 14px font, padding `4px 12px` — para pantallas de detalle

**Uso:** siempre `background` del color semántico-bg + texto del color semántico. Nunca texto blanco sobre colores semánticos — el contraste no es suficiente en verde y naranja.

---

### 5.7 EduScoreRing

SVG animado que muestra el score de salud 0–100.

**Especificaciones:**
- Tamaños: `sm` 40px / `md` 64px / `lg` 96px
- Color del arco: dinámico según umbral (tabla §2.1)
- Track (fondo del arco): `#E0D9EE`
- Número central: Inter Bold, proporcional al tamaño
- Animación: `stroke-dashoffset` de 0 al valor, `300ms ease-out` al montar
- Accesibilidad: `role="img"` con `aria-label="Score de salud: 85 de 100"`

```
Tamaño md (64px):
    ╭──────╮
   ╱  [85]  ╲   ← número: 18px Bold, color semántico
  │    ████  │   ← arco verde si ≥70
   ╲  ████  ╱
    ╰──────╯
```

---

### 5.8 EduTable

**Estructura:**
```
┌──────────────────────────────────────────────────────────────────────┐
│  [ 🔍 Buscar... ]                          [ + Nuevo activo ] [⚙ ]  │ ← barra de herramientas
├──────┬──────────────────────┬──────────┬──────────┬──────────────────┤
│  □   │  Activo  ↑           │  Marca   │  Score   │  Estado          │ ← cabecera, 14px SemiBold
├──────┼──────────────────────┼──────────┼──────────┼──────────────────┤
│  □   │  Proyector EB-X41    │  Epson   │  [●85]   │  Saludable ✓     │
│  □   │  Laptop EliteBook    │  HP      │  [●42]   │  Atención ⚠      │
│  □   │  Aire Daikin 18000   │  Daikin  │  [●28]   │  Crítico ✕       │
├──────┴──────────────────────┴──────────┴──────────┴──────────────────┤
│  Mostrando 1-10 de 47          [← Anterior]  1 2 3 4 5  [Siguiente →] │ ← paginación
└──────────────────────────────────────────────────────────────────────┘
```

**Reglas de la tabla:**
- Cabecera: fondo `#F7F4FB`, texto 14px SemiBold, `#1A1A2E`; sticky en scroll vertical
- Filas: altura 56px (desktop), 64px (mobile — evitar tablas en mobile, preferir cards)
- Fila hover: fondo `#EDE0FF` sutil
- Fila seleccionada (checkbox): fondo `#EDE0FF`
- Columnas con sort: chevron ↑↓ aparece al hover; estado activo muestra flecha en `#6400BE`
- Filas críticas (score < 40): borde izquierdo `4px solid #C0392B`
- Celda de acciones: siempre última columna; botones ghost sm

**Paginación:** 10 elementos por página por defecto; selector 10/25/50 en la barra inferior izquierda.

**Estado vacío (sin resultados):**
```
         🔍
   Sin resultados
   Intenta ajustar los filtros o
   registra el primer activo.

   [ + Registrar activo ]
```

---

### 5.9 EduModal

**Tamaños:** `sm` 400px / `md` 560px / `lg` 720px

```
┌────── Backdrop oscuro rgba(0,0,0,0.5) ──────┐
│                                              │
│  ┌──────────────────────────────────────┐   │  border-radius: 12px
│  │  Título del modal               [✕]  │   │  shadow-lg
│  ├──────────────────────────────────────┤   │
│  │                                       │   │
│  │  Contenido del modal                 │   │
│  │                                       │   │
│  ├──────────────────────────────────────┤   │
│  │  [Cancelar]              [Confirmar] │   │  acciones alineadas derecha
│  └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

- Apertura: `opacity 0→1` + `translateY 8px→0`, `transition-slow`
- Cierre: clic en backdrop o botón ✕ — confirmar si hay cambios sin guardar
- Scroll interno del contenido cuando supera el alto de pantalla
- Mobile: el modal `sm/md` se convierte en Bottom Sheet (100% ancho, pegado al fondo)

---

### 5.10 EduToast

```
┌──────────────────────────────────────────────────┐  esquina sup. derecha
│  ✓  Activo registrado correctamente     [✕]      │  border-left: 4px solid #1E8449
└──────────────────────────────────────────────────┘  border-radius: 8px; shadow-md
```

- Posición: `top: 24px; right: 24px` (desktop) / `bottom: 80px; right: 16px` (mobile — encima de la safe area)
- Duración: 4 segundos para éxito/info; persistente para error hasta ser cerrado manualmente
- Múltiples toasts: apilados con gap `8px`, máximo 3 visibles
- Variantes: success `#1E8449` / warning `#D35400` / danger `#C0392B` / info `#2471A3`
- Ancho: 360px (desktop) / `calc(100vw - 32px)` (mobile)

---

### 5.11 OfflineBanner

```
┌─────────────────────────────────────────────────────────────┐
│  📡  Sin conexión — los cambios se guardan y sincronizarán  │
└─────────────────────────────────────────────────────────────┘
```

- Posición: debajo del top nav / mobile header; `sticky` al hacer scroll
- Fondo: `#FEF5EC`; texto `#D35400`; borde inferior `1px solid #D35400`
- Se muestra al detectar `navigator.onLine === false`; desaparece al reconectar con toast de éxito

---

## 6. Componentes de formulario

### 6.1 Tipos de campo

| Tipo | Componente | Notas de implementación |
|---|---|---|
| Texto corto | `EduInput` | maxlength definido por campo |
| Texto largo | `EduTextarea` | min 3 filas |
| Selección única | `EduSelect` (nativo en mobile) | |
| Selección múltiple | `EduMultiSelect` | custom en desktop; nativo en mobile |
| Fecha | `EduDateInput` | `<input type="date">`; siempre muestra DD/MM/AAAA |
| Búsqueda con autocompletado | `CatalogoSelector` | ver §8.2 |
| Subir archivo | `EduFileUpload` | ver §6.4 |
| Checkbox | `EduCheckbox` | 18px, custom design, foco visible |
| Radio | `EduRadio` | 18px, en grupo |
| Toggle switch | `EduToggle` | 44x24px mínimo |
| Contraseña | `EduInput` type password | icono ojo para mostrar/ocultar |

---

### 6.2 Patrones de layout de formulario

**Formulario de 1 columna (formularios con ≤ 6 campos):**
- Ancho máximo: 480px, centrado
- Todos los campos apilados, `gap: 20px`

**Formulario de 2 columnas (formularios complejos, desktop):**
```
┌────────────────────────┐  ┌────────────────────────┐
│  * Marca               │  │  * Modelo              │
│  [ HP               ▾] │  │  [ EliteBook 840  ▾]   │
└────────────────────────┘  └────────────────────────┘
┌──────────────────────────────────────────────────────┐
│  * Ubicación                                          │
│  [ Edificio A · Piso 2 · Aula 3B               ]     │
└──────────────────────────────────────────────────────┘
```
- 2 columnas en desktop con `gap: 24px`
- En mobile: siempre 1 columna, los campos de 2 cols se apilan

**Secciones de formulario largo:**
```
── Información del equipo ──────────────────────────────
  [campos...]

── Ubicación ───────────────────────────────────────────
  [campos...]

── Configuración ───────────────────────────────────────
  [campos...]
```
- Título de sección: 14px SemiBold `#6400BE`, con línea separadora
- `margin-top: 32px` entre secciones

---

### 6.3 Barra de acciones del formulario

```
                            [Cancelar]   [Guardar activo]
```
- Siempre al pie del formulario, alineada a la derecha
- En mobile: botón principal full-width + cancelar como link centrado debajo
- Separada del último campo por `margin-top: 32px`
- El botón principal se desactiva si no hay cambios (formulario de edición)

---

### 6.4 EduFileUpload

**Para foto única (reporte de docente):**
```
┌──────────────────────────────────────────┐
│                                           │
│         📷  Adjuntar foto                │
│         Toca aquí o usa la cámara        │
│                                           │
└──────────────────────────────────────────┘
```
- Área de 120px alto en desktop; botón de 56px en mobile
- Al seleccionar: preview de la imagen (object-fit: cover)
- Formatos: JPG, PNG; máximo 5MB por archivo
- Error de tamaño: toast inmediato

**Para evidencias múltiples (cierre de OT — mínimo 2):**
```
┌─────────┐  ┌─────────┐  ┌──────────────┐
│  [img1] │  │  [img2] │  │   + Agregar  │
│    ✕    │  │    ✕    │  │   foto       │
└─────────┘  └─────────┘  └──────────────┘
  Foto 1       Foto 2
```
- Grid de 3 columnas en mobile; 4 en desktop
- Botón ✕ sobre cada thumbnail para eliminar
- Contador: "2 de mínimo 2 fotos" → "3 fotos añadidas ✓"
- Indicador de progreso durante la subida: barra en el thumbnail

---

### 6.5 Validación y estados de error

**Prioridad de mensajes de error:**
1. Error de campo individual (debajo del campo, visible al perder foco)
2. Resumen de errores al intentar enviar (top del formulario, en EduAlert danger)
3. Error de servidor (EduToast danger, persiste hasta cerrar)

**Formato del resumen de errores al enviar:**
```
┌──────────────────────────────────────────────────────────┐
│  ✕  Por favor corrige los siguientes errores:            │
│     • El campo Marca es requerido                        │
│     • El campo Fecha de instalación no es válida         │
└──────────────────────────────────────────────────────────┘
```

---

## 7. Componentes de dominio

### 7.1 CatalogoSelector

Selector de marca → modelo con autocompletado. Flujo en 2 pasos:

```
Paso 1:
* Marca
[ Buscar marca...          🔍 ]
  ┌─────────────────────────┐
  │  Epson                  │
  │  HP                     │  ← dropdown con las marcas del catálogo
  │  Dell                   │
  │  LG                     │
  └─────────────────────────┘

Paso 2 (después de seleccionar Epson):
* Modelo
[ Selecciona modelo...     ▾ ]
  ┌─────────────────────────┐
  │  EB-X41 — Proyector     │
  │  EB-W51 — Proyector     │  ← modelos filtrados por marca
  └─────────────────────────┘

Al seleccionar el modelo, los campos se autocompletan:
  Categoría:     [Proyector]         (readonly)
  Vida útil:     [84 meses]          (readonly)
  Lumens:        [3600]              (readonly, de especificaciones JSONB)
```

---

### 7.2 QrCodeDisplay

```
┌────────────────────────────────┐
│                                 │
│   ██████████████████████       │
│   ██  [QR code image]  ██      │
│   ██████████████████████       │
│                                 │
│   Proyector Epson EB-X41       │
│   Aula 3B — Edificio A         │
│                                 │
│   [⬇ Descargar PNG]            │
└────────────────────────────────┘
```

- El QR descarga como PNG 300x300px con borde blanco de 16px (para impresión)
- Debajo del QR: nombre del activo + ubicación (para identificación visual rápida)

---

### 7.3 QrScanner

Para el flujo del técnico (verificación del equipo):

```
┌────────────────────────────────────────┐
│  ← Volver                              │
│                                         │
│  Apunta al código QR del equipo        │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │                                   │  │
│  │    [ área de cámara ]             │  │  aspecto cuadrado
│  │         [  ──  ]                  │  │  overlay de guía
│  │                                   │  │
│  └──────────────────────────────────┘  │
│                                         │
│  O ingresa el código manualmente:      │
│  [                          ] [Buscar] │  ← fallback
└────────────────────────────────────────┘
```

- Usa `@zxing/browser` accediendo a `getUserMedia`
- Solicita permiso de cámara con mensaje explicativo antes del primer uso
- Si el permiso es denegado: muestra solo el fallback de input manual
- Vibración al detectar un QR válido (`navigator.vibrate(100)`)
- QR incorrecto: borde rojo + mensaje "Este QR no corresponde a la orden asignada"

---

### 7.4 EvidenciaUploader

Ver especificación en §6.4. Consideraciones adicionales:
- Las fotos se comprimen en el cliente antes de subir (máximo 1920px en el lado mayor, calidad 85%)
- En modo offline: las fotos se guardan en IndexedDB y se sincronizan al reconectar
- El botón "Cerrar OT" permanece desactivado hasta tener ≥ 2 fotos

---

### 7.5 AlertaCard

```
┌────────────────────────────────────────────────────────────┐
│  ⚠  Mantenimiento próximo                      15 días     │  borde izq naranja
│  Proyector Epson EB-X41 — Aula 3B                          │
│  Limpieza de filtro · Vence 28 jun 2026                    │
│                               [Crear orden de trabajo →]   │
└────────────────────────────────────────────────────────────┘
```

- Borde izquierdo `4px`: naranja para advertencia, rojo para crítico
- Icono según tipo: `⚠` advertencia, `🔴` crítico, `ℹ` informativo
- El CTA "Crear orden de trabajo" pre-rellena el formulario de OT con el activo y tipo

---

### 7.6 OrdenCard (vista compacta)

```
┌────────────────────────────────────────────────────────────┐
│  OT-2024-087                           [En ejecución]      │
│  Reparación — Proyector Epson EB-X41                       │
│  Asignado a: Carlos Quispe · Límite: 20 jun 2026           │
│  Prioridad: [● Alta]                          [Ver →]      │
└────────────────────────────────────────────────────────────┘
```

---

## 8. Componentes de dashboard

### 8.1 SemaforoChart

```
  ┌────────────────────────────────────────────────────────┐
  │     Estado de salud del inventario                     │
  │                                                         │
  │   ████████████████░░░░░░░░░░░░░░                       │
  │                                                         │
  │   [●] Saludable   42   83%                             │
  │   [●] Atención     6   12%                             │
  │   [●] Crítico      3    5%                             │
  └────────────────────────────────────────────────────────┘
```

- Implementado con Chart.js (doughnut) vía `vue-chartjs`
- Colores: verde `#1E8449`, naranja `#D35400`, rojo `#C0392B`
- Centro del doughnut: total de activos, 28px Bold
- Leyenda debajo del gráfico, con conteo y porcentaje

---

### 8.2 HeatmapGrid (por aula)

```
  Edificio A              Edificio B
  ┌────┬────┬────┐        ┌────┬────┐
  │ 1A │ 1B │ 1C │        │ 2A │ 2B │
  │ 🟢 │ 🟡 │ 🔴 │        │ 🟢 │ 🟢 │
  └────┴────┴────┘        └────┴────┘
```

- Celda: 56px cuadrada (desktop), 44px (mobile)
- Color de fondo: verde/naranja/rojo según el score promedio del aula
- Tooltip al hover: lista de activos del aula con sus scores
- Sin Chart.js — implementado con CSS Grid puro

---

## 9. Patrones por rol

### 9.1 Coordinador

- **Layout:** AppShell desktop + MobileShell en mobile
- **Nav items:** Activos · Órdenes · Alertas · Historial
- **Dashboard propio:** resumen rápido (MetricCards) + alertas recientes + órdenes abiertas
- **Flujo principal:** Activos → seleccionar → ver score/QR/historial → crear OT si necesario

### 9.2 Director

- **Layout:** AppShell desktop (solo)
- **Nav items:** Dashboard · Proyección
- **Dashboard:** SemaforoChart grande + HeatmapGrid + top 5 activos críticos + MetricCards clave
- **No tiene acceso a:** formularios de registro, cierre de OTs, detalle técnico de activos

### 9.3 Técnico

- **Layout:** MobileShell siempre (incluso en desktop si accede por web)
- **Sin top nav:** header simple con nombre de la app + notificaciones
- **Flujo único:** lista de OTs asignadas → seleccionar → QrScanner → EvidenciaUploader → cerrar
- **Estado offline siempre visible:** OfflineBanner fijo

### 9.4 Docente

- **Layout:** pantalla completa, sin header de app ni nav
- **URL pública:** `/qr/:codigo` — ningún componente de la app envuelve esta vista
- **3 pasos lineares:**
  1. Vista del activo (nombre, ubicación, foto)
  2. Formulario: descripción del problema + nombre + email + foto opcional
  3. Confirmación: "Tu reporte fue enviado. Número de reporte: #2024-045"
- **Sin login:** solo nombre y email institucional para identificación

### 9.5 Super Admin

- **Layout:** AppShell desktop
- **Nav items:** Instituciones · Catálogo
- **Acceso global:** ve datos de todas las instituciones
- **Componentes únicos:** tabla de instituciones con estado activo/inactivo; formulario de carga de PDF para el catálogo

---

## 10. Estados de pantalla

### 10.1 Estado de carga (skeleton)

En lugar de spinners genéricos, usar skeleton screens que replican la forma del contenido esperado:

```
┌──────────────────────────────────────┐
│  ░░░░░░░░░░░░░        ░░░░░░         │  ← simula título + badge
│                                       │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░        │  ← simula línea de texto
│  ░░░░░░░░░░░░░░░░░                   │  ← simula segunda línea
└──────────────────────────────────────┘
```

- Animación: `background: linear-gradient(90deg, #E0D9EE 25%, #F7F4FB 50%, #E0D9EE 75%)` deslizante
- Duración de la animación: `1.5s` infinito
- Mostrar skeleton solo si la carga tarda más de **200ms** (evitar flash innecesario)

### 10.2 Estado vacío

```
         [ilustración contextual simple]

    No hay activos registrados todavía

    Registra el primer equipo del inventario
    para comenzar a gestionar su ciclo de vida.

         [ + Registrar primer activo ]
```

- Ilustración: SVG simple y contextual (no stock genérico)
- Texto: máximo 2 líneas de descripción + 1 CTA
- Sin el CTA si el rol no tiene permiso para crear

### 10.3 Estado de error

```
         ⚠

    No se pudo cargar la información

    Verifica tu conexión a internet
    o inténtalo de nuevo.

    [ Reintentar ]
```

---

## 11. Accesibilidad

| Requisito | Implementación |
|---|---|
| Contraste texto | Mínimo 4.5:1 (WCAG AA); primario `#6400BE` sobre blanco = 7.2:1 ✓ |
| Foco visible | `shadow-ring` en todos los elementos interactivos; nunca `outline: none` sin reemplazo |
| Iconos sin texto | Solo en contextos donde el label es redundante (y añadir `aria-label`) |
| Tamaño de toque | Mínimo 44x44px en mobile; CTA principales 56px |
| Orden de tabulación | Lógico por el flujo visual; sin `tabindex > 0` |
| Imágenes | `alt` descriptivo siempre; decorativas con `alt=""` |
| Formularios | Cada `<input>` asociado a su `<label>` con `for/id` |
| Mensajes de error | `aria-live="polite"` en el contenedor de errores |
| Color no es único indicador | Badge de estado: color + texto + icono siempre |

---

## 12. PWA — Especificaciones técnicas

### 12.1 Viewport y safe areas

```html
<!-- index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#6400BE">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
```

```css
/* Aplicar en MobileShell.vue */
.mobile-shell {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### 12.2 Manifiesto PWA

```json
{
  "name": "EduTrack AI",
  "short_name": "EduTrack",
  "description": "Gestión inteligente de activos tecnológicos educativos",
  "theme_color": "#6400BE",
  "background_color": "#F7F4FB",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### 12.3 Estrategia de caché (vite-plugin-pwa / Workbox)

| Recurso | Estrategia | Nota |
|---|---|---|
| Assets estáticos (JS, CSS, fuentes) | `CacheFirst` | Hash en nombre → nunca expiran |
| Imágenes de la app | `CacheFirst` | Max 60 días |
| API GET (activos, catálogo) | `NetworkFirst` | Fallback a caché si offline |
| API POST/PATCH (formularios) | Cola `BackgroundSync` | Sincroniza al reconectar |
| Evidencias fotográficas (GET) | `StaleWhileRevalidate` | Ver siempre algo, actualizar en background |

### 12.4 Instalabilidad

- Mostrar banner de "Agregar a pantalla de inicio" solo en el flujo del técnico y coordinador (no en el formulario del docente)
- Esperar a que el usuario haya completado 1 acción exitosa antes de mostrar el prompt
- En iOS: botón de instrucción manual ("Toca compartir → Agregar a pantalla de inicio")

---

## 13. Librería de iconos

**Heroicons v2** (MIT). Usar variante `outline` para la mayoría; `solid` solo para estado activo/seleccionado.

Tamaños estándar: 16px (inline en texto), 20px (botones, labels), 24px (nav, cabeceras de sección).

Nunca usar emoji como icono funcional en componentes. Los emoji solo en estados vacíos o mensajes de confirmación.

---

## 14. Dependencias UI del frontend

| Paquete | Versión mínima | Propósito |
|---|---|---|
| `tailwindcss` | v4 | Sistema de utilidades CSS |
| `@tailwindcss/vite` | v4 | Plugin Vite para Tailwind v4 |
| `@heroicons/vue` | v2 | Iconos |
| `vue-chartjs` | v5 | Gráficas del dashboard (wrapper Chart.js) |
| `chart.js` | v4 | Motor de gráficas |
| `@zxing/browser` | ^0.1 | Escáner QR por cámara (técnico) |
| `html2pdf.js` | ^0.10 | Export a PDF (historial, proyección) |
| `vee-validate` | v4 | Validación de formularios reactiva |
| `@vee-validate/rules` | v4 | Reglas de validación estándar |

---

## 15. Registro de decisiones de diseño

| Fecha | Decisión | Motivo |
|---|---|---|
| 2026-06 | Top nav horizontal en desktop | Diferenciación frente a dashboards con sidebar; más espacio vertical para el contenido |
| 2026-06 | Tailwind CSS sin framework de componentes | Máxima flexibilidad para el diseño propio; evitar sobreescribir estilos de terceros |
| 2026-06 | Inter como fuente única del sistema | Diseñada para pantallas; excelente legibilidad en 14-28px; disponible en Google Fonts |
| 2026-06 | 16px mínimo en inputs mobile | Previene el zoom automático de iOS Safari que rompe la experiencia PWA |
| 2026-06 | Skeleton loaders en lugar de spinners | Reduce el efecto de "parpadeo" y comunica mejor la estructura del contenido |
| 2026-06 | Bottom Sheet en lugar de Modal para mobile | El modal centrado en pantalla pequeña se siente como popup intrusivo |
| 2026-06 | `en_ejecucion` → azul oscuro `#1A5276` | El naranja ya está tomado por `pendiente`; el azul comunica "activo, en proceso" |
| 2026-06 | Heroicons outline como default, solid solo para activo | Consistencia visual; el solid activo refuerza el estado seleccionado sin ser pesado |
