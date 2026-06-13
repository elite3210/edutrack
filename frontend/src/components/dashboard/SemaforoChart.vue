<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  semaforo: { type: Object, required: true },
  size:     { type: Number, default: 220 },
})

const total = computed(() =>
  (props.semaforo.verde?.count ?? 0) +
  (props.semaforo.amarillo?.count ?? 0) +
  (props.semaforo.rojo?.count ?? 0),
)

const chartData = computed(() => ({
  labels: ['Saludable', 'Atención', 'Crítico'],
  datasets: [
    {
      data: [
        props.semaforo.verde?.count    ?? 0,
        props.semaforo.amarillo?.count ?? 0,
        props.semaforo.rojo?.count     ?? 0,
      ],
      backgroundColor: ['#1E8449', '#D35400', '#C0392B'],
      borderColor: 'rgba(255,255,255,0.9)',
      borderWidth: 3,
      hoverOffset: 6,
    },
  ],
}))

const chartOptions = {
  responsive:  true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.label}: ${ctx.parsed} activos`,
      },
      padding: 10,
      backgroundColor: 'rgba(26, 26, 46, 0.92)',
      titleFont: { size: 13, weight: 600 },
      bodyFont:  { size: 12 },
      cornerRadius: 6,
    },
  },
}

const items = computed(() => [
  { key: 'verde',    label: 'Saludable', help: 'Score 70+',  color: 'var(--color-success)', data: props.semaforo.verde },
  { key: 'amarillo', label: 'Atención',  help: 'Score 40-69', color: 'var(--color-warning)', data: props.semaforo.amarillo },
  { key: 'rojo',     label: 'Crítico',   help: 'Score < 40',   color: 'var(--color-danger)',  data: props.semaforo.rojo },
])
</script>

<template>
  <div class="semaforo">
    <div class="semaforo-chart-wrap" :style="{ height: `${size}px`, width: `${size}px` }">
      <Doughnut :data="chartData" :options="chartOptions" />
      <div class="semaforo-center">
        <span class="semaforo-center-value">{{ total }}</span>
        <span class="semaforo-center-label">activos</span>
      </div>
    </div>
    <ul class="semaforo-legend">
      <li v-for="it in items" :key="it.key" class="semaforo-legend-item">
        <span class="semaforo-legend-dot" :style="{ background: it.color }" />
        <div class="semaforo-legend-text">
          <p class="semaforo-legend-label">{{ it.label }}</p>
          <p class="semaforo-legend-help">{{ it.help }}</p>
        </div>
        <div class="semaforo-legend-meta">
          <span class="semaforo-legend-count">{{ it.data?.count ?? 0 }}</span>
          <span class="semaforo-legend-pct">{{ it.data?.porcentaje ?? 0 }}%</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.semaforo {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 32px;
  align-items: center;
}
@media (max-width: 768px) {
  .semaforo { grid-template-columns: 1fr; justify-items: center; gap: 20px; }
}

.semaforo-chart-wrap {
  position: relative;
}
.semaforo-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.semaforo-center-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.8px;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.semaforo-center-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-top: 4px;
}

.semaforo-legend {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 320px;
}
.semaforo-legend-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  background: var(--color-bg);
  border-radius: var(--radius-md);
}
.semaforo-legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 9999px;
  flex-shrink: 0;
}
.semaforo-legend-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}
.semaforo-legend-help {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin: 1px 0 0;
}
.semaforo-legend-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0;
  font-variant-numeric: tabular-nums;
}
.semaforo-legend-count {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}
.semaforo-legend-pct {
  font-size: 11px;
  color: var(--color-text-secondary);
}
</style>
