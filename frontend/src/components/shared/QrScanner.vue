<script setup>
import { ref, onUnmounted } from 'vue'
import EduButton from '@/components/ui/EduButton.vue'
import EduInput  from '@/components/ui/EduInput.vue'
import {
  QrCodeIcon,
  CameraIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
  codigoEsperado: { type: String, default: '' }, // para validar
})
const emit = defineEmits(['scan-success', 'scan-error'])

// Modo: 'camara' | 'manual'
const modo = ref('camara')
const codigoManual = ref('')
const estado = ref('idle') // idle | escaneando | ok | error
const errorMsg = ref('')
const stream = ref(null)
const videoEl = ref(null)

async function iniciarCamara() {
  estado.value = 'escaneando'
  errorMsg.value = ''
  try {
    const s = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
    })
    stream.value = s
    if (videoEl.value) {
      videoEl.value.srcObject = s
      videoEl.value.play()
    }
  } catch {
    // Cámara no disponible — caer a manual
    cambiarModo('manual')
    errorMsg.value = 'No pudimos acceder a la cámara. Ingresa el código manualmente.'
    estado.value = 'idle'
  }
}

function detenerCamara() {
  if (stream.value) {
    stream.value.getTracks().forEach(t => t.stop())
    stream.value = null
  }
}

function cambiarModo(nuevo) {
  detenerCamara()
  modo.value = nuevo
  estado.value = 'idle'
  errorMsg.value = ''
  if (nuevo === 'camara') iniciarCamara()
}

function validarCodigo(codigo) {
  const codigoLimpio = (codigo ?? '').trim().toUpperCase()
  if (!codigoLimpio) {
    estado.value = 'error'
    errorMsg.value = 'Ingresa un código.'
    emit('scan-error', { mensaje: errorMsg.value })
    return
  }
  if (props.codigoEsperado && codigoLimpio !== props.codigoEsperado.toUpperCase()) {
    estado.value = 'error'
    errorMsg.value = `El código no coincide con el activo de esta orden. Se esperaba: ${props.codigoEsperado}`
    emit('scan-error', { mensaje: errorMsg.value, codigo: codigoLimpio })
    return
  }
  estado.value = 'ok'
  detenerCamara()
  emit('scan-success', { codigo: codigoLimpio })
}

function simularEscaneo() {
  // Simula que la cámara "detectó" el QR esperado
  validarCodigo(props.codigoEsperado || codigoManual.value)
}

function submitManual() {
  validarCodigo(codigoManual.value)
}

function reintentar() {
  estado.value = 'idle'
  errorMsg.value = ''
  if (modo.value === 'camara') iniciarCamara()
}

onUnmounted(detenerCamara)
defineExpose({ iniciar: iniciarCamara })
</script>

<template>
  <div class="qr-scanner">
    <!-- Estado OK -->
    <div v-if="estado === 'ok'" class="qr-result qr-result--ok">
      <div class="qr-result-icon qr-result-icon--ok">
        <CheckCircleIcon />
      </div>
      <p class="qr-result-title">Equipo verificado</p>
      <p class="qr-result-help">El código QR coincide con la orden de trabajo.</p>
    </div>

    <!-- Estado error -->
    <div v-else-if="estado === 'error'" class="qr-result qr-result--error">
      <div class="qr-result-icon qr-result-icon--error">
        <XMarkIcon />
      </div>
      <p class="qr-result-title">Código no válido</p>
      <p class="qr-result-help">{{ errorMsg }}</p>
      <EduButton variant="outline-gray" size="lg-mobile" @click="reintentar">
        Reintentar
      </EduButton>
    </div>

    <!-- Modo cámara -->
    <template v-else-if="modo === 'camara'">
      <div class="qr-camara">
        <video ref="videoEl" class="qr-video" playsinline muted />
        <div v-if="estado === 'idle'" class="qr-overlay">
          <div class="qr-overlay-frame" />
          <CameraIcon class="qr-overlay-icon" />
          <p class="qr-overlay-text">Toca para activar la cámara</p>
        </div>
        <div v-else class="qr-overlay qr-overlay--escaneando">
          <div class="qr-overlay-frame qr-overlay-frame--active" />
          <p class="qr-overlay-text">Centra el código QR en el recuadro</p>
        </div>
      </div>

      <div class="qr-actions">
        <EduButton
          v-if="estado === 'idle'"
          variant="primary"
          size="lg-mobile"
          @click="iniciarCamara"
        >
          <CameraIcon class="qr-icon" />
          Activar cámara
        </EduButton>
        <EduButton
          v-else
          variant="primary"
          size="lg-mobile"
          @click="simularEscaneo"
        >
          <QrCodeIcon class="qr-icon" />
          Simular escaneo (mock)
        </EduButton>

        <button class="qr-link" type="button" @click="cambiarModo('manual')">
          <PencilSquareIcon class="qr-icon-sm" />
          Ingresar código manualmente
        </button>
      </div>
    </template>

    <!-- Modo manual -->
    <template v-else>
      <div class="qr-manual">
        <div class="qr-manual-icon"><QrCodeIcon /></div>
        <p class="qr-manual-help">
          Lee el código impreso bajo el QR del equipo (ej. <strong>QR-001</strong>) y escríbelo aquí.
        </p>
        <EduInput
          v-model="codigoManual"
          label="Código del equipo"
          placeholder="QR-001"
          required
          @keyup.enter="submitManual"
        />
        <p v-if="errorMsg" class="qr-error">{{ errorMsg }}</p>
      </div>

      <div class="qr-actions">
        <EduButton variant="primary" size="lg-mobile" @click="submitManual">
          <CheckCircleIcon class="qr-icon" />
          Verificar código
        </EduButton>
        <button class="qr-link" type="button" @click="cambiarModo('camara')">
          <CameraIcon class="qr-icon-sm" />
          Usar cámara
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.qr-scanner { display: flex; flex-direction: column; gap: 16px; }
.qr-icon { width: 18px; height: 18px; }
.qr-icon-sm { width: 14px; height: 14px; }

