import { apiFetch } from '@/composables/useApi'

export const getActivoByQr  = (codigo) => apiFetch(`/api/v1/qr/${codigo}`)
export const createReporte  = (data)   => apiFetch('/api/v1/reportes', { method: 'POST', body: JSON.stringify(data) })
