<script setup>
import { Bars3Icon, BellIcon } from '@heroicons/vue/24/outline'
import { useAlertasStore } from '@/stores/alertas'

defineProps({
  title: { type: String, default: '' },
})

const emit = defineEmits(['toggle-drawer'])
const alertas = useAlertasStore()
</script>

<template>
  <header class="mobile-header safe-top">
    <button class="mobile-header-btn" aria-label="Abrir menú" @click="emit('toggle-drawer')">
      <Bars3Icon class="icon-lg" />
    </button>

    <h1 class="mobile-header-title">{{ title || 'EduTrack' }}</h1>

    <button class="mobile-header-btn" aria-label="Notificaciones">
      <BellIcon class="icon-lg" />
      <span v-if="alertas.totalPendientes > 0" class="mobile-badge">
        {{ alertas.totalPendientes > 9 ? '9+' : alertas.totalPendientes }}
      </span>
    </button>
  </header>
</template>

<style scoped>
.mobile-header {
  position: sticky;
  top: 0;
  z-index: 90;
  height: 56px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
}
.mobile-header-btn {
  position: relative;
  width: 48px;
  height: 48px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-primary);
  transition: background var(--transition-fast);
}
.mobile-header-btn:active { background: var(--color-bg); }
.mobile-header-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 8px;
}
.mobile-badge {
  position: absolute;
  top: 6px;
  right: 6px;
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
.icon-lg { width: 26px; height: 26px; }
</style>
