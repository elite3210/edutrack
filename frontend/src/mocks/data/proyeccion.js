// Mock de proyección anual de mantenimiento por institución.
// Items: una fila por tarea programada del catálogo aplicada a cada activo.
// Costos: valores de referencia editables por el coordinador (notas en la vista).

export const proyeccionPorAnio = {
  2026: {
    anio: 2026,
    items: [
      { activo_id: 'a-001', activo_nombre: 'Proyector Epson EB-X41',     categoria: 'Proyector',         tipo: 'Limpieza de filtro',          fecha_programada: '2026-07-10', costo: 60,  recurrencia: 'Trimestral' },
      { activo_id: 'a-001', activo_nombre: 'Proyector Epson EB-X41',     categoria: 'Proyector',         tipo: 'Revisión de lámpara',         fecha_programada: '2026-09-05', costo: 150, recurrencia: 'Semestral' },
      { activo_id: 'a-002', activo_nombre: 'Laptop HP EliteBook 840',    categoria: 'Laptop',            tipo: 'Limpieza interna',            fecha_programada: '2026-08-20', costo: 80,  recurrencia: 'Semestral' },
      { activo_id: 'a-003', activo_nombre: 'Aire Daikin 12000 BTU',      categoria: 'Aire Acondicionado',tipo: 'Limpieza de filtros',         fecha_programada: '2026-07-15', costo: 90,  recurrencia: 'Bimestral' },
      { activo_id: 'a-003', activo_nombre: 'Aire Daikin 12000 BTU',      categoria: 'Aire Acondicionado',tipo: 'Revisión de gas refrigerante', fecha_programada: '2026-09-01', costo: 220, recurrencia: 'Semestral' },
      { activo_id: 'a-004', activo_nombre: 'Monitor Dell P2422H',        categoria: 'Monitor',           tipo: 'Limpieza de pantalla',        fecha_programada: '2026-08-01', costo: 30,  recurrencia: 'Trimestral' },
      { activo_id: 'a-005', activo_nombre: 'Proyector Epson EB-W51',     categoria: 'Proyector',         tipo: 'Limpieza de filtro',          fecha_programada: '2026-06-28', costo: 60,  recurrencia: 'Trimestral' },
      { activo_id: 'a-006', activo_nombre: 'Laptop Dell Latitude 5520',  categoria: 'Laptop',            tipo: 'Cambio de pasta térmica',     fecha_programada: '2027-02-10', costo: 110, recurrencia: 'Anual' },
      { activo_id: 'a-007', activo_nombre: 'Pizarra Samsung WM85A',      categoria: 'Pizarra Interactiva', tipo: 'Calibración táctil',        fecha_programada: '2026-09-25', costo: 80,  recurrencia: 'Semestral' },
      { activo_id: 'a-008', activo_nombre: 'Aire Daikin 9000 BTU Sala',  categoria: 'Aire Acondicionado',tipo: 'Limpieza de unidad exterior', fecha_programada: '2026-08-10', costo: 120, recurrencia: 'Cuatrimestral' },
      { activo_id: 'a-009', activo_nombre: 'Impresora HP LaserJet Pro',  categoria: 'Impresora',         tipo: 'Limpieza de rodillos',        fecha_programada: '2026-08-15', costo: 70,  recurrencia: 'Trimestral' },
      { activo_id: 'a-010', activo_nombre: 'Desktop Dell OptiPlex 3090', categoria: 'Desktop',           tipo: 'Limpieza interna',            fecha_programada: '2026-09-10', costo: 80,  recurrencia: 'Semestral' },
      { activo_id: 'a-011', activo_nombre: 'Proyector Epson EB-L210W',   categoria: 'Proyector',         tipo: 'Limpieza de filtro',          fecha_programada: '2026-11-01', costo: 60,  recurrencia: 'Trimestral' },
      { activo_id: 'a-012', activo_nombre: 'Monitor LG 27UK850',         categoria: 'Monitor',           tipo: 'Calibración de color',        fecha_programada: '2027-03-20', costo: 50,  recurrencia: 'Anual' },
    ],
    estimado_correctivos: 1850, // estimado por histórico ~15% del total preventivo + buffer
    candidatos_reemplazo: [
      {
        activo_id: 'a-003',
        activo_nombre: 'Aire Daikin 12000 BTU',
        ubicacion: 'Aula 2A',
        score: 28,
        vida_util_restante: 12,  // %
        antiguedad_meses: 76,
        motivo: 'Score crítico (28/100) y solo 12% de vida útil restante. Costo de correctivos del último año supera 60% del valor de reemplazo.',
        costo_reemplazo_referencial: 2800,
      },
      {
        activo_id: 'a-008',
        activo_nombre: 'Aire Daikin 9000 BTU Sala',
        ubicacion: 'Sala Directivos',
        score: 35,
        vida_util_restante: 18,
        antiguedad_meses: 78,
        motivo: 'Score bajo (35/100) y 18% de vida útil restante. 3 correctivos en los últimos 6 meses.',
        costo_reemplazo_referencial: 2400,
      },
    ],
  },
  2027: {
    anio: 2027,
    items: [
      { activo_id: 'a-001', activo_nombre: 'Proyector Epson EB-X41',     categoria: 'Proyector',         tipo: 'Calibración óptica',          fecha_programada: '2027-03-15', costo: 120, recurrencia: 'Anual' },
      { activo_id: 'a-002', activo_nombre: 'Laptop HP EliteBook 840',    categoria: 'Laptop',            tipo: 'Cambio de pasta térmica',     fecha_programada: '2027-02-10', costo: 110, recurrencia: 'Anual' },
      { activo_id: 'a-006', activo_nombre: 'Laptop Dell Latitude 5520',  categoria: 'Laptop',            tipo: 'Cambio de pasta térmica',     fecha_programada: '2027-02-10', costo: 110, recurrencia: 'Anual' },
      { activo_id: 'a-012', activo_nombre: 'Monitor LG 27UK850',         categoria: 'Monitor',           tipo: 'Calibración de color',        fecha_programada: '2027-03-20', costo: 50,  recurrencia: 'Anual' },
    ],
    estimado_correctivos: 950,
    candidatos_reemplazo: [],
  },
}
