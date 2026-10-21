# Design

## Contexto

- Fuente del modelo: `NS_Tokenomics/sim/series_waterfall_sim.py` (v0.1, 17-oct-2026, rama `main` de NS_Tokenomics). Resultados de referencia: `sim/RESULTS_series_waterfall.md`. Parámetros y quién los ajusta: doc 28 §7. Quién decide cada valor: tabla del issue #94.
- El Fogón ya tiene el donut accesible (`components/donut.tsx`) y el patrón de página (`app/fogon/page.tsx`, `app/fogon/consultas/`). No hay base de datos ni pedidos de red en este cambio.
- El implementador **no tiene que leer NS_Tokenomics**: este documento copia todo lo que necesita (fórmulas, valores de partida y números de referencia). Si encuentra una diferencia entre este documento y el `.py`, manda el `.py` y lo reporta en el PR.

## Objetivos / No objetivos

- Objetivo: reproducir el modelo tal cual, con sus supuestos escritos, y mostrarlo en una pantalla accesible que separa lo que se decide de lo que se mide.
- No objetivo: mejorar el modelo, agregar escenarios, Monte Carlo, consultas o votos sobre los parámetros, guardar nada.

## 1. Archivos

```
lib/series/
  tipos.ts          tipos de parámetros y resultados
  escenarios.ts     Viñedo y Agrovoltaica: valores de partida, metadatos (unidad, quién decide, fuente, rango) y supuestos
  modelo.ts         correrSerie(), tir(), anualidad(), porMil()
  modelo.test.ts    reproduce RESULTS_series_waterfall.md + escenarios de la spec
  safu.ts           convertirSafu() — agregado de la plataforma, no está en el .py
  safu.test.ts
  formato.ts        usd(), pct(), multiplo() con "sin dato" para null
  formato.test.ts
app/fogon/simulador/
  page.tsx          servidor: metadata, avisos, encabezado
  simulador-cliente.tsx  estado de los controles y resultado
```

`lib/series/` no importa React, Next ni nada de `lib/fogon` (test de fuente, como en `lib/cuadratico`).

## 2. Tipos

```ts
type IdEscenario = "vinedo" | "agrovoltaica";

/** Valores que se deciden (gobernanza). Los porcentajes van como fracción: 0.05 = 5 %. */
type ValoresDecididos = {
  regalia: number;            // sobre ingresos brutos
  canonPorHa: number;         // USD por ha por año
  topeUnidades: number;       // anual
  parteExcedenteUnidades: number; // 0.20 → 80 % procomún · 20 % Unidades
  comisionNetx: number;       // anual, sobre el capital levantado
  metaPrimeraPerdida: number; // anual
  descuentoSafu: number;      // solo lo usa convertirSafu(); la cascada no lo usa
};

/** Datos que se miden (no se votan). Cada escenario usa los suyos. */
type DatosMedidosVinedo = { rendimientoMadurezTHa: number; precioVinoUsd: number };
type DatosMedidosAgrovoltaica = { costoUsdPorMw: number; precioEnergiaUsdMwh: number };

/** Supuestos del modelo a confirmar con Vagner: se mueven, no se votan. */
type SupuestosAjustables = {
  multiploSalida: number;
  parteNotas: number;          // fracción del capital; el viñedo la deja en 0 y sin control
  tasaNotas: number;           // anual; sin control en el viñedo
  partePrimeraPerdida: number; // fracción del capital
  reservaUsd: number;          // parte de lo levantado
  curvaEscalada: boolean;      // solo viñedo
};

type Metadato = {
  etiqueta: string; unidad: string; partida: number;
  min: number; max: number; paso: number;
  quienDecide?: string;   // solo en valores que se deciden
  fuente?: string;        // en datos que se miden y supuestos ajustables
};

type FilaAnio = {
  anio: number; ingresos: number; costos: number; aFundacion: number; comisionNetx: number;
  notas: number; unidades: number; primeraPerdida: number; excedenteProcomun: number;
};

type ResultadoClase = { pone: number; recibe: number; multiplo: number | null; tir: number | null };

type ResultadoSerie = {
  levantado: number;
  filas: FilaAnio[];
  notas: ResultadoClase | null;   // null si la serie no tiene Notas (Viñedo)
  primeraPerdida: ResultadoClase;
  unidades: ResultadoClase;
  procomun: { recibe: number };   // canon + regalía + excedente, todos los años
  netx: { recibe: number };
  flujosUnidades: number[];       // año 0 negativo
};
```

