<script setup>
import { computed } from 'vue'

const props = defineProps({
  prioridad: { type: String, required: true }, // alta | media | baja
  size:      { type: String, default: 'md' },
})

const meta = computed(() => ({
  alta:  { label: 'Alta',  variant: 'danger' },
  media: { label: 'Media', variant: 'warning' },
  baja:  { label: 'Baja',  variant: 'info' },
})[props.prioridad] ?? { label: props.prioridad, variant: 'default' })
</script>

<template>
  <span :class="['prio-badge', `prio-badge--${meta.variant}`, `prio-badge--${size}`]">
    <span class="prio-badge-dot" />
    {{ meta.label }}
  </span>
</template>

<style scoped>
.prio-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  border-radius: 9999px;
  white-space: nowrap;
  border: 1px solid transparent;
}
.prio-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: currentColor;
}

.prio-badge--sm { font-size: 12px; padding: 2px 8px; }
.prio-badge--md { font-size: 14px; padding: 3px 10px; }
.prio-badge--lg { font-size: 14px; padding: 4px 12px; }

.prio-badge--danger {
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border-color: rgba(192,57,43,0.2);
}
.prio-badge--warning {
  background: var(--color-warning-bg);
  color: var(--color-warning);
  border-color: rgba(211,84,0,0.2);
}
.prio-badge--info {
  background: var(--color-info-bg);
  color: var(--color-info);
  border-color: rgba(41,128,185,0.2);
}
.prio-badge--default {
  background: var(--color-bg);
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}
</style>
