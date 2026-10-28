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
- `declaradas` vive en el pacto (no en la versión): se conserva al aceptar un cambio. <!-- arquitecto (28-oct): antes decía "si la versión vigente pasa a fija, Semillas deja de usarlas": las Semillas ya recibidas desaparecían de la pantalla con un cambio de pacto, y lo recibido no se pierde (decisión de Gus). -->Si la versión vigente pasa a "fija", las declaraciones quedan guardadas y **Semillas las sigue usando**: los meses confirmados mientras el pacto fue variable siguen contando (§4). Lo recibido nunca desaparece por un cambio de pacto. Qué pasa con las Semillas **pendientes** de un pacto que pasa a fija queda como pregunta para Gus; hasta que decida, siguen pendientes.
- `compromisoMeses` de la versión variable se guarda junto a `declaradas` (`compromisoDeclaradas`) para poder seguir calculando el mínimo si la versión vigente pasa a fija (que tiene `compromisoMeses: null`).
- Un cambio de pacto **no** cambia el compromiso: se copia el de la versión vigente.

### 3. Declarar y confirmar

<!-- arquitecto (27-oct, se mantiene): `ahora` es ISO en UTC; el último día del mes después de las 21 h de Argentina, `slice(0, 7)` ya da el mes siguiente. -->
- "Mes en curso" = `mesDe(ahora)` de `lib/pactos/mes.ts`. Nunca `ahora.slice(0, 7)`.
- Acción `declarar { comunidad, mes, horas, ahora }`: solo si el pacto está aceptado, la versión vigente es "variable", `horas` está en `[rango.min, rango.max]`, entera y en pasos de 2, y además: `mes === mesDe(ahora)` y el mes no está `confirmada`; **o** el mes está `a-revisar` (excepción: se puede volver a declarar un mes pasado que la comunidad pidió revisar). Escribe una `pacto-propone-horas` con `datos.mes` y `datos.horas`; si había una `declarada` sin respuesta para ese mes, antes la revoca (corregir). Si no se cumple, no cambia nada y la pantalla dice por qué. <!-- arquitecto (28-oct): con una pestaña vieja, "corregir" revocaba una declaración que la tribu ya había confirmado y el mes confirmado volvía a "declarado". --> **Antes de corregir se relee el registro**: si la declaración vigente ya tiene respuesta, no se revoca ni se escribe nada, se concilia y la persona ve "Estas horas ya se respondieron". Un `revoca` posterior a una respuesta que cuenta se ignora al conciliar (gana la respuesta).
- **Qué confirmación cuenta**: la misma `confirmacionValida` de `pacto-puntual-verificacion` (afirma la contraparte del pacto, `por` no es la persona, horas iguales a las declaradas, apunta a la declaración vigente de ese mes).
- **Quién confirma**: la contraparte del pacto (`contraparteDe`: la tribu o el Lighthouse), con `comunidadesQueResponde` de `pactos-dos-partes` y la misma regla de "nadie se confirma a sí mismo". `/pactos/responder` suma "Horas del mes para confirmar": persona, mes, horas, rango vigente, "Confirmar" y "Pedir revisar" (con motivo). Una respuesta por propuesta (re-chequeo antes de escribir).
- **Conciliar**: `pacto-confirma-horas` → `confirmada` con las horas que vio la comunidad; `pacto-no-acepta` → `a-revisar` con el motivo. Cada transición vale solo desde `declarada` y para la `propuestaId` vigente (idempotente; una respuesta a una propuesta ya revocada se ignora).
- `mes`, `ahora` y `cuando` los pone quien llama: el reductor sigue puro y los tests fijan el reloj.
- `leer`: descarta claves que no son `AAAA-MM`, horas no enteras o fuera de `RANGO_VARIABLE` (no del rango vigente), estados desconocidos y meses posteriores al mes en que se lee.

### 4. Semillas

Decisión de Gus (28-oct): las Semillas de cada mes confirmado son **Semillas pendientes**; al cumplir el compromiso mínimo **en meses confirmados** se **reciben** y pasan a ser **Semillas**. Un mes confirmado con 0 h **no cuenta** para el mínimo (y no genera Semillas).

```ts
type EstadoSemillasMes = "pendientes" | "recibidas";
function mesesCumplidos(declaradas): number;   // meses "confirmada" con horas > 0, de todo el pacto
function semillasVariables(declaradas, mesActual, compromisoMeses): {
  meses: { mes; horas: number | null; estado: "confirmada" | "declarada" | "a-revisar" | null;
           semillas: number | null; semillasEstado: EstadoSemillasMes | null }[]; // la lista: [mes−2, mes−1, mes]
  cumplidos: number; compromisoMeses: 1 | 2 | 3;
  recibidas: number | null; pendientes: number | null; // sobre todas las declaraciones, no solo la lista
};
```

