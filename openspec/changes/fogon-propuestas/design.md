# Design

## Context

- **En `dev`:** el Fogón (`app/fogon/fogon-cliente.tsx`, `lib/fogon/datos.ts`) con decisiones de ejemplo y sus parámetros opcionales (`plazo`, `acuerdo`, `monto`, con `ParametrosDecision`); la holarquía (`lib/gobernanza/`, `app/fogon/gobernanza/`) con la lente "Decisiones que suben" (`caminos.ts`, `panel-decisiones.tsx`), roles de ejemplo y propósitos por círculo; las consultas con voto cuadrático (`/fogon/consultas`, `lib/cuadratico/motor.ts`). Hifa (`asistente-hifa`) fija el patrón de IA guionada y honesta.
- **Referencia aprobada:** `NS_platform/Documentation/mockup/gobernanza-fractal-boceto.html`: `abrirPropuesta()`, `FASES`, `NIVELES`, `ACCIONES` (la matriz) y `PENDIENTES`. Es guía de comportamiento y datos; su código no se copia (usa `innerHTML` y colores sueltos). **La copia de `docs/referencia/gobernanza-fractal-boceto.html` es anterior y no tiene la matriz:** la fuente de verdad para implementar es la tabla de §2 de este design, que ya incluye los cambios de Gus.
- **Respuestas de Gus a los bloques A–F (29-oct-2026):** integradas en §1. Las que cambiaron respecto de lo propuesto: A2, C4, D2, E1 y F1; F2 va al backlog.
- **Antecedente reemplazado:** `fogon-consenso-formal` (no aprobado). Se reusan ideas, no código (nunca se implementó).
- **Principios (C2):** se toman como referencia la Declaración Universal de los Derechos de la Madre Tierra (Cochabamba, 2010), la constitución borrador del Lighthouse (`NS_Tokenomics` 17), los principios de base de Formal Consensus y principios regenerativos de comunidades de referencia. **Por decisión de Gus, esas comunidades no se nombran** ni en la interfaz ni en los datos. La lista va a vivir en el manifiesto de la meta-tribu Lighthouse (spec aparte, todavía no escrita).
- **Guardián (E1, F1):** se inspira en el "Principles Guardian" de `Formal_Consensus_bot/docs/03-Agents/Runtime/Principles-Guardian.md`: una voz separada de la facilitación, que pregunta y señala, nunca juzga.
- `/fogon` pide sesión (nivel Miembro, `lib/permisos/niveles.ts`). `lib/permisos/` son las puertas de la plataforma; este cambio **no** las toca.

## Goals / Non-Goals

**Goals:**
- Un modelo puro y testeable (`lib/fogon/propuestas/`) del que salen la ficha, las fases, la discusión y las acciones.
- Todas las reglas A–F en **un solo módulo de reglas** y la matriz en **un solo módulo de permisos**: cambiar un valor no toca pantallas.
- El estado se **deriva** de registros de solo agregar (como ADR-001 y ADR-012).
- **Las IA (Hifa y el Guardián) sugieren y nunca escriben registros**: todo lo que cambia el estado lo registra una persona.

**Non-Goals:**
- Base, IA real, avisos reales, constancias en cadena, rutas públicas, crear propuestas, construir mecanismos de votación nuevos, delegación, el manifiesto de la meta-tribu.

## Decisions

### 1. Valores de gobernanza (respondidos por Gus el 29-oct-2026)

Viven en `lib/fogon/propuestas/reglas.ts` como constantes con nombre y un comentario con su letra y "decidido por Gus, 29-oct-2026". Un test por regla.

