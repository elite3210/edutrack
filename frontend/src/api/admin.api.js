import { apiFetch } from '@/composables/useApi'

export const getInstituciones   = ()         => apiFetch('/api/v1/admin/instituciones')
export const createInstitucion  = (data)     => apiFetch('/api/v1/admin/instituciones', { method: 'POST', body: JSON.stringify(data) })
export const updateInstitucion  = (id, data) => apiFetch(`/api/v1/admin/instituciones/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const getCatalogo        = ()         => apiFetch('/api/v1/catalogo/modelos')
export const createModelo       = (data)     => apiFetch('/api/v1/catalogo/modelos', { method: 'POST', body: JSON.stringify(data) })
export const updateModelo       = (id, data) => apiFetch(`/api/v1/catalogo/modelos/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
