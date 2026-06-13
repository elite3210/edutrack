import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/activos.api'

export const useActivosStore = defineStore('activos', () => {
  const list    = ref([])
  const current = ref(null)
  const loading = ref(false)
  const error   = ref(null)

  async function fetchAll(filters = {}) {
    loading.value = true
    error.value   = null
    try { list.value = await api.getActivos(filters) }
    catch (e) { error.value = e.message }
    finally { loading.value = false }
  }

  async function fetchOne(id) {
    loading.value = true
    error.value   = null
    try { current.value = await api.getActivo(id) }
    catch (e) { error.value = e.message }
    finally { loading.value = false }
  }

  async function create(data) {
    const nuevo = await api.createActivo(data)
    list.value.unshift(nuevo)
    return nuevo
  }

  async function update(id, data) {
    const actualizado = await api.updateActivo(id, data)
    const idx = list.value.findIndex(a => a.id === id)
    if (idx !== -1) list.value[idx] = actualizado
    if (current.value?.id === id) current.value = actualizado
    return actualizado
  }

  return { list, current, loading, error, fetchAll, fetchOne, create, update }
})
