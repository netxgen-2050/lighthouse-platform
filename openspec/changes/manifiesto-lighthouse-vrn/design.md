# Design

## Context

- **En `dev`:**
  - `lib/manifiestos/datos.ts` tiene el manifiesto `lighthouse` ("Pacto de convivencia del Lighthouse", 6 compromisos) y los de las tribus, con tipo `ManifiestoBilingue` (`titulo`, `introduccion`, `compromisos`).
  - `app/tribus/[id]/manifiesto/` es la lectura con la adhesión consciente (llegar al final y marcar dos casillas).
  - `components/membresia-acciones.tsx` tiene los botones. Hoy la adhesión al Lighthouse se ofrece en la ficha lateral del territorio.
  - La membresía vive en el navegador (`lib/membresia/estado.ts`): `no-miembro → pedido → miembro`, con la clave `lighthouse` para el común.
  - `/tribus/lighthouse` **no existe**: `app/tribus/[id]/page.tsx` solo genera las tribus.
  - La holarquía (`lib/gobernanza/datos.ts`) tiene `COMUN_ID = "lighthouse"`, la raíz se llama "Lighthouse" y hay 7 `CIRCULOS_DEL_COMUN`: permacultura, agua, legal, token, marketing, cuidado y plataforma.
  - En el Fogón (`app/fogon/fogon-cliente.tsx`), votar depende de `motivoSinVoto(d, condicion)` (residencia y pase). En las consultas (`app/fogon/consultas/[id]/consulta-cliente.tsx`) se reparten créditos con +/- y "Guardar".
  - La Vista NetX tiene "Juego A o Juego B" en `app/netx/financiamiento/secciones-modelo.tsx` (`SeccionJuegos`), solo en español.
- **`fogon-propuestas`** (rama `spec/fogon-propuestas`, sin merge ni implementar) define en su design §5 la costura `FuentePrincipios` y una lista de ejemplo de 16 ids. Ahí dice que "cuando exista la spec del manifiesto de la meta-tribu Lighthouse, se suma un adaptador `principiosDelManifiesto`". Este cambio es esa spec.
- **Fuentes del texto del manifiesto** (no se nombran en la interfaz ni en los datos):
  - principios de comunidades regenerativas de referencia (`Formal_Consensus_bot/communities/tdf/principles.md`): suelo, agua, aire, residuos, rewilding, recursos, comunidad, generaciones futuras, derechos de la naturaleza y los principios de base del consenso;
  - la Declaración Universal de los Derechos de la Madre Tierra (sí se puede nombrar en la explicación del ⚖, como en `fogon-propuestas`);
  - `NS_permacultura` 02 (las tres éticas: cuidado de la tierra, de las personas y reparto justo; de lo chico y lento), 08 (proporción silvestre que solo sube), 16 (se diseña de lo grande a lo chico y se implementa de lo chico a lo grande) y 17 (regenerar no es un costo sino lo que más vale; dar al todo más de lo que se recibe).

## Goals / Non-Goals

**Goals:** un manifiesto completo y legible del común; una sola fuente de principios para Fogón, Hifa y Guardián; la ficha del común en Tribus; la regla de adhesión para participar; tribus que suman principios sin contradecir; el relato en la Vista NetX.

**Non-Goals:** ver "Fuera de alcance" en el proposal. En particular: ningún flujo para cambiar o ratificar el manifiesto, nada en Sumarte, nada en la base, y el switch del mapa (§8) solo como pregunta.

## Decisions

### 1. Un solo manifiesto, mismo id `lighthouse`

El manifiesto nuevo **reemplaza** al "Pacto de convivencia": se usa el mismo id `lighthouse` y la misma clave de membresía, así no hay migración y quien ya adhirió en su navegador queda adherida. Sus seis compromisos se reescriben dentro de los compromisos del manifiesto (§3.4), así que no se pierde nada.

`lib/manifiestos/lighthouse-vrn.ts` guarda el manifiesto con su forma propia:

