<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore }      from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import { useAlertasStore }   from '@/stores/alertas'
import { useOrdenesStore }   from '@/stores/ordenes'
import AppShell      from '@/components/layout/AppShell.vue'
import MetricCard    from '@/components/dashboard/MetricCard.vue'
import EduCard       from '@/components/ui/EduCard.vue'
import EduButton     from '@/components/ui/EduButton.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EmptyState    from '@/components/ui/EmptyState.vue'
import {
  CubeIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  BellAlertIcon,
  ArrowRightIcon,
  ClockIcon,
  MapPinIcon,
  PlusIcon,
} from '@heroicons/vue/24/outline'

const router    = useRouter()
const auth      = useAuthStore()
const dashboard = useDashboardStore()
const alertas   = useAlertasStore()
const ordenes   = useOrdenesStore()

const nombre = computed(() => auth.user?.nombre?.split(' ')[0] ?? 'Coordinador')
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
})

const alertasRecientes = computed(() =>
  alertas.list.filter(a => !a.atendida).slice(0, 5),
)
const otsAbiertas = computed(() =>
  ordenes.list.filter(o => ['pendiente', 'aceptada', 'en_ejecucion'].includes(o.estado)).slice(0, 5),
)

const m = computed(() => dashboard.metricas ?? {
  total_activos: 0, activos_criticos: 0, ots_abiertas: 0, alertas_pendientes: 0,
})

function alertaVariant(diasRestantes) {
  if (diasRestantes === null || diasRestantes < 0) return 'danger'
  if (diasRestantes <= 5) return 'warning'
  return 'info'
}
function alertaLabel(a) {
  if (a.dias_restantes === null)  return 'Riesgo crítico'
  if (a.dias_restantes < 0)       return `Vencido hace ${Math.abs(a.dias_restantes)}d`
  if (a.dias_restantes === 0)     return 'Hoy'
  return `En ${a.dias_restantes}d`
}
function prioridadVariant(p) {
  return { alta: 'danger', media: 'warning', baja: 'info' }[p] ?? 'info'
}
function estadoEtiqueta(e) {
  return { pendiente: 'Pendiente', aceptada: 'Aceptada', en_ejecucion: 'En ejecución' }[e] ?? e
}

onMounted(async () => {
  await Promise.all([
    dashboard.fetchDashboard(),
    alertas.fetchAll(),
    ordenes.fetchAll(),
  ])
})
</script>

