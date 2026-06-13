// Directiva v-click-outside: ejecuta el handler cuando se hace click fuera del elemento.
// Uso: <div v-click-outside="onClose">...</div>

const map = new WeakMap()

export const clickOutside = {
  mounted(el, binding) {
    const handler = (event) => {
      if (!el.contains(event.target)) {
        binding.value?.(event)
      }
    }
    map.set(el, handler)
    // Diferir para evitar capturar el click que abrió el menú
    setTimeout(() => document.addEventListener('click', handler), 0)
  },
  unmounted(el) {
    const handler = map.get(el)
    if (handler) document.removeEventListener('click', handler)
    map.delete(el)
  },
}
