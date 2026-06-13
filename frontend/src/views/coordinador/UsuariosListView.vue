<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUsuariosStore } from '@/stores/usuarios'
import { useToast }         from '@/composables/useToast'
import AppShell      from '@/components/layout/AppShell.vue'
import EduButton     from '@/components/ui/EduButton.vue'
import EduTable      from '@/components/ui/EduTable.vue'
import EduBadge      from '@/components/ui/EduBadge.vue'
import EduSelect     from '@/components/ui/EduSelect.vue'
import EmptyState    from '@/components/ui/EmptyState.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PencilSquareIcon,
} from '@heroicons/vue/24/outline'

const router   = useRouter()
const usuarios = useUsuariosStore()
const { success, danger: toastError } = useToast()

const search    = ref('')
const rolFiltro = ref('')

const rolOptions = [
  { value: '',         label: 'Todos los roles' },
  { value: 'tecnico',  label: 'Técnicos' },
  { value: 'director', label: 'Directores' },
]
const rolMeta = {
  tecnico:    { label: 'Técnico',     variant: 'info' },
  director:   { label: 'Director',    variant: 'in-progress' },
  coordinador:{ label: 'Coordinador', variant: 'success' },
  super_admin:{ label: 'Super admin', variant: 'danger' },
}

const filteredList = computed(() => {
  let result = usuarios.list
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    result = result.filter(u =>
      u.nombre.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q),
    )
  }
  if (rolFiltro.value) {
    result = result.filter(u => u.rol === rolFiltro.value)
  }
  return result
})

const togglandoId = ref(null)
async function toggleActivo(u) {
  togglandoId.value = u.id
  try {
    await usuarios.update(u.id, { activo: !u.activo })
    success(`Usuario ${!u.activo ? 'activado' : 'desactivado'}`)
  } catch {
    toastError('No se pudo actualizar')
  } finally {
    togglandoId.value = null
  }
}

const columns = [
  { key: 'nombre',     label: 'Nombre',  width: '28%' },
  { key: 'email',      label: 'Email',   width: '28%' },
  { key: 'rol',        label: 'Rol',     width: '14%' },
  { key: 'creado_en',  label: 'Creado',  width: '14%' },
  { key: 'activo',     label: 'Estado',  width: '10%', align: 'center' },
  { key: 'acciones',   label: '',        width: '6%',  align: 'right' },
]

const hayFiltros = computed(() => search.value || rolFiltro.value)
function limpiarFiltros() {
  search.value = ''
  rolFiltro.value = ''
}

onMounted(async () => {
  if (usuarios.list.length === 0) await usuarios.fetchAll()
})
</script>

