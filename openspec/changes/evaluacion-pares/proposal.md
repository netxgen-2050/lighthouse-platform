# Proposal

## Why

La ronda de reconocimiento de `/semillas` ya junta puntajes de 1 a 5 en dos dimensiones con motivo obligatorio, pero el factor `f_eval` queda **fijo en 1,0** y "Cómo te reconocieron" muestra **quién** evaluó, lo que choca con lo que Gus decidió el 23-oct-2026: Semillas como constancias con forma de EAS en dos pasos (base por ronda + ajuste con `f_eval` entre 0,8 y 1,2, 3 estrellas = 1,0) y las ocho defensas contra la colusión (ADR-012; `NS_Tokenomics` 07 J-2 y 29 K11; Backlog D13 y D15; `NS_platform` 16 §2.3 y nota "Lo que aprendimos de Collabberry"). Este cambio hace que la ronda **calcule** `f_eval` con esas defensas y muestre, con datos de ejemplo, la constancia base y la de ajuste, para que el equipo vea el ciclo Acuerdo → Evaluación entre pares → Asignación funcionando antes de llevarlo a la base.

## What Changes

- **Función pura `calcularFactorEvaluacion`** en `lib/evaluacion/` (sin React, sin Next, sin red), con tests unitarios que cubren cada defensa y casos de colusión:
  - (a) nadie se evalúa a sí mismo; (b) solo cuentan evaluaciones entre personas del **equipo de la ronda** (mismo pacto o círculo en el período); (c) con menos de 3 evaluadores válidos en una dimensión, esa dimensión queda neutra y, si ninguna llega a 3, `f_eval` = 1,0; (d) mediana (por defecto) o media recortada; (e) si A evalúa a B y B evalúa a A en la misma ronda y la nota de A se aparta de la mediana de los demás en el umbral o más, la nota de A no cuenta; (f) cada nota se acota a ± un tope de estrellas alrededor de la mediana de los demás, para que una sola persona no pueda mover el resultado más que eso; (g) el resultado es solo agregado: no lleva ids ni nombres de quién evaluó; (h) una evaluación sin motivo escrito no cuenta.
  - Fórmula: `f_eval = 1 + fuerza × (nota_combinada − 3) / 2`, con `fuerza` entre 0 y 0,2 (la elige cada comunidad, como el parámetro `par` de Collabberry), siempre dentro de 0,8–1,2 y redondeado a dos decimales.
  - Parámetros de partida (a calibrar con simulación, K11): agregado mediana, umbral de reciprocidad 1,5 estrellas, tope por evaluador 1 estrella, mínimo 3 evaluadores, peso 50/50 entre dimensiones, fuerza 0,2.
- **Guía escrita por nivel de estrellas**: un texto para cada nivel (1 a 5) de cada dimensión (cumplimiento del rol y aporte a la cultura del grupo), en español e inglés, visible al puntuar.
- **Constancias de ejemplo con forma de EAS** (ADR-012): función pura que, a partir de una ronda cerrada, arma la **constancia base** (pacto, horas confirmadas, `HOUR_REF_USD`, período, versión del pacto y Semillas base, congelados) y la **constancia de ajuste** que apunta a la base (`apunta_a`) con `f_eval` y las Semillas ajustadas. Afirma NetX, nunca una persona.
- **Pantalla `/semillas`** (ronda de cada comunidad con pacto aceptado):
  - Al puntuar, se ve la guía del nivel elegido.
  - Al enviar la ronda de ejemplo, aparece "Tu resultado de esta ronda (ejemplo)": nota agregada por dimensión, `f_eval`, cuántas evaluaciones contaron y cuántas se descontaron **por motivo** (autoevaluación, fuera del equipo, sin motivo, reciprocidad), sin nombres; los motivos recibidos se muestran sin autor y en orden fijo, solo si contaron 3 evaluadores o más.
  - Selector "Fuerza del ajuste de esta comunidad" (0 · 0,05 · 0,1 · 0,15 · 0,2), simulado y sin guardar, que recalcula `f_eval`.
  - Bloque "Tus Semillas como constancias (ejemplo)" con la base y el ajuste que apunta a ella.
  - **"Cómo te reconocieron" deja de mostrar quién dio cada puntuación** (defensa g). Reemplaza el comportamiento de la spec `semillas-v2` ("Cómo te reconocieron" con nombres).
  - El texto "factor fijo en 1,0" se reemplaza por uno que explica que el factor se calcula con la ronda de ejemplo.
- **Catálogo legal**: dos términos ⚖ nuevos, `evaluacionPares` y `constanciaSemillas`, con `borrador: true` y versión en inglés.
- Todos los textos nuevos, en español e inglés (inglés como borrador de revisión nativa, como el resto).

**Fuera de alcance:**
- Base de datos, cuentas reales, evaluaciones de otras personas reales: el equipo y las evaluaciones recibidas son **datos de ejemplo**; lo que la persona puntúa se guarda en el navegador como hoy.
- Firmas, EAS real, billeteras, red o cadena (ADR-011, ADR-012 etapas 2 y 3; Backlog D10, D11, D12).
- **Calibración final** de los parámetros (umbral, tope, mínimo, recorte, peso entre dimensiones): se simula después (K11). Los valores de partida quedan en un solo lugar para cambiarlos.
- Aplicar el ajuste al saldo del panel de Semillas: el panel sigue igual (factor 1,0); el ajuste solo se ve en el bloque de ejemplo.
- Auditorías al azar por el círculo o la tribu y costo anti-spam por constancia (opciones abiertas de K11 y D11).
- Que la comunidad decida de verdad la fuerza (consulta del Fogón, permisos de admin): el selector es una prueba local.
- Evaluación del inversor como persona (no aplica, `NS_platform` 16 §2.3) y evaluación del proveedor de una convocatoria (D31).
- Apelación o pedido de revisión de un resultado.

## Capabilities

### New Capabilities
- `evaluacion-pares`: cálculo del factor de evaluación entre pares con las defensas contra la colusión, la guía por nivel de estrellas, el resultado agregado sin nombres y las constancias base y de ajuste de las Semillas.

### Modified Capabilities
<!-- `semillas` y `semillas-v2` todavía no están archivadas en openspec/specs/: el cambio de "Cómo te reconocieron" (sin nombres) queda como requisito nuevo de `evaluacion-pares` y lo dice el Why/What Changes. -->

## Impact

Código nuevo: `lib/evaluacion/` (tipos, parámetros, cálculo, guía, constancias, datos de ejemplo y tests). Cambios en `app/semillas/semillas-cliente.tsx`, `lib/semillas/datos.ts` (el ejemplo recibido sin nombres), `lib/semillas/calculo.ts` (`FACTOR_EVALUACION` deja de usarse en la ronda), `lib/idioma/textos/semillas.ts`, `lib/legal/terminos.ts` y tests de e2e `e2e/semillas.spec.ts` e `e2e/idioma-pasaporte-semillas-pactos.spec.ts` (hoy esperan el factor 1,0 y los nombres en lo recibido). Sin dependencias nuevas, sin pedidos de red, sin base, sin permisos ni pagos. Datos personales: solo de ejemplo y en el navegador; los motivos escritos son sobre personas, por eso el resultado nunca muestra autores.
