import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/dashboard.api'

export const useDashboardStore = defineStore('dashboard', () => {
  const metricas = ref(null)
  const semaforo = ref({ verde: 0, amarillo: 0, rojo: 0 })
  const heatmap  = ref([])
  const loading  = ref(false)

  async function fetchDashboard() {
    loading.value = true
    try {
      const data     = await api.getDashboard()
      metricas.value = data.metricas
      semaforo.value = data.semaforo
      heatmap.value  = data.heatmap
    } finally {
      loading.value = false
    }
  }

  return { metricas, semaforo, heatmap, loading, fetchDashboard }
})
