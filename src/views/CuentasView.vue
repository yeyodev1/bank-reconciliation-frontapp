<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useCuentasStore } from '@/stores/cuentas'
import { cuentasService } from '@/services/cuentas.service'
import { dinero, fecha, mensajeDe, nombreMes } from '@/composables/useFormato'
import Aviso from '@/components/Aviso.vue'
import type { DatosCuenta } from '@/types'

const cuentas = useCuentasStore()
const mostrandoFormulario = ref(false)
const guardando = ref(false)
const error = ref<string | null>(null)

const vacio = (): DatosCuenta => ({
  banco: '',
  numero: '',
  alias: '',
  tipo: 'CORRIENTE',
  moneda: 'USD',
  cuentaContable: null,
  saldoInicial: 0,
  fechaSaldoInicial: '',
  activa: true,
})
const form = reactive<DatosCuenta>(vacio())

async function guardar() {
  error.value = null
  guardando.value = true
  try {
    const c = await cuentasService.crear({ ...form, saldoInicial: Number(form.saldoInicial) })
    await cuentas.cargar()
    cuentas.seleccionar(c.id)
    Object.assign(form, vacio())
    mostrandoFormulario.value = false
  } catch (e) {
    error.value = mensajeDe(e)
  } finally {
    guardando.value = false
  }
}

const etiquetaEstado: Record<string, string> = {
  EN_PROCESO: 'En proceso',
  CUADRADO: 'Cuadrado',
  CERRADO: 'Cerrado',
}
</script>

<template>
  <div class="pagina">
    <header class="pagina__cabecera fila" style="justify-content: space-between">
      <div>
        <h2>Cuentas bancarias</h2>
        <p>Cada cuenta concilia por su lado: un extracto del banco contra el libro del sistema.</p>
      </div>
      <button class="boton" @click="mostrandoFormulario = !mostrandoFormulario">
        {{ mostrandoFormulario ? 'Cancelar' : 'Nueva cuenta' }}
      </button>
    </header>

    <form v-if="mostrandoFormulario" class="formulario" @submit.prevent="guardar">
      <h3>Nueva cuenta</h3>
      <div class="rejilla">
        <label>Banco <input v-model="form.banco" type="text" placeholder="Banco Pichincha" required /></label>
        <label>Número de cuenta <input v-model="form.numero" type="text" required /></label>
        <label>Nombre corto <input v-model="form.alias" type="text" placeholder="Corriente principal" required /></label>
        <label>Tipo
          <select v-model="form.tipo">
            <option value="CORRIENTE">Corriente</option>
            <option value="AHORROS">Ahorros</option>
          </select>
        </label>
        <label>Saldo inicial <input v-model="form.saldoInicial" type="number" step="0.01" /></label>
        <label>Fecha del saldo inicial <input v-model="form.fechaSaldoInicial" type="date" required /></label>
        <label>Cuenta contable (opcional) <input v-model="form.cuentaContable" type="text" placeholder="102002" /></label>
      </div>
      <p class="nota">
        El saldo inicial es el punto de partida del cuadre: el saldo del banco y el de libros se calculan
        sumando los movimientos desde esa fecha.
      </p>
      <Aviso v-if="error" tipo="error">{{ error }}</Aviso>
      <div class="fila">
        <button class="boton" type="submit" :disabled="guardando">{{ guardando ? 'Guardando…' : 'Guardar cuenta' }}</button>
      </div>
    </form>

    <Aviso v-if="cuentas.error" tipo="error">{{ cuentas.error }}</Aviso>

    <p v-if="cuentas.cargando" class="nota">Cargando…</p>
    <Aviso v-else-if="!cuentas.lista.length" tipo="info" titulo="Todavía no hay cuentas">
      Crea la primera con el botón de arriba. Luego sube el Excel del BANCO y el del SISTEMA.
    </Aviso>

    <div v-else class="tabla-envoltura">
      <table class="tabla">
        <thead>
          <tr>
            <th></th>
            <th>Cuenta</th>
            <th>Banco</th>
            <th class="num">Saldo inicial</th>
            <th class="num">Mov. banco</th>
            <th class="num">Mov. sistema</th>
            <th>Último mes</th>
            <th>Última conciliación</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in cuentas.lista" :key="c.id" :class="{ 'fila--activa': c.id === cuentas.seleccionada }">
            <td>
              <input type="radio" name="cuenta" :checked="c.id === cuentas.seleccionada" @change="cuentas.seleccionar(c.id)" />
            </td>
            <td>
              <strong>{{ c.alias }}</strong>
              <div class="mono">{{ c.numero }} · {{ c.tipo }}</div>
            </td>
            <td>{{ c.banco }}</td>
            <td class="num">{{ dinero(c.saldoInicial) }}<div class="mono">{{ fecha(c.fechaSaldoInicial) }}</div></td>
            <td class="num">{{ c.movimientosBanco ?? 0 }}</td>
            <td class="num">{{ c.movimientosLibro ?? 0 }}</td>
            <td>{{ c.ultimoMes ? nombreMes(c.ultimoMes) : '—' }}</td>
            <td>
              <template v-if="c.ultimoPeriodo">
                {{ nombreMes(c.ultimoPeriodo.mes) }}
                <span class="etiqueta" :class="c.ultimoPeriodo.estado === 'CERRADO' ? 'etiqueta--neutro' : c.ultimoPeriodo.estado === 'CUADRADO' ? 'etiqueta--ok' : 'etiqueta--aviso'">
                  {{ etiquetaEstado[c.ultimoPeriodo.estado] }}
                </span>
              </template>
              <span v-else class="nota">Sin corridas</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.formulario {
  background: $white; border: 1px solid rgba($primary-dark, 0.1); border-radius: 8px; padding: 1.5rem;
  display: flex; flex-direction: column; gap: 1rem;
  label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.8rem; color: $text-secondary; }
}
.fila--activa td { background: rgba($primary, 0.05); }
</style>
