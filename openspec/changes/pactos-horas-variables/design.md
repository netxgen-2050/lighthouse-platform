# Design

## Contexto

- `lib/pactos/estado.ts`: `ContenidoPacto = { rol, rolOtro, descripcion, horas }`, `PactoTiempo` con `paso`, `version`, `cambio` e `historial` (`pactos-proponer-cambio`). `HORAS = { min: 4, max: 80, paso: 2 }`.
- `pactos-dos-partes` (en `dev` antes): la comunidad acepta el pacto y los cambios con constancias en el registro compartido; `conciliar` al leer; `/pactos/responder`; "lo que vale es lo que la tribu vio" (§9).
- `pacto-puntual` deja `lib/pactos/formatos.ts` (`"fijo" | "puntual"`); `pacto-puntual-verificacion` deja `pacto-propone-horas` / `pacto-confirma-horas` (con `datos.mes` previsto para esto) y `lib/pactos/mes.ts` (`mesDe` en hora de Argentina).
- `lib/semillas/calculo.ts`: `semillasTiempo(horas, parteSemilla, factor)` = `round(horas × HOUR_REF_USD × parte × factor) × MESES` (proyección de 3 meses del pacto fijo).

## Decisiones

### 1. Formatos y compromiso mínimo (`lib/pactos/formatos.ts`)

- `FormatoPacto` suma `"variable"`. Ejemplo (aprobado por Gus el 28-oct): `lighthouse`, `semilla`, `agua`, `valle`, `taller`, `avelan`, `puerto` suman `"variable"`; `monte` y `barda` no.
- `COMPROMISO_MINIMO = { min: 1, max: 3, porDefecto: 3 }` en `lib/pactos/datos.ts`, y `compromisoMinimoDe(comunidad): 1 | 2 | 3` en `formatos.ts`, con un mapa de ejemplo: todas 3 salvo `agua` 2 y `taller` 1 (para mostrar el rango). Sin dato → 3. Lo acuerdan quienes administran cada holón (decisión de Gus); en el prototipo es un dato del código.

### 2. Contenido del pacto

```ts
type Modalidad = "fija" | "variable";
type ContenidoPacto = {
  rol; rolOtro; descripcion;
  modalidad: Modalidad;                 // falta → "fija" (lo guardado antes)
  horas: number;                        // se usa con "fija"
  rango: { min: number; max: number };  // se usa con "variable"
  compromisoMeses: 1 | 2 | 3 | null;    // con "variable": el de la comunidad al enviar; con "fija": null
};
const RANGO_VARIABLE = { min: 0, max: 80, paso: 2, inicial: { min: 0, max: 20 } };
type DeclaracionMes = {
  horas: number;
  estado: "declarada" | "confirmada" | "a-revisar";
  propuestaId: string;                  // la `pacto-propone-horas` vigente
  motivo?: string;                      // con "a-revisar"
};
type PactoTiempo = ... & { declaradas: Record<string, DeclaracionMes> }; // "AAAA-MM" → declaración
```

- `pactoCompleto` suma: con "variable", `rango.min < rango.max`, los dos en `RANGO_VARIABLE`, y `compromisoMeses` en `COMPROMISO_MINIMO`.
- `contenido()` copia `modalidad`, `rango` y `compromisoMeses`; `CambioPropuesto` y `VersionAceptada` los heredan. La propuesta de `pactos-dos-partes` (`pacto-propone`) suma `datos.modalidad`, `datos.rangoMin`, `datos.rangoMax` y `datos.compromisoMeses`; al conciliar una aceptación, se toman de ahí (lo que vio la comunidad).
- `declaradas` vive en el pacto (no en la versión): se conserva al aceptar un cambio. Si la versión vigente pasa a "fija", las declaraciones quedan guardadas pero Semillas deja de usarlas.
- Un cambio de pacto **no** cambia el compromiso: se copia el de la versión vigente.

### 3. Declarar y confirmar

