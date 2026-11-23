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
  - común → el super admin (`"lighthouse"` en `comunidadesQueResponde`), actuando por el común;
  - **círculo transversal → lo administra y facilita Hifa (la IA)** (decisión de Gus, 28-oct; `administradorDe(holon)` de `tribu-necesidades`). En el prototipo Hifa es **simulada y experimental**: no responde, así que responde el **super admin como respaldo humano**, actuando por el círculo. Se nota en tres lugares: la postulación dice que lo administra Hifa (experimental, simulado), `/pactos/responder` dice que se responde como respaldo de Hifa y la constancia de respuesta lleva `datos.respaldoDeHifa = "1"` (`loAdministraHifa(holon)`). La decisión definitiva depende de probar que Hifa sea estable y fiable; si no lo es, vuelve a administrarlo una persona y cambia solo `comunidadQueResponde`.
  Cuando los círculos tengan integrantes, quien facilita el círculo pasa a responder: se cambia solo `comunidadQueResponde` / `puedeResponderPostulacion`.
- Funciones puras de la pantalla de quien responde: `postulacionesParaVer(lista, sesion)` (las que puede responder y las propias, sin botones), `postulacionesDeLaTribu(lista, sesion, tribu)` (lo que cuenta la ficha) y `responderPostulacion(lista, pedido, cuando)`, que se aplica sobre la lista **releída** y no escribe si esa postulación ya tiene respuesta, está retirada, la sesión no puede responderla o falta el motivo (`"ya-respondida" | "sin-permiso" | "sin-motivo"`). También `holonDeId` (de `circulo:valle-3` al `Holon`), `nombreDeHolon` y `aperturaDePostulacion(membresías, comunidad, necesidad)` (crear, sin relación o no se puede tomar: lo que decide la URL de `/pactos`).
- **Nadie responde su propia postulación** (J11). Si quien se postula administra ese holón, la propuesta lleva `datos.proponeLider = "1"` y la responde otra persona que lo administre o el super admin, igual que §10 de `pactos-dos-partes`.

### 3. Constancias de la postulación (sobre lo de `pactos-dos-partes`)

- **Enviar** → `pacto-propone` con `afirma: persona:<idPersona>`, `sobre: puntual:<necesidadId>:<idPersona>`, `version: 1`, `datos`: `tipo: "puntual"`, `comunidad`, `necesidad`, `holon` (`idDeHolon`), `relacion` (`miembro` | `aspirante`, calculada al enviar), `rol`, `rolOtro`, `descripcion`, `horas`, `fecha`, `topeUnidad` y `topeValor` (el máximo por persona de la necesidad al enviar, o vacíos si no tiene), `topeTotalUnidad` y `topeTotalValor` (el **máximo total de la tarea**, o vacíos), `nombre` o `iniciales`, `proponeLider`.
- **Pre-admitir** → `pacto-acepta`, `afirma: idDeHolon(holon)`, `por: <idPersona de quien administra>`, `apuntaA` la propuesta; en un círculo transversal, `datos.respaldoDeHifa = "1"` (responde el super admin como respaldo de Hifa). **No pre-admitir** → `pacto-no-acepta` con `datos.motivo` (obligatorio, hasta 500 caracteres). **Retirar** → `revoca`, solo si sigue pendiente.
- **Contraparte.** En `pactos-dos-partes` una propuesta está acordada si la acepta "la tribu". Se generaliza con `contraparteDe(propuesta)`: para `datos.tipo === "puntual"` es el holón de la necesidad **recalculado desde el `sobre`** (`holonIdDePostulacion`), no `datos.holon` (que escribe la propia persona y queda solo como copia informativa); para el resto, como hoy. `pendientes` y `/pactos/responder` usan `puedeResponderPostulacion` para los puntuales.
- **Varias pre-admitidas por necesidad** (decisión de Gus, 28-oct: una tarea la puede tomar más de una persona). `preadmitidasDe(lista, necesidadId)`: las `pacto-acepta` no revocadas sobre propuestas puntuales de esa necesidad, **una por persona** (el `sobre` ya es por persona). Antes de escribir una pre-admisión se relee el registro (como §6 de `pactos-dos-partes`); si **esa misma propuesta** ya tiene respuesta, no se escribe y quien responde ve "Esta postulación ya se respondió". Pre-admitir a una persona no toca las postulaciones de las demás.
- **Máximo por persona y máximo total.** El `tope` y el `topeTotal` de la necesidad se copian a la propuesta al enviar (`datos.topeUnidad`/`topeValor` y `datos.topeTotalUnidad`/`topeTotalValor`, leídos con `topeDeDatos`); lo que vale después es lo de la propuesta pre-admitida (lo que vio el holón), aunque el dato de ejemplo cambie. Pre-admitir **no** se bloquea por el máximo total: quien responde ve el total y, si es en horas, cuántas horas ya sumaron las personas pre-admitidas; el total se aplica al repartir las Semillas con `repartirConTopeTotal` (por orden de verificación), que es de `pacto-puntual-verificacion`.
- **`sobre` sin `split`**: se arma completo (`puntual:${necesidadId}:${idPersona}`, `sobrePuntual`) y para "lo de esta persona" se compara el string entero: `necesidadDeSobre` toma el tramo hasta el primer `:` (las necesidades no llevan `:`) y `sobreEsDe` exige `sobre === sobrePuntual(necesidad, idPersona)`. Es más estricto que un `endsWith(":" + idPersona)`, que confundiría `prueba:ana@x.test` con `ana@x.test`. Lo mismo en `quitarConstanciasDe` y en la descarga de "Mis datos", que ahora también miran `puntual:`.

