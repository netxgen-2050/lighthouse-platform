# Design

## Context

- **En `dev`:** el Fogón (`app/fogon/fogon-cliente.tsx`, `lib/fogon/datos.ts`) con decisiones de ejemplo y sus parámetros opcionales (`plazo`, `acuerdo`, `monto`, con `ParametrosDecision`); la holarquía (`lib/gobernanza/`, `app/fogon/gobernanza/`) con la lente "Decisiones que suben" (`caminos.ts`, `panel-decisiones.tsx`), roles de ejemplo y propósitos por círculo; las consultas con voto cuadrático (`/fogon/consultas`, `lib/cuadratico/motor.ts`). Hifa (`asistente-hifa`) fija el patrón de IA guionada y honesta.
- **Referencia aprobada:** `NS_platform/Documentation/mockup/gobernanza-fractal-boceto.html`: `abrirPropuesta()`, `FASES`, `NIVELES`, `ACCIONES` (la matriz) y `PENDIENTES`. Es guía de comportamiento y datos; su código no se copia (usa `innerHTML` y colores sueltos). **La copia de `docs/referencia/gobernanza-fractal-boceto.html` es anterior y no tiene la matriz:** la fuente de verdad para implementar es la tabla de §2 de este design, que ya incluye los cambios de Gus.
- **Respuestas de Gus a los bloques A–F (29-oct-2026):** integradas en §1. Las que cambiaron respecto de lo propuesto: A2, C4, D2, E1 y F1; F2 va al backlog.
- **Respuestas de Gus a las seis preguntas abiertas (29-oct-2026, PR #132):** integradas en §1 (filas B3, B4, C1, C4, D2 y G1). Quien presenta no se hace a un lado; los concerns se **agrupan** (los temas quedan fuera); el mecanismo lo sugieren quienes pueden comentar y Hifa explica y sugiere; quórum con **acuse de conformidad**; la decisión simple se aprueba sola si nadie objetó y hubo quórum; el ámbito del consejo lo define el board de NetXGen (en el prototipo, el super admin en su nombre).
- **Segunda tanda de respuestas de Gus (29-oct-2026, PR #132):** integradas en §1 (filas B3, B5, C1, D1, D4 y G1) y en §3b, §4b y §4c. Participar = escribir en la discusión o firmar el acuse (confirmado); las afectadas también firman el acuse; la autora puede sacar su concern de un grupo; una propuesta **urgente y reversible** que vence sin consenso se aplica como **medida provisoria** con revisión obligatoria (opción C de Gus); cómo se valida la urgencia (**D4, propuesta de Claude a confirmar por Gus**); el super admin puede incluirse en el ámbito del consejo, con registro de quién lo hizo; los cambios del ámbito viven en el navegador; los acuses de una versión anterior **no** cuentan y se vuelven a firmar.
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
| **B3** (confirmado 29-oct) | **Quórum** para cerrar por consenso (y para que una simple se adopte al vencer): `min(n, max(ceil(n/2), 3))` personas del ámbito o afectadas que **participaron**. Participar = escribir en la discusión (pregunta, respuesta, comentario, concern, sumarse, resolución, a un lado, bloqueo) **o firmar el acuse de conformidad** de la versión vigente ("Entiendo la propuesta y no tengo ningún concern"). Abrir la propuesta sin hacer nada no cuenta; tampoco agrupar, sugerir un mecanismo, respaldar una urgencia ni evaluar (no son escribir en la discusión). Cada persona cuenta una vez | `minimoParticipacion(n)`, `REGISTROS_QUE_CUENTAN`, §4b |
| **B5** (29-oct) | **Acuse de conformidad:** lo firman las personas **del ámbito y las afectadas**. Vale para **una versión**: si la propuesta pasa a una versión nueva, los acuses anteriores **no cuentan** para el quórum y hay que volver a firmar | `acusar-conformidad`, §4b |
| **B4** (29-oct) | Decisión simple: se aprueba sola al vencer el plazo **si nadie objetó (ni concern abierto ni bloqueo) y se alcanzó el quórum**. Sin objeciones pero sin quórum → pausada ("no se alcanzó la participación mínima") | `alVencer()` |
| **C1** (cambió 29-oct) | Concerns con nombre; sin nombre solo si la propuesta tiene `tema: "cuidado-conflicto"`, y se muestra "Sin nombre (con facilitación)". **Los concerns se nombran y se pueden agrupar**: varios concerns de distintas personas terminan en uno solo, con nombre corto, y quedan registradas todas las autoras dentro del grupo. Se agrupa durante la fase de concerns (y en el plazo para objetar de la simple). **Sacar un concern de un grupo** lo puede hacer quien facilita **o la autora de ese concern** (solo el suyo, en cualquier fase antes del cierre; decidido por Gus el 29-oct); queda registrado quién lo sacó. **Clasificar por tema queda fuera** (Gus: opcional, no necesaria) | `REGLAS.concernSinNombre`, `FASES_DE_AGRUPACION`, `sacar-propio-del-grupo` |
| **C2** | Bloquear exige razón y un principio de la lista del Lighthouse (regeneración y vida en el centro; borrador a ratificar por el común), leída desde una costura que después apunta al manifiesto de la meta-tribu | `FuentePrincipios`, `validarBloqueo` (§5) |
| **C3** | La legitimidad de un bloqueo la decide el grupo del ámbito; quien facilita, Hifa y el Guardián solo preguntan o sugieren | matriz, fila "Decidir si un concern es legítimo" |
| **C4** (cambió) | **Quien presenta sí puede levantar concerns, sumarse y bloquear su propia propuesta** (puede cambiar de opinión al escuchar), pero **no puede hacerse a un lado** de su propia propuesta (confirmado por Gus el 29-oct). Sigue pudiendo editarla con historial | matriz, columna presenta; `RESTRICCIONES_DE_QUIEN_PRESENTA` |
| **D1** (cambió 29-oct, opción C de Gus) | Sin consenso al vencer: pausa y vuelve con cambios. **Si la urgencia está validada (D4) y la medida es reversible**, se aplica lo que apoya la mayoría **solo como medida provisoria**, con **fecha de revisión obligatoria** (por defecto 30 días después del vencimiento, configurable por holón); los concerns abiertos quedan registrados y obligan a revisar. **Nunca** para vender o comprometer tierra, ni para cambiar reglas o el manifiesto (esas propuestas no se pueden marcar urgentes). Urgente validada **sin** mayoría que la apoye: sube al nivel de arriba (círculo → tribu → consejo); en el común y en el consejo, pausa (interpretación de Claude, §4c). **Posibilidad futura de diseño (no se diseña):** el *lazy consensus* de Colony (https://docs.colony.io/learn/governance/), donde las personas ponen en juego Semillas para apoyar u objetar (backlog D35) | `alVencer()` |
| **D2** (cambió) | Voto cuadrático, puntos (*dot voting*), voto por convicción u otros mecanismos para repartir recursos, atención o prioridades **los pueden sugerir los mismos que pueden comentar** (confirmado por Gus el 29-oct) o la IA cuando la discusión lo amerita, en la propuesta o en una contrapropuesta. **Hifa facilita**: explica los mecanismos en palabras simples y sugiere cuál se alinea mejor con la decisión, con su porqué. **Nunca reemplazan al consenso** en las decisiones de reglas: sirven para priorizar y repartir. Acá se diseña el lugar donde se sugieren; no se construyen los mecanismos nuevos (el cuadrático ya existe) | `MECANISMOS`, §7 |
| **D3** | Reabrir solo con un nuevo consenso: una propuesta cerrada no se edita. **Única excepción:** una medida provisoria (D1) se reabre para su revisión obligatoria | `accionesDisponibles` con fase cierre, §4c |
| **D4** (29-oct, **propuesta de Claude, a confirmar por Gus**) | **Validar la urgencia:** quien presenta la marca "urgente" con tres datos obligatorios (qué se pierde si se espera, la fecha límite real y por qué la medida es reversible) y un criterio: riesgo para la vida (personas, animales, plantas, agua), daño irreversible si se espera, o plazo externo (clima, ley, contrato). La urgencia queda **validada** con **dos respaldos** de personas del ámbito distintas de quien presenta (una puede ser quien facilita). El Guardián sugiere si no parece urgente o no parece reversible. Cualquiera que pueda levantar un concern puede levantarlo **sobre la urgencia misma**; si el grupo del ámbito lo sostiene, la urgencia cae y la propuesta vuelve al recorrido normal. La página muestra **cuántas urgencias tuvo cada holón** (para ver abusos) | `REGLAS.urgencia`, `MATERIAS_SIN_URGENCIA`, §4c |
| **E1** (cambió) | La IA nunca decide ni declara ilegítimo nada, pero **sí puede y debe sugerir, antes de aprobar**, el posible impacto o la posible ilegitimidad de una decisión cuando ve una contradicción con los principios del Lighthouse o con una decisión anterior. La sugerencia queda visible; si ninguna persona la respalda como concern, la propuesta sigue su curso | puerto `Guardian` (§6b) |
| **F1** (cambió) | **El Guardián es un arquetipo o agente de IA, no un rol humano**: hace las sugerencias de E1 desde los principios de la vida y la tierra. En el prototipo, guionado y marcado "Guardián (IA, simulado)". Aparece en todas las propuestas, no solo en círculos de tierra o agua | puerto `Guardian` (§6b) |
| **F2** | Sin delegación de voz. Queda para el backlog | no se construye |
| **F3** | Quien pide plata no participa en decidir la legitimidad de los concerns sobre su pedido (quien presenta nunca decide legitimidad) | `RESTRICCIONES_DE_QUIEN_PRESENTA` |
| **F4** | Evaluación breve y opcional al cerrar: "¿Te sentiste escuchada?" (sí, en parte, no) y "¿Qué cambiarías del proceso?" (texto libre, opcional) | `EVALUACION` |
| **G1** (29-oct) | En el consejo, mientras no haya representantes elegidos, **quién es "del ámbito" lo define el board de NetXGen**. En el prototipo, el super admin actúa en su nombre, marcado "(simulado)". **Puede incluirse a sí mismo** y queda registrado quién lo hizo; los cambios **viven en el navegador** por ahora (confirmado por Gus, 29-oct) | `REGLAS.ambitoConsejo = { defineQuien: "board-netxgen", enElPrototipo: "superadmin", puedeIncluirse: true }`, §3b |

Interpretaciones propias (en Open Questions): que un bloqueo no legítimo queda como concern; cómo se cuenta "lo que apoya la mayoría" en una urgencia y qué pasa sin mayoría o con un bloqueo legítimo (§4c); D4 entera, que Gus tiene que confirmar.

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
| Hacerse a un lado | no | no | no | sí | sí | sí | no `C4` |
| Bloquear citando un principio | no | no | no | sí | sí | solo-como-miembro | sí `C4` |
| Decidir si un concern es legítimo | no | no | no | por-consenso-del-grupo | participa-en-la-discusion | facilita-nunca-decide | no `F3` |
| Mandar a un círculo o pausar | no | no | no | con-acuerdo-del-grupo | no | lo-propone | no |
| Escribir el acta | no | no | no | no | no | rol-memoria | no |
| Recibir avisos | no | si-se-suscribe | si-se-suscribe | sí | sí | sí | sí |

- La fila "Hacer preguntas para aclarar" cubre también **responder** preguntas (el boceto tiene el tipo "respuesta" pero no la fila).
- La condición `resumen-si-comun` del boceto **desaparece** (A2).
- Condiciones que **se evalúan** con el contexto: `solo-comun` (sí si `ambito === "comun"`, si no "no"). El resto son **descriptivas**: la acción se ofrece con ◐ y la explicación en texto ("solo la forma, no el fondo").
- **Varios niveles:** unión (el mejor estado de cada nivel; `si` > `condicion` > `no`). Después se aplican `RESTRICCIONES_DE_QUIEN_PRESENTA = ["decidir-legitimidad", "hacerse-a-un-lado"]` (F3 y C4): si `presenta` está entre los niveles, esas acciones dan "no" aunque otro nivel las permita. `["ambito", "presenta"]` puede levantar concern, sumarse y bloquear (C4), y no puede decidir legitimidad ni hacerse a un lado.
- **Acciones de proceso** fuera de la matriz (no están en el boceto), en `ACCIONES_DE_PROCESO`, con el mismo tipo de celda; visita, siempre "no":
  - `declararse-afectada` (red y del común), `objetar-afectada` (del ámbito), `pedir-recorrido-importante` (del ámbito y afectada), `evaluar` (quien dejó un registro).
  - `agrupar-concerns` (C1): rol de proceso "sí"; el resto "no". Cubre agrupar, nombrar el grupo y sacar cualquier concern del grupo.
  - `sacar-propio-del-grupo` (C1, 29-oct): las mismas celdas que "Levantar un concern"; además `acciones.ts` exige que quien lo hace sea la autora del concern. Registro `agrupar` con `accion: "sacar"` y `quien` = la autora.
  - `sugerir-mecanismo` (D2): las mismas celdas que "Comentar en la discusión abierta".
  - `acusar-conformidad` (B3, B5): del ámbito y afectada "sí"; el resto "no". Por la unión, quien presenta y también es del ámbito puede firmarlo.
  - `marcar-urgente` (D4): quien presenta "sí"; el resto "no". No se ofrece si la propuesta tiene una `materia` de `MATERIAS_SIN_URGENCIA`.
  - `respaldar-urgencia` (D4): del ámbito "sí", rol de proceso `quien-facilita`; el resto "no". `respaldar-urgencia` entra en `RESTRICCIONES_DE_QUIEN_PRESENTA` (quien presenta no respalda su propia urgencia).
  - `objetar-urgencia` (D4): las mismas celdas que "Levantar un concern"; es un registro `concern` con `datos.sobre: "urgencia"`.
- `RESTRICCIONES_DE_QUIEN_PRESENTA = ["decidir-legitimidad", "hacerse-a-un-lado", "respaldar-urgencia"]`.
- **Definir el ámbito del consejo (G1)** no es una acción por nivel de implicación: depende del rol de **plataforma** `superadmin` de la sesión. Lo lee **el componente de cliente** con `useSesion()` (`sesion?.rol === "superadmin"`, igual que `components/sesion/solo-super-admin.tsx`) y se lo pasa como `puedeDefinirAmbitoConsejo: boolean` a lo que dibuja; mientras la sesión carga, `false`. `lib/fogon/propuestas/` no importa `lib/permisos/`, `lib/sesion/` ni `components/sesion/`. Excepción a ADR-022 escrita en ADR-024 (era ADR-023; el manifiesto ya en `dev` usa ese número).
  <!-- arquitecto: no se lee en `page.tsx`. La cookie del super admin real (`lh-sesion-admin`) tiene `path=/admin` (ADR-016): en `/fogon/propuestas/…` el servidor solo vería la cookie de prueba, y en producción el super admin nunca vería el control. Como el control solo escribe en su propio navegador, verificarlo en el servidor no protege nada hoy (ADR-015). -->

  - Respaldar una sugerencia del Guardián **no es una acción aparte**: es `levantar-concern` con `apuntaA` a la sugerencia, así que sigue sus permisos y sus fases.
- **Por fase** (`lib/fogon/propuestas/fases.ts`): `ACCIONES_POR_FASE: Record<Fase, readonly Accion[]>`. Leer y recibir avisos, siempre (para los niveles que pueden). Resumen:

| Fase | Acciones además de leer |
|---|---|
| Borrador | editar, pasar-fase |
| Presentación | preguntar (simple), acusar-conformidad, pasar-fase |
| Preguntas para aclarar | preguntar, acusar-conformidad, pasar-fase |
| Discusión abierta | comentar, proponer-resolucion, sugerir-mecanismo, acusar-conformidad, pasar-fase |
| Concerns: nombrar y agrupar | comentar, levantar-concern, sumarse-concern, agrupar-concerns, sugerir-mecanismo, acusar-conformidad, pasar-fase |
| Resolver concerns | comentar, proponer-resolucion, sugerir-mecanismo, editar, derivar-o-pausar, acusar-conformidad, pasar-fase |
| Llamado al consenso | hacerse-a-un-lado, bloquear, decidir-legitimidad, derivar-o-pausar, acusar-conformidad, pasar-fase (= cerrar) |
| Plazo para objetar (simple) | preguntar, comentar, levantar-concern, sumarse-concern, agrupar-concerns, sugerir-mecanismo, hacerse-a-un-lado, bloquear, decidir-legitimidad, pedir-recorrido-importante, acusar-conformidad, pasar-fase |
| Cierre | escribir-acta, evaluar |

  `declararse-afectada`, `objetar-afectada`, `sacar-propio-del-grupo` (si hay un grupo con un concern propio) y `objetar-urgencia` (si la propuesta está marcada urgente) en cualquier fase menos cierre. `marcar-urgente` en borrador, presentación, preguntas y objetar; `respaldar-urgencia` desde que se marca hasta antes del llamado al consenso (o hasta que vence el plazo para objetar).
- `accionesDisponibles(propuesta, estado, niveles) = acciones de la fase ∩ permitidas por nivel`. Es lo único que usa la pantalla.
- **No se mezcla con `lib/permisos/`** (puertas de la plataforma): son permisos **dentro de una decisión** y de ejemplo. Un comentario en los dos lugares lo aclara (ADR-022, que sigue vigente: quien presenta sigue sin decidir legitimidad).
- Alternativa descartada: reglas `if` en los componentes (no se pueden cambiar sin tocar pantallas ni testear celda por celda).

### 3. Nivel inicial y selector

- `nivelInicial(propuesta, { membresias, tribuLider })`: si el `holonId` de la propuesta es una tribu o un círculo de una tribu (la tribu sale de `caminoHasta(raiz, holonId)` en la holarquía, **no** de `Decision.tribuId`, que casi ninguna decisión tiene) y la persona es miembro aceptada o lidera esa tribu → `ambito`; si no → `red`. Se calcula **después de montar** (lee `localStorage` como `fogon-cliente.tsx`); en el servidor y antes de montar, `red`. Si falla la lectura, `red`.
  <!-- arquitecto: con `tribuId` ninguna de las cinco propuestas daba "ámbito"; se deriva del holón. -->
- **Consejo (G1):** el ámbito de una decisión del consejo son sus representantes, y en el prototipo ningún lugar tiene representante elegido (`representante: null`). Mientras tanto, **quién es del ámbito lo define el board de NetXGen** (§3b). El nivel inicial es `ambito` solo si "vos" está en esa lista; si no, `red`, aunque la persona sea de Valle Solar o Agua Clara (ser de la tribu que pide **no** te hace del ámbito que decide; F3). <!-- arquitecto -->
- **Del común:** en `regalia` (holón `comun`) toda persona con sesión arranca como `comun`.
- **Sin holón:** `holonId: null` (la huerta: "Círculo de Tierra" no existe en la holarquía de ejemplo) → `red`, plazos por defecto y D1 según `Decision.ambito`. <!-- arquitecto -->
- **La identidad es la de la sesión del navegador**, no una persona nueva: la persona del navegador es `"vos"` (como `VOS` en `lib/fogon/consultas/ejemplo.ts`; la holarquía usa `"yo"` y no se toca).
- Selector `<select>` con etiqueta "Mirá la propuesta como…" y los 7 niveles; el calculado lleva "(tu nivel)". Aviso: "Simulación: en el prototipo podés ver la propuesta desde cada nivel".
- Una declaración de afectada vigente (A1) suma `afectada` a los niveles de la persona en esa propuesta.
- **Visita (A2):** en cualquier propuesta, la página reemplaza todo el contenido (título, ficha, fases, discusión, resultado, tabla) por `VISTA_SIN_CUENTA`: "Para ver las propuestas del Fogón hay que abrir una cuenta" y un enlace a `/sumarte`. El selector sigue visible para volver a otro nivel. La ruta sigue pidiendo sesión, así que la visita real nunca llega a la página: esto solo muestra en el prototipo qué vería.

### 3b. Ámbito del consejo definido por el board (G1)

- Cada propuesta del consejo trae `ambitoConsejo: { personas: string[] }` de ejemplo (7 personas "(ejemplo)", marcado "definido por el board de NetXGen") y la página muestra la lista con el aviso "Mientras no haya representantes elegidos, quién es del ámbito lo define el board de NetXGen".
- Si `puedeDefinirAmbitoConsejo` (super admin de la sesión), aparece "Definir quién es del ámbito (en nombre del board de NetXGen)": casillas con las personas de ejemplo y "vos". Cada cambio es un registro `ambito-consejo` con `datos: { agrega | quita: personaId, enNombreDe: "board-netxgen" }` y `quien: "vos"`, `nivel` de plataforma `superadmin` anotado en `datos`. Se muestra "Definido por el super admin en nombre del board de NetXGen (simulado)".
- **Incluirse a sí mismo (confirmado por Gus, 29-oct):** el super admin puede agregarse ("vos"). El historial dice quién hizo cada cambio y, cuando `agrega === quien`, lo marca "se incluyó a sí mismo".
- `tamanoAmbito` de una propuesta del consejo **se deriva** de esa lista (no es un número fijo); `minimoParticipacion` se recalcula.
- **Lista vacía:** si el super admin quita a todas, el ámbito no está definido: `tamanoAmbito = 0` se trata como `null` ("sin dato"), no se puede cerrar por consenso y la página dice "El board de NetXGen todavía no definió quién es del ámbito". Nunca un quórum de 0. <!-- arquitecto -->
- **Solo se aplican si quien mira es super admin:** los registros `ambito-consejo` guardados en el navegador se aplican únicamente cuando `puedeDefinirAmbitoConsejo` es `true`; si no, se ignoran y se usa la lista de ejemplo. Así una persona que deja de ser super admin, o que escribe a mano en `localStorage`, no se agrega al ámbito. <!-- arquitecto -->
- **Lo ve solo el super admin:** como el resto de los registros (§4, clave con prefijo de persona), los cambios quedan en el navegador del super admin; el resto del equipo ve la lista de ejemplo. Es una simulación individual, no una lista compartida, y Gus confirmó que alcanza por ahora (29-oct). <!-- arquitecto -->
- Sin super admin, la lista se ve y el control no. En propuestas que no son del consejo no aparece nada de esto.
- Cuando haya base: lo registra el servidor con la identidad real del super admin (o del board) y nunca se acepta del navegador; cuando haya representantes elegidos, esta lista se reemplaza por ellos (ADR-024).

### 4. Modelo y registros (`lib/fogon/propuestas/tipos.ts`, `estado.ts`)

```ts
type Recorrido = "simple" | "importante";
type Fase = "borrador" | "presentacion" | "preguntas" | "discusion" | "concerns" | "resolver" | "llamado" | "objetar" | "cierre";
type Propuesta = {                       // datos de ejemplo, bilingües
  decisionId: string; recorrido: Recorrido;
  holonId: string | null /* nodo de la holarquía que decide; null si no existe en la de ejemplo */;
  presenta: { personaId: string; desde: Bi }; problema: Bi; propone: Bi;
  inicio: string /* AAAA-MM-DD, empieza la primera fase con plazo */;
  /* la urgencia no es un booleano: sale de registros `urgencia` (§4c) */
  materia?: "tierra" | "reglas" | "manifiesto" /* MATERIAS_SIN_URGENCIA: no se pueden marcar urgentes (D1) */;
  tema?: "cuidado-conflicto"; principios: PrincipioId[];
  tamanoAmbito: number | null /* en el consejo se ignora: sale de ambitoConsejo */;
  ambitoConsejo?: { personas: string[] } /* solo propuestas del consejo (G1) */;
  plata: { pide: false } | { pide: true } /* el monto y la fuente salen de Decision.monto */;
  personas: PersonaEjemplo[]; registros: Registro[] /* los de ejemplo, solo de personas */;
  guion: { hifa: GuionHifa; guardian: SugerenciaGuardian[] } /* lo que dicen las IA simuladas */;
};
type Registro = {                        // forma de constancia (ADR-012), solo agregar, siempre de una persona
  id: string; propuestaId: string; version: number; quien: string /* personaId */; nivel: NivelImplicacion;
  cuando: string /* ISO */; apuntaA?: string /* id de otro registro, de una sugerencia del Guardián o de Hifa */;
  tipo: "pregunta" | "respuesta" | "comentario" | "concern" | "sumarse" | "retiro" | "agrupar" | "resolucion"
      | "mecanismo" | "version" | "fase" | "recorrido" | "afectada" | "objecion-afectada" | "a-un-lado" | "bloqueo"
      | "legitimidad" | "acuse" | "ambito-consejo" | "urgencia" | "respaldo-urgencia" | "revision"
      | "cierre" | "acta" | "evaluacion";
  texto?: Bi | string; principio?: PrincipioId; sinNombre?: boolean;
  datos?: Record<string, string | number | boolean>;
  confirmadoPor?: string /* personaId que confirmó una propuesta de Hifa */; simulado: true;
};
function derivarEstado(p: Propuesta, extra: readonly Registro[], ahora: Date,
  opciones?: { aplicaAmbitoConsejo: boolean /* = puedeDefinirAmbitoConsejo; por defecto false (§3b) */ }): EstadoPropuesta; // arquitecto
// EstadoPropuesta = { fase; version; fases: { fase; desde; vence; hecha }[]; concerns: ConcernVista[];
//   grupos: { id; nombre; concerns: ConcernVista[]; autoras: string[] }[]; mecanismos: MecanismoVista[];
//   sugerenciasGuardian: SugerenciaVista[]; acuses: AcuseVista[];
//   participacion: { cuenta; acuses; minimo: number | null; falta: number | null };
//   ambitoConsejo: { personas; definidoPor: "board-netxgen" | "superadmin-en-nombre-del-board" } | null;
//   urgencia: UrgenciaVista | null /* §4c */;
//   resultado: Resultado | null /* incluye "provisoria" con revisarAntesDe y concernsQueObligan */; afectadas; historial }
```

- **La fase no se guarda: se deriva** del último registro `fase` (o `recorrido`), y `alVencer` se aplica con `ahora` (inyectado en los tests; en la página, `new Date()` después de montar). Así un cambio de plazos (B2) recalcula todo sin migrar nada.
- Estado del concern: el último registro que lo apunta (`agrupar` → agrupado, con el nombre del grupo; `resolucion` aceptada → resuelto; `retiro` → retirado; `a-un-lado`; `bloqueo`). Un bloqueo con `legitimidad: false` vuelve a verse como concern abierto con la marca "El grupo no lo consideró bloqueo".
- **Agrupar (C1):** un registro `agrupar` lleva `datos: { accion: "agrupar" | "renombrar" | "sacar", grupoId, nombre }` y `apuntaA` (el concern que entra o sale; en "agrupar" se registra uno por concern). Los grupos se derivan de esos registros. **Un grupo es un solo concern en la discusión**: muestra su nombre, **todas sus autoras** (las de los concerns agrupados y las que se sumaron, sin repetir) y adentro cada concern original con su razón, autora y principio, que nunca se reescriben. Un grupo que queda con un solo concern deja de mostrarse como grupo. El estado de un grupo es el de sus concerns (resuelto solo si todos lo están). `derivarEstado` rechaza (ignora y avisa en el historial) un `agrupar` fuera de `FASES_DE_AGRUPACION = ["concerns", "objetar"]`. No hay temas ni "Sin clasificar".
- **Mecanismo (D2):** un registro `mecanismo` lleva `datos: { mecanismo: "cuadratico" | "puntos" | "conviccion" | "otro", nombre?: string, fin: string }` y `apuntaA` (la resolución, si es en una contrapropuesta; sin `apuntaA`, es sobre la propuesta). No entra en la participación (B3) ni en el resultado.

### 4b. Acuse de conformidad y quórum (B3, B4)

- Registro `acuse`: `texto` fijo del diccionario ("Entiendo la propuesta y no tengo ningún concern"), `version` en la que se firmó, `quien`, `nivel`; misma forma de constancia que el resto (ADR-012), sin firmar ni publicar en cadena.
- Validaciones (`acciones.ts`): uno por persona y versión; no se puede con un concern abierto propio en esa versión; no en borrador ni después del cierre.
- **Quién firma (B5, 29-oct):** personas del ámbito y afectadas.
- Si después la persona levanta un concern, el acuse se ve "reemplazado por un concern" (se deriva; no se borra nada) y sigue contando en esa versión.
- `REGISTROS_QUE_CUENTAN = ["pregunta", "respuesta", "comentario", "concern", "sumarse", "resolucion", "a-un-lado", "bloqueo", "acuse"]`. `participacion.cuenta` = personas distintas, del ámbito o afectadas, con al menos uno de esos registros. `agrupar`, `mecanismo`, `fase`, `ambito-consejo`, `urgencia`, `respaldo-urgencia`, `revision` y `evaluacion` no cuentan; tampoco abrir la página.
- `minimoParticipacion(0)` → `null` (ámbito sin definir; ver §3b), nunca 0. <!-- arquitecto -->
- **Acuse de una versión anterior (decidido por Gus, 29-oct):** **no cuenta** para el quórum de la versión vigente. Se muestra "Sobre la versión N: hay que volver a firmar" y la persona puede firmar la versión nueva. Lo que se escribió en la discusión sí sigue contando (es discusión, no conformidad con un texto).
- `alVencer(simple)`: concern abierto o bloqueo → pausada; sin objeciones y `cuenta >= minimo` → adoptada ("nadie objetó en el plazo y hubo quórum"); sin objeciones y sin quórum, o `minimo === null` → pausada ("no se alcanzó la participación mínima").
- En la página: un bloque "Participación" con "N de M para el quórum (X firmaron el acuse)", el botón "Entiendo la propuesta y no tengo ningún concern" si la persona puede, y la lista de acuses con nombre y versión.
- **Respaldo de una sugerencia del Guardián (E1):** es un registro `concern` con `apuntaA` = id de la sugerencia, el principio de la sugerencia como valor por defecto y la razón escrita por la persona (obligatoria). La sugerencia pasa a "Respaldada por N personas".
- **Ids:** `crypto.randomUUID()` en el navegador para los registros nuevos; los de ejemplo, fijos. La persona del navegador es `"vos"` (ver §3), con su nivel simulado registrado en cada registro.
- **`nivel` en el registro es el nivel simulado**, una declaración del navegador. Cuando esto pase a la base, el nivel lo **calcula el servidor** (membresía, rol de proceso, declaración de afectada vigente) y nunca se acepta del pedido; el selector desaparece (ADR-022). <!-- arquitecto -->
- **Registros por persona:** la clave lleva el prefijo de la persona en sesión, así que otra persona en el mismo navegador ve solo los de ejemplo, no los registros de "vos". Es distinto del registro compartido de los pactos (ADR-018) y está bien para una simulación individual. <!-- arquitecto -->
- **Guardado:** clave nueva `fogonPropuestas: "lh-fogon-propuestas"` en `lib/demo/claves.ts` (con el prefijo de la persona, como las demás), un objeto `{ [propuestaId]: Registro[] }`. Lectura defensiva: si el JSON no se puede leer o un registro no tiene la forma, se descarta ese registro y se muestran los de ejemplo. Lo de ejemplo nunca se escribe en `localStorage`.
- Fechas con `timeZone: "UTC"` (como `ParametrosDecision`) para no correr un día.

### 4c. Urgencia y medida provisoria (D1 opción C de Gus; D4 propuesta de Claude, a confirmar)

Todos los valores en `REGLAS.urgencia = { respaldosMinimos: 2, maxRespaldosDeFacilitacion: 1, diasRevision: 30, criterios: ["vida", "irreversible", "plazo-externo"] }` y `MATERIAS_SIN_URGENCIA = ["tierra", "reglas", "manifiesto"]`. `diasRevision` se puede cambiar por holón en `PLAZOS_POR_HOLON`.

- **Marcar urgente:** registro `urgencia` de quien presenta con `datos: { pierde, fechaLimite /* AAAA-MM-DD */, porQueReversible, criterio }`. Los tres textos y el criterio son obligatorios (`validarUrgencia`); `fechaLimite` tiene que ser una fecha válida. Una propuesta con `materia` en `MATERIAS_SIN_URGENCIA` rechaza el registro con "Las propuestas sobre vender o comprometer tierra, o sobre cambiar reglas o el manifiesto, no pueden ser urgentes".
- **Estado (`UrgenciaVista`), derivado:** `pedida` (marcada, con menos de 2 respaldos; dice cuántos faltan) → `validada` (2 respaldos de personas distintas, del ámbito o rol de proceso, ninguna quien presenta, a lo sumo una con solo rol de proceso) → `caida` (un concern sobre la urgencia que el grupo del ámbito sostuvo con un registro `legitimidad` `true` que lo apunta). Una urgencia caída no vuelve; la propuesta sigue su recorrido normal y el historial lo dice.
- **Solo una urgencia `validada` cambia `alVencer`.** Una `pedida` al vencer se trata como no urgente.
- **Guardián (D4):** dos tipos nuevos de sugerencia, `posible-no-urgente` y `posible-no-reversible`, que citan el registro `urgencia` (sus datos) en vez de un principio. Mismas reglas de §6b: lenguaje de posibilidad, nunca frenan nada, se pueden respaldar con `objetar-urgencia`.
- **"Lo que apoya la mayoría" (interpretación de Claude):** entre las personas que participaron (B3) en la versión vigente, **apoyan** las que no tienen un concern abierto ni un bloqueo sobre esa versión (acuse, a un lado o solo escribir); **se oponen** las que sí. Hay mayoría si apoyan más de la mitad **y** se alcanzó el quórum. Lo que se aplica es la versión vigente de la propuesta (no una contrapropuesta suelta).
- **`alVencer` con urgencia validada:**
  - mayoría, quórum y ningún bloqueo legítimo → resultado `provisoria` con `revisarAntesDe = vencimiento + diasRevision` y `concernsQueObligan` = los concerns y bloqueos no legítimos abiertos. Texto: "Medida provisoria: se aplica por urgencia y se revisa antes del DD-MM".
  - bloqueo legítimo → no se aplica (interpretación de Claude: un bloqueo sostenido por el grupo pesa más que la urgencia) → igual que sin mayoría.
  - sin mayoría o sin quórum → sube al nivel de arriba (círculo → tribu → consejo); en el común y en el consejo, pausa.
- **Revisión obligatoria:** una medida provisoria muestra la fecha de revisión y la lista de concerns que la obligan. Al llegar la fecha (`ahora >= revisarAntesDe`) dice "Revisión vencida: hay que revisar esta medida". Quien facilita puede "Abrir la revisión": un registro `revision` que pasa la propuesta a una versión nueva en "Resolver concerns", con los concerns que obligaban todavía abiertos (excepción a D3). Si la revisión no llega a consenso al vencer, la medida provisoria **no** se renueva sola: queda pausada (interpretación de Claude).
- **Urgencias por holón:** `urgenciasPorHolon(propuestas, registros)` cuenta, por `holonId`, cuántas propuestas se marcaron urgentes, cuántas quedaron validadas y cuántas cayeron. La ficha muestra "Este holón tuvo N urgencias (M validadas, K cayeron)". Sin holón (`null`) → "sin dato".
- **Ejemplo:** `consejo-bomba` está marcada urgente por Lautaro (criterio `plazo-externo`: "Si se espera al verano, la huerta de Valle Solar se queda sin riego en enero"; fecha límite 2026-12-15; reversible: "la bomba se puede apagar y el riego vuelve a los turnos de hoy") con **un** respaldo de Mora: "pedida, falta 1 respaldo". El Guardián sugiere `posible-no-reversible` ("La plata del Fondo Común que se use para comprar la bomba podría no recuperarse si se apaga…"), sin respaldo.

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

- Puerto `Facilitador` con `resumir(p, estado)`, `sugerirAgrupaciones(estado)` (C1: qué concerns parecen decir lo mismo y un nombre para el grupo), `recordatorios(p, estado, ahora)` (incluye "Faltan N personas para el quórum; firmar el acuse cuenta"), `proponerSiguienteFase(estado)`, `explicarMecanismos()` y `sugerirMecanismo(p, estado)` (D2: el mecanismo y **por qué** se alinea con la decisión). Adaptador `facilitadorGuionado` que devuelve textos de ejemplo de la propuesta (`guion.hifa`), agrupaciones fijas de ejemplo y recordatorios armados con las reglas y los plazos.
- `explicarMecanismos()` devuelve, del diccionario, una explicación simple de cada mecanismo de `MECANISMOS` y para qué sirve; el panel la muestra en un `<details>` "¿Qué mecanismo conviene?", con la sugerencia de Hifa y la frase "Elegir o no un mecanismo lo deciden las personas".
- **Nada de lo que propone cambia el estado** hasta que una persona con nivel `proceso` (simulado) toca "Confirmar"; el registro (`fase` o `agrupar`) guarda `confirmadoPor`. Una sugerencia de mecanismo de Hifa se muestra como sugerencia y no necesita confirmación porque no cambia nada. El tipo del puerto no tiene métodos para cerrar, bloquear ni decidir legitimidad (test de tipos y de claves).
- Frente a un bloqueo pendiente, el recordatorio es una pregunta al grupo: "¿El grupo considera que este bloqueo se apoya en el principio citado?".
- En "Llamado al consenso" (y al acercarse el vencimiento del plazo para objetar), si hay sugerencias del Guardián sin respaldo, el recordatorio dice: "Hay N sugerencias del Guardián que nadie respaldó; siguen visibles y no frenan la propuesta".
- La IA real será otro adaptador en otro cambio (skill `integracion-externa`, nota 21 G5).

### 6b. Guardián, arquetipo de IA (`lib/fogon/propuestas/guardian.ts`)

```ts
type SugerenciaGuardian = {
  id: string; fase: Fase /* en qué fase aparece; siempre antes de "llamado" o dentro de "objetar" */;
  tipo: "posible-impacto" | "posible-ilegitimidad" /* por contradicción con un principio o una decisión previa */
      | "posible-no-urgente" | "posible-no-reversible" /* sobre la urgencia marcada (D4, §4c) */;
  principio?: PrincipioId; decisionPrevia?: string /* decisionId de una propuesta ya adoptada */;
  urgencia?: string /* id del registro `urgencia` que cita */;
  texto: Bi;
};
interface Guardian { sugerir(p: Propuesta, estado: EstadoPropuesta, previas: readonly DecisionPrevia[]): readonly SugerenciaGuardian[]; }
const guardianGuionado: Guardian;   // devuelve p.guion.guardian filtrado a las fases ya alcanzadas
```

- **Separado de Hifa a propósito** (como en el Principles Guardian de referencia): Hifa cuida el proceso; el Guardián habla desde los principios de la vida y la tierra. Si lo hiciera Hifa, la facilitación dejaría de parecer neutral.
- **Toda sugerencia cita algo**: un principio de `fuentePrincipios`, una decisión previa adoptada (`previas` se arma con las propuestas de ejemplo cuyo resultado es adoptada) o, en las de urgencia, el registro `urgencia` y el dato que discute. Sin cita, no se muestra (test).
- **"Antes de aprobar":** cada sugerencia guionada tiene una `fase` anterior a "llamado" (o "objetar" en la simple), así queda visible antes de que se pueda cerrar.
- **Lenguaje:** siempre como posibilidad ("podría", "posible", "¿contradice…?"). Test sobre todos los textos guionados es/en: ninguno contiene "es ilegítim", "no es legítim", "is illegitimate", "is not legitimate", ni afirma que la propuesta "queda bloqueada".
- **Nunca escribe registros**: no tiene métodos para cerrar, bloquear, pausar ni decidir legitimidad (test de tipos y de claves). Una sugerencia sin respaldo no entra en `alVencer`, ni en la participación, ni en el resultado (test).
- En la pantalla: cada sugerencia es una entrada de la discusión con el tipo "Sugerencia del Guardián (IA, simulado)", su cita, su estado ("Nadie la respaldó: no frena la propuesta" o "Respaldada por N personas") y, si la persona puede levantar un concern en esa fase, el botón "Respaldar como concern", que abre el formulario de concern con el principio ya elegido y la razón vacía (obligatoria).
- La IA real será otro adaptador, junto con el de Hifa.

### 7. Página (`app/fogon/propuestas/[id]/`)

- `page.tsx` (servidor): busca la propuesta por id de decisión; `notFound()` si no existe. Arma los datos en el idioma pedido y pasa todo a `propuesta-cliente.tsx`.
- `page.tsx` **no** lee la sesión: `propuesta-cliente.tsx` calcula `puedeDefinirAmbitoConsejo` con `useSesion()` (§2 y §3b). <!-- arquitecto: la cookie del super admin no llega fuera de `/admin` (ADR-016). -->
- Orden en el DOM: migas (Fogón › propuesta) → encabezado (ámbito y título) → fases (`<ol aria-label>` con `aria-current="step"` y texto "hecha / ahora / pendiente", más la fecha de vencimiento) → ficha (`<dl>`) → **urgencia** (si está marcada: los tres datos, el criterio, el estado "pedida / validada / cayó" en texto, los respaldos y las urgencias del holón; si es una medida provisoria, su fecha de revisión y los concerns que la obligan; §4c) → **ámbito del consejo** (solo propuestas del consejo, §3b) → **participación y acuses** (§4b) → **mecanismos sugeridos sobre la propuesta** → discusión (`<ol>` con un `<article>` por entrada; un grupo de concerns es un `<article>` con su nombre, sus autoras y una lista con cada concern original) → "Qué podés hacer" (selector y botones) → facilitación de Hifa → "Quién puede hacer qué" (`<details>` con la tabla) → historial de versiones.
- **Lugar para sugerir un mecanismo (D2):**
  - Debajo de la ficha, una sección "Mecanismos para priorizar o repartir" con las sugerencias sobre la propuesta y, si la persona puede `sugerir-mecanismo` en esta fase, el botón "Sugerir un mecanismo".
  - En cada entrada de tipo "propuesta de resolución" (contrapropuesta), las sugerencias que la apuntan y el mismo botón.
  - Formulario en línea: `<fieldset>` con `<legend>` "Mecanismo" y radios (Voto cuadrático, Puntos, Voto por convicción, Otro — con campo de nombre si es "Otro"), campo "¿Para qué?" (una línea, obligatorio) y una nota fija: "Sirve para priorizar o repartir; no reemplaza al consenso en las decisiones de reglas".
  - Cada sugerencia muestra quién la hizo ("Sugerido por Ramiro (ejemplo)" o "Sugerido por Hifa (IA, simulada)"), el mecanismo, el fin y la nota fija. Voto cuadrático: enlace "Ver cómo funciona en las consultas" a `/fogon/consultas`. Los demás: "Todavía no está en el prototipo".
- Formularios: cada acción abre un formulario en línea con `<label>`, el error en texto con `aria-describedby` y foco al primer campo; al registrar, el foco va a la nueva entrada y un `aria-live="polite"` lo anuncia.
- Agrupar (rol de proceso, en concerns u objetar): botón "Agrupar concerns" que abre un `<fieldset>` con una casilla por concern abierto (autora y primera línea de la razón), un campo "Nombre del grupo" (obligatorio) y "Agrupar" (pide al menos dos). En cada grupo: "Renombrar" y, en cada concern de adentro, "Sacar del grupo". Sin arrastrar y soltar (teclado primero).
- Tabla de permisos: `<table>` con `<caption>`, `<th scope="col">` y `<th scope="row">`; cada celda dice "Sí", "No" o la condición en texto; el ✓/—/◐ es `aria-hidden`.
- Tipos de la discusión con texto y borde de token del tema (`clay` no existe en el tema: el concern usa `rose`); la sugerencia del Guardián lleva su propia etiqueta en texto; nunca solo color.
- Botones de entrada: en `fogon-cliente.tsx` y en `panel-decisiones.tsx`, un `<Link>` "Abrir la propuesta" si `propuestaDe(decision.id)` existe.

### 8. Datos de ejemplo (`lib/fogon/propuestas/ejemplos.ts`)

Cinco propuestas, todas sobre decisiones que ya existen en `lib/fogon/datos.ts`, con personas de ejemplo marcadas "(ejemplo)":
- `consejo-bomba` — importante, en "Resolver concerns"; presenta Lautaro (Cuidado de la tierra · Valle Solar); pregunta de Mora, respuesta, comentario de Inés, concerns de Ramiro y Paz **agrupados** en "Uso compartido" (registro `agrupar` de la persona de facilitación de ejemplo), resolución de Gala (contrapropuesta: turnos de riego) con una sugerencia de Ramiro de usar **voto cuadrático** para "Repartir los días de riego entre los círculos". **Guardián:** sugerencia `posible-impacto` en la fase de concerns ("Bombear más en verano podría bajar la napa…"), principio `agua-viva`, **respaldada por Inés** con su propia razón (concern suelto, fuera del grupo). Ema, la guardiana humana de la versión anterior, **se quita** (F1 cambió). Ámbito del consejo: 7 personas de ejemplo definidas por el board (G1); "vos" no está. **Urgencia** marcada por Lautaro con un respaldo de Mora y la sugerencia `posible-no-reversible` del Guardián, sin respaldo (§4c).
- `regalia` — importante, en "Discusión abierta", del común, no pide plata; sin sugerencias del Guardián todavía.
- `siembra` — importante, cerrada por consenso; Paz se hizo a un lado; acta de Memoria. (El boceto la pone en Semilla Viva; en `dev` es de Valle Solar: manda `dev`.) Es la **decisión previa** que cita el Guardián en la cisterna.
- `cisterna-compartida` — importante, en "Preguntas para aclarar"; monto `null` → "sin dato" (el boceto decía USD 9.000; manda `dev`); `tema: "cuidado-conflicto"` (dos tribus quieren la misma ubicación), así se puede levantar un concern sin nombre cuando llegue a la fase de concerns. **Guardián:** sugerencia `posible-ilegitimidad` por posible contradicción con la decisión previa `siembra` ("Una de las ubicaciones podría usar la parcela que el Calendario de siembra de otoño reservó…"), **sin respaldo**. **Hifa** sugiere **puntos** para "priorizar entre las tres ubicaciones", con su porqué ("hay varias opciones parecidas y conviene ver cuáles prefiere más gente"). Ámbito del consejo: las mismas 7 personas de ejemplo.
- `huerta` — simple, en "Plazo para objetar" (Círculo de Tierra, tribu), sin plata, ámbito de 4 (quórum 3), **dos acuses de ejemplo** y ningún concern: con el acuse de "vos" llega al quórum. `holonId: null`: "Círculo de Tierra" no es una tribu de `lib/tribus/datos.ts` ni un nodo de la holarquía. <!-- arquitecto -->
- Holones: `consejo-bomba` → `consejo`; `regalia` → `comun`; `siembra` → `valle-0`; `cisterna-compartida` → `consejo`. El campo `origenHolonId` de la versión anterior **se quita**: solo servía para ubicar a la guardiana humana (F1 cambió). <!-- arquitecto -->
- **Plata coherente:** `plata.pide === true` si y solo si la decisión tiene `monto` (bomba y cisterna-compartida); el monto y la fuente nunca se copian en la propuesta. <!-- arquitecto -->
- Tamaños de ámbito de ejemplo: Valle Solar 12, consejo 7 (derivado de la lista del board), común 40, Círculo de Tierra 4. Fechas de inicio relativas a fines de octubre de 2026.

### 9. Términos ⚖ nuevos (`lib/legal/terminos.ts`, todos `borrador: true`, con `en`)

`concern`, `bloqueo`, `aunlado`, `afectada`, `acuseConformidad` (qué significa firmar "Entiendo la propuesta y no tengo ningún concern", que cuenta para el quórum y que vale para una versión), `quorum`, `urgencia` (qué hace falta para que una propuesta sea urgente y que nunca vale para tierra, reglas ni manifiesto), `medidaProvisoria` (se aplica por urgencia, se revisa antes de una fecha y los concerns obligan a revisarla), `principios` (lista borrador a ratificar por el común, que va a vivir en el manifiesto de la meta-tribu) y `guardianIA` ("Guardián: una IA simulada que sugiere posibles impactos desde los principios de la vida y la tierra; nunca decide"; distinto del `guardian` existente, que es la asociación). Textos nuevos: no vienen del mock-up.

## Risks / Trade-offs

- [Que se lea como reglamento] → aviso "Proceso de ejemplo: las reglas son de prueba para el prototipo" y ⚖ en cada término.
- [La simulación de niveles confunde con permisos reales] → selector rotulado como simulación; "tu nivel" solo marca el de partida.
- [Que la sugerencia del Guardián se lea como un veredicto o un veto] → lenguaje de posibilidad con test, etiqueta "IA, simulado", la frase "no frena la propuesta" cuando nadie la respalda, y nada de lo que dice entra en el resultado.
- [Que un mecanismo sugerido se lea como votación que decide] → nota fija "no reemplaza al consenso" en el formulario y en cada sugerencia; no hay botón de votar dentro de la propuesta.
- [Quien presenta bloquea su propia propuesta para frenarla a último momento] → el bloqueo sigue pidiendo razón y principio, y su legitimidad la decide el grupo; quien presenta no participa de esa decisión (F3). Además puede editar o retirar.
- [Concern sin nombre: en el navegador el registro guarda quién fue] → en el prototipo no sale de su navegador. Cuando pase a la base, el nombre tiene que quedar fuera del registro público (ver Revisión de arquitectura).
- [Que el acuse se lea como voto a favor o firma legal] → texto fijo "Entiendo la propuesta y no tengo ningún concern", ⚖ `acuseConformidad` en borrador, marca "(simulado)"; no cierra ni adopta nada por sí solo.
- [Agrupar borra matices de cada concern] → cada concern original se sigue viendo adentro con su razón y su autora; se puede sacar del grupo.
- [El super admin parece decidir por el consejo] → solo define quién es del ámbito, no decide la propuesta; todo cambio dice "en nombre del board de NetXGen (simulado)" y queda en el historial.
- [Que "urgente" se use para saltear el consenso] → tres datos obligatorios, dos respaldos ajenos a quien presenta, concern sobre la urgencia que la hace caer, sugerencia del Guardián, contador de urgencias por holón, nunca para tierra, reglas ni manifiesto, y lo que se aplica es provisorio con revisión obligatoria.
- [Que una medida provisoria se vuelva permanente sin revisar] → la fecha de revisión es obligatoria, "Revisión vencida" queda a la vista y una revisión sin consenso no renueva la medida.
- [Cuatro noches] → cortes con PR en borrador (tasks). La urgencia suma trabajo a la noche 3; si no entra, se corta en un PR aparte sin tocar el resto (ver tasks 6.6).
- [Plazos con el reloj del navegador] → `ahora` se inyecta; en los e2e se fija con `page.clock`.

## Migration Plan

Sin base. Clave nueva en el navegador; "Borrar todo" la borra. Para revertir: quitar los botones de entrada y la carpeta de la página. Cuando exista el manifiesto de la meta-tribu, cambiar `fuentePrincipios` al adaptador nuevo.

## Revisión de arquitectura

Toca **permisos** (dentro de una decisión, de ejemplo) y **plata simulada** (monto pedido). No toca la base, ni integraciones, ni datos personales nuevos (personas de ejemplo; la persona del navegador es "vos"). Las IA son guionadas y no salen a la red.

**Veredicto del arquitecto (28-oct-2026, sobre la versión anterior):** ⚠️ aprobar con ajustes, ya incorporados (marcas `<!-- arquitecto -->`): nivel inicial desde el holón y no desde `tribuId`; el consejo arranca en `red`; huerta con `holonId: null`; D1 en el consejo; coherencia de plata; `nivel` simulado que en la base calcula el servidor. Decisión escrita en **ADR-022** (Propuesta). Para cuando haya base: el concern sin nombre guarda la autoría en un registro aparte que solo ve la facilitación, y la evaluación del proceso se muestra solo agregada.

**Segunda revisión del arquitecto (29-oct-2026):** ⚠️ aprobar con ajustes, ya incorporados (marcas `<!-- arquitecto -->`): el control del ámbito del consejo se habilita en el cliente con `useSesion()` y no en `page.tsx` (la cookie del super admin solo viaja a `/admin`, ADR-016); los registros `ambito-consejo` solo se aplican si quien mira es super admin; un ámbito vacío es "sin dato" y nunca quórum 0; los acuses de versiones anteriores siguen contando (**Gus lo cambió después**: no cuentan y se vuelven a firmar). Que un rol de plataforma defina el ámbito es una excepción a ADR-022, escrita en **ADR-024** (Propuesta; era ADR-023 y se corrió porque el manifiesto ya en `dev` usa ese número).

**Tercera revisión pedida (29-oct-2026, con el id `fogon-propuestas`), pendiente:** por la segunda tanda de respuestas de Gus cambian permisos dentro de la decisión (acciones `sacar-propio-del-grupo`, `marcar-urgente`, `respaldar-urgencia`, `objetar-urgencia`; las afectadas firman el acuse; `respaldar-urgencia` entra en las restricciones de quien presenta) y el resultado de una decisión (medida provisoria con revisión obligatoria, que reabre una propuesta cerrada como excepción a D3). Sin tablas, sin integraciones, sin datos personales nuevos, plata simulada igual que antes. ADR-024 suma que el super admin puede incluirse y que queda registrado. Datos personales: sin datos reales nuevos; el texto libre de la evaluación (F4) y los concerns de temas de cuidado quedan solo en el navegador de cada persona; cuando haya base, la evaluación va agregada y sin texto asociado a la persona, y el concern sin nombre separa la autoría (ADR-022).

Antes (pedido de segunda revisión) con el id `fogon-propuestas`, por los cambios del 29-oct: la matriz cambió (A2 visita sin acceso, C4 quien presenta levanta concerns y bloquea; ADR-022 sigue valiendo porque la restricción de legitimidad se mantiene), se suma el Guardián de IA (puerto nuevo, simulado; cuando sea real entra por la skill `integracion-externa` con su decisión de privacidad) y se quita `origenHolonId`. Y por las respuestas del 29-oct a las preguntas abiertas: el **acuse de conformidad** (registro nuevo con forma de constancia), el **ámbito del consejo definido por el super admin** en nombre del board (lee el nivel `superadmin` de la sesión en `page.tsx`; toca permisos de plataforma solo para mostrar un control simulado), la agrupación de concerns (las autoras quedan registradas dentro del grupo) y que quien presenta no se hace a un lado.

## Open Questions

- **D4 entera (propuesta de Claude):** tres datos, dos respaldos (uno puede ser quien facilita), los tres criterios, el Guardián que sugiere, el concern sobre la urgencia que la hace caer y el contador por holón. ¿Gus la confirma?
- **"Lo que apoya la mayoría" (§4c, interpretación de Claude):** mayoría de quienes participaron en la versión vigente, sin concern abierto ni bloqueo, y con quórum; se aplica la versión vigente, no una contrapropuesta. ¿Está bien?
- **Urgente sin mayoría o con un bloqueo legítimo (§4c, interpretación de Claude):** no se aplica la medida provisoria y sube al nivel de arriba (en el común y en el consejo, pausa). ¿O un bloqueo legítimo no frena una medida provisoria?
- **Revisión sin consenso (§4c, interpretación de Claude):** la medida provisoria no se renueva sola y queda pausada. ¿O sigue vigente hasta que haya consenso?
