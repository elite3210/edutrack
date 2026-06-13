import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/catalogo.api'

export const useCatalogoStore = defineStore('catalogo', () => {
  const marcas  = ref([])
  const modelos = ref([])
  const loading = ref(false)

  async function fetchMarcas() {
    loading.value = true
    try { marcas.value = await api.getMarcas() }
    finally { loading.value = false }
  }

  async function fetchModelosByMarca(marca) {
    loading.value = true
    try { modelos.value = await api.getModelos(marca) }
    finally { loading.value = false }
  }

  return { marcas, modelos, loading, fetchMarcas, fetchModelosByMarca }
})
