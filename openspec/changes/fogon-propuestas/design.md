# Design

## Context

- **En `dev`:** el Fogón (`app/fogon/fogon-cliente.tsx`, `lib/fogon/datos.ts`) con decisiones de ejemplo y sus parámetros opcionales (`plazo`, `acuerdo`, `monto`, con `ParametrosDecision`); la holarquía (`lib/gobernanza/`, `app/fogon/gobernanza/`) con la lente "Decisiones que suben" (`caminos.ts`, `panel-decisiones.tsx`), roles de ejemplo y propósitos por círculo. Hifa (`asistente-hifa`) fija el patrón de IA guionada y honesta.
- **Referencia aprobada:** `NS_platform/Documentation/mockup/gobernanza-fractal-boceto.html` (copia en `docs/referencia/gobernanza-fractal-boceto.html`): `abrirPropuesta()`, `FASES`, `NIVELES`, `ACCIONES` (la matriz) y `PENDIENTES`. Es guía de comportamiento y datos; su código no se copia (usa `innerHTML` y colores sueltos).
- **Antecedente reemplazado:** `fogon-consenso-formal` (no aprobado). Se reusan ideas, no código (nunca se implementó).
- **Principios:** `NS_Tokenomics` 17 (constitución borrador, derechos de la tierra, OASA) y 02/28 (Juego B, juego infinito). Las fuentes de Formal Consensus y TDF (`Formal_Consensus_bot/docs/02-Formal-Consensus/`, `communities/tdf/principles.md`) **no se pudieron leer** en esta sesión (fuera de las carpetas permitidas); la lista de principios hay que completarla con TDF antes de ratificarla.
- `/fogon` pide sesión (nivel Miembro, `lib/permisos/niveles.ts`). `lib/permisos/` son las puertas de la plataforma; este cambio **no** las toca.

## Goals / Non-Goals

**Goals:**
- Un modelo puro y testeable (`lib/fogon/propuestas/`) del que salen la ficha, las fases, la discusión y las acciones.
- Todas las reglas A–F en **un solo módulo de reglas** y la matriz en **un solo módulo de permisos**: cambiar un valor no toca pantallas.
- El estado se **deriva** de registros de solo agregar (como ADR-001 y ADR-012).

**Non-Goals:**
- Base, IA real, avisos reales, constancias en cadena, rutas públicas, crear propuestas, voto cuadrático dentro de la propuesta, delegación.

## Decisions

### 1. Valores de gobernanza (todos: **propuesta, a confirmar por Gus**)

Viven en `lib/fogon/propuestas/reglas.ts` como constantes con nombre y comentario con su letra. Un test por regla.

