<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import * as adminApi from '@/api/admin.api'
import { useToast } from '@/composables/useToast'
import AppShell  from '@/components/layout/AppShell.vue'
import EduCard   from '@/components/ui/EduCard.vue'
import EduInput  from '@/components/ui/EduInput.vue'
import EduButton from '@/components/ui/EduButton.vue'
import EduTextarea from '@/components/ui/EduTextarea.vue'
import {
  ArrowLeftIcon,
  BuildingOffice2Icon,
  UserCircleIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route  = useRoute()
const { success, danger: toastError } = useToast()

const isEdit = computed(() => !!route.params.id)
const titulo = computed(() => isEdit.value ? 'Editar institución' : 'Nueva institución')

const form = ref({
  nombre_legal:   '',
  nombre_corto:   '',
  ruc:            '',
  email_contacto: '',
  telefono:       '',
  direccion:      '',
  activa:         true,
  coordinador_nombre: '',
  coordinador_email:  '',
})
const errors = ref({})
const submitting = ref(false)
const cargando = ref(false)

function validate() {
  const e = {}
  if (!form.value.nombre_legal?.trim()) e.nombre_legal = 'Indica el nombre legal'
  if (!form.value.nombre_corto?.trim()) e.nombre_corto = 'Indica el nombre corto'

  const ruc = (form.value.ruc ?? '').replace(/\D/g, '')
  if (!ruc) e.ruc = 'Indica el RUC'
  else if (!/^\d{11}$/.test(ruc)) e.ruc = 'El RUC debe tener 11 dígitos'

  if (!form.value.email_contacto?.trim()) e.email_contacto = 'Indica el email de contacto'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email_contacto.trim()))
    e.email_contacto = 'Email inválido'

  if (!form.value.telefono?.trim()) e.telefono = 'Indica el teléfono'
  if (!form.value.direccion?.trim()) e.direccion = 'Indica la dirección'

  if (!isEdit.value) {
    if (!form.value.coordinador_nombre?.trim()) e.coordinador_nombre = 'Indica el nombre del coordinador'
    if (!form.value.coordinador_email?.trim()) e.coordinador_email = 'Indica el email del coordinador'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.coordinador_email.trim()))
      e.coordinador_email = 'Email inválido'
  }

  errors.value = e
  return Object.keys(e).length === 0
}

watch(() => form.value.nombre_legal,   () => { if (errors.value.nombre_legal)   validate() })
watch(() => form.value.nombre_corto,   () => { if (errors.value.nombre_corto)   validate() })
watch(() => form.value.ruc,            () => { if (errors.value.ruc)            validate() })
watch(() => form.value.email_contacto, () => { if (errors.value.email_contacto) validate() })
watch(() => form.value.telefono,       () => { if (errors.value.telefono)       validate() })
watch(() => form.value.direccion,      () => { if (errors.value.direccion)      validate() })
watch(() => form.value.coordinador_email, () => { if (errors.value.coordinador_email) validate() })

