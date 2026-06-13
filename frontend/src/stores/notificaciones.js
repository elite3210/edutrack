import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificacionesStore = defineStore('notificaciones', () => {
  const queue = ref([])

  function agregar(evento) {
    queue.value.unshift({ ...evento, id: Date.now(), leida: false })
  }

  function marcarLeida(id) {
    const n = queue.value.find(n => n.id === id)
    if (n) n.leida = true
  }

  function limpiar() {
    queue.value = []
  }

  const noLeidas = ref(0)

  return { queue, noLeidas, agregar, marcarLeida, limpiar }
})