| Letra | Valor que usa el prototipo | Dónde vive |
|---|---|---|
| **A1** (propuesta, a confirmar por Gus) | "Afectada" se declara sola con un motivo de una línea (máx. 140 caracteres); el grupo del ámbito puede objetarla y la persona vuelve a su nivel anterior | `REGLAS.afectada = { motivoMax: 140, objetaQuien: "ambito" }` |
| **A2** (propuesta, a confirmar por Gus) | Sin sesión (visita): solo título y resultado, y solo de las decisiones del común | matriz, fila "Leer la propuesta", columna visita |
| **A3** (propuesta, a confirmar por Gus) | Siete niveles: visita, red, del común, del ámbito, afectada, rol de proceso, quien presenta | `NIVELES_IMPLICACION` |
| **B1** (propuesta, a confirmar por Gus) | Dos recorridos: simple (presentación, 3 días para objetar, cierre) e importante (8 fases); quien facilita elige; el grupo (del ámbito o afectada) puede pedir el importante | `RECORRIDOS` |
| **B2** (propuesta, a confirmar por Gus) | 7 días por defecto: 2 preguntas, 3 discusión y concerns, 2 resolver; configurable por holón (`PLAZOS_POR_HOLON`, id de nodo de la holarquía → días por fase) | `PLAZOS_POR_DEFECTO` |
| **B3** (propuesta, a confirmar por Gus) | Mínimo para cerrar por consenso: `min(n, max(ceil(n/2), 3))` personas del ámbito o afectadas que dejaron algún registro | `minimoParticipacion(n)` |
| **C1** (propuesta, a confirmar por Gus) | Concerns con nombre; sin nombre solo si la propuesta tiene `tema: "cuidado-conflicto"`, y se muestra "Sin nombre (con facilitación)" | `REGLAS.concernSinNombre` |
| **C2** (propuesta, a confirmar por Gus) | Bloquear exige razón y un principio de `PRINCIPIOS` (borrador a ratificar por el común) | `PRINCIPIOS`, `validarBloqueo` |
| **C3** (propuesta, a confirmar por Gus) | La legitimidad de un bloqueo la decide el grupo del ámbito; quien facilita y Hifa solo preguntan | matriz, fila "Decidir si un concern es legítimo" |
| **C4** (propuesta, a confirmar por Gus) | Quien presenta no levanta concerns, no se suma, no bloquea, no se hace a un lado; edita con historial | `RESTRICCIONES_DE_QUIEN_PRESENTA` |
| **D1** (propuesta, a confirmar por Gus) | Sin consenso al vencer: pausa y vuelve con cambios; si es urgente sube al nivel de arriba (círculo → tribu → consejo); en el común, pausa | `alVencer()` |
| **D2** (propuesta, a confirmar por Gus) | Voto cuadrático solo como señal, nunca decide. **No se construye acá** | comentario en `reglas.ts` |
| **D3** (propuesta, a confirmar por Gus) | Reabrir solo con un nuevo consenso: una propuesta cerrada no se edita | `accionesDisponibles` con fase cierre |
| **E1** (propuesta, a confirmar por Gus) | Hifa resume, sugiere grupos de concerns, recuerda reglas y plazos y propone pasar de fase; una persona de proceso confirma; nunca decide, cierra ni juzga un bloqueo | puerto `Facilitador` (§6) |
| **F1** (propuesta, a confirmar por Gus) | Guardián de la tierra en propuestas de círculos con propósito tierra o agua: su concern es de principio (por defecto "Derechos de la tierra") | `esConcernDePrincipio` |
| **F2** (propuesta, a confirmar por Gus) | Sin delegación de voz | no se construye |
| **F3** (propuesta, a confirmar por Gus) | Quien pide plata no participa en decidir la legitimidad de los concerns sobre su pedido (lo cubre C4: quien presenta nunca decide legitimidad) | `RESTRICCIONES_DE_QUIEN_PRESENTA` |
| **F4** (propuesta, a confirmar por Gus) | Evaluación breve y opcional al cerrar: "¿Te sentiste escuchada?" (sí, en parte, no) y "¿Qué cambiarías del proceso?" (texto libre, opcional) | `EVALUACION` |

Interpretaciones propias (marcadas para que Gus las mire, ver Open Questions): qué cuenta como "participar" para B3; que la decisión simple sin concerns abiertos se adopta al vencer (consentimiento por silencio); que un bloqueo no legítimo queda como concern.

### 2. Matriz de permisos (`lib/fogon/propuestas/permisos.ts`)

```ts
type NivelImplicacion = "visita" | "red" | "comun" | "ambito" | "afectada" | "proceso" | "presenta";
type Accion =
  | "leer-propuesta" | "leer-discusion" | "preguntar" | "comentar" | "levantar-concern" | "sumarse-concern"
  | "proponer-resolucion" | "editar" | "pasar-fase" | "hacerse-a-un-lado" | "bloquear" | "decidir-legitimidad"
  | "derivar-o-pausar" | "escribir-acta" | "recibir-avisos";
type Condicion = "solo-comun" | "solo-forma" | "quien-facilita" | "solo-como-miembro" | "por-consenso-del-grupo"
  | "participa-en-la-discusion" | "facilita-nunca-decide" | "con-acuerdo-del-grupo" | "lo-propone" | "rol-memoria"
  | "si-se-suscribe" | "resumen-si-comun";
type Celda = "si" | "no" | { condicion: Condicion };      // el texto de cada condición sale del diccionario
const MATRIZ: Readonly<Record<Accion, Readonly<Record<NivelImplicacion, Celda>>>>;
function permiso(accion, niveles: readonly NivelImplicacion[], ctx: { ambito: Ambito }): Resultado;
// Resultado = { estado: "si" | "no" | "condicion"; condiciones: Condicion[] }
```

