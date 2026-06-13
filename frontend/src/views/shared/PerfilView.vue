<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import * as perfilApi   from '@/api/perfil.api'
import { useToast }     from '@/composables/useToast'
import AppShell      from '@/components/layout/AppShell.vue'
import MobileShell   from '@/components/layout/MobileShell.vue'
import EduCard       from '@/components/ui/EduCard.vue'
import EduInput      from '@/components/ui/EduInput.vue'
import EduButton     from '@/components/ui/EduButton.vue'
import EduBadge      from '@/components/ui/EduBadge.vue'
import EduModal      from '@/components/ui/EduModal.vue'
import EmptyState    from '@/components/ui/EmptyState.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import {
  UserCircleIcon,
  KeyIcon,
  CommandLineIcon,
  CheckCircleIcon,
  PlusIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const { success, danger: toastError, info } = useToast()

// ─── Layout responsivo ────────────────────────────────────────
const isMobile = ref(false)
function updateLayout() { isMobile.value = window.innerWidth < 768 }
onMounted(() => {
  updateLayout()
  window.addEventListener('resize', updateLayout)
})

const Shell = computed(() => isMobile.value ? MobileShell : AppShell)
const rolMeta = {
  coordinador: { label: 'Coordinador', variant: 'success' },
  director:    { label: 'Director',    variant: 'in-progress' },
  tecnico:     { label: 'Técnico',     variant: 'info' },
  super_admin: { label: 'Super admin', variant: 'danger' },
}

const verTokens = computed(() => ['coordinador', 'director'].includes(auth.user?.rol))

// ─── Cambio de contraseña ─────────────────────────────────────
const pwd = ref({ actual: '', nueva: '', confirmar: '' })
const pwdErrors = ref({})
const pwdSubmitting = ref(false)
const showActual = ref(false)
const showNueva  = ref(false)

function validatePwd() {
  const e = {}
  if (!pwd.value.actual)  e.actual = 'Indica tu contraseña actual'
  if (!pwd.value.nueva)   e.nueva  = 'Indica la nueva contraseña'
  else if (pwd.value.nueva.length < 8) e.nueva = 'Mínimo 8 caracteres'
  if (pwd.value.nueva !== pwd.value.confirmar) e.confirmar = 'Las contraseñas no coinciden'
  pwdErrors.value = e
  return Object.keys(e).length === 0
}

watch(() => pwd.value.nueva,     () => { if (pwdErrors.value.nueva)     validatePwd() })
watch(() => pwd.value.confirmar, () => { if (pwdErrors.value.confirmar) validatePwd() })

async function cambiarPassword() {
  if (!validatePwd()) {
    toastError('Revisa los campos marcados')
    return
  }
  pwdSubmitting.value = true
  try {
    await perfilApi.cambiarPassword(pwd.value.actual, pwd.value.nueva)
    success('Contraseña actualizada')
    pwd.value = { actual: '', nueva: '', confirmar: '' }
  } catch (err) {
    toastError(err.message ?? 'No se pudo actualizar')
  } finally {
    pwdSubmitting.value = false
  }
}

// ─── Tokens de API ────────────────────────────────────────────
const tokens   = ref([])
const cargando = ref(false)
const showCrear = ref(false)
const nombreToken = ref('')
const creando = ref(false)
const tokenNuevo = ref(null)  // {token, partial, nombre}

async function cargarTokens() {
  if (!verTokens.value) return
  cargando.value = true
  try {
    tokens.value = await perfilApi.listarTokens()
  } catch {
    toastError('No se pudieron cargar los tokens')
  } finally {
    cargando.value = false
  }
}
onMounted(cargarTokens)

async function crearToken() {
  if (!nombreToken.value.trim()) {
    toastError('Indica un nombre para el token')
    return
  }
  creando.value = true
  try {
    const res = await perfilApi.crearToken(nombreToken.value.trim())
    tokens.value.unshift({
      id: res.id,
      nombre: res.nombre,
      token_partial: res.token_partial,
      created_at: res.created_at,
      last_used_at: null,
    })
    tokenNuevo.value = res
    nombreToken.value = ''
    showCrear.value = false
  } catch {
    toastError('No se pudo generar el token')
  } finally {
    creando.value = false
  }
}

async function revocarToken(t) {
  if (!confirm(`¿Revocar el token "${t.nombre}"? Esta acción no se puede deshacer.`)) return
  try {
    await perfilApi.revocarToken(t.id)
    tokens.value = tokens.value.filter(x => x.id !== t.id)
    success('Token revocado')
  } catch {
    toastError('No se pudo revocar')
  }
}

async function copiarToken(texto) {
  try {
    await navigator.clipboard.writeText(texto)
    info('Token copiado al portapapeles')
  } catch {
    toastError('No se pudo copiar')
  }
}
</script>

