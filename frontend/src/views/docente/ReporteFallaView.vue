<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import * as reportesApi from '@/api/reportes.api'
import { useOffline } from '@/composables/useOffline'
import EduInput    from '@/components/ui/EduInput.vue'
import EduTextarea from '@/components/ui/EduTextarea.vue'
import EduButton   from '@/components/ui/EduButton.vue'
import EduSpinner  from '@/components/ui/EduSpinner.vue'
import {
  MapPinIcon,
  CalendarDaysIcon,
  TagIcon,
  CameraIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  XCircleIcon,
} from '@heroicons/vue/24/outline'
import logoTexto from '@/assets/img/logo-texto.png'

const route = useRoute()
const { isOnline, enqueue } = useOffline()

const step    = ref(1)
const loading = ref(true)
const submitting = ref(false)
const errorActivo = ref('')
const errorSubmit = ref('')
const activo  = ref(null)

const form = reactive({
  descripcion:    '',
  docente_nombre: '',
  docente_email:  '',
  foto:           null,
  foto_preview:   null,
})

const fotoInputRef = ref(null)

const reporte = ref(null)

const touched = reactive({
  descripcion: false,
  nombre: false,
  email: false,
})

const errors = computed(() => ({
  descripcion: touched.descripcion && form.descripcion.trim().length < 10
    ? 'Describe el problema con al menos 10 caracteres.'
    : '',
  nombre: touched.nombre && !form.docente_nombre.trim()
    ? 'Ingresa tu nombre.'
    : '',
  email: touched.email && (!form.docente_email || !/^\S+@\S+\.\S+$/.test(form.docente_email))
    ? 'Ingresa un correo válido.'
    : '',
}))

const formValid = computed(() =>
  form.descripcion.trim().length >= 10 &&
  form.docente_nombre.trim() &&
  /^\S+@\S+\.\S+$/.test(form.docente_email),
)

// ─── Cargar activo por QR ─────────────────────────────────────────
async function cargarActivo() {
  loading.value = true
  errorActivo.value = ''
  try {
    activo.value = await reportesApi.getActivoByQr(route.params.codigo)
  } catch (e) {
    errorActivo.value = e.message === 'QR no válido'
      ? 'No encontramos un activo con ese código QR. Verifica que escaneaste el código correcto.'
      : 'No se pudo cargar la información del activo. Intenta nuevamente.'
  } finally {
    loading.value = false
  }
}

const SESSION_KEY = `rf_state_${route.params.codigo}`

onMounted(async () => {
  // Android Chrome puede recargar la página al volver de la cámara.
  // Si hay estado guardado en sessionStorage, lo restauramos antes de continuar.
  const saved = sessionStorage.getItem(SESSION_KEY)
  if (saved) {
    try {
      const s = JSON.parse(saved)
      step.value          = s.step ?? 1
      form.descripcion    = s.descripcion ?? ''
      form.docente_nombre = s.docente_nombre ?? ''
      form.docente_email  = s.docente_email ?? ''
      Object.assign(touched, s.touched ?? {})
    } catch { /* ignorar estado corrupto */ }
    sessionStorage.removeItem(SESSION_KEY)
  }
  await cargarActivo()
})

// ─── Foto opcional ────────────────────────────────────────────────
function abrirCamara() {
  // Guardamos el estado del formulario antes de abrir la cámara por si
  // Android Chrome recarga la página al volver del selector de archivos.
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({
    step:           step.value,
    descripcion:    form.descripcion,
    docente_nombre: form.docente_nombre,
    docente_email:  form.docente_email,
    touched:        { ...touched },
  }))
  fotoInputRef.value?.click()
}

function handleFoto(event) {
  const file = event.target.files?.[0]
  if (!file) return
  sessionStorage.removeItem(SESSION_KEY) // foto recibida, ya no necesitamos el guardado
  form.foto         = file
  form.foto_preview = URL.createObjectURL(file)
}

function quitarFoto() {
  if (form.foto_preview) URL.revokeObjectURL(form.foto_preview)
  form.foto         = null
  form.foto_preview = null
}

// ─── Navegación entre pasos ──────────────────────────────────────
function irAPaso2() { step.value = 2 }
function volverPaso1() {
  sessionStorage.removeItem(SESSION_KEY)
  step.value = 1
}