- **Transcripción exacta** de `ACCIONES` del boceto (15 filas × 7 columnas). La fila "Hacer preguntas para aclarar" cubre también **responder** preguntas (el boceto tiene el tipo "respuesta" pero no la fila).
- Condiciones que **se evalúan** con el contexto: `solo-comun` y `resumen-si-comun` (sí si `ambito === "comun"`, si no "no"). El resto son **descriptivas**: la acción se ofrece con ◐ y la explicación en texto ("solo la forma, no el fondo").
- **Varios niveles:** unión (el mejor estado de cada nivel; `si` > `condicion` > `no`). Después se aplican `RESTRICCIONES_DE_QUIEN_PRESENTA` (C4, F3): si `presenta` está entre los niveles, `levantar-concern`, `sumarse-concern`, `hacerse-a-un-lado`, `bloquear` y `decidir-legitimidad` dan "no".
- **Acciones de proceso** fuera de la matriz (no están en el boceto pero las piden A1 y B1): `declararse-afectada` (red y del común), `objetar-afectada` (del ámbito), `pedir-recorrido-importante` (del ámbito y afectada), `evaluar` (quien dejó un registro). Viven en el mismo archivo, en `ACCIONES_DE_PROCESO`, con el mismo tipo de celda.
- **Por fase** (`lib/fogon/propuestas/fases.ts`): `ACCIONES_POR_FASE: Record<Fase, readonly Accion[]>`. Leer y recibir avisos, siempre. Resumen:

| Fase | Acciones además de leer |
|---|---|
| Borrador | editar, pasar-fase |
| Presentación | preguntar (simple), pasar-fase |
| Preguntas para aclarar | preguntar, pasar-fase |
| Discusión abierta | comentar, proponer-resolucion, pasar-fase |
| Concerns: listar y agrupar | comentar, levantar-concern, sumarse-concern, pasar-fase |
| Resolver concerns | comentar, proponer-resolucion, editar, derivar-o-pausar, pasar-fase |
| Llamado al consenso | hacerse-a-un-lado, bloquear, decidir-legitimidad, derivar-o-pausar, pasar-fase (= cerrar) |
| Plazo para objetar (simple) | preguntar, comentar, levantar-concern, sumarse-concern, hacerse-a-un-lado, bloquear, decidir-legitimidad, pedir-recorrido-importante, pasar-fase |
| Cierre | escribir-acta, evaluar |

  `declararse-afectada` y `objetar-afectada` en cualquier fase menos cierre.
- `accionesDisponibles(propuesta, estado, niveles) = acciones de la fase ∩ permitidas por nivel`. Es lo único que usa la pantalla.
- **No se mezcla con `lib/permisos/`** (puertas de la plataforma): son permisos **dentro de una decisión** y de ejemplo. Un comentario en los dos lugares lo aclara.
- Alternativa descartada: reglas `if` en los componentes (no se pueden cambiar sin tocar pantallas ni testear celda por celda).

### 3. Nivel inicial y selector

- `nivelInicial(propuesta, { membresias, tribuLider })`: si la propuesta es de una tribu o de un círculo de una tribu (`tribuId`) y la persona es miembro aceptada o lidera esa tribu → `ambito`; si no → `red`. Se calcula **después de montar** (lee `localStorage` como `fogon-cliente.tsx`); en el servidor y antes de montar, `red`. Si falla la lectura, `red`.
- Selector `<select>` con etiqueta "Mirá la propuesta como…" y los 7 niveles; el calculado lleva "(tu nivel)". Aviso: "Simulación: en el prototipo podés ver la propuesta desde cada nivel".
- Una declaración de afectada vigente (A1) suma `afectada` a los niveles de la persona en esa propuesta.
- **Visita (A2):** decisión del común → título y resultado (o "En curso" si no cerró); otra → "Esta propuesta se ve con sesión", sin título ni contenido. La ruta sigue pidiendo sesión (fuera de alcance).

