<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOrdenesStore } from '@/stores/ordenes'
import { useActivosStore } from '@/stores/activos'
import * as activosApi from '@/api/activos.api'
import { useToast } from '@/composables/useToast'
import MobileShell    from '@/components/layout/MobileShell.vue'
import EduCard        from '@/components/ui/EduCard.vue'
import EduButton      from '@/components/ui/EduButton.vue'
import EmptyState     from '@/components/ui/EmptyState.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EstadoBadge    from '@/components/ordenes/EstadoBadge.vue'
import PrioridadBadge from '@/components/ordenes/PrioridadBadge.vue'
import {
  ArrowLeftIcon,
  CubeIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  PlayCircleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  EyeIcon,
} from '@heroicons/vue/24/outline'

const router  = useRouter()
const route   = useRoute()
const ordenes = useOrdenesStore()
const activos = useActivosStore()
const { success, danger: toastError } = useToast()

const orden     = computed(() => ordenes.current)
const activo    = computed(() => activos.list.find(a => a.id === orden.value?.activo_id))
const loading   = ref(true)
const historial = ref([])
const historialOpen = ref(false)
const cambiando = ref(false)

async function load() {
  loading.value = true
  try {
    const promises = [ordenes.fetchOne(route.params.id)]
    if (activos.list.length === 0) promises.push(activos.fetchAll())
    await Promise.all(promises)
    if (orden.value?.activo_id) {
      historial.value = (await activosApi.getHistorial(orden.value.activo_id)).slice(0, 3)
    }
  } finally {
    loading.value = false
  }
}
onMounted(load)

// ─── Días restantes ──────────────────────────────────────────
const diasRestantes = computed(() => {
  if (!orden.value?.fecha_limite) return null
  const hoy = new Date(); hoy.setHours(0,0,0,0)
  const lim = new Date(orden.value.fecha_limite)
  return Math.floor((lim - hoy) / (1000 * 60 * 60 * 24))
})
const fechaLabel = computed(() => {
  const d = diasRestantes.value
  if (d === null) return 'Sin fecha'
  if (d < 0)  return `Vencida hace ${Math.abs(d)} ${Math.abs(d) === 1 ? 'día' : 'días'}`
  if (d === 0) return 'Vence hoy'
  if (d === 1) return 'Vence mañana'
  return `En ${d} días`
})
const fechaVariant = computed(() => {
  const d = diasRestantes.value
  if (d === null) return 'default'
  if (d < 0)  return 'danger'
  if (d <= 2) return 'warning'
  return 'default'
})

// ─── Acción primaria según estado ────────────────────────────
async function aceptar() {
  cambiando.value = true
  try {
    await ordenes.updateEstado(orden.value.id, 'aceptada', { usuario: orden.value.tecnico_nombre })
    success('Orden aceptada')
  } catch {
    toastError('No se pudo aceptar la orden')
  } finally {
    cambiando.value = false
  }
}

function irAEjecutar() {
  router.push(`/tecnico/ordenes/${orden.value.id}/ejecutar`)
}
</script>

