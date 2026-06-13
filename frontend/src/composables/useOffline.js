import { ref, onMounted, onUnmounted } from 'vue'
import { openDB } from 'idb'

const DB_NAME    = 'edutrack-offline'
const STORE_NAME = 'pending-ops'

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
      }
    },
  })
}

export function useOffline() {
  const isOnline = ref(navigator.onLine)

  async function enqueue(operation) {
    const db = await getDB()
    await db.add(STORE_NAME, { ...operation, timestamp: Date.now() })
  }

  async function syncPending() {
    const db  = await getDB()
    const ops = await db.getAll(STORE_NAME)
    for (const op of ops) {
      try {
        await fetch(op.url, { method: op.method, headers: op.headers, body: op.body })
        await db.delete(STORE_NAME, op.id)
      } catch { /* dejar en cola */ }
    }
  }

  function onOnline() {
    isOnline.value = true
    syncPending()
  }
  function onOffline() { isOnline.value = false }

  onMounted(() => {
    window.addEventListener('online',  onOnline)
    window.addEventListener('offline', onOffline)
  })
  onUnmounted(() => {
    window.removeEventListener('online',  onOnline)
    window.removeEventListener('offline', onOffline)
  })

  return { isOnline, enqueue, syncPending }
}