### 4. Modelo y registros (`lib/fogon/propuestas/tipos.ts`, `estado.ts`)

```ts
type Recorrido = "simple" | "importante";
type Fase = "borrador" | "presentacion" | "preguntas" | "discusion" | "concerns" | "resolver" | "llamado" | "objetar" | "cierre";
type Propuesta = {                       // datos de ejemplo, bilingües
  decisionId: string; recorrido: Recorrido; holonId: string /* nodo de la holarquía */;
  presenta: { personaId: string; desde: Bi }; problema: Bi; propone: Bi;
  inicio: string /* AAAA-MM-DD, empieza la primera fase con plazo */; urgente: boolean;
  tema?: "cuidado-conflicto"; principios: PrincipioId[]; tamanoAmbito: number | null;
  plata: { pide: false } | { pide: true } /* el monto y la fuente salen de Decision.monto */;
  guardianes?: string[] /* personaId */; personas: PersonaEjemplo[]; registros: Registro[] /* los de ejemplo */;
  resumenHifa: Partial<Record<Fase, Bi>>;
};
type Registro = {                        // forma de constancia (ADR-012), solo agregar
  id: string; propuestaId: string; version: number; quien: string /* personaId */; nivel: NivelImplicacion;
  cuando: string /* ISO */; apuntaA?: string /* id de otro registro */;
  tipo: "pregunta" | "respuesta" | "comentario" | "concern" | "sumarse" | "retiro" | "agrupar" | "resolucion"
      | "version" | "fase" | "recorrido" | "afectada" | "objecion-afectada" | "a-un-lado" | "bloqueo"
      | "legitimidad" | "cierre" | "acta" | "evaluacion";
  texto?: Bi | string; principio?: PrincipioId; sinNombre?: boolean; datos?: Record<string, string | number | boolean>;
  confirmadoPor?: string /* personaId que confirmó una propuesta de Hifa */; simulado: true;
};
function derivarEstado(p: Propuesta, extra: readonly Registro[], ahora: Date): EstadoPropuesta;
// EstadoPropuesta = { fase; version; fases: { fase; desde; vence; hecha }[]; concerns: ConcernVista[];
//   participacion: { cuenta; minimo: number | null }; resultado: Resultado | null; afectadas; historial }
```

- **La fase no se guarda: se deriva** del último registro `fase` (o `recorrido`), y `alVencer` se aplica con `ahora` (inyectado en los tests; en la página, `new Date()` después de montar). Así un cambio de plazos (B2) recalcula todo sin migrar nada.
- Estado del concern: el último registro que lo apunta (`agrupar` → agrupado; `resolucion` aceptada → resuelto; `retiro` → retirado; `a-un-lado`; `bloqueo`). Un bloqueo con `legitimidad: false` vuelve a verse como concern abierto con la marca "El grupo no lo consideró bloqueo".
- **Ids:** `crypto.randomUUID()` en el navegador para los registros nuevos; los de ejemplo, fijos. La persona del navegador es `"vos"` (como en la holarquía), con su nivel simulado registrado en cada registro.
- **Guardado:** clave nueva `fogonPropuestas: "lh-fogon-propuestas"` en `lib/demo/claves.ts` (con el prefijo de la persona, como las demás), un objeto `{ [propuestaId]: Registro[] }`. Lectura defensiva: si el JSON no se puede leer o un registro no tiene la forma, se descarta ese registro y se muestran los de ejemplo. Lo de ejemplo nunca se escribe en `localStorage`.
- Fechas con `timeZone: "UTC"` (como `ParametrosDecision`) para no correr un día.

### 5. Principios (`lib/fogon/propuestas/principios.ts`)

Lista inicial, **borrador a ratificar por el común**, cada uno con id, nombre y explicación es/en y su fuente:

