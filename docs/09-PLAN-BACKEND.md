# 09 — Plan de trabajo: Backend — EduTrack AI

> Guía ejecutable de implementación. Las tareas están ordenadas por dependencias: nunca una fase requiere algo de una fase posterior. Tests en `docs/10-PLAN-TESTS.md`. Despliegue a producción en documento separado (pendiente).

**Stack:** Python 3.12 · FastAPI · SQLAlchemy 2.0 async · Alembic · PostgreSQL 16 + pgvector · python-jose · passlib[bcrypt] · APScheduler · FastMCP · OpenAI embeddings  
**Referencia de requisitos:** `docs/01-PRD.md` · `docs/02-ARQUITECTURA.md` · `docs/04-ESTANDARES-DE-CODIGO.md`  
**Contrato de API (shapes exactos):** `frontend/src/mocks/handlers.js` + `frontend/src/mocks/data/*.js`

---

## Cómo nace la base de datos

Este proyecto **no usa scripts SQL manuales**. El esquema lo definen los modelos SQLAlchemy y Alembic genera y aplica el DDL. El orden es siempre este:

```
Paso 1 — Docker levanta PostgreSQL vacío
         docker compose up -d db
         → crea la BD "edutrack" y el usuario via variables de entorno

Paso 2 — Alembic crea todas las tablas
         cd backend && alembic upgrade head
         → lee los modelos de app/models/ y ejecuta el DDL en PostgreSQL
         → la migración inicial activa la extensión pgvector antes de crear las tablas

Paso 3 — Seed puebla datos demo
         python -m scripts.seed
         → 2 instituciones, usuarios por rol, 15 modelos de catálogo, activos con scores variados

Paso 4 — La API arranca contra esa BD lista
         uvicorn app.main:app --reload
```

> **Regla:** nunca modificar migraciones ya aplicadas. Cada cambio de esquema = nueva migración Alembic.

---

## Integración local frontend ↔ backend

El frontend ya tiene el proxy configurado en `vite.config.js`. Solo hay que apagar el mock:

```bash
# Terminal 1 — Base de datos
docker compose up -d db

# Terminal 2 — Backend
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 3 — Frontend sin mock
# Cambiar frontend/.env → VITE_USE_MOCK=false
cd frontend
npm run dev
```

Nginx no se necesita en desarrollo local. El proxy de Vite enruta `/api → http://localhost:8000`.

---

## Decisiones de diseño

| Decisión | Elección | Motivo |
|---|---|---|
| Embeddings RAG | `text-embedding-3-small` (OpenAI, 1536 dims) | Precisión alta; requiere `OPENAI_API_KEY` en `.env` |
| `historial_ot` | Tabla separada (no JSONB) | Permite queries por tipo de cambio y auditoría real |
| `api_token` | Tabla nueva (no estaba en arch original) | La UI de perfil la requiere |
| Index pgvector | `ivfflat` con 100 lists | Equilibrio velocidad/precisión para el volumen del PMV |
| Chunking PDF | 800 tokens, overlap 80 | Preserva contexto técnico de manuales de equipos |
| Multi-tenant | Toda consulta filtra por `institucion_id` del JWT | Nunca del body ni query params |

---

## Resumen de fases

| Fase | Nombre | HU relacionadas |
|---|---|---|
| 0 | Infraestructura base | — |
| 1 | Base de datos (modelos + migración) | — |
| 2 | Autenticación + Seed | — |
| 3 | Catálogo y Activos | HU-01 |
| 4 | Alertas y Job nocturno | HU-03, HU-09 |
| 5 | Reportes y WebSockets | HU-02 |
| 6 | Órdenes de trabajo | HU-04, HU-05, HU-06 |
| 7 | Visibilidad y Administración | HU-07, HU-08, HU-10, HU-12 |
| 8 | Capa IA (RAG + MCP) | HU-11 |

---

## Fase 0 — Infraestructura base

> Punto de partida. Sin esta fase no puede correr nada.  
> **Produce:** repositorio `backend/` listo, contenedor de BD corriendo, healthcheck verde.

### 0.1 Estructura de carpetas

Crear `backend/` con la siguiente estructura (vacía por ahora, se puebla en fases siguientes):

```
backend/
├── app/
│   ├── main.py
│   ├── core/
│   ├── models/
│   ├── schemas/
│   ├── api/v1/
│   ├── services/
│   ├── mcp/
│   └── jobs/
├── alembic/
├── tests/
├── scripts/
├── pyproject.toml
├── Dockerfile
├── .env.example
└── .env          ← no se commitea
```

- [ ] Crear toda la estructura de carpetas con archivos `__init__.py` vacíos en cada paquete Python

### 0.2 Dependencias — `pyproject.toml`

- [ ] Crear `backend/pyproject.toml` con el siguiente contenido:

```toml
[project]
name = "edutrack-api"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "fastapi>=0.115",
    "uvicorn[standard]>=0.30",
    "sqlalchemy[asyncio]>=2.0",
    "asyncpg>=0.29",
    "alembic>=1.13",
    "pydantic-settings>=2.3",
    "python-jose[cryptography]>=3.3",
    "passlib[bcrypt]>=1.7",
    "apscheduler>=3.10",
    "qrcode[pil]>=7.4",
    "fastmcp>=0.4",
    "openai>=1.30",
    "pypdf>=4.2",
    "python-multipart>=0.0.9",
    "pgvector>=0.3",
]

[tool.ruff]
line-length = 100
[tool.ruff.lint]
select = ["E", "F", "I", "UP"]

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

- [ ] Instalar dependencias: `pip install -e ".[dev]"` (o `pip install -e .` mínimo)

### 0.3 Variables de entorno — `.env.example`

- [ ] Crear `backend/.env.example`:

```env
# Base de datos
DATABASE_URL=postgresql+asyncpg://edutrack:edutrack@localhost:5432/edutrack
TEST_DATABASE_URL=postgresql+asyncpg://edutrack:edutrack@localhost:5432/edutrack_test

# JWT
JWT_SECRET_KEY=cambia-esto-en-produccion-min-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Evidencias fotográficas
EVIDENCIAS_BASE_PATH=/var/edutrack/evidencias
EVIDENCIAS_MAX_SIZE_MB=10

# Pesos del score (deben sumar 1.0)
SCORE_WEIGHT_VIDA_UTIL=0.35
SCORE_WEIGHT_CUMPLIMIENTO=0.30
SCORE_WEIGHT_FRECUENCIA=0.20
SCORE_WEIGHT_RECENCIA=0.15
SCORE_THRESHOLD_ALERT=40

