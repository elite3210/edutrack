<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications'
import { getNotifMeta }          from '@/composables/useNotifMeta'
import AppShell    from '@/components/layout/AppShell.vue'
import MobileShell from '@/components/layout/MobileShell.vue'
import EduButton   from '@/components/ui/EduButton.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import { BellSlashIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const notifs = useNotificationsStore()

// ── Responsive shell ────────────────────────────────────────
const isMobile = ref(false)
function updateLayout() { isMobile.value = window.innerWidth < 768 }
onMounted(() => {
  updateLayout()
  window.addEventListener('resize', updateLayout)
  notifs.fetchAll()
})

const Shell = computed(() => isMobile.value ? MobileShell : AppShell)

// ── Filtro ──────────────────────────────────────────────────
const filtro = ref('todas')

const seccionNuevas     = computed(() => notifs.list.filter(n => !n.leida))
const seccionAnteriores = computed(() => notifs.list.filter(n => n.leida))

const hayItems = computed(() =>
  filtro.value === 'no_leidas'
    ? seccionNuevas.value.length > 0
    : notifs.list.length > 0
)

// ── Tiempo relativo ─────────────────────────────────────────
function timeAgo(fechaStr) {
  const diff = Date.now() - new Date(fechaStr).getTime()
  const min  = Math.floor(diff / 60000)
  if (min < 1)  return 'ahora'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24)   return `hace ${h}h`
  const d = Math.floor(h / 24)
  if (d === 1)  return 'ayer'
  if (d < 30)   return `hace ${d} días`
  return new Date(fechaStr).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
}

// ── Acciones ────────────────────────────────────────────────
async function onItemClick(n) {
  if (!n.leida) await notifs.marcarLeida(n.id)
  router.push(n.link)
}
</script>