async function enviarReporte() {
  touched.descripcion = true
  touched.nombre = true
  touched.email  = true
  if (!formValid.value) return

  submitting.value  = true
  errorSubmit.value = ''
  const payload = {
    activo_id:      activo.value.id,
    descripcion:    form.descripcion.trim(),
    docente_nombre: form.docente_nombre.trim(),
    docente_email:  form.docente_email.trim(),
    foto_nombre:    form.foto?.name ?? null,
  }

  try {
    if (!isOnline.value) {
      await enqueue({
        url:     '/api/v1/reportes',
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      reporte.value = {
        numero:  'OFFLINE-' + Math.floor(Math.random() * 9000 + 1000),
        offline: true,
      }
    } else {
      reporte.value = await reportesApi.createReporte(payload)
    }
    step.value = 3
  } catch (e) {
    errorSubmit.value = e.message ?? 'No se pudo enviar el reporte. Intenta nuevamente.'
  } finally {
    submitting.value = false
  }
}

function reiniciar() {
  sessionStorage.removeItem(SESSION_KEY)
  Object.assign(form, {
    descripcion: '', docente_nombre: '', docente_email: '', foto: null, foto_preview: null,
  })
  Object.assign(touched, { descripcion: false, nombre: false, email: false })
  reporte.value = null
  errorSubmit.value = ''
  step.value = 1
}
</script>

<template>
  <div class="rf-page">
    <!-- Input de foto fuera del form para evitar reload en iOS/Android al volver de cámara -->
    <input
      ref="fotoInputRef"
      type="file"
      accept="image/*"
      style="display:none; position:absolute"
      @change="handleFoto"
    />

    <!-- Banner offline -->
    <Transition name="slide-down">
      <div v-if="!isOnline" class="rf-offline">
        <span class="rf-offline-dot" />
        Sin conexión — tu reporte se enviará al reconectar
      </div>
    </Transition>

    <!-- Header con logo -->
    <header class="rf-header safe-top">
      <img :src="logoTexto" alt="EduTrack AI" class="rf-logo" />
    </header>

    <!-- Stepper -->
    <div v-if="!errorActivo && !loading" class="rf-stepper" :class="`rf-stepper--step-${step}`">
      <div class="rf-step" :class="{ 'rf-step--active': step >= 1, 'rf-step--done': step > 1 }">
        <span class="rf-step-num">1</span>
        <span class="rf-step-label">Activo</span>
      </div>
      <div class="rf-step-line" :class="{ 'rf-step-line--filled': step > 1 }" />
      <div class="rf-step" :class="{ 'rf-step--active': step >= 2, 'rf-step--done': step > 2 }">
        <span class="rf-step-num">2</span>
        <span class="rf-step-label">Reporte</span>
      </div>
      <div class="rf-step-line" :class="{ 'rf-step-line--filled': step > 2 }" />
      <div class="rf-step" :class="{ 'rf-step--active': step >= 3 }">
        <span class="rf-step-num">3</span>
        <span class="rf-step-label">Listo</span>
      </div>
    </div>

    <main class="rf-content safe-bottom">

      <!-- ─── Loading ──────────────────────────────────────── -->
      <div v-if="loading" class="rf-state">
        <EduSpinner size="lg" />
        <p class="rf-state-text">Cargando información del activo…</p>
      </div>

      <!-- ─── Error activo ────────────────────────────────── -->
      <div v-else-if="errorActivo" class="rf-state rf-state--error">
        <div class="rf-state-icon-wrap rf-state-icon-wrap--danger">
          <XCircleIcon class="rf-state-icon" />
        </div>
        <h2 class="rf-state-title">QR no encontrado</h2>
        <p class="rf-state-text">{{ errorActivo }}</p>
        <EduButton size="lg-mobile" variant="outline-gray" @click="cargarActivo">
          Reintentar
        </EduButton>
      </div>

      <!-- ─── PASO 1: Info del activo ─────────────────────── -->
      <section v-else-if="step === 1 && activo" class="rf-section">
        <p class="rf-intro">
          Escaneaste el QR del siguiente activo. Revisa que sea el equipo que está fallando antes de continuar.
        </p>

        <article class="rf-activo-card">
          <div class="rf-activo-photo">
            <CameraIcon class="rf-activo-photo-icon" />
          </div>
          <div class="rf-activo-body">
            <span class="rf-activo-categoria">
              <TagIcon class="rf-activo-icon" />
              {{ activo.categoria }}
            </span>
            <h2 class="rf-activo-nombre">{{ activo.nombre }}</h2>

            <ul class="rf-activo-meta">
              <li>
                <MapPinIcon class="rf-activo-icon" />
                <span>{{ activo.ubicacion }}</span>
              </li>
              <li>
                <CalendarDaysIcon class="rf-activo-icon" />
                <span>Instalado el {{ activo.fecha_instalacion }}</span>
              </li>
            </ul>

            <div class="rf-activo-tags">
              <span class="rf-tag rf-tag--brand">{{ activo.marca }}</span>
              <span class="rf-tag">{{ activo.modelo }}</span>
            </div>
          </div>
        </article>

        <div class="rf-actions">
          <EduButton size="lg-mobile" variant="primary" @click="irAPaso2">
            Es este equipo · Continuar
          </EduButton>
        </div>

        <p class="rf-helper">
          <ExclamationTriangleIcon class="rf-helper-icon" />
          ¿No es el equipo que falla? Verifica el código QR pegado en el dispositivo.
        </p>
      </section>

      <!-- ─── PASO 2: Formulario de reporte ──────────────── -->
      <section v-else-if="step === 2 && activo" class="rf-section">
        <button class="rf-back" type="button" @click="volverPaso1">
          <ArrowLeftIcon class="rf-back-icon" />
          Volver
        </button>

        <div class="rf-activo-mini">
          <span class="rf-activo-mini-label">Reportando falla en:</span>
          <strong>{{ activo.nombre }}</strong>
        </div>

        <form class="rf-form" @submit.prevent="enviarReporte" novalidate>
          <EduTextarea
            v-model="form.descripcion"
            label="¿Qué está fallando?"
            placeholder="Ejemplo: La pantalla muestra rayas verticales y a veces se apaga sola."
            helper="Cuéntanos qué observas. Mientras más detalle, mejor podremos ayudar."
            :maxlength="500"
            required
            :error="errors.descripcion"
            rows="4"
            @blur="touched.descripcion = true"
          />

          <EduInput
            v-model="form.docente_nombre"
            label="Tu nombre completo"
            placeholder="Ej. María López"
            autocomplete="name"
            required
            :error="errors.nombre"
            @blur="touched.nombre = true"
          />

          <EduInput
            v-model="form.docente_email"
            label="Correo institucional"
            type="email"
            placeholder="tu.correo@colegio.edu.pe"
            autocomplete="email"
            required
            :error="errors.email"
            @blur="touched.email = true"
          />

          <!-- Foto opcional -->
          <div class="rf-foto-wrap">
            <label class="rf-foto-label">
              Foto del problema <span class="rf-foto-optional">(opcional)</span>
            </label>

            <button
              v-if="!form.foto_preview"
              type="button"
              class="rf-foto-empty"
              @click="abrirCamara"
            >
              <CameraIcon class="rf-foto-empty-icon" />
              <span class="rf-foto-empty-text">Toma una foto del equipo</span>
            </button>

            <div v-else class="rf-foto-preview-wrap">
              <img :src="form.foto_preview" alt="Foto del problema" class="rf-foto-preview" />
              <button type="button" class="rf-foto-remove" @click="quitarFoto" aria-label="Quitar foto">
                ×
              </button>
            </div>
          </div>

          <div v-if="errorSubmit" class="rf-submit-error">
            <ExclamationTriangleIcon class="rf-submit-error-icon" />
            {{ errorSubmit }}
          </div>

          <div class="rf-actions">
            <EduButton
              type="submit"
              size="lg-mobile"
              variant="primary"
              :loading="submitting"
              :disabled="!formValid && (touched.descripcion || touched.nombre || touched.email)"
            >
              Enviar reporte
            </EduButton>
          </div>
        </form>
      </section>

      <!-- ─── PASO 3: Confirmación ────────────────────────── -->
      <section v-else-if="step === 3 && reporte" class="rf-section rf-section--success">
        <div class="rf-success-icon-wrap">
          <CheckCircleIcon class="rf-success-icon" />
        </div>

        <h2 class="rf-success-title">¡Reporte enviado!</h2>
        <p class="rf-success-text">
          Tu reporte fue registrado correctamente. El equipo técnico revisará la falla y te contactará si necesita más información.
        </p>

        <div class="rf-success-numero">
          <span class="rf-success-numero-label">Número de reporte</span>
          <span class="rf-success-numero-value">{{ reporte.numero }}</span>
          <span v-if="reporte.offline" class="rf-success-offline">
            Pendiente de sincronización
          </span>
        </div>

        <div class="rf-success-summary">
          <p class="rf-success-summary-title">Resumen</p>
          <ul>
            <li><strong>Equipo:</strong> {{ activo.nombre }}</li>
            <li><strong>Ubicación:</strong> {{ activo.ubicacion }}</li>
            <li><strong>Reportado por:</strong> {{ form.docente_nombre }}</li>
          </ul>
        </div>

        <div class="rf-actions">
          <EduButton size="lg-mobile" variant="outline-gray" @click="reiniciar">
            Reportar otra falla
          </EduButton>
        </div>
      </section>
    </main>

    <footer class="rf-footer">
      <p>© 2026 EduTrack AI</p>
    </footer>
  </div>
</template>

<style scoped>
/* ─── Layout base ──────────────────────────────────────────── */
.rf-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
}

/* ─── Offline banner ───────────────────────────────────────── */
.rf-offline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 16px;
  background: var(--color-warning-bg);
  color: var(--color-warning);
  font-size: 13px;
  font-weight: 500;
  border-bottom: 1px solid var(--color-warning);
}
.rf-offline-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: var(--color-warning);
  animation: pulse 1.6s infinite ease-out;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.slide-down-enter-active, .slide-down-leave-active { transition: all 280ms ease; }
