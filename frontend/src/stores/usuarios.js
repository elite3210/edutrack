import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/usuarios.api'

export const useUsuariosStore = defineStore('usuarios', () => {
  const list    = ref([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try { list.value = await api.getUsuarios() }
    finally { loading.value = false }
  }

  async function create(data) {
    const nuevo = await api.createUsuario(data)
    list.value.unshift(nuevo)
    return nuevo
  }

  async function update(id, data) {
    const actualizado = await api.updateUsuario(id, data)
    const idx = list.value.findIndex(u => u.id === id)
    if (idx !== -1) list.value[idx] = actualizado
    return actualizado
  }

  return { list, loading, fetchAll, create, update }
})