<template>
  <!-- Desktop: title vacío para que AppShell no renderice su page-header -->
  <!-- Móvil: title para el header bar del MobileShell -->
  <component :is="Shell" :title="isMobile ? 'Notificaciones' : ''">
    <div class="nv-wrap">

      <!-- Desktop: header propio dentro de nv-wrap (mismo ancho que la lista) -->
      <div v-if="!isMobile" class="nv-page-header">
        <div class="nv-header-left">
          <h1 class="nv-title">Notificaciones</h1>
          <span v-if="notifs.totalNoLeidas > 0" class="nv-badge">
            {{ notifs.totalNoLeidas }} nueva{{ notifs.totalNoLeidas !== 1 ? 's' : '' }}
          </span>
        </div>
        <button
          v-if="notifs.totalNoLeidas > 0"
          class="nv-mark-all-btn"
          @click="notifs.marcarTodasLeidas()"
        >
          Marcar todas como leídas
        </button>
      </div>

      <!-- Móvil: badge + botón bajo el header bar -->
      <div v-if="isMobile && notifs.totalNoLeidas > 0" class="nv-mob-bar">
        <span class="nv-badge">
          {{ notifs.totalNoLeidas }} nueva{{ notifs.totalNoLeidas !== 1 ? 's' : '' }}
        </span>
        <button class="nv-mark-all-btn" @click="notifs.marcarTodasLeidas()">
          Marcar todas como leídas
        </button>
      </div>

      <!-- Tabs — segmented control -->
      <div class="nv-tabs" role="tablist">
        <button
          role="tab"
          :class="['nv-tab', { 'nv-tab--active': filtro === 'todas' }]"
          @click="filtro = 'todas'"
        >
          Todas
          <span class="nv-tab-count">{{ notifs.list.length }}</span>
        </button>
        <button
          role="tab"
          :class="['nv-tab', { 'nv-tab--active': filtro === 'no_leidas' }]"
          @click="filtro = 'no_leidas'"
        >
          No leídas
          <span class="nv-tab-count">{{ notifs.totalNoLeidas }}</span>
        </button>
      </div>

      <!-- Lista -->
      <div class="nv-list">

        <!-- Skeleton -->
        <template v-if="notifs.loading">
          <div v-for="i in 5" :key="i" class="nv-skeleton" :style="{ '--i': i }">
            <SkeletonLoader height="28px" width="28px" style="border-radius:6px;flex-shrink:0" />
            <div style="flex:1;display:flex;flex-direction:column;gap:8px">
              <SkeletonLoader height="13px" width="160px" />
              <SkeletonLoader height="12px" width="260px" />
            </div>
          </div>
        </template>

        <!-- Vacío global -->
        <div v-else-if="!hayItems" class="nv-empty">
          <BellSlashIcon class="nv-empty-icon" />
          <p class="nv-empty-title">
            {{ filtro === 'no_leidas' ? 'Todo al día' : 'Sin notificaciones' }}
          </p>
          <p class="nv-empty-sub">
            {{ filtro === 'no_leidas'
              ? 'No tienes notificaciones sin leer.'
              : 'Las notificaciones aparecerán aquí cuando haya actividad.' }}
          </p>
        </div>

        <!-- Items agrupados -->
        <template v-else>

          <!-- Tab: No leídas -->
          <template v-if="filtro === 'no_leidas'">
            <button
              v-for="(n, i) in seccionNuevas"
              :key="n.id"
              :style="{ '--i': i }"
              class="nv-item nv-item--unread"
              @click="onItemClick(n)"
            >
              <div :class="['nv-dot', `nv-dot--${getNotifMeta(n.tipo).color}`]">
                <component :is="getNotifMeta(n.tipo).icon" />
              </div>
              <div class="nv-body">
                <div class="nv-item-row">
                  <span class="nv-item-titulo">{{ n.titulo }}</span>
                  <span class="nv-item-time">{{ timeAgo(n.fecha) }}</span>
                </div>
                <p class="nv-item-mensaje">{{ n.mensaje }}</p>
                <p class="nv-item-actor">{{ n.actor }}</p>
              </div>
            </button>
          </template>

          <!-- Tab: Todas -->
          <template v-else>
            <!-- Sección: Nuevas -->
            <template v-if="seccionNuevas.length > 0">
              <div class="nv-section-head">
                <span>Nuevas</span>
              </div>
              <button
                v-for="(n, i) in seccionNuevas"
                :key="n.id"
                :style="{ '--i': i }"
                class="nv-item nv-item--unread"
                @click="onItemClick(n)"
              >
                <div :class="['nv-dot', `nv-dot--${getNotifMeta(n.tipo).color}`]">
                  <component :is="getNotifMeta(n.tipo).icon" />
                </div>
                <div class="nv-body">
                  <div class="nv-item-row">
                    <span class="nv-item-titulo">{{ n.titulo }}</span>
                    <span class="nv-item-time">{{ timeAgo(n.fecha) }}</span>
                  </div>
                  <p class="nv-item-mensaje">{{ n.mensaje }}</p>
                  <p class="nv-item-actor">{{ n.actor }}</p>
                </div>
              </button>
            </template>

            <!-- Sección: Anteriores -->
            <template v-if="seccionAnteriores.length > 0">
              <div class="nv-section-head" :class="{ 'nv-section-head--gap': seccionNuevas.length > 0 }">
                <span>Anteriores</span>
              </div>
              <button
                v-for="(n, i) in seccionAnteriores"
                :key="n.id"
                :style="{ '--i': seccionNuevas.length + i }"
                class="nv-item"
                @click="onItemClick(n)"
              >
                <div :class="['nv-dot', `nv-dot--${getNotifMeta(n.tipo).color}`]">
                  <component :is="getNotifMeta(n.tipo).icon" />
                </div>
                <div class="nv-body">
                  <div class="nv-item-row">
                    <span class="nv-item-titulo">{{ n.titulo }}</span>
                    <span class="nv-item-time">{{ timeAgo(n.fecha) }}</span>
                  </div>
                  <p class="nv-item-mensaje">{{ n.mensaje }}</p>
                  <p class="nv-item-actor">{{ n.actor }}</p>
                </div>
              </button>
            </template>
          </template>

        </template>
      </div>

    </div>
  </component>
</template>

<style scoped>
/* ── Wrapper ─────────────────────────────────────────────── */
.nv-wrap {
  max-width: 660px;
  margin: 0 auto;
}

/* ── Desktop page header (dentro del nv-wrap) ────────────── */
.nv-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.nv-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.nv-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1;
}

/* ── Mobile action bar ───────────────────────────────────── */
.nv-mob-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 16px;
}

/* ── Badge & mark-all ────────────────────────────────────── */
.nv-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 9999px;
  background: var(--color-primary);
  color: #fff;
  letter-spacing: 0.02em;
}
.nv-mark-all-btn {
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary);
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  white-space: nowrap;
  opacity: 0.8;
  transition: opacity 120ms;
}
.nv-mark-all-btn:hover { opacity: 1; text-decoration: underline; }

