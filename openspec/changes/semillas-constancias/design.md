# Design

## Context

Hoy `semillasDeComunidad` (`lib/semillas/estado.ts`) arma un `total` con partes distintas:

| Parte | De dónde sale | ¿Es constancia? |
|---|---|---|
| `tiempo`, pacto fijo | `semillasTiempo`: horas × valor × 3 meses | No: es una proyección, sin horas confirmadas |
| `tiempo`, pacto variable | `semillasVariables` sobre meses confirmados | Se deriva; ADR-021 dice que se emite al recibirse y todavía no se emite |
| `puntual` | `ConstanciaBase` guardada al verificar (ADR-020) | Sí, congelada |
| `plata` | `semillasDePlata(totalAportes)` | No, y ADR-012 deja la plata fuera de EAS |
| Ronda | `constanciasDeRonda` en el render, solo para el bloque de ejemplo | Sí por su forma, pero no llega al saldo |

Hay dos consumidores: `/semillas` y "Semillas totales" de `/perfil`. El Pasaporte no muestra un panel de Semillas (`lib/pasaporte/sellos.ts` solo nombra el pase).

## Goals / Non-Goals

**Goals:**
- Una sola función pura que dé recibidas, pendientes, aportes, total e historial.
- Que cada número de la pantalla se pueda rastrear hasta una fila del historial o una línea rotulada.

**Non-Goals:** lo listado en "Fuera de alcance" de la propuesta. En particular, emitir o guardar constancias nuevas.

## Decisions

### 1. Módulo `lib/semillas/libro.ts` (puro)

```ts
type OrigenConstancia = "pacto" | "tarea" | "ronda";
type EstadoConstancia = "vigente" | "reemplazada" | "revocada";

type FilaConstancia = {
  uid: string;
  tipo: "base" | "ajuste";
  origen: OrigenConstancia;
  periodo: string;            // "AAAA-MM"
  semillas: number;
  estado: EstadoConstancia;
  cuentaEnSaldo: boolean;
  /** Puntual: congelada al verificar. Mensual y ronda: se recalculan al leer. */
  calculada: boolean;
  /** Ronda: marcada como ejemplo. */
  ejemplo: boolean;
  apuntaA: string | null;
  revocadaEn: string | null;  // null también si se desconoce la fecha
  horas: number | null;
  horasSinSemillas: number | null;
  factor: number | null;      // solo en ajustes
  necesidad: string | null;   // solo en tareas; el nombre lo pone la pantalla
};

type PendientesDeComunidad =
  | { motivo: "falta-minimo"; semillas: number; cumplidos: number; compromisoMeses: number; faltan: number }
  | { motivo: "espera-validacion"; semillas: number };

type LibroDeComunidad = {
  recibidas: number | null;
  pendientes: PendientesDeComunidad | null;
  aportes: number | null;
  total: number | null;       // recibidas + aportes; sin dato si faltan los dos
  historial: FilaConstancia[];
  proyeccion: { horas: number; semillas: number } | null;
  // Lo que ya usa la pantalla, sin cambios: rango, meses y datos del pacto.
  variable: SemillasVariables & { rango: RangoHoras } | null;
  variableAnterior: { recibidas: number | null; pendientes: number | null; cumplidos: number; compromisoMeses: number } | null;
  pactoAceptado: boolean;
  horas: number | null;
};

function libroDeComunidad(e: {
  pactosCrudo: string | null;
  rondas: Rondas;
  comunidad: string;
  idioma?: Idioma;
  idPersona: string | null;
  registro: readonly ConstanciaPacto[] | null;
  ahora: string;
}): LibroDeComunidad;
```

`semillasDeComunidad` se mantiene como lectura de los datos crudos del pacto (pierde `tiempo` y `total`) y `libroDeComunidad` la usa. `/semillas` y `/perfil` dejan de leer `tiempo` y `total` de ahí. El reloj y el registro vienen de afuera para que los tests fijen todo.

