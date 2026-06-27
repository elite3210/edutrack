# CLAUDE.md — EduTrack AI

Este archivo es la memoria de proyecto de Claude Code. Se carga automáticamente al inicio de cada sesión. Mantenerlo conciso: el detalle vive en `docs/`.

## Qué es este proyecto

EduTrack AI es una plataforma SaaS multi-tenant de gestión inteligente del ciclo de vida de activos tecnológicos (equipos informáticos, proyectores, aires acondicionados) para colegios privados del Perú. Un motor denominado Lifecycle Intelligence Engine genera planes de mantenimiento desde un catálogo de fabricantes, calcula un score de salud por activo (0–100), y los docentes reportan fallas escaneando un código QR desde el celular sin instalar apps.

## Estado actual del proyecto

| Área | Estado |
| --- | --- |
| Sistema de diseño UI (`docs/06-DISEÑO-UI.md`) | ✅ Completo |
| Frontend — 24 vistas, prototipo navegable con MSW | ✅ Completo |
| Backend — FastAPI + PostgreSQL (carpeta `backend/` no existe aún) | 🔲 Pendiente |
| Tests pytest | 🔲 Pendiente |
| Despliegue VPS + Docker Compose | 🔲 Pendiente |

## Documentación de referencia

| Documento | Cuándo leerlo |
| --- | --- |
| `docs/01-PRD.md` | Antes de implementar cualquier HU — requisitos y criterios de aceptación |
| `docs/02-ARQUITECTURA.md` | Antes de crear módulos, endpoints o tablas — estructura y modelo de datos |
| `docs/03-PLAN-DE-TAREAS.md` | Al inicio de CADA sesión — backlog ejecutable; marcar tareas al completarlas |
| `docs/04-ESTANDARES-DE-CODIGO.md` | Antes de escribir código — convenciones Python, Vue, tests y git |
| `docs/05-FLUJO-DE-TRABAJO.md` | Cómo se trabaja con Claude Code en este repositorio |
| `docs/09-PLAN-BACKEND.md` | Al implementar backend — 9 fases ordenadas por dependencias |
| `docs/10-PLAN-TESTS.md` | Al escribir tests — fixtures, casos por fase y comandos pytest |
| `docs/11-PLAN-DESPLIEGUE.md` | Al desplegar — VPS, Docker Compose, CI/CD GitHub Actions |

## Stack tecnológico

- **Backend:** Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0 async, Alembic, Uvicorn
- **Base de datos:** PostgreSQL 16 + pgvector (base de conocimiento RAG)
- **Auth:** JWT HS256 (python-jose) + bcrypt (passlib)
- **Tiempo real:** WebSockets nativos de FastAPI
- **Jobs:** APScheduler (alertas nocturnas, recálculo de scores)
- **Asistente IA:** FastMCP — servidor MCP de solo lectura en el PMV
- **Frontend:** Vue 3 Composition API + Vite + Tailwind CSS v4, PWA con service worker e IndexedDB
- **Infra:** Docker Compose, Nginx (reverse proxy + TLS + servicio de evidencias), VPS Ubuntu 22.04

## Comandos del proyecto

```bash
# ── Desarrollo local (frontend con mock, sin backend) ──────────────────
cd frontend && npm run dev          # arranca en http://localhost:5173
# VITE_USE_MOCK=true en frontend/.env → MSW intercepta las llamadas a /api

# ── Cuando el backend esté construido ─────────────────────────────────
docker compose up -d db             # solo la BD en Docker
cd backend && uvicorn app.main:app --reload   # API en http://localhost:8000
# Cambiar frontend/.env → VITE_USE_MOCK=false para usar el backend real

# ── Backend (desde backend/) ───────────────────────────────────────────
pytest                              # correr todos los tests
pytest tests/api/test_activos.py -v # un archivo de tests
ruff check . && ruff format .       # lint + formato
alembic revision --autogenerate -m ""  # nueva migración
alembic upgrade head                # aplicar migraciones
python -m scripts.seed              # poblar datos demo

# ── Frontend (desde frontend/) ─────────────────────────────────────────
npm run dev                         # servidor de desarrollo Vite
npm run build                       # build de producción
```

## Estructura del repositorio

```
frontend/                    ← ✅ EXISTE — prototipo Vue 3 completo con MSW
  src/
    views/                   # 24 vistas para 4 roles (coordinador, director, técnico, admin)
    components/              # componentes UI reutilizables
    stores/                  # Pinia: auth, activos, ordenes, alertas, dashboard, notifications
    composables/             # useApi, useWebSocket, useOffline, useNotifMeta
    api/                     # capa de servicios (apunta a /api/v1/*)
    mocks/                   # MSW handlers + data dummy (reemplaza al backend real)
  public/                    # manifest PWA, iconos, service worker
  vite.config.js             # proxy /api → http://localhost:8000

backend/                     ← 🔲 NO EXISTE AÚN — construir según docs/09-PLAN-BACKEND.md
  app/
    main.py                  # FastAPI + lifespan (APScheduler)
    core/                    # config, database, security, deps
    models/                  # SQLAlchemy 2.0 (1 archivo por entidad)
    schemas/                 # Pydantic XxxCreate / XxxUpdate / XxxOut
    api/v1/                  # routers: auth, activos, catalogo, ordenes, alertas, dashboard...
    services/                # lifecycle_engine, score, qr, evidencia, proyeccion, rag
    mcp/                     # FastMCP server + 4 tools de solo lectura
    jobs/                    # APScheduler nightly job
  alembic/                   # migraciones
  tests/                     # pytest (espeja app/)
  scripts/                   # seed.py, backup.sh

docs/                        # documentación completa del proyecto
docker-compose.yml           # para desarrollo local (solo servicio db por ahora)
```

## Reglas críticas (NO negociables)

1. **Multi-tenant SIEMPRE:** toda tabla operativa tiene `institucion_id`. Toda consulta SQLAlchemy DEBE filtrar por el `institucion_id` del JWT. Nunca exponer datos entre instituciones. Los tests deben incluir al menos un caso de aislamiento de tenant.
2. **El servidor MCP es de SOLO LECTURA** en el PMV. No crear herramientas MCP que creen, modifiquen o eliminen datos.
3. **Nunca** escribir SQL crudo si SQLAlchemy puede expresarlo; nunca hacer `commit` dentro de los servicios — la transacción la gestiona la dependencia `get_db`.
4. **Toda nueva tabla = nueva migración Alembic.** No modificar migraciones ya aplicadas.
5. **Evidencias fotográficas** se guardan en `/var/edutrack/evidencias/{institucion_id}/{orden_id}/` y solo se sirven vía Nginx con `auth_request`. Nunca guardar binarios en PostgreSQL.
6. **No** agregar dependencias nuevas sin justificarlo en el commit y registrarlo en `docs/02-ARQUITECTURA.md §11`.
7. Secretos solo por variables de entorno (`.env` no se commitea; mantener `.env.example` actualizado).
8. Cada endpoint nuevo debe tener `summary`, `response_model` y códigos de error explícitos en OpenAPI.

## Definición de terminado (DoD)

- [ ] Código con type hints, `ruff check` sin errores
- [ ] Tests: caso feliz + caso de error + aislamiento de tenant (si aplica)
- [ ] Migración Alembic si cambió el esquema
- [ ] Tarea marcada `[x]` en `docs/03-PLAN-DE-TAREAS.md`
- [ ] Commit con Conventional Commits en español (ver `docs/04-ESTANDARES-DE-CODIGO.md`)

## Idioma

Código, variables y funciones en **inglés**. Comentarios, docstrings, mensajes de error al usuario y documentación en **español**.
