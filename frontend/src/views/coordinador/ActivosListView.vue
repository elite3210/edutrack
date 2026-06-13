<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useActivosStore } from '@/stores/activos'
import AppShell      from '@/components/layout/AppShell.vue'
import EduButton     from '@/components/ui/EduButton.vue'
import EduInput      from '@/components/ui/EduInput.vue'
import EduSelect     from '@/components/ui/EduSelect.vue'
import EduTable      from '@/components/ui/EduTable.vue'
import EduBadge      from '@/components/ui/EduBadge.vue'
import EmptyState    from '@/components/ui/EmptyState.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import ScoreBadge    from '@/components/activos/ScoreBadge.vue'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CubeIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route  = useRoute()
const activos = useActivosStore()

// ─── Filtros ──────────────────────────────────────────────────
const search    = ref('')
const categoria = ref('')
const scoreFilter = ref(route.query.score ?? '')
const orden     = ref('score-asc')

const categorias = computed(() =>
  [...new Set(activos.list.map(a => a.categoria))].sort(),
)
const categoriaOptions = computed(() => [
  { value: '', label: 'Todas las categorías' },
  ...categorias.value.map(c => ({ value: c, label: c })),
])
const scoreOptions = [
  { value: '',         label: 'Todos los scores' },
  { value: 'verde',    label: 'Saludable (70+)' },
  { value: 'amarillo', label: 'Atención (40–69)' },
  { value: 'rojo',     label: 'Crítico (<40)' },
]
const ordenOptions = [
  { value: 'score-asc',     label: 'Score: menor primero' },
  { value: 'score-desc',    label: 'Score: mayor primero' },
  { value: 'nombre-asc',    label: 'Nombre A–Z' },
  { value: 'fecha-desc',    label: 'Fecha instalación: más reciente' },
]

const hayFiltrosActivos = computed(() =>
  search.value || categoria.value || scoreFilter.value,
)
function limpiarFiltros() {
  search.value = ''
  categoria.value = ''
  scoreFilter.value = ''
}

// ─── Filtrado y orden ─────────────────────────────────────────
const filteredList = computed(() => {
  let result = activos.list

  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    result = result.filter(a =>
      a.nombre.toLowerCase().includes(q) ||
      a.marca.toLowerCase().includes(q) ||
      a.modelo.toLowerCase().includes(q) ||
      a.ubicacion.toLowerCase().includes(q),
    )
  }
  if (categoria.value) {
    result = result.filter(a => a.categoria === categoria.value)
  }
  if (scoreFilter.value === 'verde')    result = result.filter(a => a.score >= 70)
  if (scoreFilter.value === 'amarillo') result = result.filter(a => a.score >= 40 && a.score < 70)
  if (scoreFilter.value === 'rojo')     result = result.filter(a => a.score < 40)

  switch (orden.value) {
    case 'score-asc':  result = [...result].sort((a, b) => a.score - b.score); break
    case 'score-desc': result = [...result].sort((a, b) => b.score - a.score); break
    case 'nombre-asc': result = [...result].sort((a, b) => a.nombre.localeCompare(b.nombre)); break
    case 'fecha-desc': result = [...result].sort((a, b) => b.fecha_instalacion.localeCompare(a.fecha_instalacion)); break
  }
  return result
})

// ─── Paginación ───────────────────────────────────────────────
const PAGE_SIZE = 10
const page = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredList.value.length / PAGE_SIZE)))
const pagedList = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filteredList.value.slice(start, start + PAGE_SIZE)
})
watch([search, categoria, scoreFilter, orden], () => { page.value = 1 })

// ─── Tabla ────────────────────────────────────────────────────
const columns = [
  { key: 'nombre',     label: 'Equipo',     width: '32%' },
  { key: 'categoria',  label: 'Categoría',  width: '14%' },
  { key: 'ubicacion',  label: 'Ubicación',  width: '24%' },
  { key: 'score',      label: 'Score',      width: '12%', align: 'center' },
  { key: 'estado',     label: 'Estado',     width: '12%' },
  { key: 'acciones',   label: '',           width: '6%', align: 'right' },
]
function estadoVariant(e) {
  return { operativo: 'success', en_mantenimiento: 'warning', baja: 'danger' }[e] ?? 'default'
}
function estadoLabel(e) {
  return { operativo: 'Operativo', en_mantenimiento: 'En mantenimiento', baja: 'De baja' }[e] ?? e
}
function rowClass(row) {
  return row.score < 40 ? 'edu-table-tr--critical' : null
}

onMounted(async () => {
  if (activos.list.length === 0) await activos.fetchAll()
})
</script>