.slide-down-enter-from, .slide-down-leave-to { transform: translateY(-100%); opacity: 0; }

/* ─── Header ──────────────────────────────────────────────── */
.rf-header {
  padding: 16px 16px 8px;
  display: flex;
  justify-content: center;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}
.rf-logo {
  height: 36px;
  width: auto;
  object-fit: contain;
}

/* ─── Stepper ─────────────────────────────────────────────── */
.rf-stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 24px;
  background: var(--color-surface);
}
.rf-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.rf-step-num {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
}
.rf-step--active .rf-step-num {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
  box-shadow: 0 0 0 4px var(--color-primary-light);
}
.rf-step--done .rf-step-num {
  background: var(--color-success);
  border-color: var(--color-success);
  color: #fff;
  box-shadow: none;
}
.rf-step--done .rf-step-num::before {
  content: '✓';
}
.rf-step--done .rf-step-num > * {
  display: none;
}
.rf-step-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
}
.rf-step--active .rf-step-label {
  color: var(--color-text-primary);
}
.rf-step-line {
  width: 48px;
  height: 2px;
  background: var(--color-border);
  margin-bottom: 22px;
  transition: background var(--transition-base);
}
.rf-step-line--filled {
  background: var(--color-success);
}

/* ─── Contenido ──────────────────────────────────────────── */
.rf-content {
  flex: 1;
  padding: 20px 16px 32px;
  max-width: 560px;
  width: 100%;
  margin: 0 auto;
}
.rf-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ─── Estados de carga / error ───────────────────────────── */
.rf-state {
  text-align: center;
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.rf-state-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rf-state-icon-wrap--danger { background: var(--color-danger-bg); }
.rf-state-icon { width: 40px; height: 40px; color: var(--color-danger); }
.rf-state-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 4px 0 0;
}
.rf-state-text {
  font-size: 15px;
  color: var(--color-text-secondary);
  max-width: 380px;
  margin: 0;
  line-height: 1.5;
}