<!-- arquitecto (27-oct, se mantiene): `ahora` es ISO en UTC; el último día del mes después de las 21 h de Argentina, `slice(0, 7)` ya da el mes siguiente. -->
- "Mes en curso" = `mesDe(ahora)` de `lib/pactos/mes.ts`. Nunca `ahora.slice(0, 7)`.
- Acción `declarar { comunidad, mes, horas, ahora }`: solo si el pacto está aceptado, la versión vigente es "variable", `horas` está en `[rango.min, rango.max]`, entera y en pasos de 2, y además: `mes === mesDe(ahora)` y el mes no está `confirmada`; **o** el mes está `a-revisar` (excepción: se puede volver a declarar un mes pasado que la comunidad pidió revisar). Escribe una `pacto-propone-horas` con `datos.mes` y `datos.horas`; si había una `declarada` sin respuesta para ese mes, antes la revoca (corregir). Si no se cumple, no cambia nada y la pantalla dice por qué.
- **Quién confirma**: la contraparte del pacto (`contraparteDe`: la tribu o el Lighthouse), con `comunidadesQueResponde` de `pactos-dos-partes` y la misma regla de "nadie se confirma a sí mismo". `/pactos/responder` suma "Horas del mes para confirmar": persona, mes, horas, rango vigente, "Confirmar" y "Pedir revisar" (con motivo). Una respuesta por propuesta (re-chequeo antes de escribir).
- **Conciliar**: `pacto-confirma-horas` → `confirmada` con las horas que vio la comunidad; `pacto-no-acepta` → `a-revisar` con el motivo. Cada transición vale solo desde `declarada` y para la `propuestaId` vigente (idempotente; una respuesta a una propuesta ya revocada se ignora).
- `mes`, `ahora` y `cuando` los pone quien llama: el reductor sigue puro y los tests fijan el reloj.
- `leer`: descarta claves que no son `AAAA-MM`, horas no enteras o fuera de `RANGO_VARIABLE` (no del rango vigente), estados desconocidos y meses posteriores al mes en que se lee.

### 4. Semillas

- `semillasVariables(declaradas, mesActual): { meses: { mes; horas: number | null; estado: "confirmada" | "declarada" | "a-revisar" | null; semillas: number | null }[]; total: number | null }` sobre `[mes−2, mes−1, mes]`. **Solo `confirmada` suma**: `semillas = Math.round(Number((h × HOUR_REF_USD).toFixed(6)))`; `declarada` y `a-revisar` muestran las horas pero `semillas: null`. `total = totalConDato(...)`.
- `semillasDeComunidad` recibe `ahora` y, si la versión vigente es variable, usa `semillasVariables` para `tiempo`; `horas` queda `null` y se agregan `rango` y `compromisoMeses`. Con "fija", igual que hoy.
- `pactosAceptados` agrega `modalidad`, `rango` y `compromisoMeses`; la ronda sigue mirando solo que haya un pacto recurrente aceptado.
- Este cambio **no emite constancias base**: las Semillas del variable se calculan en el render a partir de lo confirmado. La constancia base mensual queda para `evaluacion-pares` o para la germinación (§7).

### 5. Pantallas

- `/pactos`: un `<fieldset>` "Cómo vas a poner tus horas" con dos radios (solo si la comunidad acepta "variable"); con "variable", dos campos numéricos rotulados ("Mínimo por mes", "Máximo por mes") y la línea "Compromiso mínimo: <N> meses · después dura lo que quieras sostenerlo" con ⚖ `compromisominimo`. Con el pacto variable aceptado, bloque "Horas de <mes en curso>" con un campo y "Declarar" (o "Corregir"), el estado del mes en texto, y la lista de los dos meses anteriores (solo lectura, salvo un mes "a revisar"). Mensajes en `role="status"`.
- `/semillas`: con pacto variable, la parte de tiempo lista los tres meses con su estado.
- `/perfil`, panel y Mi recorrido: `textoHorasDelPacto(contenido, idioma)` ("10 h/mes" o "entre 0 y 30 h/mes") en `lib/pactos/`.

### 6. Eventos

`declarasteHoras(horas, mes, comunidad, id)` con `clave: horas-declaradas:<comunidad>:<mes>` (corregir no duplica; el texto queda con la primera declaración) y `horasDelMesConfirmadas(mes, comunidad, id)` con `clave: horas-confirmadas:<comunidad>:<mes>`.

### 7. Propuesta para decidir: las Semillas del compromiso brotan y germinan

Gus pidió dejarla prevista, marcada para decidir. Referencia: el boceto de Gus en `https://claude.ai/artifact/H4uDTiruaXpSK4BJZ5AYfW` (versión 2). **Este agente no pudo abrir el boceto desde la corrida**: lo que sigue sale de la descripción de Gus del 28-oct y hay que contrastarlo con el boceto antes de aprobar.

