<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOrdenesStore }  from '@/stores/ordenes'
import { useActivosStore }  from '@/stores/activos'
import { useUsuariosStore } from '@/stores/usuarios'
import { useAlertasStore }  from '@/stores/alertas'
import { useToast }         from '@/composables/useToast'
import AppShell    from '@/components/layout/AppShell.vue'
import EduCard     from '@/components/ui/EduCard.vue'
import EduInput    from '@/components/ui/EduInput.vue'
import EduSelect   from '@/components/ui/EduSelect.vue'
import EduTextarea from '@/components/ui/EduTextarea.vue'
import EduButton   from '@/components/ui/EduButton.vue'
import EduBadge    from '@/components/ui/EduBadge.vue'
import {
  ArrowLeftIcon,
  CubeIcon,
  WrenchScrewdriverIcon,
  UserCircleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

const router   = useRouter()
const route    = useRoute()
const ordenes  = useOrdenesStore()
const activos  = useActivosStore()
const usuarios = useUsuariosStore()
const alertas  = useAlertasStore()
const { success, danger: toastError } = useToast()

// ─── Estado del form ──────────────────────────────────────────
const form = ref({
  activo_id: '',
  tipo:      '',
  descripcion: '',
  prioridad: 'media',
  tecnico_id: '',
  fecha_limite: '',
})
const errors = ref({})
const submitting = ref(false)

// ─── Selector de activo ───────────────────────────────────────
const activoQuery = ref('')
const showActivoResults = ref(false)
const activoSeleccionado = computed(() =>
  activos.list.find(a => a.id === form.value.activo_id) ?? null,
)
const activosFiltrados = computed(() => {
  if (!activoQuery.value.trim()) return activos.list.slice(0, 8)
  const q = activoQuery.value.trim().toLowerCase()
  return activos.list.filter(a =>
    a.nombre.toLowerCase().includes(q) ||
    a.ubicacion.toLowerCase().includes(q) ||
    a.marca.toLowerCase().includes(q),
  ).slice(0, 8)
})

function seleccionarActivo(a) {
  form.value.activo_id = a.id
  activoQuery.value = ''
  showActivoResults.value = false
}
function limpiarActivo() {
  form.value.activo_id = ''
}

// ─── Selectores estáticos ─────────────────────────────────────
const tipoOptions = [
  { value: '',           label: 'Selecciona tipo' },
  { value: 'Preventivo', label: 'Preventivo (mantenimiento programado)' },
  { value: 'Correctivo', label: 'Correctivo (reparación de falla)' },
  { value: 'Emergencia', label: 'Emergencia (intervención inmediata)' },
]
const prioridadOptions = [
  { value: 'alta',  label: 'Alta',  help: 'Requiere atención en 24-48 h' },
  { value: 'media', label: 'Media', help: 'Atender esta semana' },
  { value: 'baja',  label: 'Baja',  help: 'Programar según disponibilidad' },
]
const tecnicosOptions = computed(() => [
  { value: '', label: 'Sin asignar (asignar luego)' },
  ...usuarios.list
    .filter(u => u.rol === 'tecnico' && u.activo)
    .map(u => ({ value: u.id, label: `${u.nombre} · ${u.email}` })),
])

// ─── Alerta origen ────────────────────────────────────────────
const alertaOrigen = computed(() => {
  if (!route.query.alerta) return null
  return alertas.list.find(a => a.id === route.query.alerta) ?? null
})

// ─── Validación ───────────────────────────────────────────────
function validate() {
  const e = {}
  if (!form.value.activo_id)    e.activo_id    = 'Selecciona un activo'
  if (!form.value.tipo)         e.tipo         = 'Selecciona el tipo de orden'
  if (!form.value.descripcion?.trim()) e.descripcion = 'Describe el trabajo a realizar'
  else if (form.value.descripcion.trim().length < 10) e.descripcion = 'Describe con al menos 10 caracteres'
  if (!form.value.fecha_limite) e.fecha_limite = 'Indica la fecha límite'
  errors.value = e
  return Object.keys(e).length === 0
}

watch(() => form.value.descripcion,  () => { if (errors.value.descripcion)  validate() })
watch(() => form.value.activo_id,    () => { if (errors.value.activo_id)    validate() })
watch(() => form.value.tipo,         () => { if (errors.value.tipo)         validate() })
watch(() => form.value.fecha_limite, () => { if (errors.value.fecha_limite) validate() })

// ─── Submit ───────────────────────────────────────────────────
async function onSubmit() {
  if (!validate()) {
    toastError('Revisa los campos marcados')
    return
  }
  submitting.value = true
  try {
    const tecnico = usuarios.list.find(u => u.id === form.value.tecnico_id)
    const payload = {
      activo_id:        form.value.activo_id,
      activo_nombre:    activoSeleccionado.value?.nombre,
      activo_ubicacion: activoSeleccionado.value?.ubicacion,
      tipo:             form.value.tipo,
      descripcion:      form.value.descripcion.trim(),
      prioridad:        form.value.prioridad,
      tecnico_id:       form.value.tecnico_id || null,
      tecnico_nombre:   tecnico?.nombre ?? null,
      fecha_limite:     form.value.fecha_limite,
    }
    const nueva = await ordenes.create(payload)
    success(`Orden ${nueva.numero} creada`)
    router.push(`/coordinador/ordenes/${nueva.id}`)
  } catch (err) {
    toastError('No se pudo crear la orden')
  } finally {
    submitting.value = false
  }
}

// ─── Carga inicial ────────────────────────────────────────────
onMounted(async () => {
  const promises = []
  if (activos.list.length === 0)  promises.push(activos.fetchAll())
  if (usuarios.list.length === 0) promises.push(usuarios.fetchAll())
  if (alertas.list.length === 0)  promises.push(alertas.fetchAll())
  await Promise.all(promises)

  // Pre-relleno desde query params
  if (route.query.activo) {
    form.value.activo_id = route.query.activo
  }
  if (route.query.alerta) {
    const a = alertas.list.find(al => al.id === route.query.alerta)
    if (a) {
      form.value.activo_id = a.activo_id
      form.value.tipo = a.tipo === 'mantenimiento_vencido' || a.tipo === 'mantenimiento_proximo'
        ? 'Preventivo' : 'Correctivo'
      form.value.descripcion = a.mensaje
      form.value.prioridad = a.tipo === 'riesgo_falla' || (a.dias_restantes !== null && a.dias_restantes < 0)
        ? 'alta' : 'media'
    }
  }
})
</script>

<template>
  <AppShell>
    <button class="form-back" type="button" @click="router.push('/coordinador/ordenes')">
      <ArrowLeftIcon class="form-icon" />
      Órdenes
    </button>

    <header class="form-header">
      <h1 class="form-title">Nueva Orden de Trabajo</h1>
      <p class="form-subtitle">Asigna un trabajo de mantenimiento o reparación a un técnico.</p>
    </header>

    <!-- Banner alerta origen -->
    <div v-if="alertaOrigen" class="form-alerta-banner">
      <InformationCircleIcon class="form-icon" />
      <div>
        <p class="form-alerta-title">Creando orden desde alerta</p>
        <p class="form-alerta-msg">
          <strong>{{ alertaOrigen.activo_nombre }}</strong> · {{ alertaOrigen.mensaje }}
        </p>
      </div>
    </div>

    <form @submit.prevent="onSubmit" class="form-grid" novalidate>
      <div class="form-main">
        <!-- Sección Activo -->
        <EduCard>
          <template #header>
            <h2 class="form-section-title">
              <CubeIcon class="form-icon" />
              Activo a intervenir
            </h2>
          </template>

          <div v-if="activoSeleccionado" class="form-activo-seleccionado">
            <div class="form-activo-icon">
              <CubeIcon />
            </div>
            <div class="form-activo-info">
              <p class="form-activo-nombre">{{ activoSeleccionado.nombre }}</p>
              <p class="form-activo-meta">
                {{ activoSeleccionado.marca }} · {{ activoSeleccionado.modelo }} ·
                {{ activoSeleccionado.ubicacion }}
              </p>
            </div>
            <button type="button" class="form-activo-clear" @click="limpiarActivo" aria-label="Cambiar activo">
              <XMarkIcon />
            </button>
          </div>

          <div v-else>
            <div class="form-search">
              <MagnifyingGlassIcon class="form-search-icon" />
              <input
                v-model="activoQuery"
                type="text"
                class="form-search-input"
                placeholder="Buscar activo por nombre, ubicación o marca…"
                @focus="showActivoResults = true"
                @input="showActivoResults = true"
              />
            </div>
            <ul v-if="showActivoResults" class="form-search-results">
              <li
                v-for="a in activosFiltrados"
                :key="a.id"
                class="form-search-result"
                @click="seleccionarActivo(a)"
              >
                <div>
                  <p class="form-search-result-title">{{ a.nombre }}</p>
                  <p class="form-search-result-meta">{{ a.marca }} · {{ a.ubicacion }}</p>
                </div>
                <span :class="['form-score-pill', `form-score-pill--${a.score >= 70 ? 'success' : a.score >= 40 ? 'warning' : 'danger'}`]">
                  {{ a.score }}
                </span>
              </li>
              <li v-if="activosFiltrados.length === 0" class="form-search-empty">
                No se encontraron activos
              </li>
            </ul>
            <p v-if="errors.activo_id" class="form-error-text">⚠ {{ errors.activo_id }}</p>
          </div>
        </EduCard>

        <!-- Sección Orden -->
        <EduCard>
          <template #header>
            <h2 class="form-section-title">
              <WrenchScrewdriverIcon class="form-icon" />
              Detalles de la orden
            </h2>
          </template>

          <div class="form-stack">
            <EduSelect
              v-model="form.tipo"
              label="Tipo de orden"
              :options="tipoOptions"
              :error="errors.tipo"
              required
            />

            <EduTextarea
              v-model="form.descripcion"
              label="Descripción del trabajo"
              placeholder="Describe el problema reportado o el trabajo a realizar…"
              :rows="5"
              :maxlength="500"
              :error="errors.descripcion"
              required
            />

            <div>
              <label class="form-label">
                <span class="form-required">*</span>
                Prioridad
              </label>
              <div class="form-radios">
                <label
                  v-for="opt in prioridadOptions"
                  :key="opt.value"
                  :class="['form-radio', { 'form-radio--active': form.prioridad === opt.value, [`form-radio--${opt.value}`]: form.prioridad === opt.value }]"
                >
                  <input
                    v-model="form.prioridad"
                    type="radio"
                    name="prioridad"
                    :value="opt.value"
                    class="form-radio-input"
                  />
                  <span class="form-radio-dot" />
                  <div>
                    <p class="form-radio-label">{{ opt.label }}</p>
                    <p class="form-radio-help">{{ opt.help }}</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </EduCard>

        <!-- Sección Asignación -->
        <EduCard>
          <template #header>
            <h2 class="form-section-title">
              <UserCircleIcon class="form-icon" />
              Asignación
            </h2>
          </template>

          <div class="form-row">
            <EduSelect
              v-model="form.tecnico_id"
              label="Técnico asignado"
              helper="Puedes asignarlo ahora o luego desde el detalle"
              :options="tecnicosOptions"
            />
            <EduInput
              v-model="form.fecha_limite"
              type="date"
              label="Fecha límite"
              :error="errors.fecha_limite"
              required
            />
          </div>
        </EduCard>
      </div>

      <!-- Sidebar resumen -->
      <aside class="form-sidebar">
        <EduCard padding="sm">
          <p class="form-sidebar-title">Resumen</p>
          <ul class="form-sidebar-list">
            <li>
              <span>Activo</span>
              <strong>{{ activoSeleccionado?.nombre ?? 'No seleccionado' }}</strong>
            </li>
            <li>
              <span>Tipo</span>
              <strong>{{ form.tipo || '—' }}</strong>
            </li>
            <li>
              <span>Prioridad</span>
              <strong>
                <EduBadge :variant="form.prioridad === 'alta' ? 'danger' : form.prioridad === 'media' ? 'warning' : 'info'" size="sm">
                  {{ form.prioridad.charAt(0).toUpperCase() + form.prioridad.slice(1) }}
                </EduBadge>
              </strong>
            </li>
            <li>
              <span>Técnico</span>
              <strong>{{ usuarios.list.find(u => u.id === form.tecnico_id)?.nombre ?? 'Sin asignar' }}</strong>
            </li>
            <li>
              <span>Fecha límite</span>
              <strong>{{ form.fecha_limite || '—' }}</strong>
            </li>
          </ul>
        </EduCard>

        <div class="form-actions">
          <EduButton variant="primary" type="submit" :loading="submitting" @click="onSubmit">
            <CheckCircleIcon class="form-icon" />
            Crear orden
          </EduButton>
          <EduButton variant="outline-gray" @click="router.push('/coordinador/ordenes')">
            Cancelar
          </EduButton>
        </div>
      </aside>
    </form>
  </AppShell>
</template>

<style scoped>
.form-back {
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
.form-back:hover { color: var(--color-primary-hover); }
.form-icon { width: 16px; height: 16px; flex-shrink: 0; }

.form-header { margin-bottom: 24px; }
.form-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--color-text-primary);
  margin: 0 0 6px;
}
.form-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.form-alerta-banner {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  background: var(--color-info-bg);
  border: 1px solid rgba(41,128,185,0.25);
  border-radius: var(--radius-lg);
  color: var(--color-info);
  margin-bottom: 20px;
}
.form-alerta-banner .form-icon { width: 20px; height: 20px; }
.form-alerta-title { font-size: 13px; font-weight: 700; margin: 0 0 2px; }
.form-alerta-msg   { font-size: 13px; margin: 0; color: var(--color-text-primary); }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  align-items: start;
}
@media (max-width: 980px) {
  .form-grid { grid-template-columns: 1fr; }
}

