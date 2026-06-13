<script setup>
import { computed } from 'vue'
import EstadoBadge    from './EstadoBadge.vue'
import PrioridadBadge from './PrioridadBadge.vue'
import {
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  UserCircleIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
  orden:    { type: Object, required: true },
  clickable: { type: Boolean, default: true },
})

defineEmits(['click'])

const diasRestantes = computed(() => {
  if (!props.orden.fecha_limite) return null
  const hoy   = new Date(); hoy.setHours(0,0,0,0)
  const limite = new Date(props.orden.fecha_limite)
  return Math.floor((limite - hoy) / (1000 * 60 * 60 * 24))
})
const vencida = computed(() =>
  diasRestantes.value !== null &&
  diasRestantes.value < 0 &&
  props.orden.estado !== 'cerrada',
)
const diasLabel = computed(() => {
  if (diasRestantes.value === null) return 'Sin fecha límite'
  if (diasRestantes.value < 0)  return `Vencida hace ${Math.abs(diasRestantes.value)} ${Math.abs(diasRestantes.value) === 1 ? 'día' : 'días'}`
  if (diasRestantes.value === 0) return 'Vence hoy'
  if (diasRestantes.value === 1) return 'Vence mañana'
  return `En ${diasRestantes.value} días`
})
</script>

<template>
  <article
    :class="['orden-card', { 'orden-card--vencida': vencida, 'orden-card--clickable': clickable }]"
    @click="clickable && $emit('click', orden)"
  >
    <header class="orden-card-head">
      <div class="orden-card-numero">
        <WrenchScrewdriverIcon class="orden-card-icon" />
        <span>{{ orden.numero }}</span>
      </div>
      <div class="orden-card-badges">
        <PrioridadBadge :prioridad="orden.prioridad" size="sm" />
        <EstadoBadge :estado="orden.estado" size="sm" />
      </div>
    </header>

    <h3 class="orden-card-title">{{ orden.activo_nombre }}</h3>
    <p class="orden-card-tipo">{{ orden.tipo }}</p>

    <footer class="orden-card-foot">
      <span class="orden-card-meta">
        <UserCircleIcon class="orden-card-icon-sm" />
        {{ orden.tecnico_nombre ?? 'Sin asignar' }}
      </span>
      <span :class="['orden-card-meta', { 'orden-card-meta--danger': vencida }]">
        <CalendarDaysIcon class="orden-card-icon-sm" />
        {{ diasLabel }}
      </span>
      <ChevronRightIcon v-if="clickable" class="orden-card-chevron" />
    </footer>
  </article>
</template>

<style scoped>
.orden-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
  position: relative;
}
.orden-card--clickable { cursor: pointer; }
.orden-card--clickable:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}
.orden-card--vencida {
  border-left: 3px solid var(--color-danger);
  background: rgba(192,57,43,0.025);
}

.orden-card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.orden-card-numero {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.4px;
  color: var(--color-primary);
}
.orden-card-icon { width: 14px; height: 14px; }
.orden-card-icon-sm { width: 13px; height: 13px; flex-shrink: 0; }
.orden-card-badges { display: inline-flex; gap: 6px; flex-wrap: wrap; }

.orden-card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 2px;
  line-height: 1.35;
}
.orden-card-tipo {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0 0 12px;
}

.orden-card-foot {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.orden-card-meta {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.orden-card-meta--danger {
  color: var(--color-danger);
  font-weight: 600;
}
.orden-card-chevron {
  width: 16px;
  height: 16px;
  color: var(--color-text-disabled);
  margin-left: auto;
}
</style>
