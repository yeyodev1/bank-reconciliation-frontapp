import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  { path: '/login', name: 'Login', component: () => import('@/views/LoginView.vue'), meta: { title: 'Entrar' } },
  {
    path: '/',
    component: () => import('@/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/cuentas' },
      { path: 'cuentas', name: 'Cuentas', component: () => import('@/views/CuentasView.vue'), meta: { title: 'Cuentas' } },
      { path: 'banco', name: 'Banco', component: () => import('@/views/ExtractoView.vue'), meta: { title: 'Excel del BANCO' } },
      { path: 'sistema', name: 'Sistema', component: () => import('@/views/LibroView.vue'), meta: { title: 'Excel del SISTEMA' } },
      { path: 'conciliacion', name: 'Conciliacion', component: () => import('@/views/ConciliacionView.vue'), meta: { title: 'Conciliación' } },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/cuentas' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { left: 0, top: 0, behavior: 'smooth' }
  },
})

router.beforeEach((to, _from, next) => {
  const hasToken = !!localStorage.getItem('access_token')
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth)

  if (requiresAuth && !hasToken) return next({ path: '/login', replace: true, query: { a: to.fullPath } })
  if (to.path === '/login' && hasToken) return next({ path: '/', replace: true })
  next()
})

router.afterEach((to) => {
  document.title = `${to.meta?.title ?? 'Conciliación'} · Suárez`
})

export default router
