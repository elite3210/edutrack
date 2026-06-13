<script setup>
import { computed, watch, ref } from 'vue'
import FotoCapture from './FotoCapture.vue'
import { CheckCircleIcon, PhotoIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: { type: Array, default: () => [] }, // File[]
  minFotos:   { type: Number, default: 2 },
  maxFotos:   { type: Number, default: 4 },
  labels:     { type: Array,  default: () => ['Foto del antes', 'Foto del después', 'Foto adicional 1', 'Foto adicional 2'] },
})
const emit = defineEmits(['update:modelValue'])

// Mantiene un slot por cada label hasta maxFotos
const slots = ref([])

function syncSlotsFromValue(val) {
  const newSlots = []
  for (let i = 0; i < props.maxFotos; i++) {
    newSlots.push(val?.[i] ?? null)
  }
  slots.value = newSlots
}
syncSlotsFromValue(props.modelValue)

watch(() => props.modelValue, syncSlotsFromValue, { deep: true })

function updateSlot(idx, file) {
  slots.value[idx] = file
  emit('update:modelValue', slots.value.filter(Boolean))
}

const fotosCargadas = computed(() => slots.value.filter(Boolean).length)
const cumpleMinimo  = computed(() => fotosCargadas.value >= props.minFotos)
const slotsVisibles = computed(() => {
  // Mostrar al menos minFotos slots y un extra mientras haya espacio hasta maxFotos
  const ocupados = fotosCargadas.value
  const base = Math.max(props.minFotos, ocupados + 1)
  return Math.min(base, props.maxFotos)
})
</script>

<template>
  <div class="evid">
    <header class="evid-header">
      <div class="evid-title">
        <PhotoIcon class="evid-icon" />
        <div>
          <p class="evid-title-text">Evidencias fotográficas</p>
          <p class="evid-help">Sube al menos {{ minFotos }} fotos del trabajo.</p>
        </div>
      </div>
      <div :class="['evid-counter', { 'evid-counter--ok': cumpleMinimo }]">
        <CheckCircleIcon v-if="cumpleMinimo" class="evid-counter-check" />
        <span>{{ fotosCargadas }} de {{ minFotos }}</span>
      </div>
    </header>

    <div class="evid-grid">
      <FotoCapture
        v-for="i in slotsVisibles"
        :key="i - 1"
        :model-value="slots[i - 1]"
        :label="labels[i - 1] ?? `Foto ${i}`"
        @update:model-value="(file) => updateSlot(i - 1, file)"
      />
    </div>
  </div>
</template>

<style scoped>
.evid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.evid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.evid-title { display: flex; gap: 10px; align-items: flex-start; }
.evid-icon {
  width: 22px; height: 22px;
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 2px;
}
.evid-title-text {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}
.evid-help {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 2px 0 0;
}
.evid-counter {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 9999px;
  background: var(--color-bg);
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}
.evid-counter--ok {
  background: var(--color-success-bg);
  color: var(--color-success);
}
.evid-counter-check { width: 14px; height: 14px; }

.evid-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
@media (max-width: 360px) {
  .evid-grid { grid-template-columns: 1fr; }
}
</style>
