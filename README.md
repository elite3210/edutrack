# EduTrack AI

Plataforma SaaS multi-tenant de gestión inteligente del ciclo de vida de activos tecnológicos para colegios privados del Perú. Un motor denominado **Lifecycle Intelligence Engine** genera planes de mantenimiento desde el catálogo de fabricantes, calcula un score de salud por activo (0–100) y anticipa fallas antes de que ocurran. Los docentes reportan fallas escaneando un código QR desde el celular, sin instalar ninguna app.

**Trabajo de Grado — Ingeniería de Sistemas**

---

## Estado actual

| Área | Estado |
|---|---|
| Sistema de diseño UI | ✅ Completo |
| Frontend — 24 vistas, 4 roles, PWA navegable | ✅ Completo (prototipo con datos mock) |
| Backend — FastAPI + PostgreSQL | 🔲 En construcción |
| Tests — pytest + aislamiento de tenant | 🔲 Pendiente |
| Despliegue — VPS + Docker Compose + CI/CD | 🔲 Pendiente |

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| **Backend** | Python 3.12 · FastAPI · SQLAlchemy 2.0 async · Alembic · Uvicorn |
| **Base de datos** | PostgreSQL 16 + pgvector |
| **Auth** | JWT HS256 (python-jose) · bcrypt (passlib) |
| **Tiempo real** | WebSockets nativos de FastAPI |
| **Jobs** | APScheduler (job nocturno a las 2:00 AM) |
| **Asistente IA** | FastMCP — servidor MCP de solo lectura |
| **Embeddings RAG** | OpenAI text-embedding-3-small (1536 dims) |
| **Frontend** | Vue 3 · Vite · Tailwind CSS v4 · Pinia · Vue Router 4 |
| **PWA** | vite-plugin-pwa · Workbox · IndexedDB (modo offline del técnico) |
| **Mocks** | MSW v2 (Mock Service Worker) |
| **Infra** | Docker Compose · Nginx · Ubuntu 22.04 VPS |
| **CI/CD** | GitHub Actions (rama `prod` despliega, `main` solo testea) |

---

## Roles del sistema

| Rol | Acceso | Función principal |
|---|---|---|
| `super_admin` | Panel global | Gestiona instituciones clientes y el catálogo de fabricantes |
| `director` | Web (solo lectura ejecutiva) | Dashboard de salud, proyección de presupuesto, asistente IA |
| `coordinador` | Web (acceso completo) | Registra activos, crea/asigna OTs, consulta historiales |
| `tecnico` | PWA móvil (offline) | Acepta, ejecuta y cierra OTs con evidencia fotográfica |
| `docente` | PWA móvil (sin login) | Escanea QR y reporta fallas en menos de 1 minuto |

---

## Cómo correr el proyecto

### Frontend (prototipo con datos mock — sin backend)

```bash
cd frontend
npm install
npm run dev
# Abrir http://localhost:5173
# VITE_USE_MOCK=true en frontend/.env (activado por defecto)
```

Usuarios de prueba disponibles en el login (solo para el prototipo con datos mock — no son credenciales reales de producción):

| Email | Contraseña | Rol |
|---|---|---|
| `coordinador@sanmarcos.pe` | `123456` | Coordinador |
| `director@sanmarcos.pe` | `123456` | Director |
| `tecnico1@sanmarcos.pe` | `123456` | Técnico |
| `admin@edutrack.pe` | `123456` | Super Admin |

### Integración local frontend + backend (cuando el backend esté construido)

```bash
# Terminal 1 — Base de datos
docker compose up -d db

# Terminal 2 — Backend
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 3 — Frontend apuntando al backend real
# Editar frontend/.env → VITE_USE_MOCK=false
cd frontend
npm run dev
```

### Comandos del backend

```bash
cd backend
pytest                                     # todos los tests
pytest --cov=app --cov-report=term-missing # con cobertura
ruff check . && ruff format .              # lint y formato
alembic upgrade head                       # aplicar migraciones
alembic revision --autogenerate -m ""      # nueva migración
python -m scripts.seed                     # cargar datos demo
```

---

## Estructura del repositorio

