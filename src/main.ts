import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUserStore } from '@/stores/user'
import '@/styles/global.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const user = useUserStore()
user.hydrate()

// El backend respondió 401: la sesión murió. Se limpia y se vuelve a la entrada.
window.addEventListener('auth:token-expired', () => {
  user.clear()
  if (router.currentRoute.value.path !== '/login') router.replace({ path: '/login', query: { expirada: '1' } })
})

app.mount('#app')
