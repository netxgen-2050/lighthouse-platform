# ADR-029 · En el prototipo, el saldo de Semillas se deriva al leer con una función pura: las constancias calculadas cuentan, se rotulan y nunca se migran como emitidas

- **Estado:** Propuesta
- **Fecha:** 2026-11-02
- **Cambio OpenSpec relacionado:** `semillas-constancias`. Amplía ADR-021, que acepta el cálculo en pantalla solo para los meses de un pacto variable. Se apoya en ADR-012, ADR-019 y ADR-020.

## Contexto
ADR-012 dice que el saldo es la suma de constancias congeladas, pero solo las de tareas se guardan (ADR-020). La base mensual todavía no se emite (ADR-021), y la base y el ajuste de la ronda de ejemplo se calculan al mostrarlos. `/semillas` quiere dejar de sumar una proyección y mostrar un saldo que se pueda rastrear fila por fila. Hay que decidir de dónde salen esas filas mientras no exista la emisión, y qué pasa con ellas cuando exista. ADR-021 no cubre la ronda.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · No hacer nada todavía: seguir con la proyección hasta tener la emisión | Cero trabajo | El saldo sigue sin salir de ninguna hora confirmada, y el equipo ve un número que no se puede explicar |
| **B · Derivar el libro al leer, con una función pura, sin guardar nada** | Se revierte con un PR; no hay datos que migrar; una sola cuenta para todas las pantallas | Los números no están congelados: cambian si cambian las horas, el valor de la hora o la modalidad del pacto |
| C · Emitir y guardar ya las constancias en el navegador | Quedan congeladas, como pide ADR-012 | Hay que escribir la regla de emisión dos veces (en el navegador y después en el servidor); deja datos guardados con forma de constancia real, que después hay que limpiar o migrar |

## Decisión
**B**, porque es la versión más chica que muestra el modelo correcto sin dejar datos que después haya que deshacer.

Reglas:
- **Una fila calculada no es una constancia emitida.** Lleva `calculada: true`, se dice en pantalla y su uid empieza con `ejemplo-`.
- **Cuando exista la emisión, las filas calculadas no se migran.** La emite solo el servidor, con su regla y sus únicos (ADR-020 y ADR-021), a partir de las confirmaciones. Lo calculado no es prueba de nada.
- **La plata sigue fuera de las constancias** (ADR-012). Suma al total en una línea aparte hasta que se decida L2.
- **Antes de cualquier uso real de las Semillas** (votar con ellas, firmarlas, publicarlas o mostrarlas fuera del equipo), este libro derivado se reemplaza por la emisión. Es la misma condición de ADR-021, ampliada a la ronda.

## Consecuencias
- Ganamos: un solo cálculo, que se puede probar sin navegador, y volver atrás cuesta un PR.
- Ganamos: nada de lo guardado cambia de forma.
- Aceptamos: la base de la ronda cambia si cambian las horas del pacto y desaparece si el pacto pasa a variable, porque la ronda no guarda ni fecha ni horas. Mientras dure, se lee contra "lo recibido no desaparece" de ADR-021, y queda como pregunta para Gus en `semillas-constancias`.
- Aceptamos: un número de ejemplo puede entrar al saldo, según lo que decida Gus sobre la ronda.
- **Revisar:** al implementar la emisión de `evaluacion-pares`, al pasar los pactos a la base (P9) y antes de mostrar la plataforma fuera del equipo (R14).

## En palabras simples
Hoy la pantalla de Semillas no lleva un cuaderno: cada vez que la abrís, saca la cuenta mirando lo que ya está anotado. Si Lucía tuvo noviembre confirmado, ve 121 Semillas con el rótulo "calculada". Es como una cuenta en borrador: sirve para mostrar cómo va a funcionar, pero no es el registro oficial. Si cambia el valor de la hora, ese 121 cambia. Cuando exista el registro de verdad, se escribe desde las confirmaciones de la tribu, sin copiar el borrador.

## Fuentes
- ADR-012, ADR-019, ADR-020 y ADR-021 de este repo.
- `openspec/changes/semillas-constancias/` (`proposal.md` y `design.md`), `lib/semillas/estado.ts` y `lib/evaluacion/constancias.ts`.
- `NS_platform`: "Desarrollo/08 - Backlog de producto" (L2 y P9) y "Desarrollo/Segunda revisión" (R14), citados como aparecen en el cambio y en `CLAUDE.md`.
