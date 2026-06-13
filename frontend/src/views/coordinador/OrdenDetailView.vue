<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOrdenesStore }  from '@/stores/ordenes'
import { useActivosStore }  from '@/stores/activos'
import { useUsuariosStore } from '@/stores/usuarios'
import { useToast }         from '@/composables/useToast'
import AppShell      from '@/components/layout/AppShell.vue'
import EduCard       from '@/components/ui/EduCard.vue'
import EduButton     from '@/components/ui/EduButton.vue'
import EduModal      from '@/components/ui/EduModal.vue'
import EduInput      from '@/components/ui/EduInput.vue'
import EduSelect     from '@/components/ui/EduSelect.vue'
import EduTextarea   from '@/components/ui/EduTextarea.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EmptyState    from '@/components/ui/EmptyState.vue'
import EstadoBadge    from '@/components/ordenes/EstadoBadge.vue'
import PrioridadBadge from '@/components/ordenes/PrioridadBadge.vue'
import EduScoreRing   from '@/components/activos/EduScoreRing.vue'
import {
  ArrowLeftIcon,
  WrenchScrewdriverIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  CubeIcon,
  MapPinIcon,
  PhotoIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  PencilSquareIcon,
  ChevronRightIcon,
  DocumentTextIcon,
} from '@heroicons/vue/24/outline'

const router   = useRouter()
const route    = useRoute()
const ordenes  = useOrdenesStore()
const activos  = useActivosStore()
const usuarios = useUsuariosStore()
const { success, danger: toastError } = useToast()

const loading = ref(true)
const orden   = computed(() => ordenes.current)
const activo  = computed(() => activos.list.find(a => a.id === orden.value?.activo_id))

async function load() {
  loading.value = true
  try {
    const promises = [ordenes.fetchOne(route.params.id)]
    if (activos.list.length === 0)  promises.push(activos.fetchAll())
    if (usuarios.list.length === 0) promises.push(usuarios.fetchAll())
    await Promise.all(promises)
  } finally {
    loading.value = false
  }
}
onMounted(load)

// ─── Reasignación ────────────────────────────────────────────
const showReasignar = ref(false)
const nuevoTecnico  = ref('')
const reasignando   = ref(false)

const tecnicosOptions = computed(() => [
  { value: '', label: 'Sin asignar' },
  ...usuarios.list
    .filter(u => u.rol === 'tecnico' && u.activo)
    .map(u => ({ value: u.id, label: u.nombre })),
])

function abrirReasignar() {
  nuevoTecnico.value = orden.value?.tecnico_id ?? ''
  showReasignar.value = true
}
async function confirmarReasignacion() {
  reasignando.value = true
  try {
    const t = usuarios.list.find(u => u.id === nuevoTecnico.value)
    await ordenes.update(orden.value.id, {
      tecnico_id:     nuevoTecnico.value || null,
      tecnico_nombre: t?.nombre ?? null,
    })
    success('Técnico actualizado')
    showReasignar.value = false
  } catch {
    toastError('No se pudo reasignar')
  } finally {
    reasignando.value = false
  }
}

// ─── Modal: cambiar prioridad ────────────────────────────────
const showPrioridad      = ref(false)
const nuevaPrioridad     = ref('')
const notaPrioridad      = ref('')
const guardandoPrioridad = ref(false)

function abrirCambiarPrioridad() {
  nuevaPrioridad.value = orden.value.prioridad
  notaPrioridad.value  = ''
  showPrioridad.value  = true
}
async function confirmarPrioridad() {
  if (nuevaPrioridad.value === orden.value.prioridad) { showPrioridad.value = false; return }
  guardandoPrioridad.value = true
  try {
    await ordenes.update(orden.value.id, {
      prioridad:   nuevaPrioridad.value,
      nota_cambio: notaPrioridad.value.trim() || null,
      usuario:     'Coordinador',
    })
    success('Prioridad actualizada')
    showPrioridad.value = false
  } catch {
    toastError('No se pudo actualizar la prioridad')
  } finally {
    guardandoPrioridad.value = false
  }
}

