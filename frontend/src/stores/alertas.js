import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '@/api/alertas.api'

export const useAlertasStore = defineStore('alertas', () => {
  const list    = ref([])
  const loading = ref(false)

  const pendientes  = computed(() => list.value.filter(a => !a.atendida))
  const totalPendientes = computed(() => pendientes.value.length)

  async function fetchAll() {
    loading.value = true
    try { list.value = await api.getAlertas() }
    finally { loading.value = false }
  }

  async function atender(id) {
    await api.atenderAlerta(id)
    const idx = list.value.findIndex(a => a.id === id)
    if (idx !== -1) list.value[idx].atendida = true
  }

  return { list, loading, pendientes, totalPendientes, fetchAll, atender }
})
