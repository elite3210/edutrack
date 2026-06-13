<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import * as authApi from '@/api/auth.api'
import EduInput from '@/components/ui/EduInput.vue'
import EduButton from '@/components/ui/EduButton.vue'
import {
  ShieldCheckIcon,
  ChartBarSquareIcon,
  BoltIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/vue/24/outline'
import logoTexto from '@/assets/img/logo-texto.png'

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

const form    = reactive({ email: '', password: '' })
const loading = ref(false)
const error   = ref('')
const showPassword = ref(false)
const showDemos    = ref(false)
const emailTouched = ref(false)
const passwordTouched = ref(false)

const emailError = computed(() => {
  if (!emailTouched.value) return ''
  if (!form.email)         return 'El correo es obligatorio.'
  if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Ingresa un correo válido.'
  return ''
})
const passwordError = computed(() => {
  if (!passwordTouched.value) return ''
  if (!form.password) return 'La contraseña es obligatoria.'
  return ''
})
const formValid = computed(() =>
  form.email && form.password && !emailError.value && !passwordError.value,
)

const roleHome = {
  coordinador: '/coordinador/dashboard',
  director:    '/director/dashboard',
  tecnico:     '/tecnico/ordenes',
  super_admin: '/admin/instituciones',
}

async function handleLogin() {
  emailTouched.value    = true
  passwordTouched.value = true
  if (!formValid.value) return

  loading.value = true
  error.value   = ''
  try {
    const res = await authApi.login(form.email, form.password)
    auth.setSession(res.user, res.access_token)
    const redirect = route.query.redirect ?? roleHome[res.user.rol] ?? '/'
    router.push(redirect)
  } catch (e) {
    error.value = e.message ?? 'Credenciales incorrectas. Verifica tu correo y contraseña.'
  } finally {
    loading.value = false
  }
}

const demos = [
  { label: 'Coordinador', email: 'coordinador@colegio.edu.pe', desc: 'Gestiona activos, OTs y alertas' },
  { label: 'Director',    email: 'director@colegio.edu.pe',    desc: 'Dashboard ejecutivo y proyección' },
  { label: 'Técnico',     email: 'tecnico@colegio.edu.pe',     desc: 'Ejecución de órdenes en campo' },
  { label: 'Super Admin', email: 'admin@edutrack.ai',          desc: 'Multi-tenant y catálogo global' },
]
function fillDemo(email) {
  form.email    = email
  form.password = '123456'
  emailTouched.value = true
  passwordTouched.value = true
}

const features = [
  {
    icon: ChartBarSquareIcon,
    title: 'Score de salud por activo',
    desc: 'Algoritmo que combina vida útil, cumplimiento, fallas y recencia para priorizar.',
  },
  {
    icon: BoltIcon,
    title: 'Reportes con un escaneo',
    desc: 'Los docentes reportan fallas desde el QR en segundos, sin descargar nada.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Menos fallas, más aprendizaje',
    desc: 'Anticipa problemas antes de que afecten al aula y prolonga la vida útil de cada equipo.',
  },
]
</script>

<template>
  <div class="login-layout">
    <!-- ── Hero (branding lateral, oculto en mobile) ──────────────── -->
    <aside class="login-hero" aria-hidden="true">
      <div class="login-hero-bg" />
      <div class="login-hero-orb login-hero-orb--1" />
      <div class="login-hero-orb login-hero-orb--2" />

      <div class="login-hero-content">
        <div class="login-hero-center">
          <div class="login-hero-eyebrow">PLATAFORMA SAAS · COLEGIOS PRIVADOS</div>
          <h2 class="login-hero-title">
            Gestiona el ciclo de vida<br />
            de tus activos tecnológicos<br />
            <span class="login-hero-accent">con inteligencia.</span>
          </h2>

          <ul class="login-hero-features">
            <li v-for="f in features" :key="f.title" class="login-hero-feature">
              <span class="login-hero-feature-icon">
                <component :is="f.icon" />
              </span>
              <div>
                <p class="login-hero-feature-title">{{ f.title }}</p>
                <p class="login-hero-feature-desc">{{ f.desc }}</p>
              </div>
            </li>
          </ul>
        </div>

        <p class="login-hero-footer">
          © 2026 EduTrack AI · Diseñado para colegios del Perú
        </p>
      </div>
    </aside>

    <!-- ── Panel del formulario ─────────────────────────────────── -->
    <main class="login-panel">
      <div class="login-panel-inner">

        <!-- Logo -->
        <div class="login-logo-wrap">
          <img :src="logoTexto" alt="EduTrack AI" class="login-logo" />
        </div>

        <p class="login-subtitle">Ingresa tus credenciales para acceder al sistema.</p>

        <!-- Error -->
        <Transition name="fade">
          <div v-if="error" class="login-error" role="alert">
            <span class="login-error-icon">!</span>
            <span>{{ error }}</span>
          </div>
        </Transition>

        <!-- Formulario -->
        <form class="login-form" @submit.prevent="handleLogin" novalidate>
          <EduInput
            v-model="form.email"
            label="Correo institucional"
            type="email"
            placeholder="tu.correo@colegio.edu.pe"
            autocomplete="email"
            required
            :disabled="loading"
            :error="emailError"
            @blur="emailTouched = true"
          />

          <div class="login-password-wrap">
            <EduInput
              v-model="form.password"
              label="Contraseña"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Ingresa tu contraseña"
              autocomplete="current-password"
              required
              :disabled="loading"
              :error="passwordError"
              @blur="passwordTouched = true"
            />
            <button
              type="button"
              class="login-password-toggle"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              :class="{ 'login-password-toggle--shifted': passwordError }"
              @click="showPassword = !showPassword"
            >
              <EyeIcon      v-if="!showPassword" class="login-password-icon" />
              <EyeSlashIcon v-else                class="login-password-icon" />
            </button>
          </div>

          <div class="login-form-meta">
            <label class="login-remember">
              <input type="checkbox" class="login-remember-checkbox" />
              <span>Recordarme</span>
            </label>
            <a href="#" class="login-forgot" @click.prevent>¿Olvidaste tu contraseña?</a>
          </div>

          <EduButton
            type="submit"
            size="lg"
            :loading="loading"
            class="login-submit"
          >
            Ingresar al sistema
          </EduButton>
        </form>

        <!-- Acceso demo (collapsible) -->
        <div class="login-demos">
          <button
            type="button"
            class="login-demos-toggle"
            :aria-expanded="showDemos"
            @click="showDemos = !showDemos"
          >
            <span class="login-demos-dot" />
            <span>Acceso demo — sin registrarte</span>
            <span class="login-demos-chevron" :class="{ 'login-demos-chevron--open': showDemos }">▾</span>
          </button>

          <Transition name="expand">
            <div v-if="showDemos" class="login-demos-panel">
              <p class="login-demos-hint">Selecciona un rol para probarlo. Contraseña: <code>123456</code></p>
              <div class="login-demos-grid">
                <button
                  v-for="d in demos"
                  :key="d.email"
                  class="login-demo-btn"
                  type="button"
                  @click="fillDemo(d.email)"
                >
                  <span class="login-demo-label">{{ d.label }}</span>
                  <span class="login-demo-desc">{{ d.desc }}</span>
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <p class="login-mobile-footer">© 2026 EduTrack AI</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* ─────────── Layout ─────────────────────────────────────────── */
.login-layout {
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  background: var(--color-surface);
}

/* ─────────── Hero (lado izquierdo) ──────────────────────────── */
.login-hero {
  position: relative;
  overflow: hidden;
  color: #fff;
  display: flex;
  align-items: stretch;
  isolation: isolate;
}
.login-hero-bg {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(140deg, #2A0561 0%, #6400BE 55%, #8A2BE2 100%);
  z-index: -2;
}
.login-hero-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(60px);
  opacity: 0.5;
  z-index: -1;
}
.login-hero-orb--1 {
  width: 420px;
  height: 420px;
  top: -120px;
  left: -120px;
  background: radial-gradient(circle, #B388FF 0%, transparent 70%);
}
.login-hero-orb--2 {
  width: 360px;
  height: 360px;
  bottom: -100px;
  right: -100px;
  background: radial-gradient(circle, #00E5FF 0%, transparent 70%);
  opacity: 0.3;
}
.login-hero-content {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 64px 56px 80px;
  width: 100%;
  max-width: 540px;
  margin: 0 auto;
}
.login-hero-center {
  display: flex;
  flex-direction: column;
}
.login-hero-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  color: rgba(255,255,255,0.75);
  margin-bottom: 24px;
}
.login-hero-title {
  font-size: 34px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.6px;
  margin: 0 0 44px;
}
.login-hero-accent {
  background: linear-gradient(90deg, #FFD86B 0%, #FF9F6B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.login-hero-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.login-hero-feature {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}
.login-hero-feature-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  backdrop-filter: blur(8px);
}
.login-hero-feature-icon :deep(svg) {
  width: 22px;
  height: 22px;
}
.login-hero-feature-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin: 2px 0 4px;
}
.login-hero-feature-desc {
  font-size: 13px;
  line-height: 1.5;
  color: rgba(255,255,255,0.75);
  margin: 0;
}
.login-hero-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 32px;
  text-align: center;
  font-size: 12px;
  color: rgba(255,255,255,0.55);
  margin: 0;
}

/* ─────────── Panel del form (lado derecho) ──────────────────── */
.login-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: var(--color-surface);
}
.login-panel-inner {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
}
.login-logo-wrap {
  margin-bottom: 32px;
  display: flex;
  justify-content: center;
}
.login-logo {
  height: 56px;
  width: auto;
  object-fit: contain;
}
.login-subtitle {
  font-size: 14.5px;
  color: var(--color-text-secondary);
  margin: 0 0 28px;
  text-align: center;
}