# OpenAI (para RAG — Fase 8)
OPENAI_API_KEY=sk-...
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# APScheduler
NIGHTLY_JOB_HOUR=2
NIGHTLY_JOB_MINUTE=0
NIGHTLY_JOB_TIMEZONE=America/Lima
```

- [ ] Copiar `.env.example` → `.env` y completar los valores reales (nunca commitear `.env`)

### 0.4 Docker Compose — `docker-compose.yml`

- [ ] Crear `docker-compose.yml` en la raíz del monorepo:

```yaml
services:
  db:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: edutrack
      POSTGRES_PASSWORD: edutrack
      POSTGRES_DB: edutrack
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U edutrack"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build: ./backend
    ports:
      - "8000:8000"
    env_file: ./backend/.env
    volumes:
      - ./backend:/app
      - evidencias:/var/edutrack/evidencias
    depends_on:
      db:
        condition: service_healthy
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

volumes:
  pgdata:
  evidencias:
```

> La imagen `pgvector/pgvector:pg16` ya trae la extensión `vector` instalada. Solo hay que activarla via Alembic (Fase 1).

### 0.5 Core mínimo — config, database, main

- [ ] `app/core/config.py` — clase `Settings` con `pydantic-settings` que lee todas las variables del `.env.example`; singleton `settings = Settings()`
- [ ] `app/core/database.py` — `create_async_engine(settings.DATABASE_URL)`, `async_session_maker`, dependencia `get_db` (yield + commit/rollback automático al final del request)
- [ ] `app/api/v1/router.py` — `APIRouter` vacío, se puebla en fases siguientes
- [ ] `app/main.py` — instancia FastAPI con `lifespan` (placeholder por ahora), incluye el router bajo `/api/v1`, endpoint `GET /api/v1/health` que verifica conexión a BD y responde `{"status": "ok", "db": "ok"}`
- [ ] `backend/Dockerfile` — imagen `python:3.12-slim`, copia `pyproject.toml`, instala deps, copia `app/`, expone puerto 8000

### 0.6 Alembic — configuración inicial

- [ ] Inicializar Alembic: `alembic init alembic` dentro de `backend/`
- [ ] Editar `alembic/env.py`:
  - Importar `Base` desde `app.models.base` (aún no existe, se crea en Fase 1 — este paso es solo configurar el archivo)
  - Configurar `target_metadata = Base.metadata`
  - Usar engine async (`run_async_migrations`)
- [ ] Editar `alembic.ini`: apuntar `sqlalchemy.url` a la variable de entorno `DATABASE_URL`

### 0.7 Verificación de cierre — Fase 0

- [ ] `docker compose up -d db` → contenedor sano (healthcheck verde)
- [ ] `pip install -e .` sin errores
- [ ] `uvicorn app.main:app --reload` arranca sin errores
- [ ] `GET http://localhost:8000/api/v1/health` → `200 {"status": "ok", "db": "ok"}`
- [ ] `ruff check .` sin errores

---

## Fase 1 — Base de datos: modelos y migración

> **Depende de:** Fase 0 completa (BD corriendo, Alembic configurado).  
> **Produce:** todas las tablas creadas en PostgreSQL. Este es el cimiento del sistema — sin tablas no hay API.

### 1.1 Modelos base y mixins — `app/models/base.py`

- [ ] `Base = DeclarativeBase()`
- [ ] `TimestampMixin`: columnas `created_at` y `updated_at` con `server_default=func.now()` y `onupdate=func.now()`
- [ ] `TenantMixin`: `institucion_id = mapped_column(ForeignKey("institucion.id"), nullable=False, index=True)`

### 1.2 Modelos de entidades

Un archivo por entidad en `app/models/`. Todas las tablas operativas heredan `TenantMixin` salvo `institucion`, `catalogo_modelo`, `regla_mantenimiento` y `documento_rag` (globales o sin tenant directo).

- [ ] `institucion.py` — tabla `institucion`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | `default=uuid4` |
| `nombre` | VARCHAR(200) | |
| `nombre_corto` | VARCHAR(50) | |
| `ruc` | VARCHAR(11) | UNIQUE |
| `email` | VARCHAR(200) | |
| `telefono` | VARCHAR(20) | nullable |
| `direccion` | TEXT | nullable |
| `activa` | BOOLEAN | default True |
| + TimestampMixin | | `created_at`, `updated_at` |

- [ ] `usuario.py` — tabla `usuario`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `nombre` | VARCHAR(200) | |
| `email` | VARCHAR(200) | UNIQUE |
| `password_hash` | VARCHAR(200) | |
| `rol` | ENUM | `super_admin`, `director`, `coordinador`, `tecnico` |
| `activo` | BOOLEAN | default True |
| `institucion_id` | UUID FK | nullable (null = super_admin) |
| + TimestampMixin | | |

- [ ] `api_token.py` — tabla `api_token`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `usuario_id` | UUID FK → usuario | |
| `nombre` | VARCHAR(100) | nombre descriptivo del token |
| `token_hash` | VARCHAR(200) | UNIQUE — nunca guardar el token en claro |
| `token_partial` | VARCHAR(8) | últimos chars para mostrar en UI |
| `last_used_at` | TIMESTAMP | nullable |
| `revocado` | BOOLEAN | default False |
| + TimestampMixin | | |

- [ ] `catalogo.py` — tablas `catalogo_modelo` y `regla_mantenimiento`

`catalogo_modelo`:

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `marca` | VARCHAR(100) | |
| `modelo` | VARCHAR(200) | |
| `categoria` | VARCHAR(100) | Proyector, Laptop, Impresora, etc. |
| `vida_util_meses` | INTEGER | |
| `especificaciones` | JSONB | default `{}` |
| `manual_pdf_path` | VARCHAR(500) | nullable |
| `manual_indexado` | BOOLEAN | default False |
| + TimestampMixin | | |

`regla_mantenimiento`:

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `modelo_id` | UUID FK → catalogo_modelo | |
| `tipo_tarea` | VARCHAR(200) | ej. "Limpieza de filtro" |
| `intervalo_dias` | INTEGER | ej. 90 |

