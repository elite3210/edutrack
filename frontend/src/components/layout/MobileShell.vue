<script setup>
import { ref } from 'vue'
import MobileHeader from './MobileHeader.vue'
import NavDrawer from './NavDrawer.vue'
import OfflineBanner from '@/components/ui/OfflineBanner.vue'

defineProps({
  title: { type: String, default: '' },
})

const drawerOpen = ref(false)
</script>

<template>
  <div class="mobile-shell">
    <MobileHeader :title="title" @toggle-drawer="drawerOpen = true" />
    <OfflineBanner />
    <NavDrawer v-model="drawerOpen" />

    <main class="mobile-content safe-bottom">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.mobile-shell {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
}
.mobile-content {
  flex: 1;
  padding: 16px;
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
}
@media (min-width: 640px) {
  .mobile-shell { background: var(--color-surface); }
  .mobile-content {
    max-width: 580px;
    width: 100%;
    margin: 0 auto;
    background: var(--color-bg);
    border-left: 1px solid var(--color-border);
    border-right: 1px solid var(--color-border);
  }
}
</style>
