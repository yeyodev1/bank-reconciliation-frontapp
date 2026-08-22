export interface ApiError {
  status: number
  message: string
  data?: unknown
}

/* ---------------- cuentas ---------------- */

export interface Cuenta {
  id: string
  banco: string
  numero: string
  alias: string
  tipo: 'CORRIENTE' | 'AHORROS'
  moneda: string
  cuentaContable: string | null
  saldoInicial: number
  fechaSaldoInicial: string
  activa: boolean
  movimientosBanco?: number
  movimientosLibro?: number
  ultimoMes?: string | null
  ultimoPeriodo?: { mes: string; estado: string } | null
}

export type DatosCuenta = Omit<Cuenta, 'id' | 'movimientosBanco' | 'movimientosLibro' | 'ultimoMes' | 'ultimoPeriodo'>

/* ---------------- carga ---------------- */

export interface MovimientoBanco {
  fecha: string
  valor: number
  signo: 1 | -1
  referencia: string
  concepto: string
  saldo: number | null
  signoInferido?: boolean
}

export interface Rango { desde: string; hasta: string; diasConMovimiento: number }

export type Cobertura =
  | { disponible: false; completo: true; aviso: '' }
  | {
      disponible: true
      desde: string
      hasta: string
      mes: string
      dias: number
      diasDelMes: number
      diasConMovimiento: number
      completo: boolean
      faltanInicio: number
      faltanFin: number
      multiMes: boolean
      aviso: string
    }

export type AnalisisSaldos =
  | { disponible: false; motivo: string }
  | {
      disponible: true
      descendente: boolean
      saldoInicial: number
      saldoFinal: number
      saltos: number
      rupturas: number
      integro: boolean
      detalleRupturas: { fecha: string; saltoSaldo: number; valorEsperado: number; diferencia: number }[]
    }

export interface Regla { codigo: string; etiqueta: string; categoria: string; alertar: boolean }

export interface PendientesBanco {
  revisar: (MovimientoBanco & { regla: Regla | null; idx: number })[]
  grupos: { regla: Regla; movimientos: (MovimientoBanco & { idx: number })[]; monto: number }[]
  nClasificados: number
  montoClasificado: number
}

export interface AnalisisExtracto {
  archivo: string
  tamano: number
  huella: string
  formato: string | null
  nombreFormato: string | null
  generico: boolean
  movimientos: MovimientoBanco[]
  hojas: string[]
  hojasNoReconocidas: string[]
  rango: Rango | null
  cobertura: Cobertura
  saldos: AnalisisSaldos
  clasificacion: PendientesBanco
  entradas: number
  salidas: number
  neto: number
}

export interface Asiento {
  fecha: string
  valor: number
  signo: 1 | -1
  referencia: string
  tipo: string
  subtipo: string
  cliente: string
}

export interface AnalisisLibro {
  archivo: string
  tamano: number
  huella: string
  asientos: Asiento[]
  rango: Rango | null
  debe: number
  haber: number
  cuentas: { dominante: string; ajenos: Asiento[]; hayDatos: boolean; conteo: Record<string, number> }
}

export interface ResultadoGuardado {
  loteId?: string
  nuevas?: number
  duplicadas?: number
  yaCargado?: { fecha: string; movimientos: number; archivo: string }
}

export interface Lote {
  _id: string
  origen: 'BANCO' | 'SISTEMA'
  archivoNombre: string
  formato: string | null
  fechaDesde: string | null
  fechaHasta: string | null
  filasLeidas: number
  filasNuevas: number
  filasDuplicadas: number
  mensaje: string
  estado: string
  createdAt: string
}

/* ---------------- conciliación ---------------- */

export interface FilaBanco {
  id: string
  fecha: string
  descripcion: string | null
  referencia: string | null
  valor: number
  saldoCorrido: number | null
}

export interface FilaLibro {
  id: string
  fecha: string
  tipoComprobante: string | null
  numeroComprobante: string | null
  concepto: string | null
  tercero: string | null
  valor: number
}

export interface Coincidencia {
  sistema: { idx: number; fecha: string; valor: number; signo: 1 | -1; referencia: string; tipo: string; cliente: string }
  banco: { idx: number; fecha: string; valor: number; signo: 1 | -1; referencia: string; concepto: string }
  difValor: number
  difDias: number
  exacta: boolean
  via: 'referencia' | 'importe'
  ambigua: boolean
}

export interface Resumen {
  totalSistema: number
  totalBanco: number
  conciliados: number
  porReferencia: number
  exactos: number
  conDiferenciaCentavos: number
  conDiferenciaFecha: number
  ambiguas: number
  pendientesSistema: number
  pendientesBanco: number
  montoSistema: number
  montoBanco: number
  montoPendienteSistema: number
  montoPendienteBanco: number
}

export interface Cuadre {
  saldoBanco: number | null
  saldoLibros: number | null
  pendienteSistema: number
  pendienteBanco: number
  bancoAjustado: number | null
  librosAjustado: number | null
  diferencia: number | null
  cuadra: boolean
}

export interface PeriodoGuardado {
  id: string
  estado: 'EN_PROCESO' | 'CUADRADO' | 'CERRADO'
  cuadra: boolean
  diferencia: number | null
  corridoEn: string | null
  cerradoEn: string | null
  nota: string | null
}

export interface MovSistema extends Asiento { idx: number }

export interface Conciliacion {
  cuenta: { id: string; alias: string; banco: string; saldoInicial: number }
  meses: string[]
  mes: string
  filasBanco: FilaBanco[]
  filasLibro: FilaLibro[]
  libroDelMes: number
  resultado: {
    coincidencias: Coincidencia[]
    soloSistema: MovSistema[]
    soloBanco: (MovimientoBanco & { idx: number })[]
    resumen: Resumen
  }
  cobertura: Cobertura
  pendientesBanco: PendientesBanco
  pendientesLibro: { dentro: MovSistema[]; arrastre: MovSistema[]; despues: MovSistema[]; sinFecha: MovSistema[]; aplicado: boolean }
  cuadre: Cuadre
  saldoBancoDelExtracto: boolean
  parametros: { tolerancia: number; ventanaAntes: number; ventanaDespues: number; mesesAtras: number }
  periodo: PeriodoGuardado | null
  tomadosEnOtroPeriodo: { banco: number; libro: number }
}

export interface Guardado {
  ok: true
  matches: number
  partidas: number
  cuadra: boolean
  diferencia: number | null
  cerrado: boolean
}
