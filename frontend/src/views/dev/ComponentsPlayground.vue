<script setup>
import { ref } from 'vue'
import EduButton    from '@/components/ui/EduButton.vue'
import EduInput     from '@/components/ui/EduInput.vue'
import EduSelect    from '@/components/ui/EduSelect.vue'
import EduTextarea  from '@/components/ui/EduTextarea.vue'
import EduCard      from '@/components/ui/EduCard.vue'
import EduBadge     from '@/components/ui/EduBadge.vue'
import EduSpinner   from '@/components/ui/EduSpinner.vue'
import EduModal     from '@/components/ui/EduModal.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EmptyState   from '@/components/ui/EmptyState.vue'
import OfflineBanner from '@/components/ui/OfflineBanner.vue'
import { useToast } from '@/composables/useToast'

const toast = useToast()

const text     = ref('')
const password = ref('')
const select   = ref('')
const message  = ref('Aquí va un mensaje de prueba para el textarea.')
const modalOpen = ref(false)

const selectOptions = [
  { value: 'proyector',  label: 'Proyector' },
  { value: 'laptop',     label: 'Laptop' },
  { value: 'aire',       label: 'Aire acondicionado' },
  { value: 'monitor',    label: 'Monitor' },
]

const variants = ['primary', 'secondary', 'danger', 'ghost', 'outline-gray']
const sizes    = ['sm', 'md', 'lg']
const badges   = ['success', 'warning', 'danger', 'info', 'primary']
</script>

<template>
  <div class="dev-page">
    <header class="dev-header">
      <h1 class="dev-h1">/dev/components — EduTrack UI</h1>
      <p class="dev-subtitle">Página temporal de verificación visual de los componentes base (Fase 0).</p>
    </header>

    <OfflineBanner />

    <section class="dev-section">
      <h2>Botones</h2>
      <div class="dev-row">
        <EduButton v-for="v in variants" :key="v" :variant="v">{{ v }}</EduButton>
      </div>
      <div class="dev-row">
        <EduButton v-for="s in sizes" :key="s" :size="s">tamaño {{ s }}</EduButton>
        <EduButton :loading="true">Cargando…</EduButton>
        <EduButton :disabled="true">Disabled</EduButton>
      </div>
      <div class="dev-row dev-row--narrow">
        <EduButton size="lg-mobile" variant="primary">CTA mobile</EduButton>
      </div>
    </section>

    <section class="dev-section">
      <h2>Inputs · Select · Textarea</h2>
      <div class="dev-grid">
        <EduInput v-model="text"     label="Correo electrónico" required placeholder="correo@colegio.edu.pe" />
        <EduInput v-model="password" label="Contraseña" type="password" placeholder="••••••" required />
        <EduInput
          v-model="text"
          label="Con error"
          error="Este campo es obligatorio."
          placeholder="Texto inválido"
        />
        <EduSelect v-model="select" label="Categoría" :options="selectOptions" required placeholder="Selecciona…" />
        <EduTextarea
          v-model="message"
          label="Descripción del problema"
          helper="Detalla lo que está fallando."
          :maxlength="160"
          required
        />
      </div>
    </section>

    <section class="dev-section">
      <h2>Cards · Badges · Spinner</h2>
      <div class="dev-grid dev-grid--3">
        <EduCard>
          <template #header><strong>Card simple</strong></template>
          Esto es una EduCard con slot de header y body por defecto.
        </EduCard>
        <EduCard>
          <strong>Sin header</strong>
          <p style="margin: 6px 0 0; color: var(--color-text-secondary); font-size: 14px;">Card con contenido directo.</p>
        </EduCard>
        <EduCard>
          <strong>Con badges</strong>
          <div class="dev-row dev-row--tight">
            <EduBadge v-for="b in badges" :key="b" :variant="b">{{ b }}</EduBadge>
          </div>
        </EduCard>
      </div>

      <div class="dev-row" style="align-items: center;">
        <EduSpinner size="sm" /> sm
        <EduSpinner size="md" /> md
        <EduSpinner size="lg" /> lg
      </div>
    </section>

    <section class="dev-section">
      <h2>Skeleton loaders</h2>
      <div class="dev-grid dev-grid--3">
        <div>
          <SkeletonLoader shape="circle" width="56px" />
          <SkeletonLoader width="160px" height="14px" style="margin-top: 8px" />
          <SkeletonLoader width="100px" height="12px" style="margin-top: 4px" />
        </div>
        <div>
          <SkeletonLoader v-for="n in 4" :key="n" width="100%" height="14px" style="margin-bottom: 8px" />
        </div>
        <SkeletonLoader width="100%" height="100px" />
      </div>
    </section>

    <section class="dev-section">
      <h2>Empty state</h2>
      <EduCard>
        <EmptyState
          title="Sin activos registrados"
          description="Aún no hay activos en esta institución. Comienza registrando el primero."
        >
          <template #action>
            <EduButton variant="primary">+ Registrar activo</EduButton>
          </template>
        </EmptyState>
      </EduCard>
    </section>

    <section class="dev-section">
      <h2>Toast & Modal</h2>
      <div class="dev-row">
        <EduButton variant="primary"   @click="toast.success('Operación completada correctamente.', { title: 'Éxito' })">Toast success</EduButton>
        <EduButton variant="secondary" @click="toast.info('Información relevante para el usuario.', { title: 'Info' })">Toast info</EduButton>
        <EduButton variant="danger"    @click="toast.danger('Algo salió mal al guardar.', { title: 'Error' })">Toast danger</EduButton>
        <EduButton variant="outline-gray" @click="toast.warning('Revisa los campos antes de continuar.')">Toast warning</EduButton>
        <EduButton @click="modalOpen = true">Abrir modal</EduButton>
      </div>

      <EduModal v-model="modalOpen" title="Modal de prueba">
        <p>Este es un modal de tamaño medio. En mobile se transforma en bottom sheet.</p>
        <p style="margin-top: 12px; color: var(--color-text-secondary); font-size: 14px;">Presiona ESC, click fuera o el botón "Cancelar" para cerrarlo.</p>
        <template #footer>
          <EduButton variant="outline-gray" @click="modalOpen = false">Cancelar</EduButton>
          <EduButton variant="primary"      @click="modalOpen = false">Confirmar</EduButton>
        </template>
      </EduModal>
    </section>
  </div>
</template>

<style scoped>
.dev-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px 80px;
}
.dev-header { margin-bottom: 32px; }
.dev-h1 { font-size: 28px; font-weight: 700; color: var(--color-text-primary); margin: 0 0 4px; letter-spacing: -0.4px; }
.dev-subtitle { font-size: 14px; color: var(--color-text-secondary); margin: 0; }

.dev-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 20px;
}
.dev-section h2 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}
.dev-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}
.dev-row:last-child { margin-bottom: 0; }
.dev-row--tight { gap: 6px; margin-top: 8px; }
.dev-row--narrow { max-width: 320px; }

.dev-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.dev-grid--3 { grid-template-columns: repeat(3, 1fr); }
@media (max-width: 768px) {
  .dev-grid, .dev-grid--3 { grid-template-columns: 1fr; }
}
</style>
