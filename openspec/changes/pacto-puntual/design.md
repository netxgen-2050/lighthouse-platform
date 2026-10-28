# Design

## Contexto

- `lib/pactos/estado.ts` guarda en `localStorage` (clave de pactos de la persona) un `EstadoPactos` con `comunidades: Record<string, { tiempo: PactoTiempo; aportes: number[] }>`. Un solo pacto de tiempo por comunidad, con `paso` 0/1/2, versión, historial y cambio. Las respuestas de la comunidad son acciones del reductor que hoy dispara la persona con botones "Simular…".
- `lib/semillas/estado.ts` arma la tarjeta de cada comunidad (`semillasDeComunidad`) con `tiempo`, `plata` y `presencia`, y `totalConDato` (sin dato ≠ 0).
- `tribu-necesidades` deja `lib/tribus/necesidades.ts` con `buscarNecesidad(id, idioma)` y la ficha plegable en `/tribus/[id]`.
- Specs propuestas, **sin implementar en `dev`** al 27-oct: `pactos-dos-partes` (constancias de propuesta y aceptación, `/pactos/responder`, conciliación al leer; ADR-018 en su rama) y `evaluacion-pares` (constancias `semillas-base` y `semillas-ajuste`, `lib/evaluacion/`).

## Decisiones

### 1. Formatos (`lib/pactos/formatos.ts`)

```ts
type FormatoPacto = "fijo" | "puntual";        // `pactos-horas-variables` agrega "variable"
const FORMATOS: Record<string, FormatoPacto[]>; // por id de comunidad
function formatosDe(comunidad: string): FormatoPacto[]; // sin dato → ["fijo"]
function aceptaFormato(comunidad: string, f: FormatoPacto): boolean;
```

Ejemplo: `semilla`, `monte`, `agua`, `valle`, `taller`, `avelan`, `puerto` → `["fijo", "puntual"]`; `barda` → `["fijo"]`; `lighthouse` → `["fijo"]`. Los formatos son de la comunidad, no de la tribu como dato descriptivo: por eso no van en `TribuBilingue` (no hay que tocar los tests de campos bilingües).

### 2. Estado (`lib/pactos/estado.ts`)

```ts
type PasoPuntual = "borrador" | "enviado" | "aceptado" | "hecha" | "confirmado";
type PactoPuntual = {
  necesidadId: string;
  rol: ClaveRol | ""; rolOtro: string; descripcion: string;
  horas: number | null;          // pactadas; null = la persona todavía no las puso
  fecha: string | null;          // "AAAA-MM-DD"
  paso: PasoPuntual;
  horasReales?: number;          // desde "hecha"
  avisoRevisar?: boolean;        // la tribu pidió revisar las horas
  constancia?: ConstanciaBase;   // solo en "confirmado"
};
type PactosDeComunidad = { tiempo: PactoTiempo; aportes: number[]; puntuales: PactoPuntual[] };
```

- `HORAS_PUNTUAL = { min: 1, max: 200, paso: 1 }` en `lib/pactos/datos.ts`.
- Acciones nuevas (puras; `ahora` lo pone quien llama): `nuevoPuntual { comunidad, necesidad }` (recibe la necesidad ya resuelta, para no importar datos de tribus en el reductor), `editarPuntual { comunidad, necesidadId, cambios }` (solo en borrador), `enviarPuntual`, `retirarPuntual`, `descartarPuntual`, `marcarHecha { horasReales }`, y las **dos respuestas de la tribu**: `aceptarPuntual` y `responderHoras { confirma: boolean, ahora }`.
- `nuevoPuntual` no hace nada si ya hay un puntual con esa `necesidadId` en la comunidad (unicidad).
<!-- arquitecto: "responde dos veces" — un doble clic o dos pestañas no pueden emitir dos constancias ni dos eventos. -->
- **Cada acción vale solo en su paso; fuera de él no cambia nada** (devuelve el mismo estado): `editarPuntual` y `enviarPuntual` solo en `borrador`; `retirarPuntual` y `aceptarPuntual` solo en `enviado`; `marcarHecha` solo en `aceptado`; `responderHoras` solo en `hecha`. Así, confirmar dos veces deja **una** constancia (la primera, con su `creada_en`) y un solo evento. Un test despacha `responderHoras { confirma: true }` dos veces seguidas y compara.
- `puntualCompleto(p)`: rol (y `rolOtro` si es "otro"), descripción, `horas` entera en rango y `fecha` válida.
- `leer` agrega `puntuales: []` cuando falta y valida cada puntual (paso conocido, campos en rango; un `enviado`/`aceptado` incompleto vuelve a borrador; `hecha` sin `horasReales` válidas vuelve a `aceptado`; `confirmado` sin constancia válida vuelve a `hecha`). Ids `__proto__` se ignoran como hoy.
- `pactosAceptados` **no cambia** (solo el fijo): la ronda y el cálculo de tiempo de hoy siguen igual.

