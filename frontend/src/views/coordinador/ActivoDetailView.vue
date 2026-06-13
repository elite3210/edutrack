<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useActivosStore } from '@/stores/activos'
import * as activosApi from '@/api/activos.api'
import AppShell      from '@/components/layout/AppShell.vue'
import EduCard       from '@/components/ui/EduCard.vue'
import EduButton     from '@/components/ui/EduButton.vue'
import EduBadge      from '@/components/ui/EduBadge.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EmptyState    from '@/components/ui/EmptyState.vue'
import EduScoreRing  from '@/components/activos/EduScoreRing.vue'
import QrCodeDisplay from '@/components/activos/QrCodeDisplay.vue'
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  PlusIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CubeIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'

const router  = useRouter()
const route   = useRoute()
const activos = useActivosStore()

const activo    = computed(() => activos.current)
const loading   = ref(true)
const plan      = ref(null)
const historial = ref([])
const tab       = ref('info') // info | plan | historial

async function load() {
  loading.value = true
  try {
    const [, planData, histData] = await Promise.all([
      activos.fetchOne(route.params.id),
      activosApi.getPlan(route.params.id),
      activosApi.getHistorial(route.params.id),
    ])
    plan.value      = planData
    historial.value = histData
  } finally {
    loading.value = false
  }
}
onMounted(load)

const estadoVariant = computed(() => ({
  operativo: 'success', en_mantenimiento: 'warning', baja: 'danger',
})[activo.value?.estado] ?? 'default')
const estadoLabel = computed(() => ({
  operativo: 'Operativo', en_mantenimiento: 'En mantenimiento', baja: 'De baja',
})[activo.value?.estado] ?? activo.value?.estado)

const factores = computed(() => {
  if (!plan.value?.factores) return []
  return [
    { key: 'vida_util',          label: 'Vida útil restante',  value: plan.value.factores.vida_util,         help: 'Antigüedad vs vida útil del fabricante.' },
    { key: 'cumplimiento',       label: 'Cumplimiento del plan', value: plan.value.factores.cumplimiento,   help: 'Mantenimientos preventivos ejecutados a tiempo.' },
    { key: 'frecuencia_fallas',  label: 'Frecuencia de fallas', value: plan.value.factores.frecuencia_fallas, help: 'Histórico de correctivos del último año.' },
    { key: 'recencia',           label: 'Recencia de intervención', value: plan.value.factores.recencia,    help: 'Días desde el último mantenimiento.' },
  ]
})

const tabs = [
  { key: 'info',      label: 'Información',     icon: InformationCircleIcon },
  { key: 'plan',      label: 'Plan de mantenimiento', icon: ClipboardDocumentListIcon },
  { key: 'historial', label: 'Historial',        icon: WrenchScrewdriverIcon },
]

function tareaEstadoVariant(e) {
  return { programado: 'info', vencido: 'danger', completado: 'success' }[e] ?? 'default'
}
function tareaEstadoLabel(e) {
  return { programado: 'Programado', vencido: 'Vencido', completado: 'Completado' }[e] ?? e
}
</script>

