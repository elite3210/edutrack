<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import * as proyeccionApi from '@/api/proyeccion.api'
import AppShell      from '@/components/layout/AppShell.vue'
import EduCard       from '@/components/ui/EduCard.vue'
import EduSelect     from '@/components/ui/EduSelect.vue'
import EduButton     from '@/components/ui/EduButton.vue'
import EduTable      from '@/components/ui/EduTable.vue'
import EduBadge      from '@/components/ui/EduBadge.vue'
import EmptyState    from '@/components/ui/EmptyState.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import ScoreBadge    from '@/components/activos/ScoreBadge.vue'
import {
  CalendarDaysIcon,
  BanknotesIcon,
  WrenchScrewdriverIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ArrowsRightLeftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'

const ANIO_ACTUAL = new Date().getFullYear()

const anioSeleccionado = ref(ANIO_ACTUAL)
const anioOptions = [
  { value: ANIO_ACTUAL,     label: `${ANIO_ACTUAL} (año actual)` },
  { value: ANIO_ACTUAL + 1, label: `${ANIO_ACTUAL + 1}` },
]

const proyeccion = ref(null)
const loading    = ref(false)

async function load() {
  loading.value = true
  try {
    proyeccion.value = await proyeccionApi.getProyeccion(anioSeleccionado.value)
  } finally {
    loading.value = false
  }
}

watch(anioSeleccionado, load)
onMounted(load)

// ─── Agrupación de items por mes ──────────────────────────────
const itemsOrdenados = computed(() => {
  if (!proyeccion.value?.items) return []
  return [...proyeccion.value.items].sort(
    (a, b) => a.fecha_programada.localeCompare(b.fecha_programada),
  )
})

const itemsPorMes = computed(() => {
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const m = new Map()
  for (const item of itemsOrdenados.value) {
    const key = item.fecha_programada.slice(0, 7) // YYYY-MM
    if (!m.has(key)) m.set(key, { label: meses[parseInt(key.slice(5,7)) - 1], items: [] })
    m.get(key).items.push(item)
  }
  return [...m.entries()].map(([key, val]) => ({ key, ...val }))
})

const totales = computed(() => ({
  preventivos: proyeccion.value?.total_preventivos ?? 0,
  correctivos: proyeccion.value?.total_correctivos ?? 0,
  general:     proyeccion.value?.total_general ?? 0,
  cantidadItems: proyeccion.value?.items?.length ?? 0,
}))

function formatCosto(n) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(n ?? 0)
}

const columnsMes = [
  { key: 'fecha_programada', label: 'Fecha',       width: '14%' },
  { key: 'activo_nombre',    label: 'Activo',      width: '32%' },
  { key: 'categoria',        label: 'Categoría',   width: '18%' },
  { key: 'tipo',             label: 'Mantenimiento', width: '22%' },
  { key: 'costo',            label: 'Costo',       width: '14%', align: 'right' },
]

// ─── Exportar PDF (window.print con CSS print) ───────────────
function exportarPDF() {
  window.print()
}
</script>

