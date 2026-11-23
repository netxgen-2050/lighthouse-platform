# Design

## Parámetros (en `lib/bien-comun/modelo.ts`)

`VERSION_SIM_BARRIO = { archivo: "sim/barrio_stack_sim.py", version: "v0.1", fecha: "2026-11-19" }` y `BARRIO`, cada valor `{ valor, fuente }`:

| Clave | Valor | Fuente |
|---|---|---|
| `lotes` | 21 | slides del 9-nov (doc 34 §4) |
| `precioLote` | promedio de `MODELO_LOTES.precioLote.min` y `.max` (27.500) | `lib/lotes/modelo.ts` ← `lot_sale_sim.py` |
| `infraestructuraPorLote` | `MODELO_LOTES.infraestructuraPorLote` (12.000) | `lib/lotes/modelo.ts` |
| `imprevistos` | 0,10 | `barrio_stack_sim.py` [criterio] |
| `armadoLegal` | 40.000 | `barrio_stack_sim.py` [criterio], sin presupuesto |
| `prima` | 0,10 anual, simple | ejemplo de Juanpi en la call del 16-nov |
| `anticipo` | 0,20 | `barrio_stack_sim.py` [criterio] |
| `cuotas` | 24 | caso base de `barrio_stack_sim.py` |
| `ritmo` | 2 lotes por trimestre | caso base de `barrio_stack_sim.py` |
| `parteDueno` | `MODELO_LOTES.parteDelDueno` (0,20) | `lib/lotes/modelo.ts` |
| `corredor` | 0,04 | `lot_sale_sim.py` [criterio] |
| `contratoNetx` | 0,03 | `lot_sale_sim.py` [verificar] |
| `parteComun` | `MODELO_LOTES.aporteUnico` (0,05) | `lib/lotes/modelo.ts` |
| `expensa` | `MODELO_LOTES.expensaAnual` (1.200) | `lib/lotes/modelo.ts` |
| `presupuestoComun` | `MODELO_LOTES.presupuestoComunAnual` (72.000) | `lib/lotes/modelo.ts` ← `sim/RESULTS.md` |
| `horizonteMeses` | 72 | `barrio_stack_sim.py` |

Si al implementar algún valor de `lib/lotes/modelo.ts` no coincide con el del simulador, se frena y se reporta: no se duplica ni se ajusta a mano.

**Lotes del plano.** El loteo de `lighthouse-norte` tiene `lotesDelSector()` lotes. Si no es 21, la sección lo dice en una línea ("el barrio del doc 34 tiene 21 lotes; el plano cargado, N") y la calculadora usa 21, que es el caso del doc 34. No se unifican.

## Cálculo (en `lib/bien-comun/barrio.ts`)

Funciones puras, sin React, que traducen el simulador línea por línea (incluida la forma en que el simulador cuenta las expensas de cada año, con los lotes vendidos a mitad de año):

- `montoALevantar(p)` = `lotes × infraestructuraPorLote × (1 + imprevistos) + armadoLegal`.
- `cobrosPorMes(p)`: lo que pagan los compradores cada mes (lotes que se venden al inicio de cada trimestre; contado si `cuotas = 0`).
- `cobrandoConLasCuotas(p)` → `{ mes: number | null, totalRecibido, sobranteFideicomiso }` (`pass_through`). `mes = null` significa "no en 6 años".
- `coberturaAFechaFija(p, meses)` → fracción (`coverage`).
- `alComunPorAnio(p)` → 6 filas `{ anio, parteDeLosPagos, expensas, total, lotesVendidos }` (`commons_by_year`).
- `parteQueQuedaEnElFideicomiso(p)` = `1 − parteDueno − corredor − contratoNetx − parteComun`.

Entradas inválidas (vacías, negativas, no numéricas, cuotas o ritmo no enteros) devuelven `{ ok: false }`: la pantalla muestra "sin dato" y ningún número.

### Tests contra `RESULTS_barrio_stack.md`

- Monto a levantar: 317.200.
- Caso base (2 por trimestre, 24 cuotas, 27.500): mes 48, total 384.382, sobrante 8.318 (redondeados).
- Lotes a 40.000, 2 por trimestre, 24 cuotas: mes 29.
- 1 lote por trimestre, 27.500, 24 cuotas: `mes = null`.
- Cobertura a 12 meses, caso base: 21 %; a 24 meses: 53 %.
- Al común, caso base: 12.700, 26.150, 34.275, 29.600, 25.750, 25.200.
- Parte que queda en el fideicomiso: 0,68.

## Presentación

- `components/bien-comun/calculadora-barrio.tsx` (cliente) recibe los valores de partida y los textos por props; el cálculo lo hace importando `lib/bien-comun/barrio.ts` (lógica pura, sin estilos), así el rediseño solo toca el componente.
- Cinco campos con `<label>` visible, unidad en el texto y valor de partida a la vista ("de partida: …"). Botón "Volver a los valores de partida". Sin `localStorage`, sin query string.
- Resultados en una región `aria-live="polite"`. La tabla del común es una `<table>` con `<caption>`; si hace falta scroll, región con `tabIndex=0` y nombre accesible, como el resto de la página.
- El texto de los resultados del carril A puede decir "le vuelve la plata al inversor" y "prima": queda bajo la clave `barrio` del diccionario, que la regla de promesas (cambio 1, `design.md` §4) permite junto con `carriles.a`. Ningún resultado habla de FARO.
- Debajo, en una línea: "faltan los costos de Vagner: sin dato" y las conclusiones del doc 34 §4 en palabras simples (margen fino; la fecha fija no cierra con cuotas; lo común necesita ingresos propios).
