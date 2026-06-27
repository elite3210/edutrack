# 10 — Plan de tests: Backend — EduTrack AI

> Tests de cada fase del backend. Referenciado desde `docs/09-PLAN-BACKEND.md`. Ejecutar siempre con `pytest` antes de cerrar una fase.

**Framework:** pytest + pytest-asyncio (modo auto) + httpx `AsyncClient`  
**Regla de oro:** cada endpoint tiene mínimo 3 tests — caso feliz, caso de error y aislamiento de tenant.  
**Cobertura objetivo:** ≥ 90% en `app/services/`

---

## Fixtures base — `tests/conftest.py`

Implementar antes de cualquier test de fase. Todos los tests se apoyan en estas fixtures.

- [ ] `db` — sesión de BD de test con rollback por test (la transacción nunca se confirma; la BD de test queda limpia automáticamente)
- [ ] `client(db)` — `httpx.AsyncClient` apuntando a la app FastAPI con la sesión de test inyectada
- [ ] `tenant_a` — fixture que inserta la institución A en la BD de test
- [ ] `tenant_b` — fixture que inserta la institución B en la BD de test
- [ ] `usuario_coordinador_a(tenant_a)` — coordinador de la institución A
- [ ] `usuario_tecnico_a(tenant_a)` — técnico de la institución A
- [ ] `usuario_director_a(tenant_a)` — director de la institución A
- [ ] `usuario_coordinador_b(tenant_b)` — coordinador de la institución B
- [ ] `token_coordinador_a` — JWT válido para el coordinador A
- [ ] `token_tecnico_a` — JWT válido para el técnico A
- [ ] `token_director_a` — JWT válido para el director A
- [ ] `token_coordinador_b` — JWT válido para el coordinador B (para tests de aislamiento)

---

## §2 — Tests de Autenticación (Fase 2)

Archivo: `tests/api/test_auth.py`

- [ ] `test_login_exitoso` — credenciales válidas → `200` con `access_token` y `refresh_token`
- [ ] `test_login_email_no_existe` — `401`
- [ ] `test_login_password_incorrecta` — `401`
- [ ] `test_refresh_token_valido` — `200` con nuevo `access_token`
- [ ] `test_refresh_token_invalido` — `401`
- [ ] `test_endpoint_protegido_sin_token` — `GET /activos` sin header → `401`
- [ ] `test_endpoint_protegido_token_expirado` — token con `exp` en el pasado → `401`

---

## §3 — Tests de Catálogo y Activos (Fase 3)

### `tests/api/test_catalogo.py`

- [ ] `test_listar_marcas` — `GET /catalogo/marcas` sin auth → `200` con lista de marcas
- [ ] `test_filtrar_modelos_por_marca` — `?marca=Epson` → solo modelos Epson
- [ ] `test_modelos_incluyen_reglas` — cada modelo tiene `reglas: list`

### `tests/api/test_activos.py`

- [ ] `test_crear_activo_exitoso` — POST válido → `201`, respuesta incluye `codigo_qr`
- [ ] `test_crear_activo_genera_plan_de_mantenimiento` — después del POST existe al menos 1 tarea en `plan_mantenimiento`
- [ ] `test_crear_activo_requiere_coordinador` — técnico intenta crear → `403`
- [ ] `test_obtener_activo_propio` — coordinador A obtiene activo de tenant A → `200`
- [ ] `test_tenant_b_no_ve_activo_de_tenant_a` — coordinador B solicita activo de A → `404`
- [ ] `test_activo_no_existente` → `404`
- [ ] `test_qr_publico_sin_auth` — `GET /qr/{codigo}` sin token → `200`
- [ ] `test_qr_codigo_invalido` → `404`
- [ ] `test_listar_activos_filtro_categoria` — `?categoria=Proyector` → solo proyectores del tenant

### `tests/services/test_lifecycle_engine.py`

- [ ] `test_plan_generado_por_cada_regla` — modelo con 3 reglas → 3 tareas en el plan
- [ ] `test_fecha_programada_correcta` — `fecha_instalacion + intervalo_dias`
- [ ] `test_tarea_vencida_si_fecha_pasada` — `fecha_programada < hoy` → `estado = vencido`

