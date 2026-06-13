<script setup>
import { computed } from 'vue'
import { getScoreVariant, getScoreLabel } from '@/utils/score'

const props = defineProps({
  score: { type: Number, required: true },
  size:  { type: String, default: 'md' },
  showLabel: { type: Boolean, default: false },
})

const variant = computed(() => getScoreVariant(props.score))
const label   = computed(() => getScoreLabel(props.score))
</script>

<template>
  <span :class="['score-badge', `score-badge--${variant}`, `score-badge--${size}`]">
    <span class="score-badge-dot" />
    <span class="score-badge-value">{{ score }}</span>
    <span v-if="showLabel" class="score-badge-label">· {{ label }}</span>
  </span>
</template>

<style scoped>
.score-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  border-radius: 9999px;
  font-variant-numeric: tabular-nums;
  border: 1px solid transparent;
}
.score-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: currentColor;
}

.score-badge--sm  { font-size: 11px; padding: 2px 8px; }
.score-badge--md  { font-size: 13px; padding: 4px 10px; }
.score-badge--lg  { font-size: 15px; padding: 6px 14px; }

.score-badge--success {
  background: var(--color-success-bg);
  color: var(--color-success);
  border-color: rgba(30,132,73,0.2);
}
.score-badge--warning {
  background: var(--color-warning-bg);
  color: var(--color-warning);
  border-color: rgba(211,84,0,0.2);
}
.score-badge--danger {
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border-color: rgba(192,57,43,0.2);
}
.score-badge-label {
  font-weight: 500;
  opacity: 0.85;
}
</style>
