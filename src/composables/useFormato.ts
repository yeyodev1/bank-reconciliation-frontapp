const fmt = new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function dinero(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—'
  return fmt.format(n)
}

export function fecha(iso: string | null | undefined): string {
  if (!iso) return '—'
  const [a, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${a}`
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

export function nombreMes(periodo: string): string {
  const [a, m] = periodo.split('-').map(Number)
  return `${MESES[(m ?? 1) - 1] ?? ""} ${a}`
}

export function cuando(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' })
}

export function mensajeDe(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: string }).message)
  return 'Error desconocido'
}
