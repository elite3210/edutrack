# 03 — Plan de tareas (backlog ejecutable)

> **Instrucciones para Claude Code:** leer este archivo al inicio de cada sesión. Trabajar las tareas EN ORDEN dentro de la fase activa. Al completar una tarea: marcar `[x]`, y si surgió trabajo nuevo, agregarlo como tarea en la sección que corresponda (nunca borrar tareas: tachar con `~~texto~~` si se descartan, anotando el motivo). Una tarea está completa solo si cumple la Definición de Terminado de `CLAUDE.md`.

**Leyenda:** 🅗 = ligada a historia de usuario del PRD · ⚙ = infraestructura/técnica

---

## Documentos de referencia por área

| Documento | Qué cubre |
| --- | --- |
| `docs/01-PRD.md` | Historias de usuario y criterios de aceptación |
| `docs/02-ARQUITECTURA.md` | Estructura, modelo de datos, decisiones técnicas |
| `docs/04-ESTANDARES-DE-CODIGO.md` | Convenciones Python, Vue, tests, git |
| `docs/05-FLUJO-DE-TRABAJO.md` | Cómo trabajar con Claude Code |
| `docs/06-DISEÑO-UI.md` | Tokens de color, tipografía, componentes |
| `docs/07-PLAN-TRABAJO-FRONTEND.md` | Checklist ejecutable de las 24 vistas (COMPLETADO) |
| `docs/09-PLAN-BACKEND.md` | Plan detallado del backend: 9 fases con tareas atómicas |
| `docs/10-PLAN-TESTS.md` | Tests por fase del backend: fixtures, casos y comandos |
| `docs/11-PLAN-DESPLIEGUE.md` | VPS + Docker Compose + CI/CD GitHub Actions |

---

## Estado global del proyecto

| Área | Estado | Documento de detalle |
| --- | --- | --- |
| Sistema de diseño UI | ✅ Completado | `docs/06-DISEÑO-UI.md` |
| Frontend — 24 vistas (prototipo con mock) | ✅ Completado | `docs/07-PLAN-TRABAJO-FRONTEND.md` |
| Backend — FastAPI + PostgreSQL | 🔲 Pendiente | `docs/09-PLAN-BACKEND.md` |
| Tests — pytest + aislamiento de tenant | 🔲 Pendiente | `docs/10-PLAN-TESTS.md` |
| Integración frontend ↔ backend real | 🔲 Pendiente | `docs/09-PLAN-BACKEND.md §5.1` |
| Despliegue a producción | 🔲 Pendiente | `docs/11-PLAN-DESPLIEGUE.md` |

---

## Fase 0 — Setup del entorno

- [ ] ⚙ Inicializar monorepo: `backend/` con estructura de `docs/02-ARQUITECTURA.md §2` y `.gitignore`, `.env.example`, `README.md` → ver `docs/09-PLAN-BACKEND.md §0.1`
- [ ] ⚙ `pyproject.toml` con dependencias y configuración de ruff + pytest → ver `docs/09-PLAN-BACKEND.md §0.2`
- [ ] ⚙ `docker-compose.yml` con servicio `db` (postgres:16 + pgvector) para desarrollo local → ver `docs/09-PLAN-BACKEND.md §0.4`
- [ ] ⚙ `app/core/config.py`, `app/core/database.py`, `app/main.py` con healthcheck `GET /api/v1/health` → ver `docs/09-PLAN-BACKEND.md §0.5`
- [ ] ⚙ Configurar Alembic en modo async → ver `docs/09-PLAN-BACKEND.md §0.6`
- [ ] ⚙ Verificación: `docker compose up -d db` + `GET /api/v1/health` → `200 {"status":"ok","db":"ok"}`

## Fase 1 — Diseño e iniciación

- [x] ⚙ Sistema de diseño UI: `docs/06-DISEÑO-UI.md`
- [x] ⚙ Plan de trabajo frontend: `docs/07-PLAN-TRABAJO-FRONTEND.md`
- [ ] ⚙ Modelos SQLAlchemy de todas las entidades + migración inicial Alembic → ver `docs/09-PLAN-BACKEND.md §1.1–1.3`
- [ ] ⚙ Seed de desarrollo: 2 instituciones, usuarios por rol, 15 modelos del catálogo, 12 activos → ver `docs/09-PLAN-BACKEND.md §2.5`
- [ ] ⚙ Autenticación: `core/security.py`, `POST /auth/login`, `POST /auth/refresh`, deps por rol → ver `docs/09-PLAN-BACKEND.md §2.1–2.4`
- [ ] ⚙ Tests base: `conftest.py` con BD de test, cliente httpx, fixtures de 2 tenants y tokens por rol → ver `docs/10-PLAN-TESTS.md §conftest`
- [x] ⚙ Esqueleto del frontend: router con guardas por rol, store de auth (Pinia), layouts, `useApi.js`

