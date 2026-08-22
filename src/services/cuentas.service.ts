import APIBase from './httpBase'
import type { Cuenta, DatosCuenta, Lote } from '@/types'

class CuentasService extends APIBase {
  async listar() {
    return (await this.get<Cuenta[]>('cuentas')).data
  }
  async obtener(id: string) {
    return (await this.get<Cuenta>(`cuentas/${id}`)).data
  }
  async crear(datos: DatosCuenta) {
    return (await this.post<Cuenta>('cuentas', datos)).data
  }
  async actualizar(id: string, datos: Partial<DatosCuenta>) {
    return (await this.put<Cuenta>(`cuentas/${id}`, datos)).data
  }
  async lotes(id: string) {
    return (await this.get<Lote[]>(`cuentas/${id}/lotes`)).data
  }
}

export const cuentasService = new CuentasService()
