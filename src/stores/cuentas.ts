import { defineStore } from 'pinia'
import { cuentasService } from '@/services/cuentas.service'
import type { Cuenta } from '@/types'

/** Las cuentas se usan en todas las pantallas; se cargan una vez y se refrescan al guardar. */
export const useCuentasStore = defineStore('cuentas', {
  state: () => ({
    lista: [] as Cuenta[],
    cargando: false,
    error: null as string | null,
    seleccionada: (localStorage.getItem('cuenta_seleccionada') || '') as string,
  }),
  getters: {
    activas: (s) => s.lista.filter((c) => c.activa),
    actual: (s) => s.lista.find((c) => c.id === s.seleccionada) ?? null,
  },
  actions: {
    async cargar() {
      this.cargando = true
      this.error = null
      try {
        this.lista = await cuentasService.listar()
        if (!this.seleccionada && this.lista.length === 1) this.seleccionar(this.lista[0]!.id)
      } catch (e) {
        this.error = (e as { message?: string }).message ?? 'No se pudieron cargar las cuentas.'
      } finally {
        this.cargando = false
      }
    },
    seleccionar(id: string) {
      this.seleccionada = id
      try { localStorage.setItem('cuenta_seleccionada', id) } catch {}
    },
  },
})
