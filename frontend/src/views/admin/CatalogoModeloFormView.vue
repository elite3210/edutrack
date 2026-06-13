<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import * as adminApi from '@/api/admin.api'
import { useToast }  from '@/composables/useToast'
import AppShell    from '@/components/layout/AppShell.vue'
import EduCard     from '@/components/ui/EduCard.vue'
import EduInput    from '@/components/ui/EduInput.vue'
import EduSelect   from '@/components/ui/EduSelect.vue'
import EduButton   from '@/components/ui/EduButton.vue'
import EduBadge    from '@/components/ui/EduBadge.vue'
import {
  ArrowLeftIcon,
  CubeIcon,
  Cog6ToothIcon,
  WrenchScrewdriverIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  PlusIcon,
  TrashIcon,
  DocumentCheckIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route  = useRoute()
const { success, danger: toastError, info } = useToast()

const isEdit = computed(() => !!route.params.id)
const titulo = computed(() => isEdit.value ? 'Editar modelo' : 'Nuevo modelo')

const form = ref({
  marca:    '',
  modelo:   '',
  categoria:'',
  vida_util_meses: 60,
  especificaciones: [], // {clave, valor}[]
  reglas:           [], // {id?, tarea, intervalo_dias}[]
  manual_pdf:       null,
  manual_nombre:    '',
})
const errors = ref({})
const submitting = ref(false)

const categoriaOptions = [
  { value: '', label: 'Selecciona categoría' },
  ...['Proyector','Laptop','Desktop','Monitor','Impresora','Aire Acondicionado','Pizarra Interactiva','TV/Display'].map(c => ({ value: c, label: c })),
]

// ─── Especificaciones dinámicas ────────────────────────────
function addSpec() {
  form.value.especificaciones.push({ clave: '', valor: '' })
}
function removeSpec(idx) {
  form.value.especificaciones.splice(idx, 1)
}

// ─── Reglas de mantenimiento ──────────────────────────────
function addRegla() {
  form.value.reglas.push({ tarea: '', intervalo_dias: 90 })
}
function removeRegla(idx) {
  form.value.reglas.splice(idx, 1)
}

// ─── Manual PDF (simulado) ────────────────────────────────
const manualIndexando = ref(false)
function handleManual(event) {
  const file = event.target.files?.[0]
  if (!file) return
  form.value.manual_pdf = file
  form.value.manual_nombre = file.name
  manualIndexando.value = true
  // Simular indexación
  setTimeout(() => {
    manualIndexando.value = false
    info('Manual indexado correctamente')
  }, 1200)
}
function quitarManual() {
  form.value.manual_pdf = null
  form.value.manual_nombre = ''
}

// ─── Validación ───────────────────────────────────────────
function validate() {
  const e = {}
  if (!form.value.marca?.trim())  e.marca  = 'Indica la marca'
  if (!form.value.modelo?.trim()) e.modelo = 'Indica el modelo'
  if (!form.value.categoria)      e.categoria = 'Selecciona categoría'
  const vu = Number(form.value.vida_util_meses)
  if (!vu || vu < 6) e.vida_util_meses = 'La vida útil debe ser de al menos 6 meses'

  // Specs: si hay clave, debe haber valor (y viceversa)
  for (const [i, s] of form.value.especificaciones.entries()) {
    if ((s.clave?.trim() && !s.valor?.toString().trim()) ||
        (!s.clave?.trim() && s.valor?.toString().trim()))
      e[`spec_${i}`] = 'Completa clave y valor'
  }
  // Reglas: validar tarea + intervalo
  for (const [i, r] of form.value.reglas.entries()) {
    if (!r.tarea?.trim()) e[`regla_${i}_tarea`] = 'Indica la tarea'
    const di = Number(r.intervalo_dias)
    if (!di || di < 1) e[`regla_${i}_dias`] = 'Intervalo inválido'
  }

  errors.value = e
  return Object.keys(e).length === 0
}

watch(() => form.value.marca,     () => { if (errors.value.marca)     validate() })
watch(() => form.value.modelo,    () => { if (errors.value.modelo)    validate() })
watch(() => form.value.categoria, () => { if (errors.value.categoria) validate() })

async function onSubmit() {
  if (!validate()) {
    toastError('Revisa los campos marcados')
    return
  }
  submitting.value = true
  try {
    const especificaciones = {}
    for (const s of form.value.especificaciones) {
      if (s.clave?.trim()) especificaciones[s.clave.trim()] = s.valor
    }
    const reglas = form.value.reglas
      .filter(r => r.tarea?.trim())
      .map((r, i) => ({ id: r.id ?? `r-${i + 1}`, tarea: r.tarea.trim(), intervalo_dias: Number(r.intervalo_dias) }))

    const payload = {
      marca:           form.value.marca.trim(),
      modelo:          form.value.modelo.trim(),
      categoria:       form.value.categoria,
      vida_util_meses: Number(form.value.vida_util_meses),
      especificaciones,
      reglas,
      manual_pdf: form.value.manual_nombre
        ? { nombre: form.value.manual_nombre, indexado: true }
        : { nombre: null, indexado: false },
    }

    if (isEdit.value) {
      await adminApi.updateModelo(route.params.id, payload)
      success('Modelo actualizado')
    } else {
      await adminApi.createModelo(payload)
      success('Modelo agregado al catálogo')
    }
    router.push('/admin/catalogo')
  } catch {
    toastError('No se pudo guardar el modelo')
  } finally {
    submitting.value = false
  }
}

// ─── Carga inicial ────────────────────────────────────────
onMounted(async () => {
  if (!isEdit.value) {
    addSpec()
    addRegla()
    return
  }
  try {
    const lista = await adminApi.getCatalogo()
    const m = lista.find(x => x.id === route.params.id)
    if (m) {
      form.value.marca = m.marca
      form.value.modelo = m.modelo
      form.value.categoria = m.categoria
      form.value.vida_util_meses = m.vida_util_meses
      form.value.especificaciones = Object.entries(m.especificaciones ?? {})
        .map(([clave, valor]) => ({ clave, valor }))
      form.value.reglas = [...(m.reglas ?? [])].map(r => ({ ...r }))
      if (m.manual_pdf?.nombre) form.value.manual_nombre = m.manual_pdf.nombre
    }
  } catch { /* manejado por toast genérico */ }
})
</script>

<template>
  <AppShell>
    <button class="cm-back" type="button" @click="router.push('/admin/catalogo')">
      <ArrowLeftIcon class="cm-icon" />
      Catálogo
    </button>

    <header class="cm-header">
      <h1 class="cm-title">{{ titulo }}</h1>
      <p class="cm-subtitle">
        {{ isEdit
          ? 'Actualiza la información, especificaciones y reglas del modelo.'
          : 'Registra un modelo en el catálogo central. Los planes de mantenimiento se generan automáticamente desde las reglas.' }}
      </p>
    </header>

    <form @submit.prevent="onSubmit" class="cm-grid" novalidate>
      <div class="cm-main">
        <!-- Modelo -->
        <EduCard>
          <template #header>
            <h2 class="cm-section-title">
              <CubeIcon class="cm-icon" />
              Modelo
            </h2>
          </template>

          <div class="cm-stack">
            <div class="cm-row">
              <EduInput
                v-model="form.marca"
                label="Marca"
                placeholder="Ej. Epson"
                :error="errors.marca"
                required
              />
              <EduInput
                v-model="form.modelo"
                label="Modelo"
                placeholder="Ej. EB-X41"
                :error="errors.modelo"
                required
              />
            </div>
            <div class="cm-row">
              <EduSelect
                v-model="form.categoria"
                label="Categoría"
                :options="categoriaOptions"
                :error="errors.categoria"
                required
              />
              <EduInput
                v-model.number="form.vida_util_meses"
                type="number"
                min="6"
                label="Vida útil (meses)"
                helper="Recomendada por el fabricante"
                :error="errors.vida_util_meses"
                required
              />
            </div>
          </div>
        </EduCard>

        <!-- Especificaciones -->
        <EduCard>
          <template #header>
            <h2 class="cm-section-title">
              <Cog6ToothIcon class="cm-icon" />
              Especificaciones técnicas
            </h2>
          </template>

          <p class="cm-help">
            Campos clave-valor (lumens, RAM, BTU, etc.). Aparecerán al registrar
            un activo de este modelo.
          </p>

          <ul v-if="form.especificaciones.length > 0" class="cm-dyn-list">
            <li v-for="(s, i) in form.especificaciones" :key="i" class="cm-dyn-item">
              <div class="cm-dyn-grow">
                <EduInput
                  v-model="s.clave"
                  placeholder="Clave (ej. lumens)"
                />
              </div>
              <div class="cm-dyn-grow">
                <EduInput
                  v-model="s.valor"
                  placeholder="Valor (ej. 3600)"
                />
              </div>
              <button
                type="button"
                class="cm-dyn-remove"
                @click="removeSpec(i)"
                aria-label="Quitar especificación"
              >
                <TrashIcon />
              </button>
            </li>
          </ul>

          <EduButton variant="outline-gray" size="sm" @click="addSpec">
            <PlusIcon class="cm-icon-sm" />
            Agregar especificación
          </EduButton>
        </EduCard>

        <!-- Reglas mantenimiento -->
        <EduCard>
          <template #header>
            <h2 class="cm-section-title">
              <WrenchScrewdriverIcon class="cm-icon" />
              Reglas de mantenimiento
            </h2>
          </template>

          <p class="cm-help">
            Tareas preventivas que el motor usará para generar el plan de mantenimiento
            de cada activo. El intervalo se mide en días.
          </p>

          <table v-if="form.reglas.length > 0" class="cm-reglas-table">
            <thead>
              <tr>
                <th>Tarea</th>
                <th class="cm-reglas-th-dias">Intervalo (días)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in form.reglas" :key="i">
                <td>
                  <EduInput
                    v-model="r.tarea"
                    placeholder="Ej. Limpieza de filtro"
                    :error="errors[`regla_${i}_tarea`]"
                  />
                </td>
                <td class="cm-reglas-td-dias">
                  <EduInput
                    v-model.number="r.intervalo_dias"
                    type="number"
                    min="1"
                    placeholder="90"
                    :error="errors[`regla_${i}_dias`]"
                  />
                </td>
                <td class="cm-reglas-td-action">
                  <button
                    type="button"
                    class="cm-dyn-remove"
                    @click="removeRegla(i)"
                    aria-label="Quitar regla"
                  >
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <EduButton variant="outline-gray" size="sm" @click="addRegla">
            <PlusIcon class="cm-icon-sm" />
            Agregar regla
          </EduButton>
        </EduCard>

        <!-- Manual PDF -->
        <EduCard>
          <template #header>
            <h2 class="cm-section-title">
              <DocumentArrowUpIcon class="cm-icon" />
              Manual del fabricante (PDF)
            </h2>
          </template>

          <p class="cm-help">
            El manual se indexa en la base de conocimiento para el asistente IA.
            Formatos aceptados: PDF.
          </p>

          <div v-if="!form.manual_nombre" class="cm-pdf-empty">
            <input
              id="manual-input"
              type="file"
              accept="application/pdf"
              class="cm-pdf-input"
              @change="handleManual"
            />
            <label for="manual-input" class="cm-pdf-trigger">
              <DocumentArrowUpIcon class="cm-pdf-icon" />
              <span class="cm-pdf-text">Toca para seleccionar un PDF</span>
            </label>
          </div>

          <div v-else class="cm-pdf-actual">
            <DocumentCheckIcon class="cm-pdf-actual-icon" />
            <div class="cm-pdf-actual-info">
              <p class="cm-pdf-actual-nombre">{{ form.manual_nombre }}</p>
              <p class="cm-pdf-actual-estado">
                <span v-if="manualIndexando" class="cm-pdf-indexando">
                  <span class="cm-pdf-dot" />
                  Indexando…
                </span>
                <span v-else>Indexado · disponible para el asistente IA</span>
              </p>
            </div>
            <button type="button" class="cm-dyn-remove" @click="quitarManual" aria-label="Quitar PDF">
              <TrashIcon />
            </button>
          </div>
        </EduCard>
      </div>

      <!-- Sidebar -->
      <aside class="cm-sidebar">
        <EduCard padding="sm">
          <p class="cm-sidebar-title">Resumen</p>
          <ul class="cm-sidebar-list">
            <li>
              <span>Marca · Modelo</span>
              <strong>{{ form.marca || '—' }} · {{ form.modelo || '—' }}</strong>
            </li>
            <li>
              <span>Categoría</span>
              <strong>
                <EduBadge v-if="form.categoria" variant="default" size="sm">
                  {{ form.categoria }}
                </EduBadge>
                <template v-else>—</template>
              </strong>
            </li>
            <li>
              <span>Vida útil</span>
              <strong>{{ form.vida_util_meses }} meses ({{ Math.round(form.vida_util_meses / 12) }} años)</strong>
            </li>
            <li>
              <span>Reglas de mantenimiento</span>
              <strong>{{ form.reglas.filter(r => r.tarea?.trim()).length }}</strong>
            </li>
            <li>
              <span>Especificaciones</span>
              <strong>{{ form.especificaciones.filter(s => s.clave?.trim()).length }}</strong>
            </li>
            <li>
              <span>Manual PDF</span>
              <strong>{{ form.manual_nombre ? 'Adjunto' : 'Sin manual' }}</strong>
            </li>
          </ul>
        </EduCard>

        <div class="cm-actions">
          <EduButton variant="primary" type="submit" :loading="submitting" @click="onSubmit">
            <CheckCircleIcon class="cm-icon" />
            {{ isEdit ? 'Guardar cambios' : 'Crear modelo' }}
          </EduButton>
          <EduButton variant="outline-gray" @click="router.push('/admin/catalogo')">
            Cancelar
          </EduButton>
        </div>
      </aside>
    </form>
  </AppShell>
</template>

<style scoped>
.cm-back {
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
.cm-back:hover { color: var(--color-primary-hover); }
.cm-icon    { width: 16px; height: 16px; flex-shrink: 0; }
.cm-icon-sm { width: 14px; height: 14px; flex-shrink: 0; }

.cm-header { margin-bottom: 24px; }
.cm-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--color-text-primary);
  margin: 0 0 6px;
}
.cm-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.cm-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  align-items: start;
}
@media (max-width: 980px) { .cm-grid { grid-template-columns: 1fr; } }

