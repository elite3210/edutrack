<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAlertasStore } from '@/stores/alertas'
import {
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  FireIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  Squares2X2Icon,
  ComputerDesktopIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  UsersIcon,
  PresentationChartLineIcon,
  BuildingOffice2Icon,
  BookOpenIcon,
} from '@heroicons/vue/24/outline'
import logoTexto from '@/assets/img/logo-texto.png'

const auth    = useAuthStore()
const alertas = useAlertasStore()
const router  = useRouter()
const route   = useRoute()

const navItems = computed(() => {
  const rol = auth.user?.rol
  if (rol === 'coordinador') return [
    { label: 'Dashboard', to: '/coordinador/dashboard', icon: Squares2X2Icon },
    { label: 'Activos',   to: '/coordinador/activos',   icon: ComputerDesktopIcon },
    { label: 'Órdenes',   to: '/coordinador/ordenes',   icon: ClipboardDocumentListIcon },
    { label: 'Alertas',   to: '/coordinador/alertas',   icon: SparklesIcon },
    { label: 'Usuarios',  to: '/coordinador/usuarios',  icon: UsersIcon },
  ]
  if (rol === 'director') return [
    { label: 'Dashboard',  to: '/director/dashboard',  icon: Squares2X2Icon },
    { label: 'Proyección', to: '/director/proyeccion', icon: PresentationChartLineIcon },
  ]
  if (rol === 'super_admin') return [
    { label: 'Instituciones', to: '/admin/instituciones', icon: BuildingOffice2Icon },
    { label: 'Catálogo',      to: '/admin/catalogo',      icon: BookOpenIcon },
  ]
  return []
})

function isActive(to) {
  return route.path.startsWith(to)
}

// ── Notification dropdown ──────────────────────────────────
const notifOpen = ref(false)

function clasificar(a) {
  if (a.tipo === 'riesgo_falla') return 'rojo'
  if (a.dias_restantes === null || a.dias_restantes === undefined) return 'amarillo'
  if (a.dias_restantes < 0)  return 'rojo'
  if (a.dias_restantes <= 5) return 'naranja'
  return 'amarillo'
}

function tiempoLabel(a) {
  const d = a.dias_restantes
  if (d === null || d === undefined) return 'Riesgo'
  if (d < 0)  return `Vencido hace ${Math.abs(d)}d`
  if (d === 0) return 'Hoy'
  return `En ${d}d`
}

const notifIconMap = { rojo: FireIcon, naranja: ExclamationTriangleIcon, amarillo: ClockIcon }

const isCoordinador = computed(() => auth.user?.rol === 'coordinador')

async function toggleNotif() {
  if (!isCoordinador.value) return
  notifOpen.value = !notifOpen.value
  if (notifOpen.value && alertas.list.length === 0) {
    await alertas.fetchAll()
  }
}

const top5 = computed(() => alertas.pendientes.slice(0, 5))

// ── User menu ──────────────────────────────────────────────
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
      <img :src="logoTexto" alt="EduTrack AI" class="nav-logo-img" />
    </RouterLink>

    <!-- Nav items -->
    <nav class="nav-items">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :class="['nav-item', { 'nav-item--active': isActive(item.to) }]"
      >
        <component :is="item.icon" class="nav-item-icon" />
        {{ item.label }}
      </RouterLink>
    </nav>

    <!-- Acciones -->
    <div class="nav-actions">
      <!-- Campana con dropdown -->
      <div class="relative">
        <button class="nav-icon-btn" title="Notificaciones" @click="toggleNotif">
          <BellIcon class="icon-md" />
          <span v-if="alertas.totalPendientes > 0" class="nav-badge">
            {{ alertas.totalPendientes > 9 ? '9+' : alertas.totalPendientes }}
          </span>
        </button>

        <Transition name="dropdown">
          <div v-if="notifOpen" class="notif-dropdown" v-click-outside="() => notifOpen = false">
            <div class="notif-header">
              <span class="notif-header-title">Alertas pendientes</span>
              <span class="notif-header-count">{{ alertas.totalPendientes }}</span>
            </div>
            <div v-if="alertas.loading" class="notif-loading">Cargando…</div>
            <div v-else-if="top5.length === 0" class="notif-empty">
              Sin alertas pendientes
            </div>
            <ul v-else class="notif-list">
              <li
                v-for="a in top5"
                :key="a.id"
                class="notif-item"
                @click="router.push(`/coordinador/alertas`); notifOpen = false"
              >
                <div :class="['notif-dot', `notif-dot--${clasificar(a)}`]">
                  <component :is="notifIconMap[clasificar(a)]" />
                </div>
                <div class="notif-body">
                  <p class="notif-nombre">{{ a.activo_nombre }}</p>
                  <p class="notif-meta">{{ tiempoLabel(a) }} · {{ a.ubicacion }}</p>
                </div>
              </li>
            </ul>
            <RouterLink
              to="/coordinador/alertas"
              class="notif-ver-todas"
              @click="notifOpen = false"
            >
              Ver todas las alertas
            </RouterLink>
          </div>
        </Transition>
      </div>

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
  text-decoration: none;
  flex-shrink: 0;
}
.nav-logo-img {
  height: 30px;
  width: auto;
  object-fit: contain;
  display: block;
}

.nav-items {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}
.nav-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: background var(--transition-fast), color var(--transition-fast);
  white-space: nowrap;
}
.nav-item-icon { width: 15px; height: 15px; flex-shrink: 0; }
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

/* Notification dropdown */
.notif-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 300px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  z-index: 200;
}
.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}
.notif-header-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary);
}
.notif-header-count {
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 9999px;
  background: var(--color-danger-bg);
  color: var(--color-danger);
  font-variant-numeric: tabular-nums;
}
.notif-loading, .notif-empty {
  padding: 20px 16px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.notif-list {
  list-style: none;
  padding: 6px 0;
  margin: 0;
}
.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background var(--transition-fast);
}
.notif-item:hover { background: var(--color-bg); }
.notif-dot {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}
.notif-dot :deep(svg) { width: 15px; height: 15px; }
.notif-dot--rojo     { background: var(--color-danger-bg);  color: var(--color-danger); }
.notif-dot--naranja  { background: var(--color-warning-bg); color: var(--color-warning); }
.notif-dot--amarillo { background: #FFF8DA; color: #9A7800; }
.notif-body { flex: 1; min-width: 0; }
.notif-nombre {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.notif-meta {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin: 2px 0 0;
}
.notif-ver-todas {
  display: block;
  text-align: center;
  padding: 11px 16px;
  border-top: 1px solid var(--color-border);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
  transition: background var(--transition-fast);
}
.notif-ver-todas:hover { background: var(--color-primary-light); }

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
