<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  XMarkIcon,
  HomeIcon,
  ComputerDesktopIcon,
  ClipboardDocumentListIcon,
  BellAlertIcon,
  UsersIcon,
  ChartBarIcon,
  PresentationChartLineIcon,
  BuildingOffice2Icon,
  Squares2X2Icon,
  ArrowRightOnRectangleIcon,
  UserIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({ modelValue: { type: Boolean, default: false } })
const emit  = defineEmits(['update:modelValue'])

const auth   = useAuthStore()
const route  = useRoute()
const router = useRouter()

const navItems = computed(() => {
  const rol = auth.user?.rol
  if (rol === 'coordinador') return [
    { label: 'Dashboard', to: '/coordinador/dashboard', icon: HomeIcon },
    { label: 'Activos',   to: '/coordinador/activos',   icon: ComputerDesktopIcon },
    { label: 'Órdenes',  to: '/coordinador/ordenes',   icon: ClipboardDocumentListIcon },
    { label: 'Alertas',   to: '/coordinador/alertas',   icon: BellAlertIcon },
    { label: 'Usuarios',  to: '/coordinador/usuarios',  icon: UsersIcon },
  ]
  if (rol === 'director') return [
    { label: 'Dashboard',  to: '/director/dashboard',  icon: ChartBarIcon },
    { label: 'Proyección', to: '/director/proyeccion', icon: PresentationChartLineIcon },
  ]
  if (rol === 'tecnico') return [
    { label: 'Mis órdenes', to: '/tecnico/ordenes', icon: ClipboardDocumentListIcon },
  ]
  if (rol === 'super_admin') return [
    { label: 'Instituciones', to: '/admin/instituciones', icon: BuildingOffice2Icon },
    { label: 'Catálogo',      to: '/admin/catalogo',      icon: Squares2X2Icon },
  ]
  return []
})

function close() { emit('update:modelValue', false) }
function goto(to) {
  close()
  router.push(to)
}
function logout() {
  close()
  auth.logout()
  router.push('/login')
}
function isActive(to) { return route.path.startsWith(to) }

watch(() => props.modelValue, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="modelValue" class="drawer-overlay" @click.self="close">
        <aside class="drawer" role="dialog" aria-modal="true">
          <header class="drawer-header">
            <div class="drawer-brand">
              <div class="drawer-logo">ET</div>
              <div>
                <p class="drawer-brand-name">EduTrack <span>AI</span></p>
                <p class="drawer-brand-user">{{ auth.user?.nombre }}</p>
              </div>
            </div>
            <button class="drawer-close" type="button" aria-label="Cerrar" @click="close">
              <XMarkIcon class="icon-md" />
            </button>
          </header>

          <nav class="drawer-nav">
            <button
              v-for="item in navItems"
              :key="item.to"
              :class="['drawer-item', { 'drawer-item--active': isActive(item.to) }]"
              type="button"
              @click="goto(item.to)"
            >
              <component :is="item.icon" class="icon-md" />
              {{ item.label }}
            </button>
          </nav>

          <div class="drawer-divider" />
          <nav class="drawer-nav">
            <button class="drawer-item" type="button" @click="goto('/perfil')">
              <UserIcon class="icon-md" />
              Mi perfil
            </button>
            <button class="drawer-item drawer-item--danger" type="button" @click="logout">
              <ArrowRightOnRectangleIcon class="icon-md" />
              Cerrar sesión
            </button>
          </nav>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 46, 0.5);
  z-index: 900;
  display: flex;
}
.drawer {
  background: var(--color-surface);
  width: 84%;
  max-width: 320px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: var(--shadow-lg);
}
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}
.drawer-brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
.drawer-logo {
  width: 40px; height: 40px; flex-shrink: 0;
  background: var(--color-primary); color: #fff;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; letter-spacing: 0.5px;
}
.drawer-brand-name { font-size: 16px; font-weight: 700; color: var(--color-text-primary); margin: 0; }
.drawer-brand-name span { color: var(--color-primary); }
.drawer-brand-user { font-size: 12px; color: var(--color-text-secondary); margin: 2px 0 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px; }

.drawer-close {
  width: 36px; height: 36px;
  border: none; background: transparent;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--color-text-secondary);
  flex-shrink: 0;
}
.drawer-close:hover { background: var(--color-bg); }

.drawer-nav { display: flex; flex-direction: column; padding: 12px 8px; gap: 2px; }
.drawer-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  font-family: inherit;
  color: var(--color-text-primary);
  text-align: left;
  min-height: 48px;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.drawer-item:hover { background: var(--color-primary-light); color: var(--color-primary); }
.drawer-item--active { background: var(--color-primary); color: #fff; }
.drawer-item--active:hover { background: var(--color-primary-hover); color: #fff; }
.drawer-item--danger { color: var(--color-danger); }
.drawer-item--danger:hover { background: var(--color-danger-bg); }

.drawer-divider { height: 1px; background: var(--color-border); margin: 4px 16px; }
.icon-md { width: 22px; height: 22px; }

.drawer-enter-active, .drawer-leave-active { transition: opacity 200ms; }
.drawer-enter-active .drawer, .drawer-leave-active .drawer { transition: transform 200ms ease-out; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from .drawer, .drawer-leave-to .drawer { transform: translateX(-100%); }
</style>