<template>
  <AppShell>
    <header class="activos-header">
      <div>
        <h1 class="activos-title">Activos tecnológicos</h1>
        <p class="activos-subtitle">
          {{ filteredList.length }} de {{ activos.list.length }} activos
        </p>
      </div>
      <EduButton variant="primary" @click="router.push('/coordinador/activos/nuevo')">
        <PlusIcon class="activos-icon" />
        Registrar activo
      </EduButton>
    </header>

    <!-- Filtros -->
    <div class="activos-filters">
      <div class="activos-search">
        <MagnifyingGlassIcon class="activos-search-icon" />
        <input
          v-model="search"
          type="text"
          class="activos-search-input"
          placeholder="Buscar por nombre, marca, modelo o ubicación…"
        />
        <button
          v-if="search"
          type="button"
          class="activos-search-clear"
          @click="search = ''"
          aria-label="Limpiar búsqueda"
        >
          <XMarkIcon class="activos-icon" />
        </button>
      </div>
      <div class="activos-filter-group">
        <EduSelect
          v-model="categoria"
          placeholder="Categoría"
          :options="categoriaOptions"
        />
        <EduSelect
          v-model="scoreFilter"
          placeholder="Score"
          :options="scoreOptions"
        />
        <EduSelect
          v-model="orden"
          placeholder="Orden"
          :options="ordenOptions"
        />
        <button
          v-if="hayFiltrosActivos"
          type="button"
          class="activos-filter-clear"
          @click="limpiarFiltros"
        >
          Limpiar filtros
        </button>
      </div>
    </div>

    <!-- Tabla -->
    <div v-if="activos.loading" class="activos-skeletons">
      <SkeletonLoader v-for="n in 6" :key="n" width="100%" height="56px" />
    </div>

    <EmptyState
      v-else-if="filteredList.length === 0"
      title="Sin activos para mostrar"
      :description="hayFiltrosActivos
        ? 'Ningún activo coincide con los filtros aplicados. Prueba ajustarlos.'
        : 'Aún no hay activos registrados en tu institución. Comienza registrando el primero.'"
    >
      <template #action>
        <EduButton
          v-if="!hayFiltrosActivos"
          variant="primary"
          @click="router.push('/coordinador/activos/nuevo')"
        >
          <PlusIcon class="activos-icon" />
          Registrar primer activo
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
        @row-click="row => router.push(`/coordinador/activos/${row.id}`)"
      >
        <!-- Equipo -->
        <template #cell-nombre="{ row }">
          <div class="cell-nombre">
            <span class="cell-nombre-icon">
              <CubeIcon />
            </span>
            <div>
              <p class="cell-nombre-title">{{ row.nombre }}</p>
              <p class="cell-nombre-meta">{{ row.marca }} · {{ row.modelo }}</p>
            </div>
          </div>
        </template>

        <!-- Categoría -->
        <template #cell-categoria="{ value }">
          <span class="cell-categoria">{{ value }}</span>
        </template>

        <!-- Ubicación -->
        <template #cell-ubicacion="{ value }">
          <span class="cell-ubicacion">{{ value }}</span>
        </template>

        <!-- Score -->
        <template #cell-score="{ value }">
          <ScoreBadge :score="value" size="md" />
        </template>

        <!-- Estado -->
        <template #cell-estado="{ value }">
          <EduBadge :variant="estadoVariant(value)" size="sm">{{ estadoLabel(value) }}</EduBadge>
        </template>

        <!-- Acciones -->
        <template #cell-acciones>
          <ChevronRightIcon class="cell-chevron" />
        </template>
      </EduTable>

      <!-- Paginación -->
      <nav v-if="totalPages > 1" class="activos-pagination">
        <button
          type="button"
          class="activos-page-btn"
          :disabled="page === 1"
          @click="page--"
        >
          <ChevronLeftIcon class="activos-icon" />
          Anterior
        </button>
        <span class="activos-page-info">
          Página <strong>{{ page }}</strong> de <strong>{{ totalPages }}</strong>
        </span>
        <button
          type="button"
          class="activos-page-btn"
          :disabled="page === totalPages"
          @click="page++"
        >
          Siguiente
          <ChevronRightIcon class="activos-icon" />
        </button>
      </nav>
    </template>
  </AppShell>
</template>

<style scoped>
.activos-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.activos-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.5px;
  margin: 0 0 4px;
}
.activos-subtitle {
  font-size: 13.5px;
  color: var(--color-text-secondary);
  margin: 0;
}
.activos-icon { width: 16px; height: 16px; }

/* Filtros */
.activos-filters {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
@media (max-width: 900px) {
  .activos-filters { flex-direction: column; align-items: stretch; padding: 14px; }
}
.activos-search {
  position: relative;
  flex: 1;
  min-width: 180px;
}
.activos-search-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--color-text-disabled);
}
.activos-search-input {
  width: 100%;
  height: 44px;
  padding: 0 44px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-family: inherit;
  color: var(--color-text-primary);
  background: var(--color-surface);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.activos-search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-ring);
}
.activos-search-clear {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border: none;
  background: var(--color-bg);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
}
.activos-search-clear:hover { background: var(--color-primary-light); color: var(--color-primary); }

.activos-filter-group {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
  flex-wrap: wrap;
}
.activos-filter-clear {
  height: 44px;
  padding: 0 14px;
  border: 1px dashed var(--color-border);
  background: transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  white-space: nowrap;
  transition: all var(--transition-fast);
}
.activos-filter-clear:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

/* Celdas tabla */
.cell-nombre {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cell-nombre-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.cell-nombre-icon :deep(svg) { width: 18px; height: 18px; }
.cell-nombre-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}
.cell-nombre-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 2px 0 0;
}
.cell-categoria, .cell-ubicacion {
  font-size: 13px;
  color: var(--color-text-secondary);
}
.cell-chevron {
  width: 18px;
  height: 18px;
  color: var(--color-text-disabled);
  margin-left: auto;
}

/* Paginación */
.activos-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}
.activos-page-btn {
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
.activos-page-btn:hover:not(:disabled) {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.activos-page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.activos-page-info {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.activos-page-info strong { color: var(--color-text-primary); font-weight: 700; }

.activos-skeletons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
