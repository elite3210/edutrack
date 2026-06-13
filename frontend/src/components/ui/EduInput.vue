<script setup>
const props = defineProps({
  modelValue: { default: '' },
  label:      { type: String, default: '' },
  helper:     { type: String, default: '' },
  error:      { type: String, default: '' },
  required:   { type: Boolean, default: false },
  type:       { type: String, default: 'text' },
  placeholder:{ type: String, default: '' },
  disabled:   { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="field">
    <label v-if="label" class="field-label">
      <span v-if="required" class="field-required">*</span>
      {{ label }}
    </label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="['field-input', { 'field-input--error': error, 'field-input--disabled': disabled }]"
      @input="emit('update:modelValue', $event.target.value)"
      v-bind="$attrs"
    />
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
.field-input {
  height: 44px;
  padding: 0 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 16px;
  font-family: inherit;
  color: var(--color-text-primary);
  background: var(--color-surface);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  width: 100%;
}
.field-input::placeholder { color: var(--color-text-disabled); }
.field-input:focus { border-color: var(--color-border-focus); box-shadow: var(--shadow-ring); outline: none; border-width: 2px; }
.field-input--error { border-color: var(--color-danger); border-width: 2px; }
.field-input--error:focus { box-shadow: 0 0 0 3px rgba(192,57,43,0.15); }
.field-input--disabled { background: var(--color-bg); color: var(--color-text-disabled); cursor: not-allowed; }
.field-error { font-size: 12px; color: var(--color-danger); margin: 0; }

@media (max-width: 768px) {
  .field-input { height: 52px; }
}
</style>