/* ─── Paso 1: card del activo ────────────────────────────── */
.rf-intro {
  font-size: 15px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.55;
}
.rf-activo-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.rf-activo-photo {
  height: 140px;
  background: linear-gradient(135deg, var(--color-primary-light) 0%, #F7F4FB 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--color-border);
}
.rf-activo-photo-icon {
  width: 48px;
  height: 48px;
  color: var(--color-primary);
  opacity: 0.6;
}
.rf-activo-body {
  padding: 20px 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.rf-activo-categoria {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 4px 10px;
  border-radius: 9999px;
  align-self: flex-start;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.rf-activo-nombre {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.3px;
}
.rf-activo-meta {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.rf-activo-meta li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
}
.rf-activo-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--color-text-disabled);
}
.rf-activo-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}
.rf-tag {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--color-bg);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}
.rf-tag--brand {
  background: var(--color-info-bg);
  color: var(--color-info);
  border-color: rgba(36,113,163,0.2);
}

/* ─── Actions ─────────────────────────────────────────────── */
.rf-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.rf-actions :deep(.btn) { width: 100%; }
.rf-helper {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
  padding: 12px;
  background: var(--color-warning-bg);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-warning);
}
.rf-helper-icon {
  width: 18px;
  height: 18px;
  color: var(--color-warning);
  flex-shrink: 0;
}