/* ─────────── Error ──────────────────────────────────────────── */
.login-error {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-danger-bg);
  border: 1px solid rgba(192,57,43,0.25);
  border-left: 3px solid var(--color-danger);
  color: var(--color-danger);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  font-size: 13.5px;
  font-weight: 500;
  margin-bottom: 16px;
}
.login-error-icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 9999px;
  background: var(--color-danger);
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ─────────── Formulario ─────────────────────────────────────── */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.login-password-wrap {
  position: relative;
}
.login-password-toggle {
  position: absolute;
  top: 31px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast), background var(--transition-fast);
}
.login-password-toggle:hover {
  color: var(--color-primary);
  background: var(--color-primary-light);
}
.login-password-toggle--shifted {
  /* mantiene posición cuando aparece mensaje de error abajo */
  top: 31px;
}
.login-password-icon {
  width: 18px;
  height: 18px;
}
.login-form-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -4px;
}
.login-remember {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
  cursor: pointer;
  user-select: none;
}
.login-remember-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
  cursor: pointer;
}
.login-forgot {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}
.login-forgot:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
}
.login-submit {
  width: 100%;
  margin-top: 8px;
}

/* ─────────── Demos collapsible ──────────────────────────────── */
.login-demos {
  margin-top: 28px;
  border-top: 1px solid var(--color-border);
  padding-top: 20px;
}
.login-demos-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: inherit;
  transition: border-color var(--transition-fast), color var(--transition-fast), background var(--transition-fast);
}
.login-demos-toggle:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-light);
}
.login-demos-dot {
  width: 8px;
  height: 8px;
  background: var(--color-success);
  border-radius: 9999px;
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(30,132,73,0.18);
}
.login-demos-chevron {
  margin-left: auto;
  transition: transform var(--transition-fast);
  font-size: 11px;
}
.login-demos-chevron--open {
  transform: rotate(180deg);
}
.login-demos-panel {
  margin-top: 14px;
}
.login-demos-hint {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0 0 10px;
  text-align: center;
}
.login-demos-hint code {
  background: var(--color-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11.5px;
  color: var(--color-primary);
  font-weight: 600;
}
.login-demos-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.login-demo-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: all var(--transition-fast);
}
.login-demo-btn:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}
.login-demo-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}
.login-demo-btn:hover .login-demo-label {
  color: var(--color-primary);
}
.login-demo-desc {
  font-size: 11px;
  color: var(--color-text-secondary);
  line-height: 1.3;
}

.login-mobile-footer {
  display: none;
  font-size: 12px;
  color: var(--color-text-disabled);
  text-align: center;
  margin: 32px 0 0;
}

/* ─────────── Transiciones ───────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity 200ms, transform 200ms; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }

.expand-enter-active, .expand-leave-active {
  transition: max-height 250ms ease-out, opacity 200ms ease-out;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to { max-height: 0; opacity: 0; }
.expand-enter-to, .expand-leave-from { max-height: 400px; opacity: 1; }

/* ─────────── Responsive ─────────────────────────────────────── */
@media (max-width: 960px) {
  .login-layout {
    grid-template-columns: 1fr;
  }
  .login-hero {
    display: none;
  }
  .login-panel {
    padding: 24px 20px;
    background: var(--color-bg);
  }
  .login-panel-inner {
    background: var(--color-surface);
    padding: 32px 24px;
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--color-border);
    max-width: 460px;
  }
  .login-mobile-footer { display: block; }
}

@media (max-width: 480px) {
  .login-panel { padding: 16px 12px; }
  .login-panel-inner { padding: 28px 20px; }
  .login-logo { height: 44px; }
  .login-title { font-size: 22px; }
  .login-demos-grid { grid-template-columns: 1fr; }
}
</style>