<template>
  <AppShell>
    <!-- Saludo -->
    <header class="dashboard-header">
      <div>
        <p class="dashboard-eyebrow">{{ greeting }},</p>
        <h1 class="dashboard-title">{{ nombre }}</h1>
        <p class="dashboard-subtitle">
          Aquí está el resumen de los activos de tu institución.
        </p>
      </div>
      <EduButton variant="primary" @click="router.push('/coordinador/activos/nuevo')">
        <PlusIcon class="dashboard-icon" />
        Registrar activo
      </EduButton>
    </header>

    <!-- Métricas -->
    <section class="dashboard-metrics">
      <template v-if="dashboard.loading">
        <SkeletonLoader v-for="n in 4" :key="n" width="100%" height="108px" />
      </template>
      <template v-else>
        <MetricCard
          label="Total activos"
          :value="m.total_activos"
          variant="primary"
          :icon="CubeIcon"
          helper="Equipos registrados"
          to="/coordinador/activos"
        />
        <MetricCard
          label="Críticos"
          :value="m.activos_criticos"
          variant="danger"
          :icon="ExclamationTriangleIcon"
          helper="Score menor a 40"
          to="/coordinador/activos?score=rojo"
        />
        <MetricCard
          label="OTs abiertas"
          :value="m.ots_abiertas"
          variant="info"
          :icon="ClipboardDocumentListIcon"
          helper="Pendientes y en ejecución"
          to="/coordinador/ordenes"
        />
        <MetricCard
          label="Alertas activas"
          :value="m.alertas_pendientes"
          variant="warning"
          :icon="BellAlertIcon"
          helper="Requieren atención"
          to="/coordinador/alertas"
        />
      </template>
    </section>

    <!-- Paneles laterales -->
    <section class="dashboard-grid">
      <!-- Alertas recientes -->
      <EduCard>
        <template #header>
          <div class="dashboard-panel-header">
            <div class="dashboard-panel-title">
              <span class="dashboard-panel-icon dashboard-panel-icon--warning">
                <BellAlertIcon />
              </span>
              <div>
                <h2>Alertas recientes</h2>
                <p>{{ alertas.totalPendientes }} pendientes</p>
              </div>
            </div>
            <router-link to="/coordinador/alertas" class="dashboard-panel-cta">
              Ver todas <ArrowRightIcon class="dashboard-icon" />
            </router-link>
          </div>
        </template>

        <div v-if="alertas.loading" class="dashboard-skeletons">
          <SkeletonLoader v-for="n in 3" :key="n" width="100%" height="56px" />
        </div>
        <EmptyState
          v-else-if="alertasRecientes.length === 0"
          title="Sin alertas pendientes"
          description="El motor EduTrack AI monitorea tus equipos y aparecerán aquí cuando requieran atención."
        />
        <ul v-else class="dashboard-list">
          <li v-for="a in alertasRecientes" :key="a.id" class="dashboard-list-item">
            <span
              class="dashboard-list-badge"
              :class="`dashboard-list-badge--${alertaVariant(a.dias_restantes)}`"
            >
              {{ alertaLabel(a) }}
            </span>
            <div class="dashboard-list-body">
              <p class="dashboard-list-title">{{ a.activo_nombre }}</p>
              <p class="dashboard-list-meta">
                <MapPinIcon class="dashboard-list-icon" />
                {{ a.ubicacion }}
              </p>
            </div>
            <button
              type="button"
              class="dashboard-list-action"
              @click="router.push(`/coordinador/ordenes/nueva?alerta=${a.id}`)"
            >
              Crear OT
            </button>
          </li>
        </ul>
      </EduCard>

      <!-- OTs abiertas -->
      <EduCard>
        <template #header>
          <div class="dashboard-panel-header">
            <div class="dashboard-panel-title">
              <span class="dashboard-panel-icon dashboard-panel-icon--info">
                <ClipboardDocumentListIcon />
              </span>
              <div>
                <h2>Órdenes abiertas</h2>
                <p>{{ otsAbiertas.length }} en proceso</p>
              </div>
            </div>
            <router-link to="/coordinador/ordenes" class="dashboard-panel-cta">
              Ver todas <ArrowRightIcon class="dashboard-icon" />
            </router-link>
          </div>
        </template>

        <div v-if="ordenes.loading" class="dashboard-skeletons">
          <SkeletonLoader v-for="n in 3" :key="n" width="100%" height="56px" />
        </div>
        <EmptyState
          v-else-if="otsAbiertas.length === 0"
          title="Sin órdenes abiertas"
          description="Crea una orden de trabajo para asignar una intervención técnica a un equipo."
        />
        <ul v-else class="dashboard-list">
          <li
            v-for="o in otsAbiertas"
            :key="o.id"
            class="dashboard-list-item dashboard-list-item--clickable"
            @click="router.push(`/coordinador/ordenes/${o.id}`)"
          >
            <span
              class="dashboard-list-badge"
              :class="`dashboard-list-badge--${prioridadVariant(o.prioridad)}`"
            >
              {{ o.prioridad }}
            </span>
            <div class="dashboard-list-body">
              <p class="dashboard-list-title">
                <span class="dashboard-list-numero">{{ o.numero }}</span>
                · {{ o.activo_nombre }}
              </p>
              <p class="dashboard-list-meta">
                <ClockIcon class="dashboard-list-icon" />
                {{ estadoEtiqueta(o.estado) }} · vence {{ o.fecha_limite }}
              </p>
            </div>
          </li>
        </ul>
      </EduCard>
    </section>
  </AppShell>
</template>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}
.dashboard-eyebrow {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0 0 4px;
}
.dashboard-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--color-text-primary);
  margin: 0 0 6px;
}
.dashboard-subtitle {
  font-size: 14.5px;
  color: var(--color-text-secondary);
  margin: 0;
}
.dashboard-icon { width: 16px; height: 16px; margin-right: 6px; }

.dashboard-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}
@media (max-width: 900px) {
  .dashboard-metrics { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 520px) {
  .dashboard-metrics { grid-template-columns: 1fr; }
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
@media (max-width: 980px) {
  .dashboard-grid { grid-template-columns: 1fr; }
}

.dashboard-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}
.dashboard-panel-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}
.dashboard-panel-title h2 {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}
.dashboard-panel-title p {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0;
}
.dashboard-panel-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}
.dashboard-panel-icon :deep(svg) { width: 18px; height: 18px; }
.dashboard-panel-icon--warning {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}
.dashboard-panel-icon--info {
  background: var(--color-info-bg);
  color: var(--color-info);
}
.dashboard-panel-cta {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}
.dashboard-panel-cta:hover { color: var(--color-primary-hover); }

.dashboard-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dashboard-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}
.dashboard-list-item--clickable {
  cursor: pointer;
}
.dashboard-list-item--clickable:hover {
  background: var(--color-bg);
}
.dashboard-list-badge {
  flex-shrink: 0;
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 3px 10px;
  border-radius: 9999px;
  text-align: center;
  white-space: nowrap;
}
.dashboard-list-badge--danger  { background: var(--color-danger-bg);  color: var(--color-danger);  }
.dashboard-list-badge--warning { background: var(--color-warning-bg); color: var(--color-warning); }
.dashboard-list-badge--info    { background: var(--color-info-bg);    color: var(--color-info);    }
.dashboard-list-body {
  flex: 1;
  min-width: 0;
}
.dashboard-list-title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dashboard-list-numero {
  color: var(--color-primary);
  font-weight: 700;
  margin-right: 2px;
}
.dashboard-list-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 2px 0 0;
}
.dashboard-list-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}
.dashboard-list-action {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  font-family: inherit;
  transition: background var(--transition-fast);
}
.dashboard-list-action:hover {
  background: var(--color-primary);
  color: #fff;
}
.dashboard-skeletons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
