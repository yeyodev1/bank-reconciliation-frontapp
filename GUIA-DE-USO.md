# Guía de uso · Conciliación bancaria

App: https://bank-reconciliation-frontapp.vercel.app
Entrar con: `dreyes@bakano.ec` / `123456789`

Archivos de prueba (formato Banco Pichincha + libro del sistema, marzo 2026):
`conciliacion-backapp/pruebas/banco-marzo-2026.xlsx` y `.../sistema-marzo-2026.xlsx`.

---

## La idea en una frase

El banco dice una cosa (extracto) y tu contabilidad dice otra (libro). Conciliar es **explicar cada
diferencia** hasta que los dos saldos coincidan. Cuando coinciden, el mes **cuadra** y se **cierra**.

---

## Paso 0 · Cuentas

Menú → **Cuentas** → **Nueva cuenta**.

| Campo | Qué poner |
|---|---|
| Banco / Número / Nombre corto | Los de la cuenta real. El nombre corto es el que verás en todos lados. |
| Saldo inicial + Fecha | El saldo del banco el día que empiezas a conciliar. **De aquí arranca todo el cuadre.** Si empiezas en marzo, pon el saldo al 28 de febrero. |

Con el archivo de prueba usa saldo inicial `0` y fecha `2026-03-01`.

Marca la cuenta con el radio de la izquierda: queda como "Cuenta en uso" (abajo en el menú).

## Paso 01 · Excel del BANCO

Arrastra el extracto (tal como lo descargas del banco). **No se guarda todavía**: primero se lee y ves:

- **Formato reconocido** (recuadro con borde negro): sabe leer ese banco. Si dice **"No reconocí el
  formato"** (borde punteado) lo leyó línea por línea y dedujo los signos → revisa antes de guardar.
- **Entradas / Salidas / Neto / Periodo**: totales leídos.
- **Continuidad del saldo**: si cada salto de saldo cuadra con su movimiento, no falta ninguna fila.
  Si marca rupturas, al archivo le faltan filas o hay un signo al revés.
- **Cobertura del mes**: si el archivo cubre el mes completo. Medio mes = diferencias falsas.
- Tabla de movimientos: `+` entra, `−` sale.

Abajo elige la cuenta y **Guardar N movimientos**. Si subes el mismo archivo dos veces, te lo dice
y no duplica nada.

## Paso 02 · Excel del SISTEMA

Igual, con el reporte del libro de bancos del sistema contable (columnas TIPO, # COMPR., FECHA COMPR.,
SUBTIPO, NOMBRE CLTE., D/H, VALOR). Verás Debe/Haber y la **cuenta contable dominante**: si hay
asientos de otra cuenta contable, te avisa (no los subas a esta cuenta).

## Paso 03 · Conciliación del mes — el cuadre

Elige cuenta y mes. El motor empareja solo: primero por **número de documento igual** en los dos lados,
luego por **importe + signo + fecha** (tolerancia ±0,05 y ventana −3/+30 días).

### Cómo leer el cuadre (las 5 cifras)

```
Saldo según banco          ← lo que dice el extracto (último saldo corrido)
+ pendientes del sistema   ← asientos que el libro ya tiene y el banco todavía no
= banco ajustado

Saldo según libros         ← saldo inicial + todos los asientos del libro hasta fin de mes
+ pendientes del banco     ← movimientos que el banco hizo y el libro todavía no tiene
= libros ajustado

Diferencia = banco ajustado − libros ajustado
```

- **Diferencia 0,00 → "El mes cuadra."** (cifra en negro) — todo lo que no empareja está explicado
  como pendiente de un lado o del otro.
- **Diferencia ≠ 0 → "Faltan X por explicar."** — hay algo mal: una fila que falta en un archivo,
  un signo invertido, un saldo inicial equivocado, o un asiento que va en otra cuenta.

### Las tres pestañas

