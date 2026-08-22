<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCuentasStore } from '@/stores/cuentas'
import { cargaService } from '@/services/carga.service'
import { dinero, fecha, mensajeDe } from '@/composables/useFormato'
import SelectorCuenta from '@/components/SelectorCuenta.vue'
import ZonaArchivo from '@/components/ZonaArchivo.vue'
import Aviso from '@/components/Aviso.vue'
import Cifra from '@/components/Cifra.vue'
import Panel from '@/components/Panel.vue'
import type { AnalisisExtracto, ResultadoGuardado } from '@/types'

const cuentas = useCuentasStore()
const archivo = ref<File | null>(null)
const analisis = ref<AnalisisExtracto | null>(null)
const error = ref<string | null>(null)
const leyendo = ref(false)
const guardando = ref(false)
const guardado = ref<ResultadoGuardado | null>(null)
const verTodo = ref(false)

const visibles = computed(() =>
  analisis.value ? (verTodo.value ? analisis.value.movimientos : analisis.value.movimientos.slice(0, 50)) : [],
)

async function procesar(f: File) {
  archivo.value = f
  analisis.value = null
  guardado.value = null
  error.value = null
  verTodo.value = false
  leyendo.value = true
  try {
    analisis.value = await cargaService.analizarExtracto(f)
  } catch (e) {
    error.value = mensajeDe(e)
  } finally {
    leyendo.value = false
  }
}

