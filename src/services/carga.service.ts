import APIBase from './httpBase'
import type { AnalisisExtracto, AnalisisLibro, ResultadoGuardado } from '@/types'

const LARGO = { timeout: 120000 }

function formulario(archivo: File) {
  const fd = new FormData()
  fd.append('archivo', archivo)
  return fd
}

/** 1. Excel del BANCO · 2. Excel del SISTEMA. Analizar no guarda nada. */
class CargaService extends APIBase {
  async analizarExtracto(archivo: File) {
    return (await this.post<AnalisisExtracto>('cuentas/extractos/analizar', formulario(archivo), undefined, LARGO)).data
  }
  async guardarExtracto(cuentaId: string, archivo: File) {
    return (await this.post<ResultadoGuardado>(`cuentas/${cuentaId}/extractos`, formulario(archivo), undefined, LARGO)).data
  }
  async analizarLibro(archivo: File) {
    return (await this.post<AnalisisLibro>('cuentas/libro/analizar', formulario(archivo), undefined, LARGO)).data
  }
  async guardarLibro(cuentaId: string, archivo: File) {
    return (await this.post<ResultadoGuardado>(`cuentas/${cuentaId}/libro`, formulario(archivo), undefined, LARGO)).data
  }
}

export const cargaService = new CargaService()
