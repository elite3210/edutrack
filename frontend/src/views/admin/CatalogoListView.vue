<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as adminApi from '@/api/admin.api'
import { useToast }  from '@/composables/useToast'
import AppShell      from '@/components/layout/AppShell.vue'
import EduButton     from '@/components/ui/EduButton.vue'
import EduBadge      from '@/components/ui/EduBadge.vue'
import EduSelect     from '@/components/ui/EduSelect.vue'
import EmptyState    from '@/components/ui/EmptyState.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronDownIcon,
  PencilSquareIcon,
  CubeIcon,
  ClockIcon,
  DocumentArrowUpIcon,
  DocumentCheckIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const { success, warning } = useToast()

const modelos = ref([])
const loading = ref(false)
const search  = ref('')
const categoriaFiltro = ref('')

async function load() {
  loading.value = true
  try {
    modelos.value = await adminApi.getCatalogo()
  } finally {
    loading.value = false
  }
}
onMounted(load)

// ─── Filtros y agrupación ─────────────────────────────────────
const categoriaOptions = computed(() => {
  const cats = [...new Set(modelos.value.map(m => m.categoria))].sort()
  return [
    { value: '', label: 'Todas las categorías' },
    ...cats.map(c => ({ value: c, label: c })),
  ]
})

const filtradas = computed(() => {
  let r = modelos.value
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    r = r.filter(m =>
      m.marca.toLowerCase().includes(q) ||
      m.modelo.toLowerCase().includes(q) ||
      m.categoria.toLowerCase().includes(q),
    )
  }
  if (categoriaFiltro.value) r = r.filter(m => m.categoria === categoriaFiltro.value)
  return r
})

const grupos = computed(() => {
  const m = new Map()
  for (const item of filtradas.value) {
    if (!m.has(item.marca)) m.set(item.marca, [])
    m.get(item.marca).push(item)
  }
  return [...m.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([marca, items]) => ({
      marca,
      items: [...items].sort((a, b) => a.modelo.localeCompare(b.modelo)),
    }))
})

const colapsadas = ref({})
function toggle(marca) {
  colapsadas.value[marca] = !colapsadas.value[marca]
}
function isColapsada(marca) {
  return colapsadas.value[marca] === true
}

const totales = computed(() => ({
  modelos: modelos.value.length,
  marcas:  [...new Set(modelos.value.map(m => m.marca))].length,
  conPdf:  modelos.value.filter(m => m.manual_pdf?.nombre).length,
}))

function cargarPdfMock(modelo) {
  // Simulación: en producción abre file picker y dispara indexación
  warning(`Cargar PDF de ${modelo.marca} ${modelo.modelo} — funcionalidad simulada`)
}

const hayFiltros = computed(() => search.value || categoriaFiltro.value)
function limpiar() { search.value = ''; categoriaFiltro.value = '' }
</script>