async function guardar() {
  if (!archivo.value) return
  if (!cuentas.seleccionada) {
    error.value = 'Elige primero a qué cuenta pertenece este extracto.'
    return
  }
  error.value = null
  guardando.value = true
  try {
    guardado.value = await cargaService.guardarExtracto(cuentas.seleccionada, archivo.value)
    await cuentas.cargar()
  } catch (e) {
    error.value = mensajeDe(e)
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <div class="pagina">
    <header class="pagina__cabecera">
      <h2>1 · Excel del BANCO</h2>
      <p>El extracto tal como lo descargas del banco. Primero se lee y se revisa; se guarda solo cuando lo confirmes.</p>
    </header>

    <ZonaArchivo titulo="Elige el extracto del banco" ayuda="Excel, CSV o texto. Reconoce Guayaquil, Pichincha, Pacífico, Produbanco y más; si no, lo lee línea por línea." :leyendo="leyendo" @archivo="procesar" />

    <Aviso v-if="error" tipo="error" titulo="No se pudo procesar">{{ error }}</Aviso>

    <template v-if="analisis">
      <Aviso :tipo="analisis.generico ? 'warning' : 'success'" :titulo="analisis.generico ? 'No reconocí el formato' : 'Formato reconocido'">
        <p><strong>{{ analisis.nombreFormato }}</strong> · {{ analisis.archivo }} · {{ (analisis.tamano / 1024).toFixed(0) }} KB · {{ analisis.movimientos.length }} movimientos</p>
        <p v-if="analisis.generico" style="margin-top: 0.5rem">
          Lo leí línea por línea y deduje los signos por las palabras del concepto. <strong>Hay que revisarlos antes de guardar</strong>: un signo al revés descuadra el mes entero.
        </p>
        <p v-if="analisis.hojasNoReconocidas.length" style="margin-top: 0.5rem">
          Hojas que no pude interpretar: <span class="mono">{{ analisis.hojasNoReconocidas.join(', ') }}</span>
        </p>
      </Aviso>

      <div class="rejilla">
        <Cifra etiqueta="Entradas" :valor="dinero(analisis.entradas)" tono="positivo" />
        <Cifra etiqueta="Salidas" :valor="dinero(analisis.salidas)" tono="negativo" />
        <Cifra etiqueta="Neto" :valor="dinero(analisis.neto)" />
        <Cifra etiqueta="Periodo" :valor="analisis.rango ? `${fecha(analisis.rango.desde)} — ${fecha(analisis.rango.hasta)}` : '—'" pequeno />
      </div>

      <div class="rejilla rejilla--2">
        <Panel titulo="Continuidad del saldo">
          <p v-if="!analisis.saldos.disponible" class="nota">{{ analisis.saldos.motivo }}</p>
          <template v-else-if="analisis.saldos.integro">
            <p class="ok">Los {{ analisis.saldos.saltos }} saltos de saldo cuadran con su movimiento. No falta ninguna fila.</p>
            <dl class="datos" style="margin-top: 0.75rem">
              <dt>Saldo al empezar</dt><dd>{{ dinero(analisis.saldos.saldoInicial) }}</dd>
              <dt>Saldo al terminar</dt><dd>{{ dinero(analisis.saldos.saldoFinal) }}</dd>
              <dt>Orden del archivo</dt><dd>{{ analisis.saldos.descendente ? 'del más nuevo al más viejo' : 'del más viejo al más nuevo' }}</dd>
            </dl>
          </template>
          <template v-else>
            <p class="mal"><strong>{{ analisis.saldos.rupturas }} de {{ analisis.saldos.saltos }} saltos no cuadran.</strong></p>
            <p class="nota">Cada uno es una fila que falta, una fila mal leída o un signo cambiado. Conviene resolverlo antes de guardar.</p>
            <ul class="mono lista" style="margin-top: 0.75rem">
              <li v-for="(r, i) in analisis.saldos.detalleRupturas.slice(0, 6)" :key="i">
                {{ fecha(r.fecha) }} · salto {{ dinero(r.saltoSaldo) }} · esperaba {{ dinero(r.valorEsperado) }} · difiere {{ dinero(r.diferencia) }}
              </li>
            </ul>
          </template>
        </Panel>

        <Panel titulo="Cobertura del mes">
          <p v-if="!analisis.cobertura.disponible" class="nota">Sin fechas legibles.</p>
          <p v-else-if="analisis.cobertura.completo" class="ok">
            El archivo cubre el mes entero: {{ analisis.cobertura.dias }} de {{ analisis.cobertura.diasDelMes }} días, con movimiento en {{ analisis.cobertura.diasConMovimiento }}.
          </p>
          <template v-else>
            <p class="mal"><strong>El archivo no cubre el mes completo.</strong></p>
            <p>{{ analisis.cobertura.aviso }}</p>
            <p class="nota" style="margin-top: 0.5rem">Conciliar un mes contra medio mes hace que todo lo que el banco no alcanzó a incluir aparezca como diferencia, y no lo es.</p>
          </template>
        </Panel>
      </div>

      <Panel v-if="analisis.clasificacion.grupos.length" titulo="Cargos del banco reconocidos">
        <ul class="lista">
          <li v-for="g in analisis.clasificacion.grupos" :key="g.regla.codigo" class="fila" style="justify-content: space-between">
            <span>{{ g.regla.etiqueta }} <span class="nota">{{ g.movimientos.length }} movimiento{{ g.movimientos.length === 1 ? '' : 's' }}</span></span>
            <span class="num">{{ dinero(g.monto) }}</span>
          </li>
        </ul>
        <p class="nota" style="margin-top: 0.75rem">Estos son los que el sistema sabe explicar solo. El resto tendrá que cruzarse contra el libro del sistema.</p>
      </Panel>

      <section>
        <div class="fila" style="justify-content: space-between; margin-bottom: 0.75rem">
          <h3>Movimientos leídos</h3>
          <button v-if="analisis.movimientos.length > 50" class="boton boton--enlace" @click="verTodo = !verTodo">
            {{ verTodo ? 'Ver solo los primeros 50' : `Ver los ${analisis.movimientos.length}` }}
          </button>
        </div>
        <div class="tabla-envoltura">
          <table class="tabla">
            <thead><tr><th>Fecha</th><th>Referencia</th><th>Concepto</th><th class="num">Valor</th><th class="num">Saldo</th></tr></thead>
            <tbody>
              <tr v-for="(m, i) in visibles" :key="i">
                <td class="mono">{{ fecha(m.fecha) }}</td>
                <td class="mono">{{ m.referencia || '—' }}</td>
                <td class="recorta">{{ m.concepto || '—' }} <span v-if="m.signoInferido" class="etiqueta etiqueta--aviso">signo deducido</span></td>
                <td class="num" :class="m.signo === 1 ? 'pos' : 'neg'">{{ m.signo === 1 ? '+' : '−' }}{{ dinero(m.valor) }}</td>
                <td class="num mono">{{ m.saldo !== null && Number.isFinite(m.saldo) ? dinero(m.saldo) : '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <Aviso v-if="guardado?.yaCargado" tipo="warning" titulo="Este archivo ya se cargó">
        Se subió el {{ new Date(guardado.yaCargado.fecha).toLocaleDateString('es-EC', { dateStyle: 'long' }) }} con {{ guardado.yaCargado.movimientos }} movimientos. Renombrarlo no cambia nada: la huella es del contenido.
      </Aviso>
      <Aviso v-else-if="guardado" tipo="success" :titulo="`${guardado.nuevas} movimiento${guardado.nuevas === 1 ? '' : 's'} guardado${guardado.nuevas === 1 ? '' : 's'}`">
        <p v-if="guardado.duplicadas">{{ guardado.duplicadas }} ya estaban cargados y se ignoraron.</p>
        <p style="margin-top: 0.4rem">Ahora sube el <RouterLink to="/sistema">Excel del SISTEMA</RouterLink> o ve a la <RouterLink to="/conciliacion">conciliación</RouterLink>.</p>
      </Aviso>
      <Panel v-else titulo="Guardar en una cuenta">
        <div class="fila">
          <SelectorCuenta :deshabilitado="guardando" />
          <button class="boton" :disabled="guardando" @click="guardar">
            {{ guardando ? 'Guardando…' : `Guardar ${analisis.movimientos.length} movimientos` }}
          </button>
        </div>
      </Panel>

      <p class="nota mono">Huella del archivo: {{ analisis.huella.slice(0, 24) }}…</p>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.ok { color: darken($alert-success, 15); }
.mal { color: $alert-error; }
.lista { list-style: none; display: flex; flex-direction: column; gap: 0.35rem; }
</style>
