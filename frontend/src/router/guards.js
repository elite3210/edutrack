import { useAuthStore } from '@/stores/auth'

const roleHomeMap = {
  coordinador: '/coordinador/dashboard',
  director:    '/director/dashboard',
  tecnico:     '/tecnico/ordenes',
  super_admin: '/admin/instituciones',
}

export function setupGuards(router) {
  router.beforeEach((to, from) => {
    const auth = useAuthStore()

    // Ruta pública
    if (to.meta.requiresAuth === false) {
      // Si ya está autenticado y va al login, redirigir a su home
      if (to.name === 'login' && auth.isAuthenticated) {
        return { path: roleHomeMap[auth.user?.rol] ?? '/' }
      }
      return true
    }

    // Ruta protegida sin sesión
    if (!auth.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }

    // Verificar rol
    const allowedRoles = to.meta.roles ?? []
    if (allowedRoles.length && !allowedRoles.includes(auth.user?.rol)) {
      return { path: roleHomeMap[auth.user?.rol] ?? '/' }
    }

    return true
  })
}