- [ ] `activo.py` — tabla `activo`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `modelo_id` | UUID FK → catalogo_modelo | |
| `codigo_qr` | VARCHAR(50) | UNIQUE |
| `numero_serie` | VARCHAR(100) | nullable |
| `edificio` | VARCHAR(100) | |
| `piso` | VARCHAR(50) | |
| `aula` | VARCHAR(100) | |
| `fecha_instalacion` | DATE | |
| `notas` | TEXT | nullable |
| `estado` | ENUM | `operativo`, `en_mantenimiento`, `dado_de_baja`; default `operativo` |
| `score` | INTEGER | default 100 |
| + TenantMixin | | `institucion_id` |
| + TimestampMixin | | |

- [ ] `plan_mantenimiento.py` — tabla `plan_mantenimiento`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `activo_id` | UUID FK → activo | |
| `tipo_tarea` | VARCHAR(200) | copiado de la regla |
| `intervalo_dias` | INTEGER | |
| `fecha_programada` | DATE | `fecha_instalacion + intervalo_dias` |
| `estado` | ENUM | `programado`, `completado`, `vencido`; default `programado` |
| `completado_en` | TIMESTAMP | nullable |
| + TenantMixin | | |

- [ ] `reporte_falla.py` — tabla `reporte_falla`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `numero` | VARCHAR(20) | UNIQUE, ej. `REP-2026-001` |
| `activo_id` | UUID FK → activo | |
| `docente_nombre` | VARCHAR(200) | |
| `docente_email` | VARCHAR(200) | |
| `descripcion` | TEXT | |
| `foto_path` | VARCHAR(500) | nullable |
| + TenantMixin | | |
| + TimestampMixin | | |

- [ ] `orden_trabajo.py` — tablas `orden_trabajo` y `evidencia`

`orden_trabajo`:

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `numero` | VARCHAR(20) | UNIQUE, ej. `OT-2026-001` |
| `activo_id` | UUID FK → activo | |
| `reporte_id` | UUID FK → reporte_falla | nullable |
| `tecnico_id` | UUID FK → usuario | nullable |
| `tipo` | ENUM | `preventivo`, `correctivo`, `emergencia` |
| `prioridad` | ENUM | `alta`, `media`, `baja` |
| `descripcion` | TEXT | |
| `estado` | ENUM | `pendiente`, `aceptada`, `en_ejecucion`, `cerrada`; default `pendiente` |
| `fecha_limite` | DATE | |
| `cerrada_en` | TIMESTAMP | nullable |
| `descripcion_cierre` | TEXT | nullable |
| + TenantMixin | | |
| + TimestampMixin | | |

`evidencia`:

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `orden_id` | UUID FK → orden_trabajo | |
| `archivo_path` | VARCHAR(500) | ruta relativa en filesystem |
| `archivo_nombre` | VARCHAR(200) | nombre generado por servidor (uuid) |
| + TimestampMixin | | |

- [ ] `historial_ot.py` — tabla `historial_ot`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `orden_id` | UUID FK → orden_trabajo | |
| `tipo` | ENUM | `estado`, `prioridad`, `fecha_limite`, `asignacion`, `comentario` |
| `valor_anterior` | VARCHAR(100) | nullable |
| `valor_nuevo` | VARCHAR(100) | nullable |
| `usuario_id` | UUID FK → usuario | nullable |
| `usuario_nombre` | VARCHAR(200) | desnormalizado para historial inmutable |
| `nota` | TEXT | nullable |
| `fecha` | TIMESTAMP | `server_default=func.now()` |

- [ ] `score_salud.py` — tabla `score_salud`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `activo_id` | UUID FK → activo | |
| `score` | INTEGER | 0–100 |
| `factores` | JSONB | `{vida_util, cumplimiento, frecuencia_fallas, recencia}` |
| `calculado_en` | TIMESTAMP | `server_default=func.now()` |
| + TenantMixin | | |

- [ ] `alerta.py` — tabla `alerta`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `activo_id` | UUID FK → activo | |
| `tipo` | ENUM | `mantenimiento_proximo`, `mantenimiento_vencido`, `riesgo_falla` |
| `mensaje` | TEXT | |
| `dias_restantes` | INTEGER | nullable |
| `atendida` | BOOLEAN | default False |
| `atendida_en` | TIMESTAMP | nullable |
| + TenantMixin | | |
| + TimestampMixin | | |

- [ ] `notificacion.py` — tabla `notificacion`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `usuario_id` | UUID FK → usuario | |
| `tipo` | VARCHAR(50) | ver tipos en HU-12 del PRD |
| `titulo` | VARCHAR(200) | |
| `mensaje` | TEXT | |
| `link` | VARCHAR(500) | nullable — ruta destino en el frontend |
| `actor` | VARCHAR(200) | nullable — quién generó el evento |
| `leida` | BOOLEAN | default False |
| `fecha` | TIMESTAMP | `server_default=func.now()` |

- [ ] `mcp_audit_log.py` — tabla `mcp_audit_log`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `usuario_id` | UUID FK → usuario | |
| `herramienta` | VARCHAR(100) | nombre de la tool MCP invocada |
| `parametros` | JSONB | |
| `invocada_en` | TIMESTAMP | `server_default=func.now()` |

- [ ] `documento_rag.py` — tabla `documento_rag`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `modelo_id` | UUID FK → catalogo_modelo | |
| `contenido` | TEXT | texto del chunk |
| `embedding` | VECTOR(1536) | tipo de pgvector |
| `pagina` | INTEGER | nullable |
| `chunk_index` | INTEGER | |
| + TimestampMixin | | |

- [ ] `app/models/__init__.py` — importar todos los modelos para que Alembic los detecte

### 1.3 Migración inicial Alembic

- [ ] Generar la migración: `alembic revision --autogenerate -m "initial_schema"`
- [ ] Abrir el archivo generado en `alembic/versions/` y agregar al inicio de la función `upgrade()`:
  ```python
  op.execute("CREATE EXTENSION IF NOT EXISTS vector")
  ```
- [ ] Aplicar: `alembic upgrade head`
- [ ] Verificar en PostgreSQL que existen las 16 tablas esperadas:
  ```sql
  \dt   -- en psql conectado a la BD edutrack
  ```

### 1.4 Verificación de cierre — Fase 1

- [ ] `alembic upgrade head` sin errores
- [ ] 16 tablas visibles en la BD: `institucion`, `usuario`, `api_token`, `catalogo_modelo`, `regla_mantenimiento`, `activo`, `plan_mantenimiento`, `reporte_falla`, `orden_trabajo`, `evidencia`, `historial_ot`, `score_salud`, `alerta`, `notificacion`, `mcp_audit_log`, `documento_rag`
- [ ] `alembic current` muestra la migración activa
- [ ] `GET /api/v1/health` sigue respondiendo `200`