```ts
type GrupoPrincipio = "tierra" | "agua" | "comunidad" | "economia" | "generaciones";
type PrincipioId = string; // ids estables (§4)
type Principio = { id: PrincipioId; grupo: GrupoPrincipio; nombre: BilingueConOriginal; practica: BilingueConOriginal };
type DerechoTierra = { id: string; nombre: BilingueConOriginal; practica: BilingueConOriginal; principios: PrincipioId[] };
type ManifiestoVrn = {
  id: "lighthouse"; proposito: BilingueConOriginal; principios: Principio[]; derechos: DerechoTierra[];
  compromisos: CompromisoBilingue[]; comoSeCambia: BilingueConOriginal[]; reglaTribus: BilingueConOriginal;
  version: BilingueConOriginal; estado: "borrador"; ejemplo: true;
};
```

`lib/manifiestos/datos.ts` arma la entrada `lighthouse` de `MANIFIESTOS` desde `ManifiestoVrn`, así la lectura y la adhesión que ya existen siguen andando: `titulo` = "Manifiesto de Lighthouse VRN", `introduccion` = propósito y `compromisos` = compromisos. Además expone un campo opcional `vrn?: ManifiestoVrn` que `lectura.tsx` usa para mostrar las secciones extra (principios por grupo, derechos, cómo se cambia y equipos). Los manifiestos de tribu no lo tienen.

### 2. Nombre provisorio en una constante

`NOMBRE_META_TRIBU = "Lighthouse VRN"` (la entidad, en el texto del manifiesto) y `NOMBRE_DEL_COMUN = "Lighthouse VRN Commons"` (la ficha, la tarjeta de Tribus y la raíz de la holarquía). Las dos son nombres propios: no se traducen y llevan `translate="no"`. Cambiar el nombre es cambiar una línea; un test verifica que ninguna pantalla escribe "Commons" a mano.

**Alternativas para "Commons"** (Gus duda de él como término de marketing; decide Gus):

| Nombre | A favor | En contra |
|---|---|---|
| **Lighthouse VRN Commons** (provisorio) | Lo entiende un público internacional; conecta con los bienes comunes (Ostrom) y con la cultura web3 | Anglicismo: en español "Commons" no dice nada; suena académico o técnico |
| **Lighthouse VRN Procomún** | En español; la Vista NetX ya habla del "procomún" y de "una startup para el procomún"; marca la diferencia con el Juego A | Palabra poco usada y algo formal; en inglés hay que elegir otra ("Commons" de nuevo) |
| **Lighthouse VRN, la tribu de tribus** | Cálido, se entiende solo y encaja con la página Tribus y con la idea de meta-tribu | Largo para un encabezado; puede sonar a jerarquía, que choca con la holarquía |
| **Común VRN** (o "El Común de Lighthouse VRN") | Es como ya le dice la app ("el común"); simple y corto | Poco distintivo para marketing; "común" también significa "ordinario" |
| **Red Lighthouse VRN** | Comunica que es abierta y que crece hacia otros nodos (D21, D28) | Se confunde con "la red" de NetX y con el nivel "persona de la red" de `fogon-propuestas` |

Recomendación [criterio]: "Lighthouse VRN Procomún" en español y "Lighthouse VRN Commons" en inglés. Si se elige así, la constante pasa a ser bilingüe (cambio de una línea más el test).

### 3. Texto del manifiesto (borrador a ratificar por el común)

Es la fuente de verdad para implementar. Fue escrito en español (`original: "es"`). El inglés es una traducción de un agente, pendiente de revisión nativa. Versión: "29 de octubre de 2026 · borrador".

#### 3.1 Propósito

- **es:** "Ponemos la regeneración y la vida en el centro de cada decisión, para que el valle, su agua y su gente estén cada año más vivos que el anterior."
- **en:** "We put regeneration and life at the center of every decision, so that the valley, its water and its people are more alive each year than the year before."

#### 3.2 Principios (15, en cinco grupos)