/* ─── Paso 2: formulario ──────────────────────────────────── */
.rf-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  padding: 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-primary);
  cursor: pointer;
  font-family: inherit;
  align-self: flex-start;
}
.rf-back-icon { width: 16px; height: 16px; }
.rf-activo-mini {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 16px;
  background: var(--color-primary-light);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-primary);
}
.rf-activo-mini-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-primary);
}
.rf-activo-mini strong {
  font-size: 15px;
  color: var(--color-text-primary);
  font-weight: 600;
}
.rf-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ─── Foto opcional ──────────────────────────────────────── */
.rf-foto-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.rf-foto-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}
.rf-foto-optional {
  color: var(--color-text-disabled);
  font-weight: 400;
}
.rf-foto-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: 24px;
  background: var(--color-surface);
  cursor: pointer;
  font-family: inherit;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}
.rf-foto-empty:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}
.rf-foto-empty-icon {
  width: 32px;
  height: 32px;
  color: var(--color-primary);
}
.rf-foto-empty-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
}
.rf-foto-preview-wrap {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
}
.rf-foto-preview {
  display: block;
  width: 100%;
  max-height: 280px;
  object-fit: cover;
}
.rf-foto-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  background: rgba(0,0,0,0.65);
  color: #fff;
  border: none;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rf-submit-error {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-danger);
  background: var(--color-danger-bg);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  border-left: 3px solid var(--color-danger);
}
.rf-submit-error-icon { width: 18px; height: 18px; flex-shrink: 0; }

/* ─── Paso 3: éxito ──────────────────────────────────────── */
.rf-section--success {
  text-align: center;
  align-items: center;
  padding-top: 16px;
}
.rf-success-icon-wrap {
  width: 84px;
  height: 84px;
  border-radius: 9999px;
  background: var(--color-success-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 8px rgba(30,132,73,0.08);
  animation: pop 380ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes pop {
  0%   { transform: scale(0.6); opacity: 0; }
  100% { transform: scale(1);   opacity: 1; }
}
.rf-success-icon { width: 48px; height: 48px; color: var(--color-success); stroke-width: 2.2; }
.rf-success-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 4px 0 0;
  letter-spacing: -0.4px;
}
.rf-success-text {
  font-size: 15px;
  color: var(--color-text-secondary);
  max-width: 400px;
  margin: 0;
  line-height: 1.55;
}
.rf-success-numero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  width: 100%;
}
.rf-success-numero-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--color-text-secondary);
}
.rf-success-numero-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: 0.5px;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}
.rf-success-offline {
  margin-top: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-warning);
  background: var(--color-warning-bg);
  padding: 3px 10px;
  border-radius: 9999px;
}
.rf-success-summary {
  width: 100%;
  text-align: left;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  padding: 14px 16px;
}
.rf-success-summary-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--color-text-secondary);
  margin: 0 0 8px;
}
.rf-success-summary ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.rf-success-summary li {
  font-size: 13.5px;
  color: var(--color-text-primary);
  line-height: 1.5;
}
.rf-success-summary strong {
  color: var(--color-text-secondary);
  font-weight: 600;
  margin-right: 4px;
}

/* ─── Footer ──────────────────────────────────────────────── */
.rf-footer {
  text-align: center;
  padding: 16px;
  font-size: 12px;
  color: var(--color-text-disabled);
}
.rf-footer p { margin: 0; }

/* ─── Tablet+ ─────────────────────────────────────────────── */
@media (min-width: 768px) {
  .rf-logo { height: 44px; }
  .rf-content { padding: 32px 24px 40px; }
  .rf-step-line { width: 80px; }
  .rf-step-num { width: 36px; height: 36px; font-size: 15px; }
  .rf-activo-photo { height: 180px; }
}
</style>