## Fase 2 — Sprint 1: Base del sistema

- [ ] 🅗 HU-01 — API de catálogo: `GET /catalogo/marcas` y `GET /catalogo/modelos?marca=` → ver `docs/09-PLAN-BACKEND.md §3.5`
- [ ] 🅗 HU-01 — CRUD de activos (`POST/GET/PATCH /activos`) con generación de QR y plan automático → ver `docs/09-PLAN-BACKEND.md §3.2–3.6`
- [ ] 🅗 HU-01 — `services/lifecycle_engine.py`: generar `plan_mantenimiento` desde las reglas del catálogo → ver `docs/09-PLAN-BACKEND.md §3.3`
- [ ] 🅗 HU-01 — `services/qr_service.py`: generación del QR (PNG descargable) → ver `docs/09-PLAN-BACKEND.md §3.2`
- [x] 🅗 HU-01 — Vistas Vue del coordinador: listado y formulario de registro de activo (prototipo ✅)
- [ ] 🅗 HU-09 — `services/score_service.py`: cálculo del score con 4 factores → ver `docs/09-PLAN-BACKEND.md §3.4`
- [ ] 🅗 HU-09 — Alerta automática `riesgo_falla` cuando score < 40 (idempotente) → ver `docs/09-PLAN-BACKEND.md §4.1–4.2`
- [ ] 🅗 HU-03 — `jobs/nightly.py` con APScheduler: alertas a 15 y 5 días, vencidos, recálculo de scores → ver `docs/09-PLAN-BACKEND.md §4.3`
- [ ] 🅗 HU-03 — Endpoint y lógica de alertas backend → ver `docs/09-PLAN-BACKEND.md §4.4`
- [x] 🅗 HU-03 — Vista de alertas con filtros, semáforo de urgencia y acción "Crear OT" (prototipo ✅)
- [x] 🅗 HU-10 — Panel admin: CRUD de instituciones y edición del catálogo (prototipo ✅)
- [ ] 🅗 HU-10 — `services/rag_service.py`: indexación de PDF en pgvector + herramienta de búsqueda → ver `docs/09-PLAN-BACKEND.md §8.1`
- [ ] ⚙ Cierre Sprint 1: cobertura ≥ 90% en `services/` → ver `docs/10-PLAN-TESTS.md §3 y §4`

## Fase 3 — Sprint 2: Fallas y órdenes de trabajo

- [ ] 🅗 HU-02 — Endpoint público `GET /qr/{codigo}` → ver `docs/09-PLAN-BACKEND.md §3.6`
- [ ] 🅗 HU-02 — `POST /reportes` multipart: validar imagen, guardar en filesystem → ver `docs/09-PLAN-BACKEND.md §5.4`
- [ ] 🅗 HU-02 — WebSockets: `ConnectionManager` por tenant + evento `nuevo_reporte` → ver `docs/09-PLAN-BACKEND.md §5.2`
- [x] 🅗 HU-02 — Vista móvil del docente: escaneo → formulario → foto → confirmación (prototipo ✅)
- [x] 🅗 HU-04 — Vistas de OTs coordinador: listado, detalle, formulario (prototipo ✅)
- [ ] 🅗 HU-04 — CRUD de OTs backend con máquina de estados + notificación WebSocket `ot_asignada` → ver `docs/09-PLAN-BACKEND.md §6.2–6.3`
- [x] 🅗 HU-05 — Vistas del técnico: lista, detalle y ejecución con evidencias (prototipo ✅)
- [ ] 🅗 HU-05 — `services/evidencia_service.py`: guardado seguro en filesystem → ver `docs/09-PLAN-BACKEND.md §5.1`
- [x] 🅗 HU-06 — Vista historial de intervenciones por activo (prototipo ✅)
- [ ] ⚙ Cierre Sprint 2: test de integración del ciclo reporte→OT→cierre → ver `docs/10-PLAN-TESTS.md §5 y §6`

## Fase 4 — Sprint 3: Visibilidad ejecutiva, MCP e integración