### 4. Estado de la persona (`lib/pactos/estado.ts`)

```ts
type PasoPuntual = "borrador" | "enviado" | "preadmitido"; // `pacto-puntual-verificacion` suma "hecha" | "verificado"
type PactoPuntual = {
  necesidadId: string;
  rol: ClaveRol | ""; rolOtro: string; descripcion: string;
  horas: number | null;          // pactadas; null = la persona todavía no las puso
  fecha: string | null;          // "AAAA-MM-DD"
  tope: TopePorPersona | null;   // de la necesidad al crear; al conciliar, el de la propuesta pre-admitida
  topeTotal: TopeTotal | null;   // ídem, el máximo total de la tarea
  paso: PasoPuntual;
  noPreadmitida?: { motivo: string; cuando: string }; // último "no", para el aviso
};
type PactosDeComunidad = { tiempo: PactoTiempo; aportes: number[]; puntuales: PactoPuntual[] };
```

- `HORAS_PUNTUAL = { min: 1, max: 200, paso: 1 }` en `lib/pactos/datos.ts`.
- Acciones de la persona (puras, en un reductor aparte `reducirPuntual` para no mezclarlas con las del pacto de tiempo): `nuevoPuntual { comunidad, necesidad }` (recibe la necesidad ya resuelta), `editarPuntual` (solo en borrador), `enviarPuntual` (solo en borrador y completo), `retirarPuntual` (solo en enviado), `descartarPuntual` (solo en borrador). `nuevoPuntual` no hace nada si ya hay uno con esa `necesidadId`. `puntualCompleto` y `faltaDelPuntual` dicen si se puede enviar y qué falta.
- **Respuestas del holón, solo por conciliación**: `preadmitirPuntual` (enviado → preadmitido) y `noPreadmitirPuntual { motivo, cuando }` (enviado → borrador con el aviso). Las llama `conciliar` cuando encuentra la respuesta en el registro compartido; la pantalla de la persona nunca. <!-- arquitecto (27-oct, se mantiene): cada acción vale solo en su paso; fuera de él devuelve el mismo estado, así una respuesta leída dos veces no aplica dos veces. -->
- Lo que vale es lo que el holón vio: al conciliar una pre-admisión, rol, descripción, horas, fecha, máximo por persona y máximo total se toman de los `datos` de la propuesta aceptada. Solo vale una respuesta que afirma `contraparteDe(propuesta)`, de otra persona que la propia y de la misma versión; la respuesta a una postulación ya retirada no se aplica a la nueva (se toma la última postulación sin revocar).
- `leer` agrega `puntuales: []` cuando falta y valida cada puntual (paso conocido, campos en rango; un `enviado`/`preadmitido` incompleto vuelve a borrador). Ids `__proto__` se ignoran como hoy.
- `pactosAceptados` **no cambia** (solo el fijo).

### 5. Pantalla `/pactos`

<!-- arquitecto (27-oct, se mantiene): la membresía se carga en un efecto; el borrador se crea recién cuando ya se leyó. -->
- El parámetro `necesidad` se procesa **una sola vez y recién cuando la membresía ya se leyó**. Se despacha `nuevoPuntual` solo si: la necesidad existe y es de esa comunidad, `tomable(n)` (abierta y, si es de diseño, con aval), `aceptaFormato(comunidad, "puntual")`, `relacionConHolon(membresias, holonDe(n))` no es null. Que otras personas ya estén pre-admitidas no impide postularse. Si falla la relación: "Para postularte, primero sumate como aspirante a <tribu>" con enlace al manifiesto; si falla otra cosa: "Esa necesidad no se puede tomar". Los dos en una región `role="status"`. Después `router.replace` sin `necesidad`.
- **Aspirantes en `/pactos`.** Hoy `/pactos` muestra "Solo miembros" para una comunidad donde la persona no es miembro. Se cambia solo esto: si la persona tiene puntuales en esa comunidad (o acaba de crear uno), se ve la sección "Mis postulaciones a tareas" con el texto "Sos aspirante a <tribu>: podés postularte a sus tareas; el pacto de tiempo es para miembros". El pacto fijo sigue pidiendo membresía.
- Sección "Mis postulaciones a tareas": un `<article>` por puntual con título (enlace a `/tribus/<id>#necesidad-<nid>`), holón ("Responde: círculo Energía solar"), paso en texto, campos (rol, descripción, horas, fecha con `<input type="date">` y su `<label>`), el máximo por persona y el máximo total si la necesidad los tiene ("Máximo por persona: 10 h · las horas de más no generan Semillas", "Máximo total de la tarea: 20 h · sumando a todas las personas…"), la línea de Hifa (experimental, simulado) si el holón es un círculo transversal, "Enviar postulación", "Retirar y editar", "Descartar", y el aviso de no pre-admitida con su motivo.

