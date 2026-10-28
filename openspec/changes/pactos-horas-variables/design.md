# Design

## Contexto

- `lib/pactos/estado.ts`: `ContenidoPacto = { rol, rolOtro, descripcion, horas }`, `PactoTiempo` con `paso`, `version`, `cambio` e `historial` (`pactos-proponer-cambio`). `HORAS = { min: 4, max: 80, paso: 2 }`.
- `lib/semillas/calculo.ts`: `semillasTiempo(horas, parteSemilla, factor)` = `round(horas × HOUR_REF_USD × parte × factor) × MESES` (proyección de 3 meses del pacto fijo).
- `pacto-puntual` crea `lib/pactos/formatos.ts` (`"fijo" | "puntual"`).

## Decisiones

### 1. Formatos

`FormatoPacto` suma `"variable"`. Si `lib/pactos/formatos.ts` todavía no existe (porque `pacto-puntual` no se mergeó), se crea con la misma API (`formatosDe`, `aceptaFormato`) y solo `"fijo"` y `"variable"`; `pacto-puntual` después agrega `"puntual"`. Ejemplo: `lighthouse`, `semilla`, `agua`, `valle`, `taller`, `avelan`, `puerto` suman `"variable"`; `monte` y `barda` no.

### 2. Contenido del pacto

```ts
type Modalidad = "fija" | "variable";
type ContenidoPacto = {
  rol; rolOtro; descripcion;
  modalidad: Modalidad;        // falta → "fija" (lo guardado antes)
  horas: number;               // se usa con "fija"
  rango: { min: number; max: number }; // se usa con "variable"
};
const RANGO_VARIABLE = { min: 0, max: 80, paso: 2, inicial: { min: 0, max: 20 } };
type PactoTiempo = ... & { declaradas: Record<string, number> }; // "AAAA-MM" → horas
```

- `pactoCompleto` suma: con "variable", `rango.min < rango.max`, los dos en `RANGO_VARIABLE`.
- `contenido()` copia `modalidad` y `rango`; `CambioPropuesto` y `VersionAceptada` los heredan, así el cambio y el historial ya los llevan.
- `declaradas` vive en el pacto (no en la versión): se conserva al aceptar un cambio. Si la versión vigente pasa a "fija", las declaraciones quedan guardadas pero Semillas deja de usarlas.

### 3. Declarar

<!-- arquitecto: `ahora` es ISO en UTC; el último día del mes después de las 21 h de Argentina, `slice(0, 7)` ya da el mes siguiente: la persona no podría corregir su mes y la declaración caería en otro, que después queda cerrado. -->
- "Mes en curso" = `mesDe(ahora)`, el helper en hora de Argentina (`America/Argentina/Buenos_Aires`) de `lib/pactos/mes.ts`. Si `pacto-puntual` no está en `dev`, este cambio lo crea con la misma firma. Nunca `ahora.slice(0, 7)`. Lo usan `declarar`, `leer` (meses futuros) y `semillasVariables` (`mesActual`).
- Acción `declarar { comunidad, mes, horas, ahora }`. Solo si el pacto está aceptado, la versión vigente es "variable", `mes === mesDe(ahora)` (mes en curso) y `horas` está en `[rango.min, rango.max]`, entera y en pasos de 2. Si no, no cambia nada y la pantalla dice por qué (fuera del rango → texto de la spec).
- `mes` y `ahora` los pone quien llama: el reductor sigue puro y los tests fijan el reloj.
- `leer`: descarta claves que no son `AAAA-MM` válidas, valores no enteros o fuera de `RANGO_VARIABLE` (no del rango vigente: un cambio de rango no borra lo declarado antes) y meses posteriores al mes en que se lee (lo pasa quien llama; sin reloj, no se descartan por fecha).

### 4. Semillas

- Función pura nueva en `lib/semillas/calculo.ts`: `semillasVariables(declaradas, mesActual): { meses: { mes: string; horas: number | null; semillas: number | null }[]; total: number | null }` sobre `[mes−2, mes−1, mes]`. `semillas = Math.round(Number((h × HOUR_REF_USD).toFixed(6)))`, la misma cuenta mensual que la constancia base de `pacto-puntual` y de `evaluacion-pares`. `total = totalConDato(...)`.
- `semillasDeComunidad` recibe `ahora` y, si la versión vigente es variable, usa `semillasVariables` para `tiempo`; `horas` queda `null` y se agrega `rango`. Con "fija", igual que hoy.
- `pactosAceptados` agrega `modalidad` y `rango`; la ronda sigue mirando solo que haya un pacto aceptado.

### 5. Pantallas

- `/pactos`: un `<fieldset>` "Cómo vas a poner tus horas" con dos radios (solo si la comunidad acepta "variable"); con "variable", dos campos numéricos rotulados ("Mínimo por mes", "Máximo por mes") en lugar del de horas. Con el pacto variable aceptado, bloque "Horas de <mes en curso>" con un campo y "Declarar", y la lista de los dos meses anteriores (solo lectura). Mensajes en `role="status"`.
- `/semillas`: con pacto variable, la parte de tiempo lista los tres meses.
- `/perfil`, panel y Mi recorrido: un helper `textoHorasDelPacto(contenido, idioma)` ("10 h/mes" o "entre 0 y 30 h/mes") en `lib/pactos/`, usado en todos lados en vez de armar el texto a mano.

### 6. Evento

`declarasteHoras(horas, mes, comunidad, id)` con `clave: horas-declaradas:<comunidad>:<mes>`. Como el almacén de actividad ya ignora claves repetidas, corregir no duplica; el texto queda con las horas de la primera declaración (aceptable: el dato vigente está en `/pactos`).

## Riesgos

- **La declaración cuenta sin que la comunidad la vea.** Es igual que hoy con el pacto fijo (Semillas proyecta horas que nadie confirmó), pero acá la persona elige el número cada mes. El rango acordado lo acota; la confirmación queda como pregunta para Gus.
- **Las declaraciones no son constancias.** <!-- arquitecto: para que el prototipo no enseñe que lo autodeclarado emite Semillas. --> Este cambio no emite constancias base: las Semillas del pacto variable se calculan en el render a partir de lo declarado, y la pantalla lo dice ("declarado por vos, sin confirmar"). Con la base, cada mes declarado necesita la confirmación de la tribu (`pactos-dos-partes` / D31) antes de emitir la constancia base mensual de ADR-012.
- **Dos semánticas de "tiempo" en Semillas**: el fijo proyecta 3 meses, el variable suma lo declarado. La pantalla lo dice en una línea para cada caso. Se unifican cuando las Semillas salgan de constancias por ronda (`evaluacion-pares`).
