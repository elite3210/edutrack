<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOrdenesStore } from '@/stores/ordenes'
import { useActivosStore } from '@/stores/activos'
import { useAuthStore }    from '@/stores/auth'
import { useOffline }      from '@/composables/useOffline'
import { useToast }        from '@/composables/useToast'
import MobileShell    from '@/components/layout/MobileShell.vue'
import EduCard        from '@/components/ui/EduCard.vue'
import EduButton      from '@/components/ui/EduButton.vue'
import EduTextarea    from '@/components/ui/EduTextarea.vue'
import EduModal       from '@/components/ui/EduModal.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import QrScanner       from '@/components/shared/QrScanner.vue'
import EvidenciaUploader from '@/components/shared/EvidenciaUploader.vue'
import {
  ArrowLeftIcon,
  QrCodeIcon,
  CameraIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ClockIcon,
  CubeIcon,
} from '@heroicons/vue/24/outline'

const router  = useRouter()
const route   = useRoute()
const ordenes = useOrdenesStore()
const activos = useActivosStore()
const auth    = useAuthStore()
const { isOnline, enqueue } = useOffline()
const { success, danger: toastError } = useToast()

const loading = ref(true)
const orden   = computed(() => ordenes.current)
const activo  = computed(() => activos.list.find(a => a.id === orden.value?.activo_id))

const step = ref(1) // 1 verificar | 2 evidencias | 3 cierre
const qrVerificado = ref(false)
const fotos = ref([]) // File[]
const descripcionCierre = ref('')
const showConfirmar = ref(false)
const cerrando = ref(false)
const timestamp = ref(null)

async function load() {
  loading.value = true
  try {
    const promises = [ordenes.fetchOne(route.params.id)]
    if (activos.list.length === 0) promises.push(activos.fetchAll())
    await Promise.all(promises)
    // Si la OT no está en ejecución aún y entra acá, intentamos arrancar
    if (orden.value?.estado === 'aceptada') {
      try {
        await ordenes.updateEstado(orden.value.id, 'en_ejecucion', { usuario: orden.value.tecnico_nombre })
      } catch { /* offline: continuamos igual con el flujo local */ }
    }
  } finally {
    loading.value = false
  }
}
onMounted(load)

// ─── Navegación entre pasos ──────────────────────────────────
function onScanSuccess() {
  qrVerificado.value = true
}
function continuarADoxsEvidencias() {
  if (!qrVerificado.value) return
  step.value = 2
}
function continuarACierre() {
  if (fotos.value.length < 2) {
    toastError('Sube al menos 2 fotos para continuar')
    return
  }
  timestamp.value = new Date()
  step.value = 3
}
function volverPaso(n) {
  step.value = n
}

const minimoCumplido = computed(() => fotos.value.length >= 2)

// ─── Submit cierre ───────────────────────────────────────────
function abrirConfirmar() {
  if (!descripcionCierre.value.trim()) {
    toastError('Describe el trabajo realizado')
    return
  }
  showConfirmar.value = true
}

