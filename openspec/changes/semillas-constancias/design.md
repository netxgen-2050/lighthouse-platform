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
  idPersona?: string | null;
  registro?: readonly ConstanciaPacto[] | null;
  ahora?: string;
}): LibroDeComunidad;
```

`semillasDeComunidad` se mantiene como lectura de los datos crudos del pacto (pierde `tiempo` y `total`) y `libroDeComunidad` la usa. `/semillas` y `/perfil` dejan de leer `tiempo` y `total` de ahí. El reloj y el registro vienen de afuera, igual que hoy, para que los tests fijen todo.

### 2. Qué es una constancia en cada origen

- **Tarea:** la `ConstanciaBase` guardada, tal cual. `calculada: false`. No se recalcula.
- **Pacto (mes recibido):** un mes `confirmada` con horas > 0 cuando el compromiso está cumplido, sea del pacto vigente o de `variableAnterior`. `uid = ejemplo-base-mensual-<comunidad>-<mes>`, `semillas = semillasDelMes(horas)`, `calculada: true`.
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

- **Tarea:** se busca en el registro la confirmación `datos.confirmacion` de la base. Si existe y tiene un `revoca` con `apuntaA` igual a su id y la **misma `afirma`** que la confirmación (`revocar` la copia), la base queda revocada con `revocadaEn = revoca.cuando`.
- **Mes:** se busca la `pacto-confirma-horas` con `apuntaA === propuestaId`, y se aplica la misma regla. **Ese mes se saca de las declaraciones antes de llamar a `semillasVariables`**, que no cambia. Si con eso cae por debajo del mínimo, los otros meses vuelven a pendientes (ver Riesgos). Una fila mensual revocada solo aparece si el mes habría sido una constancia recibida al calcular **con** todos los meses.
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
3. **Los últimos tres meses** del pacto variable (`semillas-variable`, `mes-semillas-*`) y el bloque "antes del cambio" (`semillas-anterior`), sin cambios.
4. **Historial de constancias** (`data-testid="constancias"`, con ⚖ `constanciaSemillas`): una `<ul>` con `constancia-fila` y `data-tipo`, `data-origen`, `data-estado`. Cada fila dice en texto: tipo, origen, referencia (tarea, mes o "ronda de ejemplo"), período, Semillas, estado y, si corresponde, "calculada", "ejemplo", "apunta a <uid>". El `uid` en fuente mono, pequeño pero legible.
5. **Lo que abren tus Semillas** (`data-testid="lo-que-abren"`): texto fijo y el enlace existente "Ver lo que te abre tu pasaporte".
6. **Otros datos:** tarjetas Plata (residencia, pase) y Presencia (ticket), sin cambios de lógica.
7. **Ronda, resultado y "Cómo te reconocieron"**, sin cambios de lógica. El bloque de constancias de ejemplo se reduce a una línea dentro del resultado (`data-testid="ajuste-simulado"`): con la fuerza elegida, qué ajuste resultaría, su id y a qué base apunta, y la aclaración de que no cambia el historial. Con pacto variable dice que la simulación es para pactos fijos.

**Ningún estado se comunica solo con color:** la palabra está siempre. Solo se usan los tokens del tema.

### 7. `/perfil`

`resumir()` lee también `CLAVES.semillasRonda` con `leerRondas` y usa `libroDeComunidad(...).total`. Sigue sin guardar nada. Solo cambia de dónde sale el número.

### 8. Textos

- En `lib/idioma/textos/semillas.ts`, es y en. **Se suman:** `resumen`, `pendientes.faltan` (singular y plural), `proyeccion`, `historial.*` y `loQueAbren.*`.
- **Se quitan:** `meta.*` (salvo `verPasaporte`, que pasa a `loQueAbren`), `detalle.tiempo3`, `constancias.*` (pasan a `historial` y a la línea simulada).
- **Se corrigen** `ronda.pie` y `detalle.horasMes`: no pueden seguir diciendo que el panel usa factor 1,0 ni que muestra 3 meses.
- **`cantidad` pasa a "N Semillas"** con mayúscula en español, como el nombre decidido, y se actualizan los e2e.
- `lib/idioma/revision-nativa.ts`: actualizar la descripción (quitar "meta de sembrador/a activo/a", sumar historial).
- **Texto de `loQueAbren` (es):** "Cada tribu va a definir qué abren sus Semillas. En {comunidad} todavía no está definido." (en: "Each tribe will define what its Semillas open. In {comunidad} it is not defined yet."). Sin ejemplos: D3 los nombra como posibilidad, y listarlos acá se leería como una promesa.
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
- **[La base de la ronda y las mensuales no están congeladas]** Si cambian las horas del pacto o el valor de la hora, cambian. Contradice "congelado" de ADR-012. → Aceptado en el prototipo por ADR-021, y se rotula "calculada". Antes de cualquier uso real, la emisión tiene que existir.
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