<template>
  <MobileShell title="Orden de trabajo">
    <button class="ot-back" type="button" @click="router.push('/tecnico/ordenes')">
      <ArrowLeftIcon class="ot-icon" />
      Mis órdenes
    </button>

    <div v-if="loading" class="ot-loading">
      <SkeletonLoader width="100%" height="180px" />
      <SkeletonLoader width="100%" height="120px" />
    </div>

    <EmptyState
      v-else-if="!orden"
      title="Orden no encontrada"
      description="No pudimos cargar esta orden de trabajo."
    >
      <template #action>
        <EduButton variant="primary" size="lg-mobile" @click="router.push('/tecnico/ordenes')">
          Volver
        </EduButton>
      </template>
    </EmptyState>

    <template v-else>
      <!-- Header -->
      <header class="ot-header">
        <span class="ot-numero">
          <WrenchScrewdriverIcon class="ot-icon" />
          {{ orden.numero }}
        </span>
        <div class="ot-badges">
          <PrioridadBadge :prioridad="orden.prioridad" size="md" />
          <EstadoBadge :estado="orden.estado" size="md" />
        </div>
        <h1 class="ot-title">{{ orden.activo_nombre }}</h1>
      </header>

      <!-- Info activo -->
      <EduCard padding="sm" class="ot-card">
        <div class="ot-activo">
          <div class="ot-activo-icon">
            <CubeIcon />
          </div>
          <div class="ot-activo-info">
            <p class="ot-activo-meta">
              <MapPinIcon class="ot-icon-sm" />
              {{ orden.activo_ubicacion ?? activo?.ubicacion ?? 'Ubicación no disponible' }}
            </p>
            <p class="ot-activo-modelo" v-if="activo">
              {{ activo.marca }} · {{ activo.modelo }}
            </p>
          </div>
        </div>

        <div :class="['ot-fecha', `ot-fecha--${fechaVariant}`]">
          <CalendarDaysIcon class="ot-icon-sm" />
          <span><strong>{{ fechaLabel }}</strong> · {{ orden.fecha_limite }}</span>
        </div>
      </EduCard>

      <!-- Descripción tarea -->
      <EduCard class="ot-card">
        <template #header>
          <h2 class="ot-section-title">
            <ClockIcon class="ot-icon" />
            Tarea asignada
          </h2>
        </template>
        <p class="ot-tipo">{{ orden.tipo }}</p>
        <p class="ot-desc">{{ orden.descripcion }}</p>
      </EduCard>

      <!-- Acordeón historial -->
      <button
        type="button"
        :class="['ot-accordion-trigger', { 'ot-accordion-trigger--open': historialOpen }]"
        @click="historialOpen = !historialOpen"
        :aria-expanded="historialOpen"
      >
        <span>
          <WrenchScrewdriverIcon class="ot-icon" />
          Historial del activo
          <span class="ot-accordion-count">{{ historial.length }}</span>
        </span>
        <ChevronDownIcon class="ot-icon ot-accordion-chevron" />
      </button>
      <div v-if="historialOpen" class="ot-accordion-body">
        <ul v-if="historial.length > 0" class="ot-historial">
          <li v-for="h in historial" :key="h.id" class="ot-historial-item">
            <div class="ot-historial-head">
              <span class="ot-historial-tipo">{{ h.tipo }}</span>
              <span class="ot-historial-fecha">{{ h.fecha }}</span>
            </div>
            <p class="ot-historial-desc">{{ h.descripcion }}</p>
            <p class="ot-historial-tecnico">por <strong>{{ h.tecnico }}</strong></p>
          </li>
        </ul>
        <p v-else class="ot-historial-vacio">Sin intervenciones registradas para este activo.</p>
      </div>

      <!-- Cierre (si cerrada) -->
      <EduCard v-if="orden.estado === 'cerrada'" class="ot-card ot-card--cierre">
        <template #header>
          <h2 class="ot-section-title">
            <CheckCircleIcon class="ot-icon" />
            Cierre de la orden
          </h2>
        </template>
        <p class="ot-desc">{{ orden.descripcion_cierre ?? 'Sin descripción de cierre.' }}</p>
        <p class="ot-cierre-fecha">Cerrada el {{ orden.cerrada_en }}</p>
      </EduCard>

      <!-- Acción primaria -->
      <div class="ot-cta">
        <EduButton
          v-if="orden.estado === 'pendiente'"
          variant="primary"
          size="lg-mobile"
          :loading="cambiando"
          @click="aceptar"
        >
          <CheckCircleIcon class="ot-icon" />
          Confirmar que estoy en el lugar
        </EduButton>

        <EduButton
          v-else-if="orden.estado === 'aceptada'"
          variant="primary"
          size="lg-mobile"
          @click="irAEjecutar"
        >
          <PlayCircleIcon class="ot-icon" />
          Iniciar ejecución
        </EduButton>

        <EduButton
          v-else-if="orden.estado === 'en_ejecucion'"
          variant="primary"
          size="lg-mobile"
          @click="irAEjecutar"
        >
          <WrenchScrewdriverIcon class="ot-icon" />
          Continuar ejecución
        </EduButton>

        <EduButton
          v-else-if="orden.estado === 'cerrada'"
          variant="outline-gray"
          size="lg-mobile"
          @click="router.push('/tecnico/ordenes')"
        >
          <EyeIcon class="ot-icon" />
          Volver a mis órdenes
        </EduButton>
      </div>
    </template>
  </MobileShell>
