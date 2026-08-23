<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCuentasStore } from '@/stores/cuentas'
import { conciliacionService } from '@/services/conciliacion.service'
import { cuando, dinero, fecha, mensajeDe, nombreMes } from '@/composables/useFormato'
import SelectorCuenta from '@/components/SelectorCuenta.vue'
import Aviso from '@/components/Aviso.vue'
import Cifra from '@/components/Cifra.vue'
import Panel from '@/components/Panel.vue'
import type { Conciliacion, MovSistema } from '@/types'

const cuentas = useCuentasStore()
const mes = ref<string>('')
const c = ref<Conciliacion | null>(null)
const error = ref<string | null>(null)
const sinMovimientos = ref(false)
const cargando = ref(false)
const pendiente = ref(false)
const mensaje = ref<string | null>(null)
const confirmando = ref<'cerrar' | 'reabrir' | null>(null)
const motivo = ref('')
const pestana = ref<'coincidencias' | 'banco' | 'libro'>('coincidencias')

async function calcular() {
  if (!cuentas.seleccionada) return
  cargando.value = true
  error.value = null
  sinMovimientos.value = false
  try {
    c.value = await conciliacionService.calcular(cuentas.seleccionada, mes.value || undefined)
    mes.value = c.value.mes
  } catch (e) {
    c.value = null
    if (mensajeDe(e) === 'SIN_MOVIMIENTOS') sinMovimientos.value = true
    else error.value = mensajeDe(e)
  } finally {
    cargando.value = false
  }
}

watch(() => cuentas.seleccionada, () => { mes.value = ''; calcular() }, { immediate: true })

async function accion(tipo: 'guardar' | 'cerrar' | 'reabrir') {
  if (!c.value) return
  pendiente.value = true
  mensaje.value = null
  error.value = null
  try {
    if (tipo === 'guardar') {
      const r = await conciliacionService.guardar(c.value.cuenta.id, c.value.mes)
      mensaje.value = `Corrida guardada: ${r.matches} emparejamientos y ${r.partidas} partidas pendientes.`
    } else if (tipo === 'cerrar') {
      const r = await conciliacionService.cerrar(c.value.cuenta.id, c.value.mes)
      mensaje.value = `${nombreMes(c.value.mes)} quedó cerrado con ${r.matches} emparejamientos.`
    } else {
      await conciliacionService.reabrir(c.value.cuenta.id, c.value.mes, motivo.value)
      mensaje.value = `${nombreMes(c.value.mes)} se reabrió.`
    }
    confirmando.value = null
    motivo.value = ''
    await calcular()
    await cuentas.cargar()
  } catch (e) {
    error.value = mensajeDe(e)
  } finally {
    pendiente.value = false
  }
}

const estado = computed(() => c.value?.periodo?.estado ?? null)
const cerrado = computed(() => estado.value === 'CERRADO')

const etiquetaEstado: Record<string, string> = {
  CERRADO: 'Cerrado',
  CUADRADO: 'Cuadrado, sin cerrar',
  EN_PROCESO: 'En proceso',
}
const explicacion: Record<string, string> = {
  CERRADO: 'El mes está bloqueado: no admite movimientos nuevos con fecha dentro de él.',
  CUADRADO: 'La última corrida guardada cuadra. Falta cerrarlo para bloquearlo.',
  EN_PROCESO: 'Hay una corrida guardada, pero todavía queda diferencia por explicar.',
}

const resumen = computed(() => c.value?.resultado.resumen)
const libroPendientes = computed(() => {
  if (!c.value) return [] as { grupo: string; nota: string; filas: MovSistema[] }[]
  const p = c.value.pendientesLibro
  return [
    { grupo: 'Dentro del extracto (hay que explicarlos)', nota: 'EN_TRANSITO', filas: p.dentro },
    { grupo: 'Arrastre de meses anteriores', nota: 'ARRASTRE', filas: p.arrastre },
    { grupo: 'Posteriores al extracto', nota: 'POSTERIOR', filas: p.despues },
    { grupo: 'Sin fecha', nota: 'SIN_FECHA', filas: p.sinFecha },
  ].filter((g) => g.filas.length)
})
</script>