---

## Fase 2 — Autenticación y Seed

> **Depende de:** Fase 1 (tablas `usuario` e `institucion` deben existir).  
> **Produce:** sistema de login funcional + datos demo en BD para usar en el desarrollo de todas las fases siguientes.

### 2.1 Seguridad — `app/core/security.py`

- [ ] `hash_password(password: str) -> str` — bcrypt via passlib
- [ ] `verify_password(plain: str, hashed: str) -> bool`
- [ ] `create_access_token(data: dict) -> str` — JWT HS256, claims: `sub` (usuario_id), `rol`, `institucion_id`, `exp` (30 min)
- [ ] `create_refresh_token(data: dict) -> str` — JWT HS256, `exp` 7 días
- [ ] `decode_token(token: str) -> dict` — lanza `HTTPException 401` si inválido o expirado

### 2.2 Dependencias FastAPI — `app/core/deps.py`

- [ ] `get_current_user(token, db) -> Usuario` — extrae y valida JWT, carga el usuario de la BD; 401 si no existe
- [ ] `require_role(*roles: str)` — factory que devuelve una dependencia; 403 si `usuario.rol not in roles`
- [ ] `get_tenant_id(current_user) -> UUID` — extrae `institucion_id` del usuario; nunca del body ni query params

### 2.3 Schemas de auth — `app/schemas/auth.py`

- [ ] `LoginRequest`: `email: str`, `password: str`
- [ ] `UserOut`: `id`, `nombre`, `email`, `rol`, `institucion_id`
- [ ] `TokenResponse`: `access_token`, `refresh_token`, `token_type: str = "bearer"`, `user: UserOut`

### 2.4 Endpoints de auth — `app/api/v1/auth.py`

- [ ] `POST /api/v1/auth/login` — valida email+password, devuelve `TokenResponse` con ambos tokens; 401 si credenciales incorrectas
- [ ] `POST /api/v1/auth/refresh` — recibe `{"refresh_token": "..."}`, valida, emite nuevo `access_token`; 401 si inválido
- [ ] Registrar el router en `app/api/v1/router.py`

### 2.5 Seed de desarrollo — `backend/scripts/seed.py`

Script ejecutable con `python -m scripts.seed`. Idempotente: si los datos ya existen, no duplica.

- [ ] **2 instituciones:**
  - `Colegio San Marcos` (id fijo `inst-001`), RUC `20512345678`
  - `Colegio Los Andes` (id fijo `inst-002`), RUC `20598765432`

- [ ] **Usuarios por institución** (contraseña demo: `123456` — hasheada):
  - 1 `super_admin` (sin institución): `admin@edutrack.pe`
  - Por cada institución: 1 `director`, 1 `coordinador`, 3 `tecnico`

- [ ] **Catálogo — 15 modelos** con sus reglas de mantenimiento:

| Marca | Modelo | Categoría | Vida útil | Reglas (tarea / intervalo días) |
|---|---|---|---|---|
| Epson | EB-W49 | Proyector | 84 meses | Limpieza filtro/90 · Revisión lámpara/180 · Calibración óptica/365 |
| Epson | EB-X41 | Proyector | 84 meses | Limpieza filtro/90 · Revisión lámpara/180 |
| HP | LaserJet M404dn | Impresora | 60 meses | Limpieza rodillos/90 · Revisión tóner/60 · Actualización firmware/180 |
| HP | EliteBook 840 G9 | Laptop | 60 meses | Limpieza interna/180 · Cambio pasta térmica/365 · Actualización SO/90 |
| Dell | OptiPlex 7010 | Desktop | 72 meses | Limpieza interna/180 · Actualización SO/90 · Revisión disco/365 |
| Dell | Latitude 5430 | Laptop | 60 meses | Limpieza interna/180 · Cambio pasta térmica/365 |
| LG | 24BK55YP | Monitor | 84 meses | Limpieza pantalla/90 · Calibración color/365 |
| LG | MultiV S 18k | Aire Acondicionado | 120 meses | Limpieza filtros/60 · Revisión gas/180 · Limpieza unidad exterior/120 |
| Daikin | FTXS35K | Aire Acondicionado | 120 meses | Limpieza filtros/60 · Revisión gas/180 |
| Daikin | RXS35K | Aire Acondicionado | 120 meses | Limpieza filtros/60 · Revisión gas/180 · Limpieza condensador/365 |
| Samsung | QM43B | Monitor | 84 meses | Limpieza pantalla/90 · Calibración/365 |
| Samsung | Flip 2 WM55R | Pizarra Interactiva | 72 meses | Calibración táctil/180 · Limpieza superficie/90 · Actualización firmware/365 |
| Wacom | One 13 | Pizarra Interactiva | 60 meses | Calibración táctil/90 · Limpieza superficie/60 |
| Lenovo | ThinkPad E14 | Laptop | 60 meses | Limpieza interna/180 · Cambio pasta térmica/365 · Actualización BIOS/365 |
| Asus | ExpertBook B1 B1500 | Laptop | 60 meses | Limpieza interna/180 · Actualización SO/90 |

- [ ] **12 activos** distribuidos entre las 2 instituciones con scores variados (verde ≥ 70, amarillo 40–69, rojo < 40), fechas de instalación variadas para que el score sea realista al calcularlo
- [ ] **Planes de mantenimiento** generados para cada activo (misma lógica que `lifecycle_engine` — el seed puede llamar al servicio directamente)

### 2.6 Verificación de cierre — Fase 2

- [ ] `POST /api/v1/auth/login` con `coordinador@sanmarcos.pe` / `123456` → `200` con tokens válidos
- [ ] `POST /api/v1/auth/login` con contraseña incorrecta → `401`
- [ ] `python -m scripts.seed` sin errores; segunda ejecución tampoco falla (idempotente)
- [ ] 15 modelos en `catalogo_modelo`, 12 activos en `activo`, usuarios en BD
- [ ] Tests Fase 2: ver `docs/10-PLAN-TESTS.md §2`

---

## Fase 3 — Catálogo y Activos

> **Depende de:** Fase 2 (auth funcional, seed con catálogo cargado).  
> **Produce:** HU-01 completa — coordinador puede registrar activos, se generan planes automáticamente y se pueden consultar.

### 3.1 Schemas — `app/schemas/`

