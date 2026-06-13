<script setup>
import { computed } from 'vue'
import { getEstado } from '@/utils/estadoOT'
import EduBadge from '@/components/ui/EduBadge.vue'

const props = defineProps({
  estado: { type: String, required: true },
  size:   { type: String, default: 'md' },
  showIcon: { type: Boolean, default: false },
})

const meta = computed(() => getEstado(props.estado))
</script>

<template>
  <EduBadge :variant="meta.variant" :size="size">
    <span v-if="showIcon" class="estado-badge-icon">{{ meta.icon }}</span>
    {{ meta.label }}
  </EduBadge>
</template>

<style scoped>
.estado-badge-icon { font-size: 0.95em; line-height: 1; }
</style>
