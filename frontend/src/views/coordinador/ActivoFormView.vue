<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useActivosStore } from '@/stores/activos'
import { useToast } from '@/composables/useToast'
import AppShell      from '@/components/layout/AppShell.vue'
import EduCard       from '@/components/ui/EduCard.vue'
import EduInput      from '@/components/ui/EduInput.vue'
import EduTextarea   from '@/components/ui/EduTextarea.vue'
import EduButton     from '@/components/ui/EduButton.vue'
import CatalogoSelector from '@/components/activos/CatalogoSelector.vue'
import QrCodeDisplay from '@/components/activos/QrCodeDisplay.vue'
import {
  CubeIcon,
  MapPinIcon,
  ClipboardDocumentIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
} from '@heroicons/vue/24/outline'

const router  = useRouter()
const route   = useRoute()
const activos = useActivosStore()
const toast   = useToast()

const isEdit = computed(() => !!route.params.id)
const title  = computed(() => isEdit.value ? 'Editar activo' : 'Registrar nuevo activo')

const form = reactive({
  catalogo:    { marca: '', modelo_id: '' },
  nombre:      '',
  categoria:   '',
  vida_util:   null,
  edificio:    '',
  piso:        '',
  aula:        '',
  fecha_instalacion: new Date().toISOString().split('T')[0],
  numero_serie: '',
  notas:       '',
})

const touched = reactive({
  marca: false, modelo: false, nombre: false,
  edificio: false, piso: false, aula: false,
  fecha: false,
})

const errors = computed(() => ({
  marca:    touched.marca    && !form.catalogo.marca       ? 'Selecciona la marca.' : '',
  modelo:   touched.modelo   && !form.catalogo.modelo_id    ? 'Selecciona el modelo.' : '',
  nombre:   touched.nombre   && !form.nombre.trim()         ? 'Ingresa un nombre para identificar el equipo.' : '',
  edificio: touched.edificio && !form.edificio.trim()       ? 'Indica el edificio.' : '',
  piso:     touched.piso     && !form.piso.trim()           ? 'Indica el piso.' : '',
  aula:     touched.aula     && !form.aula.trim()           ? 'Indica el aula o ambiente.' : '',
  fecha:    touched.fecha    && !form.fecha_instalacion     ? 'Indica la fecha de instalación.' : '',
}))

const isValid = computed(() =>
  form.catalogo.marca && form.catalogo.modelo_id && form.nombre.trim() &&
  form.edificio.trim() && form.piso.trim() && form.aula.trim() && form.fecha_instalacion,
)

function onModeloSeleccionado(modelo) {
  if (!modelo) {
    form.categoria = ''
    form.vida_util = null
    return
  }
  form.categoria  = modelo.categoria
  form.vida_util  = modelo.vida_util_meses
  if (!form.nombre.trim()) {
    form.nombre = `${modelo.marca} ${modelo.modelo}`
  }
}

const saving       = ref(false)
const savedActivo  = ref(null)

async function guardar() {
  touched.marca = true; touched.modelo = true; touched.nombre = true
  touched.edificio = true; touched.piso = true; touched.aula = true; touched.fecha = true
  if (!isValid.value) return

  saving.value = true
  const payload = {
    nombre:    form.nombre.trim(),
    marca:     form.catalogo.marca,
    modelo_id: form.catalogo.modelo_id,
    categoria: form.categoria,
    ubicacion: `Edificio ${form.edificio.trim()} · Piso ${form.piso.trim()} · ${form.aula.trim()}`,
    fecha_instalacion: form.fecha_instalacion,
    numero_serie: form.numero_serie.trim() || null,
    notas: form.notas.trim() || null,
  }
  try {
    if (isEdit.value) {
      await activos.update(route.params.id, payload)
      toast.success('Activo actualizado correctamente.', { title: 'Cambios guardados' })
      router.push(`/coordinador/activos/${route.params.id}`)
    } else {
      const nuevo = await activos.create(payload)
      savedActivo.value = nuevo
      toast.success('Activo registrado correctamente.', { title: 'Equipo agregado' })
    }
  } catch (e) {
    toast.danger(e.message ?? 'Ocurrió un error al guardar.', { title: 'Error' })
  } finally {
    saving.value = false
  }
}

function cancelar() {
  if (isEdit.value) router.push(`/coordinador/activos/${route.params.id}`)
  else router.push('/coordinador/activos')
}

