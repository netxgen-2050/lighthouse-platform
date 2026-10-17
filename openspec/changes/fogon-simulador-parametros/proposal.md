# Proposal

## Why

El diseño legal B (la Fundación es dueña de la tierra y la plata entra por un programa de fideicomisos por series, con rendimiento con tope) tiene una tokenomics con parámetros que hoy propuso Claude y ajustaron Gus y Vagner (`NS_Tokenomics`, doc 28 §7). El issue #94 y el ítem D8 del backlog piden que el Fogón termine llevando la consulta y la decisión de esos parámetros. Antes de decidir nada, el equipo necesita **ver qué cambia cuando se mueve un valor**: cuánto recibe el procomún, cuánto los inversores y cuánto NetX. Este cambio es el **primer paso de D8**: un simulador sin base de datos que corre el mismo modelo que `sim/series_waterfall_sim.py`, separando los **valores que se deciden** de los **datos que se miden**.

## What Changes

- **Modelo de series en TypeScript**: el modelo de cascada de `sim/series_waterfall_sim.py` (v0.1, 17-oct-2026) pasado a una función pura, sin React ni Next, con los dos escenarios del modelo: **A · Viñedo de 10 ha** (15 años) y **B · Agrovoltaica de 5 MW** (20 años). Tests que reproducen `sim/RESULTS_series_waterfall.md` con los valores de partida, con tolerancia explícita. Los supuestos del modelo quedan escritos en el código y en la pantalla.
- **Tipos separados**: valores que se deciden (regalía de regeneración, canon por hectárea, tope de las Unidades, reparto del excedente, comisión de NetX, meta de la primera pérdida, descuento del SAFU), datos que se miden (rendimiento del viñedo, precio del vino, costo del parque solar, precio de la energía) y supuestos fijos del modelo (hectáreas, estructura de capital, tasa de las Notas Verdes, múltiplo de salida, etc.).
- **Pantalla `/fogon/simulador`**, enlazada desde `/fogon`:
  - Elegir el escenario (Viñedo o Agrovoltaica).
  - **Valores que se deciden**: un control por valor, con etiqueta, unidad y valor de partida, y el texto informativo "Quién decide (propuesta, a discutir)" según la tabla del issue #94. El descuento del SAFU se muestra pero no se mueve: el modelo de series no lo usa.
  - **Datos que se miden (no se votan)**: un control por dato con su fuente ("supuesto del modelo, a confirmar con …").
  - **Vivienda** (entrada y canon anual): "sin dato", con quién lo decide.
  - Botón **"Volver a los valores de partida"**.
  - **Resultado**: tabla por clase (Procomún, Unidades de Regeneración, Primera pérdida, Notas Verdes, NetX) con lo que pone, lo que recibe, el múltiplo y la TIR; el donut existente con tabla equivalente; "USD 1.000 en Unidades" (total y TIR); y la tabla año por año plegada.
  - Avisos: "Prototipo interno · datos de ejemplo" y el aviso propio "Prototipo interno · valores de partida, no son una oferta ni un pronóstico · el diseño legal no lo revisó un abogado", que vive en el catálogo legal como borrador.
- **Catálogo legal**: el aviso del simulador y los términos ⚖ que aparecen en la pantalla (Unidades de Regeneración, Notas Verdes, primera pérdida, SAFU, serie del programa de fideicomisos), todos `borrador: true`.

**Supuestos que toma esta spec** (Gus los puede cambiar):
- Los datos que se miden **se pueden mover** en el simulador para ver la sensibilidad, pero quedan en un grupo aparte, rotulado "no se votan", con su fuente.
- Al mover el rendimiento del viñedo en madurez, la curva de los primeros años se escala en la misma proporción (0, 0, 2, 4, 6 y 7 t/ha con el valor de partida).
- El múltiplo de salida, la estructura de capital y la tasa de las Notas Verdes no figuran en la tabla del issue: quedan como **supuestos fijos del modelo**, visibles pero sin control.
- Nada se guarda: el estado vive en la página y se pierde al recargar.

**Fuera de alcance:**
- Consultas, votos y decisiones reales sobre los parámetros, ámbitos (Fundación, serie, residentes), reglas y actas: van cuando el Fogón tenga base y ámbitos (resto de D8).
- Plata real, cobros o cualquier oferta: el simulador no capta ni promete nada.
- Monte Carlo (`sim/series_montecarlo_sim.py`) y cualquier análisis de riesgo.
- Cambiar el modelo: la función reproduce `series_waterfall_sim.py` tal cual, con sus supuestos. Si el modelo cambia en `NS_Tokenomics`, va en otro cambio.
- El "camino del vino" (botellas), el recorrido "invertir hoy y vivir acá en 10 años" y la conversión del SAFU: no tienen control en este cambio.
- Guardar escenarios, compartirlos por enlace o exportarlos.
- Versión en inglés de la pantalla.

## Capabilities

### New Capabilities
- `modelo-series`: cálculo de la cascada de una serie del programa de fideicomisos (quién cobra qué, en qué orden y hasta qué tope), con los valores que se deciden, los datos que se miden y los supuestos separados.
- `fogon-simulador`: pantalla del Fogón para mover los parámetros de la tokenomics del diseño B y ver cómo cambian los flujos al procomún, a los inversores y a NetX.

### Modified Capabilities

## Impact

Código nuevo: `lib/series/` (tipos, escenarios, modelo y tests), `app/fogon/simulador/` (página y cliente), un bloque con enlace en `app/fogon/page.tsx`, entradas nuevas en `lib/legal/terminos.ts`, una prop opcional en `components/donut.tsx` para el encabezado de la tabla, `e2e/fogon-simulador.spec.ts` y una ruta más en `e2e/accesibilidad.spec.ts`. Sin dependencias nuevas, sin pedidos de red, sin base de datos, sin permisos ni datos personales: no hace falta revisión del arquitecto.
