<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="not-found-code">404</div>
      <h1 class="not-found-title">Página no encontrada</h1>
      <p class="not-found-text">La página que buscas no existe o no tienes acceso a ella.</p>
      <button class="not-found-btn" @click="router.back()">← Volver atrás</button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: 24px;
}
.not-found-content { text-align: center; max-width: 400px; }
.not-found-code {
  font-size: 96px;
  font-weight: 700;
  color: var(--color-primary-light);
  line-height: 1;
  margin-bottom: 16px;
  letter-spacing: -4px;
}
.not-found-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 12px;
}
.not-found-text {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin: 0 0 32px;
  line-height: 1.6;
}
.not-found-btn {
  padding: 12px 24px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background var(--transition-fast);
}
.not-found-btn:hover { background: var(--color-primary-hover); }
</style>
