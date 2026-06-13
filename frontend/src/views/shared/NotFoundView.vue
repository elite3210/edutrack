<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import EduButton from '@/components/ui/EduButton.vue'
import {
  ArrowLeftIcon,
  HomeIcon,
  MagnifyingGlassIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const auth   = useAuthStore()

const homeRoute = computed(() => {
  if (!auth.isAuthenticated) return '/login'
  const map = {
    coordinador: '/coordinador/dashboard',
    director:    '/director/dashboard',
    tecnico:     '/tecnico/ordenes',
    super_admin: '/admin/instituciones',
  }
  return map[auth.user?.rol] ?? '/'
})

function volver() {
  if (window.history.length > 1) router.back()
  else router.push(homeRoute.value)
}
</script>

<template>
  <div class="nf">
    <div class="nf-card">
      <div class="nf-illu" aria-hidden="true">
        <div class="nf-illu-bg">
          <MagnifyingGlassIcon class="nf-illu-icon" />
        </div>
        <p class="nf-code">404</p>
      </div>

      <h1 class="nf-title">Esta página no existe</h1>
      <p class="nf-text">
        El enlace que seguiste puede estar roto, la página fue movida
        o no tienes acceso con tu rol actual.
      </p>

      <div class="nf-actions">
        <EduButton variant="outline-gray" @click="volver">
          <ArrowLeftIcon class="nf-icon" />
          Volver atrás
        </EduButton>
        <EduButton variant="primary" @click="router.push(homeRoute)">
          <HomeIcon class="nf-icon" />
          Ir al inicio
        </EduButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nf {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 20% 20%, var(--color-primary-light) 0%, transparent 35%),
    radial-gradient(circle at 80% 80%, rgba(100, 0, 190, 0.08) 0%, transparent 40%),
    var(--color-bg);
  padding: 24px;
  padding-top: max(24px, env(safe-area-inset-top));
  padding-bottom: max(24px, env(safe-area-inset-bottom));
}
.nf-icon { width: 16px; height: 16px; flex-shrink: 0; }

.nf-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl, 16px);
  box-shadow: var(--shadow-md);
  padding: 48px 32px;
  max-width: 480px;
  width: 100%;
  text-align: center;
  border: 1px solid var(--color-border);
}

.nf-illu {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 28px;
}
.nf-illu-bg {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 9999px;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
}
.nf-illu-bg::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 9999px;
  border: 2px dashed var(--color-primary);
  opacity: 0.3;
}
.nf-illu-icon {
  width: 56px;
  height: 56px;
  color: var(--color-primary);
}
.nf-code {
  position: absolute;
  bottom: -8px;
  right: 50%;
  transform: translateX(78px);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 6px 14px;
  background: var(--color-primary);
  color: white;
  border-radius: 9999px;
  margin: 0;
  font-variant-numeric: tabular-nums;
  box-shadow: var(--shadow-sm);
}

.nf-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: var(--color-text-primary);
  margin: 0 0 10px;
}
.nf-text {
  font-size: 15px;
  color: var(--color-text-secondary);
  margin: 0 0 28px;
  line-height: 1.55;
}

.nf-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}
@media (max-width: 480px) {
  .nf-card { padding: 40px 20px; }
  .nf-actions { flex-direction: column-reverse; align-items: stretch; }
  .nf-actions :deep(.edu-btn) { width: 100%; }
}
</style>
