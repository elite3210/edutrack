import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import App from './App.vue'
import { clickOutside } from '@/directives/clickOutside'
import '@/assets/css/main.css'

async function bootstrap() {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    const { worker } = await import('@/mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }

  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.directive('click-outside', clickOutside)

  // Restaurar sesión persistida
  const { useAuthStore } = await import('@/stores/auth')
  useAuthStore().restoreSession()

  app.mount('#app')
}

bootstrap()
