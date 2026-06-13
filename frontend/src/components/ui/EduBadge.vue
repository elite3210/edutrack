<script setup>
defineProps({
  variant: { type: String, default: 'default' }, // success | warning | danger | info | in-progress | default
  size:    { type: String, default: 'md' },       // sm | md | lg
})
</script>

<template>
  <span :class="['edu-badge', `edu-badge--${variant}`, `edu-badge--${size}`]">
    <slot />
  </span>
</template>

<style scoped>
.edu-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: var(--radius-sm);
  font-weight: 500;
  white-space: nowrap;
}
/* Tamaños */
.edu-badge--sm { padding: 2px 8px;  font-size: 11px; }
.edu-badge--md { padding: 3px 10px; font-size: 12px; }
.edu-badge--lg { padding: 4px 12px; font-size: 14px; }

/* Variantes */
.edu-badge--success     { background: var(--color-success-bg);     color: var(--color-success); }
.edu-badge--warning     { background: var(--color-warning-bg);     color: var(--color-warning); }
.edu-badge--danger      { background: var(--color-danger-bg);      color: var(--color-danger); }
.edu-badge--info        { background: var(--color-info-bg);        color: var(--color-info); }
.edu-badge--in-progress { background: var(--color-in-progress-bg); color: var(--color-in-progress); }
.edu-badge--default     { background: var(--color-bg); color: var(--color-text-secondary); border: 1px solid var(--color-border); }
</style>
