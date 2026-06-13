<script setup>
import { useOffline } from '@/composables/useOffline'
const { isOnline } = useOffline()
</script>

<template>
  <Transition name="slide-down">
    <div v-if="!isOnline" class="offline-banner">
      <span class="offline-dot" />
      Sin conexión — los cambios se guardan y sincronizarán al reconectar
    </div>
  </Transition>
</template>

<style scoped>
.offline-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 32px;
  background: var(--color-warning-bg);
  color: var(--color-warning);
  font-size: 14px;
  font-weight: 500;
  border-bottom: 1px solid var(--color-warning);
  position: sticky;
  top: 64px;
  z-index: 99;
}
.offline-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-warning);
  flex-shrink: 0;
}
.slide-down-enter-active, .slide-down-leave-active { transition: all 300ms ease; }
.slide-down-enter-from, .slide-down-leave-to { transform: translateY(-100%); opacity: 0; }
</style>
