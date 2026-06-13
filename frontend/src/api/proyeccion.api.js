import { apiFetch } from '@/composables/useApi'

export const getProyeccion = (anio) => apiFetch(`/api/v1/proyeccion?anio=${anio}`)