| Pestaña | Qué hay | Etiqueta | Significado |
|---|---|---|---|
| **Emparejados** | Parejas banco ↔ sistema | `referencia` (negra) | mismo número de documento: el más seguro |
| | | `exacto` (gris) | mismo importe y fecha dentro de ventana |
| | | `tolerancia` (punteada) | importe con diferencia de centavos |
| | | `ambiguo` | había más de un candidato: revísalo |
| **Pendientes del banco** | Lo que el banco movió y el libro no tiene | nombre del cargo (gris) | comisión, impuesto, etc.: el sistema lo reconoció → hay que **registrarlo en contabilidad** |
| | | `por investigar` (negra rellena) | no sabe qué es: pregúntale al banco / busca el soporte |
| **Pendientes del sistema** | Lo que el libro tiene y el banco no | *Dentro del extracto* | cheque girado que nadie cobró aún (en tránsito) — normal |
| | | *Arrastre* | de meses anteriores, sigue sin cobrarse |
| | | *Posteriores* | fecha después del extracto: todavía no le tocaba |

### Colores e iconos (siempre significan lo mismo)

| Color | Icono | Significa | Dónde lo ves |
|---|---|---|---|
| 🟢 **Verde** | ✓ `circle-check`, ↓ `arrow-down` | entra dinero · correcto · cuadra | Entradas, "Conciliados", "El mes cuadra", continuidad OK, etiqueta `exacto` |
| 🔴 **Rojo** | ✕ `circle-xmark`, ↑ `arrow-up`, 🔍 `magnifying-glass` | sale dinero · error · por investigar | Salidas, diferencia ≠ 0, avisos de error, etiqueta `por investigar` |
| 🟠 **Ámbar** | ⚠ `triangle-exclamation`, ⏳ `hourglass` | atención: revisar antes de seguir | cobertura incompleta, formato no reconocido, `tolerancia`, `ambiguo`, `signo deducido`, mes "en proceso", pendientes |
| 🔵 **Azul** | # `hashtag`, 🏷 `tag`, ⓘ `circle-info` | información · emparejado por documento | etiqueta `referencia`, cargos bancarios reconocidos, avisos informativos |
| ⚫ **Negro** | 🔒 `lock` | estado fuerte / bloqueado | mes cerrado (fondo negro), botones principales |
| ⚪ **Gris** | — | secundario | etiquetas de tablas, notas, valores de apoyo |

Los avisos llevan una **barra izquierda** del color de su significado. Las cifras llevan una **línea
superior** verde/roja/ámbar cuando su valor es positivo/negativo/de atención.

### Los tres botones del mes

1. **Guardar esta corrida** — deja constancia de lo que ves (emparejamientos y pendientes). Se puede
   guardar cuantas veces quieras; cada vez reemplaza la anterior.
2. **Cerrar el mes** — solo se activa si **cuadra**. Bloquea el mes: no admite movimientos nuevos con
   fecha dentro de él. Pide confirmación.
3. **Reabrir el mes** — si llegó un extracto complementario. Exige motivo (≥ 10 caracteres) y queda
   registrado.

### Con los archivos de prueba verás

3 emparejados por referencia (1001, 2001, 1002) · 2 pendientes del banco (comisión 3,20 reconocida;
cheque 2003 por investigar) · 1 pendiente del sistema (cheque 2002 en tránsito) · **Diferencia 0,00
→ cuadra** → se puede cerrar marzo.

---

## Si no cuadra: qué mirar, en orden

1. **Saldo inicial de la cuenta**: ¿es el del banco al día anterior al primer extracto?
2. **Cobertura**: ¿el extracto trae el mes entero?
3. **Continuidad**: ¿hay rupturas? Falta una fila o un signo está al revés.
4. **Pendientes del banco "por investigar"**: cada uno es un asiento que la contabilidad no hizo.
5. **Cuenta contable ajena** en el libro: asientos de otra cuenta metidos en esta.
