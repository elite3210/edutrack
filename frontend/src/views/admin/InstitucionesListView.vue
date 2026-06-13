<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as adminApi from '@/api/admin.api'
import { useToast }  from '@/composables/useToast'
import AppShell      from '@/components/layout/AppShell.vue'
import EduButton     from '@/components/ui/EduButton.vue'
import EduTable      from '@/components/ui/EduTable.vue'
import EduSelect     from '@/components/ui/EduSelect.vue'
import EmptyState    from '@/components/ui/EmptyState.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PencilSquareIcon,
  BuildingOffice2Icon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const { success, danger: toastError } = useToast()

const lista   = ref([])
const loading = ref(false)
const search  = ref('')
const estadoFiltro = ref('')

const estadoOptions = [
  { value: '',         label: 'Todos los estados' },
  { value: 'activas',   label: 'Activas' },
  { value: 'inactivas', label: 'Inactivas' },
]

async function load() {
  loading.value = true
  try {
    lista.value = await adminApi.getInstituciones()
  } finally {
    loading.value = false
  }
}
onMounted(load)

const filtradas = computed(() => {
  let r = lista.value
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    r = r.filter(i =>
      i.nombre_legal.toLowerCase().includes(q) ||
      i.nombre_corto.toLowerCase().includes(q) ||
      i.ruc.includes(q) ||
      i.email_contacto.toLowerCase().includes(q),
    )
  }
  if (estadoFiltro.value === 'activas')   r = r.filter(i => i.activa)
  if (estadoFiltro.value === 'inactivas') r = r.filter(i => !i.activa)
  return r
})

const totales = computed(() => ({
  total:     lista.value.length,
  activas:   lista.value.filter(i => i.activa).length,
  activos:   lista.value.reduce((s, i) => s + (i.total_activos ?? 0), 0),
  usuarios:  lista.value.reduce((s, i) => s + (i.total_usuarios ?? 0), 0),
}))

const togglandoId = ref(null)
async function toggleActiva(inst) {
  togglandoId.value = inst.id
  try {
    const actualizada = await adminApi.updateInstitucion(inst.id, { activa: !inst.activa })
    const idx = lista.value.findIndex(i => i.id === inst.id)
    if (idx !== -1) lista.value[idx] = actualizada
    success(`Institución ${actualizada.activa ? 'activada' : 'desactivada'}`)
  } catch {
    toastError('No se pudo actualizar')
  } finally {
    togglandoId.value = null
  }
}

const columns = [
  { key: 'nombre',    label: 'Institución', width: '32%' },
  { key: 'ruc',       label: 'RUC',         width: '12%' },
  { key: 'contacto',  label: 'Contacto',    width: '22%' },
  { key: 'activos',   label: 'Activos',     width: '8%',  align: 'center' },
  { key: 'usuarios',  label: 'Usuarios',    width: '8%',  align: 'center' },
  { key: 'activa',    label: 'Estado',      width: '10%', align: 'center' },
  { key: 'acciones',  label: '',            width: '8%',  align: 'right' },
]

const hayFiltros = computed(() => search.value || estadoFiltro.value)
function limpiar() { search.value = ''; estadoFiltro.value = '' }
</script>