<template>
  <component :is="Shell" title="Mi perfil">
    <header class="pf-header">
      <p class="pf-eyebrow">Mi cuenta</p>
      <h1 class="pf-title">Configuración del perfil</h1>
      <p class="pf-subtitle">Datos personales, seguridad y accesos programáticos.</p>
    </header>

    <div class="pf-grid">
      <!-- Datos personales -->
      <EduCard class="pf-card">
        <template #header>
          <h2 class="pf-section-title">
            <UserCircleIcon class="pf-icon" />
            Datos personales
          </h2>
        </template>

        <div class="pf-user">
          <div class="pf-avatar">
            {{ auth.user?.nombre?.charAt(0).toUpperCase() ?? '?' }}
          </div>
          <div class="pf-user-info">
            <p class="pf-user-nombre">{{ auth.user?.nombre }}</p>
            <p class="pf-user-email">{{ auth.user?.email }}</p>
            <EduBadge
              :variant="rolMeta[auth.user?.rol]?.variant ?? 'default'"
              size="sm"
            >
              {{ rolMeta[auth.user?.rol]?.label ?? auth.user?.rol }}
            </EduBadge>
          </div>
        </div>

        <p class="pf-help">
          <InformationCircleIcon class="pf-icon-sm" />
          El nombre y el email los gestiona el administrador de tu institución.
        </p>
      </EduCard>

      <!-- Cambiar contraseña -->
      <EduCard class="pf-card">
        <template #header>
          <h2 class="pf-section-title">
            <KeyIcon class="pf-icon" />
            Cambiar contraseña
          </h2>
        </template>

        <form @submit.prevent="cambiarPassword" class="pf-form" novalidate>
          <div class="pf-pwd-row">
            <EduInput
              v-model="pwd.actual"
              :type="showActual ? 'text' : 'password'"
              label="Contraseña actual"
              autocomplete="current-password"
              :error="pwdErrors.actual"
              required
            />
            <button
              type="button"
              class="pf-pwd-eye"
              :aria-label="showActual ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="showActual = !showActual"
            >
              <EyeIcon v-if="!showActual" />
              <EyeSlashIcon v-else />
            </button>
          </div>

          <div class="pf-pwd-row">
            <EduInput
              v-model="pwd.nueva"
              :type="showNueva ? 'text' : 'password'"
              label="Nueva contraseña"
              helper="Mínimo 8 caracteres"
              autocomplete="new-password"
              :error="pwdErrors.nueva"
              required
            />
            <button
              type="button"
              class="pf-pwd-eye"
              :aria-label="showNueva ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="showNueva = !showNueva"
            >
              <EyeIcon v-if="!showNueva" />
              <EyeSlashIcon v-else />
            </button>
          </div>

          <EduInput
            v-model="pwd.confirmar"
            :type="showNueva ? 'text' : 'password'"
            label="Confirmar nueva contraseña"
            autocomplete="new-password"
            :error="pwdErrors.confirmar"
            required
          />

          <div class="pf-actions">
            <EduButton variant="primary" type="submit" :loading="pwdSubmitting">
              <CheckCircleIcon class="pf-icon" />
              Actualizar contraseña
            </EduButton>
          </div>
        </form>
      </EduCard>

      <!-- Tokens de API -->
      <EduCard v-if="verTokens" class="pf-card pf-card--wide">
        <template #header>
          <div class="pf-tokens-head">
            <h2 class="pf-section-title">
              <CommandLineIcon class="pf-icon" />
              Tokens de API
            </h2>
            <EduButton variant="primary" size="sm" @click="showCrear = true">
              <PlusIcon class="pf-icon-sm" />
              Generar token
            </EduButton>
          </div>
        </template>

        <p class="pf-help">
          <InformationCircleIcon class="pf-icon-sm" />
          Los tokens permiten integrar EduTrack con scripts y herramientas externas.
          Una vez generado, el valor completo se muestra una sola vez.
        </p>

        <div v-if="cargando" class="pf-skeletons">
          <SkeletonLoader v-for="n in 2" :key="n" width="100%" height="56px" />
        </div>

        <EmptyState
          v-else-if="tokens.length === 0"
          title="Sin tokens generados"
          description="Aún no has generado ningún token de API."
        />

        <ul v-else class="pf-tokens">
          <li v-for="t in tokens" :key="t.id" class="pf-token">
            <div class="pf-token-icon">
              <CommandLineIcon />
            </div>
            <div class="pf-token-info">
              <p class="pf-token-nombre">{{ t.nombre }}</p>
              <p class="pf-token-valor">{{ t.token_partial }}</p>
              <p class="pf-token-meta">
                Creado el {{ t.created_at }} ·
                <template v-if="t.last_used_at">Usado el {{ t.last_used_at }}</template>
                <template v-else>Nunca usado</template>
              </p>
            </div>
            <button
              type="button"
              class="pf-token-revoke"
              @click="revocarToken(t)"
              aria-label="Revocar token"
            >
              <TrashIcon />
              <span class="pf-token-revoke-label">Revocar</span>
            </button>
          </li>
        </ul>
      </EduCard>

      <!-- Placeholder preferencias -->
      <EduCard class="pf-card pf-card--soft">
        <p class="pf-soon">
          <InformationCircleIcon class="pf-icon-sm" />
          Las preferencias (idioma, notificaciones por email) llegarán en próximas versiones.
        </p>
      </EduCard>
    </div>

    <!-- Modal crear token -->
    <EduModal v-model="showCrear" title="Generar nuevo token">
      <p class="pf-modal-help">
        Asigna un nombre que te ayude a identificar dónde usarás este token (ej. <em>Power BI Producción</em>).
      </p>
      <EduInput
        v-model="nombreToken"
        label="Nombre del token"
        placeholder="Ej. Script de exportación nocturna"
        required
        @keyup.enter="crearToken"
      />
      <template #footer>
        <EduButton variant="outline-gray" @click="showCrear = false">Cancelar</EduButton>
        <EduButton variant="primary" :loading="creando" @click="crearToken">
          Generar token
        </EduButton>
      </template>
    </EduModal>

    <!-- Modal mostrar token recién creado -->
    <EduModal v-model="tokenNuevo" :title="`Token: ${tokenNuevo?.nombre ?? ''}`">
      <div class="pf-nuevo">
        <p class="pf-nuevo-warning">
          <InformationCircleIcon class="pf-icon-sm" />
          <span>
            Copia este token ahora. Por seguridad, no podrás verlo de nuevo.
          </span>
        </p>
        <div class="pf-nuevo-token">
          <code>{{ tokenNuevo?.token }}</code>
          <button
            type="button"
            class="pf-nuevo-copy"
            @click="copiarToken(tokenNuevo?.token ?? '')"
            aria-label="Copiar token"
          >
            <ClipboardDocumentIcon />
          </button>
        </div>
      </div>
      <template #footer>
        <EduButton variant="primary" @click="tokenNuevo = null">
          Listo, lo guardé
        </EduButton>
      </template>
    </EduModal>
  </component>
