import { apiFetch } from '@/composables/useApi'

export const getMarcas  = ()      => apiFetch('/api/v1/catalogo/marcas')
export const getModelos = (marca) => apiFetch(`/api/v1/catalogo/modelos?marca=${encodeURIComponent(marca)}`)
