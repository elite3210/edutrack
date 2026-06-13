import { apiFetch } from '@/composables/useApi'

export const getAlertas    = ()   => apiFetch('/api/v1/alertas')
export const atenderAlerta = (id) => apiFetch(`/api/v1/alertas/${id}/atender`, { method: 'POST' })
