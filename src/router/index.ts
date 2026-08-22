import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('@/layout/AppLayout.vue'),
    children: [
      { path: '', redirect: '/cuentas' },
      { path: 'cuentas', name: 'Cuentas', component: () => import('@/views/CuentasView.vue'), meta: { title: 'Cuentas' } },
      { path: 'banco', name: 'Banco', component: () => import('@/views/ExtractoView.vue'), meta: { title: 'Excel del BANCO' } },
      { path: 'sistema', name: 'Sistema', component: () => import('@/views/LibroView.vue'), meta: { title: 'Excel del SISTEMA' } },
      { path: 'conciliacion', name: 'Conciliacion', component: () => import('@/views/ConciliacionView.vue'), meta: { title: 'Conciliación' } },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { left: 0, top: 0, behavior: 'smooth' }
  },
})

router.afterEach((to) => {
  document.title = `${to.meta?.title ?? 'Conciliación'} · Suárez`
})

export default router