`correrSerie(id, decididos, medidos, supuestos)` arma los parámetros del escenario y corre la cascada. `porMil(flujosUnidades)` escala a USD 1.000 y devuelve `{ total, tir }` (`{ total: null, tir: null }` si las Unidades no pusieron nada). `convertirSafu(monto, descuento)` devuelve `monto / (1 − descuento)` (USD 1.000 con 20 % → USD 1.250 de Unidades), o `null` si el descuento no está en [0, 1) o el monto no es un número finito.

## 3. Traducción del modelo (fiel al `.py`)

Mismo orden de operaciones que `run_series`, para que los números coincidan:

1. `levantado = capex`; `notas = levantado × parteNotas`; `primeraPerdida = levantado × partePrimeraPerdida`; `unidades = levantado − notas − primeraPerdida`.
2. `reserva` (supuesto), `deficit = 0`, cuentas `cuentaUn = unidades`, `cuentaPp = primeraPerdida`, `saldoNotas = notas`, `cuota = anualidad(notas, tasaNotas, plazoNotas − graciaNotas)`. `anualidad` devuelve 0 con años ≤ 0 y `capital / años` con tasa 0; si no, `capital × tasa / (1 − (1 + tasa)^−años)`.
3. Para cada año `t` de 1 a `H`:
   - `aFundacion = canonPorHa × hectareas + regalia × ingresos(t)`; `comision = comisionNetx × levantado`; `caja = ingresos − costos − aFundacion − comision`.
   - Si `t === H`: `caja += reserva; reserva = 0; caja += multiploSalida × max(0, ingresos − costos − aFundacion − comision)`.
   - Notas: si `saldoNotas > 1e-6`, `pago = t ≤ gracia ? saldoNotas × tasa : min(cuota, saldoNotas × (1 + tasa))`; `caja −= pago`; si `t > gracia` y `saldoNotas > 1e-6`, `saldoNotas = max(0, saldoNotas × (1 + tasa) − pago)`.
   - Si `caja < 0`: se toma de la reserva lo que alcance y el resto suma al déficit; `caja = 0`. Si no: se repaga el déficit con la caja.
   - `cuentaUn *= 1 + topeUnidades`; `pagoUn = min(caja, cuentaUn)`; se descuenta de la cuenta y de la caja. Igual con la primera pérdida y su meta.
   - `extraUn = caja × parteExcedenteUnidades`; `excedenteProcomun = caja − extraUn`; `pagoUn += extraUn`.
   - Flujos del año: Notas `pago`, primera pérdida `pagoPp`, Unidades `pagoUn`, procomún `aFundacion + excedenteProcomun`, NetX `comision`.
4. `tir(flujos)`: bisección entre −0,99 y 1,0 con 200 iteraciones, igual que el `.py`. **Agregado de la plataforma (decisión de Gus, 21-oct-2026):** si `vpn(1,0) > 0` (rinde más de 100 % por año), en vez de devolver `null` se duplica el extremo superior (2, 4, 8, … hasta 1.024, o sea 102.400 % anual) hasta encontrar el cambio de signo y se hace la misma bisección en ese intervalo. Devuelve `null` solo si no hay cambio de signo en ningún intervalo (por ejemplo, la clase nunca recupera nada: rendimiento 0) o si la clase no puso plata. Con los valores de partida todas las TIR están dentro de (−99 %, 100 %), así que los números de referencia no cambian. `multiplo = recibe / pone`, `null` si `pone === 0`.
<!-- arquitecto: "sin dato" en la TIR no tiene que leerse como "no hay plata" -->
   **Nota en la pantalla.** Siempre que alguna TIR de la tabla sea `null`, debajo se muestra: "«sin dato» en la TIR: la clase no recupera lo que puso, así que no hay una tasa que calcular." Una TIR alta se muestra con su valor ("142,3 %"), nunca como "sin dato".
5. Defensa: `usd()`, `pct()` y `multiplo()` muestran "sin dato" también con `NaN` o `±Infinity`, nunca "NaN" ni "∞". <!-- arquitecto: el dato que falta no es cero, y tampoco "NaN" -->

**Escenarios.** Funciones de ingresos y costos por año, con los datos medidos como parámetro:

