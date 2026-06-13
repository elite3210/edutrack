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
      <div class="heatmap-grid">
        <div
          v-for="aula in g.items"
          :key="aula.aula"
          :class="['heatmap-cell', `heatmap-cell--${variant(aula.score_promedio)}`]"
          :title="`${aula.aula} · score promedio ${aula.score_promedio}`"
        >
          <span class="heatmap-cell-aula">{{ aula.aula }}</span>
          <span class="heatmap-cell-score">{{ aula.score_promedio }}</span>
          <span class="heatmap-cell-meta">{{ aula.activos }} {{ aula.activos === 1 ? 'activo' : 'activos' }}</span>
        </div>
      </div>
    </div>
    <div class="heatmap-leyenda">
      <span><span class="heatmap-leyenda-dot heatmap-leyenda-dot--success" /> Saludable (70+)</span>
      <span><span class="heatmap-leyenda-dot heatmap-leyenda-dot--warning" /> Atención (40–69)</span>
      <span><span class="heatmap-leyenda-dot heatmap-leyenda-dot--danger" /> Crítico (&lt; 40)</span>
    </div>
  </div>
</template>

<style scoped>
.heatmap {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.heatmap-edificio-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--color-text-secondary);
  margin: 0 0 8px;
}
.heatmap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 8px;
}
.heatmap-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 4px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  aspect-ratio: 2 / 1;
  min-height: 64px;
  position: relative;
  transition: transform var(--transition-fast);
  cursor: default;
  border: 1px solid transparent;
}
.heatmap-cell:hover {
  transform: scale(1.03);
}
.heatmap-cell--success { background: rgba(30,132,73,0.16);  color: var(--color-success);  border-color: rgba(30,132,73,0.3); }
.heatmap-cell--warning { background: rgba(211,84,0,0.16);   color: var(--color-warning);  border-color: rgba(211,84,0,0.3); }
.heatmap-cell--danger  { background: rgba(192,57,43,0.18);  color: var(--color-danger);   border-color: rgba(192,57,43,0.3); }

.heatmap-cell-aula {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
}
.heatmap-cell-score {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.4px;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.heatmap-cell-meta {
  font-size: 10.5px;
  opacity: 0.75;
  font-weight: 500;
}

.heatmap-leyenda {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
  font-size: 11px;
  color: var(--color-text-secondary);
}
.heatmap-leyenda span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.heatmap-leyenda-dot {
  width: 10px;
  height: 10px;
  border-radius: 9999px;
}
.heatmap-leyenda-dot--success { background: var(--color-success); }
.heatmap-leyenda-dot--warning { background: var(--color-warning); }
.heatmap-leyenda-dot--danger  { background: var(--color-danger);  }
</style>
