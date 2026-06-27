# PA3 — Análisis de cambios para implementación

> Documento de referencia generado tras revisar `PA3_Mandujano_Montenegro_Palacios_Quispe.pdf`.  
> Consultar este archivo antes de implementar las fases afectadas.  
> **Los planes `09-PLAN-BACKEND.md`, `10-PLAN-TESTS.md` y `11-PLAN-DESPLIEGUE.md` NO se modificaron** — este doc captura las diferencias entre lo que dicen esos planes y lo que el PA3 establece formalmente.

---

## Contexto

El PA3 es el tercer informe académico del proyecto. Registra 5 solicitudes de cambio (SCR-001 a SCR-005) que ajustaron el alcance del PMV entre PA2 y PA3. La **Línea Base v2** resultante tiene:

- **11 HUs** (no 12 — HU-11 movida a Backlog V2)
- **72 SP** (era 76)
- **180 horas** (era 190)
- **S/. 5,400** (era S/. 5,700)
- **24 vistas** (era 23 — NotificacionesView añadida)

---

## Cambio 1 — HU-11 (MCP + RAG) → Backlog V2

**SCR-001 + SCR-002.** HU-11 se retiró del PMV académico por riesgo de dependencias.

### ¿Afecta a la implementación técnica?

**No.** El plan `docs/09-PLAN-BACKEND.md` conserva la Fase 8 completa. Si hay capacidad para implementarla, se implementa. Lo que el PA3 dice es que el *compromiso académico evaluado* no incluye HU-11 — no es una restricción técnica.

### Detalles técnicos del SCR-002 a recordar

- La tabla `api_token` **queda en el PMV** aunque HU-11 no. El PA3 lo dice explícitamente: *"Los tokens de API del perfil de usuario que la soportan se mantienen en el PMV porque también son útiles para otras integraciones futuras."*
- Cuando se implemente HU-11 (Backlog V2), el alcance ya es **lectura + escritura controlada**: crear borradores de OT desde el chat (SCR-001 define esto). Los 4 tools de solo lectura originales se amplían con al menos un tool de escritura liviana.

---

## Cambio 2 — Exportación PDF por `window.print()` (SCR-005)

**Afecta a HU-06 (historial) y HU-08 (proyección).**

El frontend ya implementa la exportación con `window.print()` + `@media print`. Esto simplifica el backend:

- `GET /activos/{id}/historial` → retorna JSON. El frontend imprime.
- `GET /proyeccion` → retorna JSON. El frontend imprime.
- **No hay endpoint de generación PDF.** No se necesita ninguna librería de PDF en el backend.

---

## Cambio 3 — 5 requisitos técnicos que el PA3 especifica explícitamente

Estos requisitos están en los test cases de la sección 3.2 del PA3. No estaban en el plan original. Deben implementarse cuando lleguen las fases correspondientes.

### Requisito A — Guardia de división por cero en `score_service.py`

**Test case: TC-HU09-04**

```
Datos entrada: CatalogoModelo con vida_util_meses = 0
Resultado esperado: servicio retorna error controlado, NO divide entre cero
```

Implementar en `score_service.py`: antes de calcular el factor `vida_util`, verificar que `vida_util_meses > 0`. Si es 0, retornar score nulo o lanzar `ValueError` controlado.

Test a agregar en `tests/services/test_score_service.py`:
```python
def test_score_zero_vida_util_no_divide_entre_cero():
    # modelo con vida_util_meses = 0
    # debe retornar error controlado, no ZeroDivisionError
```

### Requisito B — Validar que el QR coincide con el activo de la OT al cerrar

**Test case: TC-HU05-03**

```
Datos entrada: QR de activo B, OT asignada al activo A
Resultado esperado: error "equipo incorrecto", solicita escanear nuevamente
```

En el endpoint que registra el cierre de una OT (o el cambio de estado a `cerrada`), si el request incluye `codigo_qr`, validar que ese código corresponde al `activo_id` de la OT. Si no coincide → `400` con mensaje claro.

Test a agregar en `tests/api/test_ordenes.py`:
```python
def test_cerrar_ot_con_qr_de_activo_incorrecto():
    # OT del activo A, se envía QR del activo B → 400
```

### Requisito C — Dashboard debe responder en < 3 segundos con 300 activos

**Test case: TC-HU07-03**

```
Datos entrada: institución con 300 activos activos
Resultado esperado: GET /api/v1/dashboard responde en menos de 3 segundos
```

Implementar `GET /dashboard` con una sola query agregada (GROUP BY en SQL), no procesando activo a activo en Python. Test de performance a agregar en `tests/api/test_dashboard.py`.

### Requisito D — Límite de foto en reporte docente: exactamente 5 MB

**Test cases: TC-HU02-03 y TC-HU02-04**

```
Foto JPG de exactamente 5 MB → acepta
Foto de 6 MB → rechaza antes de intentar subirlo (validación en frontend + en servidor)
```

`EVIDENCIAS_MAX_SIZE_MB = 5` en la configuración. El endpoint `POST /reportes` debe retornar `422` si la foto supera este límite. El error debe llegar antes de intentar guardar el archivo.