<!-- arquitecto: `idPersona`, `registro` y `ahora` pasan a ser obligatorios. Hoy las pantallas llaman a `semillasDeComunidad` sin esos argumentos y los valores por defecto leen `localStorage` y el reloj: con un `registro` opcional, el libro no sería puro y las revocaciones podrían no aplicarse sin que nada avise. -->
**Las pantallas pasan los tres argumentos:** `personaEnSesion()`, `leerDelNavegador()` y la hora actual, leídos una vez por render. **`libroDeComunidad` lee `leerPactosConciliados` una sola vez** y calcula desde ese estado: necesita `declaradas` con su `propuestaId`, que `semillasDeComunidad` no expone, para sacar los meses revocados antes de `semillasVariables` (§4). Si hace falta, se separa una función interna que reciba el estado ya conciliado.

Las filas son una vista calculada: no se guardan y no se migran como constancias emitidas (ADR-029).

### 2. Qué es una constancia en cada origen

- **Tarea:** la `ConstanciaBase` guardada, tal cual. `calculada: false`. No se recalcula.
- **Pacto (mes recibido):** un mes `confirmada` con horas > 0 cuando el compromiso está cumplido, sea del pacto vigente o de `variableAnterior`. `uid = ejemplo-base-mensual-<comunidad>-<mes>`, `semillas = semillasDelMes(horas)`, `calculada: true`. <!-- arquitecto: `SemillasVariables.meses` trae solo los últimos 3 meses; armar las filas desde ahí bajaría el saldo al llegar al cuarto mes. --> Las filas salen de **todas** las `declaradas`, nunca de `variable.meses`, que trae solo los últimos 3.
- **Ronda:** `constanciasDeRonda` ya existente, con `pactoAceptado`, `horas !== null` (fijo) y `ronda.enviada`. Fuerza: `PARAMETROS_DE_PARTIDA.fuerza`, nunca la del selector. Período: `PERIODO_EJEMPLO`. `calculada: true`, `ejemplo: true`.

**Por qué las mensuales no llevan `datos.confirmacion`:** ADR-021 lo pide para la emisión real. Estas filas no son la emisión; se derivan al leer, y `DeclaracionMes` solo guarda `propuestaId`. La emisión con único por confirmación queda para el cambio que la implemente.

**Reutilizar `constanciasDeRonda` tal cual:** la entrada de horas sigue siendo la del pacto vigente. Como no se guarda, si la persona cambia sus horas después de enviar la ronda, la base se recalcula (ver Riesgos).

### 3. Saldo (`saldoDe`, puro y con tests propios)

```
para cada base no revocada:
  ajuste = último ajuste no revocado que apunta a ella
  suma ajuste.semillas, si existe; si no, base.semillas
recibidas = suma, o null si no hay ninguna
```

`datos.semillas` del ajuste **es el valor final**, no una diferencia (`semillasAjustadas`): sumar base y ajuste contaría doble. Una base con ajuste vigente queda `estado: "reemplazada"`, `cuentaEnSaldo: false`. El ajuste de una base revocada queda `cuentaEnSaldo: false`, y su `estado` es `"revocada"` aunque no tenga un `revoca` propio.

### 4. Revocaciones

No se cambian los tipos guardados: `revocada_en` sigue siendo `null` en `ConstanciaBase` y `Constancia`, porque una constancia no se edita (ADR-012). Se calcula al leer, como `estaRevocada`.