| | Viñedo (A) | Agrovoltaica (B) |
|---|---|---|
| Horizonte | 15 años | 20 años |
| Hectáreas (para el canon) | 10 | 12 |
| Capex (levantado) | 30.000 × 10 ha + 50.000 + `reservaUsd` (partida 220.000) = 570.000 | `costoUsdPorMw` × 5 MW + `reservaUsd` (partida 0) |
| Reserva (`reservaUsd`) | 220.000 | 0 |
| Estructura | `parteNotas` 0 (sin control) · `partePrimeraPerdida` 15 % · Unidades el resto (85 %) | `parteNotas` 60 % al `tasaNotas` 7 %, 12 años, 1 de gracia · `partePrimeraPerdida` 10 % · Unidades el resto (30 %) |
| Múltiplo de salida (`multiploSalida`) | 6 | 3 |
| Ingresos(t) | botellasVendidas(t) × `precioVinoUsd` | 5 × 1.900 × `precioEnergiaUsdMwh` × 0,995^(t−1) |
| Costos(t) | 6.000 × 10 + botellasVendidas(t) × 2,5 | 15.000 × 5 + 10.000 |

Viñedo: con `curvaEscalada` (partida), `cosechaTHa(t) = curva(t) × rendimientoMadurez / 7`, con `curva = {1: 0, 2: 0, 3: 2, 4: 4, 5: 6}` y 7 desde el año 6 (con el valor de partida da exactamente la curva del `.py`); sin `curvaEscalada`, `cosechaTHa(t) = curva(t)` los años 1 a 5 y `rendimientoMadurez` desde el año 6 (lo que hace el `.py` si solo se cambia la madurez); `toneladas(t) = cosechaTHa(t) × 10`; `botellasVendidas(t) = t ≥ 2 ? toneladas(t − 1) × 750 : 0` (cada cosecha se vende al año siguiente).

**Supuestos escritos** (comentario al inicio de `modelo.ts` y lista "Supuestos del modelo" en la pantalla): todo valor es ilustrativo, no es un pronóstico ni una oferta; la Fundación cobra antes que cualquier inversor; la serie no paga impuestos en el modelo; no hay inflación ni tipo de cambio; la salida vende lo que queda de la serie a un múltiplo de la caja operativa del último año; el vino se vende al año siguiente de la cosecha; la energía pierde 0,5 % por año; la curva del viñedo escala con el rendimiento en madurez (supuesto de la plataforma, no del `.py`, a confirmar con Vagner). Agregados de la plataforma que no están en el `.py`: la conversión del SAFU y la TIR por encima de 100 % anual.

## 4. Metadatos de los controles

Valores que se deciden (partida Viñedo / Agrovoltaica):

| Valor | Partida | Rango · paso | Quién decide (propuesta, a discutir) |
|---|---|---|---|
| Regalía de regeneración (% de los ingresos brutos) | 5 % / 5 % | 0–15 % · 0,5 | Consejo de la Fundación, con la Voz de la Tierra y consulta a residentes y miembros RAIZ |
| Canon (USD por ha por año) | 100 / 100 | 0–500 · 10 | Consejo de la Fundación |
| Tope de las Unidades (% anual) | 9 % / 10 % | 0–20 % · 0,5 | Consejo de la Fundación al abrir cada serie; los inversores aceptan o no al entrar |
| Reparto del excedente sobre el tope (parte de las Unidades) | 20 % / 20 % | 0–50 % · 5 | Consejo de la Fundación |
| Comisión de gestión de NetX (% anual del capital) | 1,5 % / 1 % | 0–3 % · 0,25 | Asamblea de inversores de cada serie (es su costo) |
| Meta de la primera pérdida (% anual) | 4 % / 5 % | 0–10 % · 0,5 | Se negocia con cada inversor catalítico |
| Descuento del SAFU al convertir | 20 % / 20 % | 0–40 % · 5 (solo cambia la conversión del SAFU, no la cascada) | NetX + Fundación, una vez por emisión |

Datos que se miden:

| Dato | Partida | Rango · paso | Fuente |
|---|---|---|---|
| Rendimiento del viñedo en madurez (t por ha) | 7 | 0–12 · 0,5 | Supuesto del modelo, a confirmar con un enólogo local |
| Precio del vino (USD por botella, neto para la serie) | 6 | 0–20 · 0,5 | Supuesto del modelo, a confirmar con un enólogo local |
| Costo del parque solar (USD por MW) | 800.000 | 400.000–1.600.000 · 50.000 | Supuesto del modelo, a confirmar con la cotización de un desarrollador |
| Precio de la energía (USD por MWh) | 60 | 0–150 · 5 | Supuesto del modelo, a confirmar con la cotización de un desarrollador y la consulta a la red |