<template>
  <AppShell>
    <button class="detail-back" type="button" @click="router.push('/coordinador/activos')">
      <ArrowLeftIcon class="detail-icon" />
      Activos
    </button>

    <!-- Loading -->
    <div v-if="loading" class="detail-loading">
      <SkeletonLoader width="60%" height="32px" />
      <SkeletonLoader width="100%" height="180px" style="margin-top: 16px" />
    </div>

    <!-- Activo no encontrado -->
    <EmptyState
      v-else-if="!activo"
      title="Activo no encontrado"
      description="No pudimos cargar el activo. Puede que haya sido eliminado o no exista."
    >
      <template #action>
        <EduButton variant="primary" @click="router.push('/coordinador/activos')">
          Volver a la lista
        </EduButton>
      </template>
    </EmptyState>

    <template v-else>
      <!-- Header -->
      <header class="detail-header">
        <div class="detail-header-main">
          <div class="detail-header-top">
            <div class="detail-header-icon">
              <CubeIcon />
            </div>
            <div>
              <span class="detail-categoria">{{ activo.categoria }}</span>
              <h1 class="detail-title">{{ activo.nombre }}</h1>
            </div>
          </div>
          <div class="detail-meta">
            <span class="detail-meta-item">
              <CubeIcon class="detail-icon-sm" />
              {{ activo.marca }} · {{ activo.modelo }}
            </span>
            <span class="detail-meta-item">
              <MapPinIcon class="detail-icon-sm" />
              {{ activo.ubicacion }}
            </span>
            <EduBadge :variant="estadoVariant" size="md">{{ estadoLabel }}</EduBadge>
          </div>
          <div v-if="activo.numero_serie" class="detail-serie">
            S/N: <strong>{{ activo.numero_serie }}</strong>
          </div>
        </div>
        <div class="detail-header-actions">
          <EduButton variant="outline-gray" @click="router.push(`/coordinador/activos/${activo.id}/editar`)">
            <PencilSquareIcon class="detail-icon" />
            Editar
          </EduButton>
          <EduButton variant="primary" @click="router.push(`/coordinador/ordenes/nueva?activo=${activo.id}`)">
            <PlusIcon class="detail-icon" />
            Crear OT
          </EduButton>
        </div>
      </header>

      <!-- Score + factores + QR — unified card -->
      <section class="detail-score-row">
        <EduCard>
          <div class="detail-score-layout">

            <!-- Score ring -->
            <div class="detail-score-ring-col">
              <EduScoreRing :score="activo.score" size="xl" show-label />
              <p class="detail-score-help">Score calculado por<br>el motor EduTrack AI.</p>
            </div>

            <div class="detail-score-sep" />

            <!-- Factor bars -->
            <div class="detail-factores">
              <p class="detail-factores-title">Desglose del score</p>
              <div v-if="factores.length === 0" class="detail-factores-empty">
                Sin datos de plan de mantenimiento aún. El score se calculará cuando se registren intervenciones.
              </div>
              <ul v-else class="detail-factores-list">
                <li v-for="f in factores" :key="f.key" class="detail-factor">
                  <div class="detail-factor-head">
                    <span class="detail-factor-label">{{ f.label }}</span>
                    <span class="detail-factor-value">{{ f.value }}/100</span>
                  </div>
                  <div class="detail-factor-bar">
                    <span class="detail-factor-bar-fill" :style="{ width: `${f.value}%`, background: f.value >= 70 ? 'var(--color-success)' : f.value >= 40 ? 'var(--color-warning)' : 'var(--color-danger)' }" />
                  </div>
                  <p class="detail-factor-help">{{ f.help }}</p>
                </li>
              </ul>
            </div>

            <div class="detail-score-sep" />

            <!-- QR -->
            <div class="detail-qr-col">
              <p class="detail-qr-title">Código QR del activo</p>
              <p class="detail-qr-help">Pégalo en el equipo para reportes vía celular.</p>
              <QrCodeDisplay :codigo="activo.codigo_qr" :size="140" />
            </div>

          </div>
        </EduCard>
      </section>

      <!-- Tabs -->
      <nav class="detail-tabs" role="tablist">
        <button
          v-for="t in tabs"
          :key="t.key"
          type="button"
          :class="['detail-tab', { 'detail-tab--active': tab === t.key }]"
          :aria-selected="tab === t.key"
          role="tab"
          @click="tab = t.key"
        >
          <component :is="t.icon" class="detail-icon" />
          {{ t.label }}
        </button>
      </nav>

      <!-- Tab: Información -->
      <section v-if="tab === 'info'" class="detail-panel">
        <EduCard>
          <ul class="detail-info-grid">
            <li>
              <span>Ubicación</span>
              <strong>{{ activo.ubicacion }}</strong>
            </li>
            <li>
              <span>Marca</span>
              <strong>{{ activo.marca }}</strong>
            </li>
            <li>
              <span>Modelo</span>
              <strong>{{ activo.modelo }}</strong>
            </li>
            <li>
              <span>Categoría</span>
              <strong>{{ activo.categoria }}</strong>
            </li>
            <li>
              <span>Fecha de instalación</span>
              <strong>
                <CalendarDaysIcon class="detail-icon-sm" />
                {{ activo.fecha_instalacion }}
              </strong>
            </li>
            <li>
              <span>Estado actual</span>
              <strong>
                <EduBadge :variant="estadoVariant" size="sm">{{ estadoLabel }}</EduBadge>
              </strong>
            </li>
            <li>
              <span>Número de serie</span>
              <strong>{{ activo.numero_serie || '—' }}</strong>
            </li>
            <li v-if="activo.notas">
              <span>Notas</span>
              <strong>{{ activo.notas }}</strong>
            </li>
          </ul>
        </EduCard>
      </section>

      <!-- Tab: Plan de mantenimiento -->
      <section v-else-if="tab === 'plan'" class="detail-panel">
        <EduCard>
          <EmptyState
            v-if="!plan?.tareas || plan.tareas.length === 0"
            title="Sin plan de mantenimiento"
            description="Este activo aún no tiene tareas programadas en su catálogo."
          />
          <ul v-else class="detail-plan-list">
            <li v-for="t in plan.tareas" :key="t.id" class="detail-plan-item">
              <div class="detail-plan-main">
                <div class="detail-plan-icon" :class="`detail-plan-icon--${tareaEstadoVariant(t.estado)}`">
                  <CheckCircleIcon v-if="t.estado === 'completado'" />
                  <ExclamationTriangleIcon v-else-if="t.estado === 'vencido'" />
                  <ClipboardDocumentListIcon v-else />
                </div>
                <div>
                  <p class="detail-plan-tarea">{{ t.tarea }}</p>
                  <p class="detail-plan-meta">
                    Cada {{ t.intervalo_dias }} días · Próxima ejecución: {{ t.proxima_fecha }}
                  </p>
                </div>
              </div>
              <EduBadge :variant="tareaEstadoVariant(t.estado)" size="sm">
                {{ tareaEstadoLabel(t.estado) }}
              </EduBadge>
            </li>
          </ul>
        </EduCard>
      </section>

      <!-- Tab: Historial -->
      <section v-else-if="tab === 'historial'" class="detail-panel">
        <EduCard>
          <EmptyState
            v-if="historial.length === 0"
            title="Sin intervenciones registradas"
            description="Cuando se cierren órdenes para este activo aparecerán aquí."
          />
          <ol v-else class="detail-timeline">
            <li v-for="h in historial" :key="h.id" class="detail-timeline-item">
              <div class="detail-timeline-marker">
                <WrenchScrewdriverIcon />
              </div>
              <div class="detail-timeline-content">
                <div class="detail-timeline-head">
                  <span class="detail-timeline-tipo">{{ h.tipo }}</span>
                  <span class="detail-timeline-fecha">{{ h.fecha }}</span>
                </div>
                <p class="detail-timeline-desc">{{ h.descripcion }}</p>
                <p class="detail-timeline-tecnico">Técnico: <strong>{{ h.tecnico }}</strong></p>
              </div>
            </li>
          </ol>
        </EduCard>
      </section>
    </template>
  </AppShell>
