# Design

## Contexto

- **Depende de `pactos-dos-partes`** (decisión de Gus, 28-oct: va antes). Ese cambio deja `lib/pactos/constancias.ts` (`ConstanciaPacto` con `id`, `esquema`, `afirma`, `por`, `sobre`, `version`, `apuntaA`, `cuando`, `revocable`, `datos`; esquemas `pacto-propone`, `pacto-acepta`, `pacto-no-acepta`, `revoca`), el registro compartido `compartido:pactos-constancias` (`lib/pactos/registro-compartido.ts`), `comunidadesQueResponde(sesion)`, `conciliar(...)` al leer, `/pactos/responder` y ADR-018. Sus reglas valen acá: ids con `:` sin `split` (§11), lo que vale es lo que la otra parte vio (§9), nombre o iniciales y nunca el email (§1), borrar = quitar lo propio y anonimizar `por` (§7 y §12).
- `tribu-necesidades` deja `lib/tribus/necesidades.ts` con `buscarNecesidad`, `holonDe`, `idDeHolon`, `avalDe` y `tomable`, y la ficha plegable en `/tribus/[id]`.
- `lib/membresia/estado.ts`: `EstadoMembresia = "no-miembro" | "pedido" | "miembro"`. "Pedido" nace al adherir al manifiesto (`/tribus/<id>/manifiesto`).
- `lib/gobernanza/datos.ts`: `circulosDe`, `circulosTransversales` (`tribus` participantes; el transversal cuelga del común).

## Decisiones

### 1. Formatos (`lib/pactos/formatos.ts`)

```ts
type FormatoPacto = "fijo" | "puntual";        // `pactos-horas-variables` agrega "variable"
const FORMATOS: Record<string, FormatoPacto[]>; // por id de comunidad
function formatosDe(comunidad: string): FormatoPacto[]; // sin dato → ["fijo"]
function aceptaFormato(comunidad: string, f: FormatoPacto): boolean;
```

Ejemplo (aprobado por Gus el 28-oct): `semilla`, `monte`, `agua`, `valle`, `taller`, `avelan`, `puerto` → `["fijo", "puntual"]`; `barda` → `["fijo"]`; `lighthouse` → `["fijo"]`. Los formatos son de la comunidad, no un dato descriptivo de la tribu: no van en `TribuBilingue`.

### 2. Quién se postula y quién responde (`lib/pactos/postulacion.ts`, puro)

```ts
type Relacion = "miembro" | "aspirante";
function tribusDelHolon(h: Holon): string[];          // círculo de tribu → [tribu]; transversal → sus `tribus`; tribu → [id]; común → []
function relacionConHolon(m: Membresias, h: Holon): Relacion | null; // la mejor entre sus tribus: miembro > aspirante > null
function comunidadQueResponde(h: Holon): string;       // tribu o círculo de tribu → id de la tribu; transversal o común → "lighthouse"
function puedeResponderPostulacion(sesion, propuesta): boolean;
```

- **Miembros y aspirantes del holón** (decisión de Gus, 28-oct). En el prototipo los círculos no tienen integrantes reales (`fogon-gobernanza-holarquia` usa personas de ejemplo), así que la relación con un círculo sale de la membresía en su tribu (o en alguna de las tribus de un transversal). **Aspirante = membresía "pedido"**: quien adhirió al manifiesto y todavía no fue aceptado. No se inventa otro estado.
- **Quién administra el holón** (patrón de la holarquía: decide el holón más chico; lo que no tiene a nadie que lo administre en el prototipo, lo responde el nivel de arriba):
  - tribu, o círculo de una tribu → quien lidera esa tribu (`comunidadesQueResponde(sesion)` incluye el id de la tribu), **actuando por el círculo**: la constancia afirma `circulo:<id>` y `por` es quien lidera;
  - círculo transversal o común → el super admin (`"lighthouse"` en `comunidadesQueResponde`), actuando por el círculo o por el común.
  Cuando los círculos tengan integrantes, quien facilita el círculo pasa a responder: se cambia solo `comunidadQueResponde` / `puedeResponderPostulacion`.