Supuestos del modelo · a confirmar con Vagner (mismo grupo "no se votan", fuente de todos: "Supuesto del modelo, a confirmar con Vagner"):

| Supuesto | Partida Viñedo / Agrovoltaica | Rango · paso |
|---|---|---|
| Múltiplo de salida (veces la caja operativa del último año) | 6 / 3 | 0–10 · 0,5 |
| Parte de Notas Verdes (% del capital) | — (0 %, sin control) / 60 % | 0–70 % · 5 |
| Tasa de las Notas Verdes (% anual) | — / 7 % | 0–15 % · 0,5 |
| Parte de primera pérdida (% del capital) | 15 % / 10 % | 0–20 % · 5 |
| Reserva (USD, parte de lo levantado) | 220.000 / 0 | Viñedo 0–400.000 · 10.000 · Agrovoltaica 0–1.000.000 · 50.000 |
| La curva de los primeros años escala con el rendimiento en madurez (casilla) | sí / — | sí o no |

Con estos rangos las Unidades siempre ponen al menos el 10 % del capital. La pantalla muestra "Unidades: el resto (30 %)" debajo de los controles de estructura.

Vivienda: "Entrada: sin dato" y "Canon anual: sin dato"; quién decide: "Asamblea de residentes + Consejo, después de la aprobación municipal".

Supuestos fijos (visibles, sin control): horizonte, hectáreas, inversión física, costos, plazo (12 años) y gracia (1 año) de las Notas Verdes, venta del vino al año siguiente, pérdida de 0,5 % anual de la energía. Fuente común de los supuestos: "NS_Tokenomics, doc 28 §7 y sim/series_waterfall_sim.py (v0.1, 17-oct-2026)".

<!-- arquitecto: una sola constante de versión, para que la copia del modelo no se desfase en silencio (ADR-010) -->
**Versión del modelo.** `escenarios.ts` exporta `VERSION_MODELO = { fuente: "NS_Tokenomics/sim/series_waterfall_sim.py", version: "v0.1", fecha: "2026-10-17" }`. La fuente común de arriba, el comentario de `modelo.ts` y el comentario de la tabla esperada en `modelo.test.ts` salen de esa constante o la citan igual. El dueño del modelo es NS_Tokenomics: si el `.py` cambia, se abre otro cambio que actualiza la constante, la traducción y los números de referencia juntos (ADR-010, en Propuesta hasta que Gus lo lea; si `fogon-propuestas-github` también usa el número ADR-010, el cambio que entre segundo a `dev` renumera el suyo).

## 5. Pantalla

- Encabezado como `/fogon`: "← Fogón", aviso "Prototipo interno · datos de ejemplo", "Fogón de decisiones", `h1` "Simulador de la tokenomics (diseño B)", una frase de qué es, y el aviso del catálogo legal (`TERMINOS.avisosimulador`) en el mismo estilo de aviso (tokens `bg-warn-bg`, `text-warn-ink`).
- Escenario: `fieldset` con `legend` "Escenario" y dos `input type="radio"`.
- Cada grupo de controles en un `fieldset` con `legend` ("Valores que se deciden", "Datos que se miden (no se votan)"). Dentro del segundo, un `fieldset` anidado con `legend` "Supuestos del modelo · a confirmar con Vagner". Cada control: `label` unida a un `input type="range"` con `aria-valuetext` (por ejemplo "5,5 % de los ingresos brutos"), el valor visible en un `<output>` unido con `htmlFor`, "Valor de partida: …" y "Quién decide (propuesta, a discutir): …" o "Fuente: …", unidos al control con `aria-describedby`. La curva escalada es un `input type="checkbox"` con su `label`. El reparto del excedente muestra "80 % procomún · 20 % Unidades". El descuento del SAFU dice debajo "No cambia la serie: solo la conversión del SAFU".
- "Supuestos fijos" y "Vivienda" como bloques de texto (los supuestos fijos en un `details`).
- Botón "Volver a los valores de partida": restablece el escenario elegido y escribe "Volviste a los valores de partida" en una región `role="status"`.
- Resultado: un resumen corto en una región `aria-live="polite"` ("Procomún USD …, Unidades TIR …, NetX USD …"); tabla por clase con `caption`; el `Donut` con las porciones Procomún · Fundación, Unidades de Regeneración, Primera pérdida, Notas Verdes (si hay) y NetX; la frase de USD 1.000 en Unidades; la frase "USD 1.000 en SAFU se convierten en USD 1.250 de Unidades de la Serie Madre (descuento 20 %) · cálculo de la plataforma, no está en el modelo"; y `details` "Ver año por año" con la tabla (contenedor con scroll horizontal propio a 390 px).
- `Donut`: se le suma la prop opcional `columnaEtiqueta` (por defecto "Opción", así las consultas no cambian) para que la tabla diga "Clase".
- Formato: `Intl.NumberFormat("es-AR")`: "USD 1.290.250", "2,66x", "9,2 %"; `null` → "sin dato".
- Términos ⚖ (`TerminoLegal`) junto a "Unidades de Regeneración", "Notas Verdes", "Primera pérdida", "SAFU" y "serie".
- Todo con clases de tokens del tema; ningún color suelto (lo vigila `lib/sin-colores-sueltos.test.ts`).