| Grupo | id | Principio (es / en) | Qué significa en la práctica (es / en) |
|---|---|---|---|
| Tierra | `vida-en-el-centro` | La vida en el centro / Life at the center | Antes de decidir, nos preguntamos qué le hace a la vida, humana y más que humana; si la daña, buscamos otra forma. / Before deciding, we ask what it does to life, human and more-than-human; if it harms it, we look for another way. |
| Tierra | `suelo-vivo` | Suelo vivo / Living soil | Suelo cubierto todo el año, sin agroquímicos de síntesis, y lo que se poda vuelve a la tierra. / Soil covered all year round, no synthetic agrochemicals, and what is pruned goes back to the land. |
| Tierra | `biodiversidad` | Más vida silvestre / More wild life | Una parte de la tierra queda silvestre o vuelve a serlo, crece etapa por etapa y nunca se achica; cuidamos los árboles viejos y las especies del monte. / Part of the land stays wild or becomes wild again, grows stage by stage and never shrinks; we look after old trees and the species of the native scrubland. |
| Tierra | `aire-limpio` | Aire limpio / Clean air | No quemamos lo que enferma el aire; plantamos árboles y guardamos carbono en el suelo. / We do not burn what makes the air sick; we plant trees and store carbon in the soil. |
| Agua | `agua-viva` | Agua viva / Living water | Frenamos, esparcimos e infiltramos la lluvia, y usamos la lluvia antes que la napa. / We slow, spread and sink the rain, and we use rainwater before groundwater. |
| Agua | `agua-vuelve-limpia` | El agua vuelve limpia / Water goes back clean | Tratamos las aguas grises y negras con plantas y microbios, y devolvemos el agua limpia a la tierra y al río. / We treat grey and black water with plants and microbes, and we return the water clean to the land and the river. |
| Comunidad | `voz-afectada` | Decide quien vive la regla / Whoever lives the rule shapes it | Quien va a vivir con una decisión participa en darle forma. / Whoever will live with a decision takes part in shaping it. |
| Comunidad | `subsidiariedad` | Lo más cerca posible / As close as possible | Decide el círculo más chico que puede decidir; lo que es de todos, lo decide el común. / The smallest circle that can decide, decides; what belongs to everyone is decided by the commons. |
| Comunidad | `cuidado-del-proceso` | Confianza, respeto y no violencia / Trust, respect and nonviolence | Persuadimos, nunca dominamos; escuchamos y criticamos la idea, no a la persona. / We persuade, we never dominate; we listen and we criticize the idea, not the person. |
| Comunidad | `poder-compartido` | Poder y saberes compartidos / Shared power and knowledge | Compartimos lo que sabemos y la información; los roles rotan y nadie concentra el poder. / We share what we know and the information; roles rotate and no one concentrates power. |
| Economía | `tierra-no-mercancia` | La tierra del común no es mercancía / The common land is not a commodity | La tierra del común se cuida y se comparte; no especulamos con ella. / The common land is cared for and shared; we do not speculate with it. |
| Economía | `plata-vuelve-a-la-tierra` | Damos al todo más de lo que recibimos / We give the whole more than we take | Regenerar no es un costo, es lo que más vale: una parte de lo que se gana vuelve a regenerar la tierra común. / Regenerating is not a cost, it is what is worth the most: part of what is earned goes back to regenerating the common land. |
| Economía | `recursos-con-medida` | Recursos con medida / Resources in measure | Energía renovable primero, materiales y comida del lugar, poca superficie construida, y nada se tira: se repara, se composta o se reusa. / Renewable energy first, local materials and food, little built surface, and nothing is thrown away: it is repaired, composted or reused. |
| Generaciones futuras | `generaciones-futuras` | Siete generaciones / Seven generations | Miramos el efecto de cada decisión en las siete generaciones que vienen, humanas y más que humanas. / We look at the effect of each decision on the next seven generations, human and more-than-human. |
| Generaciones futuras | `de-lo-chico-a-lo-grande` | De lo chico a lo grande / From small to large | Diseñamos de lo grande a lo chico y crecemos de lo chico a lo grande, al ritmo que la tierra nos enseña. / We design from large to small and grow from small to large, at the pace the land teaches us. |

#### 3.3 Los derechos de la tierra que asumimos

Encabezado: "La tierra tiene derechos, y los asumimos como propios. No es un texto jurídico: es lo que nos comprometemos a respetar." / "The land has rights, and we take them on as our own. This is not a legal text: it is what we commit to respect." Lleva el ⚖ `derechostierra`.