- **Nadie responde su propia postulación** (J11). Si quien se postula administra ese holón, la propuesta lleva `datos.proponeLider = "1"` y la responde otra persona que lo administre o el super admin, igual que §10 de `pactos-dos-partes`.

### 3. Constancias de la postulación (sobre lo de `pactos-dos-partes`)

- **Enviar** → `pacto-propone` con `afirma: persona:<idPersona>`, `sobre: puntual:<necesidadId>:<idPersona>`, `version: 1`, `datos`: `tipo: "puntual"`, `comunidad`, `necesidad`, `holon` (`idDeHolon`), `relacion` (`miembro` | `aspirante`, calculada al enviar), `rol`, `rolOtro`, `descripcion`, `horas`, `fecha`, `topeUnidad` y `topeValor` (el máximo por persona de la necesidad al enviar, o vacíos si no tiene), `nombre` o `iniciales`, `proponeLider`.
- **Pre-admitir** → `pacto-acepta`, `afirma: idDeHolon(holon)`, `por: <idPersona de quien administra>`, `apuntaA` la propuesta. **No pre-admitir** → `pacto-no-acepta` con `datos.motivo` (obligatorio, hasta 500 caracteres). **Retirar** → `revoca`, solo si sigue pendiente.
- **Contraparte.** En `pactos-dos-partes` una propuesta está acordada si la acepta "la tribu". Se generaliza con `contraparteDe(propuesta)`: para `datos.tipo === "puntual"` es `datos.holon`; para el resto, como hoy. `pendientes` y `/pactos/responder` usan `puedeResponderPostulacion` para los puntuales.
- **Varias pre-admitidas por necesidad** (decisión de Gus, 28-oct: una tarea la puede tomar más de una persona). `preadmitidasDe(lista, necesidadId)`: las `pacto-acepta` no revocadas sobre propuestas puntuales de esa necesidad, **una por persona** (el `sobre` ya es por persona). Antes de escribir una pre-admisión se relee el registro (como §6 de `pactos-dos-partes`); si **esa misma propuesta** ya tiene respuesta, no se escribe y quien responde ve "Esta postulación ya se respondió". Pre-admitir a una persona no toca las postulaciones de las demás.
- **Máximo por persona.** El `tope` de la necesidad se copia a la propuesta al enviar (`datos.topeUnidad`, `datos.topeValor`); lo que vale después es el de la propuesta pre-admitida (lo que vio el holón), aunque el dato de ejemplo cambie.
- **`sobre` sin `split`**: se arma completo (`puntual:${necesidadId}:${idPersona}`) y para "lo de esta persona" se usa `startsWith("puntual:") && endsWith(":" + idPersona)` (ids con `:`; §11 de `pactos-dos-partes`). Lo mismo en `quitarConstanciasDe` y en la descarga de "Mis datos", que ahora también miran `puntual:`.

### 4. Estado de la persona (`lib/pactos/estado.ts`)

```ts
type PasoPuntual = "borrador" | "enviado" | "preadmitido"; // `pacto-puntual-verificacion` suma "hecha" | "verificado"
type PactoPuntual = {
  necesidadId: string;
  rol: ClaveRol | ""; rolOtro: string; descripcion: string;
  horas: number | null;          // pactadas; null = la persona todavía no las puso
  fecha: string | null;          // "AAAA-MM-DD"
  tope: TopePorPersona | null;   // de la necesidad al crear; al conciliar, el de la propuesta pre-admitida
  paso: PasoPuntual;
  noPreadmitida?: { motivo: string; cuando: string }; // último "no", para el aviso
};
type PactosDeComunidad = { tiempo: PactoTiempo; aportes: number[]; puntuales: PactoPuntual[] };
```

