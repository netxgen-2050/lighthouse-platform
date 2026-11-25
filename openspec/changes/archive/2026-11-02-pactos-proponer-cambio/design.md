# Design

## Contexto

`PactoTiempo` tiene `rol`, `rolOtro`, `descripcion`, `horas` y `paso` (0 borrador, 1 enviado, 2 aceptado). `conTiempo` bloquea toda edición con `paso !== 0`. Semillas lee `pactosAceptados()` (paso 2). La pantalla muestra "Versión {paso + 1}".

## Decisiones

- **Forma:** `PactoTiempo` conserva sus campos como **versión vigente** y suma:
  - `version: number` (0 mientras nunca se aceptó);
  - `cambio?: { rol, rolOtro, descripcion, horas, paso: 0 | 1 }` (el cambio en curso; solo existe con `paso === 2`);
  - `historial: { version, rol, rolOtro, descripcion, horas, aceptado: string /* ISO */ }[]`.
- **Acciones nuevas:** `retirar` (paso 1 → 0, sin cambio), `proponerCambio` (copia la vigente a `cambio` con paso 0), `editarCambio` (rol, rolOtro, descripcion, horas sobre `cambio` en paso 0, con los mismos límites), `enviarCambio` (exige `pactoCompleto`), `aceptarCambio` (copia `cambio` a la vigente, `version + 1`, agrega al historial, borra `cambio`), `rechazarCambio` y `descartarCambio` (borran `cambio`). La primera aceptación (`avanzar` de 1 a 2) fija `version = 1` y agrega la versión 1 al historial. Las fechas se pasan desde afuera (el reductor sigue siendo puro: la acción trae `ahora`).
- **`pactosAceptados`** no cambia de firma: devuelve la vigente de los pactos con `paso === 2`, ignorando `cambio`.
- **Lectura:** lo guardado sin `version` con `paso === 2` → `version: 1` e historial con una entrada sin fecha conocida; esa entrada muestra "fecha sin dato" (el dato que falta no es cero ni se inventa). `cambio` inválido o incompleto con paso 1 vuelve a paso 0; con la vigente no aceptada se descarta.
- **Pantalla:** el cambio se muestra en un bloque propio debajo de la versión vigente, con sus mismos pasos (Borrador → Enviado → Aceptado) y un título "Cambio propuesto". El foco va al estado nuevo después de cada acción, como hoy (`data-foco-paso`). El aviso de "no aceptó" usa `role="status"`.
- **Eventos:** tres constructores nuevos en `lib/actividad/eventos.ts` con tipo `pacto` y `pacto-aceptado` (no se agregan tipos nuevos a la bandeja).
