<script setup>
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

const iconMap = {
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  danger:  XCircleIcon,
  info:    InformationCircleIcon,
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          :class="['toast', `toast--${t.variant}`]"
          role="alert"
        >
          <component :is="iconMap[t.variant]" class="toast-icon" />
          <div class="toast-body">
            <p v-if="t.title" class="toast-title">{{ t.title }}</p>
            <p class="toast-message">{{ t.message }}</p>
          </div>
          <button class="toast-close" aria-label="Cerrar" @click="removeToast(t.id)">
            <XMarkIcon class="toast-close-icon" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}
.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left-width: 4px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  padding: 14px 16px;
  min-width: 320px;
  max-width: 420px;
  pointer-events: auto;
}
.toast--success { border-left-color: var(--color-success); }
.toast--success .toast-icon { color: var(--color-success); }
.toast--warning { border-left-color: var(--color-warning); }
.toast--warning .toast-icon { color: var(--color-warning); }
.toast--danger { border-left-color: var(--color-danger); }
.toast--danger .toast-icon { color: var(--color-danger); }
.toast--info { border-left-color: var(--color-info); }
.toast--info .toast-icon { color: var(--color-info); }

.toast-icon { width: 22px; height: 22px; flex-shrink: 0; }
.toast-body { flex: 1; min-width: 0; }
.toast-title { font-size: 14px; font-weight: 600; color: var(--color-text-primary); margin: 0 0 2px; }
.toast-message { font-size: 13px; color: var(--color-text-secondary); margin: 0; line-height: 1.4; word-wrap: break-word; }

.toast-close {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-secondary);
  flex-shrink: 0;
  transition: background var(--transition-fast);
}
.toast-close:hover { background: var(--color-bg); color: var(--color-text-primary); }
.toast-close-icon { width: 16px; height: 16px; }

.toast-enter-active, .toast-leave-active { transition: opacity 200ms, transform 200ms; }
.toast-enter-from { opacity: 0; transform: translateX(20px); }
.toast-leave-to   { opacity: 0; transform: translateX(20px); }

@media (max-width: 640px) {
  .toast-container {
    top:   max(12px, env(safe-area-inset-top));
    right: max(12px, env(safe-area-inset-right));
    left:  max(12px, env(safe-area-inset-left));
  }
  .toast { min-width: 0; max-width: none; }
}
</style>
