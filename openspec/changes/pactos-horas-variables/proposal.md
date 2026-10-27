# Proposal

## Why

El pacto de tiempo de hoy fija las horas de cada mes, y cambiarlas pide `pactos-proponer-cambio` (versión nueva que la comunidad acepta). En la llamada con Don Powa, Gus marcó que no es así como colabora la gente: "alguien puede poner 10 h un mes, 25–30 el siguiente y nada el otro" (`NS_platform` Backlog **D20**; reunión 2026-10-23, #5). D20 también dice que **cada tribu elige qué formatos acepta**.

Es el tercero de tres cambios (después de `tribu-necesidades` y `pacto-puntual`).

## What Changes

- **Modalidad del pacto recurrente:** "Horas fijas" (lo de hoy) u "**Horas variables**". En la variable, la persona pacta un **rango por mes** (por ejemplo, de 0 a 30 h) en lugar de un número; la comunidad acepta el rango (simulado, como hoy).
- **Declarar las horas del mes.** Con un pacto variable aceptado, la persona declara las horas **del mes en curso** dentro del rango, **sin proponer un cambio**. Puede corregir la del mes en curso; los meses pasados quedan como se declararon. Declarar 0 ("este mes no pongo horas") es un dato; no declarar es "sin dato".
- **Salir del rango** sigue pidiendo "Proponer un cambio", que ahora también permite pasar de fija a variable (o al revés) y cambiar el rango. El historial muestra la modalidad de cada versión.
- **Formatos por comunidad.** Se suma el formato "variable" a `lib/pactos/formatos.ts`: lo aceptan el Lighthouse, Semilla Viva, Agua Clara, Valle Solar, Taller Común, Avelan Kerum y Puerto Trueque; Monte Nuevo y Barda Productiva, solo horas fijas (datos de ejemplo). Si la comunidad no lo acepta, no aparece la opción.
- **Semillas.** Con un pacto variable, la parte de tiempo suma lo **declarado** en los últimos tres meses (el en curso y los dos anteriores) y muestra cada mes ("sin dato" si no se declaró). Con un pacto fijo, todo sigue igual.
- **Mi recorrido:** "Declaraste <N> h de <mes> en <comunidad>" (una vez por mes; corregir no duplica el evento).
- Textos es/en, con voseo.

**Fuera de alcance:**
- **Que la comunidad confirme cada declaración mensual.** Hoy la declaración dentro del rango acordado cuenta sola, como hoy cuentan las horas del pacto fijo (ver pregunta abierta). La confirmación real va con `pactos-dos-partes` y con el registro de cumplimiento (D31).
- Declarar meses futuros o corregir meses cerrados.
- Constancias base mensuales del pacto recurrente y su ajuste por evaluación: van con `evaluacion-pares`.
- Que quien lidera la tribu edite qué formatos acepta: son datos de ejemplo en el código.
- Pacto puntual (`pacto-puntual`), reparto de caja (D23), convocatorias (D26).

## Capabilities

### New Capabilities
- `pactos-horas-variables`: modalidad fija o variable del pacto recurrente, rango por mes, declaración mensual, formato "variable" por comunidad y su efecto en Semillas.

### Modified Capabilities

## Impact

`lib/pactos/formatos.ts` (formato "variable"; si no existe, se crea), `lib/pactos/datos.ts` (`RANGO_VARIABLE`), `lib/pactos/estado.ts` (modalidad, rango, declaraciones por mes, cambio con modalidad, lectura de lo guardado), `lib/semillas/calculo.ts` y `lib/semillas/estado.ts` (tiempo de un pacto variable), `app/pactos/pactos-cliente.tsx`, `app/semillas/semillas-cliente.tsx`, `app/perfil/perfil-cliente.tsx` y `lib/panel/` (donde se muestran las horas por mes del pacto), `lib/actividad/eventos.ts`, `lib/idioma/textos/`, tests de Vitest y e2e. Todo en `localStorage`, en la clave de pactos de la persona.
