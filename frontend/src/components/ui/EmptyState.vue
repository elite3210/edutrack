<script setup>
import { InboxIcon } from '@heroicons/vue/24/outline'

defineProps({
  title:       { type: String, default: 'Sin resultados' },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="empty-state">
    <div class="empty-state-illustration">
      <slot name="illustration">
        <InboxIcon class="empty-state-icon" />
      </slot>
    </div>
    <h3 class="empty-state-title">{{ title }}</h3>
    <p v-if="description" class="empty-state-text">{{ description }}</p>
    <div v-if="$slots.action" class="empty-state-action">
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}
.empty-state-illustration {
  width: 80px;
  height: 80px;
  background: var(--color-primary-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
.empty-state-icon {
  width: 40px;
  height: 40px;
  color: var(--color-primary);
}
.empty-state-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 6px;
}
.empty-state-text {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0 0 20px;
  max-width: 360px;
  line-height: 1.5;
}
.empty-state-action { margin-top: 4px; }
</style>