// ─── Modal: cambiar estado ───────────────────────────────────
const showEstado        = ref(false)
const nuevoEstado       = ref('')
const descripcionCierre = ref('')
const notaEstado        = ref('')
const guardandoEstado   = ref(false)

const estadoOptions = [
  { value: 'pendiente',    label: 'Pendiente' },
  { value: 'aceptada',     label: 'Aceptada' },
  { value: 'en_ejecucion', label: 'En ejecución' },
  { value: 'cerrada',      label: 'Cerrada' },
]

function abrirCambiarEstado() {
  nuevoEstado.value       = orden.value.estado
  descripcionCierre.value = ''
  notaEstado.value        = ''
  showEstado.value        = true
}
async function confirmarEstado() {
  if (nuevoEstado.value === orden.value.estado) { showEstado.value = false; return }
  if (nuevoEstado.value === 'cerrada' && !descripcionCierre.value.trim()) {
    toastError('Describe el trabajo realizado para cerrar la orden')
    return
  }
  guardandoEstado.value = true
  try {
    if (nuevoEstado.value === 'cerrada') {
      await ordenes.updateEstado(orden.value.id, 'cerrada', {
        descripcion_cierre: descripcionCierre.value.trim(),
        cerrada_en:         new Date().toISOString().split('T')[0],
        usuario:            'Coordinador',
        nota_cambio:        null,
      })
      success('Orden cerrada correctamente')
    } else {
      await ordenes.updateEstado(orden.value.id, nuevoEstado.value, {
        usuario:     'Coordinador',
        nota_cambio: notaEstado.value.trim() || null,
      })
      success('Estado actualizado')
    }
    showEstado.value = false
  } catch {
    toastError('No se pudo actualizar el estado')
  } finally {
    guardandoEstado.value = false
  }
}

// ─── Modal: cambiar fecha límite ─────────────────────────────
const showFechaLimite      = ref(false)
const nuevaFechaLimite     = ref('')
const razonFechaLimite     = ref('')
const guardandoFechaLimite = ref(false)

function abrirCambiarFecha() {
  nuevaFechaLimite.value = orden.value.fecha_limite
  razonFechaLimite.value = ''
  showFechaLimite.value  = true
}
async function confirmarFecha() {
  if (!razonFechaLimite.value.trim()) {
    toastError('Indica el motivo del cambio de fecha')
    return
  }
  guardandoFechaLimite.value = true
  try {
    await ordenes.update(orden.value.id, {
      fecha_limite: nuevaFechaLimite.value,
      nota_cambio:  razonFechaLimite.value.trim(),
      usuario:      'Coordinador',
    })
    success('Fecha límite actualizada')
    showFechaLimite.value = false
  } catch {
    toastError('No se pudo actualizar la fecha')
  } finally {
    guardandoFechaLimite.value = false
  }
}
</script>

