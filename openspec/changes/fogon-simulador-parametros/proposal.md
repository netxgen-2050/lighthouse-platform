# Proposal

## Why

El diseño legal B (la Fundación es dueña de la tierra y la plata entra por un programa de fideicomisos por series, con rendimiento con tope) tiene una tokenomics con parámetros que hoy propuso Claude y ajustaron Gus y Vagner (`NS_Tokenomics`, doc 28 §7). El issue #94 y el ítem D8 del backlog piden que el Fogón termine llevando la consulta y la decisión de esos parámetros. Antes de decidir nada, el equipo necesita **ver qué cambia cuando se mueve un valor**: cuánto recibe el procomún, cuánto los inversores y cuánto NetX. Este cambio es el **primer paso de D8**: un simulador sin base de datos que corre el mismo modelo que `sim/series_waterfall_sim.py`, separando los **valores que se deciden** de los **datos que se miden**.

## What Changes

- **Modelo de series en TypeScript**: el modelo de cascada de `sim/series_waterfall_sim.py` (v0.1, 17-oct-2026) pasado a una función pura, sin React ni Next, con los dos escenarios del modelo: **A · Viñedo de 10 ha** (15 años) y **B · Agrovoltaica de 5 MW** (20 años). Tests que reproducen `sim/RESULTS_series_waterfall.md` con los valores de partida, con tolerancia explícita. Los supuestos del modelo quedan escritos en el código y en la pantalla.
- **Tipos separados**: valores que se deciden (regalía de regeneración, canon por hectárea, tope de las Unidades, reparto del excedente, comisión de NetX, meta de la primera pérdida, descuento del SAFU), datos que se miden (rendimiento del viñedo, precio del vino, costo del parque solar, precio de la energía), **supuestos del modelo a confirmar con Vagner** (múltiplo de salida, estructura de capital, tasa de las Notas Verdes, reserva y curva escalada del viñedo) y supuestos fijos (hectáreas, horizonte, costos, plazo y gracia de las Notas, etc.).
- **Dos agregados de la plataforma que no están en el `.py`**, documentados como tales y con su test: la **conversión del SAFU** con su descuento ("USD 1.000 en SAFU se convierten en USD 1.250 de Unidades") y la **TIR por encima de 100 % anual** (el `.py` la deja en `NaN`; acá se calcula y se muestra).
- **Pantalla `/fogon/simulador`**, enlazada desde `/fogon`:
  - Elegir el escenario (Viñedo o Agrovoltaica).
  - **Valores que se deciden**: un control por valor, con etiqueta, unidad y valor de partida, y el texto informativo "Quién decide (propuesta, a discutir)" según la tabla del issue #94. El descuento del SAFU también se mueve: no cambia la cascada de la serie, solo la conversión del SAFU.
  - **Datos que se miden (no se votan)**: un control por dato con su fuente y su valor de partida, para que la persona evalúe los casos posibles. En el mismo grupo, el subgrupo **"Supuestos del modelo · a confirmar con Vagner"**, también movibles.
  - **Vivienda** (entrada y canon anual): "sin dato", con quién lo decide.
  - Botón **"Volver a los valores de partida"**.
  - **Resultado**: tabla por clase (Procomún, Unidades de Regeneración, Primera pérdida, Notas Verdes, NetX) con lo que pone, lo que recibe, el múltiplo y la TIR (siempre con su valor, aunque pase el 100 % anual); el donut existente con tabla equivalente; "USD 1.000 en Unidades" (total y TIR); "USD 1.000 en SAFU se convierten en USD … de Unidades"; y la tabla año por año plegada.
  - Avisos: "Prototipo interno · datos de ejemplo" y el aviso propio "Prototipo interno · valores de partida, no son una oferta ni un pronóstico · el diseño legal no lo revisó un abogado", que vive en el catálogo legal como borrador.
- **Catálogo legal**: el aviso del simulador y los términos ⚖ que aparecen en la pantalla (Unidades de Regeneración, Notas Verdes, primera pérdida, SAFU, serie del programa de fideicomisos), todos `borrador: true`.