/* ── Tabs: segmented control ─────────────────────────────── */
.nv-tabs {
  display: flex;
  gap: 2px;
  margin-bottom: 24px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 3px;
  width: fit-content;
}
.nv-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 6px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background 120ms, color 120ms, box-shadow 120ms;
  font-family: inherit;
}
.nv-tab--active {
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px var(--color-border);
}
.nv-tab-count {
  font-size: 11px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--color-text-secondary) 10%, transparent);
  color: var(--color-text-secondary);
  transition: background 120ms, color 120ms;
}
.nv-tab--active .nv-tab-count {
  background: var(--color-primary);
  color: #fff;
}

/* ── Section headers ─────────────────────────────────────── */
.nv-section-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0 8px 3px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-secondary);
  opacity: 0.55;
}
.nv-section-head--gap { margin-top: 8px; }
.nv-section-head::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
  opacity: 0.7;
}

/* ── List container ──────────────────────────────────────── */
.nv-list {
  display: flex;
  flex-direction: column;
}

/* ── Skeleton rows ───────────────────────────────────────── */
.nv-skeleton {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0 14px 3px;
  border-bottom: 1px solid var(--color-border);
  animation: nv-in 200ms ease both;
  animation-delay: calc(var(--i, 0) * 60ms);
}

/* ── Empty state ─────────────────────────────────────────── */
.nv-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56px 24px;
  text-align: center;
}
.nv-empty-icon {
  width: 36px;
  height: 36px;
  color: var(--color-text-secondary);
  opacity: 0.3;
  margin-bottom: 14px;
}
.nv-empty-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 5px;
}
.nv-empty-sub {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 280px;
  line-height: 1.5;
}

/* ── Notification row ────────────────────────────────────── */
.nv-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 13px 8px 13px 3px;       /* 3px left = space for the accent border */
  border: none;
  border-bottom: 1px solid var(--color-border);
  border-left: 3px solid transparent;
  background: transparent;
  cursor: pointer;
  text-align: left;
  width: 100%;
  position: relative;
  transition: background 120ms ease;
  font-family: inherit;
  animation: nv-in 220ms ease both;
  animation-delay: calc(var(--i, 0) * 35ms);
}
.nv-item:last-child { border-bottom: none; }
.nv-item:hover { background: color-mix(in srgb, var(--color-primary) 3%, var(--color-surface)); }

.nv-item--unread {
  border-left-color: var(--color-primary);
}
.nv-item:not(.nv-item--unread) .nv-dot {
  filter: grayscale(0.55);
  opacity: 0.45;
}
.nv-item:not(.nv-item--unread) .nv-item-titulo {
  font-weight: 500;
  color: var(--color-text-secondary);
}

/* ── Icon ────────────────────────────────────────────────── */
.nv-dot {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
  transition: filter 120ms, opacity 120ms;
}
.nv-dot :deep(svg) { width: 14px; height: 14px; }
.nv-dot--primary { background: color-mix(in srgb, var(--color-primary) 12%, transparent); color: var(--color-primary); }
.nv-dot--success { background: color-mix(in srgb, var(--color-success) 12%, transparent); color: var(--color-success); }
.nv-dot--warning { background: color-mix(in srgb, var(--color-warning) 12%, transparent); color: var(--color-warning); }
.nv-dot--danger  { background: color-mix(in srgb, var(--color-danger)  12%, transparent); color: var(--color-danger); }
.nv-dot--info    { background: color-mix(in srgb, #3182CE 12%, transparent); color: #3182CE; }

/* ── Body text ───────────────────────────────────────────── */
.nv-body { flex: 1; min-width: 0; }
.nv-item-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 3px;
}
.nv-item-titulo {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}
.nv-item-time {
  font-size: 12px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
  opacity: 0.65;
  font-variant-numeric: tabular-nums;
}
.nv-item-mensaje {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0 0 4px;
  line-height: 1.45;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.nv-item-actor {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0;
  opacity: 0.6;
  font-weight: 500;
}

/* ── Animation ───────────────────────────────────────────── */
@keyframes nv-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Mobile ──────────────────────────────────────────────── */
@media (max-width: 767px) {
  .nv-item   { padding: 11px 4px 11px 3px; gap: 10px; }
  .nv-dot    { width: 26px; height: 26px; }
  .nv-dot :deep(svg) { width: 13px; height: 13px; }
}
</style>