- [ ] `catalogo.py`: `ReglaOut`, `CatalogoModeloOut` (incluye `reglas: list[ReglaOut]`)
- [ ] `activo.py`: `ActivoCreate`, `ActivoUpdate`, `ActivoOut` (incluye `categoria`, `marca`, `modelo` via join), `ScoreOut` (`score: int`, `factores: dict`)
- [ ] `plan.py`: `PlanTareaOut` (`id`, `tipo_tarea`, `fecha_programada`, `estado`, `intervalo_dias`)

### 3.2 Servicio QR — `app/services/qr_service.py`

- [ ] `generar_codigo_qr(activo_id: UUID) -> str` — formato `EDUTK-{8 chars del uuid}`; garantizar unicidad contra la BD
- [ ] `generar_imagen_qr(codigo: str, url_base: str) -> bytes` — PNG de 300×300 px con URL completa del activo usando librería `qrcode`

### 3.3 Lifecycle engine — `app/services/lifecycle_engine.py`

- [ ] `generar_plan_mantenimiento(activo: Activo, reglas: list[ReglaMantenimiento], db: AsyncSession) -> list[PlanMantenimiento]`
  - Para cada regla: `fecha_programada = activo.fecha_instalacion + timedelta(days=regla.intervalo_dias)`
  - Si `fecha_programada < hoy`: marcar `estado = vencido` desde el inicio
  - Inserta los registros en BD via `db.add_all()`; no hace `commit()` (lo gestiona `get_db`)

### 3.4 Score service — `app/services/score_service.py`

- [ ] `calcular_score(activo: Activo, db: AsyncSession) -> ScoreOut`:

  | Factor | Peso | Fórmula |
  |---|---|---|
  | `vida_util` | 35% | `max(0, 1 - meses_uso / vida_util_meses) * 100` |
  | `cumplimiento` | 30% | `ejecutados_a_tiempo / programados_vencidos * 100` (100 si no hay vencidos) |
  | `frecuencia_fallas` | 20% | `max(0, 100 - 25 * fallas_ultimos_90_dias)` |
  | `recencia` | 15% | 100 si ≤ 30 días desde última OT cerrada; decae lineal a 0 en 365 días |

  Los pesos vienen de `settings`, no hardcodeados.

- [ ] Guarda registro en `score_salud`; actualiza `activo.score`
- [ ] Si `score < settings.SCORE_THRESHOLD_ALERT` → llama `alerta_service.crear_alerta_riesgo_falla` (idempotente — se implementa en Fase 4, dejar como llamada pendiente de importar)

### 3.5 API de catálogo — `app/api/v1/catalogo.py`

- [ ] `GET /api/v1/catalogo/marcas` — lista de marcas únicas del catálogo; sin auth (endpoint público de selección)
- [ ] `GET /api/v1/catalogo/modelos?marca=` — modelos filtrados, cada uno incluye sus reglas

### 3.6 API de activos — `app/api/v1/activos.py`

- [ ] `POST /api/v1/activos` — crea activo; llama `qr_service.generar_codigo_qr`; llama `lifecycle_engine.generar_plan_mantenimiento`; devuelve `ActivoOut` con `201`; requiere rol `coordinador`
- [ ] `GET /api/v1/activos` — lista activos del tenant; filtros opcionales `?categoria=&score_max=&score_min=`; requiere auth
- [ ] `GET /api/v1/activos/{id}` — detalle; `404` si no existe o es de otro tenant
- [ ] `PATCH /api/v1/activos/{id}` — actualización parcial; requiere rol `coordinador`
- [ ] `GET /api/v1/activos/{id}/score` — devuelve `ScoreOut` con desglose de factores; llama `score_service.calcular_score`
- [ ] `GET /api/v1/activos/{id}/plan` — tareas del plan de mantenimiento del activo + `score` + `factores`
- [ ] `GET /api/v1/activos/{id}/historial` — OTs cerradas del activo, ordenadas por `cerrada_en` desc
- [ ] `GET /api/v1/qr/{codigo}` — **endpoint público** (sin auth); devuelve datos básicos del activo para el formulario del docente; `404` si el código no existe

### 3.7 Verificación de cierre — Fase 3

- [ ] Registrar un activo → responde con `codigo_qr` generado y el plan de mantenimiento creado
- [ ] `GET /api/v1/catalogo/marcas` → lista de 5 marcas del seed
- [ ] `GET /api/v1/qr/{codigo}` sin token → `200` con datos del activo
- [ ] Coordinador de tenant B no puede ver activos de tenant A → `404`
- [ ] Tests Fase 3: ver `docs/10-PLAN-TESTS.md §3`

---

## Fase 4 — Alertas y Job nocturno

> **Depende de:** Fase 3 (activos y planes de mantenimiento existen; score service implementado).  
> **Produce:** HU-03 y HU-09 completas — alertas automáticas y job nocturno funcional.

### 4.1 Alerta service — `app/services/alerta_service.py`

- [ ] `crear_alerta(activo_id, tipo, mensaje, dias_restantes, db) -> Alerta | None`:
  - **Idempotente:** consultar si ya existe una alerta no atendida del mismo `tipo` para el mismo `activo_id`; si existe, no crear duplicado, retornar `None`
  - Si no existe: insertar nueva `Alerta` y retornar el objeto
- [ ] `crear_alerta_riesgo_falla(activo_id, db)` — llama a `crear_alerta` con `tipo="riesgo_falla"` y mensaje estándar
- [ ] `atender_alerta(alerta_id, tenant_id, db)` — marca `atendida=True`, `atendida_en=now()`; valida que pertenece al tenant

### 4.2 Completar score service

- [ ] Importar `alerta_service` en `score_service.py` y llamar `crear_alerta_riesgo_falla` cuando `score < settings.SCORE_THRESHOLD_ALERT` (la función ya estaba definida en Fase 3 pero sin el import real)

### 4.3 Job nocturno — `app/jobs/nightly.py`

- [ ] `async def nightly_maintenance(db_factory)` — función principal del job:
  1. Para cada activo activo del sistema: cargar su `plan_mantenimiento` con `estado = programado`
  2. Si `fecha_programada` está a ≤ 15 días: `crear_alerta(tipo="mantenimiento_proximo", dias_restantes=X)`
  3. Si `fecha_programada` está a ≤ 5 días y la alerta de 15 días no fue atendida: crear segunda alerta (idempotencia evita duplicar)
  4. Marcar como `vencido` las tareas con `fecha_programada < hoy` y `estado = programado`
  5. Recalcular score de todos los activos con `score_service.calcular_score`
  6. Emitir evento WebSocket `score_actualizado` a cada tenant afectado (el `ConnectionManager` se importa de Fase 5 — dejar como llamada condicional)

