import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '@/api/notificaciones.api'

export const useNotificationsStore = defineStore('notifications', () => {
  const list    = ref([])
  const loading = ref(false)

  const noLeidas      = computed(() => list.value.filter(n => !n.leida))
  const totalNoLeidas = computed(() => noLeidas.value.length)

  async function fetchAll() {
    loading.value = true
    try { list.value = await api.getNotificaciones() }
    finally { loading.value = false }
  }

  async function marcarLeida(id) {
    await api.marcarLeida(id)
    const n = list.value.find(n => n.id === id)
    if (n) n.leida = true
  }

  async function marcarTodasLeidas() {
    await api.marcarTodasLeidas()
    list.value.forEach(n => { n.leida = true })
  }

  return { list, loading, noLeidas, totalNoLeidas, fetchAll, marcarLeida, marcarTodasLeidas }
})
