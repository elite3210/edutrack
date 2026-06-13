import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/dashboard.api'

export const useDashboardStore = defineStore('dashboard', () => {
  const metricas    = ref(null)
  const semaforo    = ref({ verde: {}, amarillo: {}, rojo: {} })
  const heatmap     = ref([])
  const topCriticos = ref([])
  const categorias  = ref([])
  const loading     = ref(false)

  async function fetchDashboard() {
    loading.value = true
    try {
      const data         = await api.getDashboard()
      metricas.value     = data.metricas
      semaforo.value     = data.semaforo
      heatmap.value      = data.heatmap
      topCriticos.value  = data.top_criticos ?? []
      categorias.value   = data.categorias  ?? []
    } finally {
      loading.value = false
    }
  }

  return { metricas, semaforo, heatmap, topCriticos, categorias, loading, fetchDashboard }
})