async function confirmarCierre() {
  cerrando.value = true
  const payload = {
    estado:             'cerrada',
    descripcion_cierre: descripcionCierre.value.trim(),
    cerrada_en:         new Date().toISOString().split('T')[0],
    usuario:            auth.user?.nombre,
    evidencias:         fotos.value.map((f, i) => ({ id: `ev-${Date.now()}-${i}`, nombre: f.name })),
  }
  try {
    if (isOnline.value) {
      await ordenes.updateEstado(orden.value.id, 'cerrada', payload)
      success('OT cerrada correctamente')
      router.push(`/tecnico/ordenes/${orden.value.id}`)
    } else {
      // Encolar para sincronizar cuando vuelva la conexión
      await enqueue({
        url:     `/api/v1/ordenes/${orden.value.id}/estado`,
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      success('Cierre guardado offline. Se sincronizará al reconectar.')
      router.push('/tecnico/ordenes')
    }
  } catch {
    // Si falla por red, intentar encolar
    try {
      await enqueue({
        url:     `/api/v1/ordenes/${orden.value.id}/estado`,
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      success('Cierre guardado offline. Se sincronizará al reconectar.')
      router.push('/tecnico/ordenes')
    } catch {
      toastError('No se pudo cerrar la OT')
    }
  } finally {
    cerrando.value = false
    showConfirmar.value = false
  }
}

function formatHora(d) {
  if (!d) return ''
  return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

const pasos = [
  { n: 1, label: 'Verificar', icon: QrCodeIcon },
  { n: 2, label: 'Evidencias', icon: CameraIcon },
  { n: 3, label: 'Cierre',     icon: CheckCircleIcon },
]
</script>

<template>
  <MobileShell title="Ejecutar OT">
    <button class="ej-back" type="button" @click="router.push(`/tecnico/ordenes/${route.params.id}`)">
      <ArrowLeftIcon class="ej-icon" />
      Volver a la OT
    </button>

    <div v-if="loading" class="ej-loading">
      <SkeletonLoader width="100%" height="48px" />
      <SkeletonLoader width="100%" height="240px" />
    </div>

    <template v-else-if="orden">
      <!-- Pasos -->
      <nav class="ej-steps" aria-label="Progreso">
        <template v-for="(p, i) in pasos" :key="p.n">
          <div :class="['ej-step', { 'ej-step--active': step === p.n, 'ej-step--done': step > p.n }]">
            <div class="ej-step-circle">
              <CheckCircleIcon v-if="step > p.n" />
              <component v-else :is="p.icon" />
            </div>
            <span class="ej-step-label">{{ p.label }}</span>
          </div>
          <div v-if="i < pasos.length - 1" :class="['ej-step-line', { 'ej-step-line--done': step > p.n }]" />
        </template>
      </nav>

      <!-- Info compacta del activo -->
      <EduCard padding="sm" class="ej-activo">
        <div class="ej-activo-icon"><CubeIcon /></div>
        <div class="ej-activo-info">
          <p class="ej-activo-nombre">{{ orden.activo_nombre }}</p>
          <p class="ej-activo-meta">{{ orden.activo_ubicacion ?? activo?.ubicacion ?? '' }}</p>
        </div>
      </EduCard>

      <!-- Paso 1: Verificar QR -->
      <section v-if="step === 1" class="ej-section">
        <h2 class="ej-section-title">
          <QrCodeIcon class="ej-icon" />
          Verifica el equipo
        </h2>
        <p class="ej-section-help">
          Escanea el código QR pegado en el equipo para confirmar que estás
          interviniendo el activo correcto.
        </p>

        <QrScanner
          :codigo-esperado="activo?.codigo_qr ?? ''"
          @scan-success="onScanSuccess"
        />

        <div v-if="qrVerificado" class="ej-cta">
          <EduButton variant="primary" size="lg-mobile" @click="continuarADoxsEvidencias">
            Continuar a evidencias
          </EduButton>
        </div>
      </section>

      <!-- Paso 2: Evidencias -->
      <section v-else-if="step === 2" class="ej-section">
        <h2 class="ej-section-title">
          <CameraIcon class="ej-icon" />
          Sube las evidencias
        </h2>
        <p class="ej-section-help">
          Captura al menos 2 fotos del trabajo realizado (antes y después).
        </p>

        <EvidenciaUploader v-model="fotos" :min-fotos="2" :max-fotos="4" />

        <div class="ej-cta">
          <EduButton
            variant="primary"
            size="lg-mobile"
            :disabled="!minimoCumplido"
            @click="continuarACierre"
          >
            Continuar al cierre
          </EduButton>
          <button class="ej-link" type="button" @click="volverPaso(1)">
            Volver al paso anterior
          </button>
        </div>
      </section>

      <!-- Paso 3: Cierre -->
      <section v-else-if="step === 3" class="ej-section">
        <h2 class="ej-section-title">
          <CheckCircleIcon class="ej-icon" />
          Cierre de la orden
        </h2>
        <p class="ej-section-help">
          Describe el trabajo realizado para registrar la intervención.
        </p>

        <EduTextarea
          v-model="descripcionCierre"
          label="Descripción del trabajo realizado"
          placeholder="Detalla qué se hizo, qué pieza se cambió, observaciones…"
          :rows="6"
          :maxlength="500"
          required
        />

        <div class="ej-meta">
          <ClockIcon class="ej-icon-sm" />
          Inicio del cierre: <strong>{{ formatHora(timestamp) }}</strong>
          <span v-if="fotos.length > 0">· {{ fotos.length }} {{ fotos.length === 1 ? 'foto adjunta' : 'fotos adjuntas' }}</span>
        </div>

        <div v-if="!isOnline" class="ej-offline-banner">
          <span class="ej-offline-dot" />
          Sin conexión. El cierre se guardará y enviará al reconectar.
        </div>

        <div class="ej-cta">
          <EduButton variant="primary" size="lg-mobile" @click="abrirConfirmar">
            <CheckCircleIcon class="ej-icon" />
            Cerrar orden
          </EduButton>
          <button class="ej-link" type="button" @click="volverPaso(2)">
            Volver a evidencias
          </button>
        </div>
      </section>
    </template>

    <!-- Modal confirmación final -->
    <EduModal v-model="showConfirmar" title="Confirmar cierre">
      <p class="ej-modal-help">
        Vas a cerrar la orden <strong>{{ orden?.numero }}</strong>. Esta acción
        registrará la intervención en el historial del activo.
      </p>
      <ul class="ej-resumen">
        <li>
          <span>Activo</span>
          <strong>{{ orden?.activo_nombre }}</strong>
        </li>
        <li>
          <span>Fotos adjuntas</span>
          <strong>{{ fotos.length }}</strong>
        </li>
        <li>
          <span>Hora de cierre</span>
          <strong>{{ formatHora(new Date()) }}</strong>
        </li>
        <li v-if="!isOnline">
          <span>Modo</span>
          <strong class="ej-resumen-offline">Offline (cola IndexedDB)</strong>
        </li>
      </ul>
      <template #footer>
        <EduButton variant="outline-gray" @click="showConfirmar = false">
          Cancelar
        </EduButton>
        <EduButton variant="primary" :loading="cerrando" @click="confirmarCierre">
          Confirmar cierre
        </EduButton>
      </template>
    </EduModal>
  </MobileShell>
</template>

<style scoped>
.ej-icon    { width: 18px; height: 18px; flex-shrink: 0; }
.ej-icon-sm { width: 14px; height: 14px; flex-shrink: 0; }

.ej-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  padding: 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-primary);
  cursor: pointer;
  font-family: inherit;
  margin-bottom: 12px;
  min-height: 48px;
}
.ej-loading { display: flex; flex-direction: column; gap: 12px; }

/* Steps */
.ej-steps {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 16px;
  padding: 4px 0;
}
.ej-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.ej-step-circle {
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: var(--color-bg);
  color: var(--color-text-secondary);
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  transition: all var(--transition-fast);
}
.ej-step-circle :deep(svg) { width: 18px; height: 18px; }
.ej-step--active .ej-step-circle {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}
.ej-step--done .ej-step-circle {
  background: var(--color-success);
  border-color: var(--color-success);
  color: white;
}
.ej-step-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.ej-step--active .ej-step-label { color: var(--color-primary); }
.ej-step--done .ej-step-label   { color: var(--color-success); }

.ej-step-line {
  flex: 1;
  height: 2px;
  background: var(--color-border);
  margin: 0 4px 18px;
  transition: background var(--transition-fast);
}
.ej-step-line--done { background: var(--color-success); }

/* Activo compacto */
.ej-activo {
  margin-bottom: 16px;
}
.ej-activo :deep(.edu-card-body) {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ej-activo-icon {
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
.ej-activo-icon :deep(svg) { width: 20px; height: 20px; }
.ej-activo-info { flex: 1; min-width: 0; }
.ej-activo-nombre {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}
.ej-activo-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 2px 0 0;
}

/* Secciones */
.ej-section { padding-bottom: 80px; }
.ej-section-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 6px;
  letter-spacing: -0.2px;
}
.ej-section-help {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0 0 18px;
  line-height: 1.5;
}

.ej-meta {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 12px 0 0;
  flex-wrap: wrap;
}
.ej-meta strong { color: var(--color-text-primary); font-weight: 600; }

.ej-offline-banner {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--color-warning-bg);
  color: var(--color-warning);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  margin: 16px 0 0;
  width: 100%;
  box-sizing: border-box;
}
.ej-offline-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: var(--color-warning);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}

/* CTAs */
.ej-cta {
  position: sticky;
  bottom: 0;
  margin: 24px -16px -16px;
  padding: 14px 16px env(safe-area-inset-bottom);
  background: linear-gradient(to top, var(--color-bg) 70%, rgba(247, 244, 251, 0));
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}
.ej-cta :deep(.edu-btn--lg-mobile) { width: 100%; }
.ej-link {
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

/* Modal */
.ej-modal-help {
  font-size: 14px;
  color: var(--color-text-primary);
  margin: 0 0 16px;
  line-height: 1.5;
}
.ej-resumen {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ej-resumen li {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  background: var(--color-bg);
  border-radius: var(--radius-md);
  font-size: 13px;
}
.ej-resumen li span { color: var(--color-text-secondary); }
.ej-resumen li strong { color: var(--color-text-primary); font-weight: 600; }
.ej-resumen-offline { color: var(--color-warning) !important; }
</style>
