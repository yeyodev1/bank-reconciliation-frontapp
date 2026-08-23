import APIBase from './httpBase'

export interface UsuarioSesion { id: string; nombre: string; email: string }

class AuthService extends APIBase {
  async login(email: string, password: string) {
    return (await this.post<{ token: string; usuario: UsuarioSesion }>('auth/login', { email, password })).data
  }
  async yo() {
    return (await this.get<UsuarioSesion>('auth/yo')).data
  }
}

export const authService = new AuthService()