### 3. Constancia base (`lib/pactos/constancia-base.ts`)

Misma forma que el design de `evaluacion-pares` §5 (ADR-012), para que después se unifiquen sin migrar:

```ts
type ConstanciaBase = {
  uid: string;                    // `base-puntual-<comunidad>-<necesidadId>`
  schema: "semillas-base";
  afirma: "netx";
  sobre: string;                  // `puntual:<comunidad>:<necesidadId>`
  apunta_a: null;
  datos: { tipo: "puntual"; pacto: string; necesidad: string; fecha_tarea: string; horas: number;
           valor_hora_usd: number; periodo: string; version_pacto: 1; semillas: number };
  creada_en: string;              // ISO, `ahora` de la confirmación
  revocada_en: null; vence_en: null;
};
function constanciaBasePuntual(comunidad, p: PactoPuntual, ahora: string): ConstanciaBase;
function leerConstanciaBase(x: unknown): ConstanciaBase | null;
```

- `semillas = Math.round(horas × HOUR_REF_USD)` con el mismo cuidado de coma flotante que `evaluacion-pares` (`Number((x).toFixed(6))` antes de redondear). Con `HOUR_REF_USD = 7049 / 1400`: 10 h → 50; 12 h → 60.
<!-- arquitecto: `ahora` es ISO en UTC; el 30-nov a las 22 h de Argentina ya es diciembre en UTC y la constancia quedaría en el período equivocado, que después no se corrige. -->
- `periodo` = mes de `ahora` **en la hora de Argentina** (`America/Argentina/Buenos_Aires`, la misma zona que `lib/fogon/consultas/reglas.ts`), con un helper puro `mesDe(ahora: string): string` ("AAAA-MM") en `lib/pactos/` que también usa `pactos-horas-variables`. No `ahora.slice(0, 7)`. Test: `2026-12-01T01:30:00Z` → `2026-11`. `creada_en` sigue siendo el ISO en UTC.
- `uid` con prefijo `ejemplo-` (`ejemplo-base-puntual-<comunidad>-<necesidadId>`), como las constancias de ejemplo de `evaluacion-pares`: hoy la "afirma NetX" la genera el navegador y el uid lo tiene que dejar a la vista. <!-- arquitecto -->
- `version_pacto`: si se reusa el tipo de `evaluacion-pares` (tarea 0.1 c), se usa su misma representación; si no, `1`. Cuando exista `pactos-dos-partes`, ADR-018 pide que la versión salga de la aceptación: ahí la base de un puntual guarda el uid de `pacto-confirma-horas` en `datos.confirmacion` (no en `apunta_a`, que en ADR-012 queda para la cadena base → ajuste). <!-- arquitecto -->
- **Congelada**: `leerConstanciaBase` valida tipos y que `semillas`, `horas` y `valor_hora_usd` sean números finitos, pero **no** recalcula nada. Un test cambia `HOUR_REF_USD` (con un mock del módulo) y verifica que la constancia leída no cambia.
- `datos` no lleva email ni nombre de la persona (vive en la clave de la persona; ADR-012: nunca datos personales en una cadena).
- Si `evaluacion-pares` llega antes a `dev` con su `lib/evaluacion/constancias.ts`, este módulo **reusa su tipo** en vez de declarar otro (ver tarea 0.1).

### 4. Pantalla `/pactos`

<!-- arquitecto: la membresía se carga en un efecto (`miembro` arranca en []); si el borrador se crea antes, quien no es miembro termina con un pacto guardado de una tribu ajena. -->
- El parámetro `necesidad` se procesa **una sola vez y recién cuando la membresía ya se leyó**, y solo si la persona es miembro de `comunidad` (`comunidadesDondeEsMiembro`). Si no es miembro, no se despacha nada y se ve lo que `/pactos` ya muestra a quien no es miembro; el `router.replace` igual saca el parámetro. Test (e2e): sin membresía en Valle Solar, abrir `/pactos?comunidad=valle&necesidad=valle-solar` no deja ningún puntual en la clave de pactos.
- `app/pactos/pactos-cliente.tsx` lee `necesidad` de la URL junto a `comunidad`. Si `buscarNecesidad` la encuentra, es de esa comunidad, está `abierta` y `aceptaFormato(comunidad, "puntual")`, despacha `nuevoPuntual`; si no, muestra "Esa necesidad no se puede tomar" en una región `role="status"`. Después hace `router.replace` sin `necesidad`, para que recargar no repita nada.
- En la pestaña "Pacto de tiempo", debajo del pacto fijo de la comunidad, una sección "Pactos puntuales" con un `<article>` por puntual: título de la necesidad (enlace a `/tribus/<id>#necesidad-<nid>`), pasos en texto, campos (rol, descripción, horas, fecha con `<input type="date">` y su `<label>`), y los botones del paso. Los "Simular…" van agrupados y rotulados como simulación, como hoy.
- Fecha anterior a hoy: se permite (la tarea pudo hacerse ya); no se valida contra el reloj para que el reductor siga puro.