.form-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-section-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 640px) {
  .form-row { grid-template-columns: 1fr; }
}

/* Selector activo */
.form-activo-seleccionado {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--color-primary-light);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
}
.form-activo-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.form-activo-icon :deep(svg) { width: 20px; height: 20px; }
.form-activo-info { flex: 1; min-width: 0; }
.form-activo-nombre {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}
.form-activo-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 2px 0 0;
}
.form-activo-clear {
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
.form-activo-clear:hover {
  background: rgba(255,255,255,0.6);
  color: var(--color-danger);
}
.form-activo-clear :deep(svg) { width: 18px; height: 18px; }

/* Búsqueda activo */
.form-search { position: relative; }
.form-search-icon {
  position: absolute; top: 50%; left: 14px;
  transform: translateY(-50%); width: 18px; height: 18px;
  color: var(--color-text-disabled);
}
.form-search-input {
  width: 100%; height: 44px;
  padding: 0 16px 0 44px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-family: inherit;
  background: var(--color-surface);
}
.form-search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-ring);
}
.form-search-results {
  list-style: none;
  margin: 8px 0 0;
  padding: 4px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  max-height: 320px;
  overflow-y: auto;
}
.form-search-result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
}
.form-search-result:hover { background: var(--color-bg); }
.form-search-result-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}
.form-search-result-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 2px 0 0;
}
.form-search-empty {
  padding: 12px;
  font-size: 13px;
  color: var(--color-text-secondary);
  text-align: center;
}
.form-score-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.form-score-pill--success { background: var(--color-success-bg); color: var(--color-success); }
.form-score-pill--warning { background: var(--color-warning-bg); color: var(--color-warning); }
.form-score-pill--danger  { background: var(--color-danger-bg);  color: var(--color-danger); }

