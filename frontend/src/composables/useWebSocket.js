import { ref, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificacionesStore } from '@/stores/notificaciones'

export function useWebSocket() {
  const auth    = useAuthStore()
  const notifs  = useNotificacionesStore()
  const connected = ref(false)
  let ws = null
  let retryDelay = 1000

  function connect() {
    if (!auth.token) return

    const url = `${import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000'}/ws/notificaciones?token=${auth.token}`
    ws = new WebSocket(url)

    ws.onopen = () => {
      connected.value = true
      retryDelay = 1000
    }

    ws.onmessage = (e) => {
      try {
        const evento = JSON.parse(e.data)
        notifs.agregar(evento)
      } catch { /* ignorar mensajes malformados */ }
    }

    ws.onclose = () => {
      connected.value = false
      // Reconexión exponencial (máx 30s)
      setTimeout(connect, Math.min(retryDelay, 30000))
      retryDelay *= 2
    }

    ws.onerror = () => ws.close()
  }

  function disconnect() {
    ws?.close()
  }

  onUnmounted(disconnect)

  return { connected, connect, disconnect }
}
