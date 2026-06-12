# CLAUDE.md — EduTrack AI

Este archivo es la memoria de proyecto de Claude Code. Se carga automáticamente al inicio de cada sesión. Mantenerlo conciso: el detalle vive en `docs/`.

## Qué es este proyecto

EduTrack AI es una plataforma SaaS multi-tenant de gestión inteligente del ciclo de vida de activos tecnológicos, como equipos informaticos, para colegios privados del Perú. Un motor (Lifecycle Intelligence Engine) genera planes de mantenimiento desde un catálogo de fabricantes, calcula un score de salud por activo, y los docentes reportan fallas escaneando un código QR desde el celular.

## Documentación de referencia (leer cuando la tarea lo requiera y mantenerlo actualizado)

| Documento | Cuándo leerlo |
| --- | --- |
| `docs/01-PRD.md` | Antes de implementar cualquier historia de usuario — requisitos y criterios de aceptación |
| `docs/02-ARQUITECTURA.md` | Antes de crear módulos, endpoints o tablas — estructura, decisiones y modelo de datos |
| `docs/03-PLAN-DE-TAREAS.md` | Al inicio de CADA sesión — backlog ejecutable; marcar tareas al completarlas |
| `docs/04-ESTANDARES-DE-CODIGO.md` | Antes de escribir código — convenciones de Python, Vue, tests y git |
| `docs/05-FLUJO-DE-TRABAJO.md` | Cómo se trabaja con Claude Code en este repositorio |

## Stack tecnológico

- **Backend:** Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0 (estilo declarativo 2.0, sesiones async), Alembic, Uvicorn
- **Base de datos:** PostgreSQL 16 + extensión pgvector (base de conocimiento RAG)
- **Auth:** OAuth2 con JWT propio (python-jose) + bcrypt (passlib)
- **Tiempo real:** WebSockets nativos de FastAPI
- **Jobs:** APScheduler integrado (alertas nocturnas, recálculo de scores)
- **Asistente IA:** servidor MCP con FastMCP (solo herramientas de lectura en el PMV)
- **Frontend:** Vue 3 (Composition API) + Vite, PWA con service worker e IndexedDB para modo offline
- **Infra:** Docker Compose, Nginx (reverse proxy + estáticos de evidencias), VPS Ubuntu

## Comandos del proyecto

```bash
# Levantar todo el entorno (API + PostgreSQL + frontend)
docker compose up -d

# Backend (desde backend/)
uvicorn app.main:app --reload          # servidor de desarrollo
pytest                                  # correr todos los tests
pytest tests/test_activos.py -v        # un archivo de tests
ruff check . && ruff format .          # lint + formato
alembic revision --autogenerate -m ""  # nueva migración
alembic upgrade head                    # aplicar migraciones

# Frontend (desde frontend/)
npm run dev                             # servidor de desarrollo Vite
npm run build                           # build de producción
npm run lint                            # ESLint
```

## Estructura del repositorio

```
backend/
  app/
    main.py            # instancia FastAPI, routers, lifespan (APScheduler)
    core/              # config (pydantic-settings), seguridad JWT, deps
    models/            # modelos SQLAlchemy (1 archivo por entidad)
    schemas/           # schemas Pydantic (request/response)
    api/               # routers por módulo: activos, reportes, ordenes, dashboard...
    services/          # lógica de negocio (motor de ciclo de vida, score, proyección)
    mcp/               # servidor FastMCP y sus herramientas
    jobs/              # tareas de APScheduler
  alembic/             # migraciones
  tests/               # pytest (espeja la estructura de app/)
frontend/
  src/                 # Vue 3 + Vite (views, components, stores, composables)
docs/                  # documentación del proyecto
docker-compose.yml
```

## Reglas críticas (NO negociables)

1. **Multi-tenant SIEMPRE:** toda tabla operativa tiene `institucion_id`. Toda consulta SQLAlchemy DEBE filtrar por el `institucion_id` del token JWT. Nunca exponer datos entre instituciones. Los tests deben incluir al menos un caso de aislamiento de tenant.
2. **El servidor MCP es de LECTURA y Escritura** en el PMV. No crear herramientas MCP que eliminen datos.
3. **Nunca** escribir SQL crudo si SQLAlchemy puede expresarlo; nunca hacer `commit` dentro de los servicios — la transacción la gestiona la dependencia de sesión.
4. **Toda nueva tabla = nueva migración Alembic.** No modificar migraciones ya aplicadas.
5. **Evidencias fotográficas** se guardan en `/var/edutrack/evidencias/{institucion_id}/{orden_id}/` y solo se sirven vía Nginx con rutas validadas. Nunca guardar binarios en PostgreSQL.
6. **No** agregar dependencias nuevas sin justificarlo en el mensaje y registrarlo en `docs/02-ARQUITECTURA.md` (sección Decisiones).
7. Secretos solo por variables de entorno (`.env` no se commitea; mantener `.env.example` actualizado).
8. Cada endpoint nuevo debe quedar documentado en OpenAPI con `summary`, `response_model` y códigos de error explícitos.

## Definición de terminado (DoD) para cualquier tarea

- [ ] Código con type hints y validado por `ruff check` sin errores
- [ ] Tests en pytest que cubren caso feliz + caso de error + aislamiento de tenant (si aplica)
- [ ] Migración Alembic si cambió el esquema
- [ ] Tarea marcada como completada en `docs/03-PLAN-DE-TAREAS.md`
- [ ] Commit con formato Conventional Commits (ver `docs/04-ESTANDARES-DE-CODIGO.md`)

## Idioma

Código, nombres de variables y funciones en **inglés**. Comentarios, docstrings, mensajes de error al usuario y documentación en **español**.
