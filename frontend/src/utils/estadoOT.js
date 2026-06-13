const estadoMap = {
  pendiente:    { label: 'Pendiente',     variant: 'warning',     icon: '⏳' },
  aceptada:     { label: 'Aceptada',      variant: 'info',        icon: '✓' },
  en_ejecucion: { label: 'En ejecución',  variant: 'in-progress', icon: '🔧' },
  cerrada:      { label: 'Cerrada',       variant: 'success',     icon: '✅' },
  reasignada:   { label: 'Reasignada',    variant: 'warning',     icon: '↩' },
}

export function getEstado(estado) {
  return estadoMap[estado] ?? { label: estado, variant: 'default', icon: '' }
}