- [ ] 🅗 HU-07 — Endpoint agregado `GET /dashboard` optimizado a ≤ 3 s → ver `docs/09-PLAN-BACKEND.md §7.4`
- [x] 🅗 HU-07 — Vista del director: dashboard ejecutivo con semáforo, mapa de calor, top 5 críticos (prototipo ✅)
- [x] 🅗 HU-08 — Vista de proyección presupuestal con gráficos y candidatos a reemplazo (prototipo ✅)
- [ ] 🅗 HU-08 — `services/proyeccion_service.py` + endpoint `GET /proyeccion` → ver `docs/09-PLAN-BACKEND.md §7.3–7.4`
- [ ] 🅗 HU-12 — Notificaciones backend: tabla `notificacion`, `notificacion_service`, endpoints → ver `docs/09-PLAN-BACKEND.md §7.1–7.2`
- [x] 🅗 HU-12 — Vista de notificaciones: inbox con tabs, animación stagger, dropdown en nav (prototipo ✅)
- [ ] 🅗 HU-10 — API de administración `super_admin`: instituciones + catálogo → ver `docs/09-PLAN-BACKEND.md §7.5`
- [ ] 🅗 HU-11 — `mcp/server.py` + `mcp/tools.py`: 4 herramientas de lectura con auth por token → ver `docs/09-PLAN-BACKEND.md §8.2–8.3`
- [ ] ⚙ Integración frontend ↔ backend real (`VITE_USE_MOCK=false`) → ver `docs/09-PLAN-BACKEND.md §5.1`
- [ ] ⚙ Revisión OpenAPI completa: summaries, response_models, códigos de error → ver `docs/09-PLAN-BACKEND.md §5.2`
- [ ] ⚙ Cobertura total ≥ 90% en `services/`, pruebas de aceptación de todas las HU → ver `docs/10-PLAN-TESTS.md`

## Fase 5 — Despliegue a producción

> Detalle completo en `docs/11-PLAN-DESPLIEGUE.md`

- [ ] ⚙ Setup del VPS: Ubuntu 22.04, usuario `deploy`, firewall UFW, Docker instalado
- [ ] ⚙ `docker-compose.prod.yml` con los 4 servicios (nginx, api, db, frontend)
- [ ] ⚙ `nginx/nginx.conf`: HTTPS + TLS (Let's Encrypt), proxy API/WS/MCP, `auth_request` para `/evidencias/`, rate limiting en `/api/v1/qr/`
- [ ] ⚙ `frontend/Dockerfile.prod`: build de producción servido por Nginx
- [ ] ⚙ GitHub Actions CI (`ci.yml`): ruff + pytest en push a `main` — nunca despliega
- [ ] ⚙ GitHub Actions CD (`deploy.yml`): ruff + pytest + SSH deploy en push a `prod`
- [ ] ⚙ Secrets de GitHub configurados: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_PORT`
- [ ] ⚙ Primer despliegue manual: Let's Encrypt, `docker compose up`, migraciones, seed
- [ ] ⚙ Cron de renovación TLS + cron de respaldo diario (`pg_dump` + evidencias)
- [ ] ⚙ Verificación final: `GET https://dominio/api/v1/health` → `200` + push a `prod` despliega automáticamente

## Backlog V2 (NO trabajar sin autorización explícita)

- Multi-sede · Asistente conversacional avanzado · Herramientas MCP de escritura · Ajuste de intervalos por ML · Gestión de proveedores con contratos · Migración de evidencias a S3 (interfaz `EvidenciaStorage` ya prevista)

---

## Registro de avance

| Fecha | Sesión | Tareas completadas | Notas |
| --- | --- | --- | --- |
| 2026-06-12 | Sesión 1 | Sistema de diseño UI (`docs/06-DISEÑO-UI.md`) + Plan de trabajo frontend (`docs/07-PLAN-TRABAJO-FRONTEND.md`) | 23 vistas en 8 fases con checklist ejecutable |
| 2026-06-12 | Sesión 2 | Implementación completa del prototipo frontend: 23 vistas para 4 roles, esqueleto Vue 3 con router + guards + stores Pinia + useApi.js, componentes UI reutilizables, layouts, data dummy completa | Prototipo funcional navegable — sin integración backend |
| 2026-06-13 | Sesión 3 | Auditoría UI/UX completa + 20+ mejoras: logo real, iconos de navegación por rol, filtros en fila única, ARIA completo, score ring xl, filtros del dashboard funcionando | Prototipo para PA2 — sin integración backend |
| 2026-06-13 | Sesión 4 | Sistema unificado de notificaciones: `useNotificationsStore`, `useNotifMeta.js`, 19 notificaciones dummy (17 tipos), dropdown rediseñado, `NotificacionesView` con inbox-style y animación stagger. Total: **24 vistas** | Prototipo para informe académico — data dummy |
| 2026-06-27 | Sesión 5 | Plan de backend (`docs/09-PLAN-BACKEND.md`): 9 fases ordenadas por dependencias. Plan de tests (`docs/10-PLAN-TESTS.md`): fixtures, casos por fase, comandos. Plan de despliegue (`docs/11-PLAN-DESPLIEGUE.md`): VPS + Docker Compose + CI/CD GitHub Actions con rama `prod` | Solo planificación — sin código implementado aún |