- **El concepto.** Una semilla primero brota y recién después germina. Aplicado al compromiso:
  - **Brotan:** cada mes cuyas horas confirma la comunidad, sus Semillas **brotan**. Se ven en `/semillas` ("brotadas"), pero todavía no están firmes.
  - **Germinan:** al cumplir el compromiso mínimo (por ejemplo, 3 meses), las brotadas **germinan** y quedan firmes.
  - **Si la persona se va avisando:** germinan los meses cumplidos (los confirmados), aunque no haya llegado al mínimo.
  - **Si se va sin avisar:** el mes en curso no germina (los anteriores confirmados sí).
- **Cómo encaja con las constancias (propuesta técnica).** El brote ya existe en este cambio: es la `pacto-confirma-horas` del mes. La germinación sería el momento de emitir la **constancia base mensual** (`semillas-base`, ADR-012), congelada. Así nada congelado hay que revocar si la persona se va sin avisar: lo que no germina nunca llegó a ser constancia base. La germinación sería una función pura, `estadoDelMes(confirmaciones, compromisoMeses, salida)` → `"brotada" | "germinada" | "no-germina"`, sin estado guardado nuevo.
- **Lo que hace falta para implementarla** (otro cambio): un "terminar el pacto" con "aviso" (constancia de la persona) y una forma de registrar "se fue sin avisar" (lo marca la comunidad, como en D31). Las dos cosas están fuera de este cambio.
- **Dudas para decidir** (ver preguntas abiertas): si el mínimo se cuenta en meses confirmados o en meses de calendario desde la aceptación; qué pasa después del mínimo (¿cada mes germina al confirmarse, o se repite el ciclo?); si las brotadas cuentan para algo (voz, acceso) antes de germinar; si un mes con 0 h declaradas y confirmadas cuenta para el mínimo.

### 8. ⚖ "Compromiso mínimo" con criterio de la legislación argentina (borrador)

No hay revisión legal en el corto plazo (decisión de Gus, 28-oct).

- **Lo que se cuida:** un mínimo de 3 meses se parece al **período de prueba** de la Ley de Contrato de Trabajo (art. 92 bis, hoy de hasta 6 meses según la reforma vigente **[verificar]**), y "si te vas sin avisar, el mes no germina" podría leerse como una sanción o una retención. Por eso el texto dice que es un compromiso de palabra y voluntario, que se puede dejar avisando, que no hay horario impuesto ni pago en dinero, y que lo único que pasa si no se cumple es que esas horas no se reconocen como Semillas firmes (no hay multa ni deuda).
- **Texto ⚖ `compromisominimo` (es):** "Es el tiempo mínimo que te comprometés a sostener este pacto (de 1 a 3 meses, lo fija la tribu). Es un compromiso voluntario, de palabra: no es un contrato de trabajo ni un período de prueba, no hay horario impuesto ni pago en dinero, y podés dejarlo antes avisando. Las horas de cada mes las confirma la tribu y se reconocen con Semillas, que no son un sueldo." `borrador: true`, con su inglés.
- **Para la lista del abogado** (la suma Claude al integrar en `NS_platform`): ampliar **A1** con "compromiso mínimo de 1 a 3 meses: que no se lea como período de prueba (LCT art. 92 bis)" y "Semillas que no germinan si la persona se va sin avisar: que no se lean como sanción ni como retención de una remuneración en especie (LCT art. 103 y 105)". **[verificar]**

## Riesgos

- **Más pasos para la tribu.** Cada persona con pacto variable suma una confirmación por mes. Es lo que pidió Gus; si molesta, la germinación podría confirmar en bloque.
- **Mes pasado sin confirmar.** Una declaración puede quedar "esperando confirmación" para siempre si la comunidad no responde. Se ve así, sin sumar, nunca como 0.
- **Dos semánticas de "tiempo" en Semillas**: el fijo proyecta 3 meses, el variable suma lo confirmado. La pantalla lo dice en una línea para cada caso.

## Revisión de arquitectura

<!-- arquitecto: revisión hecha el 27-oct-2026 sobre la versión anterior (sin confirmación mensual). -->
La revisión del 27-oct (mes en hora de Argentina; "lo autodeclarado no emite Semillas") sigue incorporada: ahora lo autodeclarado ni siquiera suma hasta que la comunidad lo confirma. **Pide una nueva revisión** del agente arquitecto: este cambio ahora escribe constancias en el registro compartido (horas de cada mes) y suma la propuesta de germinación, que decidiría cuándo se emite la constancia base mensual.