| Letra | Valor que usa el prototipo | Dónde vive |
|---|---|---|
| **A1** | "Afectada" se declara sola con un motivo de una línea (máx. 140 caracteres); el grupo del ámbito puede objetarla y la persona vuelve a su nivel anterior | `REGLAS.afectada = { motivoMax: 140, objetaQuien: "ambito" }` |
| **A2** (cambió) | **Sin cuenta no se ve nada** de las propuestas: ni título, ni ficha, ni discusión, ni resultado. La visita solo ve una invitación a abrir una cuenta (`/sumarte`) | matriz, columna visita toda "no"; `VISTA_SIN_CUENTA` |
| **A3** | Siete niveles: visita, red, del común, del ámbito, afectada, rol de proceso, quien presenta | `NIVELES_IMPLICACION` |
| **B1** | Dos recorridos: simple (presentación, 3 días para objetar, cierre) e importante (8 fases); quien facilita elige; el grupo (del ámbito o afectada) puede pedir el importante | `RECORRIDOS` |
| **B2** | 7 días por defecto: 2 preguntas, 3 discusión y concerns, 2 resolver; configurable por holón (`PLAZOS_POR_HOLON`, id de nodo de la holarquía → días por fase) | `PLAZOS_POR_DEFECTO` |
| **B3** | Mínimo para cerrar por consenso: `min(n, max(ceil(n/2), 3))` personas del ámbito o afectadas que dejaron algún registro | `minimoParticipacion(n)` |
| **C1** | Concerns con nombre; sin nombre solo si la propuesta tiene `tema: "cuidado-conflicto"`, y se muestra "Sin nombre (con facilitación)". **Los concerns se nombran y se clasifican por tema durante la fase de concerns** (y en el plazo para objetar de la decisión simple) | `REGLAS.concernSinNombre`, `FASES_DE_CLASIFICACION` |
| **C2** | Bloquear exige razón y un principio de la lista del Lighthouse (regeneración y vida en el centro; borrador a ratificar por el común), leída desde una costura que después apunta al manifiesto de la meta-tribu | `FuentePrincipios`, `validarBloqueo` (§5) |
| **C3** | La legitimidad de un bloqueo la decide el grupo del ámbito; quien facilita, Hifa y el Guardián solo preguntan o sugieren | matriz, fila "Decidir si un concern es legítimo" |
| **C4** (cambió) | **Quien presenta sí puede levantar concerns, sumarse y bloquear su propia propuesta** (puede cambiar de opinión al escuchar). Sigue pudiendo editarla con historial | matriz, columna presenta |
| **D1** | Sin consenso al vencer: pausa y vuelve con cambios; si es urgente sube al nivel de arriba (círculo → tribu → consejo); en el común y en el consejo, pausa. **Posibilidad futura de diseño (no se diseña):** el *lazy consensus* de Colony (https://docs.colony.io/learn/governance/), donde las personas ponen en juego Semillas para apoyar u objetar (backlog D35) | `alVencer()` |
| **D2** (cambió) | Voto cuadrático, puntos (*dot voting*), voto por convicción u otros mecanismos para repartir recursos, atención o prioridades **los pueden sugerir** las personas participantes o la IA cuando la discusión lo amerita, en la propuesta o en una contrapropuesta. **Nunca reemplazan al consenso** en las decisiones de reglas: sirven para priorizar y repartir. Acá se diseña el lugar donde se sugieren; no se construyen los mecanismos nuevos (el cuadrático ya existe) | `MECANISMOS`, §7 |
| **D3** | Reabrir solo con un nuevo consenso: una propuesta cerrada no se edita | `accionesDisponibles` con fase cierre |
| **E1** (cambió) | La IA nunca decide ni declara ilegítimo nada, pero **sí puede y debe sugerir, antes de aprobar**, el posible impacto o la posible ilegitimidad de una decisión cuando ve una contradicción con los principios del Lighthouse o con una decisión anterior. La sugerencia queda visible; si ninguna persona la respalda como concern, la propuesta sigue su curso | puerto `Guardian` (§6b) |
| **F1** (cambió) | **El Guardián es un arquetipo o agente de IA, no un rol humano**: hace las sugerencias de E1 desde los principios de la vida y la tierra. En el prototipo, guionado y marcado "Guardián (IA, simulado)". Aparece en todas las propuestas, no solo en círculos de tierra o agua | puerto `Guardian` (§6b) |
| **F2** | Sin delegación de voz. Queda para el backlog | no se construye |
| **F3** | Quien pide plata no participa en decidir la legitimidad de los concerns sobre su pedido (quien presenta nunca decide legitimidad) | `RESTRICCIONES_DE_QUIEN_PRESENTA` |
| **F4** | Evaluación breve y opcional al cerrar: "¿Te sentiste escuchada?" (sí, en parte, no) y "¿Qué cambiarías del proceso?" (texto libre, opcional) | `EVALUACION` |

Interpretaciones propias (en Open Questions): qué cuenta como "participar" para B3; que la decisión simple sin concerns abiertos se adopta al vencer (consentimiento por silencio); que un bloqueo no legítimo queda como concern; que quien presenta no puede hacerse a un lado.

### 2. Matriz de permisos (`lib/fogon/propuestas/permisos.ts`)

```ts
type NivelImplicacion = "visita" | "red" | "comun" | "ambito" | "afectada" | "proceso" | "presenta";
type Accion =
  | "leer-propuesta" | "leer-discusion" | "preguntar" | "comentar" | "levantar-concern" | "sumarse-concern"
  | "proponer-resolucion" | "editar" | "pasar-fase" | "hacerse-a-un-lado" | "bloquear" | "decidir-legitimidad"
  | "derivar-o-pausar" | "escribir-acta" | "recibir-avisos";
type Condicion = "solo-comun" | "solo-forma" | "quien-facilita" | "solo-como-miembro" | "por-consenso-del-grupo"
  | "participa-en-la-discusion" | "facilita-nunca-decide" | "con-acuerdo-del-grupo" | "lo-propone" | "rol-memoria"
  | "si-se-suscribe";
type Celda = "si" | "no" | { condicion: Condicion };      // el texto de cada condición sale del diccionario
const MATRIZ: Readonly<Record<Accion, Readonly<Record<NivelImplicacion, Celda>>>>;
function permiso(accion, niveles: readonly NivelImplicacion[], ctx: { ambito: Ambito }): Resultado;
// Resultado = { estado: "si" | "no" | "condicion"; condiciones: Condicion[] }
```

**La matriz (fuente de verdad).** Es la del boceto con los cambios de Gus marcados: `A2` (visita) y `C4` (quien presenta).

| Acción | visita | red | común | ámbito | afectada | proceso | presenta |
|---|---|---|---|---|---|---|---|
| Leer la propuesta | no `A2` | sí | sí | sí | sí | sí | sí |
| Leer la discusión | no | solo-comun | sí | sí | sí | sí | sí |
| Hacer preguntas para aclarar | no | solo-comun | sí | sí | sí | sí | sí |
| Comentar en la discusión abierta | no | no | solo-comun | sí | sí | sí | sí |
| Levantar un concern | no | no | solo-comun | sí | sí | sí | sí `C4` |
| Sumarse a un concern ajeno | no | no | solo-comun | sí | sí | sí | sí `C4` |
| Proponer una enmienda o resolución | no | no | no | sí | sí | sí | sí |
| Editar la propuesta (nueva versión) | no | no | no | no | no | solo-forma | sí |
| Pasar de fase y llamar al consenso | no | no | no | no | no | quien-facilita | no |
| Hacerse a un lado | no | no | no | sí | sí | sí | no |
| Bloquear citando un principio | no | no | no | sí | sí | solo-como-miembro | sí `C4` |
| Decidir si un concern es legítimo | no | no | no | por-consenso-del-grupo | participa-en-la-discusion | facilita-nunca-decide | no `F3` |
| Mandar a un círculo o pausar | no | no | no | con-acuerdo-del-grupo | no | lo-propone | no |
| Escribir el acta | no | no | no | no | no | rol-memoria | no |
| Recibir avisos | no | si-se-suscribe | si-se-suscribe | sí | sí | sí | sí |

- La fila "Hacer preguntas para aclarar" cubre también **responder** preguntas (el boceto tiene el tipo "respuesta" pero no la fila).
- La condición `resumen-si-comun` del boceto **desaparece** (A2).
- Condiciones que **se evalúan** con el contexto: `solo-comun` (sí si `ambito === "comun"`, si no "no"). El resto son **descriptivas**: la acción se ofrece con ◐ y la explicación en texto ("solo la forma, no el fondo").
- **Varios niveles:** unión (el mejor estado de cada nivel; `si` > `condicion` > `no`). Después se aplican `RESTRICCIONES_DE_QUIEN_PRESENTA = ["decidir-legitimidad"]` (F3): si `presenta` está entre los niveles, esa acción da "no" aunque otro nivel la permita. `["ambito", "presenta"]` puede levantar concern, sumarse y bloquear (C4), y no puede decidir legitimidad.
- **Acciones de proceso** fuera de la matriz (no están en el boceto), en `ACCIONES_DE_PROCESO`, con el mismo tipo de celda; visita, siempre "no":
  - `declararse-afectada` (red y del común), `objetar-afectada` (del ámbito), `pedir-recorrido-importante` (del ámbito y afectada), `evaluar` (quien dejó un registro).
  - `clasificar-concern` (C1): rol de proceso "sí"; el resto "no". Quien levanta un concern elige el tema al levantarlo (eso es parte de `levantar-concern`, no de esta acción).
  - `sugerir-mecanismo` (D2): las mismas celdas que "Comentar en la discusión abierta".
  - Respaldar una sugerencia del Guardián **no es una acción aparte**: es `levantar-concern` con `apuntaA` a la sugerencia, así que sigue sus permisos y sus fases.
- **Por fase** (`lib/fogon/propuestas/fases.ts`): `ACCIONES_POR_FASE: Record<Fase, readonly Accion[]>`. Leer y recibir avisos, siempre (para los niveles que pueden). Resumen:

| Fase | Acciones además de leer |
|---|---|
| Borrador | editar, pasar-fase |
| Presentación | preguntar (simple), pasar-fase |
| Preguntas para aclarar | preguntar, pasar-fase |
| Discusión abierta | comentar, proponer-resolucion, sugerir-mecanismo, pasar-fase |
| Concerns: nombrar y clasificar | comentar, levantar-concern, sumarse-concern, clasificar-concern, sugerir-mecanismo, pasar-fase |
| Resolver concerns | comentar, proponer-resolucion, sugerir-mecanismo, editar, derivar-o-pausar, pasar-fase |
| Llamado al consenso | hacerse-a-un-lado, bloquear, decidir-legitimidad, derivar-o-pausar, pasar-fase (= cerrar) |
| Plazo para objetar (simple) | preguntar, comentar, levantar-concern, sumarse-concern, clasificar-concern, sugerir-mecanismo, hacerse-a-un-lado, bloquear, decidir-legitimidad, pedir-recorrido-importante, pasar-fase |
| Cierre | escribir-acta, evaluar |

  `declararse-afectada` y `objetar-afectada` en cualquier fase menos cierre.
- `accionesDisponibles(propuesta, estado, niveles) = acciones de la fase ∩ permitidas por nivel`. Es lo único que usa la pantalla.
- **No se mezcla con `lib/permisos/`** (puertas de la plataforma): son permisos **dentro de una decisión** y de ejemplo. Un comentario en los dos lugares lo aclara (ADR-022, que sigue vigente: quien presenta sigue sin decidir legitimidad).
- Alternativa descartada: reglas `if` en los componentes (no se pueden cambiar sin tocar pantallas ni testear celda por celda).

### 3. Nivel inicial y selector

- `nivelInicial(propuesta, { membresias, tribuLider })`: si el `holonId` de la propuesta es una tribu o un círculo de una tribu (la tribu sale de `caminoHasta(raiz, holonId)` en la holarquía, **no** de `Decision.tribuId`, que casi ninguna decisión tiene) y la persona es miembro aceptada o lidera esa tribu → `ambito`; si no → `red`. Se calcula **después de montar** (lee `localStorage` como `fogon-cliente.tsx`); en el servidor y antes de montar, `red`. Si falla la lectura, `red`.
  <!-- arquitecto: con `tribuId` ninguna de las cinco propuestas daba "ámbito"; se deriva del holón. -->
- **Consejo:** el ámbito de una decisión del consejo son sus representantes, y en el prototipo ningún lugar tiene representante elegido (`representante: null`). Por eso en `consejo-bomba` y `cisterna-compartida` el nivel inicial es `red` aunque la persona sea de Valle Solar o Agua Clara (ser de la tribu que pide **no** te hace del ámbito que decide; F3). Se simula con el selector. <!-- arquitecto -->
- **Del común:** en `regalia` (holón `comun`) toda persona con sesión arranca como `comun`.
- **Sin holón:** `holonId: null` (la huerta: "Círculo de Tierra" no existe en la holarquía de ejemplo) → `red`, plazos por defecto y D1 según `Decision.ambito`. <!-- arquitecto -->
- **La identidad es la de la sesión del navegador**, no una persona nueva: la persona del navegador es `"vos"` (como `VOS` en `lib/fogon/consultas/ejemplo.ts`; la holarquía usa `"yo"` y no se toca).
- Selector `<select>` con etiqueta "Mirá la propuesta como…" y los 7 niveles; el calculado lleva "(tu nivel)". Aviso: "Simulación: en el prototipo podés ver la propuesta desde cada nivel".
- Una declaración de afectada vigente (A1) suma `afectada` a los niveles de la persona en esa propuesta.
- **Visita (A2):** en cualquier propuesta, la página reemplaza todo el contenido (título, ficha, fases, discusión, resultado, tabla) por `VISTA_SIN_CUENTA`: "Para ver las propuestas del Fogón hay que abrir una cuenta" y un enlace a `/sumarte`. El selector sigue visible para volver a otro nivel. La ruta sigue pidiendo sesión, así que la visita real nunca llega a la página: esto solo muestra en el prototipo qué vería.

### 4. Modelo y registros (`lib/fogon/propuestas/tipos.ts`, `estado.ts`)

```ts
type Recorrido = "simple" | "importante";
type Fase = "borrador" | "presentacion" | "preguntas" | "discusion" | "concerns" | "resolver" | "llamado" | "objetar" | "cierre";
type Propuesta = {                       // datos de ejemplo, bilingües
  decisionId: string; recorrido: Recorrido;
  holonId: string | null /* nodo de la holarquía que decide; null si no existe en la de ejemplo */;
  presenta: { personaId: string; desde: Bi }; problema: Bi; propone: Bi;
  inicio: string /* AAAA-MM-DD, empieza la primera fase con plazo */; urgente: boolean;
  tema?: "cuidado-conflicto"; principios: PrincipioId[]; tamanoAmbito: number | null;
  plata: { pide: false } | { pide: true } /* el monto y la fuente salen de Decision.monto */;
  personas: PersonaEjemplo[]; registros: Registro[] /* los de ejemplo, solo de personas */;
  guion: { hifa: GuionHifa; guardian: SugerenciaGuardian[] } /* lo que dicen las IA simuladas */;
};
type Registro = {                        // forma de constancia (ADR-012), solo agregar, siempre de una persona
  id: string; propuestaId: string; version: number; quien: string /* personaId */; nivel: NivelImplicacion;
  cuando: string /* ISO */; apuntaA?: string /* id de otro registro, de una sugerencia del Guardián o de Hifa */;
  tipo: "pregunta" | "respuesta" | "comentario" | "concern" | "sumarse" | "retiro" | "clasificar" | "resolucion"
      | "mecanismo" | "version" | "fase" | "recorrido" | "afectada" | "objecion-afectada" | "a-un-lado" | "bloqueo"
      | "legitimidad" | "cierre" | "acta" | "evaluacion";
  texto?: Bi | string; principio?: PrincipioId; tema?: string; sinNombre?: boolean;
  datos?: Record<string, string | number | boolean>;
  confirmadoPor?: string /* personaId que confirmó una propuesta de Hifa */; simulado: true;
};
function derivarEstado(p: Propuesta, extra: readonly Registro[], ahora: Date): EstadoPropuesta;
// EstadoPropuesta = { fase; version; fases: { fase; desde; vence; hecha }[]; concerns: ConcernVista[];
//   temas: { nombre; concerns }[]; mecanismos: MecanismoVista[]; sugerenciasGuardian: SugerenciaVista[];
//   participacion: { cuenta; minimo: number | null }; resultado: Resultado | null; afectadas; historial }
```

- **La fase no se guarda: se deriva** del último registro `fase` (o `recorrido`), y `alVencer` se aplica con `ahora` (inyectado en los tests; en la página, `new Date()` después de montar). Así un cambio de plazos (B2) recalcula todo sin migrar nada.
- Estado del concern: el último registro que lo apunta (`clasificar` → clasificado en su tema; `resolucion` aceptada → resuelto; `retiro` → retirado; `a-un-lado`; `bloqueo`). Un bloqueo con `legitimidad: false` vuelve a verse como concern abierto con la marca "El grupo no lo consideró bloqueo".
- **Clasificar (C1):** un registro `clasificar` lleva `datos: { accion: "crear" | "renombrar" | "mover", tema, temaAnterior? }` y `apuntaA` (el concern, en "mover"). Los temas se derivan de esos registros y del `tema` elegido al levantar el concern; los concerns sin tema van a "Sin clasificar". `derivarEstado` rechaza (ignora y avisa en el historial) un `clasificar` fuera de `FASES_DE_CLASIFICACION`.
- **Mecanismo (D2):** un registro `mecanismo` lleva `datos: { mecanismo: "cuadratico" | "puntos" | "conviccion" | "otro", nombre?: string, fin: string }` y `apuntaA` (la resolución, si es en una contrapropuesta; sin `apuntaA`, es sobre la propuesta). No entra en la participación (B3) ni en el resultado.
- **Respaldo de una sugerencia del Guardián (E1):** es un registro `concern` con `apuntaA` = id de la sugerencia, el principio de la sugerencia como valor por defecto y la razón escrita por la persona (obligatoria). La sugerencia pasa a "Respaldada por N personas".
- **Ids:** `crypto.randomUUID()` en el navegador para los registros nuevos; los de ejemplo, fijos. La persona del navegador es `"vos"` (ver §3), con su nivel simulado registrado en cada registro.
- **`nivel` en el registro es el nivel simulado**, una declaración del navegador. Cuando esto pase a la base, el nivel lo **calcula el servidor** (membresía, rol de proceso, declaración de afectada vigente) y nunca se acepta del pedido; el selector desaparece (ADR-022). <!-- arquitecto -->
- **Registros por persona:** la clave lleva el prefijo de la persona en sesión, así que otra persona en el mismo navegador ve solo los de ejemplo, no los registros de "vos". Es distinto del registro compartido de los pactos (ADR-018) y está bien para una simulación individual. <!-- arquitecto -->
- **Guardado:** clave nueva `fogonPropuestas: "lh-fogon-propuestas"` en `lib/demo/claves.ts` (con el prefijo de la persona, como las demás), un objeto `{ [propuestaId]: Registro[] }`. Lectura defensiva: si el JSON no se puede leer o un registro no tiene la forma, se descarta ese registro y se muestran los de ejemplo. Lo de ejemplo nunca se escribe en `localStorage`.
- Fechas con `timeZone: "UTC"` (como `ParametrosDecision`) para no correr un día.

### 5. Principios del Lighthouse y su costura (`lib/fogon/propuestas/principios.ts`)

**Costura:**

```ts
type Principio = { id: PrincipioId; nombre: Bi; explicacion: Bi };
interface FuentePrincipios {
  principios(): readonly Principio[];
  estado: "borrador" | "ratificada";
  origen: "ejemplo" | "manifiesto";
}
const principiosDeEjemplo: FuentePrincipios;            // este cambio: estado "borrador", origen "ejemplo"
export const fuentePrincipios: FuentePrincipios = principiosDeEjemplo;   // único punto que cambia después
function principioPorId(id): Principio | null;           // null → "principio fuera de la lista vigente"
```

- Las pantallas, `validarBloqueo`, el Guardián y los tests leen **solo** de `fuentePrincipios`. Cuando exista la spec del manifiesto de la meta-tribu Lighthouse, se suma un adaptador `principiosDelManifiesto` y se cambia esa línea. Los ids son estables para que los registros viejos sigan citando bien; un id que ya no está se muestra como "principio fuera de la lista vigente".
- La lista no lleva columna de fuente en la interfaz ni en los datos (C2: no se nombran las comunidades de referencia). La Declaración Universal de los Derechos de la Madre Tierra sí se puede nombrar en la explicación de `derechos-madre-tierra`.

**Lista inicial (borrador, a ratificar por el común):**

| id | Principio | En palabras simples |
|---|---|---|
| `vida-en-el-centro` | La vida en el centro | Cada decisión mira primero qué le hace a la vida, humana y más que humana |
| `derechos-madre-tierra` | Derechos de la Madre Tierra | La Tierra tiene derecho a existir, regenerarse, mantener sus ciclos y vivir sin contaminación (Declaración Universal de los Derechos de la Madre Tierra) |
| `tierra-no-mercancia` | La tierra no es mercancía | La tierra se cuida y se comparte; no se especula con ella |
| `suelo-vivo` | Suelo vivo | Suelo cubierto todo el año, sin agroquímicos de síntesis, lo que se poda vuelve al suelo |
| `agua-viva` | Agua viva | Capturar y frenar la lluvia, usar la lluvia antes que la napa, tratar las aguas con plantas y microbios |
| `aire-limpio` | Aire limpio | Sin quemas tóxicas; plantar árboles y guardar carbono en el suelo |
| `biodiversidad` | Más vida silvestre | Buena parte de la tierra queda silvestre o vuelve a serlo; se cuidan los árboles viejos y la diversidad |
| `nada-se-tira` | Nada se tira | Reducir, separar, compostar y reusar; sin plásticos de un solo uso |
| `recursos-con-medida` | Recursos con medida | Energía renovable primero, materiales y comida del lugar, poca superficie construida |
| `generaciones-futuras` | Siete generaciones | Se mira el efecto de cada decisión en las generaciones que vienen |
| `voz-afectada` | Decide quien está afectada | Quien vive una regla participa en darle forma |
| `subsidiariedad` | Lo más cerca posible | Se decide en el círculo más chico que pueda decidirlo |
| `cuidado-del-proceso` | Confianza, respeto y no violencia | Persuadir, nunca dominar; escuchar y criticar la idea, no a la persona |
| `poder-compartido` | Poder compartido | Compartir saberes e información; nadie concentra el poder |
| `plata-vuelve-a-la-tierra` | La plata del común vuelve a la tierra | Lo que se junta en común se usa para regenerar |
| `personas-deciden` | Las máquinas sugieren; las personas deciden | Hifa y el Guardián pueden sugerir; nunca deciden |

Un ⚖ `principios` (borrador) explica que la lista es un punto de partida que el común tiene que ratificar y que va a vivir en el manifiesto de la meta-tribu.

### 6. Hifa facilitadora (`lib/fogon/propuestas/facilitacion.ts`)

- Puerto `Facilitador` con `resumir(p, estado)`, `sugerirTemas(estado)` (C1), `recordatorios(p, estado, ahora)`, `proponerSiguienteFase(estado)` y `sugerirMecanismo(p, estado)` (D2). Adaptador `facilitadorGuionado` que devuelve textos de ejemplo de la propuesta (`guion.hifa`), temas fijos de ejemplo y recordatorios armados con las reglas y los plazos.
- **Nada de lo que propone cambia el estado** hasta que una persona con nivel `proceso` (simulado) toca "Confirmar"; el registro (`fase` o `clasificar`) guarda `confirmadoPor`. Una sugerencia de mecanismo de Hifa se muestra como sugerencia y no necesita confirmación porque no cambia nada. El tipo del puerto no tiene métodos para cerrar, bloquear ni decidir legitimidad (test de tipos y de claves).
- Frente a un bloqueo pendiente, el recordatorio es una pregunta al grupo: "¿El grupo considera que este bloqueo se apoya en el principio citado?".
- En "Llamado al consenso" (y al acercarse el vencimiento del plazo para objetar), si hay sugerencias del Guardián sin respaldo, el recordatorio dice: "Hay N sugerencias del Guardián que nadie respaldó; siguen visibles y no frenan la propuesta".
- La IA real será otro adaptador en otro cambio (skill `integracion-externa`, nota 21 G5).

### 6b. Guardián, arquetipo de IA (`lib/fogon/propuestas/guardian.ts`)

```ts
type SugerenciaGuardian = {
  id: string; fase: Fase /* en qué fase aparece; siempre antes de "llamado" o dentro de "objetar" */;
  tipo: "posible-impacto" | "posible-ilegitimidad" /* por contradicción con un principio o una decisión previa */;
  principio?: PrincipioId; decisionPrevia?: string /* decisionId de una propuesta ya adoptada */;
  texto: Bi;
};
interface Guardian { sugerir(p: Propuesta, estado: EstadoPropuesta, previas: readonly DecisionPrevia[]): readonly SugerenciaGuardian[]; }
const guardianGuionado: Guardian;   // devuelve p.guion.guardian filtrado a las fases ya alcanzadas
```

- **Separado de Hifa a propósito** (como en el Principles Guardian de referencia): Hifa cuida el proceso; el Guardián habla desde los principios de la vida y la tierra. Si lo hiciera Hifa, la facilitación dejaría de parecer neutral.
- **Toda sugerencia cita algo**: un principio de `fuentePrincipios` o una decisión previa adoptada (`previas` se arma con las propuestas de ejemplo cuyo resultado es adoptada). Sin cita, no se muestra (test).
- **"Antes de aprobar":** cada sugerencia guionada tiene una `fase` anterior a "llamado" (o "objetar" en la simple), así queda visible antes de que se pueda cerrar.
- **Lenguaje:** siempre como posibilidad ("podría", "posible", "¿contradice…?"). Test sobre todos los textos guionados es/en: ninguno contiene "es ilegítim", "no es legítim", "is illegitimate", "is not legitimate", ni afirma que la propuesta "queda bloqueada".
- **Nunca escribe registros**: no tiene métodos para cerrar, bloquear, pausar ni decidir legitimidad (test de tipos y de claves). Una sugerencia sin respaldo no entra en `alVencer`, ni en la participación, ni en el resultado (test).
- En la pantalla: cada sugerencia es una entrada de la discusión con el tipo "Sugerencia del Guardián (IA, simulado)", su cita, su estado ("Nadie la respaldó: no frena la propuesta" o "Respaldada por N personas") y, si la persona puede levantar un concern en esa fase, el botón "Respaldar como concern", que abre el formulario de concern con el principio ya elegido y la razón vacía (obligatoria).
- La IA real será otro adaptador, junto con el de Hifa.

### 7. Página (`app/fogon/propuestas/[id]/`)

- `page.tsx` (servidor): busca la propuesta por id de decisión; `notFound()` si no existe. Arma los datos en el idioma pedido y pasa todo a `propuesta-cliente.tsx`.
- Orden en el DOM: migas (Fogón › propuesta) → encabezado (ámbito y título) → fases (`<ol aria-label>` con `aria-current="step"` y texto "hecha / ahora / pendiente", más la fecha de vencimiento) → ficha (`<dl>`) → **mecanismos sugeridos sobre la propuesta** → discusión (`<ol>` con un `<article>` por entrada; en fases de concerns, agrupada por tema con un `<h3>` por tema y "Sin clasificar" al final) → "Qué podés hacer" (selector y botones) → facilitación de Hifa → "Quién puede hacer qué" (`<details>` con la tabla) → historial de versiones.
- **Lugar para sugerir un mecanismo (D2):**
  - Debajo de la ficha, una sección "Mecanismos para priorizar o repartir" con las sugerencias sobre la propuesta y, si la persona puede `sugerir-mecanismo` en esta fase, el botón "Sugerir un mecanismo".
  - En cada entrada de tipo "propuesta de resolución" (contrapropuesta), las sugerencias que la apuntan y el mismo botón.
  - Formulario en línea: `<fieldset>` con `<legend>` "Mecanismo" y radios (Voto cuadrático, Puntos, Voto por convicción, Otro — con campo de nombre si es "Otro"), campo "¿Para qué?" (una línea, obligatorio) y una nota fija: "Sirve para priorizar o repartir; no reemplaza al consenso en las decisiones de reglas".
  - Cada sugerencia muestra quién la hizo ("Sugerido por Ramiro (ejemplo)" o "Sugerido por Hifa (IA, simulada)"), el mecanismo, el fin y la nota fija. Voto cuadrático: enlace "Ver cómo funciona en las consultas" a `/fogon/consultas`. Los demás: "Todavía no está en el prototipo".
- Formularios: cada acción abre un formulario en línea con `<label>`, el error en texto con `aria-describedby` y foco al primer campo; al registrar, el foco va a la nueva entrada y un `aria-live="polite"` lo anuncia.
- Clasificar (rol de proceso, en concerns u objetar): en cada concern, un `<select>` "Tema" con los temas y "Nuevo tema…"; renombrar un tema desde su encabezado. Sin arrastrar y soltar (teclado primero).
- Tabla de permisos: `<table>` con `<caption>`, `<th scope="col">` y `<th scope="row">`; cada celda dice "Sí", "No" o la condición en texto; el ✓/—/◐ es `aria-hidden`.
- Tipos de la discusión con texto y borde de token del tema (`clay` no existe en el tema: el concern usa `rose`); la sugerencia del Guardián lleva su propia etiqueta en texto; nunca solo color.
- Botones de entrada: en `fogon-cliente.tsx` y en `panel-decisiones.tsx`, un `<Link>` "Abrir la propuesta" si `propuestaDe(decision.id)` existe.

### 8. Datos de ejemplo (`lib/fogon/propuestas/ejemplos.ts`)

Cinco propuestas, todas sobre decisiones que ya existen en `lib/fogon/datos.ts`, con personas de ejemplo marcadas "(ejemplo)":
- `consejo-bomba` — importante, en "Resolver concerns"; presenta Lautaro (Cuidado de la tierra · Valle Solar); pregunta de Mora, respuesta, comentario de Inés, concerns de Ramiro y Paz clasificados en el tema "Uso compartido", resolución de Gala (contrapropuesta: turnos de riego) con una sugerencia de Ramiro de usar **voto cuadrático** para "Repartir los días de riego entre los círculos". **Guardián:** sugerencia `posible-impacto` en la fase de concerns ("Bombear más en verano podría bajar la napa…"), principio `agua-viva`, **respaldada por Inés** con su propia razón (concern clasificado en el tema "Agua"). Ema, la guardiana humana de la versión anterior, **se quita** (F1 cambió).
- `regalia` — importante, en "Discusión abierta", del común, no pide plata; sin sugerencias del Guardián todavía.
- `siembra` — importante, cerrada por consenso; Paz se hizo a un lado; acta de Memoria. (El boceto la pone en Semilla Viva; en `dev` es de Valle Solar: manda `dev`.) Es la **decisión previa** que cita el Guardián en la cisterna.
- `cisterna-compartida` — importante, en "Preguntas para aclarar"; monto `null` → "sin dato" (el boceto decía USD 9.000; manda `dev`); `tema: "cuidado-conflicto"` (dos tribus quieren la misma ubicación), así se puede levantar un concern sin nombre cuando llegue a la fase de concerns. **Guardián:** sugerencia `posible-ilegitimidad` por posible contradicción con la decisión previa `siembra` ("Una de las ubicaciones podría usar la parcela que el Calendario de siembra de otoño reservó…"), **sin respaldo**. **Hifa** sugiere **puntos** para "priorizar entre las tres ubicaciones".
- `huerta` — simple, en "Plazo para objetar" (Círculo de Tierra, tribu), sin plata. `holonId: null`: "Círculo de Tierra" no es una tribu de `lib/tribus/datos.ts` ni un nodo de la holarquía. <!-- arquitecto -->
- Holones: `consejo-bomba` → `consejo`; `regalia` → `comun`; `siembra` → `valle-0`; `cisterna-compartida` → `consejo`. El campo `origenHolonId` de la versión anterior **se quita**: solo servía para ubicar a la guardiana humana (F1 cambió). <!-- arquitecto -->
- **Plata coherente:** `plata.pide === true` si y solo si la decisión tiene `monto` (bomba y cisterna-compartida); el monto y la fuente nunca se copian en la propuesta. <!-- arquitecto -->
- Tamaños de ámbito de ejemplo: Valle Solar 12, consejo 7, común 40, Círculo de Tierra 4. Fechas de inicio relativas a fines de octubre de 2026.

### 9. Términos ⚖ nuevos (`lib/legal/terminos.ts`, todos `borrador: true`, con `en`)

`concern`, `bloqueo`, `aunlado`, `afectada`, `principios` (lista borrador a ratificar por el común, que va a vivir en el manifiesto de la meta-tribu) y `guardianIA` ("Guardián: una IA simulada que sugiere posibles impactos desde los principios de la vida y la tierra; nunca decide"; distinto del `guardian` existente, que es la asociación). Textos nuevos: no vienen del mock-up.

## Risks / Trade-offs

- [Que se lea como reglamento] → aviso "Proceso de ejemplo: las reglas son de prueba para el prototipo" y ⚖ en cada término.
- [La simulación de niveles confunde con permisos reales] → selector rotulado como simulación; "tu nivel" solo marca el de partida.
- [Que la sugerencia del Guardián se lea como un veredicto o un veto] → lenguaje de posibilidad con test, etiqueta "IA, simulado", la frase "no frena la propuesta" cuando nadie la respalda, y nada de lo que dice entra en el resultado.
- [Que un mecanismo sugerido se lea como votación que decide] → nota fija "no reemplaza al consenso" en el formulario y en cada sugerencia; no hay botón de votar dentro de la propuesta.
- [Quien presenta bloquea su propia propuesta para frenarla a último momento] → el bloqueo sigue pidiendo razón y principio, y su legitimidad la decide el grupo; quien presenta no participa de esa decisión (F3). Además puede editar o retirar.
- [Concern sin nombre: en el navegador el registro guarda quién fue] → en el prototipo no sale de su navegador. Cuando pase a la base, el nombre tiene que quedar fuera del registro público (ver Revisión de arquitectura).
- [Cuatro noches] → cortes con PR en borrador (tasks).
- [Plazos con el reloj del navegador] → `ahora` se inyecta; en los e2e se fija con `page.clock`.

## Migration Plan

Sin base. Clave nueva en el navegador; "Borrar todo" la borra. Para revertir: quitar los botones de entrada y la carpeta de la página. Cuando exista el manifiesto de la meta-tribu, cambiar `fuentePrincipios` al adaptador nuevo.

## Revisión de arquitectura

Toca **permisos** (dentro de una decisión, de ejemplo) y **plata simulada** (monto pedido). No toca la base, ni integraciones, ni datos personales nuevos (personas de ejemplo; la persona del navegador es "vos"). Las IA son guionadas y no salen a la red.

**Veredicto del arquitecto (28-oct-2026, sobre la versión anterior):** ⚠️ aprobar con ajustes, ya incorporados (marcas `<!-- arquitecto -->`): nivel inicial desde el holón y no desde `tribuId`; el consejo arranca en `red`; huerta con `holonId: null`; D1 en el consejo; coherencia de plata; `nivel` simulado que en la base calcula el servidor. Decisión escrita en **ADR-022** (Propuesta). Para cuando haya base: el concern sin nombre guarda la autoría en un registro aparte que solo ve la facilitación, y la evaluación del proceso se muestra solo agregada.

**Pendiente: segunda revisión del arquitecto** con el id `fogon-propuestas`, por los cambios del 29-oct: la matriz cambió (A2 visita sin acceso, C4 quien presenta levanta concerns y bloquea; ADR-022 sigue valiendo porque la restricción de legitimidad se mantiene), se suma el Guardián de IA (puerto nuevo, simulado; cuando sea real entra por la skill `integracion-externa` con su decisión de privacidad) y se quita `origenHolonId`.

## Open Questions

- B3: ¿qué cuenta como "participar"? Este diseño cuenta a quien dejó cualquier registro de deliberación (pregunta, comentario, concern, sumarse, a un lado; no cuenta sugerir un mecanismo ni clasificar). Alternativa: pedir una respuesta explícita en el llamado al consenso.
- Decisión simple: ¿se adopta sola al vencer si nadie objetó (consentimiento por silencio)?
- C4: quien presenta ¿puede también **hacerse a un lado** de su propia propuesta? Este diseño dice que no (como el boceto); si cambió de opinión puede levantar un concern, editar o bloquear.
- C1: este diseño entiende "nombrar" como listar cada concern con su autora (con nombre por defecto) y "clasificar" como agruparlos por tema. ¿Es eso?
- D2: ¿quién puede sugerir un mecanismo? Este diseño usa los mismos permisos que comentar.
- <!-- arquitecto --> En una decisión del consejo, ¿quién es "del ámbito" mientras no haya representantes elegidos? Este diseño propone: nadie arranca ahí (nivel inicial `red`) y se simula con el selector.
- <!-- arquitecto --> Una propuesta urgente del consejo que vence sin consenso: ¿se pausa (lo que propone este diseño) o sube al común?
