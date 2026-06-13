# 03 — Plan de tareas (backlog ejecutable)

> **Instrucciones para Claude Code:** leer este archivo al inicio de cada sesión. Trabajar las tareas EN ORDEN dentro de la fase activa. Al completar una tarea: marcar `[x]`, y si surgió trabajo nuevo, agregarlo como tarea en la sección que corresponda (nunca borrar tareas: tachar con `~~texto~~` si se descartan, anotando el motivo). Una tarea está completa solo si cumple la Definición de Terminado de `CLAUDE.md`.

**Leyenda:** 🅗 = ligada a historia de usuario del PRD · ⚙ = infraestructura/técnica

---

## Fase 0 — Setup del entorno (semana 0)

- [ ] ⚙ Inicializar monorepo: `backend/` (estructura de `docs/02-ARQUITECTURA.md` §2) y `frontend/` (Vue 3 + Vite), `.gitignore`, `.env.example`, `README.md`
- [ ] ⚙ `pyproject.toml` con dependencias (fastapi, uvicorn, sqlalchemy[asyncio], asyncpg, alembic, pydantic-settings, python-jose, passlib[bcrypt], apscheduler, qrcode, fastmcp, pytest, pytest-asyncio, httpx, ruff) y configuración de ruff + pytest
- [ ] ⚙ `docker-compose.yml`: servicios `api`, `db` (postgres:16 con pgvector), `frontend`, `nginx`; volúmenes de BD y evidencias; healthchecks
- [ ] ⚙ `app/core/config.py` (Settings), `app/core/database.py` (engine async + `get_db`), `app/main.py` con healthcheck `GET /api/v1/health`
- [ ] ⚙ Configurar Alembic (modo async) y verificar `alembic upgrade head` contra el contenedor de BD
- [ ] ⚙ Pipeline de CI en GitHub Actions: ruff + pytest en cada push
- [ ] ⚙ Verificación de cierre de fase: `docker compose up` levanta todo y el healthcheck responde

## Fase 1 — Diseño e iniciación (semanas 1–2)

- [x] ⚙ Sistema de diseño UI: documento `docs/06-DISEÑO-UI.md` con tokens de color, tipografía dual desktop/mobile, espaciado, componentes, formularios, layouts por rol y especificaciones PWA
- [x] ⚙ Plan de trabajo frontend: documento `docs/07-PLAN-TRABAJO-FRONTEND.md` con checklist ejecutable de 8 fases, 23 vistas y criterios de cierre por fase
- [ ] ⚙ Modelos SQLAlchemy de TODAS las entidades (§4 de arquitectura) con `TenantMixin` y `TimestampMixin` + migración inicial Alembic
- [ ] ⚙ Seed de desarrollo: 1 institución demo, usuarios por rol, catálogo inicial (≥ 15 modelos de Epson/HP/Dell/LG/Daikin con reglas de mantenimiento reales)
- [ ] ⚙ Autenticación: `core/security.py`, `POST /auth/login`, `POST /auth/refresh`, deps `get_current_user`, `require_role`, `get_tenant_id`
- [ ] ⚙ Tests base en `conftest.py`: BD de test, cliente httpx, fixtures de 2 tenants y tokens por rol (fundamento de los tests de aislamiento)
- [ ] ⚙ Esqueleto del frontend: router con guardas por rol, store de auth (Pinia), layout base, `useApi.js` con refresh automático

## Fase 2 — Sprint 1: Base del sistema (semanas 3–4)

- [ ] 🅗 HU-01 — API de catálogo: `GET /catalogo/modelos` con filtros por marca/categoría
- [ ] 🅗 HU-01 — CRUD de activos (`POST/GET/PATCH /activos`) con autocompletado de especificaciones desde el modelo del catálogo
- [ ] 🅗 HU-01 — `services/lifecycle_engine.py`: al crear el activo, generar `plan_mantenimiento` desde las `regla_mantenimiento` del modelo
- [ ] 🅗 HU-01 — `services/qr_service.py`: generación del QR (PNG descargable) con URL pública del activo
- [ ] 🅗 HU-01 — Vistas Vue del coordinador: listado y formulario de registro de activo con selección de catálogo
- [ ] 🅗 HU-09 — `services/score_service.py`: cálculo del score con los 4 factores y pesos de `config.py`; endpoint `GET /activos/{id}/score` con desglose
- [ ] 🅗 HU-09 — Alerta automática `riesgo_falla` cuando score < 40 (idempotente)
- [ ] 🅗 HU-03 — `jobs/nightly.py` con APScheduler: alertas a 15 y 5 días, vencidos, recálculo de scores
- [ ] 🅗 HU-03 — Endpoint y vista de alertas con acción "generar OT desde alerta"
- [ ] 🅗 HU-10 — Panel admin: CRUD de instituciones y edición del catálogo (solo `super_admin`)
- [ ] 🅗 HU-10 — `services/rag_service.py`: carga de PDF de manual, chunking e indexación en pgvector + log de auditoría de cambios al catálogo
- [ ] ⚙ Cierre Sprint 1 (hito H2): cobertura ≥ 90% en `services/`, demo del flujo registro→plan→score→alerta