- `HORAS_PUNTUAL = { min: 1, max: 200, paso: 1 }` en `lib/pactos/datos.ts`.
- Acciones de la persona (puras): `nuevoPuntual { comunidad, necesidad }` (recibe la necesidad ya resuelta), `editarPuntual` (solo en borrador), `enviarPuntual` (solo en borrador y completo), `retirarPuntual` (solo en enviado), `descartarPuntual` (solo en borrador). `nuevoPuntual` no hace nada si ya hay uno con esa `necesidadId`.
- **Respuestas del holón, solo por conciliación**: `preadmitirPuntual` (enviado → preadmitido) y `noPreadmitirPuntual { motivo, cuando }` (enviado → borrador con el aviso). Las llama `conciliar` cuando encuentra la respuesta en el registro compartido; la pantalla de la persona nunca. <!-- arquitecto (27-oct, se mantiene): cada acción vale solo en su paso; fuera de él devuelve el mismo estado, así una respuesta leída dos veces no aplica dos veces. -->
- Lo que vale es lo que el holón vio: al conciliar una pre-admisión, rol, descripción, horas, fecha y máximo por persona se toman de los `datos` de la propuesta aceptada.
- `leer` agrega `puntuales: []` cuando falta y valida cada puntual (paso conocido, campos en rango; un `enviado`/`preadmitido` incompleto vuelve a borrador). Ids `__proto__` se ignoran como hoy.
- `pactosAceptados` **no cambia** (solo el fijo).

### 5. Pantalla `/pactos`

<!-- arquitecto (27-oct, se mantiene): la membresía se carga en un efecto; el borrador se crea recién cuando ya se leyó. -->
- El parámetro `necesidad` se procesa **una sola vez y recién cuando la membresía ya se leyó**. Se despacha `nuevoPuntual` solo si: la necesidad existe y es de esa comunidad, `tomable(n)` (abierta y, si es de diseño, con aval), `aceptaFormato(comunidad, "puntual")`, `relacionConHolon(membresias, holonDe(n))` no es null. Que otras personas ya estén pre-admitidas no impide postularse. Si falla la relación: "Para postularte, primero sumate como aspirante a <tribu>" con enlace al manifiesto; si falla otra cosa: "Esa necesidad no se puede tomar". Los dos en una región `role="status"`. Después `router.replace` sin `necesidad`.
- **Aspirantes en `/pactos`.** Hoy `/pactos` muestra "Solo miembros" para una comunidad donde la persona no es miembro. Se cambia solo esto: si la persona tiene puntuales en esa comunidad (o acaba de crear uno), se ve la sección "Mis postulaciones a tareas" con el texto "Sos aspirante a <tribu>: podés postularte a sus tareas; el pacto de tiempo es para miembros". El pacto fijo sigue pidiendo membresía.
- Sección "Mis postulaciones a tareas": un `<article>` por puntual con título (enlace a `/tribus/<id>#necesidad-<nid>`), holón ("Responde: círculo Energía solar"), paso en texto, campos (rol, descripción, horas, fecha con `<input type="date">` y su `<label>`), el máximo por persona si la necesidad lo tiene ("Máximo por persona: 10 h · las horas de más no generan Semillas"), "Enviar postulación", "Retirar y editar", "Descartar", y el aviso de no pre-admitida con su motivo.

### 6. `/pactos/responder`

- Sección nueva "Postulaciones a tareas", agrupada por holón que la persona puede responder. Cada una: quién se postula (nombre o iniciales; "miembro" o "aspirante"), tarea, horas, fecha, descripción, cuándo, y cuántas personas ya pre-admitió ese holón para esa tarea ("Ya pre-admitiste a 1 persona para esta tarea"). Botones "Pre-admitir" y "No pre-admitir" (con motivo), como los de pactos. Si es la propia: "Es tu propia postulación: la responde otra persona que administre <holón> o el super admin".
- En la ficha de la tribu, el contador de `pactos-dos-partes` ("Pactos para responder (N)") suma las postulaciones pendientes de esa tribu y de sus círculos.

### 7. Ficha de la tribu

Componente cliente `EstadoNecesidadPropio` dentro de cada `<details>`: lee la membresía, la clave de pactos de la persona y el registro compartido. Muestra, en este orden: "<Tribu> por ahora no toma pactos puntuales"; el estado propio ("Tenés un borrador para postularte", "Te postulaste · esperando a <holón>", "Pre-admitida: la tomaste", "<holón> no pre-admitió tu postulación"); "La tomaron <N> personas" si hay pre-admitidas de otras personas (junto con lo que sigue, no en su lugar); "Esperando el aval de <holón>" (de `tribu-necesidades`); "Postularme para tomarla" (`EnlaceConCuenta`) si es miembro o aspirante; o "Para postularte, primero sumate como aspirante a <tribu>". Sin sesión, sin `localStorage` o con el registro ilegible, muestra lo de ejemplo y "Postularme para tomarla" (que pide entrar).

