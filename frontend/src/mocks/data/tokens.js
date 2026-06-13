// Tokens de API personales (coordinador y director).
// `token_partial` muestra solo prefijo + sufijo: el token completo solo se ve
// la vez que se genera (igual que GitHub PAT).

export const tokens = [
  {
    id: 'tok-001',
    user_id: 'u-001',
    nombre: 'Integración Power BI',
    token_partial: 'edu_pat_a1b2…f9z3',
    created_at: '2026-04-22',
    last_used_at: '2026-06-10',
  },
  {
    id: 'tok-002',
    user_id: 'u-001',
    nombre: 'Script de exportación nocturno',
    token_partial: 'edu_pat_c3d4…k7m1',
    created_at: '2026-05-15',
    last_used_at: null,
  },
]

export function makeToken() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let s = ''
  for (let i = 0; i < 32; i++) s += chars.charAt(Math.floor(Math.random() * chars.length))
  return `edu_pat_${s}`
}

export function partial(token) {
  return `${token.slice(0, 12)}…${token.slice(-4)}`
}