<template>
  <AppShell>
    <button class="ot-back" type="button" @click="router.push('/coordinador/ordenes')">
      <ArrowLeftIcon class="ot-icon" />
      Órdenes
    </button>

    <div v-if="loading" class="ot-loading">
      <SkeletonLoader width="60%" height="32px" />
      <SkeletonLoader width="100%" height="120px" style="margin-top: 16px" />
    </div>

    <EmptyState
      v-else-if="!orden"
      title="Orden no encontrada"
      description="No pudimos cargar esta orden de trabajo."
    >
      <template #action>
        <EduButton variant="primary" @click="router.push('/coordinador/ordenes')">
          Volver a la lista
        </EduButton>
      </template>
    </EmptyState>

    <template v-else>
      <!-- Header -->
      <header class="ot-header">
        <div class="ot-header-main">
          <div class="ot-numero">
            <WrenchScrewdriverIcon class="ot-icon" />
            <span>{{ orden.numero }}</span>
          </div>
          <h1 class="ot-title">{{ orden.activo_nombre }}</h1>
          <div class="ot-meta">
            <button
              v-if="orden.estado !== 'cerrada'"
              type="button"
              class="ot-badge-btn"
              title="Cambiar prioridad"
              @click="abrirCambiarPrioridad"
            >
              <PrioridadBadge :prioridad="orden.prioridad" size="md" />
              <PencilSquareIcon class="ot-badge-pencil" />
            </button>
            <PrioridadBadge v-else :prioridad="orden.prioridad" size="md" />

            <button
              v-if="orden.estado !== 'cerrada'"
              type="button"
              class="ot-badge-btn"
              title="Cambiar estado"
              @click="abrirCambiarEstado"
            >
              <EstadoBadge :estado="orden.estado" size="md" />
              <PencilSquareIcon class="ot-badge-pencil" />
            </button>
            <EstadoBadge v-else :estado="orden.estado" size="md" />

            <button
              v-if="orden.estado !== 'cerrada'"
              type="button"
              class="ot-badge-btn ot-meta-item"
              title="Cambiar fecha límite"
              @click="abrirCambiarFecha"
            >
              <CalendarDaysIcon class="ot-icon-sm" />
              Fecha límite: <strong>{{ orden.fecha_limite }}</strong>
              <PencilSquareIcon class="ot-badge-pencil" />
            </button>
            <span v-else class="ot-meta-item">
              <CalendarDaysIcon class="ot-icon-sm" />
              Fecha límite: <strong>{{ orden.fecha_limite }}</strong>
            </span>
          </div>
        </div>
        <div class="ot-header-actions">
          <span v-if="orden.estado === 'cerrada'" class="ot-cerrada-marker">
            <CheckCircleIcon class="ot-icon" />
            Orden cerrada el {{ orden.cerrada_en }}
          </span>
        </div>
      </header>

      <div class="ot-grid">
        <!-- Columna principal -->
        <div class="ot-main">
          <!-- Activo info -->
          <EduCard padding="sm">
            <div class="ot-activo">
              <div class="ot-activo-icon">
                <CubeIcon />
              </div>
              <div class="ot-activo-info">
                <p class="ot-activo-nombre">{{ orden.activo_nombre }}</p>
                <p class="ot-activo-meta">
                  <MapPinIcon class="ot-icon-sm" />
                  {{ orden.activo_ubicacion ?? activo?.ubicacion ?? 'Ubicación no disponible' }}
                </p>
              </div>
              <div v-if="activo" class="ot-activo-score">
                <EduScoreRing :score="activo.score" size="sm" />
              </div>
              <button
                class="ot-activo-link"
                type="button"
                @click="router.push(`/coordinador/activos/${orden.activo_id}`)"
                aria-label="Ver activo"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </EduCard>

          <!-- Descripción del trabajo -->
          <EduCard>
            <template #header>
              <h2 class="ot-section-title">
                <DocumentTextIcon class="ot-icon" />
                Trabajo a realizar
              </h2>
            </template>
            <p class="ot-tipo">{{ orden.tipo }}</p>
            <p class="ot-descripcion">{{ orden.descripcion }}</p>
          </EduCard>

          <!-- Descripción de cierre + evidencias -->
          <EduCard v-if="orden.estado === 'cerrada'">
            <template #header>
              <h2 class="ot-section-title">
                <CheckCircleIcon class="ot-icon" />
                Cierre de la orden
              </h2>
            </template>
            <p class="ot-descripcion">{{ orden.descripcion_cierre ?? 'Sin descripción de cierre.' }}</p>
            <div v-if="orden.evidencias?.length" class="ot-evidencias">
              <p class="ot-evidencias-title">
                <PhotoIcon class="ot-icon-sm" />
                Evidencias fotográficas ({{ orden.evidencias.length }})
              </p>
              <div class="ot-evidencias-grid">
                <div v-for="ev in orden.evidencias" :key="ev.id" class="ot-evidencia-thumb">
                  <PhotoIcon />
                  <span>{{ ev.nombre }}</span>
                </div>
              </div>
            </div>
          </EduCard>

          <!-- Timeline de estados -->
          <EduCard>
            <template #header>
              <h2 class="ot-section-title">
                <CalendarDaysIcon class="ot-icon" />
                Historial de cambios
              </h2>
            </template>
            <ol class="ot-timeline">
              <li
                v-for="(item, i) in orden.historial_estados ?? []"
                :key="i"
                class="ot-timeline-item"
              >
                <!-- Marker -->
                <div :class="['ot-timeline-marker', item.tipo === 'prioridad' || item.tipo === 'fecha_limite' ? 'ot-timeline-marker--meta' : `ot-timeline-marker--${item.estado}`]">
                  <CheckCircleIcon v-if="item.estado === 'cerrada'" />
                  <PlayCircleIcon  v-else-if="item.estado === 'en_ejecucion'" />
                  <CalendarDaysIcon v-else-if="item.tipo === 'fecha_limite'" />
                  <PencilSquareIcon v-else-if="item.tipo === 'prioridad'" />
                  <WrenchScrewdriverIcon v-else />
                </div>
                <!-- Content -->
                <div class="ot-timeline-content">
                  <div class="ot-timeline-head">
                    <!-- Estado -->
                    <EstadoBadge v-if="!item.tipo || item.tipo === 'estado'" :estado="item.estado" size="sm" />
                    <!-- Prioridad -->
                    <span v-else-if="item.tipo === 'prioridad'" class="ot-timeline-label ot-timeline-label--prioridad">
                      Prioridad: <em>{{ item.valor_anterior }}</em> → <strong>{{ item.valor_nuevo }}</strong>
                    </span>
                    <!-- Fecha límite -->
                    <span v-else-if="item.tipo === 'fecha_limite'" class="ot-timeline-label ot-timeline-label--fecha">
                      Fecha límite: <em>{{ item.valor_anterior }}</em> → <strong>{{ item.valor_nuevo }}</strong>
                    </span>
                    <span class="ot-timeline-fecha">{{ item.fecha }}</span>
                  </div>
                  <p class="ot-timeline-user">por <strong>{{ item.usuario }}</strong></p>
                  <p v-if="item.nota" class="ot-timeline-nota">{{ item.nota }}</p>
                </div>
              </li>
            </ol>
          </EduCard>
        </div>

        <!-- Sidebar -->
        <aside class="ot-sidebar">
          <EduCard padding="sm">
            <p class="ot-sidebar-title">Técnico asignado</p>
            <div v-if="orden.tecnico_id" class="ot-tecnico">
              <div class="ot-tecnico-avatar">
                {{ orden.tecnico_nombre?.charAt(0).toUpperCase() ?? '?' }}
              </div>
              <div class="ot-tecnico-info">
                <p class="ot-tecnico-nombre">{{ orden.tecnico_nombre }}</p>
                <p class="ot-tecnico-rol">Técnico de mantenimiento</p>
              </div>
            </div>
            <p v-else class="ot-tecnico-vacante">Sin técnico asignado</p>
            <EduButton
              v-if="orden.estado !== 'cerrada'"
              variant="outline-gray"
              size="sm"
              @click="abrirReasignar"
            >
              <PencilSquareIcon class="ot-icon" />
              {{ orden.tecnico_id ? 'Reasignar' : 'Asignar técnico' }}
            </EduButton>
          </EduCard>

          <EduCard padding="sm">
            <p class="ot-sidebar-title">Datos de la orden</p>
            <ul class="ot-sidebar-list">
              <li>
                <span>Tipo</span>
                <strong>{{ orden.tipo }}</strong>
              </li>
              <li>
                <span>Creada</span>
                <strong>{{ orden.creada_en }}</strong>
              </li>
              <li>
                <span>Fecha límite</span>
                <strong>{{ orden.fecha_limite }}</strong>
              </li>
              <li v-if="orden.cerrada_en">
                <span>Cerrada</span>
                <strong>{{ orden.cerrada_en }}</strong>
              </li>
            </ul>
          </EduCard>
        </aside>
      </div>
    </template>

    <!-- Modal: reasignación -->
    <EduModal v-model="showReasignar" title="Reasignar técnico">
      <EduSelect
        v-model="nuevoTecnico"
        label="Técnico"
        :options="tecnicosOptions"
      />
      <template #footer>
        <EduButton variant="outline-gray" @click="showReasignar = false">Cancelar</EduButton>
        <EduButton variant="primary" :loading="reasignando" @click="confirmarReasignacion">
          Guardar cambios
        </EduButton>
      </template>
    </EduModal>

    <!-- Modal: cambiar prioridad -->
    <EduModal v-model="showPrioridad" title="Cambiar prioridad">
      <p class="ot-modal-help">Selecciona la nueva prioridad para esta orden.</p>
      <div class="ot-prioridad-options">
        <button
          v-for="p in ['alta', 'media', 'baja']"
          :key="p"
          type="button"
          class="ot-prioridad-option"
          :class="[`ot-prioridad-option--${p}`, { 'is-active': nuevaPrioridad === p }]"
          @click="nuevaPrioridad = p"
        >
          {{ p.charAt(0).toUpperCase() + p.slice(1) }}
        </button>
      </div>
      <EduTextarea
        v-model="notaPrioridad"
        label="Motivo del cambio (opcional)"
        placeholder="¿Por qué se cambia la prioridad?"
        :rows="2"
        :maxlength="200"
        style="margin-top: 16px"
      />
      <template #footer>
        <EduButton variant="outline-gray" @click="showPrioridad = false">Cancelar</EduButton>
        <EduButton variant="primary" :loading="guardandoPrioridad" @click="confirmarPrioridad">
          Guardar cambios
        </EduButton>
      </template>
    </EduModal>

    <!-- Modal: cambiar estado -->
    <EduModal v-model="showEstado" title="Cambiar estado de la orden" size="md">
      <p class="ot-modal-help">Selecciona el nuevo estado. Si cierras la orden, deberás describir el trabajo realizado.</p>
      <div class="ot-estado-options">
        <button
          v-for="e in estadoOptions"
          :key="e.value"
          type="button"
          class="ot-estado-option"
          :class="{ 'is-active': nuevoEstado === e.value, 'is-current': orden.estado === e.value }"
          @click="nuevoEstado = e.value"
        >
          <EstadoBadge :estado="e.value" size="sm" />
          <span v-if="orden.estado === e.value" class="ot-estado-current-tag">actual</span>
        </button>
      </div>
      <EduTextarea
        v-if="nuevoEstado === 'cerrada'"
        v-model="descripcionCierre"
        label="Descripción del trabajo realizado"
        placeholder="Detalla qué se hizo en la intervención…"
        :rows="4"
        :maxlength="500"
        required
        style="margin-top: 16px"
      />
      <EduTextarea
        v-else-if="nuevoEstado && nuevoEstado !== orden.estado"
        v-model="notaEstado"
        label="Nota (opcional)"
        placeholder="¿Por qué se cambia el estado?"
        :rows="2"
        :maxlength="200"
        style="margin-top: 16px"
      />
      <template #footer>
        <EduButton variant="outline-gray" @click="showEstado = false">Cancelar</EduButton>
        <EduButton variant="primary" :loading="guardandoEstado" @click="confirmarEstado">
          <CheckCircleIcon class="ot-icon" />
          Guardar cambios
        </EduButton>
      </template>
    </EduModal>

    <!-- Modal: cambiar fecha límite -->
    <EduModal v-model="showFechaLimite" title="Cambiar fecha límite" size="md">
      <p class="ot-modal-help">El cambio de fecha quedará registrado en el historial. El motivo es obligatorio.</p>
      <EduInput
        v-model="nuevaFechaLimite"
        type="date"
        label="Nueva fecha límite"
        required
      />
      <EduTextarea
        v-model="razonFechaLimite"
        label="Motivo de la ampliación"
        placeholder="Ej: Técnico solicitó ampliación por falta de repuesto…"
        :rows="3"
        :maxlength="300"
        required
        style="margin-top: 16px"
      />
      <template #footer>
        <EduButton variant="outline-gray" @click="showFechaLimite = false">Cancelar</EduButton>
        <EduButton variant="primary" :loading="guardandoFechaLimite" @click="confirmarFecha">
          <CalendarDaysIcon class="ot-icon" />
          Guardar cambios
        </EduButton>
      </template>
    </EduModal>
  </AppShell>
