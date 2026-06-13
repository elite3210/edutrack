import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  FlagIcon,
  CalendarDaysIcon,
  PhotoIcon,
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon,
  FireIcon,
  BellAlertIcon,
  ChartBarIcon,
  BuildingOffice2Icon,
  Squares2X2Icon,
} from '@heroicons/vue/24/outline'

// color values: 'primary' | 'success' | 'warning' | 'danger' | 'info'
const META = {
  orden_asignada:        { icon: ClipboardDocumentListIcon, color: 'primary' },
  orden_actualizada:     { icon: ClipboardDocumentListIcon, color: 'info' },
  orden_cerrada:         { icon: CheckCircleIcon,           color: 'success' },
  prioridad_cambiada:    { icon: FlagIcon,                  color: 'warning' },
  fecha_limite:          { icon: CalendarDaysIcon,          color: 'info' },
  foto_subida:           { icon: PhotoIcon,                 color: 'primary' },
  comentario:            { icon: ChatBubbleLeftIcon,        color: 'info' },
  alerta_generada:       { icon: ExclamationTriangleIcon,   color: 'warning' },
  alerta_critica:        { icon: FireIcon,                  color: 'danger' },
  reporte_falla:         { icon: BellAlertIcon,             color: 'warning' },
  reporte_disponible:    { icon: ChartBarIcon,              color: 'success' },
  proyeccion_actualizada:{ icon: ChartBarIcon,              color: 'primary' },
  resumen_semanal:       { icon: ChartBarIcon,              color: 'success' },
  nueva_institucion:     { icon: BuildingOffice2Icon,       color: 'primary' },
  limite_activos:        { icon: ExclamationTriangleIcon,   color: 'warning' },
  catalogo_actualizado:  { icon: Squares2X2Icon,            color: 'info' },
  onboarding_completo:   { icon: CheckCircleIcon,           color: 'success' },
}

const DEFAULT = { icon: BellAlertIcon, color: 'primary' }

export function getNotifMeta(tipo) {
  return META[tipo] ?? DEFAULT
}
