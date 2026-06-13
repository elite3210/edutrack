<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOrdenesStore }  from '@/stores/ordenes'
import { useUsuariosStore } from '@/stores/usuarios'
import AppShell      from '@/components/layout/AppShell.vue'
import EduButton     from '@/components/ui/EduButton.vue'
import EduSelect     from '@/components/ui/EduSelect.vue'
import EduTable      from '@/components/ui/EduTable.vue'
import EmptyState    from '@/components/ui/EmptyState.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EstadoBadge    from '@/components/ordenes/EstadoBadge.vue'
import PrioridadBadge from '@/components/ordenes/PrioridadBadge.vue'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/vue/24/outline'

const router   = useRouter()
const route    = useRoute()
const ordenes  = useOrdenesStore()
const usuarios = useUsuariosStore()

// ─── Filtros ──────────────────────────────────────────────────
const search          = ref('')
const estadoFiltro    = ref(route.query.estado ?? 'todos')
const prioridadFiltro = ref('')
const tecnicoFiltro   = ref('')

const estadoChips = [
  { value: 'todos',         label: 'Todos' },
  { value: 'pendiente',     label: 'Pendientes' },
  { value: 'aceptada',      label: 'Aceptadas' },
  { value: 'en_ejecucion',  label: 'En ejecución' },
  { value: 'cerrada',       label: 'Cerradas' },
]
const prioridadOptions = [
  { value: '',      label: 'Todas las prioridades' },
  { value: 'alta',  label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja',  label: 'Baja' },
]
const tecnicosOptions = computed(() => [
  { value: '',          label: 'Todos los técnicos' },
  { value: 'sin_asignar', label: 'Sin asignar' },
  ...usuarios.list
    .filter(u => u.rol === 'tecnico' && u.activo)
    .map(u => ({ value: u.id, label: u.nombre })),
])

const hayFiltrosActivos = computed(() =>
  search.value || estadoFiltro.value !== 'todos' || prioridadFiltro.value || tecnicoFiltro.value,
)
function limpiarFiltros() {
  search.value = ''
  estadoFiltro.value = 'todos'
  prioridadFiltro.value = ''
  tecnicoFiltro.value = ''
}

// ─── Filtrado y orden ─────────────────────────────────────────
const hoy = new Date(); hoy.setHours(0,0,0,0)
function esVencida(ot) {
  if (!ot.fecha_limite || ot.estado === 'cerrada') return false
  return new Date(ot.fecha_limite) < hoy
}

const filteredList = computed(() => {
  let result = ordenes.list
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    result = result.filter(o =>
      o.numero.toLowerCase().includes(q) ||
      o.activo_nombre.toLowerCase().includes(q) ||
      (o.tecnico_nombre ?? '').toLowerCase().includes(q) ||
      o.descripcion.toLowerCase().includes(q),
    )
  }
  if (estadoFiltro.value !== 'todos') {
    result = result.filter(o => o.estado === estadoFiltro.value)
  }
  if (prioridadFiltro.value) {
    result = result.filter(o => o.prioridad === prioridadFiltro.value)
  }
  if (tecnicoFiltro.value === 'sin_asignar') {
    result = result.filter(o => !o.tecnico_id)
  } else if (tecnicoFiltro.value) {
    result = result.filter(o => o.tecnico_id === tecnicoFiltro.value)
  }
  // ordenamiento: vencidas primero, luego por fecha límite ascendente
  return [...result].sort((a, b) => {
    const va = esVencida(a) ? 0 : 1
    const vb = esVencida(b) ? 0 : 1
    if (va !== vb) return va - vb
    return (a.fecha_limite ?? '').localeCompare(b.fecha_limite ?? '')
  })
})

const contadores = computed(() => {
  const c = { todos: ordenes.list.length, pendiente: 0, aceptada: 0, en_ejecucion: 0, cerrada: 0 }
  for (const o of ordenes.list) c[o.estado] = (c[o.estado] ?? 0) + 1
  return c
})

// ─── Paginación ───────────────────────────────────────────────
const PAGE_SIZE = 10
const page = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredList.value.length / PAGE_SIZE)))
const pagedList  = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filteredList.value.slice(start, start + PAGE_SIZE)
})
watch([search, estadoFiltro, prioridadFiltro, tecnicoFiltro], () => { page.value = 1 })

