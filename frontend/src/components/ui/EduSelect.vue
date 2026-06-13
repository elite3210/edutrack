<script setup>
import { computed } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: { default: '' },
  label:      { type: String, default: '' },
  helper:     { type: String, default: '' },
  error:      { type: String, default: '' },
  required:   { type: Boolean, default: false },
  disabled:   { type: Boolean, default: false },
  placeholder:{ type: String, default: 'Selecciona una opción' },
  options:    { type: Array, default: () => [] }, // [{ value, label }] o strings
})
const emit = defineEmits(['update:modelValue'])

const normalizedOptions = computed(() =>
  props.options.map(o => typeof o === 'string' ? { value: o, label: o } : o)
)
</script>

<template>
  <div class="field">
    <label v-if="label" class="field-label">
      <span v-if="required" class="field-required">*</span>
      {{ label }}
    </label>
    <div class="select-wrapper">
      <select
        :value="modelValue"
        :disabled="disabled"
        :class="['field-input', 'field-select', { 'field-input--error': error, 'field-input--disabled': disabled }]"
        @change="emit('update:modelValue', $event.target.value)"
        v-bind="$attrs"
      >
        <option value="" disabled>{{ placeholder }}</option>
        <option v-for="opt in normalizedOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <ChevronDownIcon class="select-icon" />
    </div>
    <p v-if="helper && !error" class="field-helper">{{ helper }}</p>
    <p v-if="error" class="field-error">⚠ {{ error }}</p>
  </div>
</template>

<style scoped>
.field { display: flex; flex-direction: column; gap: 4px; }
.field-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 4px;
}
.field-required { color: var(--color-danger); font-weight: 700; }
.field-helper { font-size: 12px; color: var(--color-text-secondary); margin: 0 0 2px; }

.select-wrapper { position: relative; }
.field-input {
  height: 44px;
  padding: 0 40px 0 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 16px;
  font-family: inherit;
  color: var(--color-text-primary);
  background: var(--color-surface);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  width: 100%;
  appearance: none;
  cursor: pointer;
}
.field-input:focus { border-color: var(--color-border-focus); box-shadow: var(--shadow-ring); outline: none; border-width: 2px; }
.field-input--error { border-color: var(--color-danger); border-width: 2px; }
.field-input--disabled { background: var(--color-bg); color: var(--color-text-disabled); cursor: not-allowed; }

.select-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--color-text-secondary);
  pointer-events: none;
}
.field-error { font-size: 12px; color: var(--color-danger); margin: 0; }

@media (max-width: 768px) {
  .field-input { height: 52px; }
}
</style>