</template>

<style scoped>
.detail-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  padding: 4px 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary);
  cursor: pointer;
  font-family: inherit;
  margin-bottom: 12px;
}
.detail-back:hover { color: var(--color-primary-hover); }
.detail-icon    { width: 16px; height: 16px; margin-right: 4px; }
.detail-icon-sm { width: 14px; height: 14px; flex-shrink: 0; }

.detail-loading { display: flex; flex-direction: column; gap: 16px; }

/* Header */
.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.detail-header-top {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 10px;
}
.detail-header-icon {
  width: 48px;
  height: 48px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.detail-header-icon :deep(svg) { width: 24px; height: 24px; }
.detail-categoria {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 3px 10px;
  border-radius: 9999px;
  margin-bottom: 4px;
}
.detail-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--color-text-primary);
  margin: 0;
}
.detail-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.detail-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.detail-serie {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.detail-serie strong {
  color: var(--color-text-primary);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.detail-header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* Score row — unified single card */
.detail-score-row {
  margin-bottom: 16px;
}

.detail-score-layout {
  display: flex;
  align-items: stretch;
}

.detail-score-ring-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  padding: 4px 28px 4px 4px;
  flex-shrink: 0;
  min-width: 160px;
}

.detail-score-sep {
  width: 1px;
  background: var(--color-border);
  flex-shrink: 0;
  margin: 0 28px;
}

.detail-score-help {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin: 0;
  text-align: center;
  max-width: 130px;
  line-height: 1.4;
}

.detail-factores {
  flex: 1;
  min-width: 0;
  padding: 4px 0;
}

.detail-qr-col {
  flex-shrink: 0;
  width: 196px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 4px 4px 0;
  text-align: center;
}

@media (max-width: 980px) {
  .detail-score-layout { flex-direction: column; }
  .detail-score-sep { width: 100%; height: 1px; margin: 20px 0; }
  .detail-score-ring-col { padding: 4px; }
  .detail-qr-col { width: 100%; }
}

.detail-factores-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
  margin: 0 0 14px;
}
.detail-factores-empty {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.55;
  padding: 16px;
  background: var(--color-bg);
  border-radius: var(--radius-md);
}
.detail-factores-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.detail-factor-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}
.detail-factor-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}
.detail-factor-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}
.detail-factor-bar {
  width: 100%;
  height: 6px;
  background: var(--color-bg);
  border-radius: 9999px;
  overflow: hidden;
}
.detail-factor-bar-fill {
  display: block;
  height: 100%;
  border-radius: 9999px;
  transition: width 500ms ease;
}
.detail-factor-help {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  margin: 4px 0 0;
  line-height: 1.4;
}