<template>
  <AppShell>
    <header class="pr-header">
      <div>
        <p class="pr-eyebrow">Proyección financiera</p>
        <h1 class="pr-title">Plan de mantenimiento {{ anioSeleccionado }}</h1>
        <p class="pr-subtitle">
          Cronograma anual de mantenimientos preventivos con costos de referencia.
        </p>
      </div>
      <div class="pr-actions">
        <EduSelect
          v-model.number="anioSeleccionado"
          :options="anioOptions"
          class="pr-anio-select"
        />
        <EduButton variant="primary" @click="exportarPDF">
          <ArrowDownTrayIcon class="pr-icon" />
          Exportar PDF
        </EduButton>
      </div>
    </header>

    <p class="pr-nota">
      <ArrowsRightLeftIcon class="pr-icon" />
      Costos de referencia configurables desde el perfil del coordinador.
    </p>

    <!-- Resumen totales -->
    <section class="pr-totales">
      <EduCard padding="md" class="pr-total-card">
        <div class="pr-total-icon pr-total-icon--info">
          <WrenchScrewdriverIcon />
        </div>
        <div>
          <p class="pr-total-label">Preventivos</p>
          <p class="pr-total-value">{{ formatCosto(totales.preventivos) }}</p>
          <p class="pr-total-meta">{{ totales.cantidadItems }} tareas programadas</p>
        </div>
      </EduCard>

      <EduCard padding="md" class="pr-total-card">
        <div class="pr-total-icon pr-total-icon--warning">
          <ArrowPathIcon />
        </div>
        <div>
          <p class="pr-total-label">Correctivos estimados</p>
          <p class="pr-total-value">{{ formatCosto(totales.correctivos) }}</p>
          <p class="pr-total-meta">Basado en histórico del último año</p>
        </div>
      </EduCard>

      <EduCard padding="md" class="pr-total-card pr-total-card--general">
        <div class="pr-total-icon pr-total-icon--primary">
          <BanknotesIcon />
        </div>
        <div>
          <p class="pr-total-label">Total estimado del año</p>
          <p class="pr-total-value pr-total-value--lg">{{ formatCosto(totales.general) }}</p>
          <p class="pr-total-meta">Preventivo + correctivo proyectado</p>
        </div>
      </EduCard>
    </section>

    <!-- Cronograma -->
    <section class="pr-cronograma">
      <h2 class="pr-section-title">
        <CalendarDaysIcon class="pr-icon" />
        Cronograma mensual
      </h2>

      <div v-if="loading" class="pr-skeletons">
        <SkeletonLoader v-for="n in 3" :key="n" width="100%" height="120px" />
      </div>

      <EmptyState
        v-else-if="itemsPorMes.length === 0"
        title="Sin proyección para este año"
        description="No hay mantenimientos programados para el período seleccionado."
      />

      <div v-else class="pr-meses">
        <article v-for="mes in itemsPorMes" :key="mes.key" class="pr-mes">
          <header class="pr-mes-header">
            <h3 class="pr-mes-title">{{ mes.label }} {{ anioSeleccionado }}</h3>
            <div class="pr-mes-meta">
              <span class="pr-mes-count">{{ mes.items.length }} {{ mes.items.length === 1 ? 'tarea' : 'tareas' }}</span>
              <span class="pr-mes-total">{{ formatCosto(mes.items.reduce((s, i) => s + i.costo, 0)) }}</span>
            </div>
          </header>

          <EduTable :columns="columnsMes" :rows="mes.items" :hover="false">
            <template #cell-fecha_programada="{ value }">
              <span class="pr-fecha">{{ value.slice(8, 10) }}/{{ value.slice(5, 7) }}</span>
            </template>
            <template #cell-activo_nombre="{ value }">
              <strong class="pr-activo">{{ value }}</strong>
            </template>
            <template #cell-categoria="{ value }">
              <EduBadge variant="default" size="sm">{{ value }}</EduBadge>
            </template>
            <template #cell-tipo="{ row }">
              <div>
                <p class="pr-tarea">{{ row.tipo }}</p>
                <p class="pr-recurrencia">{{ row.recurrencia }}</p>
              </div>
            </template>
            <template #cell-costo="{ value }">
              <span class="pr-costo">{{ formatCosto(value) }}</span>
            </template>
          </EduTable>
        </article>
      </div>
    </section>

    <!-- Candidatos a reemplazo -->
    <section v-if="proyeccion?.candidatos_reemplazo?.length > 0" class="pr-candidatos">
      <h2 class="pr-section-title">
        <ExclamationTriangleIcon class="pr-icon" />
        Candidatos a reemplazo
      </h2>
      <p class="pr-candidatos-help">
        Activos con score crítico y vida útil restante &lt; 20%. Considerar reemplazo en lugar de mantenimiento correctivo.
      </p>

      <div class="pr-candidatos-grid">
        <EduCard v-for="c in proyeccion.candidatos_reemplazo" :key="c.activo_id" class="pr-candidato-card">
          <div class="pr-candidato-head">
            <div>
              <h3 class="pr-candidato-nombre">{{ c.activo_nombre }}</h3>
              <p class="pr-candidato-ubic">{{ c.ubicacion }}</p>
            </div>
            <ScoreBadge :score="c.score" size="md" />
          </div>

          <div class="pr-candidato-metrics">
            <div>
              <span class="pr-candidato-metric-label">Vida útil restante</span>
              <span class="pr-candidato-metric-value">{{ c.vida_util_restante }}%</span>
            </div>
            <div>
              <span class="pr-candidato-metric-label">Antigüedad</span>
              <span class="pr-candidato-metric-value">{{ c.antiguedad_meses }} meses</span>
            </div>
            <div>
              <span class="pr-candidato-metric-label">Costo reemplazo</span>
              <span class="pr-candidato-metric-value">{{ formatCosto(c.costo_reemplazo_referencial) }}</span>
            </div>
          </div>

          <p class="pr-candidato-motivo">{{ c.motivo }}</p>
        </EduCard>
      </div>
    </section>
  </AppShell>
</template>

<style scoped>
.pr-icon { width: 16px; height: 16px; flex-shrink: 0; }