### 5. Ficha de la tribu

Componente cliente `EstadoNecesidadPropio` dentro de cada `<details>` de `tribu-necesidades`: lee la clave de pactos de la persona (con `leer`) y muestra el estado propio o "Ofrecer tomarla" (`EnlaceConCuenta`), o "<Tribu> por ahora no toma pactos puntuales". Sin sesión o sin `localStorage`, muestra lo de ejemplo y "Ofrecer tomarla" (que pide entrar).

### 6. Preparado para `pactos-dos-partes`

- Las únicas puertas por donde la tribu responde son `aceptarPuntual` y `responderHoras`. Cuando `pactos-dos-partes` se implemente, su conciliación las llama al leer y la pantalla de la persona deja de mostrar los "Simular…", igual que con el pacto fijo.
- Mapeo previsto a sus constancias: enviar → `pacto-propone` con `datos.tipo = "puntual"`, `necesidad`, `fecha`, `horas`; aceptar → `pacto-acepta`; marcar hecha → una propuesta nueva `pacto-propone-horas` (horas reales) y confirmar → `pacto-confirma-horas` que apunta a ella; pedir revisar → `pacto-no-acepta` con motivo. Los dos esquemas de horas son **nuevos** y los tiene que sumar ese cambio (o uno posterior); acá solo se dejan anotados.
- Con esto, en la base la constancia base la emite el servidor al registrarse `pacto-confirma-horas` (nunca el navegador).

### 7. Semillas (`lib/semillas/estado.ts`)

<!-- arquitecto: el total mezcla una proyección (fijo: 3 meses de horas pactadas) con horas confirmadas (puntual). -->
La tarjeta dice en una línea qué es cada parte: "Pacto de tiempo: proyección de 3 meses" y "Pactos puntuales: horas confirmadas". El total no cambia de cuenta (decisión de Gus si se separan; ver preguntas de la revisión).

`SemillasDeComunidad` suma `puntual: Parte` (suma de `constancia.datos.semillas` de los puntuales `confirmado`, o `null`) y `constancias: ConstanciaBase[]`. `total = totalConDato([tiempo, plata, puntual, presencia])`. `pactoAceptado` sigue mirando solo el fijo. La tarjeta lista cada constancia con la tarea (título de la necesidad en el idioma de la página; si la necesidad ya no existe en los datos, el id), horas, fecha (`creada_en`) y Semillas.

### 8. Eventos

En `lib/actividad/eventos.ts`: `ofrecisteTomar(tarea, comunidad, id)`, `puntualAceptado(comunidad, id, necesidadId)` con `clave: puntual-aceptado:<comunidad>:<necesidadId>` y `horasConfirmadas(tarea, comunidad, id, necesidadId)` con `clave: horas-confirmadas:<comunidad>:<necesidadId>`. Tipo `pacto` / `pacto-aceptado`, como los de hoy.

## Riesgos

- **El estado del pacto vive en el navegador de la persona**: la confirmación "de la tribu" la aprieta la misma persona. Es lo mismo que hoy con el pacto fijo y está rotulado como simulación; la confirmación real llega con `pactos-dos-partes` y, en la base, con P9 (`aprobaciones-pactos`).
- **Leerse como empleo.** Tareas con horas y fecha, confirmadas por la tribu, pueden parecer trabajo en relación de dependencia. El ⚖ lo aclara (borrador); el riesgo laboral está anotado en D23 **[verificar]** con abogado.
- **Semillas por tarea suelta.** Sin la ronda, una persona podría sumar Semillas solo con puntuales. Es aceptable en el prototipo; las defensas (D13) y el ajuste (`evaluacion-pares`) lo cubren después.

## Revisión de arquitectura

<!-- arquitecto: revisión hecha el 27-oct-2026. -->
Hecha el 27-oct-2026. Ajustes incorporados arriba: acciones que valen solo en su paso (§2), período en hora de Argentina y uid `ejemplo-` (§3), borrador solo después de leer la membresía (§4) y rótulo de cada parte en Semillas (§7). La emisión de Semillas por tarea, fuera de la ronda mensual de ADR-012, queda en **ADR-020** (Propuesta).