| id | Derecho (es / en) | Qué hacemos (es / en) | Principios que lo cuidan |
|---|---|---|---|
| `existir` | A existir / To exist | El monte, el río y sus seres no son un recurso para agotar. / The scrubland, the river and their beings are not a resource to exhaust. | `vida-en-el-centro`, `biodiversidad` |
| `regenerar-ciclos` | A regenerar sus ciclos / To regenerate its cycles | Respetamos los tiempos de la tierra: dejamos descansar y no forzamos. / We respect the land's own time: we let it rest and we do not force it. | `suelo-vivo`, `de-lo-chico-a-lo-grande` |
| `agua` | Al agua / To water | El agua es primero de la vida: del río, de la napa y de los seres que dependen de ella. / Water belongs first to life: to the river, the groundwater and the beings that depend on it. | `agua-viva`, `agua-vuelve-limpia` |
| `aire-limpio` | Al aire limpio / To clean air | No emitimos lo que enferma el aire. / We do not release what makes the air sick. | `aire-limpio` |
| `salud-integral` | A la salud integral / To integral health | Cuidamos el suelo, el agua, las plantas, los animales y las personas como un solo cuerpo. / We care for soil, water, plants, animals and people as one body. | `vida-en-el-centro` |
| `no-ser-contaminada` | A no ser contaminada / To not be polluted | Nada tóxico entra a la tierra ni al agua. / Nothing toxic goes into the land or the water. | `suelo-vivo`, `agua-vuelve-limpia`, `recursos-con-medida` |
| `restauracion` | A la restauración / To restoration | Lo que se dañó, se repara, y quien daña, repara. / What was damaged gets repaired, and whoever causes damage repairs it. | `biodiversidad`, `plata-vuelve-a-la-tierra` |

El id del derecho `aire-limpio` vive en otra lista que el principio `aire-limpio` y no se cita al bloquear (§4). El test chequea que los dos espacios de ids no se mezclen.

#### 3.4 Compromisos de quien adhiere

| # | es | en |
|---|---|---|
| 1 | **Pongo la vida en el centro.** Antes de proponer o decidir, me pregunto qué le hace a la tierra, al agua y a la gente, y dejo todo mejor de como lo encontré. | **I put life at the center.** Before proposing or deciding, I ask what it does to the land, the water and the people, and I leave everything better than I found it. |
| 2 | **Me cuido y cuido.** Trato a cada persona como alguien con quien voy a convivir años: pregunto antes de suponer y escucho antes de contestar. | **I take care of myself and of others.** I treat each person as someone I will live alongside for years: I ask before assuming and I listen before answering. |
| 3 | **Decido con otras personas lo que es de todas.** Participo en el Fogón con respeto; si bloqueo una propuesta, digo qué principio de este manifiesto estoy cuidando. | **I decide together with others what belongs to everyone.** I take part in the Fogón with respect; if I block a proposal, I say which principle of this manifesto I am protecting. |
| 4 | **Hablo antes de que el conflicto crezca.** Lo digo pronto, cara a cara y con respeto; si no alcanza, pido ayuda al equipo de Cuidado y conflictos. | **I speak up before conflict grows.** I say it early, face to face and with respect; if that is not enough, I ask the Care and conflicts team for help. |
| 5 | **Aporto al común lo que acordé.** Tiempo, trabajo, saberes o recursos: lo que aporto queda registrado y se rinde cuentas. | **I contribute to the commons what I agreed to.** Time, work, knowledge or resources: what I contribute is recorded and accounted for. |
| 6 | **Si me voy, me voy bien.** Aviso con tiempo, dejo en orden lo que tenía a cargo y nadie queda atado. | **If I leave, I leave well.** I give notice in good time, I leave in order whatever I was in charge of, and no one is tied down. |

Las dos casillas de la adhesión consciente siguen igual que hoy (textos de `tribus.manifiesto`).

#### 3.5 Cómo se cambia este manifiesto

1. Cualquier persona que adhirió puede proponer un cambio en el Fogón, como decisión del común. / Anyone who has adhered can propose a change in the Fogón, as a decision of the commons.
2. Se adopta solo por consenso del común, siguiendo el proceso de propuestas del Fogón; quien bloquea dice en qué principio de este manifiesto se apoya. / It is adopted only by consensus of the commons, following the Fogón's proposals process; whoever blocks says which principle of this manifesto they rely on.
3. Cada versión queda con su fecha, y las anteriores se pueden seguir leyendo. / Each version keeps its date, and earlier ones can still be read.
4. Hasta que el común lo ratifique, este texto es un borrador. / Until the commons ratifies it, this text is a draft.