async function onSubmit() {
  if (!validate()) {
    toastError('Revisa los campos marcados')
    return
  }
  submitting.value = true
  try {
    const payload = {
      nombre_legal:   form.value.nombre_legal.trim(),
      nombre_corto:   form.value.nombre_corto.trim(),
      ruc:            form.value.ruc.replace(/\D/g, ''),
      email_contacto: form.value.email_contacto.trim(),
      telefono:       form.value.telefono.trim(),
      direccion:      form.value.direccion.trim(),
      activa:         form.value.activa,
    }
    if (isEdit.value) {
      await adminApi.updateInstitucion(route.params.id, payload)
      success('Institución actualizada')
    } else {
      payload.coordinador_nombre = form.value.coordinador_nombre.trim()
      payload.coordinador_email  = form.value.coordinador_email.trim()
      await adminApi.createInstitucion(payload)
      success('Institución creada · cuenta de coordinador generada')
    }
    router.push('/admin/instituciones')
  } catch {
    toastError('No se pudo guardar la institución')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  if (!isEdit.value) return
  cargando.value = true
  try {
    const lista = await adminApi.getInstituciones()
    const i = lista.find(x => x.id === route.params.id)
    if (i) {
      form.value.nombre_legal   = i.nombre_legal
      form.value.nombre_corto   = i.nombre_corto
      form.value.ruc            = i.ruc
      form.value.email_contacto = i.email_contacto
      form.value.telefono       = i.telefono
      form.value.direccion      = i.direccion
      form.value.activa         = i.activa
      form.value.coordinador_nombre = i.coordinador_nombre
      form.value.coordinador_email  = i.coordinador_email
    }
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <AppShell>
    <button class="if-back" type="button" @click="router.push('/admin/instituciones')">
      <ArrowLeftIcon class="if-icon" />
      Instituciones
    </button>

    <header class="if-header">
      <h1 class="if-title">{{ titulo }}</h1>
      <p class="if-subtitle">
        {{ isEdit
          ? 'Actualiza los datos de la institución.'
          : 'Registra un nuevo colegio cliente. Al guardar se creará la cuenta del primer coordinador.' }}
      </p>
    </header>

    <form @submit.prevent="onSubmit" class="if-grid" novalidate>
      <div class="if-main">
        <!-- Datos institución -->
        <EduCard>
          <template #header>
            <h2 class="if-section-title">
              <BuildingOffice2Icon class="if-icon" />
              Datos de la institución
            </h2>
          </template>

          <div class="if-stack">
            <EduInput
              v-model="form.nombre_legal"
              label="Nombre legal"
              placeholder="Ej. Colegio San Agustín del Perú S.A.C."
              :error="errors.nombre_legal"
              required
            />
            <EduInput
              v-model="form.nombre_corto"
              label="Nombre corto"
              helper="Cómo se mostrará en la app"
              placeholder="Ej. San Agustín"
              :error="errors.nombre_corto"
              required
            />
            <div class="if-row">
              <EduInput
                v-model="form.ruc"
                label="RUC"
                placeholder="20512345678"
                :error="errors.ruc"
                required
              />
              <EduInput
                v-model="form.telefono"
                label="Teléfono"
                placeholder="+51 1 555-1234"
                :error="errors.telefono"
                required
              />
            </div>
            <EduInput
              v-model="form.email_contacto"
              type="email"
              label="Email de contacto"
              placeholder="contacto@institucion.edu.pe"
              :error="errors.email_contacto"
              required
            />
            <EduTextarea
              v-model="form.direccion"
              label="Dirección"
              :rows="2"
              placeholder="Av. Javier Prado 1500, San Isidro, Lima"
              :error="errors.direccion"
              required
            />
          </div>
        </EduCard>

        <!-- Primer coordinador (solo crear) -->
        <EduCard v-if="!isEdit">
          <template #header>
            <h2 class="if-section-title">
              <UserCircleIcon class="if-icon" />
              Primer coordinador
            </h2>
          </template>

          <p class="if-help">
            <InformationCircleIcon class="if-icon" />
            Se generará una cuenta de coordinador para esta institución con
            una contraseña temporal enviada por email.
          </p>

          <div class="if-stack">
            <EduInput
              v-model="form.coordinador_nombre"
              label="Nombre completo"
              placeholder="Ej. Ana García"
              :error="errors.coordinador_nombre"
              required
            />
            <EduInput
              v-model="form.coordinador_email"
              type="email"
              label="Email del coordinador"
              placeholder="coordinador@institucion.edu.pe"
              :error="errors.coordinador_email"
              required
            />
          </div>
        </EduCard>

        <!-- Estado (editar) -->
        <EduCard v-if="isEdit">
          <template #header>
            <h2 class="if-section-title">
              <ShieldCheckIcon class="if-icon" />
              Estado de la institución
            </h2>
          </template>

          <label class="if-toggle">
            <input v-model="form.activa" type="checkbox" class="if-toggle-input" />
            <span :class="['if-toggle-switch', { 'if-toggle-switch--on': form.activa }]">
              <span class="if-toggle-thumb" />
            </span>
            <div>
              <p class="if-toggle-label">{{ form.activa ? 'Institución activa' : 'Institución inactiva' }}</p>
              <p class="if-toggle-help">
                {{ form.activa
                  ? 'Sus usuarios pueden iniciar sesión y operar con normalidad.'
                  : 'Los usuarios no podrán iniciar sesión. Los datos se mantienen.' }}
              </p>
            </div>
          </label>
        </EduCard>
      </div>

      <!-- Sidebar -->
      <aside class="if-sidebar">
        <EduCard padding="sm">
          <p class="if-sidebar-title">Resumen</p>
          <ul class="if-sidebar-list">
            <li>
              <span>Institución</span>
              <strong>{{ form.nombre_corto || '—' }}</strong>
            </li>
            <li>
              <span>RUC</span>
              <strong class="if-mono">{{ form.ruc || '—' }}</strong>
            </li>
            <li>
              <span>Contacto</span>
              <strong>{{ form.email_contacto || '—' }}</strong>
            </li>
            <li v-if="!isEdit">
              <span>Coordinador</span>
              <strong>{{ form.coordinador_nombre || '—' }}</strong>
            </li>
          </ul>
        </EduCard>

        <div class="if-actions">
          <EduButton variant="primary" type="submit" :loading="submitting">
            <CheckCircleIcon class="if-icon" />
            {{ isEdit ? 'Guardar cambios' : 'Crear institución' }}
          </EduButton>
          <EduButton variant="outline-gray" @click="router.push('/admin/instituciones')">
            Cancelar
          </EduButton>
        </div>
      </aside>
    </form>
  </AppShell>
</template>

<style scoped>
.if-back {
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
.if-back:hover { color: var(--color-primary-hover); }
.if-icon { width: 16px; height: 16px; flex-shrink: 0; }

.if-header { margin-bottom: 24px; }
.if-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--color-text-primary);
  margin: 0 0 6px;
}
.if-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.if-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  align-items: start;
}
@media (max-width: 980px) { .if-grid { grid-template-columns: 1fr; } }

.if-main { display: flex; flex-direction: column; gap: 16px; }

.if-section-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}
.if-stack { display: flex; flex-direction: column; gap: 16px; }
.if-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 640px) { .if-row { grid-template-columns: 1fr; } }

