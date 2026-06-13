export const activos = [
  { id: 'a-001', codigo_qr: 'QR-001', nombre: 'Proyector Epson EB-X41',      marca: 'Epson',   modelo: 'EB-X41',           categoria: 'Proyector',    ubicacion: 'Edificio A · Piso 1 · Aula 1A', fecha_instalacion: '2022-03-15', estado: 'operativo',    score: 82, institucion_id: 'inst-001' },
  { id: 'a-002', codigo_qr: 'QR-002', nombre: 'Laptop HP EliteBook 840',      marca: 'HP',      modelo: 'EliteBook 840 G8', categoria: 'Laptop',       ubicacion: 'Edificio A · Piso 1 · Aula 1B', fecha_instalacion: '2021-08-10', estado: 'operativo',    score: 55, institucion_id: 'inst-001' },
  { id: 'a-003', codigo_qr: 'QR-003', nombre: 'Aire Daikin 12000 BTU',        marca: 'Daikin',  modelo: 'FTXS35KVMA',       categoria: 'Aire Acondicionado', ubicacion: 'Edificio A · Piso 2 · Aula 2A', fecha_instalacion: '2020-01-20', estado: 'en_mantenimiento', score: 28, institucion_id: 'inst-001' },
  { id: 'a-004', codigo_qr: 'QR-004', nombre: 'Monitor Dell P2422H',          marca: 'Dell',    modelo: 'P2422H',           categoria: 'Monitor',      ubicacion: 'Edificio B · Piso 1 · Lab Cómputo', fecha_instalacion: '2022-11-05', estado: 'operativo', score: 91, institucion_id: 'inst-001' },
  { id: 'a-005', codigo_qr: 'QR-005', nombre: 'Proyector Epson EB-W51',       marca: 'Epson',   modelo: 'EB-W51',           categoria: 'Proyector',    ubicacion: 'Edificio B · Piso 2 · Aula 3A', fecha_instalacion: '2021-04-12', estado: 'operativo',    score: 67, institucion_id: 'inst-001' },
  { id: 'a-006', codigo_qr: 'QR-006', nombre: 'Laptop Dell Latitude 5520',    marca: 'Dell',    modelo: 'Latitude 5520',    categoria: 'Laptop',       ubicacion: 'Edificio B · Piso 1 · Lab Cómputo', fecha_instalacion: '2023-02-28', estado: 'operativo', score: 88, institucion_id: 'inst-001' },
  { id: 'a-007', codigo_qr: 'QR-007', nombre: 'Pizarra Samsung WM85A',        marca: 'Samsung', modelo: 'WM85A Flip 2',     categoria: 'Pizarra Interactiva', ubicacion: 'Edificio A · Piso 3 · Sala Directivos', fecha_instalacion: '2022-07-18', estado: 'operativo', score: 76, institucion_id: 'inst-001' },
  { id: 'a-008', codigo_qr: 'QR-008', nombre: 'Aire Daikin 9000 BTU Sala',    marca: 'Daikin',  modelo: 'FTXS25KVMA',       categoria: 'Aire Acondicionado', ubicacion: 'Edificio A · Piso 3 · Sala Directivos', fecha_instalacion: '2019-11-30', estado: 'operativo', score: 35, institucion_id: 'inst-001' },
  { id: 'a-009', codigo_qr: 'QR-009', nombre: 'Impresora HP LaserJet Pro',     marca: 'HP',      modelo: 'LaserJet Pro M404n', categoria: 'Impresora',  ubicacion: 'Edificio A · Piso 1 · Secretaría', fecha_instalacion: '2021-01-15', estado: 'operativo',    score: 61, institucion_id: 'inst-001' },
  { id: 'a-010', codigo_qr: 'QR-010', nombre: 'Desktop Dell OptiPlex 3090',   marca: 'Dell',    modelo: 'OptiPlex 3090',    categoria: 'Desktop',      ubicacion: 'Edificio B · Piso 1 · Lab Cómputo', fecha_instalacion: '2022-05-20', estado: 'operativo', score: 79, institucion_id: 'inst-001' },
  { id: 'a-011', codigo_qr: 'QR-011', nombre: 'Proyector Epson EB-L210W',     marca: 'Epson',   modelo: 'EB-L210W',         categoria: 'Proyector',    ubicacion: 'Edificio C · Piso 1 · Auditorio',   fecha_instalacion: '2023-08-01', estado: 'operativo',    score: 95, institucion_id: 'inst-001' },
  { id: 'a-012', codigo_qr: 'QR-012', nombre: 'Monitor LG 27UK850',           marca: 'LG',      modelo: '27UK850-W',        categoria: 'Monitor',      ubicacion: 'Edificio A · Piso 1 · Dirección',   fecha_instalacion: '2022-09-10', estado: 'operativo',    score: 84, institucion_id: 'inst-001' },
]

export const historial = {
  'a-001': [
    { id: 'h-001', fecha: '2026-03-10', tipo: 'Preventivo', tecnico: 'Luis Quispe', descripcion: 'Limpieza de filtro y ajuste de lente. Equipo operativo.', evidencias: [] },
    { id: 'h-002', fecha: '2025-09-05', tipo: 'Correctivo', tecnico: 'Luis Quispe', descripcion: 'Reemplazo de lámpara. Score mejoró de 45 a 82.', evidencias: [] },
  ],
  'a-003': [
    { id: 'h-003', fecha: '2026-01-15', tipo: 'Preventivo', tecnico: 'Luis Quispe', descripcion: 'Limpieza de filtros y revisión de gas refrigerante.', evidencias: [] },
  ],
}
