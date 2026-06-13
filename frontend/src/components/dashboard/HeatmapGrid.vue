<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, required: true }, // [{ aula, edificio, score_promedio, activos }]
})

const grupos = computed(() => {
  const m = new Map()
  for (const item of props.data) {
    const key = item.edificio ?? 'Sin edificio'
    if (!m.has(key)) m.set(key, [])
    m.get(key).push(item)
  }
  return [...m.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([edificio, items]) => ({
      edificio,
      items: [...items].sort((a, b) => a.score_promedio - b.score_promedio),
    }))
})

function variant(score) {
  if (score >= 70) return 'success'
  if (score >= 40) return 'warning'
  return 'danger'
}
</script>

<template>
  <div class="heatmap">
    <div v-for="g in grupos" :key="g.edificio" class="heatmap-edificio">
      <p class="heatmap-edificio-title">Edificio {{ g.edificio }}</p>
      <div class="heatmap-rows">
        <div
          v-for="aula in g.items"
          :key="aula.aula"
          class="heatmap-row"
          :title="`${aula.aula} · Score promedio: ${aula.score_promedio}`"
        >
          <span class="heatmap-row-aula">{{ aula.aula }}</span>
          <div class="heatmap-row-track">
            <div
              :class="['heatmap-row-fill', `heatmap-row-fill--${variant(aula.score_promedio)}`]"
              :style="{ width: `${aula.score_promedio}%` }"
            />
          </div>
          <span :class="['heatmap-row-score', `heatmap-row-score--${variant(aula.score_promedio)}`]">
            {{ aula.score_promedio }}
          </span>
          <span class="heatmap-row-meta">{{ aula.activos }} eq.</span>
        </div>
      </div>
    </div>

    <div class="heatmap-leyenda">
      <span><span class="heatmap-dot heatmap-dot--success" /> Saludable (≥70)</span>
      <span><span class="heatmap-dot heatmap-dot--warning" /> Atención (40–69)</span>
      <span><span class="heatmap-dot heatmap-dot--danger" /> Crítico (&lt;40)</span>
    </div>
  </div>
</template>

<style scoped>
.heatmap {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.heatmap-edificio-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--color-text-secondary);
  margin: 0 0 8px;
}

.heatmap-rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.heatmap-row {
  display: grid;
  grid-template-columns: 90px 1fr 36px 44px;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
  cursor: default;
}
.heatmap-row:hover { background: var(--color-bg); }

.heatmap-row-aula {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.heatmap-row-track {
  height: 8px;
  background: var(--color-border);
  border-radius: 9999px;
  overflow: hidden;
}
.heatmap-row-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 600ms cubic-bezier(0.16, 1, 0.3, 1);
}
.heatmap-row-fill--success { background: var(--color-success); }
.heatmap-row-fill--warning { background: var(--color-warning); }
.heatmap-row-fill--danger  { background: var(--color-danger); }

.heatmap-row-score {
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  text-align: right;
}
.heatmap-row-score--success { color: var(--color-success); }
.heatmap-row-score--warning { color: var(--color-warning); }
.heatmap-row-score--danger  { color: var(--color-danger); }

.heatmap-row-meta {
  font-size: 11px;
  color: var(--color-text-secondary);
  text-align: right;
  white-space: nowrap;
}

.heatmap-leyenda {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
  font-size: 11px;
  color: var(--color-text-secondary);
}
.heatmap-leyenda span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.heatmap-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  flex-shrink: 0;
}
.heatmap-dot--success { background: var(--color-success); }
.heatmap-dot--warning { background: var(--color-warning); }
.heatmap-dot--danger  { background: var(--color-danger); }
</style>
