<script setup lang="ts">
import { ref } from 'vue'
import { useCuentasStore } from '@/stores/cuentas'
import { cargaService } from '@/services/carga.service'
import { dinero, fecha, mensajeDe } from '@/composables/useFormato'
import SelectorCuenta from '@/components/SelectorCuenta.vue'
import ZonaArchivo from '@/components/ZonaArchivo.vue'
import Aviso from '@/components/Aviso.vue'
import Cifra from '@/components/Cifra.vue'
import Panel from '@/components/Panel.vue'
import type { AnalisisLibro, ResultadoGuardado } from '@/types'

const cuentas = useCuentasStore()
const archivo = ref<File | null>(null)
const analisis = ref<AnalisisLibro | null>(null)
const error = ref<string | null>(null)
const leyendo = ref(false)
const guardando = ref(false)
const guardado = ref<ResultadoGuardado | null>(null)

async function procesar(f: File) {
  archivo.value = f
  analisis.value = null
  guardado.value = null
  error.value = null
  leyendo.value = true
  try {
    analisis.value = await cargaService.analizarLibro(f)
  } catch (e) {
    error.value = mensajeDe(e)
  } finally {
    leyendo.value = false
  }
}

async function guardar() {
  if (!archivo.value) return
  if (!cuentas.seleccionada) {
    error.value = 'Elige primero la cuenta bancaria.'
    return
  }
  error.value = null
  guardando.value = true
  try {
    guardado.value = await cargaService.guardarLibro(cuentas.seleccionada, archivo.value)
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
      <p class="paso">Paso 02</p>
      <h2>Excel del SISTEMA</h2>
      <p>El libro de bancos del sistema contable, con las columnas Tipo, # Compr., D/H y Valor.</p>
    </header>

    <ZonaArchivo titulo="Elige el reporte del libro de bancos" ayuda="Excel, CSV o texto. Busco una tabla con TIPO, VALOR y D/H en las primeras quince filas." :leyendo="leyendo" @archivo="procesar" />

    <Aviso v-if="error" tipo="error" titulo="No se pudo procesar">{{ error }}</Aviso>

    <template v-if="analisis">
      <Aviso tipo="success" titulo="Libro leído">
        <strong>{{ analisis.asientos.length }} asientos</strong> · {{ analisis.archivo }}
        <span v-if="analisis.rango"> · del {{ fecha(analisis.rango.desde) }} al {{ fecha(analisis.rango.hasta) }}</span>
      </Aviso>

      <div class="rejilla">
        <Cifra etiqueta="Entra (Debe)" :valor="dinero(analisis.debe)" tono="positivo" />
        <Cifra etiqueta="Sale (Haber)" :valor="dinero(analisis.haber)" tono="negativo" />
        <Cifra etiqueta="Neto" :valor="dinero(analisis.debe - analisis.haber)" />
      </div>

      <Panel v-if="analisis.cuentas.hayDatos" titulo="Cuenta contable">
        <p>La cuenta dominante del reporte es <span class="mono">{{ analisis.cuentas.dominante }}</span>.</p>
        <template v-if="analisis.cuentas.ajenos.length">
          <p class="mal" style="margin-top: 0.5rem">
            Hay <strong>{{ analisis.cuentas.ajenos.length }}</strong> asiento(s) archivados en otra cuenta contable. Si se cargan aquí, se conciliarían contra el extracto equivocado y quedarían pendientes de los dos lados para siempre.
          </p>
          <ul class="mono lista" style="margin-top: 0.5rem">
            <li v-for="(a, i) in analisis.cuentas.ajenos.slice(0, 5)" :key="i">
              {{ fecha(a.fecha) }} · {{ a.tipo }} {{ a.referencia }} · cuenta {{ a.subtipo }} · {{ dinero(a.valor) }}
            </li>
          </ul>
        </template>
      </Panel>

      <div class="tabla-envoltura">
        <table class="tabla">
          <thead><tr><th>Fecha</th><th>Tipo</th><th>Comprobante</th><th>Tercero</th><th>Cuenta</th><th class="num">Valor</th></tr></thead>
          <tbody>
            <tr v-for="(a, i) in analisis.asientos.slice(0, 50)" :key="i">
              <td class="mono">{{ fecha(a.fecha) }}</td>
              <td class="mono">{{ a.tipo || '—' }}</td>
              <td class="mono">{{ a.referencia || '—' }}</td>
              <td class="recorta">{{ a.cliente || '—' }}</td>
              <td class="mono">{{ a.subtipo || '—' }}</td>
              <td class="num" :class="a.signo === 1 ? 'pos' : 'neg'">{{ a.signo === 1 ? '+' : '−' }}{{ dinero(a.valor) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="analisis.asientos.length > 50" class="nota">Se muestran los primeros 50 de {{ analisis.asientos.length }}.</p>

      <Aviso v-if="guardado?.yaCargado" tipo="warning" titulo="Este archivo ya se cargó">
        Se subió el {{ new Date(guardado.yaCargado.fecha).toLocaleDateString('es-EC', { dateStyle: 'long' }) }} con {{ guardado.yaCargado.movimientos }} asientos.
      </Aviso>
      <Aviso v-else-if="guardado" tipo="success" :titulo="`${guardado.nuevas} asiento${guardado.nuevas === 1 ? '' : 's'} guardado${guardado.nuevas === 1 ? '' : 's'}`">
        <p v-if="guardado.duplicadas">{{ guardado.duplicadas }} ya estaban cargados y se ignoraron.</p>
        <p style="margin-top: 0.4rem">Con los dos lados cargados, ya se puede <RouterLink to="/conciliacion">conciliar el mes</RouterLink>.</p>
      </Aviso>
      <Panel v-else titulo="Guardar en una cuenta">
        <div class="fila">
          <SelectorCuenta etiqueta="¿A qué cuenta corresponde?" :deshabilitado="guardando" />
          <button class="boton" :disabled="guardando" @click="guardar">
            <i :class="guardando ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'"></i>
            {{ guardando ? 'Guardando…' : `Guardar ${analisis.asientos.length} asientos` }}
          </button>
        </div>
      </Panel>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.mal { color: $negro; }
.lista { list-style: none; display: flex; flex-direction: column; gap: 0.35rem; }
</style>
