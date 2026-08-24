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
  /**
   * El respaldo en Excel del mes. Viene por fetch y no por un enlace directo
   * porque la API pide el token en la cabecera, y un `<a href>` no lo lleva.
   */
  async excel(cuentaId: string, mes: string): Promise<{ archivo: Blob; nombre: string }> {
    try {
      const respuesta = await this.get<Blob>(
        `cuentas/${cuentaId}/conciliacion/excel?mes=${mes}`,
        undefined,
        { responseType: 'blob', timeout: 60000 },
      )
      const cabecera = String(respuesta.headers['content-disposition'] ?? '')
      const nombre = cabecera.match(/filename="?([^"]+)"?/)?.[1] ?? `conciliacion-${mes}.xlsx`
      return { archivo: respuesta.data, nombre }
    } catch (error) {
      throw await conMensajeLegible(error)
    }
  }
  async periodos(cuentaId: string) {
    return (await this.get<PeriodoGuardado[]>(`cuentas/${cuentaId}/periodos`)).data
  }
}


/**
 * Cuando la respuesta se pide como Blob, el mensaje de error del servidor
 * también llega como Blob y se perdería. Aquí se abre para que la contadora
 * lea «Esta cuenta no tiene extracto cargado» y no «Request failed with 404».
 */
async function conMensajeLegible(error: unknown): Promise<unknown> {
  const posible = error as { message?: string; data?: unknown }
  if (!(posible?.data instanceof Blob)) return error
  try {
    const texto = await posible.data.text()
    const cuerpo = JSON.parse(texto) as { message?: string }
    return { ...posible, message: cuerpo.message ?? posible.message }
  } catch {
    return error
  }
}

export const conciliacionService = new ConciliacionService()