### `tests/services/test_score_service.py`

- [ ] `test_score_activo_nuevo_es_100` — activo recién instalado, sin fallas → score 100
- [ ] `test_score_baja_con_fallas_frecuentes` — 4+ fallas en 90 días → factor `frecuencia_fallas` bajo
- [ ] `test_score_baja_sin_mantenimientos` — múltiples tareas vencidas → factor `cumplimiento` bajo
- [ ] `test_score_guarda_registro_en_score_salud` — después de calcular, existe un `ScoreSalud`
- [ ] `test_alerta_creada_cuando_score_bajo_40` — score calculado < 40 → existe alerta `riesgo_falla`
- [ ] `test_alerta_riesgo_falla_no_duplicada` — calcular dos veces con score < 40 → solo 1 alerta

---

## §4 — Tests de Alertas y Job nocturno (Fase 4)

### `tests/api/test_alertas.py`

- [ ] `test_listar_alertas_del_tenant` — coordinador A solo ve alertas de tenant A
- [ ] `test_alertas_no_incluye_atendidas` — alerta marcada como atendida no aparece en el listado
- [ ] `test_atender_alerta_exitoso` → `200`
- [ ] `test_atender_alerta_de_otro_tenant` → `404`

### `tests/jobs/test_nightly.py`

- [ ] `test_job_genera_alerta_15_dias` — tarea con `fecha_programada = hoy + 14 días` → alerta `mantenimiento_proximo`
- [ ] `test_job_genera_alerta_5_dias` — tarea con `fecha_programada = hoy + 4 días` → alerta `mantenimiento_proximo`
- [ ] `test_job_no_duplica_alertas` — ejecutar el job dos veces → sigue habiendo solo 1 alerta por activo/tipo
- [ ] `test_job_marca_tareas_vencidas` — tarea con `fecha_programada < hoy` y `estado = programado` → pasa a `vencido`
- [ ] `test_job_recalcula_score` — después del job, `activo.score` está actualizado

---

## §5 — Tests de Reportes y WebSockets (Fase 5)

### `tests/api/test_reportes.py`

- [ ] `test_crear_reporte_sin_foto` — POST con campos obligatorios → `201`
- [ ] `test_crear_reporte_con_foto_valida` — foto JPEG → `201`; archivo existe en el filesystem
- [ ] `test_crear_reporte_foto_tipo_invalido` — PDF como foto → `422`
- [ ] `test_crear_reporte_foto_muy_grande` — supera `EVIDENCIAS_MAX_SIZE_MB` → `422`
- [ ] `test_crear_reporte_activo_inexistente` → `404`
- [ ] `test_numero_reporte_correlativo` — dos reportes → números distintos y correlativos

### `tests/services/test_evidencia_service.py`

- [ ] `test_nombre_archivo_generado_es_uuid` — nunca el nombre original del cliente
- [ ] `test_ruta_dentro_del_directorio_base` — sin path traversal
- [ ] `test_path_traversal_bloqueado` — `../../../etc/passwd` como nombre → excepción

---

## §6 — Tests de Órdenes de trabajo (Fase 6)

### `tests/api/test_ordenes.py`

- [ ] `test_crear_ot_exitoso` — coordinador crea OT → `201` con `estado = pendiente`
- [ ] `test_crear_ot_desde_reporte` — OT con `reporte_id` válido → `201`
- [ ] `test_tecnico_no_puede_crear_ot` → `403`
- [ ] `test_listar_ots_solo_del_tenant` — coordinador B no ve OTs de A
- [ ] `test_tecnico_solo_ve_sus_ots` — técnico A no ve OTs asignadas a técnico B
- [ ] `test_transicion_valida_pendiente_aceptada` — `PATCH /ordenes/{id}/estado` → `200`
- [ ] `test_transicion_invalida_pendiente_cerrada` → `409`
- [ ] `test_transicion_invalida_cerrada_cualquier_cosa` → `409`
- [ ] `test_subir_evidencia_exitosa` — técnico sube foto → `201`; `Evidencia` creada en BD
- [ ] `test_tenant_b_no_ve_orden_de_tenant_a` → `404`

### `tests/services/test_ot_service.py`

