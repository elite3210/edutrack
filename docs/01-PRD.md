# 01 — PRD: Documento de requisitos del producto

> Fuente: `EduTrack-AI.md` (documento de concepción del proyecto). Este PRD es la versión operativa para el desarrollo guiado por Claude Code. Ante cualquier ambigüedad, este documento manda sobre suposiciones; si la ambigüedad persiste, preguntar al equipo antes de implementar.

## 1. Problema

Los colegios privados medianos del Perú (200–800 alumnos) gestionan sus activos tecnológicos (proyectores, laptops, aires acondicionados, pizarras interactivas) de forma reactiva: las fallas se reportan por WhatsApp, no existe historial de intervenciones, y el director presupuesta a ciegas. EduTrack AI convierte esa gestión informal en un flujo estructurado, trazable y predictivo.

## 2. Usuarios y roles

| Rol | Acceso | Qué hace |
| --- | --- | --- |
| `super_admin` | Panel global | Gestiona instituciones clientes y el catálogo de fabricantes |
| `director` | Web (solo lectura ejecutiva) | Dashboard de salud, proyección de presupuesto, asistente IA |
| `coordinador` | Web (acceso completo a su institución) | Registra activos, crea/asigna OTs, consulta historiales, asistente IA |
| `tecnico` | PWA móvil (offline) | Acepta, ejecuta y cierra OTs con evidencia fotográfica |
| `docente` | PWA móvil (solo reporte) | Escanea QR y reporta fallas; sin login completo (acceso por enlace del QR + identificación liviana) |

## 3. Historias de usuario del PMV

Formato: cada HU tiene criterios de aceptación que son la base de los tests de aceptación. Implementar en el orden del plan de tareas (`docs/03-PLAN-DE-TAREAS.md`).

### HU-01 — Registro de activo educativo (RF01, RF02)
COMO coordinador QUIERO registrar un activo seleccionando marca y modelo desde un catálogo preconfigurado PARA que el motor genere automáticamente su plan de mantenimiento.

Criterios de aceptación:
- Catálogo con marcas/modelos comunes (Epson, HP, Dell, LG, Daikin); al seleccionar el modelo, las especificaciones se autocompletan.
- Al guardar, el plan de mantenimiento se genera vía API en menos de 5 segundos.
- El código QR queda disponible para imprimir inmediatamente.
- Se registra la ubicación (edificio, piso, aula).

### HU-02 — Reporte de falla por QR (RF03, RF04)
COMO docente QUIERO escanear el QR del equipo dañado y describir el problema en menos de un minuto PARA que el reporte llegue de inmediato al coordinador, sin apps ni WhatsApp.

Criterios de aceptación:
- El QR abre el formulario en el navegador del celular (sin tienda de apps).
- El formulario muestra nombre y ubicación del activo automáticamente.
- Permite adjuntar foto desde la cámara (se guarda en el filesystem del servidor).
- El reporte registra fecha, hora y nombre del docente.
- El coordinador recibe notificación vía WebSocket en menos de 30 segundos.

### HU-03 — Alertas automáticas de mantenimiento (RF05)
COMO coordinador QUIERO alertas automáticas cuando un mantenimiento está por vencer PARA planificar la intervención con anticipación.

Criterios de aceptación:
- Job nocturno (APScheduler) emite alerta a 15 días del vencimiento y una segunda a 5 días si no fue atendida.
- La alerta indica activo, ubicación, tipo de mantenimiento y fecha límite.
- Desde la alerta se puede generar una OT con un clic.
- Los vencidos se destacan en rojo en el dashboard.

### HU-04 — Creación y asignación de OT (RF06)
COMO coordinador QUIERO crear una orden de trabajo y asignarla a un técnico o proveedor PARA que la intervención quede formalizada y trazable.

Criterios de aceptación:
- OT creable desde un reporte de falla o desde cero (preventivo).
- Campos obligatorios: activo, tipo, descripción, prioridad, fecha límite.
- Muestra disponibilidad de técnicos antes de asignar.
- El asignado recibe notificación inmediata vía WebSocket.
- Estados: `pendiente → aceptada → en_ejecucion → cerrada` (ver diagrama de estados en arquitectura).

### HU-05 — Ejecución y cierre de OT por técnico (RF07)
COMO técnico QUIERO escanear el QR al llegar, registrar lo que hice, subir fotos y cerrar la orden desde mi celular PARA dejar constancia verificable sin papeleo.

Criterios de aceptación:
- Acceso a la OT desde el celular sin instalar apps.
- El escaneo del QR verifica que es el equipo correcto.
- Mínimo dos fotografías como evidencia.
- El cierre registra fecha/hora automáticamente.
- La PWA funciona offline (service worker + IndexedDB) y sincroniza al recuperar señal.

### HU-06 — Historial de intervenciones (RF08)
COMO coordinador QUIERO el historial completo de cualquier activo PARA tener contexto antes de intervenir y respaldo ante auditorías.

Criterios de aceptación:
- OTs ordenadas de más reciente a más antigua, con fecha, tipo, técnico, descripción y evidencias.
- Accesible desde el panel web y escaneando el QR.
- Exportable a PDF.

### HU-07 — Dashboard ejecutivo (RF09)
COMO director QUIERO ver el estado de salud de todos los activos en una pantalla PARA decidir inversiones sin revisar el detalle técnico.

Criterios de aceptación:
- Porcentaje de activos en verde / amarillo / rojo.
- Filtros por aula, categoría y criticidad.
- Vencidos y críticos destacados visualmente.
- Actualización en tiempo real vía WebSockets, sin recargar.
- Accesible desde cualquier navegador.