### 8. Eventos

En `lib/actividad/eventos.ts`: `tePostulaste(tarea, comunidad, id)` con `clave: postulacion:<necesidadId>:<n>` (n = número de envío, para que reenviar después de un "no" registre otro), `postulacionPreadmitida(holon, tarea, id, necesidadId)` con `clave: preadmitida:<necesidadId>` y `postulacionNoPreadmitida(holon, tarea, id, propuestaId)` con `clave: no-preadmitida:<propuestaId>`. El motivo no se copia al texto del evento.

### 9. ⚖ "Pacto puntual" con criterio de la legislación argentina (borrador)

No hay revisión legal en el corto plazo (decisión de Gus, 28-oct). El texto se escribe con lo que se sabe de la legislación argentina, del lado prudente, con `borrador: true`, y la duda queda para el abogado.

- **Lo que se cuida:** la Ley de Contrato de Trabajo (20.744) presume contrato de trabajo cuando alguien presta servicios para otro (art. 23), y lo que lo caracteriza es la **subordinación** (horario, órdenes sobre cómo trabajar, poder de sanción) y la **remuneración** (arts. 21 y 103). La Ley de Voluntariado Social (25.855) describe la actividad voluntaria como **sin remuneración**, por decisión propia, con libertad de dejarla. Por eso el pacto puntual: no impone horario (la persona propone horas y fecha); el holón pre-admite y verifica **el resultado de la tarea**, no dirige a la persona; no hay pago en dinero; la persona puede retirarse.
- **Texto ⚖ `pactopuntual` (es):** "Es un acuerdo voluntario para colaborar con una sola tarea. No es un contrato de trabajo: no tenés horario impuesto, nadie te da órdenes sobre cómo hacerla y no hay pago en dinero. Vos proponés las horas y la fecha. El círculo o la tribu decide si te la deja tomar y, al final, verifica que la tarea quedó hecha. Tus horas verificadas se reconocen con Semillas, que no son un sueldo: no se compran ni se venden." (en: equivalente.)
- **Para la lista del abogado** (`NS_platform/Documentation/Desarrollo/Para el abogado - lista viva (plataforma).md`; los agentes no escriben ahí, lo suma Claude al integrar): ampliar **A1** con "pre-admisión y verificación del holón: que se lean como control del resultado y no como poder de dirección (LCT arts. 21-23)" y "¿hace falta un acuerdo escrito de voluntariado (Ley 25.855) y la tribu tiene que ser una organización sin fines de lucro para encuadrarlo ahí?". **[verificar]**

## Riesgos

- **La verificación de quién responde es del navegador.** Igual que en `pactos-dos-partes`: aceptable en el prototipo interno; en la base, el servidor verifica que quien responde administra ese holón (P9).
- **Quien lidera la tribu responde por sus círculos.** No es lo que dice la holarquía (cada círculo se gobierna), pero en el prototipo los círculos no tienen integrantes reales. Está aislado en una función.
- **Muchas personas en una tarea.** Sin cupo, el holón podría pre-admitir más gente de la que hace falta; lo controla el holón al responder (ve cuántas pre-admitió) y el máximo por persona acota las Semillas de cada una. Un cupo queda como pregunta.
- **Aspirantes con postulaciones.** Una persona que solo adhirió al manifiesto ya puede postularse; el filtro es la pre-admisión del holón. Es lo que pidió Gus.
- **Leerse como empleo o como selección de personal.** Ver §9.

## Revisión de arquitectura

<!-- arquitecto: revisión hecha el 27-oct-2026 sobre la versión anterior (con respuestas simuladas). -->
La revisión del 27-oct se hizo sobre la versión con respuestas simuladas; sus ajustes que siguen valiendo están arriba (acciones solo en su paso, borrador después de leer la membresía). Los que tocaban la constancia base, el período y el uid `ejemplo-` pasaron a `pacto-puntual-verificacion`. **Pide una nueva revisión** del agente arquitecto: este cambio ahora toca permisos (quién responde por un holón, aspirantes) y el registro compartido de constancias de `pactos-dos-partes`.