- [ ] `test_historial_creado_en_cambio_de_estado` — cambiar estado → nueva entrada en `historial_ot`
- [ ] `test_historial_creado_en_cambio_de_prioridad` — cambiar prioridad → entrada tipo `prioridad`
- [ ] `test_cerrada_en_registrado_al_cerrar` — OT cerrada → `cerrada_en` no es null

### `tests/api/test_usuarios.py`

- [ ] `test_coordinador_puede_crear_tecnico` → `201`
- [ ] `test_coordinador_no_puede_crear_super_admin` → `403`
- [ ] `test_usuarios_del_tenant_a_no_visibles_para_tenant_b` → `404`

### `tests/api/test_perfil.py`

- [ ] `test_cambiar_password_exitoso` → `200`
- [ ] `test_cambiar_password_actual_incorrecto` → `400`
- [ ] `test_generar_token_api` → `201`; respuesta incluye `token` completo
- [ ] `test_token_completo_solo_en_creacion` — segundo `GET /perfil/tokens` muestra solo `token_partial`
- [ ] `test_revocar_token` → token marcado como `revocado`; `DELETE` de otro usuario → `404`

---

## §7 — Tests de Visibilidad y Administración (Fase 7)

### `tests/api/test_dashboard.py`

- [ ] `test_dashboard_solo_activos_del_tenant` — semáforo cuenta solo activos de tenant A para coordinador A
- [ ] `test_dashboard_responde_rapido` — tiempo de respuesta < 3 s con datos del seed

### `tests/api/test_proyeccion.py`

- [ ] `test_proyeccion_incluye_candidatos_reemplazo` — activos con score < 40 aparecen como candidatos
- [ ] `test_proyeccion_anio_actual_y_siguiente` — funciona para ambos años

### `tests/api/test_notificaciones.py`

- [ ] `test_notificacion_visible_solo_al_usuario_destino` — usuario B no ve notificaciones de usuario A
- [ ] `test_marcar_leida_propia` → `200`
- [ ] `test_marcar_leida_ajena` → `404`
- [ ] `test_marcar_todas_leidas` — después del POST todas quedan `leida=True`

### `tests/api/test_admin.py`

- [ ] `test_coordinador_no_accede_a_admin` → `403`
- [ ] `test_super_admin_crea_institucion` → `201`
- [ ] `test_crear_institucion_genera_coordinador` — después del POST existe usuario `coordinador` en la institución nueva

---

## §8 — Tests de Capa IA: RAG y MCP (Fase 8)

### `tests/services/test_rag_service.py`

> Mockear las llamadas a OpenAI con `pytest-mock` para no consumir créditos en los tests.

- [ ] `test_indexar_pdf_crea_chunks` — PDF de 2 páginas → múltiples `DocumentoRag` en BD
- [ ] `test_chunks_tienen_embedding` — cada `DocumentoRag` tiene `embedding` no nulo
- [ ] `test_modelo_marcado_como_indexado` — después de indexar, `CatalogoModelo.manual_indexado = True`
- [ ] `test_busqueda_retorna_top_k` — búsqueda con `top_k=3` → máximo 3 resultados

### `tests/mcp/test_mcp_tools.py`

- [ ] `test_token_api_invalido_rechazado` — header con token inexistente → error de auth
- [ ] `test_token_api_revocado_rechazado` — token revocado → error de auth
- [ ] `test_consultar_score_activos_filtra_por_tenant` — herramienta solo devuelve activos del tenant del token
- [ ] `test_listar_ots_pendientes_filtra_por_tenant` — ídem para OTs
- [ ] `test_historial_activo_de_otro_tenant` — `codigo_qr` de tenant B con token de A → error
- [ ] `test_cada_invocacion_registrada_en_audit_log` — después de llamar cualquier tool, existe entrada en `mcp_audit_log`

---

## Comandos de test

```bash
# Desde backend/

# Correr todos los tests
pytest

# Con cobertura
pytest --cov=app --cov-report=term-missing

# Solo una fase
pytest tests/api/test_activos.py -v

# Solo los tests de servicios
pytest tests/services/ -v

# Ver tests lentos
pytest --durations=10
```