// ─── Tabla ────────────────────────────────────────────────────
const columns = [
  { key: 'numero',       label: 'OT',            width: '11%' },
  { key: 'activo',       label: 'Equipo',        width: '24%' },
  { key: 'tipo',         label: 'Tipo',          width: '11%' },
  { key: 'tecnico',      label: 'Técnico',       width: '15%' },
  { key: 'prioridad',    label: 'Prioridad',     width: '10%', align: 'center' },
  { key: 'estado',       label: 'Estado',        width: '12%' },
  { key: 'fecha_limite', label: 'Fecha límite',  width: '13%' },
  { key: 'acciones',     label: '',              width: '4%', align: 'right' },
]
function rowClass(row) {
  return esVencida(row) ? 'edu-table-tr--critical' : null
}

onMounted(async () => {
  if (ordenes.list.length === 0) await ordenes.fetchAll()
  if (usuarios.list.length === 0) await usuarios.fetchAll()
})
</script>

<template>
  <AppShell>
    <header class="ordenes-header">
      <div>
        <h1 class="ordenes-title">Órdenes de Trabajo</h1>
        <p class="ordenes-subtitle">
          {{ filteredList.length }} de {{ ordenes.list.length }} órdenes
        </p>
      </div>
      <EduButton variant="primary" @click="router.push('/coordinador/ordenes/nueva')">
        <PlusIcon class="ordenes-icon" />
        Nueva OT
      </EduButton>
    </header>

    <!-- Chips de estado -->
    <nav class="ordenes-chips" role="tablist" aria-label="Filtro por estado">
      <button
        v-for="chip in estadoChips"
        :key="chip.value"
        type="button"
        :class="['ordenes-chip', { 'ordenes-chip--active': estadoFiltro === chip.value }]"
        :aria-selected="estadoFiltro === chip.value"
        role="tab"
        @click="estadoFiltro = chip.value"
      >
        {{ chip.label }}
        <span class="ordenes-chip-count">{{ contadores[chip.value] ?? 0 }}</span>
      </button>
    </nav>

    <!-- Filtros en una sola fila -->
    <div class="ordenes-filters">
      <div class="ordenes-search">
        <MagnifyingGlassIcon class="ordenes-search-icon" />
        <input
          v-model="search"
          type="text"
          class="ordenes-search-input"
          placeholder="Buscar equipo, técnico, OT…"
        />
        <button
          v-if="search"
          type="button"
          class="ordenes-search-clear"
          @click="search = ''"
          aria-label="Limpiar búsqueda"
        >
          <XMarkIcon class="ordenes-icon" />
        </button>
      </div>
      <EduSelect v-model="prioridadFiltro" placeholder="Prioridad" :options="prioridadOptions" class="ordenes-filter-select" />
      <EduSelect v-model="tecnicoFiltro"   placeholder="Técnico"   :options="tecnicosOptions" class="ordenes-filter-select" />
      <button
        v-if="hayFiltrosActivos"
        type="button"
        class="ordenes-filter-clear"
        @click="limpiarFiltros"
      >
        Limpiar
      </button>
    </div>

    <!-- Tabla -->
    <div v-if="ordenes.loading" class="ordenes-skeletons">
      <SkeletonLoader v-for="n in 6" :key="n" width="100%" height="56px" />
    </div>

    <EmptyState
      v-else-if="filteredList.length === 0"
      title="Sin órdenes para mostrar"
      :description="hayFiltrosActivos
        ? 'Ninguna OT coincide con los filtros aplicados.'
        : 'Aún no hay órdenes de trabajo registradas.'"
    >
      <template #action>
        <EduButton
          v-if="!hayFiltrosActivos"
          variant="primary"
          @click="router.push('/coordinador/ordenes/nueva')"
        >
          <PlusIcon class="ordenes-icon" />
          Crear primera OT
        </EduButton>
        <EduButton v-else variant="outline-gray" @click="limpiarFiltros">
          Limpiar filtros
        </EduButton>
      </template>
    </EmptyState>

    <template v-else>
      <EduTable
        :columns="columns"
        :rows="pagedList"
        :row-class="rowClass"
        @row-click="row => router.push(`/coordinador/ordenes/${row.id}`)"
      >
        <template #cell-numero="{ row }">
          <span class="cell-numero">
            <WrenchScrewdriverIcon class="cell-numero-icon" />
            {{ row.numero }}
          </span>
        </template>

        <template #cell-activo="{ row }">
          <div>
            <p class="cell-activo-title">{{ row.activo_nombre }}</p>
            <p class="cell-activo-meta">{{ row.activo_ubicacion }}</p>
          </div>
        </template>

        <template #cell-tipo="{ value }">
          <span class="cell-tipo">{{ value }}</span>
        </template>

        <template #cell-tecnico="{ value, row }">
          <span :class="['cell-tecnico', { 'cell-tecnico--vacante': !row.tecnico_id }]">
            {{ row.tecnico_nombre ?? 'Sin asignar' }}
          </span>
        </template>

        <template #cell-prioridad="{ value }">
          <PrioridadBadge :prioridad="value" size="md" />
        </template>

        <template #cell-estado="{ value }">
          <EstadoBadge :estado="value" size="md" />
        </template>

        <template #cell-fecha_limite="{ row }">
          <span :class="['cell-fecha', { 'cell-fecha--vencida': esVencida(row) }]">
            {{ row.fecha_limite ?? '—' }}
          </span>
        </template>

        <template #cell-acciones>
          <ChevronRightIcon class="cell-chevron" />
        </template>
      </EduTable>

      <nav v-if="totalPages > 1" class="ordenes-pagination">
        <button
          type="button"
          class="ordenes-page-btn"
          :disabled="page === 1"
          @click="page--"
        >
          <ChevronLeftIcon class="ordenes-icon" />
          Anterior
        </button>
        <span class="ordenes-page-info">
          Página <strong>{{ page }}</strong> de <strong>{{ totalPages }}</strong>
        </span>
        <button
          type="button"
          class="ordenes-page-btn"
          :disabled="page === totalPages"
          @click="page++"
        >
          Siguiente
          <ChevronRightIcon class="ordenes-icon" />
        </button>
      </nav>
    </template>
  </AppShell>
