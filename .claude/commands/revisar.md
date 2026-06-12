---
description: Revisión de código de los cambios recientes contra los estándares del proyecto
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git log:*)
---

# Revisar cambios

Revisa los cambios no commiteados (o del último commit si el árbol está limpio) contra `docs/04-ESTANDARES-DE-CODIGO.md`:

## Cambios
!`git diff HEAD --stat`

## Checklist de revisión
1. **Multi-tenant:** ¿toda consulta a tablas operativas filtra por `institucion_id` proveniente del JWT? Busca consultas sin `.where(...institucion_id...)`.
2. **Capas:** ¿los routers delegan a servicios? ¿los servicios evitan `HTTPException` y `commit()`?
3. **Schemas:** ¿se devuelven schemas Pydantic y no modelos SQLAlchemy?
4. **Seguridad:** secretos hardcodeados, validación de uploads, path traversal en evidencias, rate limiting en endpoints públicos.
5. **Tests:** ¿cada endpoint nuevo tiene caso feliz + error + aislamiento de tenant?
6. **Estilo:** type hints, nomenclatura, docstrings en español.

Entrega el resultado como lista priorizada: 🔴 bloqueante, 🟡 mejorable, 🟢 correcto. Propón el fix concreto para cada 🔴.
