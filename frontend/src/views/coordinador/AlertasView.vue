<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAlertasStore } from '@/stores/alertas'
import AppShell    from '@/components/layout/AppShell.vue'
import EmptyState  from '@/components/ui/EmptyState.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import AlertaCard  from '@/components/alertas/AlertaCard.vue'
import {
  ChevronDownIcon,
  FireIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/outline'

const router  = useRouter()
const alertas = useAlertasStore()

// ─── Clasificación ────────────────────────────────────────────
// rojo  → vencidas o riesgo_falla
// naranja → próximos 0-5 días
// amarillo → próximos 6-15 días

function clasificar(a) {
  if (a.tipo === 'riesgo_falla') return 'rojo'
  if (a.dias_restantes === null || a.dias_restantes === undefined) return 'amarillo'
  if (a.dias_restantes < 0)  return 'rojo'
  if (a.dias_restantes <= 5) return 'naranja'
  return 'amarillo'
}

const pendientes = computed(() => alertas.list.filter(a => !a.atendida))

const vencidas  = computed(() => pendientes.value.filter(a => clasificar(a) === 'rojo'))
const proximas5 = computed(() => pendientes.value.filter(a => clasificar(a) === 'naranja'))
const proximas15 = computed(() => pendientes.value.filter(a => clasificar(a) === 'amarillo'))

const secciones = computed(() => [
  {
    key:   'vencidas',
    label: 'Crítico — Intervención inmediata',
    descripcion: 'Mantenimientos vencidos o equipos con riesgo de falla',
    color: 'rojo',
    icon:  FireIcon,
    alertas: vencidas.value,
  },
  {
    key:   'proximas5',
    label: 'Urgente — Esta semana',
    descripcion: 'Mantenimientos que vencen en los próximos 5 días',
    color: 'naranja',
    icon:  ExclamationTriangleIcon,
    alertas: proximas5.value,
  },
  {
    key:   'proximas15',
    label: 'Próximo — Planificar ahora',
    descripcion: 'Mantenimientos que vencen en los próximos 15 días',
    color: 'amarillo',
    icon:  ClockIcon,
    alertas: proximas15.value,
  },
])

// ─── Estado colapsado ─────────────────────────────────────────
const colapsadas = ref({})
function toggle(key) {
  colapsadas.value[key] = !colapsadas.value[key]
}
function isColapsada(key) {
  return colapsadas.value[key] === true
}

// ─── Acciones ─────────────────────────────────────────────────
function crearOT(alerta) {
  router.push({ path: '/coordinador/ordenes/nueva', query: { alerta: alerta.id } })
}
function verActivo(alerta) {
  router.push(`/coordinador/activos/${alerta.activo_id}`)
}

const totalPendientes = computed(() => pendientes.value.length)
const sinPendientes   = computed(() => totalPendientes.value === 0)

onMounted(async () => {
  if (alertas.list.length === 0) await alertas.fetchAll()
})
</script>

<template>
  <AppShell>
    <header class="alertas-header">
      <div>
        <h1 class="alertas-title">Centro de alertas</h1>
        <p class="alertas-subtitle">
          <template v-if="totalPendientes > 0">
            {{ totalPendientes }} {{ totalPendientes === 1 ? 'alerta pendiente' : 'alertas pendientes' }} en tu institución
          </template>
          <template v-else>Sin alertas pendientes</template>
        </p>
      </div>
    </header>

    <div v-if="!alertas.loading && totalPendientes > 0" class="alertas-intro">
      <InformationCircleIcon class="alertas-intro-icon" />
      <p class="alertas-intro-text">
        El motor EduTrack AI analiza el ciclo de vida de cada equipo y genera estas alertas automáticamente.
        Atiende primero las secciones <strong>Crítico</strong> y <strong>Urgente</strong> representan mantenimientos vencidos
        o equipos en riesgo de falla que afectan la operación del colegio.
      </p>
    </div>

    <!-- Loading -->
    <div v-if="alertas.loading && alertas.list.length === 0" class="alertas-skeletons">
      <SkeletonLoader v-for="n in 3" :key="n" width="100%" height="100px" />
    </div>

    <!-- Empty -->
    <EmptyState
      v-else-if="sinPendientes"
      title="¡Sin alertas pendientes!"
      description="Todos los mantenimientos están al día. Excelente trabajo."
    >
      <template #illustration>
        <CheckCircleIcon class="alertas-empty-icon" />
      </template>
    </EmptyState>

    <!-- Secciones -->
    <div v-else class="alertas-secciones">
      <section
        v-for="sec in secciones"
        :key="sec.key"
        :class="['alerta-seccion', `alerta-seccion--${sec.color}`]"
      >
        <header
          class="alerta-seccion-head"
          role="button"
          tabindex="0"
          @click="toggle(sec.key)"
          @keydown.enter="toggle(sec.key)"
          @keydown.space.prevent="toggle(sec.key)"
        >
          <div class="alerta-seccion-icon">
            <component :is="sec.icon" />
          </div>
          <div class="alerta-seccion-meta">
            <h2 class="alerta-seccion-title">{{ sec.label }}</h2>
            <p class="alerta-seccion-desc">{{ sec.descripcion }}</p>
          </div>
          <div class="alerta-seccion-counter">
            <span class="alerta-seccion-count">{{ sec.alertas.length }}</span>
            <span class="alerta-seccion-count-label">
              {{ sec.alertas.length === 1 ? 'alerta' : 'alertas' }}
            </span>
          </div>
          <ChevronDownIcon
            :class="['alerta-seccion-chevron', { 'alerta-seccion-chevron--rotated': isColapsada(sec.key) }]"
          />
        </header>

        <div v-if="!isColapsada(sec.key)" class="alerta-seccion-body">
          <div v-if="sec.alertas.length === 0" class="alerta-seccion-empty">
            Sin alertas en esta categoría
          </div>
          <div v-else class="alerta-seccion-lista">
            <AlertaCard
              v-for="a in sec.alertas"
              :key="a.id"
              :alerta="a"
              :variant="sec.color"
              @crear-ot="crearOT"
              @ver-activo="verActivo"
            />
          </div>
        </div>
      </section>
    </div>
  </AppShell>
</template>

<style scoped>
.alertas-header { margin-bottom: 12px; }
.alertas-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}
.alertas-subtitle {
  font-size: 13.5px;
  color: var(--color-text-secondary);
  margin: 0;
}

