# 04 — Estándares de código

> Convenciones obligatorias para todo el código generado en este repositorio.

## Python (backend)

### Estilo y herramientas
- Formato y lint con **Ruff** (configurado en `pyproject.toml`); línea máxima 100 caracteres.
- **Type hints en todo**: parámetros, retornos y atributos. `mypy`-friendly aunque mypy no esté en CI.
- Imports absolutos desde `app.` (nunca relativos de más de un nivel).
- Funciones async por defecto en la capa API y servicios que tocan la BD.

### Patrones del proyecto
- **Router → Servicio → Modelo.** Los routers no contienen lógica de negocio: validan entrada (Pydantic), resuelven dependencias y delegan al servicio. Los servicios no conocen HTTP (no levantan `HTTPException`; levantan excepciones de dominio que un handler global traduce).
- **Schemas Pydantic** por entidad: `XxxCreate`, `XxxUpdate` (campos opcionales), `XxxOut` (con `model_config = ConfigDict(from_attributes=True)`). Nunca devolver modelos SQLAlchemy directamente.
- **Sesión y transacción:** la dependencia `get_db` abre la sesión y confirma/revierte al final del request. Los servicios usan `await db.flush()` si necesitan el id, jamás `commit()`.
- **Multi-tenant:** toda consulta sobre tablas con `TenantMixin` incluye `.where(Modelo.institucion_id == tenant_id)`. El `tenant_id` viene SIEMPRE de la dependencia `get_tenant_id` (del JWT), nunca del body o query params.
- **Errores HTTP estándar:** 401 sin token / token inválido, 403 rol insuficiente, 404 recurso inexistente *o de otro tenant* (no revelar existencia), 409 transición de estado inválida, 422 validación.
- Constantes de negocio (pesos del score, umbrales de alerta, días de anticipación) en `core/config.py`, no dispersas.

### Nomenclatura
- Módulos y funciones: `snake_case` en inglés (`score_service.py`, `calculate_health_score`).
- Modelos: `PascalCase` singular (`Activo`, `OrdenTrabajo` — nombres de dominio en español son aceptados porque el dominio es en español; ser consistente).
- Tablas: `snake_case` singular (`orden_trabajo`). Enums de estado en minúsculas (`pendiente`, `en_ejecucion`).

### Docstrings y comentarios
- Docstrings en español, formato breve: una línea de propósito + `Args/Returns` solo si no es obvio.
- Comentarios solo cuando el "porqué" no es evidente; nunca comentar lo obvio.

## Tests (pytest)

- Estructura espejo: `app/services/score_service.py` → `tests/services/test_score_service.py`.
- Cada endpoint nuevo: mínimo 3 tests — caso feliz, caso de error (validación o estado inválido) y **aislamiento de tenant** (el tenant B no ve ni afecta datos del tenant A).
- Usar las fixtures de `conftest.py` (`client`, `tenant_a`, `tenant_b`, `token_coordinador`, etc.); no crear usuarios ad-hoc dentro de los tests.
- Tests async con `pytest-asyncio` en modo auto; BD de test efímera con rollback por test.
- Nombres descriptivos: `test_crear_activo_genera_plan_de_mantenimiento`, `test_tenant_b_no_ve_activos_de_tenant_a`.

## Vue 3 (frontend)

- **Composition API con `<script setup>`** exclusivamente; nada de Options API.
- Estado global en **Pinia** (un store por dominio); estado local con `ref/computed`.
- Llamadas HTTP solo a través de `useApi.js` (maneja JWT y refresh); ningún `fetch` suelto en componentes.
- Componentes en `PascalCase.vue`; composables `useXxx.js`; vistas agrupadas por rol.
- Textos visibles al usuario en español; sin lógica de negocio en componentes (va en stores o composables).
- PWA: toda operación del técnico debe pasar por la cola offline de `useOffline.js`, nunca asumir conectividad.

## Git

- **Conventional Commits** en español: `feat: registro de activos con plan automático`, `fix: aislar consultas de OT por tenant`, `test:`, `refactor:`, `docs:`, `chore:`.
- Una tarea del plan = una rama `feat/hu-01-registro-activos` (o `chore/...`) = un PR pequeño y revisable.
- Nunca commitear: `.env`, volúmenes, `node_modules`, `__pycache__`, archivos de evidencias.
- El mensaje del commit referencia la HU o tarea: `feat(hu-02): reporte de falla por QR con foto`.

## Seguridad (checklist por PR)

- [ ] Ninguna consulta sin filtro de tenant en tablas operativas
- [ ] Ningún secreto hardcodeado
- [ ] Uploads: validar tipo MIME y tamaño máximo; nombre de archivo generado por el servidor (uuid), nunca el nombre original del cliente en el path
- [ ] Paths de evidencias construidos con `pathlib` y validados contra el directorio base (sin path traversal)
- [ ] Endpoints públicos (QR) con rate limiting básico