## Fase 3 — Sprint 2: Fallas y órdenes de trabajo (semanas 5–6)

- [ ] 🅗 HU-02 — Endpoint público `GET /qr/{codigo}`: datos del activo + formulario de reporte (sin login completo)
- [ ] 🅗 HU-02 — `POST /reportes` multipart: validar imagen, guardar en `/var/edutrack/evidencias/...` vía `evidencia_service`, pre-clasificar la falla
- [ ] 🅗 HU-02 — WebSockets: `ConnectionManager` por tenant + evento `nuevo_reporte` (< 30 s)
- [ ] 🅗 HU-02 — Vista móvil del docente: escaneo → formulario precargado → foto → confirmación (3 pasos máximo)
- [ ] 🅗 HU-04 — CRUD de OTs con máquina de estados (`pendiente/aceptada/en_ejecucion/cerrada`; transición inválida → 409), creación desde reporte o desde cero
- [ ] 🅗 HU-04 — Disponibilidad de técnicos + notificación WebSocket `ot_asignada`
- [ ] 🅗 HU-05 — Flujo del técnico: aceptar OT, verificación por escaneo del QR, subir ≥ 2 evidencias, cierre digital con timestamp
- [ ] 🅗 HU-05 — PWA offline: service worker, cola de operaciones en IndexedDB (`useOffline.js`) y sincronización al reconectar
- [ ] 🅗 HU-06 — `GET /activos/{id}/historial` + vista web y móvil + exportación a PDF
- [ ] ⚙ Cierre Sprint 2 (hito H3): test de integración E2E del ciclo reporte→OT→cierre con evidencias; validación con usuario piloto

## Fase 4 — Sprint 3: Visibilidad ejecutiva, MCP e integración (semanas 7–8)

- [ ] 🅗 HU-07 — Endpoint agregado `GET /dashboard` (semáforo, filtros, vencidos) optimizado a ≤ 3 s
- [ ] 🅗 HU-07 — Vista del director con actualización en vivo vía WebSocket (`score_actualizado`, `alerta_creada`)
- [ ] 🅗 HU-08 — `services/proyeccion_service.py`: costos del periodo + candidatos a reemplazo; costos de referencia configurables; export PDF
- [ ] 🅗 HU-11 — `mcp/server.py` + `mcp/tools.py`: las 4 herramientas de solo lectura con auth por token de API y registro en `mcp_audit_log`
- [ ] 🅗 HU-11 — Generación de tokens de API de solo lectura desde el perfil del coordinador/director
- [ ] ⚙ Integración final: revisión OpenAPI completa (summaries, response_models, errores), pruebas de aceptación de TODAS las HU contra los criterios del PRD
- [ ] ⚙ Documentación: README de despliegue, manual de usuario básico, exportación del esquema OpenAPI
- [ ] ⚙ Despliegue a producción (hito H4): VPS con Docker Compose, Nginx + TLS (Let's Encrypt), `auth_request` para `/evidencias/`, cron de respaldos (pg_dump + rsync)

## Backlog V2 (NO trabajar sin autorización explícita)

- Multi-sede · Asistente conversacional avanzado · Herramientas MCP de escritura · Ajuste de intervalos por ML · Gestión de proveedores con contratos · Migración de evidencias a S3 (interfaz `EvidenciaStorage` ya prevista)

---

## Registro de avance

| Fecha | Sesión | Tareas completadas | Notas |
| --- | --- | --- | --- |
| 2026-06-12 | Sesión 1 | Sistema de diseño UI (`docs/06-DISEÑO-UI.md`) + Plan de trabajo frontend (`docs/07-PLAN-TRABAJO-FRONTEND.md`) | 23 vistas en 8 fases con checklist ejecutable |
