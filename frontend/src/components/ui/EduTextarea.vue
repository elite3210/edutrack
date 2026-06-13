<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { default: '' },
  label:      { type: String, default: '' },
  helper:     { type: String, default: '' },
  error:      { type: String, default: '' },
  required:   { type: Boolean, default: false },
  placeholder:{ type: String, default: '' },
  disabled:   { type: Boolean, default: false },
  rows:       { type: Number, default: 4 },
  maxlength:  { type: Number, default: 0 },
})
const emit = defineEmits(['update:modelValue'])

const charCount = computed(() => (props.modelValue ?? '').length)
</script>

<template>
  <div class="field">
    <label v-if="label" class="field-label">
      <span v-if="required" class="field-required">*</span>
      {{ label }}
    </label>
    <p v-if="helper && !error" class="field-helper">{{ helper }}</p>
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      :maxlength="maxlength > 0 ? maxlength : undefined"
      :class="['field-textarea', { 'field-input--error': error, 'field-input--disabled': disabled }]"
      @input="emit('update:modelValue', $event.target.value)"
      v-bind="$attrs"
    />
    <div class="field-footer">
      <p v-if="error" class="field-error">⚠ {{ error }}</p>
      <p v-if="maxlength > 0" class="field-counter" :class="{ 'over': charCount > maxlength }">
        {{ charCount }} / {{ maxlength }}
      </p>
    </div>
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
.field-textarea {
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 16px;
  font-family: inherit;
  color: var(--color-text-primary);
  background: var(--color-surface);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  width: 100%;
  resize: vertical;
  min-height: 96px;
  line-height: 1.5;
}
.field-textarea::placeholder { color: var(--color-text-disabled); }
.field-textarea:focus { border-color: var(--color-border-focus); box-shadow: var(--shadow-ring); outline: none; border-width: 2px; }
.field-input--error { border-color: var(--color-danger); border-width: 2px; }
.field-input--disabled { background: var(--color-bg); color: var(--color-text-disabled); cursor: not-allowed; resize: none; }

.field-footer { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.field-error { font-size: 12px; color: var(--color-danger); margin: 0; }
.field-counter { font-size: 12px; color: var(--color-text-secondary); margin: 0; margin-left: auto; }
.field-counter.over { color: var(--color-danger); font-weight: 600; }
</style>
