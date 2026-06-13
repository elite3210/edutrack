// Catálogo central de fabricantes: modelos con especificaciones,
// reglas de mantenimiento preventivo y referencia al manual PDF.

export const modelos = [
  // Epson
  {
    id: 'cat-001', marca: 'Epson', modelo: 'EB-X41', categoria: 'Proyector', vida_util_meses: 84,
    especificaciones: { lumens: 3600, resolucion: 'XGA 1024x768', conectividad: 'HDMI, VGA, USB' },
    reglas: [
      { id: 'r-1', tarea: 'Limpieza de filtro',     intervalo_dias:  90 },
      { id: 'r-2', tarea: 'Revisión de lámpara',    intervalo_dias: 180 },
      { id: 'r-3', tarea: 'Calibración óptica',     intervalo_dias: 365 },
    ],
    manual_pdf: { nombre: 'epson-eb-x41-manual.pdf', indexado: true, paginas: 142 },
  },
  {
    id: 'cat-002', marca: 'Epson', modelo: 'EB-W51', categoria: 'Proyector', vida_util_meses: 84,
    especificaciones: { lumens: 4000, resolucion: 'WXGA 1280x800', conectividad: 'HDMI, VGA, USB' },
    reglas: [
      { id: 'r-1', tarea: 'Limpieza de filtro',  intervalo_dias:  90 },
      { id: 'r-2', tarea: 'Revisión de lámpara', intervalo_dias: 180 },
    ],
    manual_pdf: { nombre: 'epson-eb-w51-manual.pdf', indexado: true, paginas: 138 },
  },
  {
    id: 'cat-003', marca: 'Epson', modelo: 'EB-L210W', categoria: 'Proyector', vida_util_meses: 120,
    especificaciones: { lumens: 4500, resolucion: 'WXGA', tipo_lampara: 'Laser' },
    reglas: [
      { id: 'r-1', tarea: 'Limpieza de filtro',         intervalo_dias:  90 },
      { id: 'r-2', tarea: 'Verificación de fuente láser', intervalo_dias: 365 },
    ],
    manual_pdf: { nombre: null, indexado: false },
  },
  // HP
  {
    id: 'cat-004', marca: 'HP', modelo: 'EliteBook 840 G8', categoria: 'Laptop', vida_util_meses: 60,
    especificaciones: { procesador: 'Intel Core i5-1135G7', ram: '8GB', almacenamiento: '256GB SSD' },
    reglas: [
      { id: 'r-1', tarea: 'Limpieza interna',          intervalo_dias: 180 },
      { id: 'r-2', tarea: 'Cambio de pasta térmica',    intervalo_dias: 365 },
      { id: 'r-3', tarea: 'Actualización de firmware',  intervalo_dias: 365 },
    ],
    manual_pdf: { nombre: 'hp-elitebook-840-g8.pdf', indexado: true, paginas: 218 },
  },
  {
    id: 'cat-005', marca: 'HP', modelo: 'ProBook 450 G8', categoria: 'Laptop', vida_util_meses: 60,
    especificaciones: { procesador: 'Intel Core i5-1135G7', ram: '8GB', almacenamiento: '512GB SSD' },
    reglas: [
      { id: 'r-1', tarea: 'Limpieza interna',         intervalo_dias: 180 },
      { id: 'r-2', tarea: 'Cambio de pasta térmica',   intervalo_dias: 365 },
    ],
    manual_pdf: { nombre: null, indexado: false },
  },
  {
    id: 'cat-006', marca: 'HP', modelo: 'LaserJet Pro M404n', categoria: 'Impresora', vida_util_meses: 72,
    especificaciones: { tipo: 'Laser monocromo', ppm: 38, conectividad: 'Ethernet, USB' },
    reglas: [
      { id: 'r-1', tarea: 'Limpieza de rodillos', intervalo_dias:  90 },
      { id: 'r-2', tarea: 'Reemplazo de tóner',   intervalo_dias: 180 },
    ],
    manual_pdf: { nombre: 'hp-laserjet-m404n.pdf', indexado: true, paginas: 96 },
  },
  // Dell
  {
    id: 'cat-007', marca: 'Dell', modelo: 'Latitude 5520', categoria: 'Laptop', vida_util_meses: 60,
    especificaciones: { procesador: 'Intel Core i5-1145G7', ram: '16GB', almacenamiento: '512GB SSD' },
    reglas: [
      { id: 'r-1', tarea: 'Limpieza interna',       intervalo_dias: 180 },
      { id: 'r-2', tarea: 'Cambio de pasta térmica', intervalo_dias: 365 },
    ],
    manual_pdf: { nombre: 'dell-latitude-5520.pdf', indexado: true, paginas: 184 },
  },
  {
    id: 'cat-008', marca: 'Dell', modelo: 'OptiPlex 3090', categoria: 'Desktop', vida_util_meses: 72,
    especificaciones: { procesador: 'Intel Core i5-10505', ram: '8GB', almacenamiento: '256GB SSD' },
    reglas: [
      { id: 'r-1', tarea: 'Limpieza interna',        intervalo_dias: 180 },
      { id: 'r-2', tarea: 'Actualización del sistema', intervalo_dias:  90 },
    ],
    manual_pdf: { nombre: null, indexado: false },
  },
  {
    id: 'cat-009', marca: 'Dell', modelo: 'P2422H', categoria: 'Monitor', vida_util_meses: 96,
    especificaciones: { pulgadas: 24, resolucion: '1920x1080', panel: 'IPS' },
    reglas: [
      { id: 'r-1', tarea: 'Limpieza de pantalla', intervalo_dias:  90 },
    ],
    manual_pdf: { nombre: null, indexado: false },
  },
  // LG
  {
    id: 'cat-010', marca: 'LG', modelo: '27UK850-W', categoria: 'Monitor', vida_util_meses: 96,
    especificaciones: { pulgadas: 27, resolucion: '3840x2160', panel: 'IPS', hdr: true },
    reglas: [
      { id: 'r-1', tarea: 'Limpieza de pantalla', intervalo_dias:  90 },
      { id: 'r-2', tarea: 'Calibración de color', intervalo_dias: 365 },
    ],
    manual_pdf: { nombre: null, indexado: false },
  },
  {
    id: 'cat-011', marca: 'LG', modelo: 'OLED55C1PSA', categoria: 'TV/Display', vida_util_meses: 120,
    especificaciones: { pulgadas: 55, resolucion: '4K', tipo: 'OLED' },
    reglas: [
      { id: 'r-1', tarea: 'Limpieza de pantalla', intervalo_dias:  60 },
      { id: 'r-2', tarea: 'Pixel refresh',         intervalo_dias: 180 },
    ],
    manual_pdf: { nombre: null, indexado: false },
  },
  // Daikin
  {
    id: 'cat-012', marca: 'Daikin', modelo: 'FTXS35KVMA', categoria: 'Aire Acondicionado', vida_util_meses: 120,
    especificaciones: { btu: 12000, tipo: 'Split', eficiencia: 'Inverter' },
    reglas: [
      { id: 'r-1', tarea: 'Limpieza de filtros',           intervalo_dias:  60 },
      { id: 'r-2', tarea: 'Revisión de gas refrigerante',  intervalo_dias: 180 },
      { id: 'r-3', tarea: 'Limpieza de unidad exterior',   intervalo_dias: 120 },
    ],
    manual_pdf: { nombre: 'daikin-ftxs35-manual.pdf', indexado: true, paginas: 64 },
  },
  {
    id: 'cat-013', marca: 'Daikin', modelo: 'FTXS25KVMA', categoria: 'Aire Acondicionado', vida_util_meses: 120,
    especificaciones: { btu: 9000, tipo: 'Split', eficiencia: 'Inverter' },
    reglas: [
      { id: 'r-1', tarea: 'Limpieza de filtros',           intervalo_dias:  60 },
      { id: 'r-2', tarea: 'Revisión de gas refrigerante',  intervalo_dias: 180 },
    ],
    manual_pdf: { nombre: 'daikin-ftxs25-manual.pdf', indexado: true, paginas: 62 },
  },
  // Pizarras
  {
    id: 'cat-014', marca: 'Samsung', modelo: 'WM85A Flip 2', categoria: 'Pizarra Interactiva', vida_util_meses: 96,
    especificaciones: { pulgadas: 85, resolucion: '4K', touch: '20 puntos' },
    reglas: [
      { id: 'r-1', tarea: 'Calibración táctil',     intervalo_dias: 180 },
      { id: 'r-2', tarea: 'Limpieza de superficie',  intervalo_dias:  90 },
    ],
    manual_pdf: { nombre: null, indexado: false },
  },
  {
    id: 'cat-015', marca: 'Epson', modelo: 'BrightLink 695Wi', categoria: 'Pizarra Interactiva', vida_util_meses: 84,
    especificaciones: { lumens: 3500, resolucion: 'WXGA', touch: 'Infrarrojo' },
    reglas: [
      { id: 'r-1', tarea: 'Calibración táctil',  intervalo_dias: 180 },
      { id: 'r-2', tarea: 'Limpieza de filtro',  intervalo_dias:  90 },
    ],
    manual_pdf: { nombre: null, indexado: false },
  },
]

export const marcas = [...new Set(modelos.map(m => m.marca))]

export const categorias = [...new Set(modelos.map(m => m.categoria))]
