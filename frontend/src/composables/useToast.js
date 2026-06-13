import { ref } from 'vue'

const toasts = ref([])
let counter = 0

function addToast({ variant = 'info', title = '', message = '', duration = 4000 } = {}) {
  const id = ++counter
  toasts.value.push({ id, variant, title, message })
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }
  return id
}

function removeToast(id) {
  const idx = toasts.value.findIndex(t => t.id === id)
  if (idx !== -1) toasts.value.splice(idx, 1)
}

export function useToast() {
  return {
    toasts,
    removeToast,
    success: (message, opts = {}) => addToast({ ...opts, message, variant: 'success' }),
    warning: (message, opts = {}) => addToast({ ...opts, message, variant: 'warning' }),
    danger:  (message, opts = {}) => addToast({ ...opts, message, variant: 'danger' }),
    info:    (message, opts = {}) => addToast({ ...opts, message, variant: 'info' }),
    show:    addToast,
  }
}