### Requisito E — Mínimo 2 fotos para cerrar una OT

**Test case: TC-HU05-02**

```
Datos entrada: intento de cierre sin fotos adjuntas
Resultado esperado: sistema impide cierre, mensaje "mínimo dos fotos requeridas"
```

El endpoint de cierre de OT debe validar que existen al menos 2 registros de `Evidencia` ligados a esa OT antes de permitir el cambio de estado a `cerrada`. Si no → `400`.

Test a agregar:
```python
def test_tecnico_no_puede_cerrar_ot_sin_fotos():
    # OT sin evidencias → 400
    
def test_tecnico_no_puede_cerrar_ot_con_una_foto():
    # OT con 1 evidencia → 400
```

---

## Cambio 4 — Plan de pruebas ampliado (sección 3.2 del PA3)

El PA3 define 6 tipos de prueba. El `docs/10-PLAN-TESTS.md` cubre 4. Faltan:

### E2E con Playwright (no está en el plan actual)

El PA3 especifica pruebas E2E en **Chrome, Firefox y Safari** con Playwright. Ejecutar al finalizar Sprint 3, antes del despliegue. Scripts en `tests/e2e/`.

Flujos críticos que deben cubrir:
1. **Flujo del docente**: escanear QR → completar formulario → foto → confirmación. Tiempo total ≤ 60 segundos.
2. **Flujo coordinador**: recibir notificación del reporte → crear OT → asignar al técnico.
3. **Flujo técnico**: recibir notificación de asignación → ejecutar → cerrar con 2 fotos, incluyendo modo offline (sincronización al recuperar señal).

Criterio de aprobación: cero fallos en los 3 navegadores.

### White-box: cobertura de ramas ≥ 80%

El PA3 establece explícitamente que `score_service.py` y `lifecycle_engine.py` requieren **≥ 80% de cobertura de ramas** (branch coverage), no solo cobertura de líneas.

Comando:
```bash
pytest --cov=app/services/score_service --cov=app/services/lifecycle_engine --cov-branch --cov-report=term-missing
```

Ejecutar al cierre del Sprint 1 (hito H2).

### UAT — Pruebas de aceptación con institución piloto

El PA3 establece estas pruebas en **Semana 8** como prerrequisito al hito H4 (despliegue final). Se ejecutan manualmente con usuarios reales de la institución piloto en el entorno de producción.

Verificaciones formales del PA3:
- Un docente reporta una falla escaneando el QR sin recibir instrucción previa, en menos de 60 segundos.
- Un técnico cierra una OT desde su celular personal sin instalar ninguna aplicación, adjuntando 2 fotografías.
- Un director lee el dashboard y entiende todos los indicadores sin explicación técnica.

Criterio de aprobación: los 4 roles completan sus flujos críticos sin asistencia del equipo.

---

## Criterios de aceptación del PMV completo (sección 3.1 del PA3)

El PMV se considera exitoso cuando se verifican **en producción**:

1. La institución piloto registra ≥ 50 activos en la primera semana de uso.
2. El 100% de los reportes de falla de la semana piloto llegan por QR (ningún docente usa WhatsApp).
3. El tiempo de reporte QR (desde escaneo hasta notificación al coordinador) es ≤ 60 segundos en condiciones reales de red.
4. El 100% de los criterios de aceptación de las 11 HUs tienen al menos un caso de prueba aprobado.

---

## Backlog V2 — qué NO entra en el PMV (según PA3)

Excluido desde el inicio del proyecto (no en ningún release):
- Gestión multi-sede
- Asistente conversacional con herramientas de escritura irrestrictas
- Ajuste de intervalos de mantenimiento por aprendizaje automático
- Gestión de contratos con proveedores externos
- Pagos y facturación dentro del sistema
- Migración de evidencias fotográficas a almacenamiento en la nube
- Integración con SIAGIE del Ministerio de Educación

Excluido del PMV pero planificado para Backlog V2:
- HU-11 — Servidor MCP del asistente de IA (con alcance ampliado: lectura + borradores de OT)

---

## Resumen rápido para implementación

| Al implementar | Recordar |
|---|---|
| `score_service.py` | Guardia `vida_util_meses == 0` (TC-HU09-04) |
| OT endpoint cierre | Validar QR coincide con activo (TC-HU05-03) + mínimo 2 fotos (TC-HU05-02) |
| `POST /reportes` | Límite máximo foto: 5 MB (TC-HU02-03/04) |
| `GET /dashboard` | Query agregada, respuesta ≤ 3s con 300 activos (TC-HU07-03) |
| `GET /activos/{id}/historial` | Solo JSON — sin PDF (SCR-005) |
| `GET /proyeccion` | Solo JSON — sin PDF (SCR-005) |
| `api_token` table | Incluir aunque MCP sea Backlog V2 |
| Tests Sprint 1 | Branch coverage ≥ 80% en score + lifecycle engine |
| Tests finales | E2E con Playwright (Chrome/Firefox/Safari) + UAT con piloto |