- **Solo `confirmada` genera Semillas**: `semillas = Math.round(Number((h × HOUR_REF_USD).toFixed(6)))`; `declarada` y `a-revisar` muestran las horas pero `semillas: null`.
- **Pendientes o recibidas.** Se recorren los meses confirmados con horas > 0 en orden; mientras `cumplidos < compromisoMeses`, todos son `pendientes`. Al llegar a `compromisoMeses`, esos meses (los que completaron el mínimo) pasan a `recibidas`. Los meses confirmados **después** del mínimo se reciben al confirmarse, o sea quedan `recibidas` (decisión de Gus, 28-oct).
- `recibidas` y `pendientes` = `totalConDato(...)` de cada grupo (sin meses, "sin dato", nunca 0).
- `semillasDeComunidad` recibe `ahora` y, si la versión vigente es variable, usa `semillasVariables`: `tiempo` = `recibidas` (lo único que suma al total) y se agregan `pendientes`, `cumplidos`, `rango` y `compromisoMeses`; `horas` queda `null`. Con "fija" y **sin** meses confirmados, igual que hoy. <!-- arquitecto (28-oct) --> Con "fija" y meses confirmados de una etapa variable anterior, `tiempo` es la proyección del fijo y se suma una parte aparte, `variableAnterior` (`recibidas`, que suman al total, y `pendientes`, que no), rotulada "Horas variables confirmadas antes del cambio".
- `pactosAceptados` agrega `modalidad`, `rango` y `compromisoMeses`; la ronda sigue mirando solo que haya un pacto recurrente aceptado.
- Este cambio **no emite constancias base**: las Semillas del variable (pendientes y recibidas) se calculan en el render a partir de lo confirmado. La constancia base mensual queda para `evaluacion-pares`, que la emitiría al recibirse (§7).

### 5. Pantallas

- `/pactos`: un `<fieldset>` "Cómo vas a poner tus horas" con dos radios (solo si la comunidad acepta "variable"); con "variable", dos campos numéricos rotulados ("Mínimo por mes", "Máximo por mes") y la línea "Compromiso mínimo: <N> meses · después dura lo que quieras sostenerlo" con ⚖ `compromisominimo`. Con el pacto variable aceptado, bloque "Horas de <mes en curso>" con un campo y "Declarar" (o "Corregir"), el estado del mes en texto, y la lista de los dos meses anteriores (solo lectura, salvo un mes "a revisar"). Mensajes en `role="status"`.
- `/semillas`: con pacto variable, la parte de tiempo dice "Semillas: <recibidas>" y "Semillas pendientes: <pendientes>" (cada una con "sin dato" si no hay), "<cumplidos> de <N> meses confirmados del compromiso mínimo", y lista los tres meses con su estado en texto ("24 h · confirmadas · 121 Semillas pendientes", "24 h · confirmadas · 121 Semillas", "24 h · esperando confirmación", "sin dato"). Una línea explica: "Las Semillas pendientes se reciben al cumplir el compromiso mínimo. Un mes con 0 h no cuenta."
- `/perfil`, panel y Mi recorrido: `textoHorasDelPacto(contenido, idioma)` ("10 h/mes" o "entre 0 y 30 h/mes") en `lib/pactos/`.

### 6. Eventos

`declarasteHoras(horas, mes, comunidad, id)` con `clave: horas-declaradas:<comunidad>:<mes>` (corregir no duplica; el texto queda con la primera declaración) y `horasDelMesConfirmadas(mes, comunidad, id)` con `clave: horas-confirmadas:<comunidad>:<mes>`.

### 7. Semillas pendientes y Semillas (decisión de Gus, 28-oct)

- **Nombres.** "**Semillas pendientes**": las de cada mes confirmado de un compromiso. "**Semillas**": las que se reciben. No se usa otra metáfora.
- **Cuándo se reciben.** Al **terminar el compromiso**, es decir, al cumplir el mínimo, las Semillas pendientes se reciben y pasan a ser Semillas. El mínimo se cuenta en **meses confirmados**; un mes con 0 h **no cuenta**. Esto lo implementa este cambio (§4).
- **Si la persona se va antes avisando:** recibe las de los meses confirmados, aunque no haya llegado al mínimo.
- **Si se va sin avisar:** pierde solo las Semillas pendientes del mes en curso; las de los meses anteriores confirmados se reciben.
- **Cómo encaja con las constancias** (ADR-021, Propuesta <!-- arquitecto (28-oct) -->). Las Semillas pendientes salen de la `pacto-confirma-horas` de cada mes y se calculan en el render, sin guardar nada nuevo. Recibirlas sería el momento de emitir la **constancia base mensual** (`semillas-base`, ADR-012), congelada: así no hay que revocar nada si la persona se va sin avisar, porque lo que se pierde nunca llegó a ser constancia base. Emitirla queda para `evaluacion-pares`.
- **Lo que hace falta para las salidas** (otro cambio): un "terminar el pacto" con aviso (constancia de la persona) y una forma de registrar "se fue sin avisar" (lo marca la comunidad, como en D31). Con eso, `semillasVariables` suma un parámetro `salida` y no cambia nada más.
- **Decidido por Gus (28-oct):** los meses confirmados **después** de cumplir el mínimo se reciben al confirmarse.

