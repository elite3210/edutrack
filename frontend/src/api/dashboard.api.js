import { apiFetch } from '@/composables/useApi'

export const getDashboard = () => apiFetch('/api/v1/dashboard')