- [ ] Registrar el job en `app/main.py` dentro del `lifespan`:
  ```python
  scheduler.add_job(
      nightly_maintenance,
      "cron",
      hour=settings.NIGHTLY_JOB_HOUR,
      minute=settings.NIGHTLY_JOB_MINUTE,
      timezone=settings.NIGHTLY_JOB_TIMEZONE,
      args=[async_session_maker],
  )
  scheduler.start()
  ```

### 4.4 API de alertas — `app/api/v1/alertas.py`

- [ ] `GET /api/v1/alertas` — alertas no atendidas del tenant; ordenadas: `riesgo_falla` primero, luego por `dias_restantes` asc; requiere auth
- [ ] `POST /api/v1/alertas/{id}/atender` — marca como atendida; `404` si no es del tenant

### 4.5 Verificación de cierre — Fase 4

- [ ] Ejecutar `nightly_maintenance` manualmente → genera alertas para activos con planes próximos a vencer
- [ ] Activo con score < 40 → aparece alerta `riesgo_falla` en `GET /api/v1/alertas`
- [ ] Segunda ejecución del job → no duplica alertas (idempotencia verificada)
- [ ] Tests Fase 4: ver `docs/10-PLAN-TESTS.md §4`

---

## Fase 5 — Reportes y WebSockets

> **Depende de:** Fase 3 (activos existen con `codigo_qr`).  
> **Produce:** HU-02 completa — docente puede reportar falla por QR; coordinador recibe notificación en tiempo real.

### 5.1 Evidencia service — `app/services/evidencia_service.py`

- [ ] `guardar_evidencia(archivo: UploadFile, orden_id: UUID, institucion_id: UUID) -> str`:
  - Validar tipo MIME: solo `image/jpeg`, `image/png`, `image/webp`
  - Validar tamaño ≤ `settings.EVIDENCIAS_MAX_SIZE_MB` MB
  - Generar nombre de archivo: `uuid4().hex + extension` (nunca el nombre original del cliente)
  - Ruta: `{base_path}/{institucion_id}/{orden_id}/{nombre_generado}`
  - Crear directorios si no existen con `Path.mkdir(parents=True, exist_ok=True)`
  - Retornar la ruta relativa `{institucion_id}/{orden_id}/{nombre_generado}`
- [ ] `path_seguro(base: Path, relativo: str) -> Path` — construye la ruta y verifica que el resultado esté contenido dentro de `base` (protección contra path traversal)

### 5.2 WebSocket — `app/api/websockets.py`

- [ ] Clase `ConnectionManager`:
  - `connections: dict[UUID, list[WebSocket]]` — agrupa por `institucion_id`
  - `async connect(ws: WebSocket, tenant_id: UUID)` — acepta la conexión y registra
  - `disconnect(ws: WebSocket, tenant_id: UUID)` — elimina del registro
  - `async broadcast_to_tenant(tenant_id: UUID, evento: dict)` — envía JSON a todas las conexiones activas del tenant; maneja desconexiones silenciosamente

- [ ] `manager = ConnectionManager()` — singleton importado por los módulos que necesiten emitir eventos

- [ ] Endpoint `GET /ws/notificaciones`:
  - Recibe `?token=JWT` en query string
  - Valida el JWT al conectar; cierra con `1008` si inválido
  - Mantiene la conexión viva con ping/pong cada 30 s
  - Al desconectar, llama a `manager.disconnect`

- [ ] Constantes de eventos: `NUEVO_REPORTE = "nuevo_reporte"`, `OT_ASIGNADA = "ot_asignada"`, `OT_CERRADA = "ot_cerrada"`, `ALERTA_CREADA = "alerta_creada"`, `SCORE_ACTUALIZADO = "score_actualizado"`, `EVENTO_NOTIFICACION = "evento_notificacion"`

### 5.3 Schemas de reporte — `app/schemas/reporte.py`

- [ ] `ReporteCreate`: `activo_id`, `docente_nombre`, `docente_email`, `descripcion`
- [ ] `ReporteOut`: todos los campos + `numero`, `created_at`

### 5.4 API de reportes — `app/api/v1/reportes.py`

- [ ] `POST /api/v1/reportes` multipart — **endpoint semi-público** (no requiere JWT de usuario con cuenta):
  - Campos form: `activo_id (UUID)`, `docente_nombre (str)`, `docente_email (str)`, `descripcion (str)`, `foto (UploadFile, opcional)`
  - Verificar que `activo_id` existe (si no → `404`)
  - Derivar `institucion_id` del activo (no del JWT)
  - Si hay foto: llamar `evidencia_service.guardar_evidencia` con un `orden_id` temporal
  - Generar número correlativo `REP-{YYYY}-{seq:03d}`
  - Emitir `manager.broadcast_to_tenant(tenant_id, {evento: NUEVO_REPORTE, reporte: ...})`
  - Responder `201` con `ReporteOut`

### 5.5 Verificación de cierre — Fase 5

- [ ] `POST /api/v1/reportes` con foto → `201`; foto guardada en el filesystem bajo la ruta correcta
- [ ] WebSocket conectado con JWT válido → recibe el evento `nuevo_reporte` en menos de 2 s
- [ ] `POST /api/v1/reportes` con tipo de archivo inválido → `422`
- [ ] Tests Fase 5: ver `docs/10-PLAN-TESTS.md §5`

---

## Fase 6 — Órdenes de trabajo

> **Depende de:** Fase 4 (alertas para crear OT desde alerta) y Fase 5 (reportes para crear OT desde reporte; WebSocket para notificar al técnico).  
> **Produce:** HU-04, HU-05 y HU-06 completas.

### 6.1 Schemas — `app/schemas/orden.py`

- [ ] `OrdenCreate`: `activo_id`, `reporte_id?`, `tecnico_id?`, `tipo`, `prioridad`, `descripcion`, `fecha_limite`
- [ ] `OrdenUpdate`: `prioridad?`, `fecha_limite?`, `tecnico_id?` (campos actualizables por coordinador)
- [ ] `CambioEstadoRequest`: `estado`, `nota?`
- [ ] `HistorialOTOut`: `tipo`, `valor_anterior?`, `valor_nuevo?`, `usuario_nombre?`, `nota?`, `fecha`
- [ ] `EvidenciaOut`: `id`, `archivo_path`, `archivo_nombre`, `created_at`
- [ ] `OrdenOut`: todos los campos + `historial_estados: list[HistorialOTOut]` + `evidencias: list[EvidenciaOut]`

