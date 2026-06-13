<script setup>
import { computed } from 'vue'

const props = defineProps({
  columns: { type: Array, required: true },  // [{ key, label, width?, align? }]
  rows:    { type: Array, required: true },
  rowKey:  { type: String, default: 'id' },
  rowClass: { type: Function, default: null },  // (row) => string
  hover:   { type: Boolean, default: true },
})
const emit = defineEmits(['row-click'])

function handleClick(row) {
  emit('row-click', row)
}
const isClickable = computed(() => !!emit && props.hover)
</script>

<template>
  <div class="edu-table-wrap">
    <table class="edu-table">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :style="{ width: col.width, textAlign: col.align ?? 'left' }"
            class="edu-table-th"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row[rowKey]"
          :class="[
            'edu-table-tr',
            rowClass ? rowClass(row) : null,
            { 'edu-table-tr--clickable': isClickable }
          ]"
          @click="handleClick(row)"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            :style="{ textAlign: col.align ?? 'left' }"
            class="edu-table-td"
          >
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.edu-table-wrap {
  width: 100%;
  overflow-x: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.edu-table {
  width: 100%;
  border-collapse: collapse;
}
.edu-table-th {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
  padding: 12px 16px;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}
.edu-table-tr {
  border-bottom: 1px solid var(--color-border);
  transition: background var(--transition-fast);
}
.edu-table-tr:last-child {
  border-bottom: none;
}
.edu-table-tr--clickable {
  cursor: pointer;
}
.edu-table-tr--clickable:hover {
  background: var(--color-bg);
}
.edu-table-tr--critical {
  border-left: 3px solid var(--color-danger);
  background: rgba(192,57,43,0.025);
}
.edu-table-tr--critical:hover {
  background: rgba(192,57,43,0.05);
}
.edu-table-td {
  padding: 14px 16px;
  font-size: 14px;
  color: var(--color-text-primary);
  vertical-align: middle;
}

@media (max-width: 768px) {
  .edu-table-th, .edu-table-td {
    padding: 12px;
    font-size: 13px;
  }
}
</style>