</template>

<style scoped>
.ordenes-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.ordenes-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}
.ordenes-subtitle {
  font-size: 13.5px;
  color: var(--color-text-secondary);
  margin: 0;
}
.ordenes-icon { width: 16px; height: 16px; }

/* Chips */
.ordenes-chips {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.ordenes-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 9999px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}
.ordenes-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.ordenes-chip--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  font-weight: 600;
}
.ordenes-chip-count {
  background: var(--color-bg);
  color: var(--color-text-primary);
  padding: 1px 7px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.ordenes-chip--active .ordenes-chip-count {
  background: rgba(255,255,255,0.25);
  color: white;
}

/* Filtros */
.ordenes-filters {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.ordenes-search {
  flex: 1;
  min-width: 180px;
  position: relative;
}
.ordenes-search-icon {
  position: absolute; top: 50%; left: 12px;
  transform: translateY(-50%); width: 16px; height: 16px;
  color: var(--color-text-disabled);
  pointer-events: none;
}
.ordenes-search-input {
  width: 100%; height: 40px;
  padding: 0 38px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-family: inherit;
  color: var(--color-text-primary);
  background: var(--color-surface);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.ordenes-search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-ring);
}
.ordenes-search-clear {
  position: absolute; top: 50%; right: 6px;
  transform: translateY(-50%); width: 26px; height: 26px;
  border: none; background: var(--color-bg);
  border-radius: 5px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-secondary);
}
.ordenes-search-clear:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
.ordenes-filter-select {
  width: 160px;
  flex-shrink: 0;
}
.ordenes-filter-clear {
  height: 40px;
  padding: 0 12px;
  border: 1px dashed var(--color-border);
  background: transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  white-space: nowrap;
  flex-shrink: 0;
}
.ordenes-filter-clear:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
}
@media (max-width: 640px) {
  .ordenes-filter-select { width: 130px; }
}
@media (max-width: 480px) {
  .ordenes-filters { gap: 8px; }
  .ordenes-filter-select { width: 100%; flex: 1; min-width: 120px; }
}

/* Celdas */
.cell-numero {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
}
.cell-numero-icon { width: 14px; height: 14px; }
.cell-activo-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}
.cell-activo-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 2px 0 0;
}
.cell-tipo, .cell-tecnico { font-size: 13px; color: var(--color-text-primary); }
.cell-tecnico--vacante { color: var(--color-text-disabled); font-style: italic; }
.cell-fecha {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.cell-fecha--vencida {
  color: var(--color-danger);
  font-weight: 600;
}
.cell-chevron {
  width: 18px; height: 18px;
  color: var(--color-text-disabled);
  margin-left: auto;
}

/* Paginación */
.ordenes-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}
.ordenes-page-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
}
.ordenes-page-btn:hover:not(:disabled) {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.ordenes-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ordenes-page-info {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.ordenes-page-info strong { color: var(--color-text-primary); font-weight: 700; }

.ordenes-skeletons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
