import { apiFetch } from '@/composables/useApi'

const BASE = '/api/v1/perfil'

export const cambiarPassword = (password_actual, password_nueva) =>
  apiFetch(`${BASE}/password`, {
    method: 'POST',
    body: JSON.stringify({ password_actual, password_nueva }),
  })

export const listarTokens  = ()        => apiFetch(`${BASE}/tokens`)
export const crearToken    = (nombre)  => apiFetch(`${BASE}/tokens`, { method: 'POST', body: JSON.stringify({ nombre }) })
export const revocarToken  = (id)      => apiFetch(`${BASE}/tokens/${id}`, { method: 'DELETE' })