**La regla de las tribus** (`reglaTribus`): "Cada tribu puede sumar principios propios para cuidar más. Ninguno puede contradecir, aflojar ni reemplazar los de Lighthouse VRN. Si a una tribu un principio de este manifiesto no le sirve, propone cambiarlo en el Fogón del común." / "Each tribe can add its own principles to care for more. None can contradict, loosen or replace those of Lighthouse VRN. If a principle of this manifesto does not work for a tribe, it proposes changing it in the Fogón of the commons."

**Las máquinas sugieren; las personas deciden** (cierra la sección): "Hifa y el Guardián (IA) pueden sugerir desde estos principios; nunca deciden." / "Hifa and the Guardian (AI) can make suggestions based on these principles; they never decide."

### 4. Fuente de principios y su relación con `fogon-propuestas`

```ts
// lib/manifiestos/lighthouse-vrn.ts
export function principiosLighthouseVrn(): readonly Principio[];
export function principioVrnPorId(id: string): Principio | null;
export const principiosDelManifiesto = {           // misma forma que FuentePrincipios de fogon-propuestas
  principios: principiosLighthouseVrn, estado: "borrador" as const, origen: "manifiesto" as const,
};
```

- `nombre` y `practica` del manifiesto corresponden a `nombre` y `explicacion` de `fogon-propuestas`. El adaptador expone `explicacion = practica` para no tocar esa costura.
- **Ids de la lista de ejemplo de `fogon-propuestas`:**
  - **Se conservan 13:** `vida-en-el-centro`, `tierra-no-mercancia`, `suelo-vivo`, `agua-viva`, `aire-limpio`, `biodiversidad`, `recursos-con-medida`, `generaciones-futuras`, `voz-afectada`, `subsidiariedad`, `cuidado-del-proceso`, `poder-compartido` y `plata-vuelve-a-la-tierra`.
  - **Salen 3:**
    - `derechos-madre-tierra`: pasa a ser la sección de derechos, y cada derecho remite a sus principios;
    - `nada-se-tira`: queda dentro de `recursos-con-medida`;
    - `personas-deciden`: pasa a ser la frase de cierre del §3.5.
  - **Entran 2:** `agua-vuelve-limpia` y `de-lo-chico-a-lo-grande`.
  - Los datos de ejemplo de `fogon-propuestas` citan `agua-viva`, que se conserva.
- **Cómo se conecta:** si al implementar este cambio ya existe `lib/fogon/propuestas/principios.ts` en `dev`, se cambia su línea `fuentePrincipios = principiosDeEjemplo` por el adaptador y se corren sus tests. Si no existe, no se crea: se deja anotado en el PR, y `fogon-propuestas` lo conecta al implementarse. Hay que avisarle a Gus que actualice el §5 del design de `fogon-propuestas` para que apunte acá.
- Los derechos **no** se citan al bloquear: el bloqueo cita un principio (C2 de `fogon-propuestas`). El Guardián puede nombrar un derecho en su texto, pero su cita formal es siempre un principio.

### 5. Principios propios de las tribus (`lib/manifiestos/principios-tribu.ts`)

```ts
type PrincipioDeTribu = {
  id: string; nombre: BilingueConOriginal; practica: BilingueConOriginal;
  profundiza: PrincipioId[];            // qué principios de Lighthouse VRN cuida más (puede ir vacío)
  excepcionA?: PrincipioId;             // existe solo para poder rechazarlo: una tribu no puede exceptuarse
};
type ErrorPrincipio = "id-de-vrn" | "contradice" | "profundiza-inexistente" | "texto-vacio" | "id-repetido";
function validarPrincipiosDeTribu(lista: PrincipioDeTribu[]): { ok: true } | { ok: false; errores: { id: string; error: ErrorPrincipio }[] };
```

- **"Contradecir" en su forma simple:** el modelo no tiene manera de quitar ni editar un principio de Lighthouse VRN, porque la tribu solo agrega. Lo único que se puede expresar mal es una excepción (`excepcionA`) o pisar un id, y las dos se rechazan. La revisión de fondo (si un texto contradice en los hechos) la hace el común en el Fogón. Un test de los textos de ejemplo además busca "excepto", "salvo" y "except" en los principios de tribu, como red de seguridad.
- El motivo `contradice` se muestra como "contradice un principio de Lighthouse VRN".
- `ManifiestoBilingue` suma `principiosPropios?: PrincipioDeTribu[]`. Un test corre `validarPrincipiosDeTribu` sobre todas las tribus de ejemplo.
- **Principios de ejemplo** (redactados por un agente, a revisar con cada tribu):
  - **Semilla Viva:**
    - `semilla-libre`, "Las semillas son libres": "Intercambiamos y multiplicamos semillas criollas; nunca las patentamos ni las vendemos como propias". Profundiza `suelo-vivo` y `tierra-no-mercancia`.
    - `comer-de-estacion`, "Comemos de estación": "La huerta sigue el calendario del lugar, no el del supermercado". Profundiza `recursos-con-medida`.
  - **Agua Clara:**
    - `cada-litro-a-la-vista`, "Cada litro, a la vista": "Publicamos todos los meses cuánta agua se usa y cómo vuelve". Profundiza `agua-viva` y `agua-vuelve-limpia`.