**Decisiones de Gus (PR #96, 21-oct-2026):**
- Los datos que se miden **se pueden mover** para evaluar los casos posibles; quedan en un grupo aparte que dice "no se votan", con su fuente y su valor de partida.
- El múltiplo de salida, la estructura de capital (60 % Notas Verdes al 7 % en la agrovoltaica), la reserva y la curva escalada del viñedo son **supuestos del modelo**, visibles y movibles en el grupo de datos, marcados "a confirmar con Vagner" (Gus se lo pregunta).
- El simulador **calcula la conversión del SAFU** con el descuento, como cálculo propio de la plataforma.
- La TIR se muestra **siempre con su valor**, aunque supere el 100 % anual; "sin dato" solo si no se puede calcular.
- Los términos ⚖ nuevos y el aviso del simulador quedan como **borrador**.

**Supuestos que toma esta spec:**
- Al mover el rendimiento del viñedo en madurez, la curva de los primeros años se escala en la misma proporción (0, 0, 2, 4, 6 y 7 t/ha con el valor de partida). Se puede apagar: entonces los años 1 a 5 quedan en 0, 0, 2, 4 y 6 t/ha, como en el `.py`.
- La reserva es parte de lo que se levanta: subirla sube el capital de la serie.
- Plazo (12 años) y gracia (1 año) de las Notas Verdes, horizonte, hectáreas y costos quedan fijos y visibles: no están entre los supuestos que Gus pidió mover.
- Nada se guarda: el estado vive en la página y se pierde al recargar.

**Fuera de alcance:**
- Consultas, votos y decisiones reales sobre los parámetros, ámbitos (Fundación, serie, residentes), reglas y actas: van cuando el Fogón tenga base y ámbitos (resto de D8).
- Plata real, cobros o cualquier oferta: el simulador no capta ni promete nada.
- Monte Carlo (`sim/series_montecarlo_sim.py`) y cualquier análisis de riesgo.
- Cambiar el modelo: con los valores de partida, la función reproduce `series_waterfall_sim.py` tal cual. Los únicos agregados son la conversión del SAFU y la TIR por encima de 100 %. Si el modelo cambia en `NS_Tokenomics` (por ejemplo, después de la respuesta de Vagner), va en otro cambio.
- Encadenar el SAFU con una serie (qué recibirían esas Unidades de la Serie Madre): el SAFU convierte en Unidades de la Serie Madre, que este modelo no tiene.
- El "camino del vino" (botellas) y el recorrido "invertir hoy y vivir acá en 10 años": no tienen control en este cambio.
- Mover plazo y gracia de las Notas Verdes, horizonte, hectáreas o costos.
- Guardar escenarios, compartirlos por enlace o exportarlos.
- Versión en inglés de la pantalla.

## Capabilities

### New Capabilities
- `modelo-series`: cálculo de la cascada de una serie del programa de fideicomisos (quién cobra qué, en qué orden y hasta qué tope), con los valores que se deciden, los datos que se miden y los supuestos separados.
- `fogon-simulador`: pantalla del Fogón para mover los parámetros de la tokenomics del diseño B y ver cómo cambian los flujos al procomún, a los inversores y a NetX.

### Modified Capabilities

## Impact

Código nuevo: `lib/series/` (tipos, escenarios, modelo y tests), `app/fogon/simulador/` (página y cliente), un bloque con enlace en `app/fogon/page.tsx`, entradas nuevas en `lib/legal/terminos.ts`, una prop opcional en `components/donut.tsx` para el encabezado de la tabla, `e2e/fogon-simulador.spec.ts` y una ruta más en `e2e/accesibilidad.spec.ts`. Sin dependencias nuevas, sin pedidos de red, sin base de datos, sin permisos ni datos personales. El arquitecto lo revisó (TIR "sin dato", constante de versión) y propuso ADR-010, que sigue **en Propuesta** hasta que Gus lo lea. Hay otra spec en preparación (`fogon-propuestas-github`) que también quiere el número ADR-010: el cambio que entre segundo a `dev` renumera su ADR.

**Pregunta abierta (para Vagner, vía Gus):** ¿son correctos el múltiplo de salida (6 en el viñedo, 3 en la agrovoltaica), la estructura de capital (viñedo 15 % primera pérdida · 85 % Unidades; agrovoltaica 60 % Notas Verdes al 7 % · 10 % primera pérdida · 30 % Unidades), la reserva (USD 220.000 en el viñedo, 0 en la agrovoltaica) y escalar la curva del viñedo con el rendimiento en madurez? Si cambian, va en otro cambio con los números de referencia nuevos (ADR-010).
