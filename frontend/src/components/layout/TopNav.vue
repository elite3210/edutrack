<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAlertasStore } from '@/stores/alertas'
import {
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
} from '@heroicons/vue/24/outline'
import { ref } from 'vue'

const auth    = useAuthStore()
const alertas = useAlertasStore()
const router  = useRouter()
const route   = useRoute()

const navItems = computed(() => {
  const rol = auth.user?.rol
  if (rol === 'coordinador') return [
    { label: 'Activos',  to: '/coordinador/activos' },
    { label: 'Órdenes', to: '/coordinador/ordenes' },
    { label: 'Alertas', to: '/coordinador/alertas' },
    { label: 'Usuarios', to: '/coordinador/usuarios' },
  ]
  if (rol === 'director') return [
    { label: 'Dashboard',  to: '/director/dashboard' },
    { label: 'Proyección', to: '/director/proyeccion' },
  ]
  if (rol === 'super_admin') return [
    { label: 'Instituciones', to: '/admin/instituciones' },
    { label: 'Catálogo',      to: '/admin/catalogo' },
  ]
  return []
})

function isActive(to) {
  return route.path.startsWith(to)
}

function irACampana() {
  if (auth.user?.rol === 'coordinador') router.push('/coordinador/alertas')
}

const menuOpen = ref(false)

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="top-nav">
    <!-- Logo -->
    <RouterLink to="/" class="nav-logo">
      <span class="nav-logo-icon">ET</span>
      <span class="nav-logo-text">EduTrack <span>AI</span></span>
    </RouterLink>

    <!-- Nav items -->
    <nav class="nav-items">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :class="['nav-item', { 'nav-item--active': isActive(item.to) }]"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <!-- Acciones -->
    <div class="nav-actions">
      <!-- Campana -->
      <button class="nav-icon-btn" title="Alertas" @click="irACampana">
        <BellIcon class="icon-md" />
        <span v-if="alertas.totalPendientes > 0" class="nav-badge">
          {{ alertas.totalPendientes > 9 ? '9+' : alertas.totalPendientes }}
        </span>
      </button>

      <!-- Menú usuario -->
      <div class="relative">
        <button class="nav-user-btn" @click="menuOpen = !menuOpen">
          <UserCircleIcon class="icon-lg" />
          <span class="nav-user-name">{{ auth.user?.nombre?.split(' ')[0] }}</span>
          <ChevronDownIcon class="icon-sm" :class="{ 'rotate-180': menuOpen }" style="transition: transform 200ms" />
        </button>

        <Transition name="dropdown">
          <div v-if="menuOpen" class="nav-dropdown" v-click-outside="() => menuOpen = false">
            <div class="nav-dropdown-header">
              <p class="font-semibold text-sm" style="color: var(--color-text-primary)">{{ auth.user?.nombre }}</p>
              <p class="text-xs" style="color: var(--color-text-secondary)">{{ auth.user?.email }}</p>
            </div>
            <div class="nav-dropdown-divider" />
            <RouterLink to="/perfil" class="nav-dropdown-item" @click="menuOpen = false">
              <UserIcon class="icon-sm" />
              Mi perfil
            </RouterLink>
            <div class="nav-dropdown-divider" />
            <button class="nav-dropdown-item nav-dropdown-item--danger" @click="logout">
              <ArrowRightOnRectangleIcon class="icon-sm" />
              Cerrar sesión
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
.top-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 64px;
  background: #fff;
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  padding: 0 32px;
  gap: 32px;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}
.nav-logo-icon {
  width: 36px;
  height: 36px;
  background: var(--color-primary);
  color: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.nav-logo-text {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary);
}
.nav-logo-text span {
  color: var(--color-primary);
}

.nav-items {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}
.nav-item {
  padding: 8px 16px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: background var(--transition-fast), color var(--transition-fast);
  white-space: nowrap;
}
.nav-item:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
.nav-item--active {
  background: var(--color-primary);
  color: #fff;
}
.nav-item--active:hover {
  background: var(--color-primary-hover);
  color: #fff;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.nav-icon-btn {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  transition: background var(--transition-fast);
}
.nav-icon-btn:hover { background: var(--color-primary-light); color: var(--color-primary); }
.nav-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  background: var(--color-danger);
  color: #fff;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}
.nav-user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 8px;
  border-radius: 9999px;
  border: 1px solid var(--color-border);
  background: transparent;
  cursor: pointer;
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 500;
  transition: background var(--transition-fast);
}
.nav-user-btn:hover { background: var(--color-bg); }
.nav-user-name { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.nav-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  z-index: 200;
}
.nav-dropdown-header { padding: 14px 16px 12px; }
.nav-dropdown-divider { height: 1px; background: var(--color-border); }
.nav-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 16px;
  border: none;
  background: transparent;
  text-align: left;
  font-size: 14px;
  color: var(--color-text-primary);
  cursor: pointer;
  text-decoration: none;
  transition: background var(--transition-fast);
}
.nav-dropdown-item:hover { background: var(--color-bg); }
.nav-dropdown-item--danger { color: var(--color-danger); }
.nav-dropdown-item--danger:hover { background: var(--color-danger-bg); }

.icon-sm { width: 16px; height: 16px; }
.icon-md { width: 20px; height: 20px; }
.icon-lg { width: 24px; height: 24px; }

/* Dropdown transition */
.dropdown-enter-active, .dropdown-leave-active { transition: opacity 150ms, transform 150ms; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-4px); }

@media (max-width: 768px) {
  .top-nav { padding: 0 16px; gap: 12px; }
  .nav-items { gap: 2px; overflow-x: auto; scrollbar-width: none; }
  .nav-items::-webkit-scrollbar { display: none; }
  .nav-item { padding: 6px 12px; font-size: 13px; }
  .nav-logo-text { display: none; }
  .nav-user-name { display: none; }
  .nav-user-btn { padding: 6px; }
}
</style>
