<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUsuariosStore } from '@/stores/usuarios'
import { useToast }         from '@/composables/useToast'
import AppShell    from '@/components/layout/AppShell.vue'
import EduCard     from '@/components/ui/EduCard.vue'
import EduInput    from '@/components/ui/EduInput.vue'
import EduSelect   from '@/components/ui/EduSelect.vue'
import EduButton   from '@/components/ui/EduButton.vue'
import {
  ArrowLeftIcon,
  UserCircleIcon,
  KeyIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/vue/24/outline'

const router   = useRouter()
const route    = useRoute()
const usuarios = useUsuariosStore()
const { success, danger: toastError } = useToast()

const isEdit = computed(() => !!route.params.id)
const titulo = computed(() => isEdit.value ? 'Editar usuario' : 'Nuevo usuario')

const form = ref({
  nombre:   '',
  email:    '',
  rol:      'tecnico',
  password: '',
  password_confirm: '',
  activo:   true,
})
const errors = ref({})
const submitting = ref(false)

const rolOptions = [
  { value: 'tecnico',  label: 'Técnico (gestiona OTs y evidencias)' },
  { value: 'director', label: 'Director (vistas ejecutivas y proyección)' },
]

function validate() {
  const e = {}
  if (!form.value.nombre?.trim()) e.nombre = 'Indica el nombre'
  else if (form.value.nombre.trim().length < 3) e.nombre = 'Mínimo 3 caracteres'

  if (!form.value.email?.trim()) e.email = 'Indica el email'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email.trim()))
    e.email = 'Formato de email inválido'

  if (!form.value.rol) e.rol = 'Selecciona un rol'

  if (!isEdit.value) {
    if (!form.value.password) e.password = 'Indica una contraseña temporal'
    else if (form.value.password.length < 8) e.password = 'Mínimo 8 caracteres'
    if (form.value.password !== form.value.password_confirm)
      e.password_confirm = 'Las contraseñas no coinciden'
  }

  errors.value = e
  return Object.keys(e).length === 0
}

watch(() => form.value.nombre,   () => { if (errors.value.nombre)   validate() })
watch(() => form.value.email,    () => { if (errors.value.email)    validate() })
watch(() => form.value.password, () => { if (errors.value.password) validate() })
watch(() => form.value.password_confirm, () => { if (errors.value.password_confirm) validate() })

async function onSubmit() {
  if (!validate()) {
    toastError('Revisa los campos marcados')
    return
  }
  submitting.value = true
  try {
    if (isEdit.value) {
      const payload = {
        nombre: form.value.nombre.trim(),
        email:  form.value.email.trim(),
        rol:    form.value.rol,
        activo: form.value.activo,
      }
      await usuarios.update(route.params.id, payload)
      success('Usuario actualizado')
    } else {
      const payload = {
        nombre:   form.value.nombre.trim(),
        email:    form.value.email.trim(),
        rol:      form.value.rol,
        password: form.value.password,
      }
      await usuarios.create(payload)
      success('Usuario creado correctamente')
    }
    router.push('/coordinador/usuarios')
  } catch {
    toastError('No se pudo guardar el usuario')
  } finally {
    submitting.value = false
  }
}

function generarPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let pwd = ''
  for (let i = 0; i < 12; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length))
  form.value.password = pwd
  form.value.password_confirm = pwd
}

onMounted(async () => {
  if (usuarios.list.length === 0) await usuarios.fetchAll()
  if (isEdit.value) {
    const u = usuarios.list.find(x => x.id === route.params.id)
    if (u) {
      form.value.nombre = u.nombre
      form.value.email  = u.email
      form.value.rol    = u.rol
      form.value.activo = u.activo
    }
  }
})
</script>

