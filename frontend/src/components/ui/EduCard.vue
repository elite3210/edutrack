<script setup>
defineProps({
  clickable: { type: Boolean, default: false },
  padding:   { type: String, default: 'md' }, // sm | md | lg
})
</script>

<template>
  <div :class="['edu-card', `edu-card--pad-${padding}`, { 'edu-card--clickable': clickable }]">
    <div v-if="$slots.header" class="edu-card-header">
      <slot name="header" />
    </div>
    <div class="edu-card-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="edu-card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.edu-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  overflow: hidden;
}
.edu-card--clickable {
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}
.edu-card--clickable:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }

.edu-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border);
}
.edu-card-footer {
  padding: 12px 24px;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg);
}
.edu-card--pad-sm .edu-card-body  { padding: 16px; }
.edu-card--pad-md .edu-card-body  { padding: 24px; }
.edu-card--pad-lg .edu-card-body  { padding: 32px; }

@media (max-width: 768px) {
  .edu-card-header { padding: 14px 16px; }
  .edu-card--pad-sm .edu-card-body { padding: 12px; }
  .edu-card--pad-md .edu-card-body { padding: 16px; }
  .edu-card--pad-lg .edu-card-body { padding: 20px; }
}
</style>