.pr-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.pr-eyebrow {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--color-primary);
  margin: 0 0 6px;
}
.pr-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--color-text-primary);
  margin: 0 0 6px;
}
.pr-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}
.pr-actions {
  display: flex;
  align-items: end;
  gap: 8px;
}
.pr-anio-select { min-width: 180px; }

.pr-nota {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--color-info-bg);
  border-radius: var(--radius-md);
  font-size: 12px;
  color: var(--color-info);
  margin: 0 0 20px;
}

/* Totales */
.pr-totales {
  display: grid;
  grid-template-columns: 1fr 1fr 1.4fr;
  gap: 16px;
  margin-bottom: 28px;
}
@media (max-width: 900px) { .pr-totales { grid-template-columns: 1fr; } }
.pr-total-card :deep(.edu-card-body) {
  display: flex;
  align-items: center;
  gap: 14px;
}
.pr-total-card--general {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  border-color: var(--color-primary);
}
.pr-total-card--general :deep(.edu-card-body) { color: white; }
.pr-total-card--general .pr-total-label,
.pr-total-card--general .pr-total-value,
.pr-total-card--general .pr-total-meta { color: white; }

.pr-total-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.pr-total-icon :deep(svg) { width: 22px; height: 22px; }
.pr-total-icon--info    { background: var(--color-info-bg);     color: var(--color-info); }
.pr-total-icon--warning { background: var(--color-warning-bg);  color: var(--color-warning); }
.pr-total-icon--primary { background: rgba(255,255,255,0.2);    color: white; }

.pr-total-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
  margin: 0 0 2px;
}
.pr-total-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.4px;
  font-variant-numeric: tabular-nums;
  margin: 0;
  line-height: 1.15;
}
.pr-total-value--lg { font-size: 28px; }
.pr-total-meta {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  margin: 4px 0 0;
}

/* Cronograma */
.pr-section-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 12px;
}
.pr-skeletons { display: flex; flex-direction: column; gap: 12px; }

.pr-meses { display: flex; flex-direction: column; gap: 18px; margin-bottom: 28px; }
.pr-mes {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.pr-mes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
}
.pr-mes-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}
.pr-mes-meta { display: flex; align-items: center; gap: 12px; }
.pr-mes-count {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
}
.pr-mes-total {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
}
.pr-mes :deep(.edu-table-wrap) { border: none; border-radius: 0; box-shadow: none; }

.pr-fecha { font-variant-numeric: tabular-nums; color: var(--color-text-secondary); font-size: 13px; }
.pr-activo { font-size: 13.5px; color: var(--color-text-primary); font-weight: 600; }
.pr-tarea { font-size: 13px; color: var(--color-text-primary); margin: 0; }
.pr-recurrencia { font-size: 11px; color: var(--color-text-secondary); margin: 2px 0 0; }
.pr-costo {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

/* Candidatos */
.pr-candidatos { margin-top: 8px; }
.pr-candidatos-help {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0 0 14px;
}
.pr-candidatos-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 900px) { .pr-candidatos-grid { grid-template-columns: 1fr; } }

.pr-candidato-card { border-left: 4px solid var(--color-danger); }
.pr-candidato-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}
.pr-candidato-nombre {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.3;
}
.pr-candidato-ubic {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 2px 0 0;
}
.pr-candidato-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
  padding: 10px 12px;
  background: var(--color-bg);
  border-radius: var(--radius-md);
}
.pr-candidato-metric-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--color-text-secondary);
  font-weight: 700;
  display: block;
  margin-bottom: 2px;
}
.pr-candidato-metric-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}
.pr-candidato-motivo {
  font-size: 12.5px;
  color: var(--color-text-primary);
  line-height: 1.5;
  margin: 0;
  padding: 10px 12px;
  background: var(--color-danger-bg);
  border-radius: var(--radius-md);
  color: var(--color-danger);
}

/* Print */
@media print {
  :deep(.top-nav),
  :deep(.mobile-header),
  .pr-actions { display: none !important; }
  :deep(body) { background: white; }
  .pr-mes, .pr-candidato-card {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .pr-section-title { margin-top: 16px; }
  .pr-totales { grid-template-columns: 1fr 1fr 1fr; }
  .pr-candidatos-grid { grid-template-columns: 1fr; }
  .pr-total-card--general {
    background: white !important;
    color: var(--color-text-primary) !important;
    border-color: var(--color-border) !important;
  }
  .pr-total-card--general :deep(.edu-card-body),
  .pr-total-card--general .pr-total-label,
  .pr-total-card--general .pr-total-value,
  .pr-total-card--general .pr-total-meta { color: var(--color-text-primary) !important; }
  .pr-total-card--general .pr-total-icon--primary { background: var(--color-primary-light) !important; color: var(--color-primary) !important; }
}
</style>
