import { apiFetch } from '@/composables/useApi'

const BASE = '/api/v1/activos'

export const getActivos   = (filters = {}) => apiFetch(`${BASE}?${new URLSearchParams(filters)}`)
export const getActivo    = (id)           => apiFetch(`${BASE}/${id}`)
export const createActivo = (data)         => apiFetch(BASE, { method: 'POST', body: JSON.stringify(data) })
export const updateActivo = (id, data)     => apiFetch(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const getScore     = (id)           => apiFetch(`${BASE}/${id}/score`)
export const getHistorial = (id)           => apiFetch(`${BASE}/${id}/historial`)
export const getPlan      = (id)           => apiFetch(`${BASE}/${id}/plan`)
export const getQr        = (id)           => apiFetch(`${BASE}/${id}/qr`)
