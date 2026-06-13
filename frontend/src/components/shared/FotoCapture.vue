<script setup>
import { ref, onUnmounted, watch } from 'vue'
import {
  CameraIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: { type: File, default: null },
  label:      { type: String, default: 'Tomar foto' },
})
const emit = defineEmits(['update:modelValue'])

const inputRef = ref(null)
const preview  = ref(null)

function abrirCamara() {
  inputRef.value?.click()
}

function onChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (preview.value) URL.revokeObjectURL(preview.value)
  preview.value = URL.createObjectURL(file)
  emit('update:modelValue', file)
}

function quitar() {
  if (preview.value) URL.revokeObjectURL(preview.value)
  preview.value = null
  if (inputRef.value) inputRef.value.value = ''
  emit('update:modelValue', null)
}

watch(() => props.modelValue, (val) => {
  if (!val && preview.value) {
    URL.revokeObjectURL(preview.value)
    preview.value = null
  }
})

onUnmounted(() => {
  if (preview.value) URL.revokeObjectURL(preview.value)
})
</script>

<template>
  <div class="foto">
    <input
      ref="inputRef"
      type="file"
      accept="image/*"
      class="foto-input"
      @change="onChange"
    />

    <!-- Sin foto -->
    <button
      v-if="!preview"
      type="button"
      class="foto-trigger"
      @click="abrirCamara"
    >
      <div class="foto-trigger-icon">
        <CameraIcon />
      </div>
      <p class="foto-trigger-text">{{ label }}</p>
      <p class="foto-trigger-help">Toca para abrir la cámara</p>
    </button>

    <!-- Preview -->
    <div v-else class="foto-preview">
      <img :src="preview" class="foto-img" alt="Evidencia fotográfica" />
      <div class="foto-actions">
        <button type="button" class="foto-action foto-action--retomar" @click="abrirCamara" aria-label="Retomar foto">
          <ArrowPathIcon />
        </button>
        <button type="button" class="foto-action foto-action--quitar" @click="quitar" aria-label="Quitar foto">
          <XMarkIcon />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.foto-input {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.foto-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  aspect-ratio: 4 / 3;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg);
  cursor: pointer;
  font-family: inherit;
  transition: border-color var(--transition-fast), background var(--transition-fast);
  min-height: 140px;
}
.foto-trigger:hover, .foto-trigger:focus-visible {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  outline: none;
}
.foto-trigger-icon {
  width: 48px;
  height: 48px;
  border-radius: 9999px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.foto-trigger-icon :deep(svg) { width: 22px; height: 22px; }
.foto-trigger-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 4px 0 0;
}
.foto-trigger-help {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0;
}

.foto-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 2px solid var(--color-success);
}
.foto-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.foto-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
}
.foto-action {
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  backdrop-filter: blur(4px);
}
.foto-action :deep(svg) { width: 18px; height: 18px; }
.foto-action--retomar { background: rgba(26, 26, 46, 0.65); }
.foto-action--quitar  { background: rgba(192, 57, 43, 0.85); }
.foto-action:active { transform: scale(0.95); }
</style>
