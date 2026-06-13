import { apiFetch } from '@/composables/useApi'

export const login  = (email, password) => apiFetch('/api/v1/auth/login',   { method: 'POST', body: JSON.stringify({ email, password }) })
export const refresh = (token)          => apiFetch('/api/v1/auth/refresh',  { method: 'POST', body: JSON.stringify({ refresh_token: token }) })