<template>
  <AppShell>
    <button class="uf-back" type="button" @click="router.push('/coordinador/usuarios')">
      <ArrowLeftIcon class="uf-icon" />
      Usuarios
    </button>

    <header class="uf-header">
      <h1 class="uf-title">{{ titulo }}</h1>
      <p class="uf-subtitle">
        {{ isEdit ? 'Actualiza la información del usuario.' : 'Crea una cuenta para un técnico o director de tu institución.' }}
      </p>
    </header>

    <form @submit.prevent="onSubmit" class="uf-grid" novalidate>
      <div class="uf-main">
        <!-- Datos -->
        <EduCard>
          <template #header>
            <h2 class="uf-section-title">
              <UserCircleIcon class="uf-icon" />
              Datos del usuario
            </h2>
          </template>

          <div class="uf-stack">
            <EduInput
              v-model="form.nombre"
              label="Nombre completo"
              placeholder="Ej. Luis Quispe"
              :error="errors.nombre"
              required
            />
            <EduInput
              v-model="form.email"
              type="email"
              label="Email institucional"
              placeholder="usuario@colegio.edu.pe"
              :error="errors.email"
              required
            />
            <EduSelect
              v-model="form.rol"
              label="Rol"
              :options="rolOptions"
              :error="errors.rol"
              required
            />
          </div>
        </EduCard>

        <!-- Contraseña (solo crear) -->
        <EduCard v-if="!isEdit">
          <template #header>
            <h2 class="uf-section-title">
              <KeyIcon class="uf-icon" />
              Contraseña temporal
            </h2>
          </template>

          <p class="uf-help">
            El usuario podrá cambiarla en su primer ingreso desde su perfil.
          </p>

          <div class="uf-stack">
            <div class="uf-password-row">
              <EduInput
                v-model="form.password"
                type="text"
                label="Contraseña"
                placeholder="Mínimo 8 caracteres"
                :error="errors.password"
                required
              />
              <EduButton variant="outline-gray" size="md" @click="generarPassword">
                Generar
              </EduButton>
            </div>
            <EduInput
              v-model="form.password_confirm"
              type="text"
              label="Confirmar contraseña"
              placeholder="Vuelve a escribir la contraseña"
              :error="errors.password_confirm"
              required
            />
          </div>
        </EduCard>

        <!-- Estado (solo editar) -->
        <EduCard v-if="isEdit">
          <template #header>
            <h2 class="uf-section-title">
              <ShieldCheckIcon class="uf-icon" />
              Estado de la cuenta
            </h2>
          </template>

          <label class="uf-toggle">
            <input v-model="form.activo" type="checkbox" class="uf-toggle-input" />
            <span :class="['uf-toggle-switch', { 'uf-toggle-switch--on': form.activo }]">
              <span class="uf-toggle-thumb" />
            </span>
            <div>
              <p class="uf-toggle-label">{{ form.activo ? 'Usuario activo' : 'Usuario inactivo' }}</p>
              <p class="uf-toggle-help">
                {{ form.activo ? 'El usuario puede iniciar sesión y recibir asignaciones.' : 'El usuario no podrá iniciar sesión hasta ser reactivado.' }}
              </p>
            </div>
          </label>
        </EduCard>
      </div>

      <!-- Sidebar -->
      <aside class="uf-sidebar">
        <EduCard padding="sm">
          <p class="uf-sidebar-title">Resumen</p>
          <ul class="uf-sidebar-list">
            <li>
              <span>Nombre</span>
              <strong>{{ form.nombre || '—' }}</strong>
            </li>
            <li>
              <span>Email</span>
              <strong>{{ form.email || '—' }}</strong>
            </li>
            <li>
              <span>Rol</span>
              <strong>{{ form.rol === 'tecnico' ? 'Técnico' : 'Director' }}</strong>
            </li>
          </ul>
        </EduCard>

        <div class="uf-actions">
          <EduButton variant="primary" type="submit" :loading="submitting" @click="onSubmit">
            <CheckCircleIcon class="uf-icon" />
            {{ isEdit ? 'Guardar cambios' : 'Crear usuario' }}
          </EduButton>
          <EduButton variant="outline-gray" @click="router.push('/coordinador/usuarios')">
            Cancelar
          </EduButton>
        </div>
      </aside>
    </form>
  </AppShell>
</template>

<style scoped>
.uf-back {
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
.uf-back:hover { color: var(--color-primary-hover); }
.uf-icon { width: 16px; height: 16px; flex-shrink: 0; }

.uf-header { margin-bottom: 24px; }
.uf-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--color-text-primary);
  margin: 0 0 6px;
}
.uf-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.uf-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  align-items: start;
}
@media (max-width: 980px) {
  .uf-grid { grid-template-columns: 1fr; }
}

.uf-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.uf-section-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.uf-help {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0 0 16px;
  padding: 10px 12px;
  background: var(--color-info-bg);
  border-radius: var(--radius-md);
  color: var(--color-info);
}

.uf-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.uf-password-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: end;
}

/* Toggle activo/inactivo */
.uf-toggle {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: var(--color-bg);
  border-radius: var(--radius-md);
  cursor: pointer;
}
.uf-toggle-input { position: absolute; opacity: 0; pointer-events: none; }
.uf-toggle-switch {
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
.uf-toggle-switch--on { background: var(--color-success); }
.uf-toggle-thumb {
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: white;
  transition: transform var(--transition-fast);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.uf-toggle-switch--on .uf-toggle-thumb { transform: translateX(20px); }

.uf-toggle-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}
.uf-toggle-help {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 2px 0 0;
}

/* Sidebar */
.uf-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 84px;
}
@media (max-width: 980px) {
  .uf-sidebar { position: static; }
}

.uf-sidebar-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--color-text-secondary);
  margin: 0 0 12px;
}
.uf-sidebar-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.uf-sidebar-list li {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.uf-sidebar-list span {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
}
.uf-sidebar-list strong {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  word-break: break-all;
}

.uf-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.uf-actions :deep(.edu-btn) { width: 100%; }
</style>
