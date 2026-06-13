<script setup>
defineProps({
  width:  { type: String, default: '100%' },
  height: { type: String, default: '16px' },
  shape:  { type: String, default: 'rect' }, // rect | circle | text
  count:  { type: Number, default: 1 },
})
</script>

<template>
  <template v-if="$slots.default">
    <slot />
  </template>
  <template v-else>
    <div
      v-for="n in count"
      :key="n"
      class="skeleton"
      :class="[`skeleton--${shape}`]"
      :style="{ width, height: shape === 'circle' ? width : height }"
    />
  </template>
</template>

<style scoped>
.skeleton--rect   { border-radius: var(--radius-md); }
.skeleton--circle { border-radius: 50%; }
.skeleton--text   { border-radius: var(--radius-sm); height: 12px; }
</style>