## 6. Textos nuevos del catálogo legal (todos `borrador: true`)

- `avisosimulador` · "Aviso del simulador": "Prototipo interno · valores de partida, no son una oferta ni un pronóstico · el diseño legal no lo revisó un abogado".
- `unidadesregeneracion` · "Unidades de Regeneración": "Participaciones en una serie del programa de fideicomisos. Cobran después de la Fundación y de las Notas Verdes, y solo hasta un tope por año; lo que sobra va casi todo al procomún. No dan ningún derecho sobre la tierra, que sigue siendo de la Fundación."
- `notasverdes` · "Notas Verdes": "Deuda de una serie: cobra un interés fijo y devuelve su capital antes que los otros inversores. Su garantía es el derecho de superficie y las instalaciones de la serie, nunca la tierra."
- `primeraperdida` · "Primera pérdida": "Plata catalítica (fundaciones, fondos climáticos, donantes) que cobra después de las Unidades y es la primera en perder si el proyecto rinde menos. Esa protección es la que permite que entren inversores más prudentes."
- `safu` · "SAFU": "Acuerdo simple por Unidades futuras: alguien pone plata hoy, antes de que existan las series, y la recibe como Unidades de la Serie Madre cuando abra, con un descuento. Cómo se ofrece legalmente todavía lo tiene que confirmar un abogado."
- `serieprograma` · "Serie": "Un proyecto con su propia plata, sus propios ingresos y sus propios inversores (por ejemplo, el viñedo o el parque solar) dentro del programa de fideicomisos. Cada fideicomiso es un patrimonio separado: un problema en una serie no alcanza a otra."

## 7. Tolerancias de los tests

Los resultados de referencia están redondeados a enteros (montos), a dos decimales (múltiplos) y a un decimal (TIR). Los tests comparan con: montos ±1 USD, múltiplos ±0,01, TIR ±0,0005 (0,05 puntos). JavaScript y Python usan el mismo `double`; la tolerancia cubre el redondeo de la tabla y diferencias de último dígito entre `**` y `Math.pow`.

## Riesgos / trade-offs

- **Que se lea como una oferta.** Mitigación: los dos avisos arriba de los controles, "valores de partida" en todos los textos, ninguna llamada a invertir en la pantalla.
- **Mover datos medidos y supuestos parece "decidirlos".** Mitigación: grupo aparte con "(no se votan)", la fuente de cada uno y "a confirmar con Vagner" en los supuestos (decisión de Gus: se mueven para evaluar los casos posibles).
- **El modelo cambia en NS_Tokenomics** (por ejemplo, cuando responda Vagner). La versión está anotada (v0.1, 17-oct-2026); un cambio del modelo va en otro cambio con sus nuevos números de referencia.
- **La curva escalada del viñedo** es un supuesto de la plataforma; con el valor de partida no cambia nada y se puede apagar.
- **Agregados que no están en el `.py`** (SAFU y TIR sobre 100 %). Mitigación: viven en su propia función o rama del código, con comentario "agregado de la plataforma" y test propio; los números de referencia no cambian.
- **La copia del modelo se desfasa del `.py`.** <!-- arquitecto --> NS_Tokenomics manda sobre el modelo; acá hay una traducción. Mitigación: `VERSION_MODELO` visible en la pantalla, tabla de referencia completa en los tests y la regla de ADR-010 (un cambio del `.py` = un cambio OpenSpec con números nuevos). No se agrega ningún chequeo automático entre repos en este cambio.
- **TIR muy alta leída como "sin dato".** <!-- arquitecto --> Resuelto: la TIR sobre 100 % se calcula y se muestra (§3, punto 4).
