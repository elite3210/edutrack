<script setup>
defineProps({
  label:   { type: String, required: true },
  value:   { type: [String, Number], required: true },
  icon:    { type: Object, default: null },
  variant: { type: String, default: 'default' }, // default, success, warning, danger, primary
  helper:  { type: String, default: '' },
  to:      { type: [String, Object], default: null },
})
</script>

<template>
  <component
    :is="to ? 'router-link' : 'div'"
    :to="to"
    :class="['metric-card', `metric-card--${variant}`, { 'metric-card--linked': to }]"
  >
    <div class="metric-card-top">
      <span class="metric-card-label">{{ label }}</span>
      <span v-if="icon" class="metric-card-icon">
        <component :is="icon" />
      </span>
    </div>
    <div class="metric-card-value">{{ value }}</div>
    <p v-if="helper" class="metric-card-helper">{{ helper }}</p>
  </component>
</template>

<style scoped>
.metric-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px 22px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  text-decoration: none;
  overflow: hidden;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
}
.metric-card--linked {
  cursor: pointer;
}
.metric-card--linked:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}
.metric-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: var(--color-border);
  transition: background var(--transition-fast);
}
.metric-card--primary::before { background: var(--color-primary); }
.metric-card--success::before { background: var(--color-success); }
.metric-card--warning::before { background: var(--color-warning); }
.metric-card--danger::before  { background: var(--color-danger);  }
.metric-card--info::before    { background: var(--color-info);    }

.metric-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.metric-card-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
}
.metric-card-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
}
.metric-card-icon :deep(svg) {
  width: 18px;
  height: 18px;
  color: var(--color-text-secondary);
}
.metric-card--primary .metric-card-icon { background: var(--color-primary-light); }
.metric-card--primary .metric-card-icon :deep(svg) { color: var(--color-primary); }
.metric-card--success .metric-card-icon { background: var(--color-success-bg); }
.metric-card--success .metric-card-icon :deep(svg) { color: var(--color-success); }
.metric-card--warning .metric-card-icon { background: var(--color-warning-bg); }
.metric-card--warning .metric-card-icon :deep(svg) { color: var(--color-warning); }
.metric-card--danger .metric-card-icon { background: var(--color-danger-bg); }
.metric-card--danger .metric-card-icon :deep(svg) { color: var(--color-danger); }
.metric-card--info .metric-card-icon { background: var(--color-info-bg); }
.metric-card--info .metric-card-icon :deep(svg) { color: var(--color-info); }

.metric-card-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.6px;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}
.metric-card-helper {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0;
}
</style>
