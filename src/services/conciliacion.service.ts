import APIBase from './httpBase'
import type { Conciliacion, Guardado, PeriodoGuardado } from '@/types'

class ConciliacionService extends APIBase {
  async calcular(cuentaId: string, mes?: string) {
    const q = mes ? `?mes=${mes}` : ''
    return (await this.get<Conciliacion>(`cuentas/${cuentaId}/conciliacion${q}`, undefined, { timeout: 60000 })).data
  }
  async guardar(cuentaId: string, mes: string) {
    return (await this.post<Guardado>(`cuentas/${cuentaId}/conciliacion/guardar`, { mes }, undefined, { timeout: 60000 })).data
  }
  async cerrar(cuentaId: string, mes: string) {
    return (await this.post<Guardado>(`cuentas/${cuentaId}/conciliacion/cerrar`, { mes }, undefined, { timeout: 60000 })).data
  }
  async reabrir(cuentaId: string, mes: string, motivo: string) {
    return (await this.post<{ ok: true }>(`cuentas/${cuentaId}/conciliacion/reabrir`, { mes, motivo })).data
  }
  async periodos(cuentaId: string) {
    return (await this.get<PeriodoGuardado[]>(`cuentas/${cuentaId}/periodos`)).data
  }
}

export const conciliacionService = new ConciliacionService()