</template>

<style scoped>
.ot-back {
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
.ot-back:hover { color: var(--color-primary-hover); }
.ot-icon    { width: 16px; height: 16px; flex-shrink: 0; }
.ot-icon-sm { width: 13px; height: 13px; flex-shrink: 0; }

.ot-loading { display: flex; flex-direction: column; gap: 16px; }

/* Header */
.ot-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.ot-header-main { min-width: 0; }
.ot-numero {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.6px;
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 4px 12px;
  border-radius: 9999px;
  margin-bottom: 8px;
}
.ot-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--color-text-primary);
  margin: 0 0 10px;
}
.ot-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

/* Badge clickeable (prioridad / estado) */
.ot-badge-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: opacity var(--transition-fast);
}
.ot-badge-btn:hover { opacity: 0.8; }
.ot-badge-pencil {
  width: 13px;
  height: 13px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

/* Modal prioridad — pills */
.ot-prioridad-options {
  display: flex;
  gap: 10px;
  margin-top: 4px;
  flex-wrap: wrap;
}
.ot-prioridad-option {
  flex: 1;
  min-width: 80px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  cursor: pointer;
  font-family: inherit;
  transition: border-color var(--transition-fast), transform var(--transition-fast);
}
.ot-prioridad-option:hover { transform: translateY(-1px); }
.ot-prioridad-option.is-active { border-color: currentColor; }
.ot-prioridad-option--alta  { background: var(--color-danger-bg);  color: var(--color-danger);  }
.ot-prioridad-option--media { background: var(--color-warning-bg); color: var(--color-warning); }
.ot-prioridad-option--baja  { background: var(--color-info-bg);    color: var(--color-info);    }

/* Modal estado — opciones */
.ot-estado-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}
.ot-estado-option {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--color-bg);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  padding: 8px 14px;
  cursor: pointer;
  font-family: inherit;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}