### HU-08 — Proyección de presupuesto (RF11)
COMO director QUIERO la proyección de costos de mantenimiento y reemplazo del año escolar en curso y el siguiente PARA presupuestar con datos.

Criterios de aceptación:
- Incluye costos de mantenimientos preventivos programados del periodo.
- Identifica activos con score bajo candidatos a reemplazo.
- Costos de referencia configurables por el coordinador.
- Exportable a PDF.
- Se actualiza automáticamente con nuevas intervenciones o activos.

### HU-09 — Score de salud por activo (RF10)
COMO coordinador QUIERO ver el score de salud de cada activo y recibir alertas de riesgo PARA priorizar según el riesgo real.

Criterios de aceptación:
- Score 0–100 calculado automáticamente.
- Cuatro factores: vida restante, mantenimientos cumplidos vs. programados, frecuencia de fallas, días desde la última intervención.
- Alerta cuando el score cae por debajo de 40.
- En el PMV el motor usa reglas fijas del catálogo (el ajuste por ML es V2).
- Desglose de factores visible por activo.

### HU-10 — Administración del SaaS (RF12)
COMO super administrador QUIERO gestionar instituciones y el catálogo de fabricantes PARA que el motor opere con datos correctos y cada institución vea solo lo suyo.

Criterios de aceptación:
- CRUD de instituciones (crear, editar, desactivar).
- Catálogo actualizable cargando PDFs de manuales (indexados en pgvector) o editando registros.
- Aislamiento total de datos entre instituciones.
- Métricas globales de uso sin acceso a datos operativos de clientes.
- Log de auditoría de cambios al catálogo (fecha, hora, usuario).

### HU-12 — Centro de notificaciones in-app (RF04 extendido)
COMO usuario autenticado (cualquier rol) QUIERO ver mis notificaciones en un panel siempre accesible y en una página de bandeja de entrada PARA no perder eventos relevantes aunque no esté conectado en el momento en que ocurren.

Criterios de aceptación:
- La campana en la barra de navegación (desktop y móvil) muestra el conteo de no leídas (badge rojo, máximo "9+").
- Al hacer clic se despliega un panel con las 5 notificaciones más recientes (no leídas primero, luego leídas), con icono semántico por tipo de evento, título, mensaje abreviado y tiempo relativo.
- La opción "Marcar todas como leídas" está disponible si hay no leídas; "Ver todas las notificaciones" navega a `/notificaciones`.
- La página `/notificaciones` muestra la bandeja completa con tabs "Todas / No leídas", secciones separadas NUEVAS / ANTERIORES y soporte para marcar leída al hacer clic en cada ítem (navega al enlace del evento).
- Los tipos de evento incluyen: `orden_asignada`, `orden_cerrada`, `prioridad_cambiada`, `fecha_limite`, `comentario`, `foto_subida`, `orden_actualizada`, `alerta_generada`, `alerta_critica`, `reporte_falla`, `reporte_disponible`, `proyeccion_actualizada`, `resumen_semanal`, `nueva_institucion`, `limite_activos`, `catalogo_actualizado`, `onboarding_completo`.
- Cada notificación almacena: `tipo`, `titulo`, `mensaje`, `fecha`, `leida`, `link` (ruta de destino), `actor` (quién generó el evento).
- El backend persiste las notificaciones en tabla `notificacion` y las emite también vía WebSocket (`evento_notificacion`) para actualización en tiempo real.

### HU-11 — Servidor MCP del asistente IA (RF13)
COMO coordinador o director QUIERO preguntar en lenguaje natural sobre mis activos a un asistente de IA PARA obtener respuestas con datos reales sin navegar los módulos.

Criterios de aceptación:
- FastMCP expone 4 herramientas: `consultar_score_activos`, `listar_ots_pendientes`, `consultar_historial_activo`, `obtener_proyeccion_presupuesto`.
- Cada herramienta exige autenticación y limita resultados al tenant del usuario.
- Solo lectura: ninguna herramienta crea, modifica ni elimina datos.
- Toda invocación queda en un log de auditoría (fecha, usuario, herramienta).

## 4. Requisitos no funcionales

- Disponibilidad ≥ 99% durante el calendario escolar.
- Reporte por QR en máximo 3 pasos.
- Funciona en navegadores móviles modernos sin instalación.
- Aislamiento multi-tenant a nivel de base de datos (`institucion_id` + filtrado obligatorio en la capa de datos).
- Evidencias en filesystem servido por Nginx, con respaldo diario externo.
- Hasta 300 activos por institución sin degradación.
- Dashboard carga en ≤ 3 segundos.
- API documentada con OpenAPI 3.1 (Swagger UI / ReDoc automáticos de FastAPI).
- Contraseñas con bcrypt; sesiones con JWT firmado + refresh token.

## 5. Fuera de alcance del PMV (NO implementar)

Multi-sede, asistente IA conversacional avanzado, herramientas MCP de escritura, integración SIAGIE, ajuste de intervalos por ML, gestión de proveedores con contratos, pagos/facturación, migración de evidencias a S3. Si una tarea parece requerir algo de esta lista, detenerse y consultar.

## 6. Métricas de éxito del PMV

- Una institución piloto registra ≥ 50 activos en su primera semana.
- 100% de los reportes de falla llegan por el sistema (cero WhatsApp) al cierre del piloto.
- Tiempo de reporte por QR ≤ 60 segundos medido de extremo a extremo.
- 100% de las HU con pruebas de aceptación superadas (hito H4).