/* Cámara */
.qr-camara {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #1A1A2E;
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.qr-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.qr-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  background: rgba(0,0,0,0.4);
  gap: 12px;
}
.qr-overlay--escaneando { background: transparent; }
.qr-overlay-frame {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  aspect-ratio: 1 / 1;
  border: 3px solid rgba(255,255,255,0.7);
  border-radius: 16px;
  box-shadow: 0 0 0 9999px rgba(0,0,0,0.35);
  max-width: 280px;
}
.qr-overlay-frame--active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 9999px rgba(0,0,0,0.55);
  animation: qr-pulse 1.6s ease-in-out infinite;
}
@keyframes qr-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50%      { transform: translate(-50%, -50%) scale(1.04); }
}
.qr-overlay-icon {
  width: 48px;
  height: 48px;
  opacity: 0.8;
  z-index: 1;
}
.qr-overlay-text {
  z-index: 1;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  padding: 8px 16px;
  background: rgba(0,0,0,0.5);
  border-radius: 9999px;
  margin: 0;
  margin-top: 60%;
  position: relative;
}

/* Manual */
.qr-manual {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.qr-manual-icon {
  width: 56px;
  height: 56px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}
.qr-manual-icon :deep(svg) { width: 28px; height: 28px; }
.qr-manual-help {
  font-size: 14px;
  color: var(--color-text-secondary);
  text-align: center;
  margin: 0;
  line-height: 1.5;
}
.qr-manual :deep(.field) { width: 100%; }
.qr-error {
  font-size: 13px;
  color: var(--color-danger);
  margin: 0;
  text-align: center;
}

/* Acciones */
.qr-actions { display: flex; flex-direction: column; gap: 10px; align-items: center; }
.qr-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 12px 8px;
  min-height: 48px;
  font-family: inherit;
}
.qr-link:hover { color: var(--color-primary-hover); }

/* Resultado */
.qr-result {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}
.qr-result--ok    { border-color: var(--color-success); background: var(--color-success-bg); }
.qr-result--error { border-color: var(--color-danger);  background: var(--color-danger-bg); }

.qr-result-icon {
  width: 72px;
  height: 72px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: qr-bounce 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.qr-result-icon :deep(svg) { width: 44px; height: 44px; }
.qr-result-icon--ok    { background: var(--color-success); color: white; }
.qr-result-icon--error { background: var(--color-danger);  color: white; }
@keyframes qr-bounce {
  0%   { transform: scale(0); }
  60%  { transform: scale(1.15); }
  100% { transform: scale(1); }
}
.qr-result-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}
.qr-result--ok    .qr-result-title { color: var(--color-success); }
.qr-result--error .qr-result-title { color: var(--color-danger);  }
.qr-result-help {
  font-size: 14px;
  color: var(--color-text-primary);
  margin: 0 0 8px;
  line-height: 1.5;
}
</style>