<!-- arquitecto: se suma el mismo `sobre` y la regla de la reconfirmación. `responderMes` deja volver a confirmar un mes cuya confirmación se revocó: buscar solo la primera lo marcaría revocado aunque tenga una confirmación vigente. -->
- **Tarea:** se busca en el registro la confirmación `datos.confirmacion` de la base. Si existe y tiene un `revoca` con `apuntaA` igual a su id y la **misma `afirma` y el mismo `sobre`** que la confirmación (`revocar` copia los dos), la base queda revocada con `revocadaEn = revoca.cuando`.
- **Mes:** se busca la `pacto-confirma-horas` con `apuntaA === propuestaId`, y se aplica la misma regla. **Si `respuestaDeMes` devuelve una confirmación para esa propuesta, el mes está vigente**, aunque tenga otra confirmación revocada antes. **Un mes revocado se saca de las declaraciones antes de llamar a `semillasVariables`**, que no cambia. Si con eso cae por debajo del mínimo, los otros meses vuelven a pendientes (ver Riesgos). Una fila mensual revocada solo aparece si el mes habría sido una constancia recibida al calcular **con** todos los meses.
- **Mes confirmado sin confirmación en el registro:** no se considera revocado. Lo que falta no es una revocación.
- **Ronda:** sin fuente de revocación en el prototipo. `saldoDe` cubre base y ajuste revocados con fixtures en los tests.
- `registro === null`: nada revocado, y se muestra lo guardado.
- **Hoy ninguna pantalla revoca una confirmación**, así que en el prototipo esto solo se ve con datos sembrados. No se agrega el botón.

### 5. Pendientes

- Variable vigente, compromiso sin cumplir y pendientes con dato → `falta-minimo`, con `faltan = compromisoMeses − cumplidos` (siempre ≥ 1).
- `variableAnterior` con pendientes → `espera-validacion`. El texto no dice "círculo" (ya lo cuida un e2e), porque sigue sin definirse quién valida (P.1 de `pactos-horas-variables`).
- `pendientes` nunca sale de un mes declarado o a revisar, ni de una tarea sin verificar (ADR-020).

### 6. Pantalla (`semillas-cliente.tsx`)

Orden:

1. **Tarjetas por comunidad:** Semillas, Semillas pendientes, Aportes en plata y Total. Se quitan las líneas Tiempo, Plata, Presencia y Pactos puntuales. Los `data-testid` `total-<id>` y `pendientes-<id>` se conservan; se suma `recibidas-<id>`.
2. **Resumen de la comunidad elegida** (`semillas-recibidas`, `semillas-pendientes`, `meses-confirmados`, `falta-para-recibir`): Semillas, Semillas pendientes con cuánto falta, proyección rotulada si hay pacto fijo (`semillas-proyeccion`), o la invitación a proponer pacto si no hay ninguno.
3. **Los últimos tres meses** del pacto variable (`semillas-variable`, `mes-semillas-*`) y el bloque "antes del cambio" (`semillas-anterior`), sin cambios, salvo un caso: <!-- arquitecto: al sacar el mes de las declaraciones, esta lista diría "sin dato" mientras el historial dice "revocada". --> un mes revocado se lee "revocado", con sus horas, y no "sin dato". Para eso el libro expone qué meses están revocados.
4. **Historial de constancias** (`data-testid="constancias"`, con ⚖ `constanciaSemillas`): una `<ul>` con `constancia-fila` y `data-tipo`, `data-origen`, `data-estado`. Cada fila dice en texto: tipo, origen, referencia (tarea, mes o "ronda de ejemplo"), período, Semillas, estado y, si corresponde, "calculada", "ejemplo", "apunta a <uid>". El `uid` en fuente mono, pequeño pero legible. <!-- arquitecto: el diseño no decía qué pasaba con este bloque. --> **Reemplaza al bloque de pactos puntuales** (`semillas-puntuales`, `semillas-puntual`, `constancia-puntual`), que se quita junto con `puntual-<id>`.
5. **Lo que abren tus Semillas** (`data-testid="lo-que-abren"`): texto fijo y el enlace existente "Ver lo que te abre tu pasaporte".
6. **Otros datos:** tarjetas Plata (residencia, pase) y Presencia (ticket), sin cambios de lógica.
7. **Ronda, resultado y "Cómo te reconocieron"**, sin cambios de lógica. El bloque de constancias de ejemplo se reduce a una línea dentro del resultado (`data-testid="ajuste-simulado"`): con la fuerza elegida, qué ajuste resultaría, su id y a qué base apunta, y la aclaración de que no cambia el historial. Con pacto variable dice que la simulación es para pactos fijos.

**Ningún estado se comunica solo con color:** la palabra está siempre. Solo se usan los tokens del tema.

### 7. `/perfil`