<template>
  <AppShell>
    <header class="cl-header">
      <div>
        <p class="cl-eyebrow">Super admin</p>
        <h1 class="cl-title">Catálogo de fabricantes</h1>
        <p class="cl-subtitle">
          {{ totales.modelos }} modelos en {{ totales.marcas }} marcas ·
          {{ totales.conPdf }} con manual indexado
        </p>
      </div>
      <EduButton variant="primary" @click="router.push('/admin/catalogo/nuevo')">
        <PlusIcon class="cl-icon" />
        Nuevo modelo
      </EduButton>
    </header>

    <div class="cl-filters">
      <div class="cl-search">
        <MagnifyingGlassIcon class="cl-search-icon" />
        <input
          v-model="search"
          type="text"
          class="cl-search-input"
          placeholder="Buscar por marca, modelo o categoría…"
        />
        <button
          v-if="search"
          type="button"
          class="cl-search-clear"
          @click="search = ''"
          aria-label="Limpiar búsqueda"
        >
          <XMarkIcon class="cl-icon" />
        </button>
      </div>
      <div class="cl-filter-group">
        <EduSelect v-model="categoriaFiltro" :options="categoriaOptions" />
        <button
          v-if="hayFiltros"
          type="button"
          class="cl-filter-clear"
          @click="limpiar"
        >
          Limpiar
        </button>
      </div>
    </div>

    <div v-if="loading" class="cl-skeletons">
      <SkeletonLoader v-for="n in 3" :key="n" width="100%" height="140px" />
    </div>

    <EmptyState
      v-else-if="grupos.length === 0"
      title="Sin modelos"
      :description="hayFiltros
        ? 'Ningún modelo coincide con los filtros.'
        : 'Aún no hay modelos en el catálogo.'"
    >
      <template #action>
        <EduButton
          v-if="!hayFiltros"
          variant="primary"
          @click="router.push('/admin/catalogo/nuevo')"
        >
          <PlusIcon class="cl-icon" />
          Crear primer modelo
        </EduButton>
        <EduButton v-else variant="outline-gray" @click="limpiar">
          Limpiar filtros
        </EduButton>
      </template>
    </EmptyState>

    <div v-else class="cl-grupos">
      <section v-for="g in grupos" :key="g.marca" class="cl-grupo">
        <header
          class="cl-grupo-head"
          role="button"
          tabindex="0"
          @click="toggle(g.marca)"
          @keydown.enter="toggle(g.marca)"
          @keydown.space.prevent="toggle(g.marca)"
        >
          <div class="cl-grupo-marca">
            <div class="cl-grupo-icon">
              {{ g.marca.charAt(0).toUpperCase() }}
            </div>
            <div>
              <h2 class="cl-grupo-title">{{ g.marca }}</h2>
              <p class="cl-grupo-desc">
                {{ g.items.length }} {{ g.items.length === 1 ? 'modelo' : 'modelos' }}
              </p>
            </div>
          </div>
          <ChevronDownIcon
            :class="['cl-grupo-chevron', { 'cl-grupo-chevron--rotated': isColapsada(g.marca) }]"
          />
        </header>

        <div v-if="!isColapsada(g.marca)" class="cl-grupo-body">
          <article
            v-for="m in g.items"
            :key="m.id"
            class="cl-modelo"
            @click="router.push(`/admin/catalogo/${m.id}/editar`)"
          >
            <div class="cl-modelo-icon">
              <CubeIcon />
            </div>
            <div class="cl-modelo-info">
              <div class="cl-modelo-head">
                <h3 class="cl-modelo-nombre">{{ m.modelo }}</h3>
                <EduBadge variant="default" size="sm">{{ m.categoria }}</EduBadge>
              </div>
              <div class="cl-modelo-meta">
                <span class="cl-modelo-meta-item">
                  <ClockIcon class="cl-icon-sm" />
                  Vida útil: <strong>{{ Math.round(m.vida_util_meses / 12) }} años</strong>
                </span>
                <span class="cl-modelo-meta-item">
                  <WrenchScrewdriverIcon class="cl-icon-sm" />
                  <strong>{{ m.reglas?.length ?? 0 }}</strong>
                  {{ (m.reglas?.length ?? 0) === 1 ? 'regla' : 'reglas' }}
                </span>
                <span v-if="m.manual_pdf?.nombre" class="cl-modelo-pdf cl-modelo-pdf--ok">
                  <DocumentCheckIcon class="cl-icon-sm" />
                  Manual indexado
                </span>
                <span v-else class="cl-modelo-pdf cl-modelo-pdf--vacio">
                  <DocumentArrowUpIcon class="cl-icon-sm" />
                  Sin manual
                </span>
              </div>
            </div>
            <div class="cl-modelo-actions" @click.stop>
              <button
                type="button"
                class="cl-modelo-btn"
                title="Cargar PDF de manual"
                @click="cargarPdfMock(m)"
              >
                <DocumentArrowUpIcon />
              </button>
              <button
                type="button"
                class="cl-modelo-btn cl-modelo-btn--primary"
                title="Editar modelo"
                @click="router.push(`/admin/catalogo/${m.id}/editar`)"
              >
                <PencilSquareIcon />
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>
  </AppShell>
