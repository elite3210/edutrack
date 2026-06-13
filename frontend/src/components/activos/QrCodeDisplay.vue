<script setup>
import { computed, ref } from 'vue'
import { ArrowDownTrayIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/vue/24/outline'
import EduButton from '@/components/ui/EduButton.vue'

const props = defineProps({
  codigo: { type: String, required: true },
  size:   { type: Number, default: 160 },
})

// Patrón visual mockup determinístico (no es un QR real, pero se ve como uno)
const GRID = 21
const cells = computed(() => {
  const seed = props.codigo.split('').reduce((acc, ch, i) => acc + ch.charCodeAt(0) * (i + 1), 7)
  const grid = []
  let s = seed
  for (let i = 0; i < GRID * GRID; i++) {
    s = (s * 9301 + 49297) % 233280
    grid.push((s % 100) < 48)
  }
  // 3 cuadros de posicionamiento (finder patterns) - típico de QR
  const isFinder = (x, y) =>
    (x < 7 && y < 7) ||
    (x >= GRID - 7 && y < 7) ||
    (x < 7 && y >= GRID - 7)
  return grid.map((v, i) => {
    const x = i % GRID
    const y = Math.floor(i / GRID)
    if (isFinder(x, y)) {
      const fx = x % 7
      const fy = y % 7
      const ofx = x < 7 ? fx : (GRID - 1 - x) % 7 === 0 ? 6 : (6 - (GRID - 1 - x))
      // sólido: borde + centro 3x3
      const inBorder = fx === 0 || fx === 6 || fy === 0 || fy === 6
      const inCenter = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4
      return inBorder || inCenter
    }
    return v
  })
})

const copied = ref(false)
function copyCode() {
  navigator.clipboard?.writeText(props.codigo)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}

function downloadPng() {
  const cellSize = 10
  const padding  = 20
  const total    = GRID * cellSize + padding * 2
  const canvas   = document.createElement('canvas')
  canvas.width   = total
  canvas.height  = total
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, total, total)
  ctx.fillStyle = '#1A1A2E'
  cells.value.forEach((v, i) => {
    if (!v) return
    const x = (i % GRID) * cellSize + padding
    const y = Math.floor(i / GRID) * cellSize + padding
    ctx.fillRect(x, y, cellSize, cellSize)
  })
  const link = document.createElement('a')
  link.download = `${props.codigo}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
</script>

<template>
  <div class="qr">
    <div class="qr-frame" :style="{ width: `${size}px`, height: `${size}px` }">
      <svg :viewBox="`0 0 ${GRID} ${GRID}`" class="qr-svg">
        <rect width="100%" height="100%" fill="#fff" />
        <template v-for="(on, i) in cells" :key="i">
          <rect
            v-if="on"
            :x="i % GRID"
            :y="Math.floor(i / GRID)"
            width="1"
            height="1"
            fill="#1A1A2E"
          />
        </template>
      </svg>
    </div>
    <div class="qr-code-row">
      <code class="qr-code">{{ codigo }}</code>
      <button class="qr-copy" type="button" :aria-label="copied ? 'Copiado' : 'Copiar código'" @click="copyCode">
        <CheckIcon v-if="copied" class="qr-copy-icon" />
        <ClipboardDocumentIcon v-else class="qr-copy-icon" />
      </button>
    </div>
    <EduButton variant="outline-gray" size="sm" @click="downloadPng">
      <ArrowDownTrayIcon class="qr-download-icon" />
      Descargar PNG
    </EduButton>
  </div>
</template>

<style scoped>
.qr {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}
.qr-frame {
  background: #fff;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
}
.qr-svg {
  display: block;
  width: 100%;
  height: 100%;
}
.qr-code-row {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-bg);
  border-radius: 6px;
  padding: 4px 6px 4px 10px;
}
.qr-code {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  color: var(--color-text-primary);
  font-weight: 600;
  letter-spacing: 0.5px;
}
.qr-copy {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  transition: background var(--transition-fast), color var(--transition-fast);
}
.qr-copy:hover { background: var(--color-primary-light); color: var(--color-primary); }
.qr-copy-icon { width: 14px; height: 14px; }
.qr-download-icon { width: 14px; height: 14px; margin-right: 4px; }
</style>