### 6.2 OT service — `app/services/ot_service.py`

- [ ] `TRANSICIONES_VALIDAS: dict[str, list[str]]`:
  ```python
  {
      "pendiente":    ["aceptada"],
      "aceptada":     ["en_ejecucion", "pendiente"],
      "en_ejecucion": ["cerrada", "pendiente"],
  }
  ```
- [ ] `cambiar_estado(orden, nuevo_estado, usuario, nota, db)`:
  - Valida que `nuevo_estado in TRANSICIONES_VALIDAS[orden.estado]`; si no → lanza `InvalidTransitionError` (excepción de dominio, el router la traduce a `409`)
  - Crea `HistorialOT(tipo="estado", valor_anterior=estado_anterior, valor_nuevo=nuevo_estado, ...)`
  - Si `nuevo_estado == "cerrada"`: registra `orden.cerrada_en = now()`, llama `WebSocket OT_CERRADA`
  - Si técnico asignado al crear: llama `WebSocket OT_ASIGNADA`

- [ ] `actualizar_campos(orden, campos: dict, usuario, db)`:
  - Para cada campo cambiado (`prioridad`, `fecha_limite`, `tecnico_id`): crea entrada en `HistorialOT(tipo=campo)`
  - Actualiza los campos en el objeto `orden`

### 6.3 API de órdenes — `app/api/v1/ordenes.py`

- [ ] `POST /api/v1/ordenes` — crea OT; si tiene `tecnico_id` emite `OT_ASIGNADA`; requiere rol `coordinador`
- [ ] `GET /api/v1/ordenes` — lista del tenant; filtros `?estado=&prioridad=&tecnico_id=`; técnico solo ve las suyas
- [ ] `GET /api/v1/ordenes/{id}` — detalle con historial y evidencias; `404` si otro tenant
- [ ] `PATCH /api/v1/ordenes/{id}/estado` — transición via `ot_service.cambiar_estado`; `409` si inválida
- [ ] `PATCH /api/v1/ordenes/{id}` — actualizar campos via `ot_service.actualizar_campos`
- [ ] `POST /api/v1/ordenes/{id}/evidencias` multipart — sube foto via `evidencia_service`; requiere rol `tecnico` o `coordinador`

### 6.4 API de usuarios — `app/api/v1/usuarios.py`

- [ ] `GET /api/v1/usuarios` — lista usuarios del tenant; requiere rol `coordinador`
- [ ] `POST /api/v1/usuarios` — crea usuario con rol `tecnico` o `director` dentro del tenant; hashea password; no permite crear `super_admin`
- [ ] `PATCH /api/v1/usuarios/{id}` — edita `nombre`, `email`, `activo`; no permite cambiar a `super_admin`

### 6.5 API de perfil y tokens — `app/api/v1/perfil.py`

- [ ] `POST /api/v1/perfil/password` — verifica `password_actual`, actualiza hash; `400` si incorrecto
- [ ] `GET /api/v1/perfil/tokens` — tokens no revocados del usuario; devuelve solo `token_partial`, nunca el hash
- [ ] `POST /api/v1/perfil/tokens` — genera token `edu_pat_{uuid4().hex}`, guarda el hash con `bcrypt`, devuelve el token completo **únicamente en esta respuesta** + `token_partial`; requiere rol `coordinador` o `director`
- [ ] `DELETE /api/v1/perfil/tokens/{id}` — marca `revocado=True`; `404` si no pertenece al usuario

### 6.6 Verificación de cierre — Fase 6

- [ ] Ciclo completo: crear OT → aceptar → iniciar ejecución → subir 2 evidencias → cerrar con descripción → historial con 3 entradas de estado
- [ ] Transición inválida `pendiente → cerrada` → `409`
- [ ] Técnico solo ve sus propias OTs en `GET /api/v1/ordenes`
- [ ] Token de API generado: visible una sola vez; segundo `GET` solo muestra `token_partial`
- [ ] Tests Fase 6: ver `docs/10-PLAN-TESTS.md §6`

---

## Fase 7 — Visibilidad y Administración

> **Depende de:** Fase 6 (OTs y activos completos para agregar en dashboard).  
> **Produce:** HU-07, HU-08, HU-10 y HU-12 completas.

### 7.1 Notificaciones — `app/services/notificacion_service.py`

- [ ] `crear_notificacion(usuario_id, tipo, titulo, mensaje, link, actor, db)`:
  - Inserta en tabla `notificacion`
  - Emite `manager.broadcast_to_tenant` con `{evento: EVENTO_NOTIFICACION, notificacion: ...}`
- [ ] Integrar en los flujos que generan eventos:
  - Creación de OT con técnico asignado → notificación al técnico (`orden_asignada`)
  - Cambio de estado OT → notificación al coordinador (`orden_actualizada`)
  - Cierre de OT → notificación al coordinador y al director (`orden_cerrada`)
  - Creación de alerta crítica → notificación al coordinador (`alerta_critica`)
  - Nuevo reporte de falla → notificación al coordinador (`reporte_falla`)

### 7.2 API de notificaciones — `app/api/v1/notificaciones.py`

- [ ] `GET /api/v1/notificaciones` — notificaciones del usuario autenticado, ordenadas por `fecha` desc
- [ ] `POST /api/v1/notificaciones/{id}/leer` — marca `leida=True`; `404` si no pertenece al usuario
- [ ] `POST /api/v1/notificaciones/leer-todas` — marca todas las notificaciones del usuario como leídas

### 7.3 Proyección service — `app/services/proyeccion_service.py`

- [ ] `calcular_proyeccion(tenant_id: UUID, anio: int, db: AsyncSession) -> ProyeccionOut`:
  - Agrupa `plan_mantenimiento` por mes del `anio` solicitado con costos de referencia (campo `costo_referencia` en `regla_mantenimiento` — agregar si no existe, nullable)
  - Estima correctivos: 30% del costo total de OTs correctivas del año anterior del tenant
  - Identifica candidatos a reemplazo: activos con `score < 40` o con vida útil restante < 20%

### 7.4 API de dashboard y proyección