.ot-estado-option:hover { background: var(--color-border); }
.ot-estado-option.is-active { border-color: var(--color-primary); background: var(--color-primary-light); }
.ot-estado-current-tag {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--color-text-secondary);
}
.ot-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.ot-meta-item strong { color: var(--color-text-primary); font-weight: 600; }

.ot-header-actions { display: flex; gap: 8px; flex-shrink: 0; }
.ot-cerrada-marker {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--color-success-bg);
  color: var(--color-success);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
}

/* Grid */
.ot-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  align-items: start;
}
@media (max-width: 980px) { .ot-grid { grid-template-columns: 1fr; } }

.ot-main { display: flex; flex-direction: column; gap: 16px; }

.ot-section-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

/* Activo */
.ot-activo {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ot-activo-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ot-activo-icon :deep(svg) { width: 22px; height: 22px; }
.ot-activo-info { flex: 1; min-width: 0; }
.ot-activo-nombre {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}
.ot-activo-meta {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 4px 0 0;
}
.ot-activo-score { flex-shrink: 0; }
.ot-activo-link {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ot-activo-link:hover { background: var(--color-bg); color: var(--color-primary); }
.ot-activo-link :deep(svg) { width: 18px; height: 18px; }

/* Descripción */
.ot-tipo {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 3px 10px;
  border-radius: 9999px;
  margin: 0 0 12px;
}
.ot-descripcion {
  font-size: 14px;
  color: var(--color-text-primary);
  line-height: 1.6;
  margin: 0;
}

/* Evidencias */
.ot-evidencias { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--color-border); }
.ot-evidencias-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
  margin: 0 0 10px;
}
.ot-evidencias-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}
.ot-evidencia-thumb {
  aspect-ratio: 4 / 3;
  background: var(--color-bg);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--color-text-secondary);
}
.ot-evidencia-thumb :deep(svg) { width: 28px; height: 28px; }
.ot-evidencia-thumb span { font-size: 11px; }