</template>

<style scoped>
.ot-icon    { width: 18px; height: 18px; flex-shrink: 0; }
.ot-icon-sm { width: 14px; height: 14px; flex-shrink: 0; }

.ot-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  padding: 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-primary);
  cursor: pointer;
  font-family: inherit;
  margin-bottom: 12px;
  min-height: 48px;
}

.ot-loading { display: flex; flex-direction: column; gap: 12px; }

/* Header */
.ot-header { margin-bottom: 16px; }
.ot-numero {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.6px;
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 4px 12px;
  border-radius: 9999px;
  margin-bottom: 10px;
}
.ot-badges { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.ot-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.25;
}

/* Cards */
.ot-card { margin-bottom: 12px; }
.ot-section-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

/* Info activo */
.ot-activo {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}
.ot-activo-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ot-activo-icon :deep(svg) { width: 22px; height: 22px; }
.ot-activo-info { flex: 1; min-width: 0; }
.ot-activo-meta {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}
.ot-activo-modelo {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 2px 0 0;
}

.ot-fecha {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--color-bg);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--color-text-primary);
  width: 100%;
  box-sizing: border-box;
}
.ot-fecha--warning { background: var(--color-warning-bg); color: var(--color-warning); }
.ot-fecha--danger  { background: var(--color-danger-bg);  color: var(--color-danger); }

.ot-tipo {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 3px 10px;
  border-radius: 9999px;
  margin: 0 0 10px;
}
.ot-desc {
  font-size: 15px;
  color: var(--color-text-primary);
  line-height: 1.55;
  margin: 0;
}

/* Acordeón */
.ot-accordion-trigger {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  cursor: pointer;
  margin-bottom: 12px;
  min-height: 56px;
}
.ot-accordion-trigger > span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ot-accordion-trigger--open { border-radius: var(--radius-lg) var(--radius-lg) 0 0; border-bottom-color: transparent; margin-bottom: 0; }
.ot-accordion-chevron { transition: transform var(--transition-fast); }
.ot-accordion-trigger--open .ot-accordion-chevron { transform: rotate(180deg); }
.ot-accordion-count {
  font-size: 12px;
  font-weight: 700;
  background: var(--color-bg);
  color: var(--color-text-primary);
  padding: 2px 8px;
  border-radius: 9999px;
}
.ot-accordion-body {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-top: none;
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  padding: 12px 16px 16px;
  margin-bottom: 12px;
}

.ot-historial {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ot-historial-item {
  padding: 10px 12px;
  background: var(--color-bg);
  border-radius: var(--radius-md);
}
.ot-historial-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 4px;
}
.ot-historial-tipo {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-primary);
}
.ot-historial-fecha {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.ot-historial-desc {
  font-size: 13px;
  color: var(--color-text-primary);
  line-height: 1.45;
  margin: 0;
}
.ot-historial-tecnico {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 4px 0 0;
}
.ot-historial-tecnico strong { color: var(--color-text-primary); font-weight: 600; }
.ot-historial-vacio {
  font-size: 13px;
  color: var(--color-text-secondary);
  text-align: center;
  margin: 0;
  padding: 10px;
  font-style: italic;
}

.ot-card--cierre {
  border-color: rgba(30, 132, 73, 0.3);
}
.ot-cierre-fecha {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 8px 0 0;
}

/* CTA */
.ot-cta {
  position: sticky;
  bottom: 0;
  margin: 20px -16px -16px;
  padding: 14px 16px env(safe-area-inset-bottom);
  background: linear-gradient(to top, var(--color-bg) 70%, rgba(247, 244, 251, 0));
}
</style>