<template>
  <AppShell>
    <header class="i-header">
      <div>
        <p class="i-eyebrow">Super admin</p>
        <h1 class="i-title">Instituciones</h1>
        <p class="i-subtitle">
          {{ totales.total }} clientes · {{ totales.activas }} activas ·
          {{ totales.activos }} activos · {{ totales.usuarios }} usuarios
        </p>
      </div>
      <EduButton variant="primary" @click="router.push('/admin/instituciones/nueva')">
        <PlusIcon class="i-icon" />
        Nueva institución
      </EduButton>
    </header>

    <div class="i-filters">
      <div class="i-search">
        <MagnifyingGlassIcon class="i-search-icon" />
        <input
          v-model="search"
          type="text"
          class="i-search-input"
          placeholder="Buscar por nombre, RUC o email…"
        />
        <button
          v-if="search"
          type="button"
          class="i-search-clear"
          @click="search = ''"
          aria-label="Limpiar búsqueda"
        >
          <XMarkIcon class="i-icon" />
        </button>
      </div>
      <div class="i-filter-group">
        <EduSelect v-model="estadoFiltro" :options="estadoOptions" />
        <button
          v-if="hayFiltros"
          type="button"
          class="i-filter-clear"
          @click="limpiar"
        >
          Limpiar
        </button>
      </div>
    </div>

    <div v-if="loading" class="i-skeletons">
      <SkeletonLoader v-for="n in 4" :key="n" width="100%" height="56px" />
    </div>

    <EmptyState
      v-else-if="filtradas.length === 0"
      title="Sin instituciones"
      :description="hayFiltros
        ? 'Ninguna institución coincide con los filtros.'
        : 'Aún no hay instituciones registradas.'"
    >
      <template #action>
        <EduButton
          v-if="!hayFiltros"
          variant="primary"
          @click="router.push('/admin/instituciones/nueva')"
        >
          <PlusIcon class="i-icon" />
          Crear primera institución
        </EduButton>
        <EduButton v-else variant="outline-gray" @click="limpiar">
          Limpiar filtros
        </EduButton>
      </template>
    </EmptyState>

    <template v-else>
      <EduTable :columns="columns" :rows="filtradas" :hover="false">
        <template #cell-nombre="{ row }">
          <div class="cell-inst">
            <div class="cell-inst-icon">
              <BuildingOffice2Icon />
            </div>
            <div>
              <p class="cell-inst-nombre">{{ row.nombre_corto }}</p>
              <p class="cell-inst-legal">{{ row.nombre_legal }}</p>
            </div>
          </div>
        </template>

        <template #cell-ruc="{ value }">
          <span class="cell-mono">{{ value }}</span>
        </template>

        <template #cell-contacto="{ row }">
          <div>
            <p class="cell-email">{{ row.email_contacto }}</p>
            <p class="cell-tel">{{ row.telefono }}</p>
          </div>
        </template>

        <template #cell-activos="{ value }">
          <span class="cell-count">{{ value }}</span>
        </template>

        <template #cell-usuarios="{ value }">
          <span class="cell-count">{{ value }}</span>
        </template>

        <template #cell-activa="{ row }">
          <button
            type="button"
            :class="['toggle', { 'toggle--on': row.activa, 'toggle--loading': togglandoId === row.id }]"
            :disabled="togglandoId === row.id"
            :aria-label="row.activa ? 'Desactivar institución' : 'Activar institución'"
            @click="toggleActiva(row)"
          >
            <span class="toggle-thumb" />
          </button>
        </template>

        <template #cell-acciones="{ row }">
          <button
            type="button"
            class="cell-action"
            @click="router.push(`/admin/instituciones/${row.id}/editar`)"
            aria-label="Editar institución"
          >
            <PencilSquareIcon />
          </button>
        </template>
      </EduTable>
    </template>
  </AppShell>
</template>

<style scoped>
.i-icon { width: 16px; height: 16px; }

.i-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.i-eyebrow {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--color-primary);
  margin: 0 0 6px;
}
.i-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}
.i-subtitle {
  font-size: 13.5px;
  color: var(--color-text-secondary);
  margin: 0;
}

.i-filters {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
@media (max-width: 640px) { .i-filters { flex-direction: column; align-items: stretch; } }
.i-search { position: relative; flex: 1; }
.i-search-icon {
  position: absolute; top: 50%; left: 14px;
  transform: translateY(-50%); width: 18px; height: 18px;
  color: var(--color-text-disabled);
}
.i-search-input {
  width: 100%; height: 44px;
  padding: 0 44px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-family: inherit;
  background: var(--color-surface);
}
.i-search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-ring);
}
.i-search-clear {
  position: absolute; top: 50%; right: 8px;
  transform: translateY(-50%); width: 28px; height: 28px;
  border: none; background: var(--color-bg);
  border-radius: 6px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-secondary);
}
.i-search-clear:hover { background: var(--color-primary-light); color: var(--color-primary); }

.i-filter-group {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}
.i-filter-clear {
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
}
.i-filter-clear:hover { border-color: var(--color-danger); color: var(--color-danger); }

.i-skeletons { display: flex; flex-direction: column; gap: 10px; }

/* Celdas */
.cell-inst {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cell-inst-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cell-inst-icon :deep(svg) { width: 20px; height: 20px; }
.cell-inst-nombre {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}
.cell-inst-legal {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 2px 0 0;
}
.cell-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
  color: var(--color-text-primary);
}
.cell-email {
  font-size: 13px;
  color: var(--color-text-primary);
  margin: 0;
}
.cell-tel {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 2px 0 0;
}
.cell-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 24px;
  padding: 0 8px;
  background: var(--color-bg);
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

/* Toggle */
.toggle {
  position: relative;
  width: 36px;
  height: 20px;
  border-radius: 9999px;
  background: var(--color-border);
  border: none;
  cursor: pointer;
  padding: 2px;
  display: inline-flex;
  align-items: center;
  transition: background var(--transition-fast);
}
.toggle-thumb {
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background: white;
  transition: transform var(--transition-fast);
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
.toggle--on { background: var(--color-success); }
.toggle--on .toggle-thumb { transform: translateX(16px); }
.toggle--loading { opacity: 0.5; cursor: wait; }

.cell-action {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.cell-action:hover { background: var(--color-primary-light); color: var(--color-primary); }
.cell-action :deep(svg) { width: 18px; height: 18px; }
</style>
