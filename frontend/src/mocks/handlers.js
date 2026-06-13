import { http, HttpResponse } from 'msw'
import { loginMock }        from './data/auth'
import { activos, historial } from './data/activos'
import { modelos, marcas }  from './data/catalogo'
import { ordenes }          from './data/ordenes'
import { alertas }          from './data/alertas'
import { dashboardData }    from './data/dashboard'
import { usuarios }         from './data/usuarios'
import { instituciones }    from './data/instituciones'
import { proyeccionPorAnio } from './data/proyeccion'
import { tokens, makeToken, partial } from './data/tokens'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const handlers = [

  // ── Auth ──────────────────────────────────────────────────────────────
  http.post('/api/v1/auth/login', async ({ request }) => {
    await delay()
    const { email, password } = await request.json()
    const result = loginMock(email, password)
    if (!result) return HttpResponse.json({ detail: 'Credenciales incorrectas' }, { status: 401 })
    return HttpResponse.json(result)
  }),

  // ── Catálogo ──────────────────────────────────────────────────────────
  http.get('/api/v1/catalogo/marcas', async () => {
    await delay()
    return HttpResponse.json(marcas)
  }),

  http.get('/api/v1/catalogo/modelos', async ({ request }) => {
    await delay()
    const url   = new URL(request.url)
    const marca = url.searchParams.get('marca')
    const res   = marca ? modelos.filter(m => m.marca === marca) : modelos
    return HttpResponse.json(res)
  }),

  // ── Activos ───────────────────────────────────────────────────────────
  http.get('/api/v1/activos', async () => {
    await delay()
    return HttpResponse.json(activos)
  }),

  http.get('/api/v1/activos/:id', async ({ params }) => {
    await delay()
    const activo = activos.find(a => a.id === params.id)
    if (!activo) return HttpResponse.json({ detail: 'No encontrado' }, { status: 404 })
    return HttpResponse.json(activo)
  }),

  http.post('/api/v1/activos', async ({ request }) => {
    await delay(500)
    const data = await request.json()
    const nuevo = { id: `a-${Date.now()}`, codigo_qr: `QR-${Date.now()}`, score: 100, estado: 'operativo', institucion_id: 'inst-001', ...data }
    activos.unshift(nuevo)
    return HttpResponse.json(nuevo, { status: 201 })
  }),

  http.patch('/api/v1/activos/:id', async ({ params, request }) => {
    await delay()
    const idx = activos.findIndex(a => a.id === params.id)
    if (idx === -1) return HttpResponse.json({ detail: 'No encontrado' }, { status: 404 })
    const data = await request.json()
    activos[idx] = { ...activos[idx], ...data }
    return HttpResponse.json(activos[idx])
  }),

  http.get('/api/v1/activos/:id/score', async ({ params }) => {
    await delay()
    const activo = activos.find(a => a.id === params.id)
    if (!activo) return HttpResponse.json({ detail: 'No encontrado' }, { status: 404 })
    return HttpResponse.json({
      score: activo.score,
      factores: { vida_util: 85, cumplimiento: 90, frecuencia_fallas: 75, recencia: 80 },
    })
  }),

  http.get('/api/v1/activos/:id/historial', async ({ params }) => {
    await delay()
    return HttpResponse.json(historial[params.id] ?? [])
  }),

  http.get('/api/v1/activos/:id/plan', async ({ params }) => {
    await delay()
    const activo = activos.find(a => a.id === params.id)
    if (!activo) return HttpResponse.json({ detail: 'No encontrado' }, { status: 404 })
    // Plan dummy basado en categoría
    const planPorCategoria = {
      'Proyector': [
        { id: 'pm-1', tarea: 'Limpieza de filtro',     intervalo_dias:  90, proxima_fecha: '2026-07-10', estado: 'programado' },
        { id: 'pm-2', tarea: 'Revisión de lámpara',    intervalo_dias: 180, proxima_fecha: '2026-09-05', estado: 'programado' },
        { id: 'pm-3', tarea: 'Calibración óptica',     intervalo_dias: 365, proxima_fecha: '2027-03-15', estado: 'programado' },
      ],
      'Laptop': [
        { id: 'pm-1', tarea: 'Limpieza interna',       intervalo_dias: 180, proxima_fecha: '2026-08-20', estado: 'programado' },
        { id: 'pm-2', tarea: 'Cambio de pasta térmica',intervalo_dias: 365, proxima_fecha: '2027-02-10', estado: 'programado' },
        { id: 'pm-3', tarea: 'Actualización de firmware', intervalo_dias: 365, proxima_fecha: '2027-02-10', estado: 'programado' },
      ],
      'Aire Acondicionado': [
        { id: 'pm-1', tarea: 'Limpieza de filtros',    intervalo_dias:  60, proxima_fecha: '2026-05-15', estado: 'vencido' },
        { id: 'pm-2', tarea: 'Revisión de gas refrigerante', intervalo_dias: 180, proxima_fecha: '2026-09-01', estado: 'programado' },
        { id: 'pm-3', tarea: 'Limpieza de unidad exterior',  intervalo_dias: 120, proxima_fecha: '2026-08-10', estado: 'programado' },
      ],
      'Monitor': [
        { id: 'pm-1', tarea: 'Limpieza de pantalla',   intervalo_dias:  90, proxima_fecha: '2026-08-01', estado: 'programado' },
        { id: 'pm-2', tarea: 'Calibración de color',   intervalo_dias: 365, proxima_fecha: '2027-03-20', estado: 'programado' },
      ],
      'Impresora': [
        { id: 'pm-1', tarea: 'Limpieza de rodillos',   intervalo_dias:  90, proxima_fecha: '2026-08-15', estado: 'programado' },
        { id: 'pm-2', tarea: 'Reemplazo de tóner',     intervalo_dias: 180, proxima_fecha: '2026-10-01', estado: 'programado' },
      ],
      'Desktop': [
        { id: 'pm-1', tarea: 'Limpieza interna',       intervalo_dias: 180, proxima_fecha: '2026-09-10', estado: 'programado' },
        { id: 'pm-2', tarea: 'Actualización del sistema', intervalo_dias: 90, proxima_fecha: '2026-08-05', estado: 'programado' },
      ],
      'Pizarra Interactiva': [
        { id: 'pm-1', tarea: 'Calibración táctil',     intervalo_dias: 180, proxima_fecha: '2026-09-25', estado: 'programado' },
        { id: 'pm-2', tarea: 'Limpieza de superficie', intervalo_dias:  90, proxima_fecha: '2026-08-12', estado: 'programado' },
      ],
    }
    const factores = {
      vida_util:          Math.max(0, Math.min(100, activo.score + 15 - Math.floor(Math.random() * 8))),
      cumplimiento:       Math.max(0, Math.min(100, activo.score - 5 + Math.floor(Math.random() * 10))),
      frecuencia_fallas:  Math.max(0, Math.min(100, activo.score - 10 + Math.floor(Math.random() * 12))),
      recencia:           Math.max(0, Math.min(100, activo.score + 5 - Math.floor(Math.random() * 8))),
    }
    return HttpResponse.json({
      score:    activo.score,
      factores,
      tareas:   planPorCategoria[activo.categoria] ?? [],
    })
  }),

  // QR público
  http.get('/api/v1/qr/:codigo', async ({ params }) => {
    await delay()
    const activo = activos.find(a => a.codigo_qr === params.codigo)
    if (!activo) return HttpResponse.json({ detail: 'QR no válido' }, { status: 404 })
    return HttpResponse.json(activo)
  }),

  // ── Órdenes ───────────────────────────────────────────────────────────
  http.get('/api/v1/ordenes', async () => {
    await delay()
    return HttpResponse.json(ordenes)
  }),

  http.get('/api/v1/ordenes/:id', async ({ params }) => {
    await delay()
    const orden = ordenes.find(o => o.id === params.id)
    if (!orden) return HttpResponse.json({ detail: 'No encontrado' }, { status: 404 })
    return HttpResponse.json(orden)
  }),

  http.post('/api/v1/ordenes', async ({ request }) => {
    await delay(500)
    const data  = await request.json()
    const nueva = { id: `ot-${Date.now()}`, numero: `OT-2026-${String(ordenes.length + 1).padStart(3,'0')}`, estado: 'pendiente', creada_en: new Date().toISOString().split('T')[0], institucion_id: 'inst-001', ...data }
    ordenes.unshift(nueva)
    return HttpResponse.json(nueva, { status: 201 })
  }),

  http.patch('/api/v1/ordenes/:id/estado', async ({ params, request }) => {
    await delay()
    const idx = ordenes.findIndex(o => o.id === params.id)
    if (idx === -1) return HttpResponse.json({ detail: 'No encontrado' }, { status: 404 })
    const data = await request.json()
    const hoy = new Date().toISOString().split('T')[0]
    const historial_estados = [
      ...(ordenes[idx].historial_estados ?? []),
      { estado: data.estado, fecha: hoy, usuario: data.usuario ?? 'Sistema' },
    ]
    ordenes[idx] = { ...ordenes[idx], ...data, historial_estados }
    return HttpResponse.json(ordenes[idx])
  }),

  http.patch('/api/v1/ordenes/:id', async ({ params, request }) => {
    await delay()
    const idx = ordenes.findIndex(o => o.id === params.id)
    if (idx === -1) return HttpResponse.json({ detail: 'No encontrado' }, { status: 404 })
    const data = await request.json()
    ordenes[idx] = { ...ordenes[idx], ...data }
    return HttpResponse.json(ordenes[idx])
  }),

  // ── Alertas ───────────────────────────────────────────────────────────
  http.get('/api/v1/alertas', async () => {
    await delay()
    return HttpResponse.json(alertas)
  }),

  http.post('/api/v1/alertas/:id/atender', async ({ params }) => {
    await delay()
    const alerta = alertas.find(a => a.id === params.id)
    if (alerta) alerta.atendida = true
    return HttpResponse.json({ ok: true })
  }),

  // ── Dashboard ─────────────────────────────────────────────────────────
  http.get('/api/v1/dashboard', async () => {
    await delay()
    return HttpResponse.json(dashboardData)
  }),

  // ── Usuarios ──────────────────────────────────────────────────────────
  http.get('/api/v1/usuarios', async () => {
    await delay()
    return HttpResponse.json(usuarios)
  }),

  http.post('/api/v1/usuarios', async ({ request }) => {
    await delay(500)
    const data  = await request.json()
    const nuevo = { id: `u-${Date.now()}`, activo: true, creado_en: new Date().toISOString().split('T')[0], institucion_id: 'inst-001', ...data }
    usuarios.unshift(nuevo)
    return HttpResponse.json(nuevo, { status: 201 })
  }),

  // ── Reportes (docente) ────────────────────────────────────────────────
  http.post('/api/v1/reportes', async ({ request }) => {
    await delay(600)
    const data = await request.json()
    return HttpResponse.json({ id: `rep-${Date.now()}`, numero: `REP-2026-${Math.floor(Math.random()*900)+100}`, ...data, creado_en: new Date().toISOString() }, { status: 201 })
  }),

  // ── Admin: Instituciones ──────────────────────────────────────────────
  http.get('/api/v1/admin/instituciones', async () => {
    await delay()
    return HttpResponse.json(instituciones)
  }),

  http.post('/api/v1/admin/instituciones', async ({ request }) => {
    await delay(500)
    const data = await request.json()
    const nueva = {
      id: `inst-${Date.now()}`,
      activa: true,
      creada_en: new Date().toISOString().split('T')[0],
      total_activos: 0,
      total_usuarios: 1,
      ...data,
    }
    instituciones.unshift(nueva)
    return HttpResponse.json(nueva, { status: 201 })
  }),

  http.patch('/api/v1/admin/instituciones/:id', async ({ params, request }) => {
    await delay()
    const idx = instituciones.findIndex(i => i.id === params.id)
    if (idx === -1) return HttpResponse.json({ detail: 'No encontrado' }, { status: 404 })
    const data = await request.json()
    instituciones[idx] = { ...instituciones[idx], ...data }
    return HttpResponse.json(instituciones[idx])
  }),

  // ── Admin: Catálogo (modelos) ─────────────────────────────────────────
  http.post('/api/v1/catalogo/modelos', async ({ request }) => {
    await delay(500)
    const data  = await request.json()
    const nuevo = { id: `cat-${Date.now()}`, ...data }
    modelos.unshift(nuevo)
    return HttpResponse.json(nuevo, { status: 201 })
  }),

  http.patch('/api/v1/catalogo/modelos/:id', async ({ params, request }) => {
    await delay()
    const idx = modelos.findIndex(m => m.id === params.id)
    if (idx === -1) return HttpResponse.json({ detail: 'No encontrado' }, { status: 404 })
    const data = await request.json()
    modelos[idx] = { ...modelos[idx], ...data }
    return HttpResponse.json(modelos[idx])
  }),

  // ── Proyección ────────────────────────────────────────────────────────
  http.get('/api/v1/proyeccion', async ({ request }) => {
    await delay()
    const url     = new URL(request.url)
    const anio    = parseInt(url.searchParams.get('anio') ?? '2026')
    const fuente  = proyeccionPorAnio[anio] ?? { anio, items: [], estimado_correctivos: 0, candidatos_reemplazo: [] }
    const total_preventivos = fuente.items.reduce((sum, it) => sum + (it.costo ?? 0), 0)
    return HttpResponse.json({
      anio,
      items: fuente.items,
      total_preventivos,
      total_correctivos:    fuente.estimado_correctivos,
      total_general:        total_preventivos + fuente.estimado_correctivos,
      candidatos_reemplazo: fuente.candidatos_reemplazo,
    })
  }),

  // ── Patch usuarios ────────────────────────────────────────────────────
  http.patch('/api/v1/usuarios/:id', async ({ params, request }) => {
    await delay()
    const idx = usuarios.findIndex(u => u.id === params.id)
    if (idx === -1) return HttpResponse.json({ detail: 'No encontrado' }, { status: 404 })
    const data = await request.json()
    usuarios[idx] = { ...usuarios[idx], ...data }
    return HttpResponse.json(usuarios[idx])
  }),

  // ── Refresh token ─────────────────────────────────────────────────────
  http.post('/api/v1/auth/refresh', async ({ request }) => {
    await delay(200)
    const { refresh_token } = await request.json()
    return HttpResponse.json({ access_token: refresh_token, refresh_token })
  }),

  // ── Perfil: cambiar contraseña ────────────────────────────────────────
  http.post('/api/v1/perfil/password', async ({ request }) => {
    await delay(400)
    const { password_actual, password_nueva } = await request.json()
    if (password_actual !== '123456') {
      return HttpResponse.json({ detail: 'La contraseña actual es incorrecta' }, { status: 400 })
    }
    if (!password_nueva || password_nueva.length < 8) {
      return HttpResponse.json({ detail: 'La nueva contraseña debe tener al menos 8 caracteres' }, { status: 400 })
    }
    return HttpResponse.json({ ok: true })
  }),

  // ── Tokens de API ─────────────────────────────────────────────────────
  http.get('/api/v1/perfil/tokens', async () => {
    await delay()
    return HttpResponse.json(tokens)
  }),

  http.post('/api/v1/perfil/tokens', async ({ request }) => {
    await delay(500)
    const { nombre } = await request.json()
    const raw = makeToken()
    const nuevo = {
      id:           `tok-${Date.now()}`,
      user_id:      'u-001',
      nombre:       nombre?.trim() || 'Token sin nombre',
      token_partial: partial(raw),
      created_at:   new Date().toISOString().split('T')[0],
      last_used_at: null,
    }
    tokens.unshift(nuevo)
    // El token completo solo se devuelve en la respuesta de creación
    return HttpResponse.json({ ...nuevo, token: raw }, { status: 201 })
  }),

  http.delete('/api/v1/perfil/tokens/:id', async ({ params }) => {
    await delay(300)
    const idx = tokens.findIndex(t => t.id === params.id)
    if (idx === -1) return HttpResponse.json({ detail: 'No encontrado' }, { status: 404 })
    tokens.splice(idx, 1)
    return HttpResponse.json({ ok: true })
  }),
]