.if-help {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 13px;
  color: var(--color-info);
  background: var(--color-info-bg);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  margin: 0 0 16px;
}

/* Toggle */
.if-toggle {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: var(--color-bg);
  border-radius: var(--radius-md);
  cursor: pointer;
  position: relative;
}
.if-toggle-input { position: absolute; opacity: 0; pointer-events: none; }
.if-toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 9999px;
  background: var(--color-border);
  flex-shrink: 0;
  transition: background var(--transition-fast);
  padding: 3px;
  display: inline-flex;
  align-items: center;
}
.if-toggle-switch--on { background: var(--color-success); }
.if-toggle-thumb {
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: white;
  transition: transform var(--transition-fast);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.if-toggle-switch--on .if-toggle-thumb { transform: translateX(20px); }
.if-toggle-label { font-size: 14px; font-weight: 600; color: var(--color-text-primary); margin: 0; }
.if-toggle-help  { font-size: 12px; color: var(--color-text-secondary); margin: 2px 0 0; }

/* Sidebar */
.if-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 84px;
}
@media (max-width: 980px) { .if-sidebar { position: static; } }

.if-sidebar-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--color-text-secondary);
  margin: 0 0 12px;
}
.if-sidebar-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.if-sidebar-list li {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.if-sidebar-list span {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
}
.if-sidebar-list strong {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  word-break: break-word;
}
.if-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }

.if-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.if-actions :deep(.edu-btn) { width: 100%; }
</style>
