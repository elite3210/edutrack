<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Bars3Icon, BellIcon } from '@heroicons/vue/24/outline'
import { useAuthStore }          from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { getNotifMeta }          from '@/composables/useNotifMeta'
import logoTexto from '@/assets/img/logo-texto.png'
import logoIcon  from '@/assets/img/logo.png'

defineProps({
  title: { type: String, default: '' },
})

const emit  = defineEmits(['toggle-drawer'])
const router = useRouter()
const auth   = useAuthStore()
const notifs = useNotificationsStore()

onMounted(() => { if (notifs.list.length === 0) notifs.fetchAll() })

// ── Dropdown ───────────────────────────────────────────────
const open = ref(false)

async function toggleNotif() {
  open.value = !open.value
  if (open.value && notifs.list.length === 0) await notifs.fetchAll()
}

function close() { open.value = false }

const top5 = computed(() => {
  const unread = notifs.list.filter(n => !n.leida)
  const read   = notifs.list.filter(n => n.leida)
  return [...unread, ...read].slice(0, 5)
})

function timeAgo(fechaStr) {
  const diff = Date.now() - new Date(fechaStr).getTime()
  const min  = Math.floor(diff / 60000)
  if (min < 1)   return 'ahora'
  if (min < 60)  return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24)    return `hace ${h}h`
  const d = Math.floor(h / 24)
  if (d === 1)   return 'ayer'
  if (d < 30)    return `hace ${d} días`
  return new Date(fechaStr).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
}

async function onNotifClick(n) {
  if (!n.leida) await notifs.marcarLeida(n.id)
  close()
  router.push(n.link)
}
</script>

<template>
  <header class="mobile-header safe-top">
    <button class="mobile-header-btn" aria-label="Abrir menú" @click="emit('toggle-drawer')">
      <Bars3Icon class="icon-lg" />
    </button>

    <div class="mobile-header-brand">
      <img :src="logoIcon" alt="EduTrack AI" class="mobile-header-logo-img" />
      <span v-if="title" class="mobile-header-title">{{ title }}</span>
      <img v-else :src="logoTexto" alt="EduTrack AI" class="mobile-header-logo-texto" />
    </div>

    <div class="notif-wrap">
      <button class="mobile-header-btn" aria-label="Notificaciones" @click="toggleNotif">
        <BellIcon class="icon-lg" />
        <span v-if="notifs.totalNoLeidas > 0" class="mobile-badge">
          {{ notifs.totalNoLeidas > 9 ? '9+' : notifs.totalNoLeidas }}
        </span>
      </button>

      <Transition name="notif-drop">
        <div v-if="open" class="notif-panel" v-click-outside="close">

          <div class="notif-panel-header">
            <span class="notif-panel-title">Notificaciones</span>
          </div>

          <div v-if="notifs.loading" class="notif-panel-empty">Cargando…</div>
          <div v-else-if="top5.length === 0" class="notif-panel-empty">
            Sin notificaciones
          </div>
          <ul v-else class="notif-panel-list">
            <template v-for="(n, i) in top5" :key="n.id">
              <!-- Separador antes del primer item leído -->
              <li
                v-if="n.leida && (i === 0 || !top5[i - 1].leida)"
                class="notif-sep"
              >
                <span>Anteriores</span>
              </li>
              <li
                :class="['notif-panel-item', { 'notif-panel-item--unread': !n.leida }]"
                @click="onNotifClick(n)"
              >
                <div :class="['notif-dot', `notif-dot--${getNotifMeta(n.tipo).color}`]">
                  <component :is="getNotifMeta(n.tipo).icon" />
                </div>
                <div class="notif-body">
                  <div class="notif-item-row">
                    <p class="notif-titulo">{{ n.titulo }}</p>
                    <span class="notif-time">{{ timeAgo(n.fecha) }}</span>
                  </div>
                  <p class="notif-mensaje">{{ n.mensaje }}</p>
                </div>
              </li>
            </template>
          </ul>

          <div v-if="notifs.totalNoLeidas > 0" class="notif-panel-actions">
            <button class="notif-action-link" @click="notifs.marcarTodasLeidas()">
              Marcar todas como leídas
            </button>
          </div>

          <RouterLink to="/notificaciones" class="notif-panel-footer" @click="close">
            Ver todas las notificaciones
          </RouterLink>
        </div>
      </Transition>
    </div>
  </header>
</template>

