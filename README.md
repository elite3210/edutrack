# EduTrack AI

> Plataforma SaaS de gestión inteligente del ciclo de vida de activos tecnológicos para instituciones educativas privadas del Perú.

**Stack tecnológico:** Python 3.12 · FastAPI · PostgreSQL 16 · SQLAlchemy 2.0 · Alembic · OpenAPI · MCP (FastMCP) · Vue.js (PWA) · Docker · Nginx

---

## Tabla de contenido

- [Introducción](#introducción)
- [1. Concepción de la idea y alcance](#1-concepción-de-la-idea-y-alcance)
- [2. Objetivos del proyecto](#2-objetivos-del-proyecto)
- [3. Evaluación del impacto e importancia](#3-evaluación-del-impacto-e-importancia)
- [4. Antecedentes del problema](#4-antecedentes-del-problema)
- [5. Estado del arte](#5-estado-del-arte)
- [6. Análisis del entorno](#6-análisis-del-entorno)
- [7. Grado de innovación y ventaja comparativa](#7-grado-de-innovación-y-ventaja-comparativa)
- [8. Obtención y especificación de requisitos de software](#8-obtención-y-especificación-de-requisitos-de-software)
- [9. Arquitectura de la solución](#9-arquitectura-de-la-solución)
- [10. Producto mínimo viable](#10-producto-mínimo-viable)
- [11. Planificación inicial](#11-planificación-inicial)
- [12. Listado de recursos](#12-listado-de-recursos)
- [Conclusiones](#conclusiones)
- [Referencias bibliográficas](#referencias-bibliográficas)

---

## Introducción

La gestión de activos tecnológicos en instituciones educativas privadas del Perú enfrenta un problema estructural que afecta directamente la continuidad del proceso académico. Según datos del Ministerio de Educación, Lima Metropolitana concentra más de 5,600 colegios privados, ninguno de los cuales cuenta con un sistema especializado para gestionar el ciclo de vida de sus equipos tecnológicos y de infraestructura. La ausencia de herramientas adecuadas obliga a estas instituciones a operar de forma reactiva, atendiendo las fallas una vez que ya ocurrieron, sin historial de intervenciones, sin trazabilidad y sin capacidad de planificar el presupuesto de mantenimiento con anticipación.

Frente a este problema, el presente documento propone EduTrack AI, una plataforma SaaS web y móvil que permite a las instituciones educativas registrar sus activos tecnológicos y de infraestructura, y obtener de forma automática un plan de mantenimiento basado en los manuales reales de los fabricantes. Un motor de inteligencia artificial denominado Lifecycle Intelligence Engine monitorea el ciclo de vida de cada equipo, calcula su estado de salud en tiempo real, anticipa fallas antes de que ocurran y proyecta el presupuesto de mantenimiento por periodo académico. La plataforma está diseñada específicamente para el contexto educativo peruano, con un modelo de precios accesible y un catálogo de activos preconfigurado que elimina la barrera de adopción que presentan los sistemas genéricos disponibles en el mercado internacional.

Este documento desarrolla la concepción completa del proyecto. Se presenta la idea y su alcance, los objetivos que persigue, la evaluación del impacto e importancia de la solución, los antecedentes del problema con fuentes objetivas que acreditan su existencia, el estado del arte, el análisis del entorno, el grado de innovación, los requisitos de software expresados como historias de usuario en el marco de Scrum, la arquitectura de la solución, el producto mínimo viable que guiará la primera entrega, la planificación inicial y el listado de recursos necesarios para su construcción.

## 1. Concepción de la idea y alcance

### 1.1 Descripción general de la solución

EduTrack AI es una plataforma SaaS (Software as a Service) de gestión inteligente de activos educativos orientada a colegios e institutos privados en el Perú. La plataforma combina un catálogo de activos preconfigurado con información técnica real de fabricantes con un Lifecycle Intelligence Engine, un motor de inteligencia artificial que calcula el plan de mantenimiento de cada equipo registrado, monitorea su ciclo de vida, anticipa fallas y proyecta el presupuesto de mantenimiento por periodo académico.

El sistema opera en dos interfaces complementarias: un panel web para directores, coordinadores de infraestructura y técnicos, y una interfaz móvil optimizada para el reporte rápido de fallas por parte de docentes mediante escaneo de código QR desde el navegador del celular, sin necesidad de instalar ninguna aplicación adicional.

### 1.2 Problema que resuelve

EduTrack AI resuelve la ausencia de visibilidad real sobre el estado de los activos tecnológicos y de infraestructura en instituciones educativas privadas. Sin un sistema estructurado, las fallas se atienden de forma reactiva, los presupuestos de mantenimiento se definen sin datos confiables y los equipos se reemplazan cuando ya dejaron de funcionar, no cuando el análisis de su ciclo de vida indica que es el momento óptimo para hacerlo.

### 1.3 Alcance del sistema

La versión inicial del sistema, correspondiente al Producto Mínimo Viable, contempla las siguientes funcionalidades:

- Registro de activos educativos con generación automática del plan de mantenimiento basado en especificaciones del fabricante.
- Reporte de fallas por parte del docente mediante escaneo de código QR desde el celular.
- Generación y asignación de órdenes de trabajo hacia técnicos internos o proveedores externos.
- Captura de evidencia fotográfica y cierre digital de intervenciones por el técnico de campo.
- Dashboard de estado de salud de activos con indicadores por equipo, aula y categoría.
- Proyección de presupuesto de mantenimiento y reemplazo para el año escolar.
- Historial completo de intervenciones por activo.
- Servidor MCP (Model Context Protocol) que expone las herramientas de consulta del sistema al asistente de inteligencia artificial.

Quedan fuera del alcance del PMV la integración con sistemas de matrícula como SIAGIE, la gestión financiera del colegio, el módulo de múltiples sedes y la incorporación de activos fuera del rango tecnológico y HVAC básico. Estas funcionalidades forman parte de la hoja de ruta de escalabilidad del producto en versiones posteriores.
