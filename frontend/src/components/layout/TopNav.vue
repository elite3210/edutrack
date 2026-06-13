<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore }          from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { getNotifMeta }          from '@/composables/useNotifMeta'
import {
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
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

const auth   = useAuthStore()
const notifs = useNotificationsStore()
const router = useRouter()
const route  = useRoute()

onMounted(() => { if (notifs.list.length === 0) notifs.fetchAll() })

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

async function toggleNotif() {
  notifOpen.value = !notifOpen.value
  if (notifOpen.value && notifs.list.length === 0) await notifs.fetchAll()
}

function timeAgo(fechaStr) {
  const diff = Date.now() - new Date(fechaStr).getTime()
  const min  = Math.floor(diff / 60000)
  if (min < 1)   return 'ahora'
  if (min < 60)  return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24)    return `hace ${h}h`
  const d = Math.floor(h / 24)
  if (d === 1)   return 'ayer'
  if (d < 30)    return `hace ${d} días`
  return new Date(fechaStr).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
}

const top5 = computed(() => {
  const unread = notifs.list.filter(n => !n.leida)
  const read   = notifs.list.filter(n => n.leida)
  return [...unread, ...read].slice(0, 5)
})

async function onNotifClick(n) {
  if (!n.leida) await notifs.marcarLeida(n.id)
  notifOpen.value = false
  router.push(n.link)
}

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
          <span v-if="notifs.totalNoLeidas > 0" class="nav-badge">
            {{ notifs.totalNoLeidas > 9 ? '9+' : notifs.totalNoLeidas }}
          </span>
        </button>

        <Transition name="dropdown">
          <div v-if="notifOpen" class="notif-dropdown" v-click-outside="() => notifOpen = false">
            <div class="notif-header">
              <span class="notif-header-title">Notificaciones</span>
            </div>
            <div v-if="notifs.loading" class="notif-loading">Cargando…</div>
            <div v-else-if="top5.length === 0" class="notif-empty">
              Sin notificaciones
            </div>
            <ul v-else class="notif-list">
              <template v-for="(n, i) in top5" :key="n.id">
                <li
                  v-if="n.leida && (i === 0 || !top5[i - 1].leida)"
                  class="notif-sep"
                >
                  <span>Anteriores</span>
                </li>
                <li
                  :class="['notif-item', { 'notif-item--unread': !n.leida }]"
                  @click="onNotifClick(n)"
                >
                  <div :class="['notif-dot', `notif-dot--${getNotifMeta(n.tipo).color}`]">
                    <component :is="getNotifMeta(n.tipo).icon" />
                  </div>
                  <div class="notif-body">
                    <div class="notif-item-row">
                      <p class="notif-nombre">{{ n.titulo }}</p>
                      <span class="notif-time">{{ timeAgo(n.fecha) }}</span>
                    </div>
                    <p class="notif-meta">{{ n.mensaje }}</p>
                  </div>
                </li>
              </template>
            </ul>
            <div v-if="notifs.totalNoLeidas > 0" class="notif-mark-all">
              <button class="notif-mark-btn" @click="notifs.marcarTodasLeidas()">
                Marcar todas como leídas
              </button>
            </div>
            <RouterLink
              to="/notificaciones"
              class="notif-ver-todas"
              @click="notifOpen = false"
            >
              Ver todas las notificaciones
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
  width: 310px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.12), 0 3px 10px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03);
  overflow: hidden;
  z-index: 200;
}
.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 16px;
  border-bottom: 1px solid var(--color-border);
}
.notif-header-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-secondary);
  opacity: 0.7;
}
.notif-header-count {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 9999px;
  background: var(--color-primary);
  color: #fff;
  letter-spacing: 0.02em;
}
.notif-loading, .notif-empty {
  padding: 22px 16px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
  opacity: 0.7;
}
.notif-list {
  list-style: none;
  padding: 4px 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
}

/* Section separator */
.notif-sep {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px 4px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-secondary);
  opacity: 0.5;
  list-style: none;
}
.notif-sep::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 11px 16px 11px 13px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: background 100ms ease;
  list-style: none;
}
.notif-item:hover { background: color-mix(in srgb, var(--color-primary) 4%, var(--color-surface)); }
.notif-item--unread { border-left-color: var(--color-primary); }
.notif-item--unread .notif-nombre { font-weight: 500; color: var(--color-text-primary); }
.notif-item:not(.notif-item--unread) .notif-dot { filter: grayscale(0.5); opacity: 0.4; }
.notif-item:not(.notif-item--unread) .notif-nombre { color: var(--color-text-secondary); font-weight: 400; }

.notif-dot {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
  transition: filter 100ms, opacity 100ms;
}
.notif-dot :deep(svg) { width: 13px; height: 13px; }
.notif-dot--primary { background: color-mix(in srgb, var(--color-primary) 12%, transparent); color: var(--color-primary); }
.notif-dot--success { background: color-mix(in srgb, var(--color-success) 12%, transparent); color: var(--color-success); }
.notif-dot--warning { background: color-mix(in srgb, var(--color-warning) 12%, transparent); color: var(--color-warning); }
.notif-dot--danger  { background: color-mix(in srgb, var(--color-danger)  12%, transparent); color: var(--color-danger); }
.notif-dot--info    { background: color-mix(in srgb, #3182CE 12%, transparent); color: #3182CE; }

.notif-body { flex: 1; min-width: 0; }
.notif-item-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 2px;
}
.notif-nombre {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.35;
}
.notif-time {
  font-size: 12px;
  color: var(--color-text-secondary);
  opacity: 0.6;
  white-space: nowrap;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.notif-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.75;
}
.notif-mark-all {
  padding: 7px 16px;
  border-top: 1px solid var(--color-border);
}
.notif-mark-btn {
  border: none;
  background: transparent;
  font-size: 12px;
  color: var(--color-primary);
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  opacity: 0.85;
}
.notif-mark-btn:hover { opacity: 1; text-decoration: underline; }
.notif-ver-todas {
  display: block;
  text-align: center;
  padding: 11px 16px;
  border-top: 1px solid var(--color-border);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
  background: color-mix(in srgb, var(--color-primary) 3%, var(--color-surface));
  transition: background var(--transition-fast);
  letter-spacing: 0.01em;
}
.notif-ver-todas:hover { background: color-mix(in srgb, var(--color-primary) 8%, var(--color-surface)); }

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