- Las demás tribus muestran "Esta tribu todavía no sumó principios propios".

### 6. Equipos transversales = círculos del común

Se reusan los `CIRCULOS_DEL_COMUN` (mismos ids; las personas y roles de ejemplo no cambian). Cada uno suma una línea de propósito para la ficha (`paraTodoElLighthouse: Bi`).

| id | Hoy | Queda como | Propósito para todo el Lighthouse |
|---|---|---|---|
| `comun-legal` | Legal y fideicomiso | **Legal** | Estatuto, contratos y los borradores con peso legal, para que todo lo del común esté en regla |
| `comun-permacultura` | Permacultura y suelo | **Permacultura y regeneración** | El diseño del paisaje, el suelo y la tierra silvestre, con la regeneración medida año a año |
| `comun-marketing` | Comunicación y marketing | **Marketing y comunicación** | El relato público y la bienvenida a quien llega |
| `comun-plataforma` | Plataforma y datos | **Tecnología** | La plataforma, los datos y la privacidad de todas las personas |
| `comun-contratistas` | (nuevo) | **Gestión de contratistas** | Convocar, contratar y seguir las obras y los servicios de terceros, con los principios en el pliego |
| `comun-gobernanza` | (nuevo) | **Gobernanza** | Cuidar el proceso de propuestas del Fogón y este manifiesto, sin decidir por nadie |
| `comun-cuidado` | Cuidado y conflictos | **Cuidado y conflictos** | Acuerdos de convivencia y mediación cuando un conflicto crece |
| `comun-agua` | Agua del Lighthouse | **Agua** | La cuenca, el riego y las cisternas compartidas |
| `comun-token` | Tokenomics y Semillas | **Tokenomics y Semillas** (sin cambios) | La emisión de Semillas y los parámetros del Juego B |

- `comun-token` no está en la lista de Gus y se mantiene (pregunta abierta).
- Los nuevos tienen `proposito` "economia" (contratistas) y "gobierno" (gobernanza) y dos cosas que deciden cada uno: Contratistas decide "Convocatorias y contratos de obra" y "Seguimiento de entregas"; Gobernanza, "Proceso de propuestas del Fogón" y "Cuidado del manifiesto".
- La ficha los lista bajo "Equipos transversales: una startup para el procomún", con un enlace a `/fogon/gobernanza`.
- La raíz de la holarquía pasa a llamarse `NOMBRE_DEL_COMUN`.
- Hay que actualizar los tests y el e2e que nombran "Permacultura y suelo".

### 7. La regla de adhesión (`lib/gobernanza/participar.ts`)

```ts
export function adhirioAlManifiestoVrn(m: Membresias): boolean;     // estadoDe(m, "lighthouse") !== "no-miembro"
export function puedeParticiparEnGobernanza(m: Membresias): boolean; // hoy = adhirioAlManifiestoVrn
```

- **"pedido" cuenta como adhesión.** Adherir es un acto de la persona; la aceptación del común sigue simulada (B6). Si Gus decide que hace falta la aceptación, se cambia solo esta función.
- **Fogón:** `motivoSinVoto` recibe `adhirio` en `condicion` y devuelve `"manifiesto"` **antes** que residencia y pase. El texto de `t.motivos.manifiesto` lleva el enlace a `/tribus/lighthouse/manifiesto` y el ⚖ `adhesiongobernanza`. `puedeLlevarAlConsejo` también lo respeta. `listo` espera a que la membresía esté leída.
- **Consultas:** sin adhesión no se muestran +/- ni "Guardar"; en su lugar va el aviso. Los resultados se siguen viendo. "Simular cierre" y "Reabrir" son controles de demostración de quien facilita y no se tocan (pregunta abierta).
- **Holarquía:** hoy no tiene acciones de participación (solo navegar), así que no cambia.
- **`fogon-propuestas`:** cuando se implemente, sin adhesión la persona queda como máximo en el nivel "red" (puede leer, no puede participar). Hay que anotarlo en su design.
- **e2e existentes** que votan en `/fogon` o reparten en `/fogon/consultas`: tienen que adherir antes. Se agrega un helper que escribe la membresía `lighthouse: "pedido"` en el navegador.

