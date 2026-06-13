<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore }      from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import { useActivosStore }   from '@/stores/activos'
import AppShell      from '@/components/layout/AppShell.vue'
import EduCard       from '@/components/ui/EduCard.vue'
import EduSelect     from '@/components/ui/EduSelect.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import MetricCard    from '@/components/dashboard/MetricCard.vue'
import SemaforoChart from '@/components/dashboard/SemaforoChart.vue'
import HeatmapGrid   from '@/components/dashboard/HeatmapGrid.vue'
import EduScoreRing  from '@/components/activos/EduScoreRing.vue'
import {
  CubeIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  ChevronRightIcon,
  ChartPieIcon,
  Squares2X2Icon,
  ArrowPathIcon,
  FireIcon,
} from '@heroicons/vue/24/outline'

const router    = useRouter()
const auth      = useAuthStore()
const dashboard = useDashboardStore()
const activos   = useActivosStore()

// ─── Filtros ──────────────────────────────────────────────────
const categoriaFiltro = ref('')
const edificioFiltro  = ref('')

const categoriaOptions = computed(() => [
  { value: '', label: 'Todas las categorías' },
  ...(dashboard.categorias ?? []).map(c => ({ value: c.categoria, label: c.categoria })),
])
const edificios = computed(() =>
  [...new Set((dashboard.heatmap ?? []).map(h => h.edificio))].sort(),
)
const edificioOptions = computed(() => [
  { value: '', label: 'Todos los edificios' },
  ...edificios.value.map(e => ({ value: e, label: `Edificio ${e}` })),
])

// ─── Datos derivados ──────────────────────────────────────────
const heatmapFiltrado = computed(() => {
  let list = dashboard.heatmap ?? []
  if (edificioFiltro.value) list = list.filter(h => h.edificio === edificioFiltro.value)
  return list
})

const m = computed(() => dashboard.metricas ?? {
  total_activos: 0, activos_criticos: 0, ots_abiertas: 0, costo_estimado_mes: 0,
})
const top5 = computed(() => (dashboard.topCriticos ?? []).slice(0, 5))

const nombre = computed(() => auth.user?.nombre?.split(' ')[0] ?? 'Director')

// ─── Actualización simulada cada 30s ──────────────────────────
const lastSync = ref(null)
let timer = null

function formatHora(d) {
  return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

async function refresh() {
  await dashboard.fetchDashboard()
  lastSync.value = new Date()
}

function formatCosto(n) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(n ?? 0)
}