`resumir()` lee también `CLAVES.semillasRonda` con `leerRondas` y usa `libroDeComunidad(...).total`. Sigue sin guardar nada. Solo cambia de dónde sale el número.

### 8. Textos

- En `lib/idioma/textos/semillas.ts`, es y en. **Se suman:** `resumen`, `pendientes.faltan` (singular y plural), `proyeccion`, `historial.*` y `loQueAbren.*`.
- **Se quitan:** `meta.*` (salvo `verPasaporte`, que pasa a `loQueAbren`), `detalle.tiempo3`, `constancias.*` (pasan a `historial` y a la línea simulada), `panel.tiempo`, `panel.presencia`, `panel.puntual` y `detalle.puntual*` (pasan a `historial`). `panel.plata` se queda: lo usa la tarjeta Plata. **Se quitan recién cuando las pantallas dejaron de usarlos** (`tasks.md`, grupo 4). <!-- arquitecto: quitarlos antes rompe los tipos de `semillas-cliente.tsx`. -->
- **Se corrigen** `ronda.pie` y `detalle.horasMes`: no pueden seguir diciendo que el panel usa factor 1,0 ni que muestra 3 meses.
- **`cantidad` pasa a "N Semillas"** con mayúscula en español, como el nombre decidido, y se actualizan los e2e. <!-- arquitecto: `/pactos` también usa este texto (`pactos-cliente.tsx:1009`). --> `/pactos` lo usa también: ahí cambia solo la mayúscula, no el número.
- `lib/idioma/revision-nativa.ts`: actualizar la descripción (quitar "meta de sembrador/a activo/a", sumar historial).
- **Texto de `loQueAbren` (es):** <!-- arquitecto: el texto anterior no contenía "a definir por cada tribu", que exigen la spec y el e2e de la sección. --> "Lo que abren tus Semillas está a definir por cada tribu. En {comunidad} todavía no está definido." (en: "What your Semillas open is to be defined by each tribe. In {comunidad} it is not defined yet."). Sin ejemplos: D3 los nombra como posibilidad, y listarlos acá se leería como una promesa.
- **Sin términos legales nuevos.** Se reusan `constanciaSemillas`, `evaluacionPares`, `presencia`, `pasefundador` y el 🌱 `semillas`.
- **Nombres:** el nivel "Brote" del Pase Fundador es otra cosa y no se renombra. La regla vale para las Semillas.

### 9. Qué reemplaza de los cambios anteriores

| Cambio | Qué dejaba | Qué pasa ahora |
|---|---|---|
| `semillas-libro`, `semillas-v2` | Tiempo como proyección de 3 meses que suma al total; desglose Tiempo, Plata, Presencia | La proyección se rotula y no suma |
| `ajustes-semillas-canales-reportes` | Medidor de Sembrador/a activo/a | Se retira |
| `evaluacion-pares` | "El panel sigue con factor 1,0"; bloque de constancias de ejemplo | El ajuste de ejemplo llega al saldo; el bloque pasa al historial |
| `pactos-horas-variables` §4 | `tiempo` = recibidas; fijo + anterior = proyección + recibidas | Recibidas como suma de filas; la proyección no suma |

Se limpian de `lib/semillas/`: `estadoMedidor`, `META_SEMBRADOR`, `FACTOR_EVALUACION` y `totalConDato` solo si queda sin uso. `semillasTiempo` y `MESES` quedan para la proyección.

## Risks / Trade-offs