<template>
  <div class="pagina">
    <header class="pagina__cabecera">
      <p class="paso">Paso 03</p>
      <h2>Conciliación del mes</h2>
      <p>El motor cruza el Excel del BANCO contra el Excel del SISTEMA: primero por referencia exacta, luego por importe, signo y fecha.</p>
    </header>

    <div class="fila">
      <SelectorCuenta etiqueta="Cuenta" :deshabilitado="cargando || pendiente" />
      <label v-if="c" class="campo">
        <span>Mes</span>
        <select v-model="mes" :disabled="cargando || pendiente" @change="calcular">
          <option v-for="m in c.meses" :key="m" :value="m">{{ nombreMes(m) }}</option>
        </select>
      </label>
      <button v-if="c" class="boton boton--secundario" :disabled="cargando" @click="calcular"><i class="fa-solid fa-rotate"></i> Recalcular</button>
    </div>

    <Aviso v-if="error" tipo="error">{{ error }}</Aviso>
    <Aviso v-if="mensaje" tipo="success">{{ mensaje }}</Aviso>
    <Aviso v-if="sinMovimientos" tipo="info" titulo="Esta cuenta no tiene extracto cargado">
      Sube primero el <RouterLink to="/banco">Excel del BANCO</RouterLink>: de sus fechas salen los meses que se pueden conciliar.
    </Aviso>
    <p v-if="cargando" class="nota">Calculando…</p>

    <template v-if="c && !cargando">
      <!-- Estado del mes y acciones -->
      <section class="estado" :class="{ 'estado--cerrado': cerrado }">
        <div>
          <p class="estado__sup">Estado de {{ nombreMes(c.mes) }}</p>
          <p class="estado__titulo">{{ estado ? etiquetaEstado[estado] : 'Sin guardar' }}</p>
          <p class="nota">{{ estado ? explicacion[estado] : 'Este cálculo todavía no se ha guardado. Guardarlo deja constancia de los emparejamientos y de las partidas pendientes.' }}</p>
          <p v-if="c.periodo?.corridoEn" class="nota mono" style="margin-top: 0.4rem">
            Última corrida guardada: {{ cuando(c.periodo.corridoEn) }}<span v-if="c.periodo.cerradoEn"> · cerrado el {{ cuando(c.periodo.cerradoEn) }}</span>
          </p>
          <p v-if="c.periodo?.nota" class="nota" style="margin-top: 0.4rem; color: #0a0a0a"><i class="fa-regular fa-note-sticky"></i> {{ c.periodo.nota }}</p>
        </div>
        <div class="fila">
          <button v-if="!cerrado" class="boton boton--secundario" :disabled="pendiente" @click="accion('guardar')">
            <i class="fa-solid fa-floppy-disk"></i> {{ pendiente ? 'Guardando…' : 'Guardar esta corrida' }}
          </button>
          <button v-if="!cerrado" class="boton boton--exito" :disabled="pendiente || !c.cuadre.cuadra" :title="c.cuadre.cuadra ? undefined : 'Primero hay que explicar la diferencia.'" @click="confirmando = 'cerrar'">
            <i class="fa-solid fa-lock"></i> Cerrar {{ nombreMes(c.mes) }}
          </button>
          <button v-if="cerrado" class="boton boton--peligro" :disabled="pendiente" @click="confirmando = 'reabrir'"><i class="fa-solid fa-lock-open"></i> Reabrir el mes</button>
        </div>
      </section>

      <Aviso v-if="confirmando === 'cerrar'" tipo="warning" titulo="¿Cerrar el mes?">
        <p>Se guarda la corrida actual y el mes queda bloqueado: no admitirá movimientos nuevos hasta que alguien lo reabra con motivo.</p>
        <div class="fila" style="margin-top: 0.75rem">
          <button class="boton boton--exito" :disabled="pendiente" @click="accion('cerrar')">Sí, cerrar</button>
          <button class="boton boton--secundario" @click="confirmando = null">Cancelar</button>
        </div>
      </Aviso>
      <Aviso v-if="confirmando === 'reabrir'" tipo="warning" titulo="¿Reabrir el mes?">
        <p>Escribe el motivo (al menos diez caracteres). Queda registrado en el periodo.</p>
        <textarea v-model="motivo" rows="2" style="width: 100%; margin-top: 0.5rem" placeholder="Llegó un extracto complementario del banco…"></textarea>
        <div class="fila" style="margin-top: 0.75rem">
          <button class="boton boton--peligro" :disabled="pendiente || motivo.trim().length < 10" @click="accion('reabrir')">Reabrir</button>
          <button class="boton boton--secundario" @click="confirmando = null">Cancelar</button>
        </div>
      </Aviso>

      <!-- Cuadre -->
      <div class="rejilla">
        <Cifra etiqueta="Saldo según banco" :valor="dinero(c.cuadre.saldoBanco)" />
        <Cifra etiqueta="+ pendientes del sistema" :valor="dinero(c.cuadre.pendienteSistema)" pequeno />
        <Cifra etiqueta="Saldo según libros" :valor="dinero(c.cuadre.saldoLibros)" />
        <Cifra etiqueta="+ pendientes del banco" :valor="dinero(c.cuadre.pendienteBanco)" pequeno />
        <Cifra etiqueta="Diferencia" :valor="dinero(c.cuadre.diferencia)" :tono="c.cuadre.cuadra ? 'positivo' : 'negativo'" />
      </div>
      <Aviso :tipo="c.cuadre.cuadra ? 'success' : 'warning'">
        <strong>{{ c.cuadre.cuadra ? 'El mes cuadra.' : `Faltan ${dinero(Math.abs(c.cuadre.diferencia ?? 0))} por explicar.` }}</strong>
        <span v-if="!c.saldoBancoDelExtracto" class="nota"> Este extracto no trae saldo corrido, así que el saldo del banco se calculó sumando los movimientos desde el saldo inicial de la cuenta.</span>
      </Aviso>

      <!-- Resumen -->
      <div v-if="resumen" class="rejilla">
        <Cifra etiqueta="Extracto (banco)" :valor="`${resumen.totalBanco} mov.`" pequeno />
        <Cifra etiqueta="Libro (sistema)" :valor="`${c.libroDelMes} del mes + ${resumen.totalSistema - c.libroDelMes} arrastre`" pequeno />
        <Cifra etiqueta="Conciliados" :valor="`${resumen.conciliados} (${resumen.porReferencia} por referencia)`" pequeno tono="positivo" />
        <Cifra etiqueta="Pendientes" :valor="`${resumen.pendientesBanco} banco · ${resumen.pendientesSistema} sistema`" pequeno tono="negativo" />
        <Cifra v-if="resumen.ambiguas" etiqueta="Ambiguos" :valor="String(resumen.ambiguas)" pequeno />
      </div>
      <p v-if="c.tomadosEnOtroPeriodo.banco || c.tomadosEnOtroPeriodo.libro" class="nota">
        Se apartaron {{ c.tomadosEnOtroPeriodo.banco }} movimientos del banco y {{ c.tomadosEnOtroPeriodo.libro }} del libro que ya quedaron emparejados en otro mes.
      </p>
      <Aviso v-if="c.cobertura.disponible && !c.cobertura.completo" tipo="warning" titulo="El extracto no cubre el mes completo">{{ c.cobertura.aviso }}</Aviso>

      <!-- Detalle -->
      <nav class="pestanas">
        <button :class="{ activa: pestana === 'coincidencias' }" @click="pestana = 'coincidencias'">Emparejados ({{ c.resultado.coincidencias.length }})</button>
        <button :class="{ activa: pestana === 'banco' }" @click="pestana = 'banco'">Pendientes del banco ({{ c.resultado.soloBanco.length }})</button>
        <button :class="{ activa: pestana === 'libro' }" @click="pestana = 'libro'">Pendientes del sistema ({{ c.resultado.soloSistema.length }})</button>
      </nav>

      <div v-if="pestana === 'coincidencias'" class="tabla-envoltura">
        <table class="tabla">
          <thead><tr><th>Banco</th><th>Ref. banco</th><th>Concepto</th><th class="num">Valor</th><th>Sistema</th><th>Comprobante</th><th>Tercero</th><th>Vía</th><th class="num">Dif.</th></tr></thead>
          <tbody>
            <tr v-for="(m, i) in c.resultado.coincidencias" :key="i">
              <td class="mono">{{ fecha(m.banco.fecha) }}</td>
              <td class="mono">{{ m.banco.referencia || '—' }}</td>
              <td class="recorta">{{ m.banco.concepto || '—' }}</td>
              <td class="num" :class="m.banco.signo === 1 ? 'pos' : 'neg'">{{ m.banco.signo === 1 ? '+' : '−' }}{{ dinero(m.banco.valor) }}</td>
              <td class="mono">{{ fecha(m.sistema.fecha) }}</td>
              <td class="mono">{{ m.sistema.tipo }} {{ m.sistema.referencia || '' }}</td>
              <td class="recorta">{{ m.sistema.cliente || '—' }}</td>
              <td>
                <span class="etiqueta" :class="m.via === 'referencia' ? 'etiqueta--ok' : m.exacta ? 'etiqueta--neutro' : 'etiqueta--aviso'">{{ m.via === 'referencia' ? 'referencia' : m.exacta ? 'exacto' : 'tolerancia' }}</span>
                <span v-if="m.ambigua" class="etiqueta etiqueta--aviso" style="margin-left: 0.25rem">ambiguo</span>
              </td>
              <td class="num mono">{{ m.difValor ? dinero(m.difValor) : '' }} {{ m.difDias ? `${m.difDias}d` : '' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <template v-if="pestana === 'banco'">
        <Panel v-if="c.pendientesBanco.grupos.length" titulo="Cargos del banco explicables (se guardan como CARGO_BANCARIO)">
          <ul class="lista">
            <li v-for="g in c.pendientesBanco.grupos" :key="g.regla.codigo" class="fila" style="justify-content: space-between">
              <span>{{ g.regla.etiqueta }} <span class="nota">{{ g.movimientos.length }} mov.</span></span>
              <span class="num">{{ dinero(g.monto) }}</span>
            </li>
          </ul>
        </Panel>
        <div class="tabla-envoltura">
          <table class="tabla">
            <thead><tr><th>Fecha</th><th>Referencia</th><th>Concepto</th><th>Clase</th><th class="num">Valor</th></tr></thead>
            <tbody>
              <tr v-for="m in c.pendientesBanco.revisar" :key="'r' + m.idx">
                <td class="mono">{{ fecha(m.fecha) }}</td>
                <td class="mono">{{ m.referencia || '—' }}</td>
                <td class="recorta">{{ m.concepto || '—' }}</td>
                <td><span class="etiqueta etiqueta--error">por investigar</span></td>
                <td class="num" :class="m.signo === 1 ? 'pos' : 'neg'">{{ m.signo === 1 ? '+' : '−' }}{{ dinero(m.valor) }}</td>
              </tr>
              <template v-for="g in c.pendientesBanco.grupos" :key="g.regla.codigo">
                <tr v-for="m in g.movimientos" :key="'g' + m.idx">
                  <td class="mono">{{ fecha(m.fecha) }}</td>
                  <td class="mono">{{ m.referencia || '—' }}</td>
                  <td class="recorta">{{ m.concepto || '—' }}</td>
                  <td><span class="etiqueta etiqueta--neutro">{{ g.regla.etiqueta }}</span></td>
                  <td class="num" :class="m.signo === 1 ? 'pos' : 'neg'">{{ m.signo === 1 ? '+' : '−' }}{{ dinero(m.valor) }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </template>

      <template v-if="pestana === 'libro'">
        <Panel v-for="g in libroPendientes" :key="g.nota" :titulo="`${g.grupo} · ${g.filas.length}`">
          <div class="tabla-envoltura">
            <table class="tabla">
              <thead><tr><th>Fecha</th><th>Tipo</th><th>Comprobante</th><th>Tercero</th><th class="num">Valor</th></tr></thead>
              <tbody>
                <tr v-for="m in g.filas" :key="m.idx">
                  <td class="mono">{{ fecha(m.fecha) }}</td>
                  <td class="mono">{{ m.tipo || '—' }}</td>
                  <td class="mono">{{ m.referencia || '—' }}</td>
                  <td class="recorta">{{ m.cliente || '—' }}</td>
                  <td class="num" :class="m.signo === 1 ? 'pos' : 'neg'">{{ m.signo === 1 ? '+' : '−' }}{{ dinero(m.valor) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Panel>
        <p v-if="!libroPendientes.length" class="nota">Todo el libro quedó emparejado.</p>
      </template>

      <p class="nota mono">
        Parámetros: tolerancia ±{{ c.parametros.tolerancia }} · ventana −{{ c.parametros.ventanaAntes }}/+{{ c.parametros.ventanaDespues }} días · arrastre {{ c.parametros.mesesAtras }} meses.
      </p>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.campo { display: flex; flex-direction: column; gap: 0.45rem; flex: 1 1 100%; @media (min-width: 600px) { flex: 0 1 14rem; } span { font-family: $font-secondary; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.18em; color: $gris-500; } }
.estado {
  display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1.25rem; align-items: flex-start;
  background: $blanco; border: 1px solid $gris-200; border-radius: $radio; padding: 1.5rem; transition: background $transicion;
  &--cerrado { background: $negro; color: $blanco; .nota { color: $gris-400; } }
  &__sup { font-family: $font-secondary; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.18em; color: $gris-500; }
  &__titulo { font-size: 1.5rem; font-weight: 600; letter-spacing: -0.03em; margin: 0.3rem 0 0.4rem; }
}
.pestanas {
  display: flex; gap: 0; border-bottom: 1px solid $gris-200; overflow-x: auto;
  button {
    font: inherit; font-size: 0.86rem; font-weight: 500; background: none; border: 0; border-bottom: 2px solid transparent; margin-bottom: -1px; padding: 0.7rem 1rem; cursor: pointer; color: $gris-500; white-space: nowrap;
    transition: color $transicion, border-color $transicion;
    &:hover { color: $negro; }
    &.activa { color: $negro; border-bottom-color: $negro; }
  }
}
.lista { list-style: none; display: flex; flex-direction: column; gap: 0.35rem; }
</style>
