<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore }    from '@/stores/auth'
import { useOrdenesStore } from '@/stores/ordenes'
import MobileShell   from '@/components/layout/MobileShell.vue'
import EmptyState    from '@/components/ui/EmptyState.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import OrdenCard     from '@/components/ordenes/OrdenCard.vue'
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline'

const router  = useRouter()
const auth    = useAuthStore()
const ordenes = useOrdenesStore()

const tab = ref('activas') // activas | en_ejecucion | cerradas

const tabs = [
  { key: 'activas',      label: 'Pendientes',   icon: ClipboardDocumentListIcon },
  { key: 'en_ejecucion', label: 'En ejecución', icon: WrenchScrewdriverIcon },
  { key: 'cerradas',     label: 'Cerradas',     icon: CheckCircleIcon },
]

const misOrdenes = computed(() =>
  ordenes.list.filter(o => o.tecnico_id === auth.user?.id),
)

const PRIO_RANK = { alta: 0, media: 1, baja: 2 }
function ordenar(a, b) {
  const pa = PRIO_RANK[a.prioridad] ?? 3
  const pb = PRIO_RANK[b.prioridad] ?? 3
  if (pa !== pb) return pa - pb
  return (a.fecha_limite ?? '').localeCompare(b.fecha_limite ?? '')
}

const filtradas = computed(() => {
  let result = misOrdenes.value
  if (tab.value === 'activas') {
    result = result.filter(o => ['pendiente', 'aceptada'].includes(o.estado))
  } else if (tab.value === 'en_ejecucion') {
    result = result.filter(o => o.estado === 'en_ejecucion')
  } else if (tab.value === 'cerradas') {
    result = result.filter(o => o.estado === 'cerrada')
  }
  return [...result].sort(ordenar)
})

const contadores = computed(() => ({
  activas:      misOrdenes.value.filter(o => ['pendiente', 'aceptada'].includes(o.estado)).length,
  en_ejecucion: misOrdenes.value.filter(o => o.estado === 'en_ejecucion').length,
  cerradas:     misOrdenes.value.filter(o => o.estado === 'cerrada').length,
}))

const nombre = computed(() => auth.user?.nombre?.split(' ')[0] ?? 'Técnico')

function abrirOrden(orden) {
  router.push(`/tecnico/ordenes/${orden.id}`)
}

const mensajeVacio = computed(() => ({
  activas:      { titulo: '¡Todo al día!',           texto: 'No tienes órdenes pendientes en este momento.' },
  en_ejecucion: { titulo: 'Sin trabajos activos',     texto: 'No tienes órdenes en ejecución.' },
  cerradas:     { titulo: 'Sin historial',           texto: 'Aún no has cerrado órdenes.' },
})[tab.value])

onMounted(async () => {
  if (ordenes.list.length === 0) await ordenes.fetchAll()
})
</script>

<template>
  <MobileShell title="Mis órdenes">
    <header class="mo-header">
      <p class="mo-greeting">Hola, {{ nombre }}</p>
      <p class="mo-subtitle">
        <ClockIcon class="mo-icon-sm" />
        {{ contadores.activas + contadores.en_ejecucion }} {{ (contadores.activas + contadores.en_ejecucion) === 1 ? 'orden activa' : 'órdenes activas' }}
      </p>
    </header>

    <nav class="mo-tabs" role="tablist">
      <button
        v-for="t in tabs"
        :key="t.key"
        :class="['mo-tab', { 'mo-tab--active': tab === t.key }]"
        type="button"
        role="tab"
        :aria-selected="tab === t.key"
        @click="tab = t.key"
      >
        <component :is="t.icon" class="mo-icon" />
        <span>{{ t.label }}</span>
        <span class="mo-tab-count">{{ contadores[t.key] }}</span>
      </button>
    </nav>

    <div v-if="ordenes.loading && ordenes.list.length === 0" class="mo-skeletons">
      <SkeletonLoader v-for="n in 3" :key="n" width="100%" height="120px" />
    </div>

    <EmptyState
      v-else-if="filtradas.length === 0"
      :title="mensajeVacio.titulo"
      :description="mensajeVacio.texto"
    />

    <ul v-else class="mo-list">
      <li v-for="o in filtradas" :key="o.id" class="mo-list-item">
        <OrdenCard :orden="o" @click="abrirOrden" />
      </li>
    </ul>
  </MobileShell>
</template>

<style scoped>
.mo-icon    { width: 16px; height: 16px; flex-shrink: 0; }
.mo-icon-sm { width: 14px; height: 14px; flex-shrink: 0; }

.mo-header { margin-bottom: 14px; }
.mo-greeting {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}
.mo-subtitle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

.mo-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 2px;
  -webkit-overflow-scrolling: touch;
}
.mo-tabs::-webkit-scrollbar { display: none; }
.mo-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  min-height: 48px;
  border-radius: 9999px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}
.mo-tab:hover { border-color: var(--color-primary); color: var(--color-primary); }
.mo-tab--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  font-weight: 600;
}
.mo-tab-count {
  background: var(--color-bg);
  color: var(--color-text-primary);
  padding: 1px 8px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.mo-tab--active .mo-tab-count {
  background: rgba(255,255,255,0.25);
  color: white;
}

.mo-skeletons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mo-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.mo-list-item { min-height: 48px; }
</style>
