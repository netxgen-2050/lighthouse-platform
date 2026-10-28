# Proposal

## Why

El pacto de tiempo de hoy fija las horas de cada mes, y cambiarlas pide `pactos-proponer-cambio` (versión nueva que la comunidad acepta). En la llamada con Don Powa, Gus marcó que no es así como colabora la gente: "alguien puede poner 10 h un mes, 25–30 el siguiente y nada el otro" (`NS_platform` Backlog **D20**; reunión 2026-10-23, #5). D20 también dice que **cada tribu elige qué formatos acepta**.

El 28-oct Gus definió cómo es el pacto recurrente de horas por mes: **dura lo que dure, con un compromiso mínimo de 1 a 3 meses** (lo acuerdan quienes administran cada holón o tribu; valor de partida, 3 meses), y **las horas declaradas de cada mes las confirma el holón**. También pidió dejar prevista, como propuesta para decidir, la idea de que las Semillas del compromiso **"brotan"** cada mes confirmado y **"germinan"** al cumplir el mínimo.

Es el cuarto de cuatro cambios (`tribu-necesidades` → `pacto-puntual` → `pacto-puntual-verificacion` → **`pactos-horas-variables`**), y se apoya en `pactos-dos-partes`: la comunidad acepta el pacto de verdad y las horas de cada mes usan los esquemas `pacto-propone-horas` / `pacto-confirma-horas` que suma `pacto-puntual-verificacion`.

## What Changes

- **Modalidad del pacto recurrente:** "Horas fijas" (lo de hoy) u "**Horas variables**". En la variable, la persona pacta un **rango por mes** (por ejemplo, de 0 a 30 h) en lugar de un número; la comunidad lo acepta o no en `/pactos/responder` (`pactos-dos-partes`).
- **Compromiso mínimo.** Cada comunidad dice su compromiso mínimo, de **1 a 3 meses** (datos de ejemplo; **3 por defecto**). El pacto variable lo lleva: "Compromiso mínimo: 3 meses · después dura lo que quieras sostenerlo". Sin fecha de fin.
- **Declarar las horas del mes.** Con un pacto variable aceptado, la persona declara las horas **del mes en curso** dentro del rango, **sin proponer un cambio**. Declarar es una constancia `pacto-propone-horas` con el mes. Mientras la comunidad no respondió, puede corregirla (la anterior se revoca). Declarar 0 es un dato; no declarar es "sin dato".
- **La comunidad confirma cada mes.** Quien administra la comunidad del pacto (quien lidera la tribu, o el super admin para el Lighthouse) ve "Horas del mes para confirmar" en `/pactos/responder`: **confirma** (`pacto-confirma-horas`) o **pide revisar** con motivo; con "pedir revisar", la persona puede volver a declarar ese mes, aunque ya haya pasado.
- **Salir del rango** sigue pidiendo "Proponer un cambio", que ahora también permite pasar de fija a variable (o al revés) y cambiar el rango. El historial muestra la modalidad de cada versión.
- **Formatos por comunidad.** Se suma "variable" a `lib/pactos/formatos.ts` (reparto que Gus aprobó): lo aceptan el Lighthouse, Semilla Viva, Agua Clara, Valle Solar, Taller Común, Avelan Kerum y Puerto Trueque; Monte Nuevo y Barda Productiva, solo horas fijas.
- **Semillas.** Con un pacto variable, la parte de tiempo suma solo lo **confirmado** de los últimos tres meses y muestra cada mes como "confirmado", "declarado · esperando confirmación" (no suma) o "sin dato". Con un pacto fijo, todo sigue igual.
- **Brotan y germinan: solo descripto, para decidir** (design §7). No se implementa: el modelo queda listo para sumarlo.
- **⚖ "Compromiso mínimo"** (borrador, con criterio de la legislación argentina): es un compromiso voluntario, no un contrato de trabajo ni un período de prueba.
- **Mi recorrido:** "Declaraste <N> h de <mes> en <comunidad>" (una vez por mes) y "<comunidad> confirmó tus horas de <mes>".
- Textos es/en, con voseo.

**Fuera de alcance:**
- **Brotar y germinar** las Semillas, y **terminar un pacto** avisando o sin avisar: quedan como propuesta en el design hasta que Gus decida.
- Que la persona elija el compromiso mínimo, o que quien lidera lo edite desde la pantalla: es un dato de ejemplo por comunidad.
- Constancias base mensuales del pacto recurrente y su ajuste por evaluación: van con `evaluacion-pares` (o con la germinación, si se aprueba).
- Pacto recurrente con un **círculo** (hoy el pacto es con la tribu o el Lighthouse).
- Declarar meses futuros; corregir un mes ya confirmado.
- Reparto de caja (D23), convocatorias (D26), registro de cumplimiento (D31).

## Capabilities

### New Capabilities
- `pactos-horas-variables`: modalidad fija o variable del pacto recurrente, rango por mes, compromiso mínimo por comunidad, declaración mensual confirmada por la comunidad, formato "variable" y su efecto en Semillas.

### Modified Capabilities

(`pactos-acuerdo`, de `pactos-dos-partes`, sin archivar: el rango, la modalidad y el compromiso viajan en la propuesta que acepta la comunidad.)

## Impact

`lib/pactos/formatos.ts` (formato "variable" y compromiso mínimo), `lib/pactos/datos.ts` (`RANGO_VARIABLE`, `COMPROMISO_MINIMO`), `lib/pactos/estado.ts` (modalidad, rango, compromiso, declaraciones por mes conciliadas, cambio con modalidad, lectura), `lib/pactos/constancias.ts` (propuesta de pacto con modalidad, rango y compromiso; horas del mes), `lib/semillas/calculo.ts` y `lib/semillas/estado.ts`, `app/pactos/pactos-cliente.tsx`, `app/pactos/responder/` (sección "Horas del mes para confirmar"), `app/semillas/semillas-cliente.tsx`, `app/perfil/perfil-cliente.tsx` y `lib/panel/`, `lib/actividad/eventos.ts`, `lib/legal/terminos.ts` (`compromisominimo`, borrador), `lib/idioma/textos/`, tests de Vitest y e2e. Todo en el navegador.
