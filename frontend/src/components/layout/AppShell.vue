<script setup>
import TopNav from './TopNav.vue'
import OfflineBanner from '@/components/ui/OfflineBanner.vue'

defineProps({
  title:    { type: String, default: '' },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="app-shell">
    <TopNav />
    <OfflineBanner />

    <main class="app-content">
      <!-- Page Header -->
      <div v-if="title || $slots.actions" class="page-header">
        <div>
          <h1 class="page-title">{{ title }}</h1>
          <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
        </div>
        <div class="page-actions">
          <slot name="actions" />
        </div>
      </div>

      <!-- Contenido -->
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--color-bg);
}
.app-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px;
  padding-left:  max(32px, env(safe-area-inset-left));
  padding-right: max(32px, env(safe-area-inset-right));
}
@media (max-width: 768px) {
  .app-content { padding: 20px 16px; }
}
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 32px;
}
.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.5px;
  margin: 0 0 4px;
}
.page-subtitle {
  font-size: 15px;
  color: var(--color-text-secondary);
  margin: 0;
}
.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
@media (max-width: 640px) {
  .page-header { flex-direction: column; align-items: stretch; gap: 12px; margin-bottom: 20px; }
  .page-title { font-size: 22px; }
  .page-subtitle { font-size: 14px; }
}
</style>
