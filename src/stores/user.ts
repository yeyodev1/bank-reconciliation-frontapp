import { defineStore } from 'pinia'
import { authService, type UsuarioSesion } from '@/services/auth.service'

export interface UserState {
  id: string | null
  name: string | null
  email: string | null
  isAuthenticated: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    id: null,
    name: null,
    email: null,
    isAuthenticated: false,
  }),

  actions: {
    hydrate() {
      const token = localStorage.getItem('access_token')
      this.isAuthenticated = !!token
      this.id = localStorage.getItem('user_id')
      this.name = localStorage.getItem('user_name')
      this.email = localStorage.getItem('user_email')
    },

    async login(email: string, password: string) {
      const { token, usuario } = await authService.login(email, password)
      try { localStorage.setItem('access_token', token) } catch {}
      this.setUser(usuario)
    },

    setUser(payload: UsuarioSesion) {
      this.id = payload.id
      this.name = payload.nombre
      this.email = payload.email
      this.isAuthenticated = true
      try {
        localStorage.setItem('user_id', payload.id)
        localStorage.setItem('user_name', payload.nombre)
        localStorage.setItem('user_email', payload.email)
      } catch {}
    },

    clear() {
      this.id = null
      this.name = null
      this.email = null
      this.isAuthenticated = false
      try {
        for (const k of ['access_token', 'user_id', 'user_name', 'user_email']) localStorage.removeItem(k)
      } catch {}
    },
  },
})