.cm-main { display: flex; flex-direction: column; gap: 16px; }

.cm-section-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}
.cm-help {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0 0 14px;
  line-height: 1.5;
}
.cm-stack { display: flex; flex-direction: column; gap: 16px; }
.cm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 640px) { .cm-row { grid-template-columns: 1fr; } }

/* Lista dinámica */
.cm-dyn-list {
  list-style: none;
  padding: 0;
  margin: 0 0 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cm-dyn-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.cm-dyn-grow { flex: 1; min-width: 0; }
.cm-dyn-remove {
  width: 44px;
  height: 44px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cm-dyn-remove :deep(svg) { width: 18px; height: 18px; }
.cm-dyn-remove:hover {
  background: var(--color-danger-bg);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

/* Tabla reglas */
.cm-reglas-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 14px;
}
.cm-reglas-table th {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
  padding: 8px 6px;
  text-align: left;
}
.cm-reglas-th-dias { width: 160px; }
.cm-reglas-table td {
  padding: 4px 6px 4px 0;
  vertical-align: top;
}
.cm-reglas-table td:last-child { padding-right: 0; }
.cm-reglas-td-dias { width: 160px; padding-right: 6px !important; }
.cm-reglas-td-action { width: 60px; text-align: right; }

/* PDF */
.cm-pdf-input { display: none; }
.cm-pdf-empty { display: flex; }
.cm-pdf-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 32px 24px;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  cursor: pointer;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}
.cm-pdf-trigger:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}
.cm-pdf-icon {
  width: 40px; height: 40px;
  color: var(--color-primary);
}
.cm-pdf-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.cm-pdf-actual {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: var(--color-success-bg);
  border: 1px solid var(--color-success);
  border-radius: var(--radius-md);
}
.cm-pdf-actual-icon {
  width: 40px; height: 40px;
  color: var(--color-success);
  flex-shrink: 0;
}
.cm-pdf-actual-info { flex: 1; min-width: 0; }
.cm-pdf-actual-nombre {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cm-pdf-actual-estado {
  font-size: 12px;
  color: var(--color-success);
  margin: 2px 0 0;
}
.cm-pdf-indexando { display: inline-flex; align-items: center; gap: 6px; color: var(--color-warning); }
.cm-pdf-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: var(--color-warning);
  animation: pulse 1s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}

/* Sidebar */
.cm-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 84px;
}
@media (max-width: 980px) { .cm-sidebar { position: static; } }

.cm-sidebar-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--color-text-secondary);
  margin: 0 0 12px;
}
.cm-sidebar-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cm-sidebar-list li {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cm-sidebar-list span {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
}
.cm-sidebar-list strong {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  word-break: break-word;
}

.cm-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cm-actions :deep(.edu-btn) { width: 100%; }
</style>