### 6. `/pactos/responder`

- Sección nueva "Postulaciones a tareas", agrupada por holón que la persona puede responder. Cada una: quién se postula (nombre o iniciales; "miembro" o "aspirante"), tarea, horas, fecha, descripción, cuándo, y cuántas personas ya pre-admitió ese holón para esa tarea ("Ya pre-admitiste a 1 persona para esta tarea"). Máximo por persona y máximo total de la propuesta, y con un total en horas "Entre todas las personas pre-admitidas suman <N> h de las <M> h del máximo total". En un círculo transversal, el aviso "Lo administra y facilita Hifa (experimental, simulado). Como Hifa no está disponible en el prototipo, respondés como su respaldo". Botones "Pre-admitir" y "No pre-admitir" (con motivo), como los de pactos. Si es la propia: "Es tu propia postulación: la responde otra persona que administre <holón> o el super admin".
- En la ficha de la tribu, el contador de `pactos-dos-partes` ("Pactos para responder (N)") suma las postulaciones pendientes de esa tribu y de sus círculos.

### 7. Ficha de la tribu

Componente cliente `EstadoNecesidadPropio` dentro de cada `<details>`: lee la membresía, la clave de pactos de la persona y el registro compartido. Muestra, en este orden: "<Tribu> por ahora no toma pactos puntuales"; el estado propio ("Tenés un borrador para postularte", "Te postulaste · esperando a <holón>", "Pre-admitida: la tomaste", "<holón> no pre-admitió tu postulación"); "La tomaron <N> personas" si hay pre-admitidas de otras personas (junto con lo que sigue, no en su lugar); "Esperando el aval de <holón>" (de `tribu-necesidades`); "Postularme para tomarla" (`EnlaceConCuenta`) si es miembro o aspirante; o "Para postularte, primero sumate como aspirante a <tribu>". Sin sesión, sin `localStorage` o con el registro ilegible, muestra lo de ejemplo y "Postularme para tomarla" (que pide entrar).

### 8. Eventos

En `lib/actividad/eventos.ts`: `tePostulaste(tarea, comunidad, idComunidad, necesidadId, n)` con `clave: postulacion:<necesidadId>:<n>` (n = número de envío, para que reenviar después de un "no" registre otro), `postulacionPreadmitida(holon, tarea, id, necesidadId)` con `clave: preadmitida:<necesidadId>` y `postulacionNoPreadmitida(holon, tarea, id, propuestaId)` con `clave: no-preadmitida:<propuestaId>`. El motivo no se copia al texto del evento. Como el texto lleva dos datos que no se traducen (la tribu o el holón y la tarea), `DatosEvento` suma `tarea` y `lib/actividad/actividad.ts` valida los dos para estos tres mensajes. El holón se guarda con su artículo en el idioma en que se registró ("El círculo Energía solar"). Los tipos son `pacto` (te postulaste, no pre-admitida) y `pacto-aceptado` (pre-admitida), para que respeten las preferencias de aviso de pactos.

### 9. ⚖ "Pacto puntual" con criterio de la legislación argentina (borrador)

No hay revisión legal en el corto plazo (decisión de Gus, 28-oct). El texto se escribe con lo que se sabe de la legislación argentina, del lado prudente, con `borrador: true`, y la duda queda para el abogado.