| id | Principio | Fuente |
|---|---|---|
| `tierra-no-mercancia` | La tierra no es mercancía | Constitución borrador art. 1 (`NS_Tokenomics` 17) |
| `derechos-tierra` | Derechos de la tierra (existir, regenerarse, sin contaminación) | art. 2, Declaración de Cochabamba |
| `agua` | Agua: capturar y cuidar el agua | art. 2e; boceto |
| `suelo-vida` | Suelo y biodiversidad no se pierden | art. 2c y 2g |
| `mas-estricto` | Más estricto sí, más laxo nunca | art. 4 (OASA) |
| `subsidiariedad` | Se decide en el círculo más chico que pueda | art. 5 |
| `voz-afectada` | Tiene voz quien está afectada | boceto ("Comunidad") |
| `energia-renovable` | Energía renovable primero | boceto ("Recursos") |
| `plata-del-comun` | La plata del común vuelve a la tierra | art. 10 |
| `generaciones-futuras` | Generaciones futuras: jugar el juego infinito | Juego B (`NS_Tokenomics` 02 y 28) |
| `personas-deciden` | Las máquinas informan; las personas deciden | art. 12 |

Un ⚖ `principios` (borrador) explica que la lista es un punto de partida y que el común la tiene que ratificar. Falta sumar los de TDF (ver Context).

### 6. Hifa facilitadora (`lib/fogon/propuestas/facilitacion.ts`)

- Puerto `Facilitador` con `resumir(p, estado)`, `sugerirGrupos(estado)`, `recordatorios(p, estado, ahora)` y `proponerSiguienteFase(estado)`. Adaptador `facilitadorGuionado` que devuelve textos de ejemplo de la propuesta (`resumenHifa`), grupos fijos de ejemplo y recordatorios armados con las reglas y los plazos.
- **Nada de lo que propone cambia el estado** hasta que una persona con nivel `proceso` (simulado) toca "Confirmar"; el registro guarda `confirmadoPor`. El tipo del puerto no tiene métodos para cerrar, bloquear ni decidir legitimidad (test de tipos y de claves).
- Frente a un bloqueo pendiente, el recordatorio es una pregunta al grupo: "¿El grupo considera que este bloqueo se apoya en el principio citado?".
- La IA real será otro adaptador en otro cambio (skill `integracion-externa`, nota 21 G5).

### 7. Página (`app/fogon/propuestas/[id]/`)

- `page.tsx` (servidor): busca la propuesta por id de decisión; `notFound()` si no existe. Arma los datos en el idioma pedido y pasa todo a `propuesta-cliente.tsx`.
- Orden en el DOM: migas (Fogón › propuesta) → encabezado (ámbito y título) → fases (`<ol aria-label>` con `aria-current="step"` y texto "hecha / ahora / pendiente", más la fecha de vencimiento) → ficha (`<dl>`) → discusión (`<ol>` con un `<article>` por entrada) → "Qué podés hacer" (selector y botones) → facilitación de Hifa → "Quién puede hacer qué" (`<details>` con la tabla) → historial de versiones.
- Formularios: cada acción abre un formulario en línea con `<label>`, el error en texto con `aria-describedby` y foco al primer campo; al registrar, el foco va a la nueva entrada y un `aria-live="polite"` lo anuncia.
- Tabla de permisos: `<table>` con `<caption>`, `<th scope="col">` y `<th scope="row">`; cada celda dice "Sí", "No" o la condición en texto; el ✓/—/◐ es `aria-hidden`.
- Tipos de la discusión con texto y borde de token del tema (`clay` no existe en el tema: el concern usa `rose`); nunca solo color.
- Botones de entrada: en `fogon-cliente.tsx` y en `panel-decisiones.tsx`, un `<Link>` "Abrir la propuesta" si `propuestaDe(decision.id)` existe.

### 8. Datos de ejemplo (`lib/fogon/propuestas/ejemplos.ts`)

