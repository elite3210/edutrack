export const modelos = [
  // Epson
  { id: 'cat-001', marca: 'Epson', modelo: 'EB-X41',    categoria: 'Proyector',    vida_util_meses: 84, especificaciones: { lumens: 3600, resolucion: 'XGA 1024x768', conectividad: 'HDMI, VGA, USB' } },
  { id: 'cat-002', marca: 'Epson', modelo: 'EB-W51',    categoria: 'Proyector',    vida_util_meses: 84, especificaciones: { lumens: 4000, resolucion: 'WXGA 1280x800', conectividad: 'HDMI, VGA, USB' } },
  { id: 'cat-003', marca: 'Epson', modelo: 'EB-L210W',  categoria: 'Proyector',    vida_util_meses: 120, especificaciones: { lumens: 4500, resolucion: 'WXGA', tipo_lampara: 'Laser' } },
  // HP
  { id: 'cat-004', marca: 'HP', modelo: 'EliteBook 840 G8',  categoria: 'Laptop', vida_util_meses: 60, especificaciones: { procesador: 'Intel Core i5-1135G7', ram: '8GB', almacenamiento: '256GB SSD' } },
  { id: 'cat-005', marca: 'HP', modelo: 'ProBook 450 G8',    categoria: 'Laptop', vida_util_meses: 60, especificaciones: { procesador: 'Intel Core i5-1135G7', ram: '8GB', almacenamiento: '512GB SSD' } },
  { id: 'cat-006', marca: 'HP', modelo: 'LaserJet Pro M404n', categoria: 'Impresora', vida_util_meses: 72, especificaciones: { tipo: 'Laser monocromo', ppm: 38, conectividad: 'Ethernet, USB' } },
  // Dell
  { id: 'cat-007', marca: 'Dell', modelo: 'Latitude 5520',   categoria: 'Laptop',  vida_util_meses: 60, especificaciones: { procesador: 'Intel Core i5-1145G7', ram: '16GB', almacenamiento: '512GB SSD' } },
  { id: 'cat-008', marca: 'Dell', modelo: 'OptiPlex 3090',   categoria: 'Desktop', vida_util_meses: 72, especificaciones: { procesador: 'Intel Core i5-10505', ram: '8GB', almacenamiento: '256GB SSD' } },
  { id: 'cat-009', marca: 'Dell', modelo: 'P2422H',          categoria: 'Monitor', vida_util_meses: 96, especificaciones: { pulgadas: 24, resolucion: '1920x1080', panel: 'IPS' } },
  // LG
  { id: 'cat-010', marca: 'LG', modelo: '27UK850-W',         categoria: 'Monitor', vida_util_meses: 96, especificaciones: { pulgadas: 27, resolucion: '3840x2160', panel: 'IPS', hdr: true } },
  { id: 'cat-011', marca: 'LG', modelo: 'OLED55C1PSA',       categoria: 'TV/Display', vida_util_meses: 120, especificaciones: { pulgadas: 55, resolucion: '4K', tipo: 'OLED' } },
  // Daikin
  { id: 'cat-012', marca: 'Daikin', modelo: 'FTXS35KVMA',   categoria: 'Aire Acondicionado', vida_util_meses: 120, especificaciones: { btu: 12000, tipo: 'Split', eficiencia: 'Inverter' } },
  { id: 'cat-013', marca: 'Daikin', modelo: 'FTXS25KVMA',   categoria: 'Aire Acondicionado', vida_util_meses: 120, especificaciones: { btu: 9000,  tipo: 'Split', eficiencia: 'Inverter' } },
  // Smart TV / Pizarras
  { id: 'cat-014', marca: 'Samsung', modelo: 'WM85A Flip 2', categoria: 'Pizarra Interactiva', vida_util_meses: 96, especificaciones: { pulgadas: 85, resolucion: '4K', touch: '20 puntos' } },
  { id: 'cat-015', marca: 'Epson', modelo: 'BrightLink 695Wi', categoria: 'Pizarra Interactiva', vida_util_meses: 84, especificaciones: { lumens: 3500, resolucion: 'WXGA', touch: 'Infrarrojo' } },
]

export const marcas = [...new Set(modelos.map(m => m.marca))]