.alertas-intro {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  background: var(--color-info-bg);
  border: 1px solid rgba(41, 128, 185, 0.2);
  border-radius: var(--radius-lg);
  margin-bottom: 20px;
}
.alertas-intro-icon {
  width: 18px;
  height: 18px;
  color: var(--color-info);
  flex-shrink: 0;
  margin-top: 1px;
}
.alertas-intro-text {
  font-size: 13px;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.55;
}

.alertas-skeletons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.alertas-empty-icon {
  width: 64px;
  height: 64px;
  color: var(--color-success);
}

.alertas-secciones {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.alerta-seccion {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.alerta-seccion--rojo    { border-color: rgba(192, 57, 43, 0.25); }
.alerta-seccion--naranja { border-color: rgba(211, 84, 0, 0.25); }
.alerta-seccion--amarillo { border-color: rgba(224, 180, 0, 0.25); }

.alerta-seccion--rojo    .alerta-seccion-head { background: rgba(192, 57, 43, 0.03); }
.alerta-seccion--naranja .alerta-seccion-head { background: rgba(211, 84, 0, 0.03); }
.alerta-seccion--amarillo .alerta-seccion-head { background: rgba(224, 180, 0, 0.02); }

.alerta-seccion-head {
  display: grid;
  grid-template-columns: 44px 1fr auto auto;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;
  transition: background var(--transition-fast);
}
.alerta-seccion-head:hover { background: var(--color-bg); }
.alerta-seccion-head:focus-visible { outline: 2px solid var(--color-primary); outline-offset: -2px; }

.alerta-seccion-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}
.alerta-seccion-icon :deep(svg) { width: 22px; height: 22px; }
.alerta-seccion--rojo .alerta-seccion-icon     { background: var(--color-danger-bg);  color: var(--color-danger); }
.alerta-seccion--naranja .alerta-seccion-icon  { background: var(--color-warning-bg); color: var(--color-warning); }
.alerta-seccion--amarillo .alerta-seccion-icon { background: #FFF8DA;                 color: #9A7800; }

.alerta-seccion-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}
.alerta-seccion-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 2px 0 0;
}

.alerta-seccion-counter {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0;
}
.alerta-seccion-count {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.alerta-seccion--rojo .alerta-seccion-count     { color: var(--color-danger); }
.alerta-seccion--naranja .alerta-seccion-count  { color: var(--color-warning); }
.alerta-seccion--amarillo .alerta-seccion-count { color: #9A7800; }
.alerta-seccion-count-label {
  font-size: 11px;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.alerta-seccion-chevron {
  width: 20px;
  height: 20px;
  color: var(--color-text-secondary);
  transition: transform var(--transition-fast);
}
.alerta-seccion-chevron--rotated { transform: rotate(-90deg); }

.alerta-seccion-body {
  padding: 4px 16px 16px;
  border-top: 1px solid var(--color-border);
}
.alerta-seccion-empty {
  padding: 16px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
  font-style: italic;
}
.alerta-seccion-lista {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}
</style>