Cinco propuestas, todas sobre decisiones que ya existen en `lib/fogon/datos.ts`, con personas de ejemplo marcadas "(ejemplo)":
- `consejo-bomba` — importante, en "Resolver concerns"; presenta Lautaro (Cuidado de la tierra · Valle Solar); pregunta de Mora, respuesta, comentario de Inés, concerns de Ramiro y Paz agrupados en "Uso compartido", resolución de Gala; y un concern de Ema, guardiana de la tierra de Cuidado de la tierra (propósito tierra), registrado como de principio ("Derechos de la tierra"). Ema es una persona de ejemplo nueva, solo de la propuesta (no se suma a la holarquía).
- `regalia` — importante, en "Discusión abierta", del común, no pide plata.
- `siembra` — importante, cerrada por consenso; Paz se hizo a un lado; acta de Memoria. (El boceto la pone en Semilla Viva; en `dev` es de Valle Solar: manda `dev`.)
- `cisterna-compartida` — importante, en "Preguntas para aclarar"; monto `null` → "sin dato" (el boceto decía USD 9.000; manda `dev`); `tema: "cuidado-conflicto"` (dos tribus quieren la misma ubicación), así se puede levantar un concern sin nombre cuando llegue a la fase de concerns.
- `huerta` — simple, en "Plazo para objetar" (Círculo de Tierra, tribu), sin plata.
- Tamaños de ámbito de ejemplo: Valle Solar 12, consejo 7, común 40, Círculo de Tierra 4. Fechas de inicio relativas a fines de octubre de 2026.

### 9. Términos ⚖ nuevos (`lib/legal/terminos.ts`, todos `borrador: true`, con `en`)

`concern`, `bloqueo`, `aunlado`, `afectada`, `principios`, `guardiantierra` (distinto del `guardian` existente, que es la asociación). Textos nuevos: no vienen del mock-up.

## Risks / Trade-offs

- [Que se lea como reglamento] → aviso "Proceso de ejemplo: las reglas son una propuesta, no están aprobadas" y ⚖ en cada término.
- [La simulación de niveles confunde con permisos reales] → selector rotulado como simulación; "tu nivel" solo marca el de partida.
- [Concern sin nombre: en el navegador el registro guarda quién fue] → en el prototipo no sale de su navegador. Cuando pase a la base, el nombre tiene que quedar fuera del registro público (pendiente para el cambio de base; ver Revisión de arquitectura).
- [Tres noches] → cortes con PR en borrador (tasks).
- [Plazos con el reloj del navegador] → `ahora` se inyecta; en los e2e se fija con `page.clock`.

## Migration Plan

Sin base. Clave nueva en el navegador; "Borrar todo" la borra. Para revertir: quitar los botones de entrada y la carpeta de la página.

## Revisión de arquitectura

Toca **permisos** (dentro de una decisión, de ejemplo) y **plata simulada** (monto pedido). No toca la base, ni integraciones, ni datos personales nuevos (personas de ejemplo; la persona del navegador es "vos"). **Pide revisión del agente `arquitecto`** con el id `fogon-propuestas` antes de aprobarlo. Puntos a mirar: que la matriz no se confunda con `lib/permisos/`; que nada salga por la red; el concern sin nombre cuando haya base; si hace falta un ADR para "estado derivado de registros de propuestas" (este diseño cree que no: sigue ADR-001 y ADR-012).

**Veredicto del arquitecto:** pendiente (no se pudo invocar al agente en esta sesión).

## Open Questions

- Todas las letras A–F de §1 son **propuestas a confirmar por Gus**.
- B3: ¿qué cuenta como "participar"? Este diseño cuenta a quien dejó cualquier registro (pregunta, comentario, concern, sumarse, a un lado). Alternativa: pedir una respuesta explícita en el llamado al consenso.
- Decisión simple: ¿se adopta sola al vencer si nadie objetó (consentimiento por silencio)?
- ¿Se suma "Guardián de la tierra" como rol de la holarquía (`lib/gobernanza/`)? Hoy vive solo en los datos de la propuesta.
- Lista de principios: completarla con los de TDF y definir cómo la ratifica el común.
- ¿La página de una propuesta del común se abre sin sesión (A2 de verdad)? Pide cambiar las rutas públicas (ADR-006).