### 8. Pregunta de diseño abierta (no se implementa): un nivel más en Explorar el territorio y en Tribus

Pedido: un switch en el mapa entre la vista de **tribus que ocupan territorio** y una vista de **equipos o departamentos transversales**. Tres formas posibles:

- **A. Capa "Equipos" en el mismo mapa.** Un control segmentado "Ver: Tribus | Equipos" arriba del mapa. En "Equipos", cada equipo se dibuja sobre lo que cuida (Agua sobre la cuenca y las cisternas, Permacultura sobre las zonas silvestres, Contratistas sobre las obras), con patrón y etiqueta, no solo con color. La lista lateral pasa a mostrar equipos.
  - A favor: un solo mapa y un gesto simple; encaja con P24 `mapa-capas`.
  - En contra: los equipos no tienen un lugar fijo, así que habría que inventar "dónde actúa" cada uno. Choca con "no inventar datos" hasta que haya masterplan (L4).
- **B. Matriz tribus × equipos al lado del mapa.** El switch cambia el panel lateral (no el dibujo) por una tabla: filas de tribus, columnas de equipos, y en cada celda el enlace de esa tribu con ese equipo (quién la representa, qué pidió).
  - A favor: muestra lo transversal sin geografía inventada; los datos ya existen en parte (`ROLES_CRUZADOS`); es accesible como tabla.
  - En contra: deja de ser "mapa"; con muchas tribus la tabla crece.
- **C. Zoom de niveles como en la holarquía.** El mapa y Tribus suman un nivel "Lighthouse VRN" arriba de las tribus: al alejar, las tribus se agrupan en el común y aparecen los equipos como un anillo alrededor del territorio. En Tribus, dos pestañas: "Tribus" y "Equipos del común".
  - A favor: coherente con la holarquía (`zoom.ts`) y con la estrategia fractal (de lo grande a lo chico).
  - En contra: es la más cara; dos zooms distintos pueden confundir.

Recomendación [criterio]: empezar por **B** (barata y honesta con los datos) y dejar **A** para cuando exista el masterplan con capas reales. Decide Gus.

## Risks / Trade-offs

- [Los e2e del Fogón y de las consultas se rompen al exigir adhesión] → helper de adhesión y tarea explícita para actualizarlos en la misma noche.
- [La lista de principios de `fogon-propuestas` queda desfasada si se implementa antes de leer este cambio] → mapeo de ids en §4, y Gus actualiza su design. Con un id que ya no está se ve "principio fuera de la lista vigente", que ya está previsto allá.
- [Un manifiesto escrito por un agente puede parecer definitivo] → marca "borrador, a ratificar por el común" en la ficha, en la lectura y en la Vista NetX, con su ⚖ en borrador.
- [La validación de "no contradecir" es superficial] → se dice en el ⚖ y en el design. La revisión de fondo es del común; acá solo se impide lo que el modelo puede expresar (excepciones e ids pisados).
- [Renombrar círculos rompe tests y textos] → mismos ids y lista de archivos en el proposal.
- [Quien ya había adherido al "Pacto de convivencia" queda adherida al manifiesto nuevo sin haberlo leído] → es un prototipo con datos de ejemplo. Guardar la versión adherida queda fuera de alcance (pregunta abierta).

## Migration Plan

Sin base y sin claves nuevas: se reusa la clave de membresía. Para revertir, se vuelve la entrada `lighthouse` de `datos.ts` al pacto anterior, se quita el motivo `"manifiesto"` y se quita la ficha del común. Si `fogon-propuestas` ya estaba conectado, su costura vuelve a `principiosDeEjemplo`.

## Open Questions

Ver la sección "Preguntas abiertas" del resumen del cambio (y el §2 y el §8 de este design).
