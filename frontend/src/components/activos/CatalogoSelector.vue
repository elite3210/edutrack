<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useCatalogoStore } from '@/stores/catalogo'
import EduSelect from '@/components/ui/EduSelect.vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({ marca: '', modelo_id: '' }) },
  disabled:   { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'modelo-seleccionado'])

const catalogo = useCatalogoStore()
const marca    = ref(props.modelValue.marca ?? '')
const modeloId = ref(props.modelValue.modelo_id ?? '')

const marcaOptions = computed(() =>
  catalogo.marcas.map(m => ({ value: m, label: m })),
)
const modeloOptions = computed(() =>
  catalogo.modelos.map(m => ({ value: m.id, label: m.modelo })),
)
const modeloSeleccionado = computed(() =>
  catalogo.modelos.find(m => m.id === modeloId.value) ?? null,
)

onMounted(async () => {
  if (catalogo.marcas.length === 0) await catalogo.fetchMarcas()
  if (marca.value) await catalogo.fetchModelosByMarca(marca.value)
})

watch(marca, async (nueva) => {
  modeloId.value = ''
  if (nueva) await catalogo.fetchModelosByMarca(nueva)
  else catalogo.modelos = []
  sync()
})

watch(modeloId, (id) => {
  const modelo = catalogo.modelos.find(m => m.id === id)
  emit('modelo-seleccionado', modelo)
  sync()
})

function sync() {
  emit('update:modelValue', { marca: marca.value, modelo_id: modeloId.value })
}
</script>

<template>
  <div class="catalogo-selector">
    <div class="catalogo-selects">
      <EduSelect
        v-model="marca"
        label="Marca"
        placeholder="Selecciona una marca"
        :options="marcaOptions"
        :disabled="disabled"
        required
      />
      <EduSelect
        v-model="modeloId"
        label="Modelo"
        :placeholder="marca ? 'Selecciona un modelo' : 'Primero elige la marca'"
        :options="modeloOptions"
        :disabled="disabled || !marca"
        required
      />
    </div>

    <div v-if="modeloSeleccionado" class="catalogo-preview">
      <div class="catalogo-preview-row">
        <span class="catalogo-preview-label">Categoría</span>
        <span class="catalogo-preview-value">{{ modeloSeleccionado.categoria }}</span>
      </div>
      <div class="catalogo-preview-row">
        <span class="catalogo-preview-label">Vida útil estimada</span>
        <span class="catalogo-preview-value">{{ modeloSeleccionado.vida_util_meses }} meses</span>
      </div>
      <div v-if="modeloSeleccionado.especificaciones" class="catalogo-preview-specs">
        <span class="catalogo-preview-label">Especificaciones</span>
        <ul class="catalogo-preview-spec-list">
          <li v-for="(value, key) in modeloSeleccionado.especificaciones" :key="key">
            <span>{{ key.replace(/_/g, ' ') }}</span>
            <strong>{{ value }}</strong>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.catalogo-selector {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.catalogo-selects {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 480px) {
  .catalogo-selects { grid-template-columns: 1fr; }
}
.catalogo-preview {
  background: var(--color-primary-light);
  border: 1px solid rgba(100,0,190,0.18);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.catalogo-preview-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}
.catalogo-preview-label {
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--color-primary);
}
.catalogo-preview-value {
  color: var(--color-text-primary);
  font-weight: 600;
  font-size: 13px;
}
.catalogo-preview-specs {
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px dashed rgba(100,0,190,0.2);
}
.catalogo-preview-spec-list {
  list-style: none;
  padding: 0;
  margin: 6px 0 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 12px;
}
.catalogo-preview-spec-list li {
  display: flex;
  flex-direction: column;
  font-size: 12px;
}
.catalogo-preview-spec-list li span {
  text-transform: capitalize;
  color: var(--color-text-secondary);
  font-size: 11px;
}
.catalogo-preview-spec-list li strong {
  color: var(--color-text-primary);
  font-weight: 600;
}
</style>
