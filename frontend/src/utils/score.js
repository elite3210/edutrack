export function getScoreVariant(score) {
  if (score >= 70) return 'success'
  if (score >= 40) return 'warning'
  return 'danger'
}

export function getScoreColor(score) {
  if (score >= 70) return 'var(--color-success)'
  if (score >= 40) return 'var(--color-warning)'
  return 'var(--color-danger)'
}

export function getScoreLabel(score) {
  if (score >= 70) return 'Saludable'
  if (score >= 40) return 'Atención'
  return 'Crítico'
}
