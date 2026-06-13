export const dashboardData = {
  metricas: {
    total_activos:    12,
    activos_criticos:  3,
    ots_abiertas:      4,
    alertas_pendientes: 5,
    costo_estimado_mes: 2800,
  },
  semaforo: {
    verde:    { count: 7, porcentaje: 58 },
    amarillo: { count: 2, porcentaje: 17 },
    rojo:     { count: 3, porcentaje: 25 },
  },
  heatmap: [
    { aula: '1A', edificio: 'A', score_promedio: 82, activos: 1 },
    { aula: '1B', edificio: 'A', score_promedio: 55, activos: 1 },
    { aula: '2A', edificio: 'A', score_promedio: 28, activos: 1 },
    { aula: '3A', edificio: 'B', score_promedio: 67, activos: 1 },
    { aula: 'Lab Cómputo', edificio: 'B', score_promedio: 86, activos: 2 },
    { aula: 'Sala Directivos', edificio: 'A', score_promedio: 56, activos: 2 },
    { aula: 'Secretaría', edificio: 'A', score_promedio: 61, activos: 1 },
    { aula: 'Dirección', edificio: 'A', score_promedio: 84, activos: 1 },
    { aula: 'Auditorio', edificio: 'C', score_promedio: 95, activos: 1 },
  ],
  top_criticos: [
    { id: 'a-003', nombre: 'Aire Daikin 12000 BTU', ubicacion: 'Aula 2A', score: 28 },
    { id: 'a-008', nombre: 'Aire Daikin 9000 BTU',  ubicacion: 'Sala Directivos', score: 35 },
    { id: 'a-002', nombre: 'Laptop HP EliteBook 840', ubicacion: 'Aula 1B', score: 55 },
  ],
}