### 8. ⚖ "Compromiso mínimo" con criterio de la legislación argentina (borrador)

No hay revisión legal en el corto plazo (decisión de Gus, 28-oct).

- **Lo que se cuida:** un mínimo de 3 meses se parece al **período de prueba** de la Ley de Contrato de Trabajo (art. 92 bis, hoy de hasta 6 meses según la reforma vigente **[verificar]**), y "si te vas sin avisar, perdés las Semillas pendientes del mes en curso" podría leerse como una sanción o una retención. Por eso el texto dice que es un compromiso de palabra y voluntario, que se puede dejar avisando (y ahí se reciben las de los meses confirmados), que no hay horario impuesto ni pago en dinero, y que lo único que pasa si no se avisa es que las Semillas pendientes de ese mes no se reciben (no hay multa ni deuda).
- **Texto ⚖ `compromisominimo` (es):** "Es el tiempo mínimo que te comprometés a sostener este pacto (de 1 a 3 meses, lo fija la tribu). Es un compromiso voluntario, de palabra: no es un contrato de trabajo ni un período de prueba, no hay horario impuesto ni pago en dinero, y podés dejarlo antes avisando. Las horas de cada mes las confirma la tribu y generan Semillas pendientes, que recibís al cumplir el compromiso (o, si lo dejás antes avisando, las de los meses confirmados). Las Semillas no son un sueldo." `borrador: true`, con su inglés.
- **Para la lista del abogado** (la suma Claude al integrar en `NS_platform`): ampliar **A1** con "compromiso mínimo de 1 a 3 meses: que no se lea como período de prueba (LCT art. 92 bis)" y "Semillas pendientes del mes en curso que no se reciben si la persona se va sin avisar: que no se lean como sanción ni como retención de una remuneración en especie (LCT art. 103 y 105)". **[verificar]**

## Riesgos

- **Más pasos para la tribu.** Cada persona con pacto variable suma una confirmación por mes. Es lo que pidió Gus; si molesta, se podría confirmar en bloque al cumplir el mínimo.
- **Semillas pendientes que no suman.** Hasta cumplir el mínimo, el total de Semillas de un pacto variable puede decir "sin dato" aunque haya meses confirmados. La pantalla muestra las pendientes al lado, para que no parezca que no se reconoció nada.
- **Mes pasado sin confirmar.** Una declaración puede quedar "esperando confirmación" para siempre si la comunidad no responde. Se ve así, sin sumar, nunca como 0.
- **Dos semánticas de "tiempo" en Semillas**: el fijo proyecta 3 meses, el variable suma lo confirmado. La pantalla lo dice en una línea para cada caso.
<!-- arquitecto (28-oct) -->
- **Semillas recibidas que todavía no están congeladas.** Este cambio no emite la constancia base mensual: las Semillas recibidas se calculan en el render con el `HOUR_REF_USD` de hoy. Si cambia el valor de la hora, cambian. Es aceptable en el prototipo (no hay valor real), pero contradice "lo recibido no se toca" de ADR-012: la constancia base mensual tiene que emitirse **al recibirse**, con el valor de ese momento, antes de que estas Semillas tengan cualquier uso real. Queda atado a `evaluacion-pares` (§7).
- **En la base**: una declaración y su respuesta son filas de un libro de solo agregar; único por (pacto, mes) para la declaración vigente y una respuesta por declaración; el servidor recalcula quién responde por esa comunidad. El motivo de "pedir revisar" va en una columna con acceso restringido, no en lo que se hashea o publica.

## Revisión de arquitectura

<!-- arquitecto: revisión hecha el 27-oct-2026 sobre la versión anterior (sin confirmación mensual). -->
La revisión del 27-oct (mes en hora de Argentina; "lo autodeclarado no emite Semillas") sigue incorporada: ahora lo autodeclarado ni siquiera suma hasta que la comunidad lo confirma. **Pide una nueva revisión** del agente arquitecto: este cambio ahora escribe constancias en el registro compartido (horas de cada mes) y define cuándo se reciben las Semillas pendientes, que es cuándo se emitiría la constancia base mensual.