- **Lo que se cuida:** la Ley de Contrato de Trabajo (20.744) presume contrato de trabajo cuando alguien presta servicios para otro (art. 23), y lo que lo caracteriza es la **subordinación** (horario, órdenes sobre cómo trabajar, poder de sanción) y la **remuneración** (arts. 21 y 103). La Ley de Voluntariado Social (25.855) describe la actividad voluntaria como **sin remuneración**, por decisión propia, con libertad de dejarla. Por eso el pacto puntual: no impone horario (la persona propone horas y fecha); el holón pre-admite y verifica **el resultado de la tarea**, no dirige a la persona; no hay pago en dinero; la persona puede retirarse.
- **Texto ⚖ `pactopuntual` (es):** "Es un acuerdo voluntario para colaborar con una sola tarea. No es un contrato de trabajo: no tenés horario impuesto, nadie te da órdenes sobre cómo hacerla y no hay pago en dinero. Vos proponés las horas y la fecha. El círculo o la tribu decide si te la deja tomar y, al final, verifica que la tarea quedó hecha. Tus horas verificadas se reconocen con Semillas, que no son un sueldo: no se compran ni se venden." (en: equivalente.)
- **Para la lista del abogado** (`NS_platform/Documentation/Desarrollo/Para el abogado - lista viva (plataforma).md`; los agentes no escriben ahí, lo suma Claude al integrar): ampliar **A1** con "pre-admisión y verificación del holón: que se lean como control del resultado y no como poder de dirección (LCT arts. 21-23)" y "¿hace falta un acuerdo escrito de voluntariado (Ley 25.855) y la tribu tiene que ser una organización sin fines de lucro para encuadrarlo ahí?". **[verificar]**

## Riesgos

- **Pendiente: una necesidad que cambia de holón.** Como el holón se recalcula desde la necesidad, si una necesidad pasa a otro holón las pre-admisiones ya dadas (que afirman el holón anterior) dejan de contar al recalcular. Queda para cuando el servidor valide quién responde (P9): ahí se decide si la pre-admisión se congela con el holón que la dio.
- **La verificación de quién responde es del navegador.** Igual que en `pactos-dos-partes`: aceptable en el prototipo interno; en la base, el servidor verifica que quien responde administra ese holón (P9). <!-- arquitecto (28-oct) --> En la base, además: `datos.relacion` (miembro o aspirante) y `datos.holon` los **recalcula el servidor** al recibir la postulación, desde la membresía y la necesidad (hoy los pone el navegador de quien se postula); una postulación vigente por persona y necesidad y una respuesta por postulación son `unique` en la tabla, no un `if`; y el motivo de "no pre-admitir" (un juicio sobre una persona) va en una columna con acceso solo para la persona y el holón, nunca en lo que se hashea o publica (ADR-018).
- **Una pre-admisión cuenta solo si la afirma el holón de la necesidad y `por` no es la persona** (la regla de "acordada" de `pactos-dos-partes` con `contraparteDe`). Lo prueba el test de 1.3: una que afirma otra tribu, otro círculo o cuyo `por` es la persona no deja la postulación pre-admitida.
- **Quien lidera la tribu responde por sus círculos.** No es lo que dice la holarquía (cada círculo se gobierna), pero en el prototipo los círculos no tienen integrantes reales. Está aislado en una función.
- **Muchas personas en una tarea.** Sin cupo, el holón podría pre-admitir más gente de la que hace falta; lo controla el holón al responder (ve cuántas pre-admitió y cuántas horas suman contra el máximo total) y el máximo por persona y el total acotan las Semillas. Un cupo queda como pregunta.
- **Hifa simulada.** Para los círculos transversales la pre-admisión la da en realidad el super admin: el prototipo no demuestra que una IA pueda decidir quién toma una tarea. Está marcado como experimental y aislado en `comunidadQueResponde`; la decisión definitiva depende de probar que Hifa sea estable y fiable (decisión de Gus, 28-oct). En la base, `respaldoDeHifa` pasa a decir quién respondió de verdad (Hifa o una persona) y queda auditado.
- **Decisiones del 28-oct que no tocan este cambio.** Pasar de horas variables a fijas con Semillas pendientes (se reciben solo si el círculo las valida; si no, se pierden) y los meses confirmados después del mínimo (se reciben al confirmarse) son del pacto recurrente y están en `pactos-horas-variables`. Un pacto puntual no pasa por Semillas pendientes: sus Semillas se reciben directo al verificarse.
- **Aspirantes con postulaciones.** Una persona que solo adhirió al manifiesto ya puede postularse; el filtro es la pre-admisión del holón. Es lo que pidió Gus.
- **Leerse como empleo o como selección de personal.** Ver §9.

## Revisión de arquitectura

<!-- arquitecto: revisión hecha el 27-oct-2026 sobre la versión anterior (con respuestas simuladas). -->
La revisión del 27-oct se hizo sobre la versión con respuestas simuladas; sus ajustes que siguen valiendo están arriba (acciones solo en su paso, borrador después de leer la membresía). Los que tocaban la constancia base, el período y el uid `ejemplo-` pasaron a `pacto-puntual-verificacion`. **Pide una nueva revisión** del agente arquitecto: este cambio ahora toca permisos (quién responde por un holón, aspirantes) y el registro compartido de constancias de `pactos-dos-partes`.