</template>

<style scoped>
.cl-icon    { width: 16px; height: 16px; flex-shrink: 0; }
.cl-icon-sm { width: 13px; height: 13px; flex-shrink: 0; }

.cl-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.cl-eyebrow {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--color-primary);
  margin: 0 0 6px;
}
.cl-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}
.cl-subtitle {
  font-size: 13.5px;
  color: var(--color-text-secondary);
  margin: 0;
}

.cl-filters {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
@media (max-width: 640px) { .cl-filters { flex-direction: column; align-items: stretch; } }
.cl-search { position: relative; flex: 1; }
.cl-search-icon {
  position: absolute; top: 50%; left: 14px;
  transform: translateY(-50%); width: 18px; height: 18px;
  color: var(--color-text-disabled);
}
.cl-search-input {
  width: 100%; height: 44px;
  padding: 0 44px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-family: inherit;
  background: var(--color-surface);
}
.cl-search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-ring);
}
.cl-search-clear {
  position: absolute; top: 50%; right: 8px;
  transform: translateY(-50%); width: 28px; height: 28px;
  border: none; background: var(--color-bg);
  border-radius: 6px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-secondary);
}
.cl-search-clear:hover { background: var(--color-primary-light); color: var(--color-primary); }
.cl-filter-group {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}
.cl-filter-clear {
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
.cl-filter-clear:hover { border-color: var(--color-danger); color: var(--color-danger); }

.cl-skeletons { display: flex; flex-direction: column; gap: 12px; }

/* Grupos */
.cl-grupos { display: flex; flex-direction: column; gap: 14px; }
.cl-grupo {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.cl-grupo-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 18px;
  cursor: pointer;
  user-select: none;
  background: var(--color-bg);
  transition: background var(--transition-fast);
}
.cl-grupo-head:hover { background: var(--color-primary-light); }
.cl-grupo-head:focus-visible { outline: 2px solid var(--color-primary); outline-offset: -2px; }

.cl-grupo-marca { display: flex; align-items: center; gap: 12px; }
.cl-grupo-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}
.cl-grupo-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}
.cl-grupo-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 1px 0 0;
}
.cl-grupo-chevron {
  width: 20px; height: 20px;
  color: var(--color-text-secondary);
  transition: transform var(--transition-fast);
}
.cl-grupo-chevron--rotated { transform: rotate(-90deg); }

.cl-grupo-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--color-border);
}

.cl-modelo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: var(--color-surface);
  cursor: pointer;
  transition: background var(--transition-fast);
}
.cl-modelo:hover { background: var(--color-bg); }
.cl-modelo-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cl-modelo-icon :deep(svg) { width: 18px; height: 18px; }
.cl-modelo-info { flex: 1; min-width: 0; }
.cl-modelo-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}
.cl-modelo-nombre {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}
.cl-modelo-meta {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.cl-modelo-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.cl-modelo-meta-item strong { color: var(--color-text-primary); font-weight: 600; }

.cl-modelo-pdf {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 11px;
}
.cl-modelo-pdf--ok {
  background: var(--color-success-bg);
  color: var(--color-success);
}
.cl-modelo-pdf--vacio {
  background: var(--color-bg);
  color: var(--color-text-secondary);
  border: 1px dashed var(--color-border);
}

.cl-modelo-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.cl-modelo-btn {
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
  transition: background var(--transition-fast), color var(--transition-fast);
}
.cl-modelo-btn :deep(svg) { width: 18px; height: 18px; }
.cl-modelo-btn:hover { background: var(--color-bg); color: var(--color-text-primary); }
.cl-modelo-btn--primary:hover { background: var(--color-primary-light); color: var(--color-primary); }
</style>
