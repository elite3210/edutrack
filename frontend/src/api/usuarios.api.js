import { apiFetch } from '@/composables/useApi'

const BASE = '/api/v1/usuarios'

export const getUsuarios   = ()         => apiFetch(BASE)
export const createUsuario = (data)     => apiFetch(BASE, { method: 'POST', body: JSON.stringify(data) })
export const updateUsuario = (id, data) => apiFetch(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
