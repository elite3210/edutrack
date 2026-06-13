<script setup>
import { ref, computed, watchEffect } from 'vue'
import QRCode from 'qrcode'
import { ArrowDownTrayIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/vue/24/outline'
import EduButton from '@/components/ui/EduButton.vue'

const props = defineProps({
  codigo: { type: String, required: true },
  size:   { type: Number, default: 160 },
})

const base   = import.meta.env.VITE_PUBLIC_URL || window.location.origin
const qrUrl  = computed(() => `${base}/qr/${props.codigo}`)
const dataUrl = ref('')

watchEffect(async () => {
  dataUrl.value = await QRCode.toDataURL(qrUrl.value, {
    width:  300,
    margin: 2,
    color:  { dark: '#1A1A2E', light: '#FFFFFF' },
  })
})

const copied = ref(false)
function copyCode() {
  navigator.clipboard?.writeText(props.codigo)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}

function downloadPng() {
  const link = document.createElement('a')
  link.download = `${props.codigo}.png`
  link.href = dataUrl.value
  link.click()
}
</script>

<template>
  <div class="qr">
    <div class="qr-frame" :style="{ width: `${size}px`, height: `${size}px` }">
      <img v-if="dataUrl" :src="dataUrl" :alt="`QR ${codigo}`" class="qr-img" />
      <div v-else class="qr-placeholder" />
    </div>

    <div class="qr-code-row">
      <code class="qr-code">{{ codigo }}</code>
      <button class="qr-copy" type="button" :aria-label="copied ? 'Copiado' : 'Copiar código'" @click="copyCode">
        <CheckIcon v-if="copied" class="qr-copy-icon" />
        <ClipboardDocumentIcon v-else class="qr-copy-icon" />
      </button>
    </div>

    <p class="qr-url">{{ qrUrl }}</p>

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
  display: flex;
  align-items: center;
  justify-content: center;
}
.qr-img {
  width: 100%;
  height: 100%;
  display: block;
  image-rendering: pixelated;
}
.qr-placeholder {
  width: 80%;
  height: 80%;
  background: var(--color-bg);
  border-radius: 4px;
  animation: pulse 1.2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
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

.qr-url {
  font-size: 10px;
  color: var(--color-text-secondary);
  margin: 0;
  text-align: center;
  word-break: break-all;
  max-width: 180px;
  line-height: 1.4;
}

.qr-download-icon { width: 14px; height: 14px; margin-right: 4px; }
</style>