onMounted(async () => {
  await refresh()
  if (activos.list.length === 0) await activos.fetchAll()
  timer = setInterval(refresh, 30000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<template>
  <AppShell>
    <!-- Header con saludo y filtros -->
    <header class="dd-header">
      <div>
        <p class="dd-eyebrow">Vista ejecutiva</p>
        <h1 class="dd-title">{{ nombre }} — Salud institucional</h1>
        <p class="dd-subtitle">
          Resumen estratégico del estado de los activos tecnológicos.
        </p>
      </div>
      <div class="dd-sync">
        <ArrowPathIcon class="dd-icon dd-sync-icon" :class="{ 'dd-sync-icon--loading': dashboard.loading }" />
        <span v-if="lastSync">Última actualización: {{ formatHora(lastSync) }}</span>
        <span v-else>Cargando datos…</span>
      </div>
    </header>

    <!-- Filtros -->
    <div class="dd-filters">
      <EduSelect v-model="categoriaFiltro" :options="categoriaOptions" />
      <EduSelect v-model="edificioFiltro"  :options="edificioOptions" />
    </div>

    <!-- Métricas -->
    <section class="dd-metrics">
      <template v-if="dashboard.loading && !dashboard.metricas">
        <SkeletonLoader v-for="n in 4" :key="n" width="100%" height="108px" />
      </template>
      <template v-else>
        <MetricCard
          label="Total activos"
          :value="m.total_activos"
          variant="primary"
          :icon="CubeIcon"
          helper="Equipos registrados"
        />
        <MetricCard
          label="Críticos"
          :value="m.activos_criticos"
          variant="danger"
          :icon="ExclamationTriangleIcon"
          helper="Score menor a 40"
        />
        <MetricCard
          label="OTs abiertas"
          :value="m.ots_abiertas"
          variant="info"
          :icon="ClipboardDocumentListIcon"
          helper="Pendientes y en ejecución"
        />
        <MetricCard
          label="Costo del mes"
          :value="formatCosto(m.costo_estimado_mes)"
          variant="warning"
          :icon="BanknotesIcon"
          helper="Estimado preventivo + correctivo"
        />
      </template>
    </section>

    <!-- Semáforo (elemento principal) -->
    <section class="dd-semaforo-row">
      <EduCard padding="lg">
        <template #header>
          <div class="dd-panel-header">
            <div class="dd-panel-title">
              <span class="dd-panel-icon dd-panel-icon--primary"><ChartPieIcon /></span>
              <div>
                <h2>Salud general del parque</h2>
                <p>Distribución por estado de score</p>
              </div>
            </div>
          </div>
        </template>
        <div v-if="dashboard.loading && !dashboard.semaforo?.verde?.count" class="dd-chart-skeleton">
          <SkeletonLoader width="220px" height="220px" style="border-radius: 9999px" />
        </div>
        <SemaforoChart v-else :semaforo="dashboard.semaforo" :size="240" />
      </EduCard>

      <!-- Top 5 críticos -->
      <EduCard>
        <template #header>
          <div class="dd-panel-header">
            <div class="dd-panel-title">
              <span class="dd-panel-icon dd-panel-icon--danger"><FireIcon /></span>
              <div>
                <h2>Top 5 críticos</h2>
                <p>Activos con menor score de salud</p>
              </div>
            </div>
          </div>
        </template>
        <ul v-if="top5.length > 0" class="dd-top-list">
          <li
            v-for="a in top5"
            :key="a.id"
            class="dd-top-item"
            @click="router.push(`/coordinador/activos/${a.id}`)"
          >
            <EduScoreRing :score="a.score" size="sm" />
            <div class="dd-top-info">
              <p class="dd-top-nombre">{{ a.nombre }}</p>
              <p class="dd-top-ubic">{{ a.ubicacion }}</p>
            </div>
            <ChevronRightIcon class="dd-icon dd-top-chevron" />
          </li>
        </ul>
        <p v-else class="dd-empty">Sin activos críticos.</p>
      </EduCard>
    </section>

    <!-- Heatmap -->
    <section class="dd-heatmap-row">
      <EduCard padding="lg">
        <template #header>
          <div class="dd-panel-header">
            <div class="dd-panel-title">
              <span class="dd-panel-icon dd-panel-icon--info"><Squares2X2Icon /></span>
              <div>
                <h2>Mapa de calor por aula</h2>
                <p>Score promedio de los activos en cada ambiente</p>
              </div>
            </div>
          </div>
        </template>
        <div v-if="dashboard.loading && (dashboard.heatmap ?? []).length === 0" class="dd-heatmap-skeleton">
          <SkeletonLoader v-for="n in 6" :key="n" width="100%" height="64px" />
        </div>
        <HeatmapGrid v-else :data="heatmapFiltrado" />
      </EduCard>
    </section>
  </AppShell>
</template>

<style scoped>
.dd-icon { width: 16px; height: 16px; flex-shrink: 0; }

.dd-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.dd-eyebrow {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--color-primary);
  margin: 0 0 6px;
}
.dd-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--color-text-primary);
  margin: 0 0 6px;
}
.dd-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}
.dd-sync {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 9999px;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.dd-sync-icon { width: 14px; height: 14px; }
.dd-sync-icon--loading { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }

.dd-filters {
  display: grid;
  grid-template-columns: 240px 240px;
  gap: 12px;
  margin-bottom: 22px;
}
@media (max-width: 640px) { .dd-filters { grid-template-columns: 1fr; } }

.dd-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
@media (max-width: 900px) { .dd-metrics { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 520px) { .dd-metrics { grid-template-columns: 1fr; } }

/* Semáforo + Top */
.dd-semaforo-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}
@media (max-width: 1100px) { .dd-semaforo-row { grid-template-columns: 1fr; } }

.dd-panel-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.dd-panel-title { display: flex; align-items: center; gap: 12px; }
.dd-panel-title h2 {
  font-size: 16px; font-weight: 700; margin: 0; color: var(--color-text-primary);
}
.dd-panel-title p {
  font-size: 12px; color: var(--color-text-secondary); margin: 0;
}
.dd-panel-icon {
  width: 36px; height: 36px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
}
.dd-panel-icon :deep(svg) { width: 18px; height: 18px; }
.dd-panel-icon--primary { background: var(--color-primary-light); color: var(--color-primary); }
.dd-panel-icon--danger  { background: var(--color-danger-bg);     color: var(--color-danger); }
.dd-panel-icon--info    { background: var(--color-info-bg);       color: var(--color-info); }

/* Top 5 */
.dd-top-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.dd-top-item {
  display: flex; align-items: center; gap: 12px;
  padding: 8px 10px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast);
}
.dd-top-item:hover { background: var(--color-bg); }
.dd-top-info { flex: 1; min-width: 0; }
.dd-top-nombre {
  font-size: 13.5px; font-weight: 600; color: var(--color-text-primary); margin: 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.dd-top-ubic {
  font-size: 12px; color: var(--color-text-secondary); margin: 2px 0 0;
}
.dd-top-chevron { color: var(--color-text-disabled); }

.dd-empty {
  padding: 24px;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-style: italic;
}

.dd-chart-skeleton {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.dd-heatmap-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

/* Heatmap card */
.dd-heatmap-row { margin-bottom: 24px; }
</style>