- **[El saldo baja a la vista de todo el equipo]** Un pacto fijo sin ronda pasa de un número a "sin dato". → Es lo que dice ADR-012: sin horas confirmadas no hay base. La proyección queda visible y rotulada. Gus lo confirma (pregunta 1).
- **[Un número de ejemplo entra al saldo]** El ajuste sale de evaluaciones de ejemplo (tarea 2.1 de `evaluacion-pares` sigue abierta: las notas que la persona da no entran al cálculo). → La fila dice "ejemplo". Gus lo confirma (pregunta 2). Si dice que no, cambia solo `saldoDe`.
- **[La base de la ronda y las mensuales no están congeladas]** Si cambian las horas del pacto o el valor de la hora, cambian. Contradice "congelado" de ADR-012. → ADR-021 lo acepta en el prototipo solo para las mensuales; <!-- arquitecto: ADR-021 no habla de la ronda. --> para la base de la ronda lo propone ADR-029. Se rotula "calculada". Antes de cualquier uso real, la emisión tiene que existir.
<!-- arquitecto: riesgos nuevos, de contrastar el diseño con `semillasDeComunidad` y con ADR-012 y ADR-021. -->
- **[Las Semillas de la ronda dependen de la modalidad de hoy]** Como la ronda no guarda cuándo se envió ni con qué horas: (a) un pacto fijo con ronda enviada que pasa a variable pierde esas filas y baja su saldo, algo que se lee contra "lo recibido no desaparece" de ADR-021; (b) una ronda enviada con pacto variable genera filas de golpe si el pacto pasa a fijo; (c) esas filas siempre dicen período `2026-10`, aunque ese mes también tenga una base mensual confirmada, y entonces hay dos bases en un mismo mes. → Se documenta con tests de caracterización (tests que fijan cómo se comporta hoy, sin decir que esté bien) y se deja como pregunta 6. Arreglarlo pide guardar datos en la ronda, y la propuesta lo deja fuera.
- **[La persona se genera Semillas sola]** Enviar la ronda de ejemplo depende solo de ella y le da una base y un ajuste sin horas confirmadas ni validación de otra parte. Esto se lee contra la regla "sin horas confirmadas no hay base" del primer riesgo y contra J11 (nadie se valida a sí mismo). Además, 54 en la tarjeta y en `/perfil` no dice "ejemplo": solo lo dice la fila. → Es de ejemplo y lo cubre el aviso general del prototipo. Se deja como pregunta 7.
- **[Revocar un mes puede devolver otros a pendientes]** Si cae por debajo del mínimo. Se lee raro frente a "lo recibido no desaparece", aunque en el prototipo ninguna pantalla lo dispara. → Se documenta con un test y se deja como pregunta 5.
- **[Revocación falsificable en el navegador]** Quien edite su `localStorage` puede sembrar un `revoca`, y solo se perjudica a sí mismo. → En la base, revocar lo hace el servidor con quien corresponda.
- **[Muchos e2e tocados]** → `tasks.md` los lista. Se conservan los `data-testid` que siguen significando lo mismo.

## Migration Plan

Sin migración: nada de lo guardado cambia de forma. Para volver atrás alcanza con revertir el PR.

## Open Questions

Las preguntas para Gus están al final del resumen del especificador y se repiten acá para que queden con el cambio:

1. ¿Confirma que un pacto fijo sin ronda no tiene Semillas recibidas? ¿O prefiere una confirmación mensual también en el fijo?
2. ¿El ajuste de ejemplo entra al saldo? Es la pregunta abierta de `evaluacion-pares`; acá se implementa como dice ADR-012 §Saldo.
3. ¿Los aportes en plata llevan constancia propia, siguen sumando sin constancia o dejan de dar Semillas? (L2)
4. ¿Se retira el medidor "Sembrador/a activo/a"?
5. Si se revoca un mes y se cae por debajo del mínimo, ¿los otros meses vuelven a pendientes? ¿Y quién puede revocar?
<!-- arquitecto: preguntas nuevas. -->
6. Si un pacto fijo con ronda enviada pasa a variable, ¿esas Semillas desaparecen del saldo, como pasa con este diseño, o se guarda la ronda para que queden?
7. ¿La ronda de ejemplo, que la persona envía sola y sin horas confirmadas, tiene que dar Semillas recibidas? Si la respuesta es no, se quedan como simulación aparte y cambian los escenarios de la spec que esperan 54 y 109.
8. ¿Se deja la revocación de meses para el cambio que agregue quién revoca? Hoy ninguna pantalla revoca y la regla sigue abierta (pregunta 5). Sacarla achica el cambio y exige retocar la spec.
