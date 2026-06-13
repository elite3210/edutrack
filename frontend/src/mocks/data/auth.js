// JWT dummy: payload codificado en base64 para simular tokens reales
function makeToken(payload) {
  const header  = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body    = btoa(JSON.stringify({ ...payload, exp: Date.now() / 1000 + 1800 }))
  return `${header}.${body}.signature_mock`
}

export const usuarios = [
  {
    email: 'coordinador@colegio.edu.pe',
    password: '123456',
    data: { id: 'u-001', nombre: 'Ana García', email: 'coordinador@colegio.edu.pe', rol: 'coordinador', institucion_id: 'inst-001' },
  },
  {
    email: 'director@colegio.edu.pe',
    password: '123456',
    data: { id: 'u-002', nombre: 'Carlos Mendoza', email: 'director@colegio.edu.pe', rol: 'director', institucion_id: 'inst-001' },
  },
  {
    email: 'tecnico@colegio.edu.pe',
    password: '123456',
    data: { id: 'u-003', nombre: 'Luis Quispe', email: 'tecnico@colegio.edu.pe', rol: 'tecnico', institucion_id: 'inst-001' },
  },
  {
    email: 'admin@edutrack.ai',
    password: '123456',
    data: { id: 'u-004', nombre: 'Super Admin', email: 'admin@edutrack.ai', rol: 'super_admin', institucion_id: null },
  },
]

export function loginMock(email, password) {
  const user = usuarios.find(u => u.email === email && u.password === password)
  if (!user) return null
  return {
    access_token:  makeToken(user.data),
    refresh_token: makeToken({ ...user.data, type: 'refresh' }),
    user: user.data,
  }
}
