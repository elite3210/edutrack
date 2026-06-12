---
description: Verifica la Definición de Terminado, actualiza el plan de tareas y prepara el commit
allowed-tools: Bash(ruff check:*), Bash(ruff format:*), Bash(pytest:*), Bash(git add:*), Bash(git status:*), Bash(git diff:*), Bash(git commit:*), Read, Edit
---

# Cerrar tarea

Ejecuta el cierre de la tarea actual:

1. Corre `ruff check .` y `ruff format --check .` en `backend/`; corrige lo que falle.
2. Corre `pytest`; todos los tests deben pasar. Si la tarea tocó el esquema, verifica que existe la migración Alembic correspondiente.
3. Verifica contra el checklist de seguridad de `docs/04-ESTANDARES-DE-CODIGO.md` (filtro de tenant, secretos, uploads, paths).
4. En `docs/03-PLAN-DE-TAREAS.md`: marca la tarea como `[x]` y agrega una fila al Registro de avance (fecha, resumen, notas).
5. Muestra `git status` y `git diff --stat`, y propón el mensaje de commit en formato Conventional Commits en español referenciando la HU (ej. `feat(hu-02): reporte de falla por QR con foto`).
6. Tras la confirmación del humano, ejecuta el commit. NO hagas push hasta que el humano haya probado y pides confirmacíon si el humano ya probó la implementación.