<template>
  <AppShell>
    <header class="users-header">
      <div>
        <h1 class="users-title">Usuarios</h1>
        <p class="users-subtitle">
          {{ filteredList.length }} de {{ usuarios.list.length }} usuarios
        </p>
      </div>
      <EduButton variant="primary" @click="router.push('/coordinador/usuarios/nuevo')">
        <PlusIcon class="users-icon" />
        Nuevo usuario
      </EduButton>
    </header>

    <!-- Filtros -->
    <div class="users-filters">
      <div class="users-search">
        <MagnifyingGlassIcon class="users-search-icon" />
        <input
          v-model="search"
          type="text"
          class="users-search-input"
          placeholder="Buscar por nombre o email…"
        />
        <button
          v-if="search"
          type="button"
          class="users-search-clear"
          @click="search = ''"
          aria-label="Limpiar búsqueda"
        >
          <XMarkIcon class="users-icon" />
        </button>
      </div>
      <div class="users-filter-group">
        <EduSelect v-model="rolFiltro" placeholder="Rol" :options="rolOptions" />
        <button
          v-if="hayFiltros"
          type="button"
          class="users-filter-clear"
          @click="limpiarFiltros"
        >
          Limpiar
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="usuarios.loading && usuarios.list.length === 0" class="users-skeletons">
      <SkeletonLoader v-for="n in 4" :key="n" width="100%" height="56px" />
    </div>

    <EmptyState
      v-else-if="filteredList.length === 0"
      title="Sin usuarios"
      :description="hayFiltros
        ? 'Ningún usuario coincide con los filtros.'
        : 'Aún no hay usuarios registrados. Crea el primero.'"
    >
      <template #action>
        <EduButton
          v-if="!hayFiltros"
          variant="primary"
          @click="router.push('/coordinador/usuarios/nuevo')"
        >
          <PlusIcon class="users-icon" />
          Crear primer usuario
        </EduButton>
        <EduButton v-else variant="outline-gray" @click="limpiarFiltros">
          Limpiar filtros
        </EduButton>
      </template>
    </EmptyState>

    <template v-else>
      <EduTable
        :columns="columns"
        :rows="filteredList"
        :hover="false"
      >
        <template #cell-nombre="{ row }">
          <div class="cell-user">
            <div class="cell-user-avatar">
              {{ row.nombre.charAt(0).toUpperCase() }}
            </div>
            <strong :class="{ 'cell-user-inactive': !row.activo }">{{ row.nombre }}</strong>
          </div>
        </template>

        <template #cell-email="{ value }">
          <span class="cell-email">{{ value }}</span>
        </template>

        <template #cell-rol="{ value }">
          <EduBadge :variant="rolMeta[value]?.variant ?? 'default'" size="sm">
            {{ rolMeta[value]?.label ?? value }}
          </EduBadge>
        </template>

        <template #cell-creado_en="{ value }">
          <span class="cell-fecha">{{ value }}</span>
        </template>

        <template #cell-activo="{ row }">
          <button
            type="button"
            :class="['toggle', { 'toggle--on': row.activo, 'toggle--loading': togglandoId === row.id }]"
            :disabled="togglandoId === row.id"
            :aria-label="row.activo ? 'Desactivar usuario' : 'Activar usuario'"
            @click="toggleActivo(row)"
          >
            <span class="toggle-thumb" />
          </button>
        </template>

        <template #cell-acciones="{ row }">
          <button
            type="button"
            class="cell-action"
            @click="router.push(`/coordinador/usuarios/${row.id}/editar`)"
            aria-label="Editar usuario"
          >
            <PencilSquareIcon />
          </button>
        </template>
      </EduTable>
    </template>
  </AppShell>
</template>

<style scoped>
.users-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.users-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}
.users-subtitle {
  font-size: 13.5px;
  color: var(--color-text-secondary);
  margin: 0;
}
.users-icon { width: 16px; height: 16px; }

.users-filters {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.users-search { position: relative; }
.users-search-icon {
  position: absolute; top: 50%; left: 14px;
  transform: translateY(-50%); width: 18px; height: 18px;
  color: var(--color-text-disabled);
}
.users-search-input {
  width: 100%; height: 44px;
  padding: 0 44px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-family: inherit;
  background: var(--color-surface);
}
.users-search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-ring);
}
.users-search-clear {
  position: absolute; top: 50%; right: 8px;
  transform: translateY(-50%); width: 28px; height: 28px;
  border: none; background: var(--color-bg);
  border-radius: 6px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-secondary);
}
.users-search-clear:hover { background: var(--color-primary-light); color: var(--color-primary); }

.users-filter-group {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: end;
}
.users-filter-clear {
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
.users-filter-clear:hover { border-color: var(--color-danger); color: var(--color-danger); }

.users-skeletons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Celdas */
.cell-user {
  display: flex;
  align-items: center;
  gap: 10px;
}
.cell-user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
}
.cell-user strong {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}
.cell-user-inactive {
  color: var(--color-text-disabled) !important;
  text-decoration: line-through;
}
.cell-email {
  font-size: 13px;
  color: var(--color-text-secondary);
}
.cell-fecha {
  font-size: 13px;
  color: var(--color-text-secondary);
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

/* Acciones */
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
