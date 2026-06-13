<script setup>
import { computed } from 'vue'
import { getScoreColor, getScoreLabel } from '@/utils/score'

const props = defineProps({
  score: { type: Number, required: true },
  size:  { type: String, default: 'md' }, // sm, md, lg
  showLabel: { type: Boolean, default: false },
})

const dimensions = {
  sm: { diameter: 56,  stroke: 6,  fontSize: 16 },
  md: { diameter: 76,  stroke: 7,  fontSize: 22 },
  lg: { diameter: 96,  stroke: 9,  fontSize: 28 },
}
const dim = computed(() => dimensions[props.size] ?? dimensions.md)

const radius        = computed(() => (dim.value.diameter - dim.value.stroke) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset    = computed(() => circumference.value * (1 - Math.max(0, Math.min(100, props.score)) / 100))
const color         = computed(() => getScoreColor(props.score))
const label         = computed(() => getScoreLabel(props.score))
</script>

<template>
  <div class="score-ring">
    <svg
      :width="dim.diameter"
      :height="dim.diameter"
      :viewBox="`0 0 ${dim.diameter} ${dim.diameter}`"
      class="score-ring-svg"
    >
      <g :transform="`rotate(-90 ${dim.diameter / 2} ${dim.diameter / 2})`">
        <circle
          class="score-ring-track"
          :cx="dim.diameter / 2"
          :cy="dim.diameter / 2"
          :r="radius"
          :stroke-width="dim.stroke"
          fill="none"
        />
        <circle
          class="score-ring-progress"
          :cx="dim.diameter / 2"
          :cy="dim.diameter / 2"
          :r="radius"
          :stroke-width="dim.stroke"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
          :style="{ stroke: color }"
          stroke-linecap="round"
          fill="none"
        />
      </g>
      <text
        :x="dim.diameter / 2"
        :y="dim.diameter / 2"
        text-anchor="middle"
        dominant-baseline="central"
        :style="{ fontSize: `${dim.fontSize}px`, fill: color }"
        class="score-ring-text"
      >
        {{ score }}
      </text>
    </svg>
    <span v-if="showLabel" class="score-ring-label" :style="{ color }">{{ label }}</span>
  </div>
</template>

<style scoped>
.score-ring {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.score-ring-svg {
  display: block;
}
.score-ring-track {
  stroke: var(--color-border);
}
.score-ring-progress {
  transition: stroke-dashoffset 600ms cubic-bezier(0.16, 1, 0.3, 1);
}
.score-ring-text {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.score-ring-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
</style>
