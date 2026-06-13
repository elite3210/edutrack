<script setup>
import { computed } from 'vue'
import EduButton from '@/components/ui/EduButton.vue'
import {
  ExclamationTriangleIcon,
  ClockIcon,
  FireIcon,
  MapPinIcon,
  PlusIcon,
  CheckCircleIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
  alerta:    { type: Object, required: true },
  variant:   { type: String, default: 'amarillo' }, // rojo | naranja | amarillo
})

defineEmits(['crear-ot', 'ver-activo'])

const tipoLabel = computed(() => ({
  mantenimiento_vencido: 'Mantenimiento vencido',
  mantenimiento_proximo: 'Mantenimiento próximo',
  riesgo_falla:          'Riesgo de falla',
})[props.alerta.tipo] ?? props.alerta.tipo)

const icon = computed(() => ({
  rojo:     FireIcon,
  naranja:  ExclamationTriangleIcon,
  amarillo: ClockIcon,
})[props.variant])

const tiempoLabel = computed(() => {
  const d = props.alerta.dias_restantes
  if (d === null || d === undefined) return null
  if (d < 0)  return `Vencida hace ${Math.abs(d)} ${Math.abs(d) === 1 ? 'día' : 'días'}`
  if (d === 0) return 'Vence hoy'
  if (d === 1) return 'En 1 día'
  return `En ${d} días`
})
</script>

<template>
  <article :class="['alerta-card', `alerta-card--${variant}`, { 'alerta-card--atendida': alerta.atendida }]">
    <div class="alerta-card-icon">
      <component :is="icon" />
    </div>

    <div class="alerta-card-body">
      <div class="alerta-card-head">
        <span class="alerta-card-tipo">{{ tipoLabel }}</span>
        <span v-if="tiempoLabel" class="alerta-card-tiempo">{{ tiempoLabel }}</span>
      </div>
      <h3 class="alerta-card-title">{{ alerta.activo_nombre }}</h3>
      <p class="alerta-card-meta">
        <MapPinIcon class="alerta-card-icon-sm" />
        {{ alerta.ubicacion }}
      </p>
      <p class="alerta-card-mensaje">{{ alerta.mensaje }}</p>
    </div>

    <div class="alerta-card-actions">
      <EduButton
        v-if="!alerta.atendida"
        variant="primary"
        size="sm"
        @click.stop="$emit('crear-ot', alerta)"
      >
        <PlusIcon class="alerta-card-icon-sm" />
        Crear OT
      </EduButton>
      <EduButton
        v-if="!alerta.atendida"
        variant="ghost"
        size="sm"
        @click.stop="$emit('ver-activo', alerta)"
      >
        Ver activo
      </EduButton>
      <span v-else class="alerta-card-atendida">
        <CheckCircleIcon class="alerta-card-icon-sm" />
        Atendida
      </span>
    </div>
  </article>
</template>

<style scoped>
.alerta-card {
  display: grid;
  grid-template-columns: 44px 1fr auto;
  gap: 14px;
  padding: 14px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  align-items: center;
}
.alerta-card--rojo     { border-left: 4px solid var(--color-danger); }
.alerta-card--naranja  { border-left: 4px solid var(--color-warning); }
.alerta-card--amarillo { border-left: 4px solid #E0B400; }
.alerta-card--atendida { opacity: 0.7; }

.alerta-card-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}
.alerta-card-icon :deep(svg) { width: 22px; height: 22px; }
.alerta-card-icon-sm { width: 13px; height: 13px; flex-shrink: 0; }

.alerta-card--rojo .alerta-card-icon     { background: var(--color-danger-bg);  color: var(--color-danger); }
.alerta-card--naranja .alerta-card-icon  { background: var(--color-warning-bg); color: var(--color-warning); }
.alerta-card--amarillo .alerta-card-icon { background: #FFF8DA;                 color: #9A7800; }

.alerta-card-body { min-width: 0; }
.alerta-card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}
.alerta-card-tipo {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--color-text-secondary);
}
.alerta-card-tiempo {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
  background: var(--color-bg);
  color: var(--color-text-primary);
}
.alerta-card--rojo .alerta-card-tiempo     { background: var(--color-danger-bg);  color: var(--color-danger); }
.alerta-card--naranja .alerta-card-tiempo  { background: var(--color-warning-bg); color: var(--color-warning); }
.alerta-card--amarillo .alerta-card-tiempo { background: #FFF8DA;                 color: #9A7800; }

.alerta-card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 4px;
  line-height: 1.35;
}
.alerta-card-meta {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0 0 6px;
}
.alerta-card-mensaje {
  font-size: 13px;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.5;
}

.alerta-card-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: stretch;
  flex-shrink: 0;
}
.alerta-card-atendida {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--color-success);
  font-weight: 600;
}

@media (max-width: 640px) {
  .alerta-card {
    grid-template-columns: 44px 1fr;
  }
  .alerta-card-actions {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: flex-end;
    padding-top: 4px;
    border-top: 1px solid var(--color-border);
  }
}
</style>
