<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title:      { type: String, default: '' },
  size:       { type: String, default: 'md' }, // sm | md | lg
  closeOnBackdrop: { type: Boolean, default: true },
})
const emit = defineEmits(['update:modelValue'])

function close() { emit('update:modelValue', false) }

function onKeydown(e) {
  if (e.key === 'Escape' && props.modelValue) close()
}

watch(() => props.modelValue, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="closeOnBackdrop && close()">
        <div :class="['modal-dialog', `modal-dialog--${size}`]" role="dialog" aria-modal="true">
          <header v-if="title || $slots.header" class="modal-header">
            <slot name="header">
              <h2 class="modal-title">{{ title }}</h2>
            </slot>
            <button class="modal-close" type="button" aria-label="Cerrar" @click="close">
              <XMarkIcon class="modal-close-icon" />
            </button>
          </header>

          <div class="modal-body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 46, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  backdrop-filter: blur(2px);
}
.modal-dialog {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.modal-dialog--sm { max-width: 400px; }
.modal-dialog--md { max-width: 560px; }
.modal-dialog--lg { max-width: 800px; }

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}
.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}
.modal-close {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: background var(--transition-fast);
}
.modal-close:hover { background: var(--color-bg); color: var(--color-text-primary); }
.modal-close-icon { width: 20px; height: 20px; }

.modal-body { padding: 24px; overflow-y: auto; }
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg);
}

/* Transición */
.modal-enter-active, .modal-leave-active { transition: opacity 200ms; }
.modal-enter-active .modal-dialog, .modal-leave-active .modal-dialog { transition: transform 200ms; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-dialog, .modal-leave-to .modal-dialog { transform: scale(0.95); }

/* Mobile: bottom sheet */
@media (max-width: 640px) {
  .modal-overlay { padding: 0; align-items: flex-end; }
  .modal-dialog {
    max-width: 100% !important;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    max-height: 90vh;
  }
  .modal-enter-from .modal-dialog, .modal-leave-to .modal-dialog {
    transform: translateY(100%);
  }
}
</style>
