<script setup>
defineProps({
  size: { type: String, default: 'md' }, // sm | md | lg
})
</script>

<template>
  <span :class="['spinner', `spinner--${size}`]" role="status" aria-label="Cargando" />
</template>

<style scoped>
.spinner {
  display: inline-block;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-top-color: transparent;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
.spinner--sm { width: 14px; height: 14px; }
.spinner--md { width: 20px; height: 20px; border-width: 2.5px; }
.spinner--lg { width: 32px; height: 32px; border-width: 3px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