</template>

<style scoped>
.pf-icon    { width: 16px; height: 16px; flex-shrink: 0; }
.pf-icon-sm { width: 14px; height: 14px; flex-shrink: 0; }

.pf-header { margin-bottom: 22px; }
.pf-eyebrow {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--color-primary);
  margin: 0 0 6px;
}
.pf-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--color-text-primary);
  margin: 0 0 6px;
}
.pf-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.pf-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.pf-card--wide  { grid-column: 1 / -1; }
.pf-card--soft  { grid-column: 1 / -1; background: transparent; border: 1px dashed var(--color-border); }
.pf-card--soft :deep(.edu-card) { box-shadow: none; }

@media (max-width: 768px) { .pf-grid { grid-template-columns: 1fr; } }

.pf-section-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.pf-help {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  font-size: 12.5px;
  color: var(--color-info);
  background: var(--color-info-bg);
  padding: 10px 12px;
  border-radius: var(--radius-md);
  margin: 0;
  line-height: 1.5;
}

/* Datos personales */
.pf-user {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 14px;
}
.pf-avatar {
  width: 64px;
  height: 64px;
  border-radius: 9999px;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 26px;
  flex-shrink: 0;
}
.pf-user-info { min-width: 0; }
.pf-user-nombre {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 2px;
}
.pf-user-email {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0 0 6px;
}

/* Cambiar contraseña */
.pf-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.pf-pwd-row {
  position: relative;
}
.pf-pwd-eye {
  position: absolute;
  top: 26px;
  right: 6px;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.pf-pwd-eye :deep(svg) { width: 18px; height: 18px; }
.pf-pwd-eye:hover { background: var(--color-bg); color: var(--color-text-primary); }

.pf-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
}

/* Tokens */
.pf-tokens-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
}
.pf-skeletons { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
.pf-tokens {
  list-style: none;
  padding: 0;
  margin: 14px 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pf-token {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--color-bg);
  border-radius: var(--radius-md);
}
.pf-token-icon {
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
.pf-token-icon :deep(svg) { width: 18px; height: 18px; }
.pf-token-info { flex: 1; min-width: 0; }
.pf-token-nombre {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}
.pf-token-valor {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12.5px;
  color: var(--color-text-primary);
  margin: 4px 0 0;
}
.pf-token-meta {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  margin: 4px 0 0;
}

.pf-token-revoke {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-secondary);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}
.pf-token-revoke :deep(svg) { width: 14px; height: 14px; }
.pf-token-revoke:hover {
  background: var(--color-danger-bg);
  border-color: var(--color-danger);
  color: var(--color-danger);
}
@media (max-width: 480px) {
  .pf-token-revoke-label { display: none; }
}

/* Card soft (placeholder preferencias) */
.pf-soon {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
  font-style: italic;
}

/* Modal */
.pf-modal-help {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0 0 16px;
  line-height: 1.5;
}
.pf-nuevo { display: flex; flex-direction: column; gap: 16px; }
.pf-nuevo-warning {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 13px;
  color: var(--color-warning);
  background: var(--color-warning-bg);
  padding: 12px 14px;
  border-radius: var(--radius-md);
  margin: 0;
  line-height: 1.5;
}
.pf-nuevo-token {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px 14px;
}
.pf-nuevo-token code {
  flex: 1;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
  color: var(--color-text-primary);
  word-break: break-all;
}
.pf-nuevo-copy {
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.pf-nuevo-copy :deep(svg) { width: 20px; height: 20px; }
.pf-nuevo-copy:hover { background: var(--color-primary-light); }
</style>