.detail-qr-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 2px;
}
.detail-qr-help {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  margin: 0 0 12px;
  line-height: 1.4;
}

/* Tabs */
.detail-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 20px;
  overflow-x: auto;
}
.detail-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}
.detail-tab:hover { color: var(--color-primary); }
.detail-tab--active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.detail-panel { margin-bottom: 20px; }

/* Info tab */
.detail-info-grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
}
@media (max-width: 640px) { .detail-info-grid { grid-template-columns: 1fr; } }
.detail-info-grid li {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.detail-info-grid span {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
}
.detail-info-grid strong {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* Plan tab */
.detail-plan-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.detail-plan-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  background: var(--color-bg);
  border-radius: var(--radius-md);
}
.detail-plan-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.detail-plan-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.detail-plan-icon :deep(svg) { width: 18px; height: 18px; }
.detail-plan-icon--info { background: var(--color-info-bg); color: var(--color-info); }
.detail-plan-icon--success { background: var(--color-success-bg); color: var(--color-success); }
.detail-plan-icon--danger { background: var(--color-danger-bg); color: var(--color-danger); }

.detail-plan-tarea {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}
.detail-plan-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 2px 0 0;
}

/* Historial */
.detail-timeline {
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
}
.detail-timeline::before {
  content: '';
  position: absolute;
  left: 17px;
  top: 12px;
  bottom: 12px;
  width: 2px;
  background: var(--color-border);
}
.detail-timeline-item {
  position: relative;
  display: flex;
  gap: 14px;
  padding-left: 0;
  padding-bottom: 18px;
}
.detail-timeline-item:last-child { padding-bottom: 0; }
.detail-timeline-marker {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  border: 3px solid var(--color-surface);
}
.detail-timeline-marker :deep(svg) { width: 18px; height: 18px; }
.detail-timeline-content { flex: 1; padding-top: 4px; }
.detail-timeline-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}
.detail-timeline-tipo {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-primary);
}
.detail-timeline-fecha {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.detail-timeline-desc {
  font-size: 13.5px;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.55;
}
.detail-timeline-tecnico {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 6px 0 0;
}
.detail-timeline-tecnico strong {
  color: var(--color-text-primary);
  font-weight: 600;
}
</style>
