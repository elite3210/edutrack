import { apiFetch } from '@/composables/useApi'

const BASE = '/api/v1/ordenes'

export const getOrdenes    = (filters = {}) => apiFetch(`${BASE}?${new URLSearchParams(filters)}`)
export const getOrden      = (id)           => apiFetch(`${BASE}/${id}`)
export const createOrden   = (data)         => apiFetch(BASE, { method: 'POST', body: JSON.stringify(data) })
export const updateEstado  = (id, estado, datos = {}) => apiFetch(`${BASE}/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado, ...datos }) })
export const updateOrden   = (id, data)       => apiFetch(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const subirEvidencia = (id, formData) => apiFetch(`${BASE}/${id}/evidencias`, { method: 'POST', body: formData, headers: {} })