```
edutrack/
├── frontend/                  ← Vue 3 PWA — prototipo completo
│   ├── src/
│   │   ├── views/             # 24 vistas organizadas por rol
│   │   ├── components/        # componentes UI reutilizables
│   │   ├── stores/            # Pinia: auth, activos, ordenes, alertas...
│   │   ├── composables/       # useApi, useWebSocket, useOffline, useNotifMeta
│   │   ├── api/               # capa de servicios (apunta a /api/v1/*)
│   │   └── mocks/             # MSW handlers + data dummy
│   └── public/                # manifest PWA, iconos
│
├── backend/                   ← FastAPI — por construir (ver docs/09-PLAN-BACKEND.md)
│   ├── app/
│   │   ├── main.py
│   │   ├── core/              # config, database, security, deps
│   │   ├── models/            # SQLAlchemy 2.0 (1 archivo por entidad, 16 tablas)
│   │   ├── schemas/           # Pydantic XxxCreate / XxxUpdate / XxxOut
│   │   ├── api/v1/            # routers: auth, activos, ordenes, alertas, dashboard...
│   │   ├── services/          # lifecycle_engine, score, qr, evidencia, rag, proyeccion
│   │   ├── mcp/               # FastMCP server + 4 herramientas de solo lectura
│   │   └── jobs/              # APScheduler nightly job
│   ├── alembic/               # migraciones de BD
│   ├── tests/                 # pytest (espeja la estructura de app/)
│   └── scripts/               # seed.py, backup.sh
│
├── docs/                      # documentación completa
│   ├── 01-PRD.md              # historias de usuario y criterios de aceptación
│   ├── 02-ARQUITECTURA.md     # modelo de datos, decisiones técnicas
│   ├── 03-PLAN-DE-TAREAS.md   # backlog ejecutable — estado actual del proyecto
│   ├── 04-ESTANDARES-DE-CODIGO.md
│   ├── 05-FLUJO-DE-TRABAJO.md
│   ├── 06-DISEÑO-UI.md        # tokens de color, tipografía, componentes
│   ├── 07-PLAN-TRABAJO-FRONTEND.md  # checklist de las 24 vistas (completado)
│   ├── 09-PLAN-BACKEND.md     # plan de implementación — 9 fases
│   ├── 10-PLAN-TESTS.md       # plan de tests por fase
│   └── 11-PLAN-DESPLIEGUE.md  # VPS + Docker Compose + CI/CD
│
├── docker-compose.yml         # entorno de desarrollo (servicio db)
├── CLAUDE.md                  # memoria del proyecto para Claude Code
└── README.md                  # este archivo
```

---

## Documentación

| Documento | Descripción |
|---|---|
| [`docs/01-PRD.md`](docs/01-PRD.md) | Requisitos del producto — 11 historias de usuario con criterios de aceptación |
| [`docs/02-ARQUITECTURA.md`](docs/02-ARQUITECTURA.md) | Arquitectura técnica, modelo de datos (16 tablas), decisiones de diseño |
| [`docs/03-PLAN-DE-TAREAS.md`](docs/03-PLAN-DE-TAREAS.md) | Backlog ejecutable — estado actual de todas las tareas |
| [`docs/06-DISEÑO-UI.md`](docs/06-DISEÑO-UI.md) | Sistema de diseño: tokens, tipografía, componentes, layouts por rol |
| [`docs/09-PLAN-BACKEND.md`](docs/09-PLAN-BACKEND.md) | Plan del backend: 9 fases con tareas atómicas y tablas de BD |
| [`docs/10-PLAN-TESTS.md`](docs/10-PLAN-TESTS.md) | Plan de tests: fixtures, casos por fase, comandos pytest |
| [`docs/11-PLAN-DESPLIEGUE.md`](docs/11-PLAN-DESPLIEGUE.md) | Despliegue en VPS Ubuntu con Docker Compose y CI/CD GitHub Actions |

---

## Modelo de datos (resumen)

16 tablas en PostgreSQL. Todas las tablas operativas tienen `institucion_id` para el aislamiento multi-tenant.

`institucion` · `usuario` · `api_token` · `catalogo_modelo` · `regla_mantenimiento` · `activo` · `plan_mantenimiento` · `reporte_falla` · `orden_trabajo` · `evidencia` · `historial_ot` · `score_salud` · `alerta` · `notificacion` · `mcp_audit_log` · `documento_rag`

---

## Historias de usuario del PMV

| ID | Historia | Estado backend |
|---|---|---|
| HU-01 | Registro de activo con plan automático | 🔲 |
| HU-02 | Reporte de falla por QR (docente) | 🔲 |
| HU-03 | Alertas automáticas de mantenimiento | 🔲 |
| HU-04 | Creación y asignación de OT | 🔲 |
| HU-05 | Ejecución y cierre de OT por técnico | 🔲 |
| HU-06 | Historial de intervenciones | 🔲 |
| HU-07 | Dashboard ejecutivo del director | 🔲 |
| HU-08 | Proyección de presupuesto | 🔲 |
| HU-09 | Score de salud por activo | 🔲 |
| HU-10 | Administración del SaaS (super_admin) | 🔲 |
| HU-11 | Servidor MCP del asistente IA | 🔲 |
| HU-12 | Centro de notificaciones in-app | 🔲 |

Todas las HU tienen su prototipo de interfaz completado. El backend está por implementarse.

---

## Convenciones del proyecto

- **Idioma del código:** inglés (variables, funciones, modelos)
- **Idioma de la documentación:** español (comentarios, docstrings, mensajes de error)
- **Commits:** Conventional Commits en español (`feat:`, `fix:`, `test:`, `docs:`)
- **Ramas:** `main` → desarrollo (solo tests en CI) · `prod` → producción (deploy automático)
- **Multi-tenant:** toda consulta filtra por `institucion_id` del JWT — sin excepciones
