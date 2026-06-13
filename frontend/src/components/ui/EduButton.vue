<script setup>
import { computed } from 'vue'
import EduSpinner from './EduSpinner.vue'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | danger | ghost | outline-gray
  size:    { type: String, default: 'md' },       // sm | md | lg | lg-mobile
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  type:    { type: String, default: 'button' },
})

const classes = computed(() => [
  'edu-btn',
  `edu-btn--${props.variant}`,
  `edu-btn--${props.size}`,
  { 'edu-btn--loading': props.loading },
])
</script>

<template>
  <button
    :class="classes"
    :type="type"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <EduSpinner v-if="loading" size="sm" class="edu-btn-spinner" />
    <slot />
  </button>
</template>

<style scoped>
.edu-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: var(--radius-md);
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast), opacity var(--transition-fast);
  white-space: nowrap;
  text-decoration: none;
}
.edu-btn:focus-visible { box-shadow: var(--shadow-ring); outline: none; }
.edu-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.edu-btn--loading { cursor: wait; }

/* Variantes */
.edu-btn--primary    { background: var(--color-primary); color: #fff; }
.edu-btn--primary:hover:not(:disabled)    { background: var(--color-primary-hover); }
.edu-btn--secondary  { background: #fff; color: var(--color-primary); border: 1px solid var(--color-primary); }
.edu-btn--secondary:hover:not(:disabled)  { background: var(--color-primary-light); }
.edu-btn--danger     { background: var(--color-danger); color: #fff; }
.edu-btn--danger:hover:not(:disabled)     { background: #a93226; }
.edu-btn--ghost      { background: transparent; color: var(--color-primary); }
.edu-btn--ghost:hover:not(:disabled)      { background: var(--color-primary-light); }
.edu-btn--outline-gray { background: #fff; color: var(--color-text-secondary); border: 1px solid var(--color-border); }
.edu-btn--outline-gray:hover:not(:disabled) { background: var(--color-bg); }

/* Tamaños */
.edu-btn--sm       { height: 32px; padding: 0 12px; font-size: 13px; }
.edu-btn--md       { height: 40px; padding: 0 20px; font-size: 14px; }
.edu-btn--lg       { height: 48px; padding: 0 24px; font-size: 16px; }
.edu-btn--lg-mobile { height: 56px; padding: 0 24px; font-size: 16px; width: 100%; border-radius: var(--radius-lg); }

.edu-btn-spinner { flex-shrink: 0; }
</style>
