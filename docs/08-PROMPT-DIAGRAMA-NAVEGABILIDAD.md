# 08 — Prompt para generar el diagrama de navegabilidad

Pegar este prompt completo en ChatGPT (modo generación de imágenes con DALL·E).

---

## Prompt

```
Create a professional software navigation flow diagram for a web application called "EduTrack AI". The diagram must show all 24 screens organized in horizontal swim lanes, one lane per user role. Use a clean, modern flat design style with a white background, rounded rectangle boxes for each screen, and directional arrows showing the navigation connections between screens.

---

LAYOUT STRUCTURE — 6 horizontal swim lanes stacked vertically:

Lane 1 — PUBLIC / DOCENTE (no login required) — color: light gray background (#F5F5F5), label color: #555555
Lane 2 — COORDINADOR (full access) — color: light purple background (#EDE0FF), label color: #6400BE
Lane 3 — DIRECTOR (read-only executive) — color: light blue background (#E3F0FF), label color: #2471A3
Lane 4 — TÉCNICO (PWA mobile-first) — color: light green background (#E8F5E9), label color: #1E8449
Lane 5 — SUPER ADMIN (global access) — color: light orange background (#FFF3E0), label color: #E65100
Lane 6 — SHARED (all roles) — color: light yellow background (#FFFDE7), label color: #F57F17

Each lane has its role name as a bold vertical or horizontal label on the left side.

---

SCREENS — place each screen as a rounded rectangle box showing: screen name (bold, 13px) on top line, route path (monospace, 11px, gray) on bottom line.

LANE 1 — PUBLIC / DOCENTE:
Box 1: "Login" / /login
Box 2: "Reporte de Falla QR" / /qr/:codigo  [mark with a mobile phone icon — PWA public view, 3-step flow]

LANE 2 — COORDINADOR:
Box 3: "Dashboard Coordinador" / /coordinador/dashboard  [star icon — entry point]
Box 4: "Lista de Activos" / /coordinador/activos
Box 5: "Registrar / Editar Activo" / /coordinador/activos/nuevo · /editar
Box 6: "Detalle de Activo + Score" / /coordinador/activos/:id  [includes EduScoreRing indicator]
Box 7: "Lista de Órdenes de Trabajo" / /coordinador/ordenes
Box 8: "Crear OT" / /coordinador/ordenes/nueva
Box 9: "Detalle de OT" / /coordinador/ordenes/:id
Box 10: "Centro de Alertas" / /coordinador/alertas
Box 11: "Gestión de Usuarios" / /coordinador/usuarios

LANE 3 — DIRECTOR:
Box 12: "Dashboard Ejecutivo" / /director/dashboard  [star icon — entry point]
Box 13: "Proyección de Presupuesto" / /director/proyeccion

LANE 4 — TÉCNICO:
Box 14: "Lista de OTs (Mobile)" / /tecnico/ordenes  [star icon — entry point, mobile icon]
Box 15: "Detalle de OT (Mobile)" / /tecnico/ordenes/:id  [mobile icon]
Box 16: "Ejecutar y Cerrar OT" / /tecnico/ordenes/:id/ejecutar  [mobile icon, 3-step flow: verify QR → upload photos → close]

LANE 5 — SUPER ADMIN:
Box 17: "Lista de Instituciones" / /admin/instituciones  [star icon — entry point]
Box 18: "Crear / Editar Institución" / /admin/instituciones/nueva · /editar
Box 19: "Catálogo de Fabricantes" / /admin/catalogo
Box 20: "Crear / Editar Modelo" / /admin/catalogo/nuevo · /editar

LANE 6 — SHARED (accessible by multiple roles):
Box 21: "Centro de Notificaciones" / /notificaciones
Box 22: "Perfil de Usuario + Tokens API" / /perfil
Box 23: "404 — No Encontrado" / /404

---

NAVIGATION ARROWS — draw these directional connections with thin arrows (1.5px, dark gray #444444). Label arrows only when the trigger is non-obvious (use small italic 10px text on the arrow):

FROM Login (Box 1):
→ Box 3 (label: "rol: coordinador")
→ Box 12 (label: "rol: director")
→ Box 14 (label: "rol: técnico")
→ Box 17 (label: "rol: super_admin")

FROM Reporte de Falla QR (Box 2):
← QR scan from physical device (inbound arrow labeled "scan QR code")
→ loops back to itself (label: "report another failure")

FROM Dashboard Coordinador (Box 3):
→ Box 4 (label: "click total activos")
→ Box 7 (label: "click OTs abiertas")
→ Box 10 (label: "click alertas")
→ Box 8 (label: "quick action: create OT")
→ Box 5 (label: "quick action: new asset")
→ Box 21 (label: "bell icon")

FROM Lista de Activos (Box 4):
→ Box 5 (label: "+ Registrar activo")
→ Box 6 (label: "click row")
← Box 3

FROM Registrar / Editar Activo (Box 5):
→ Box 6 (label: "save → QR generated")
← Box 4
← Box 6 (label: "edit button")

FROM Detalle de Activo + Score (Box 6):
→ Box 8 (label: "Crear OT button")
→ Box 5 (label: "Editar button")
← Box 4
← Box 9 (label: "asset link in OT")

FROM Lista de Órdenes (Box 7):
→ Box 8 (label: "+ Nueva OT")
→ Box 9 (label: "click row")
← Box 3

FROM Crear OT (Box 8):
→ Box 9 (label: "save")
← Box 7
← Box 10 (label: "Crear OT from alert")
← Box 3 (label: "quick action")

FROM Detalle de OT (Box 9):
→ Box 6 (label: "asset link")
← Box 7

FROM Centro de Alertas (Box 10):
→ Box 8 (label: "Crear OT button")
→ Box 6 (label: "Ver activo button")
← Box 3 (label: "bell → coordinador")

FROM Gestión de Usuarios (Box 11):
← Box 3 (label: "sidebar: Usuarios")

FROM Dashboard Ejecutivo (Box 12):
→ Box 6 (label: "top 5 critical — read only")
→ Box 13 (label: "sidebar: Proyección")
→ Box 21 (label: "bell icon")

FROM Proyección de Presupuesto (Box 13):
← Box 12

FROM Lista de OTs — Técnico (Box 14):
→ Box 15 (label: "tap card")
→ Box 21 (label: "bell icon")

FROM Detalle de OT — Técnico (Box 15):
→ Box 16 (label: "tap main action button")
← Box 14

FROM Ejecutar y Cerrar OT (Box 16):
→ Box 15 (label: "close / success")
← Box 15

FROM Lista de Instituciones (Box 17):
→ Box 18 (label: "+ Nueva institución")
← Box 18 (label: "save")

FROM Crear / Editar Institución (Box 18):
← Box 17

FROM Catálogo de Fabricantes (Box 19):
→ Box 20 (label: "+ Nuevo modelo")
← Box 20 (label: "save")
← Box 17 (label: "sidebar: Catálogo")

FROM Crear / Editar Modelo (Box 20):
← Box 19

ALL ROLES — shared routes accessible from TopNav / sidebar:
Box 3, 12, 14, 17 → Box 21 (notification bell — dashed arrow, label: "bell icon")
Box 3, 12, 14, 17 → Box 22 (dashed arrow, label: "user avatar / profile")
ANY → Box 23 (dashed arrow, label: "unknown route")

FROM Reporte de Falla QR (Box 2) — PUBLIC ENTRY POINT:
Draw a special inbound arrow from outside the diagram frame on the left with label: "Teacher scans QR sticker on device (no login)"

---

VISUAL STYLE SPECIFICATIONS:
- Canvas size: 2400 × 1600 pixels, landscape orientation
- Background: pure white (#FFFFFF)
- Screen boxes: width 180px, height 56px, border-radius 10px, border 1.5px solid role color, white fill, drop shadow 0 2px 6px rgba(0,0,0,0.10)
- Entry point screens (star icon boxes): add a small filled star (★) badge top-right corner in role color
- Mobile screens (Boxes 2, 14, 15, 16): add a small smartphone icon (📱) badge top-right corner
- Public screen (Box 2): add a globe icon (🌐) badge
- Arrow style: orthogonal routing (horizontal + vertical segments, no diagonal), arrowhead filled triangle 6px, color #888888
- Arrow labels: italic, 9px, color #666666, white pill background with 1px border
- Swim lane labels: vertical text on left, all-caps bold, 14px, role color
- Swim lane dividers: 1px dashed line #DDDDDD between lanes
- Title at top center: "EduTrack AI — Navigation Flow (24 Screens)" in bold 22px #1A1A2E
- Subtitle below title: "Organized by user role · Authenticated routes protected by Vue Router guards · June 2026" in 12px #555555
- Legend box bottom-right corner: show the 6 role colors with their labels, screen count per role: Public/Docente (2), Coordinador (9), Director (2), Técnico (3), Super Admin (4), Shared (3)
- Add a small note bottom-left: "★ = role entry point after login · 📱 = PWA mobile-first view · 🌐 = public route (no login)"

---

OVERALL COMPOSITION:
The diagram reads left-to-right: the Login screen (Box 1) sits on the far left bridging all lanes with branching arrows going right into each role's entry point. Each role's screens flow horizontally from left to right in their lane following the natural user journey. Shared screens (Lane 6) appear at the bottom and receive dashed upward arrows from the role lanes above. Keep spacing generous — minimum 30px between boxes in the same lane, minimum 20px vertical gap between lanes.
```