- [ ] `app/api/v1/dashboard.py` — `GET /api/v1/dashboard`:
  - Semáforo: conteo de activos por rango de score (verde ≥ 70, amarillo 40–69, rojo < 40)
  - Top 5 activos con score más bajo
  - Heatmap: activos agrupados por aula con el score promedio
  - Métricas: total activos, OTs abiertas, alertas pendientes, costo estimado del mes
  - Query optimizada con `GROUP BY` y `COUNT` en la BD; objetivo ≤ 3 s
  - Filtros opcionales: `?categoria=&edificio=`

- [ ] `app/api/v1/proyeccion.py` — `GET /api/v1/proyeccion?anio=` — llama `proyeccion_service`; requiere rol `director` o `coordinador`

### 7.5 Administración — `app/api/v1/admin.py` (solo `super_admin`)

- [ ] `GET /api/v1/admin/instituciones` — lista todas las instituciones con contadores de activos y usuarios
- [ ] `POST /api/v1/admin/instituciones` — crea institución + primer coordinador automáticamente (genera password temporal)
- [ ] `PATCH /api/v1/admin/instituciones/{id}` — editar nombre, RUC, contacto, o desactivar
- [ ] `POST /api/v1/catalogo/modelos` — nuevo modelo; requiere `super_admin`
- [ ] `PATCH /api/v1/catalogo/modelos/{id}` — editar modelo; requiere `super_admin`

### 7.6 Verificación de cierre — Fase 7

- [ ] `GET /api/v1/dashboard` responde en ≤ 3 s con datos reales de la BD
- [ ] Notificación llega por WebSocket al coordinador cuando se crea una OT para su tenant
- [ ] Director solo puede ver dashboard y proyección; no puede crear activos ni OTs (403)
- [ ] `super_admin` puede crear institución; coordinador no puede acceder a `/admin/` (403)
- [ ] Tests Fase 7: ver `docs/10-PLAN-TESTS.md §7`

---

## Fase 8 — Capa IA: RAG y MCP

> **Depende de:** Fase 7 completa (todos los datos operativos existen para que las herramientas MCP consulten).  
> **Produce:** HU-11 completa — coordinador y director pueden usar el asistente IA con datos reales.

### 8.1 RAG service — `app/services/rag_service.py`

- [ ] `indexar_manual(modelo_id: UUID, archivo: UploadFile, db: AsyncSession)`:
  1. Extraer texto de PDF con `pypdf.PdfReader`
  2. Dividir en chunks de ≈ 800 tokens con overlap de 80 tokens
  3. Para cada chunk: `openai.embeddings.create(model=settings.OPENAI_EMBEDDING_MODEL, input=chunk_text)`
  4. Guardar `DocumentoRag(modelo_id, contenido=chunk, embedding=vector, pagina=n, chunk_index=i)`
  5. Actualizar `CatalogoModelo.manual_indexado = True`

- [ ] `buscar_en_manual(modelo_id: UUID, consulta: str, db: AsyncSession, top_k: int = 5) -> list[str]`:
  1. Generar embedding de la consulta con OpenAI
  2. Query: `SELECT contenido FROM documento_rag WHERE modelo_id = :id ORDER BY embedding <=> :vec LIMIT :k`
  3. Retornar lista de textos relevantes

- [ ] Migración: agregar índice pgvector después de la migración inicial:
  ```sql
  CREATE INDEX ON documento_rag USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
  ```
  Generar como nueva migración Alembic: `alembic revision -m "add_pgvector_index"`

- [ ] `POST /api/v1/catalogo/modelos/{id}/manual` — endpoint para subir PDF; llama `rag_service.indexar_manual`; requiere `super_admin`

### 8.2 Servidor MCP — `app/mcp/server.py`

- [ ] Instanciar `FastMCP("EduTrack AI")`
- [ ] Middleware de auth por token de API:
  - Leer header `Authorization: Bearer edu_pat_...`
  - Buscar token en `api_token` (no revocado), verificar hash
  - Actualizar `last_used_at`
  - Inyectar `usuario_id` e `institucion_id` al contexto de la herramienta
- [ ] Montar bajo `/mcp` en la app principal: `app.mount("/mcp", mcp.get_asgi_app())`

### 8.3 Herramientas MCP — `app/mcp/tools.py`

Todas las herramientas: filtran por el tenant del token, registran en `mcp_audit_log`, son de **solo lectura**.

- [ ] `consultar_score_activos(categoria: str | None = None, umbral: int | None = None) -> list[dict]`  
  Retorna activos del tenant con `score ≤ umbral` (default: todos), opcionalmente filtrados por `categoria`. Campos: `nombre`, `codigo_qr`, `ubicacion`, `score`, `factores`.

- [ ] `listar_ots_pendientes(prioridad: str | None = None) -> list[dict]`  
  OTs con `estado != "cerrada"` del tenant, filtradas por `prioridad` si se indica. Campos: `numero`, `activo`, `tipo`, `prioridad`, `estado`, `fecha_limite`, `tecnico`.

- [ ] `consultar_historial_activo(codigo_qr: str) -> list[dict]`  
  Verifica que el activo pertenece al tenant del token; retorna sus OTs cerradas con `descripcion_cierre`, `cerrada_en`, `tecnico`.

- [ ] `obtener_proyeccion_presupuesto(anio: int) -> dict`  
  Llama a `proyeccion_service.calcular_proyeccion` con el `tenant_id` del token.

### 8.4 Verificación de cierre — Fase 8

- [ ] Subir un PDF de manual → se indexan chunks en `documento_rag` con embeddings reales
- [ ] Herramienta MCP `consultar_score_activos` responde con datos del tenant correcto
- [ ] Token de API de tenant A no puede ver datos de tenant B
- [ ] Cada invocación MCP queda registrada en `mcp_audit_log`
- [ ] Tests Fase 8: ver `docs/10-PLAN-TESTS.md §8`

---

## Registro de avance

| Fecha | Fase | Tareas completadas | Notas |
|---|---|---|---|
| — | — | — | — |

---

## Checklist de seguridad (aplicar en cada PR)

- [ ] Toda consulta sobre tablas operativas filtra por `tenant_id` del JWT
- [ ] Ningún secreto hardcodeado — todo via `settings`
- [ ] Uploads: tipo MIME validado, tamaño validado, nombre generado por servidor (uuid)
- [ ] Paths de evidencias construidos con `pathlib`, validados contra el directorio base
- [ ] Errores 404 para recursos de otro tenant (no revelar existencia con 403)
- [ ] `commit()` nunca dentro de servicios — solo en la dependencia `get_db`