onMounted(async () => {
  if (isEdit.value) {
    await activos.fetchOne(route.params.id)
    const a = activos.current
    if (a) {
      form.nombre    = a.nombre
      form.categoria = a.categoria
      form.catalogo  = { marca: a.marca, modelo_id: a.modelo_id ?? '' }
      // Parsear ubicación "Edificio A · Piso 1 · Aula 1A"
      const partes = (a.ubicacion ?? '').split('·').map(s => s.trim())
      form.edificio = partes[0]?.replace(/^Edificio\s*/i, '') ?? ''
      form.piso     = partes[1]?.replace(/^Piso\s*/i, '') ?? ''
      form.aula     = partes[2] ?? ''
      form.fecha_instalacion = a.fecha_instalacion
      form.numero_serie     = a.numero_serie ?? ''
      form.notas            = a.notas ?? ''
    }
  }
})
</script>

<template>
  <AppShell>
    <!-- Header -->
    <header class="form-header">
      <button class="form-back" type="button" @click="cancelar">
        <ArrowLeftIcon class="form-icon" />
        Volver
      </button>
      <div>
        <h1 class="form-title">{{ title }}</h1>
        <p class="form-subtitle">
          {{ isEdit
            ? 'Actualiza la información del equipo.'
            : 'Completa los datos para agregarlo al inventario.' }}
        </p>
      </div>
    </header>

    <!-- Pantalla de éxito al crear -->
    <div v-if="savedActivo" class="form-success">
      <EduCard>
        <div class="form-success-content">
          <div class="form-success-icon-wrap">
            <CheckCircleIcon class="form-success-icon" />
          </div>
          <h2 class="form-success-title">¡Activo registrado!</h2>
          <p class="form-success-text">
            El equipo <strong>{{ savedActivo.nombre }}</strong> fue agregado al inventario.
            Imprime el código QR y pégalo en el equipo para que los docentes puedan reportar fallas escaneándolo.
          </p>
          <QrCodeDisplay :codigo="savedActivo.codigo_qr" :size="200" />
          <div class="form-success-actions">
            <EduButton variant="outline-gray" @click="savedActivo = null; Object.assign(form, { nombre: '', edificio: '', piso: '', aula: '', numero_serie: '', notas: '', catalogo: { marca: '', modelo_id: '' } })">
              Registrar otro
            </EduButton>
            <EduButton variant="primary" @click="router.push(`/coordinador/activos/${savedActivo.id}`)">
              Ver detalle del activo
            </EduButton>
          </div>
        </div>
      </EduCard>
    </div>

    <!-- Formulario -->
    <form v-else class="form-grid" @submit.prevent="guardar">
      <div class="form-main">
        <!-- Sección: información del equipo -->
        <EduCard>
          <template #header>
            <div class="form-section-header">
              <span class="form-section-icon form-section-icon--primary">
                <CubeIcon />
              </span>
              <div>
                <h2>Información del equipo</h2>
                <p>Datos del catálogo del fabricante</p>
              </div>
            </div>
          </template>

          <CatalogoSelector
            v-model="form.catalogo"
            @modelo-seleccionado="onModeloSeleccionado"
            @blur.capture="touched.marca = true; touched.modelo = true"
          />

          <div class="form-row">
            <EduInput
              v-model="form.nombre"
              label="Nombre identificador"
              placeholder="Ej. Proyector Aula 1A"
              required
              helper="Cómo se identifica el equipo en el colegio."
              :error="errors.nombre"
              @blur="touched.nombre = true"
            />
          </div>
        </EduCard>

        <!-- Sección: ubicación -->
        <EduCard>
          <template #header>
            <div class="form-section-header">
              <span class="form-section-icon form-section-icon--info">
                <MapPinIcon />
              </span>
              <div>
                <h2>Ubicación</h2>
                <p>Dónde está instalado físicamente</p>
              </div>
            </div>
          </template>

          <div class="form-row form-row--cols-3">
            <EduInput
              v-model="form.edificio"
              label="Edificio"
              placeholder="A"
              required
              :error="errors.edificio"
              @blur="touched.edificio = true"
            />
            <EduInput
              v-model="form.piso"
              label="Piso"
              placeholder="1"
              required
              :error="errors.piso"
              @blur="touched.piso = true"
            />
            <EduInput
              v-model="form.aula"
              label="Aula / ambiente"
              placeholder="Aula 1A"
              required
              :error="errors.aula"
              @blur="touched.aula = true"
            />
          </div>
        </EduCard>

        <!-- Sección: registro -->
        <EduCard>
          <template #header>
            <div class="form-section-header">
              <span class="form-section-icon form-section-icon--success">
                <ClipboardDocumentIcon />
              </span>
              <div>
                <h2>Datos de registro</h2>
                <p>Información operativa del activo</p>
              </div>
            </div>
          </template>

          <div class="form-row form-row--cols-2">
            <EduInput
              v-model="form.fecha_instalacion"
              type="date"
              label="Fecha de instalación"
              required
              :error="errors.fecha"
              @blur="touched.fecha = true"
            />
            <EduInput
              v-model="form.numero_serie"
              label="Número de serie"
              placeholder="Opcional"
              helper="Si está disponible, ayuda a las garantías."
            />
          </div>

          <div class="form-row">
            <EduTextarea
              v-model="form.notas"
              label="Notas adicionales"
              placeholder="Cualquier información relevante sobre el equipo (opcional)"
              :maxlength="300"
              rows="3"
            />
          </div>
        </EduCard>
      </div>

      <!-- Sidebar resumen + actions -->
      <aside class="form-sidebar">
        <EduCard>
          <template #header>
            <h2 class="form-sidebar-title">Resumen</h2>
          </template>
          <ul class="form-summary">
            <li>
              <span>Equipo</span>
              <strong>{{ form.nombre || '—' }}</strong>
            </li>
            <li>
              <span>Categoría</span>
              <strong>{{ form.categoria || '—' }}</strong>
            </li>
            <li>
              <span>Marca · Modelo</span>
              <strong>{{ form.catalogo.marca || '—' }}</strong>
            </li>
            <li>
              <span>Ubicación</span>
              <strong>
                {{ (form.edificio && form.piso && form.aula)
                    ? `Edif. ${form.edificio} · P${form.piso} · ${form.aula}`
                    : '—' }}
              </strong>
            </li>
            <li>
              <span>Vida útil estimada</span>
              <strong>{{ form.vida_util ? `${form.vida_util} meses` : '—' }}</strong>
            </li>
          </ul>

          <template #footer>
            <div class="form-actions">
              <EduButton variant="outline-gray" type="button" @click="cancelar">
                Cancelar
              </EduButton>
              <EduButton variant="primary" type="submit" :loading="saving">
                {{ isEdit ? 'Guardar cambios' : 'Registrar activo' }}
              </EduButton>
            </div>
          </template>
        </EduCard>

        <p class="form-tip">
          💡 Al registrar el activo se generará un código QR único.
          Imprímelo y pégalo en el equipo para que los docentes puedan
          reportar fallas escaneándolo desde el celular.
        </p>
      </aside>
    </form>
  </AppShell>