.form-error-text {
  font-size: 12px;
  color: var(--color-danger);
  margin: 8px 0 0;
}

/* Labels y radios */
.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}
.form-required { color: var(--color-danger); font-weight: 700; margin-right: 4px; }

.form-radios {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}
@media (max-width: 640px) { .form-radios { grid-template-columns: 1fr; } }

.form-radio {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  background: var(--color-surface);
  transition: all var(--transition-fast);
  position: relative;
}
.form-radio:hover { border-color: var(--color-primary); }
.form-radio--active { border-color: var(--color-primary); background: var(--color-primary-light); }
.form-radio--alta.form-radio--active  { border-color: var(--color-danger);  background: var(--color-danger-bg); }
.form-radio--media.form-radio--active { border-color: var(--color-warning); background: var(--color-warning-bg); }
.form-radio--baja.form-radio--active  { border-color: var(--color-info);    background: var(--color-info-bg); }

.form-radio-input { position: absolute; opacity: 0; pointer-events: none; }
.form-radio-dot {
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  border: 2px solid var(--color-border);
  flex-shrink: 0;
  margin-top: 2px;
  position: relative;
  transition: border-color var(--transition-fast);
}
.form-radio--active .form-radio-dot { border-color: var(--color-primary); }
.form-radio--active .form-radio-dot::after {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 9999px;
  background: var(--color-primary);
}
.form-radio--alta.form-radio--active .form-radio-dot  { border-color: var(--color-danger); }
.form-radio--alta.form-radio--active .form-radio-dot::after  { background: var(--color-danger); }
.form-radio--media.form-radio--active .form-radio-dot { border-color: var(--color-warning); }
.form-radio--media.form-radio--active .form-radio-dot::after { background: var(--color-warning); }
.form-radio--baja.form-radio--active .form-radio-dot  { border-color: var(--color-info); }
.form-radio--baja.form-radio--active .form-radio-dot::after  { background: var(--color-info); }

.form-radio-label { font-size: 14px; font-weight: 600; color: var(--color-text-primary); margin: 0; }
.form-radio-help  { font-size: 12px; color: var(--color-text-secondary); margin: 2px 0 0; }

/* Sidebar */
.form-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 84px;
}
@media (max-width: 980px) {
  .form-sidebar { position: static; }
}

.form-sidebar-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--color-text-secondary);
  margin: 0 0 12px;
}
.form-sidebar-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.form-sidebar-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 12px;
}
.form-sidebar-list span { color: var(--color-text-secondary); }
.form-sidebar-list strong {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: right;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-actions :deep(.edu-btn) { width: 100%; }
</style>
