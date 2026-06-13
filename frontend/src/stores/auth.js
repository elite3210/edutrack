import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user  = ref(null)
  const token = ref(localStorage.getItem('edu_token') ?? null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const institucionId   = computed(() => user.value?.institucion_id ?? null)

  function setSession(userData, accessToken) {
    user.value  = userData
    token.value = accessToken
    localStorage.setItem('edu_token', accessToken)
  }

  function logout() {
    user.value  = null
    token.value = null
    localStorage.removeItem('edu_token')
  }

  // Restaurar sesión desde token persistido (mock: decodifica payload)
  function restoreSession() {
    if (!token.value) return
    try {
      const payload = JSON.parse(atob(token.value.split('.')[1]))
      user.value = {
        id:            payload.sub,
        nombre:        payload.nombre,
        email:         payload.email,
        rol:           payload.rol,
        institucion_id: payload.institucion_id,
      }
    } catch {
      logout()
    }
  }

  return { user, token, isAuthenticated, institucionId, setSession, logout, restoreSession }
})