</template>

<style scoped>
.form-header {
  margin-bottom: 24px;
}
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
  margin-bottom: 8px;
}
.form-back:hover { color: var(--color-primary-hover); }
.form-icon { width: 14px; height: 14px; }
.form-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}
.form-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
  align-items: start;
}
.form-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form-sidebar {
  position: sticky;
  top: 96px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 1024px) {
  .form-grid { grid-template-columns: 1fr; }
  .form-sidebar { position: static; }
}

.form-section-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.form-section-header h2 {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}
.form-section-header p {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 2px 0 0;
}
.form-section-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}
.form-section-icon :deep(svg) { width: 18px; height: 18px; }
.form-section-icon--primary {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
.form-section-icon--info {
  background: var(--color-info-bg);
  color: var(--color-info);
}
.form-section-icon--success {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}
.form-row:first-child { margin-top: 0; }
.form-row--cols-2 { display: grid; grid-template-columns: 1fr 1fr; }
.form-row--cols-3 { display: grid; grid-template-columns: 1fr 1fr 2fr; }
@media (max-width: 640px) {
  .form-row--cols-2, .form-row--cols-3 { grid-template-columns: 1fr; }
}

/* Sidebar */
.form-sidebar-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.form-summary {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.form-summary li {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  gap: 2px;
}
.form-summary span {
  text-transform: uppercase;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
}
.form-summary strong {
  color: var(--color-text-primary);
  font-weight: 600;
  font-size: 13.5px;
  word-break: break-word;
}
.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.form-actions :deep(.edu-btn) {
  flex: 1;
}
.form-tip {
  font-size: 12px;
  color: var(--color-text-secondary);
  background: var(--color-primary-light);
  padding: 12px 14px;
  border-radius: var(--radius-md);
  margin: 0;
  line-height: 1.55;
  border-left: 3px solid var(--color-primary);
}

/* Pantalla de éxito */
.form-success {
  display: flex;
  justify-content: center;
}
.form-success > .edu-card,
.form-success :deep(.edu-card) {
  max-width: 560px;
  width: 100%;
}
.form-success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
  padding: 16px 8px;
}
.form-success-icon-wrap {
  width: 76px;
  height: 76px;
  border-radius: 9999px;
  background: var(--color-success-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 8px rgba(30,132,73,0.08);
}
.form-success-icon { width: 44px; height: 44px; color: var(--color-success); stroke-width: 2.2; }
.form-success-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 4px 0 0;
}
.form-success-text {
  font-size: 14.5px;
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 440px;
  line-height: 1.55;
}
.form-success-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
