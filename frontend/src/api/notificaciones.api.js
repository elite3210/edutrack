import { apiFetch } from '@/composables/useApi'

export const getNotificaciones = ()   => apiFetch('/api/v1/notificaciones')
export const marcarLeida       = (id) => apiFetch(`/api/v1/notificaciones/${id}/leer`, { method: 'POST' })
export const marcarTodasLeidas = ()   => apiFetch('/api/v1/notificaciones/leer-todas', { method: 'POST' })
