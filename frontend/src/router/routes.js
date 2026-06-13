export const routes = [
  // ── Raíz ──────────────────────────────────────────────────────────────
  {
    path: '/',
    redirect: () => '/login',
  },

  // ── Auth ──────────────────────────────────────────────────────────────
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false },
  },

  // ── Docente (público) ─────────────────────────────────────────────────
  {
    path: '/qr/:codigo',
    name: 'reporte-falla',
    component: () => import('@/views/docente/ReporteFallaView.vue'),
    meta: { requiresAuth: false },
  },

  // ── Coordinador ───────────────────────────────────────────────────────
  {
    path: '/coordinador',
    meta: { requiresAuth: true, roles: ['coordinador'] },
    children: [
      { path: '', redirect: '/coordinador/dashboard' },
      { path: 'dashboard',        name: 'coordinador-dashboard',  component: () => import('@/views/coordinador/DashboardCoordinador.vue') },
      { path: 'activos',          name: 'activos-list',           component: () => import('@/views/coordinador/ActivosListView.vue') },
      { path: 'activos/nuevo',    name: 'activo-nuevo',           component: () => import('@/views/coordinador/ActivoFormView.vue') },
      { path: 'activos/:id',      name: 'activo-detail',          component: () => import('@/views/coordinador/ActivoDetailView.vue') },
      { path: 'activos/:id/editar', name: 'activo-editar',        component: () => import('@/views/coordinador/ActivoFormView.vue') },
      { path: 'ordenes',          name: 'ordenes-list',           component: () => import('@/views/coordinador/OrdenesListView.vue') },
      { path: 'ordenes/nueva',    name: 'orden-nueva',            component: () => import('@/views/coordinador/OrdenFormView.vue') },
      { path: 'ordenes/:id',      name: 'orden-detail',           component: () => import('@/views/coordinador/OrdenDetailView.vue') },
      { path: 'alertas',          name: 'alertas',                component: () => import('@/views/coordinador/AlertasView.vue') },
      { path: 'usuarios',         name: 'usuarios-list',          component: () => import('@/views/coordinador/UsuariosListView.vue') },
      { path: 'usuarios/nuevo',   name: 'usuario-nuevo',          component: () => import('@/views/coordinador/UsuarioFormView.vue') },
      { path: 'usuarios/:id/editar', name: 'usuario-editar',      component: () => import('@/views/coordinador/UsuarioFormView.vue') },
    ],
  },

  // ── Director ──────────────────────────────────────────────────────────
  {
    path: '/director',
    meta: { requiresAuth: true, roles: ['director'] },
    children: [
      { path: '', redirect: '/director/dashboard' },
      { path: 'dashboard',    name: 'director-dashboard',  component: () => import('@/views/director/DashboardDirector.vue') },
      { path: 'proyeccion',   name: 'proyeccion',          component: () => import('@/views/director/ProyeccionView.vue') },
    ],
  },

  // ── Técnico ───────────────────────────────────────────────────────────
  {
    path: '/tecnico',
    meta: { requiresAuth: true, roles: ['tecnico'] },
    children: [
      { path: '', redirect: '/tecnico/ordenes' },
      { path: 'ordenes',          name: 'tecnico-ordenes',    component: () => import('@/views/tecnico/MisOrdenesView.vue') },
      { path: 'ordenes/:id',      name: 'tecnico-orden',      component: () => import('@/views/tecnico/OrdenDetailTecnico.vue') },
      { path: 'ordenes/:id/ejecutar', name: 'ejecutar-orden', component: () => import('@/views/tecnico/EjecutarOrdenView.vue') },
    ],
  },

  // ── Super Admin ───────────────────────────────────────────────────────
  {
    path: '/admin',
    meta: { requiresAuth: true, roles: ['super_admin'] },
    children: [
      { path: '', redirect: '/admin/instituciones' },
      { path: 'instituciones',          name: 'instituciones-list',   component: () => import('@/views/admin/InstitucionesListView.vue') },
      { path: 'instituciones/nueva',    name: 'institucion-nueva',    component: () => import('@/views/admin/InstitucionFormView.vue') },
      { path: 'instituciones/:id/editar', name: 'institucion-editar', component: () => import('@/views/admin/InstitucionFormView.vue') },
      { path: 'catalogo',               name: 'catalogo-list',        component: () => import('@/views/admin/CatalogoListView.vue') },
      { path: 'catalogo/nuevo',         name: 'catalogo-nuevo',       component: () => import('@/views/admin/CatalogoModeloFormView.vue') },
      { path: 'catalogo/:id/editar',    name: 'catalogo-editar',      component: () => import('@/views/admin/CatalogoModeloFormView.vue') },
    ],
  },

  // ── Compartidas ───────────────────────────────────────────────────────
  {
    path: '/perfil',
    name: 'perfil',
    component: () => import('@/views/shared/PerfilView.vue'),
    meta: { requiresAuth: true, roles: ['coordinador', 'director', 'tecnico', 'super_admin'] },
  },

  // ── Dev: playground de componentes (sólo en desarrollo) ──────────────
  {
    path: '/dev/components',
    name: 'dev-components',
    component: () => import('@/views/dev/ComponentsPlayground.vue'),
    meta: { requiresAuth: false },
  },

  // ── 404 ───────────────────────────────────────────────────────────────
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/shared/NotFoundView.vue'),
  },
]