<style scoped>
.mobile-header {
  position: sticky;
  top: 0;
  z-index: 90;
  height: 56px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
}
.mobile-header-btn {
  position: relative;
  width: 48px;
  height: 48px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-primary);
  transition: background var(--transition-fast);
  flex-shrink: 0;
}
.mobile-header-btn:active { background: var(--color-bg); }

.mobile-header-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
  min-width: 0;
}
.mobile-header-logo-img {
  height: 28px;
  width: auto;
  object-fit: contain;
  display: block;
  flex-shrink: 0;
}
.mobile-header-logo-texto {
  height: 18px;
  width: auto;
  object-fit: contain;
  display: block;
}
.mobile-header-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Notification dropdown ─────────────────────────────────── */
.notif-wrap {
  position: relative;
  flex-shrink: 0;
}

.notif-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: min(320px, calc(100vw - 24px));
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.12), 0 3px 10px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03);
  overflow: hidden;
  z-index: 200;
}

.notif-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 14px;
  border-bottom: 1px solid var(--color-border);
}
.notif-panel-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-secondary);
  opacity: 0.7;
}
.notif-panel-count {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 9999px;
  background: var(--color-primary);
  color: #fff;
  letter-spacing: 0.02em;
}

.notif-panel-empty {
  padding: 22px 14px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
  opacity: 0.7;
}

.notif-panel-list {
  list-style: none;
  padding: 4px 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
}

/* Section separator */
.notif-sep {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px 4px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-secondary);
  opacity: 0.5;
  list-style: none;
}
.notif-sep::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.notif-panel-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 11px 14px 11px 11px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: background 100ms ease;
  list-style: none;
}
.notif-panel-item:hover { background: color-mix(in srgb, var(--color-primary) 4%, var(--color-surface)); }
.notif-panel-item--unread { border-left-color: var(--color-primary); }
.notif-panel-item--unread .notif-titulo { font-weight: 500; color: var(--color-text-primary); }
.notif-panel-item:not(.notif-panel-item--unread) .notif-dot { filter: grayscale(0.5); opacity: 0.4; }
.notif-panel-item:not(.notif-panel-item--unread) .notif-titulo { color: var(--color-text-secondary); font-weight: 400; }

.notif-dot {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
  transition: filter 100ms, opacity 100ms;
}
.notif-dot :deep(svg) { width: 13px; height: 13px; }
.notif-dot--primary { background: color-mix(in srgb, var(--color-primary) 12%, transparent); color: var(--color-primary); }
.notif-dot--success { background: color-mix(in srgb, var(--color-success) 12%, transparent); color: var(--color-success); }
.notif-dot--warning { background: color-mix(in srgb, var(--color-warning) 12%, transparent); color: var(--color-warning); }
.notif-dot--danger  { background: color-mix(in srgb, var(--color-danger)  12%, transparent); color: var(--color-danger); }
.notif-dot--info    { background: color-mix(in srgb, #3182CE 12%, transparent); color: #3182CE; }

.notif-body { flex: 1; min-width: 0; }
.notif-item-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 2px;
}
.notif-titulo {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.35;
}
.notif-time {
  font-size: 12px;
  color: var(--color-text-secondary);
  opacity: 0.6;
  white-space: nowrap;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.notif-mensaje {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.75;
}

.notif-panel-actions {
  padding: 7px 14px;
  border-top: 1px solid var(--color-border);
}
.notif-action-link {
  border: none;
  background: transparent;
  font-size: 12px;
  color: var(--color-primary);
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  opacity: 0.85;
}
.notif-action-link:hover { opacity: 1; text-decoration: underline; }

.notif-panel-footer {
  display: block;
  padding: 11px 14px;
  border-top: 1px solid var(--color-border);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-primary);
  text-align: center;
  text-decoration: none;
  background: color-mix(in srgb, var(--color-primary) 3%, var(--color-surface));
  transition: background var(--transition-fast);
}
.notif-panel-footer:hover { background: color-mix(in srgb, var(--color-primary) 8%, var(--color-surface)); }

.notif-drop-enter-active,
.notif-drop-leave-active { transition: opacity 160ms, transform 160ms cubic-bezier(0.2, 0, 0, 1); }
.notif-drop-enter-from,
.notif-drop-leave-to { opacity: 0; transform: translateY(-6px) scale(0.98); }

.mobile-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 18px;
  height: 18px;
  background: var(--color-danger);
  color: #fff;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}
.icon-lg { width: 26px; height: 26px; }
</style>
