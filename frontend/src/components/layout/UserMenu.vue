<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  UserCircleIcon,
  ChevronDownIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  KeyIcon,
} from '@heroicons/vue/24/outline'

const auth   = useAuthStore()
const router = useRouter()

const open = ref(false)

function close() { open.value = false }

function goto(path) {
  close()
  router.push(path)
}

function logout() {
  close()
  auth.logout()
  router.push('/login')
}

const canManageTokens = ['coordinador', 'director'].includes(auth.user?.rol)
</script>

<template>
  <div class="user-menu" v-click-outside="close">
    <button class="user-btn" :aria-expanded="open" @click="open = !open">
      <UserCircleIcon class="icon-lg" />
      <span class="user-name">{{ auth.user?.nombre?.split(' ')[0] ?? 'Usuario' }}</span>
      <ChevronDownIcon class="icon-sm" :class="{ rotate: open }" />
    </button>

    <Transition name="dropdown">
      <div v-if="open" class="user-dropdown" role="menu">
        <div class="user-dropdown-header">
          <p class="user-dropdown-name">{{ auth.user?.nombre }}</p>
          <p class="user-dropdown-email">{{ auth.user?.email }}</p>
          <span class="user-dropdown-rol">{{ auth.user?.rol }}</span>
        </div>
        <div class="user-dropdown-divider" />
        <button class="user-dropdown-item" type="button" @click="goto('/perfil')">
          <UserIcon class="icon-sm" />
          Mi perfil
        </button>
        <button
          v-if="canManageTokens"
          class="user-dropdown-item"
          type="button"
          @click="goto('/perfil#tokens')"
        >
          <KeyIcon class="icon-sm" />
          Tokens de API
        </button>
        <div class="user-dropdown-divider" />
        <button class="user-dropdown-item user-dropdown-item--danger" type="button" @click="logout">
          <ArrowRightOnRectangleIcon class="icon-sm" />
          Cerrar sesión
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.user-menu { position: relative; }
.user-btn {
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
  font-family: inherit;
}
.user-btn:hover { background: var(--color-bg); }
.user-name { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 240px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  z-index: 200;
}
.user-dropdown-header { padding: 14px 16px 12px; }
.user-dropdown-name { font-size: 14px; font-weight: 600; color: var(--color-text-primary); margin: 0; }
.user-dropdown-email { font-size: 12px; color: var(--color-text-secondary); margin: 2px 0 6px; word-break: break-all; }
.user-dropdown-rol {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 8px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 9999px;
}
.user-dropdown-divider { height: 1px; background: var(--color-border); }
.user-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 16px;
  border: none;
  background: transparent;
  text-align: left;
  font-size: 14px;
  font-family: inherit;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background var(--transition-fast);
}
.user-dropdown-item:hover { background: var(--color-bg); }
.user-dropdown-item--danger { color: var(--color-danger); }
.user-dropdown-item--danger:hover { background: var(--color-danger-bg); }

.icon-sm { width: 16px; height: 16px; }
.icon-lg { width: 24px; height: 24px; }
.rotate { transform: rotate(180deg); transition: transform 200ms; }

.dropdown-enter-active, .dropdown-leave-active { transition: opacity 150ms, transform 150ms; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