/* Timeline */
.ot-timeline {
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
}
.ot-timeline::before {
  content: '';
  position: absolute;
  left: 17px;
  top: 12px;
  bottom: 12px;
  width: 2px;
  background: var(--color-border);
}
.ot-timeline-item {
  position: relative;
  display: flex;
  gap: 14px;
  padding-bottom: 16px;
}
.ot-timeline-item:last-child { padding-bottom: 0; }
.ot-timeline-marker {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: var(--color-warning-bg);
  color: var(--color-warning);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  border: 3px solid var(--color-surface);
}
.ot-timeline-marker :deep(svg) { width: 18px; height: 18px; }
.ot-timeline-marker--aceptada     { background: var(--color-info-bg);        color: var(--color-info); }
.ot-timeline-marker--en_ejecucion { background: var(--color-in-progress-bg); color: var(--color-in-progress); }
.ot-timeline-marker--cerrada      { background: var(--color-success-bg);     color: var(--color-success); }
.ot-timeline-marker--meta         { background: var(--color-bg); color: var(--color-text-secondary); border-color: var(--color-border); }

.ot-timeline-content { flex: 1; padding-top: 4px; }
.ot-timeline-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}
.ot-timeline-fecha {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.ot-timeline-user {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0;
}
.ot-timeline-user strong {
  color: var(--color-text-primary);
  font-weight: 600;
}
.ot-timeline-nota {
  font-size: 12.5px;
  color: var(--color-text-secondary);
  background: var(--color-bg);
  border-left: 3px solid var(--color-border);
  padding: 6px 10px;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  margin: 6px 0 0;
  line-height: 1.5;
}
.ot-timeline-label {
  font-size: 13px;
  color: var(--color-text-primary);
}
.ot-timeline-label em  { font-style: normal; color: var(--color-text-secondary); }
.ot-timeline-label strong { font-weight: 700; }

/* Sidebar */
.ot-sidebar { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 84px; }
@media (max-width: 980px) { .ot-sidebar { position: static; } }
.ot-sidebar-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--color-text-secondary);
  margin: 0 0 12px;
}
.ot-sidebar-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ot-sidebar-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}
.ot-sidebar-list span { color: var(--color-text-secondary); }
.ot-sidebar-list strong {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.ot-tecnico {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: var(--color-bg);
  border-radius: var(--radius-md);
  margin-bottom: 10px;
}
.ot-tecnico-avatar {
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}
.ot-tecnico-info { min-width: 0; }
.ot-tecnico-nombre { font-size: 13px; font-weight: 600; margin: 0; color: var(--color-text-primary); }
.ot-tecnico-rol    { font-size: 11px; color: var(--color-text-secondary); margin: 1px 0 0; }
.ot-tecnico-vacante {
  padding: 12px;
  font-size: 12px;
  text-align: center;
  color: var(--color-text-secondary);
  background: var(--color-bg);
  border-radius: var(--radius-md);
  margin: 0 0 10px;
  font-style: italic;
}

.ot-modal-help {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0 0 16px;
  padding: 10px 12px;
  background: var(--color-info-bg);
  border-radius: var(--radius-md);
  color: var(--color-info);
}
</style>
