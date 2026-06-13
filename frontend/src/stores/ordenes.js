import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/ordenes.api'

export const useOrdenesStore = defineStore('ordenes', () => {
  const list    = ref([])
  const current = ref(null)
  const loading = ref(false)

  async function fetchAll(filters = {}) {
    loading.value = true
    try { list.value = await api.getOrdenes(filters) }
    finally { loading.value = false }
  }

  async function fetchOne(id) {
    loading.value = true
    try { current.value = await api.getOrden(id) }
    finally { loading.value = false }
  }

  async function create(data) {
    const nueva = await api.createOrden(data)
    list.value.unshift(nueva)
    return nueva
  }

  async function updateEstado(id, estado, datos = {}) {
    const actualizada = await api.updateEstado(id, estado, datos)
    const idx = list.value.findIndex(o => o.id === id)
    if (idx !== -1) list.value[idx] = actualizada
    if (current.value?.id === id) current.value = actualizada
    return actualizada
  }

  async function update(id, data) {
    const actualizada = await api.updateOrden(id, data)
    const idx = list.value.findIndex(o => o.id === id)
    if (idx !== -1) list.value[idx] = actualizada
    if (current.value?.id === id) current.value = actualizada
    return actualizada
  }

  return { list, current, loading, fetchAll, fetchOne, create, updateEstado, update }
})
