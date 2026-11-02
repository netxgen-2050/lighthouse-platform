# Design

## Context

- **Holarquía** (`fogon-gobernanza-holarquia`, en `dev`): `app/fogon/gobernanza/holarquia-cliente.tsx` guarda en estado de React el foco (`focoId`), la lente, la selección y la decisión elegida; arma migas, `Dibujo`, `Leyenda`, panel de la lente y `Arbol`. El árbol (`construirHolarquia`) es puro y el servidor lo pasa como `raiz`. El registro de lentes (`LENTES`) no cambia.
- **Fogón** (`app/fogon/fogon-cliente.tsx`): una sola lista con `filtrar(ambito, estado)` y un grupo de filtros por ámbito. Cada tarjeta trae voto, "Llevar al consejo", `ParametrosDecision` y "Abrir la propuesta". Las decisiones (`lib/fogon/datos.ts`) tienen `ambito`, `tribuId` y `origen`, pero **no** dicen en qué holón se deciden. Los caminos de ejemplo están en `lib/gobernanza/caminos.ts`.
- **Propuestas** (PR #144): `lib/fogon/propuestas/ejemplos.ts` ya trae `holonId` por propuesta (`consejo-bomba` → `consejo`, `regalia` → `lighthouse`, `siembra` → `valle-0`, `cisterna-compartida` → `consejo`, `huerta` → `null`). La cabecera de `propuesta-cliente.tsx` tiene migas "Fogón › título".
- **Nombres en el dibujo:** `Dibujo` solo rotula los **hijos directos** del foco y solo si `entraElNombre(texto, radio)`. En el nivel del común, los círculos de adentro de cada tribu y los círculos chicos del común quedan sin texto: es lo que Gus vio como "círculos sin nombre". Los datos tienen nombre en todos los círculos, pero varios son largos ("Permacultura y regeneración", "Marketing y comunicación", "Gestión de contratistas").
- **Adhesión** (`manifiesto-lighthouse-vrn`, PR #144): `reducir` pasa `adherir` a `"pedido"` y `aceptar` (simulado) a `"miembro"`. La regla `puedeParticiparEnGobernanza` ya acepta "pedido", así que la participación no cambia; lo que cambia es lo que se ve y lo que se guarda.

## Goals / Non-Goals

**Goals:**
- Una sola página (`/fogon`) con la holarquía como portada y la lista del holón al lado, reusando los componentes que existen (sin reescribir el dibujo ni las lentes).
- Un único dato que dice dónde se decide cada decisión, con tests que lo crucen contra la holarquía y las propuestas.
- Que el lugar en la holarquía sobreviva a abrir una propuesta y volver.

**Non-Goals:**
- Rediseñar el layout del dibujo (`empaquetar`), el zoom o las lentes.
- Guardar en la dirección la selección de una persona, la decisión elegida en la lente o "Solo las de {holón}": solo holón y lente.
- "Tus propuestas", el Pase Fundador y el Guardián: van en `fogon-desde-mi-y-guardian`, apilado sobre este (Gus, 1-nov).
- Un veto de la Voz de la Tierra.

## Decisions

### 1. `holonId` en cada decisión (dato, no derivado)
`Decision` suma `holonId: string` (obligatorio, nunca nulo: después de sacar el fideicomiso, toda decisión está en la holarquía). Valores: `huerta` → `semilla-1` (Huerta intensiva, Semilla Viva; Gus aceptó la sugerencia el 1-nov), `presupuesto-fondo-comun` → `lighthouse` (reemplaza a `presupuesto`, ver §1b), `facilitador` → `valle`, `bomba` y `animales` → `lighthouse`, `siembra` → `valle-0`, `cisterna` → `valle`, `consejo-bomba` → `consejo`, `regalia` → `lighthouse`, `cisterna-compartida` → `consejo`; `copiaParaElConsejo` pone `consejo`. `ejemplos.ts` cambia la huerta de `null` a `semilla-1`.
- **Por qué dato y no derivarlo de `ambito`/`tribuId`:** el ámbito no alcanza para saber el círculo (`siembra` es "circulo" pero no dice cuál) y adivinarlo por el texto de `donde` es frágil.
- **Tests** (`lib/fogon`): todo `holonId` existe en `construirHolarquia("es")`; si la decisión tiene propuesta y la propuesta tiene `holonId`, coinciden; `ambito` es coherente con el tipo del holón (circulo ↔ nodo círculo, tribu ↔ tribu, consejo ↔ consejo, comun ↔ común).
- El texto `donde` de la huerta pasa a "Huerta intensiva · Semilla Viva" (es/en), con `tribu: "Semilla Viva"`.

### 1b. Sin fideicomiso: el Fogón es consultivo y dice a quién le lleva la recomendación (Gus, 1-nov)
- **Por qué:** en el diseño legal B (NS_Tokenomics, doc 25 §6, "Governance") no hay un fideicomiso único con una asamblea de beneficiarios por persona. Cada serie tiene su asamblea de tenedores, que vota **por capital** y fuera de la plataforma; el **directorio de la Fundación** ("Consejo de la Fundación") decide, entre otras cosas, el presupuesto del Fondo Común. El Fogón es el espacio consultivo del procomún (la holarquía): recomienda, no reemplaza a esos órganos.
- `Ambito` pasa a `"circulo" | "tribu" | "comun" | "consejo"`; `AMBITOS` y los textos del ámbito y de la fuente `fideicomiso` se borran; `monto.fuente` queda `"fondo-comun" | "tribu"`. `Requisito` pierde `"pase"` (ninguna decisión lo usa) y `fogon-cliente.tsx`/`usar-fogon.ts` deja de leer la puerta del Pase. Se borran los textos `pase.con` y `pase.sin` del Fogón y los tests de "el fideicomiso solo registra el voto de quien tiene el Pase".
- **Destino:** `Decision` suma `destino?: "consejo-fundacion"` (unión abierta a otros órganos legales cuando haga falta). Si existe, la tarjeta (y la tarjeta "Dónde se decide" de la propuesta, si la tiene) muestra debajo del lugar: "Lo decide el Consejo de la Fundación; el Fogón le lleva la recomendación" con el ⚖ `destinoconsejofundacion` (nuevo, `borrador: true`; Gus, 1-nov: queda en borrador hasta la revisión R14): "En el diseño legal en estudio, la tierra y el Fondo Común son de una Fundación. Su consejo decide el presupuesto del Fondo Común. Lo que se vota acá es una recomendación del común para ese consejo: no lo obliga. Cómo se compone el consejo y cómo recibe las recomendaciones lo define su estatuto, que todavía hay que confirmar con el equipo legal." El voto de la tarjeta se presenta como "Tu recomendación" en lugar de "Tu voto" solo cuando hay destino.
<!-- arquitecto: es otra pregunta, así que va con otro id; un voto dado a una pregunta no se cuenta en otra -->
- **El presupuesto se reubica con id nuevo:** la decisión `presupuesto` (obra del macrolote) se borra y se crea `presupuesto-fondo-comun` (en §1, `holonId: "lighthouse"`): "Presupuesto 2027 del Fondo Común" / "2027 Common Fund budget", `donde` "Lighthouse VRN", `ambito: "comun"`, `holonId: "lighthouse"`, `requisito: "ninguno"`, `regla` "Recomendación del común" / "Recommendation of the commons", `base: "destinoconsejofundacion"`, `destino: "consejo-fundacion"`, mismos votos de ejemplo. Sin propuesta de consenso (como hoy). El presupuesto de obra del macrolote **se quita**: lo decide la asamblea de su serie, por capital y fuera de la plataforma.
- **Ningún texto nombra una "asociación que custodia el Fondo Común" (Gus, 1-nov):** en el diseño legal B el Fondo Común lo administra el Consejo de la Fundación. Se corrigen los ⚖ `pasefundador`, `guardian` (que pasa a titularse "El Fondo Común") y `guardianIA` de `lib/legal/terminos.ts`, los tres con `borrador: true` porque ya no vienen del mock-up v6. `docs/referencia/netx-tribus-mockup-v6.html` es una referencia congelada y no se toca. Test: ningún texto del catálogo (es ni en) contiene "asociación que custodia" ni "association that holds/custodies".
- El ⚖ `fidasamblea` queda en el catálogo solo si otra pantalla lo usa; si no, se borra con su test (verificar con `git grep fidasamblea`).
- **Tests:** ninguna decisión tiene ámbito fideicomiso; toda decisión con `destino` es del común; el presupuesto está en `aca` del común con su destino.

### 2. Grupos de la lista adyacente: función pura
`decisionesDelHolon(raiz, holonId, estado)` en `lib/fogon/estado.ts` (reemplaza a `filtrar`, que se borra junto con sus tests de filtro) devuelve `{ aca, pasa, adentro }`:
- `aca`: `holonId === H`.
- `pasa`: `holonId !== H` y su `caminoDe(d)` incluye `H` y (`tipo !== "queda"` o `camino[0] === H`). Así "se decide abajo" no aparece como que sube, y lo que nace en un círculo (la regalía) sí aparece ahí.
- `adentro`: el `holonId` es descendiente estricto de `H` y no está en `aca` ni en `pasa`, con el nombre del holón y de su tribu para el texto "en {círculo} · {tribu}".
- Las copias llevadas al consejo salen de `decisionesVisibles(estado)`, como hoy.
- **Lo de adentro se ve por defecto (Gus, 1-nov):** la sección muestra `adentro` como tercer grupo "En los círculos de adentro", con la etiqueta "en {círculo} · {tribu}" (o el tramo del camino que corresponda: en una tribu, solo "en {círculo}"). Para cuando la lista del común queda larga (backlog D5, muchas tribus), un botón "Solo las de {holón}" con `aria-pressed` esconde ese grupo. El botón aparece **siempre que `adentro` no esté vacío**, no a partir de un largo fijo: así no hay un umbral que inventar y el control está en el mismo lugar en todos los holones. El estado del botón vive en React (no en la dirección) y vuelve a "no presionado" al cambiar de holón, para que cada holón arranque mostrando todo.
- **Alternativa descartada:** el botón "Ver también lo de los círculos de adentro", cerrado por defecto (versión anterior de este design). Gus prefirió ver todo y poder acotar.
- Tests con los escenarios de la spec (Valle Solar, Cuidado de la tierra, Tokenomics, común, Compost, copia al consejo).

### 3. Componentes: la holarquía recibe una ranura
- `fogon-cliente.tsx` se parte: `tarjeta-decision.tsx` (la tarjeta actual, sin cambios de comportamiento, con su foco y anuncios) y `propuestas-del-holon.tsx` (encabezado "Propuestas en {nombre}", grupos con `<h3>`, grupo "En los círculos de adentro" visible por defecto, botón "Solo las de {holón}" con `aria-pressed` y `aria-controls` hacia el contenedor de la sección, que siempre existe (no hacia el grupo, que desaparece al acotar y dejaría un id roto para axe), mensajes vacíos). El estado del Fogón (votos, almacenamiento, `useParticipacion`, condición) sube a un hook `useFogon()` para que lo comparta la lista.
<!-- arquitecto: la ranura recibe también la lente: la usa §5 (`&lente=` en "Abrir la propuesta") y `fogon-desde-mi-y-guardian` ("Tus propuestas" con la lente Desde mí) -->
- `HolarquiaCliente` suma una prop opcional `adyacente?: (ctx: { foco: NodoH; raiz: NodoH; lente: string }) => ReactNode` (un objeto, para que el cambio apilado pueda sumar campos sin romper la firma). Si viene, la columna derecha muestra primero esa sección y después el panel de la lente; si no, queda como hoy (los tests de la holarquía sin Fogón siguen valiendo).
- Layout: en ≥ 860 px, dos columnas (dibujo y leyenda | propuestas del holón y panel). En < 860 px una sola columna: dibujo, propuestas, panel, lista accesible. El `aria-live="polite"` sigue solo en el panel; la sección de propuestas no es una región viva (cambia con cada zoom y sería ruido), pero su encabezado nombra el holón.
- `app/fogon/page.tsx` arma la página: avisos, sobretítulo "Fogón", `h1` "Cómo decidimos", intro, `HolarquiaCliente` con `adyacente`, la sección "capas" que hoy está en `/fogon/gobernanza`, y "Otras herramientas" (consultas y simulador).
- `app/fogon/gobernanza/page.tsx` pasa a `redirect` (como el simulador), copiando `holon` y `lente` de `searchParams`.

### 4. El lugar en la dirección
- `HolarquiaCliente` lee `holon` y `lente` con `useSearchParams()` al montar y escribe con `router.replace(`?${params}`, { scroll: false })` en cada cambio de foco o lente. `replace` y no `push`: un zoom no es una página nueva, y el botón "atrás" del navegador no tiene que deshacer zooms de a uno.
- Un id que no está en el árbol (`buscarNodo` da `null`) o una lente que no está en el registro se ignoran (común y primera lente); no se reescribe la dirección hasta que la persona cambie algo.
- `page.tsx` es de servidor: también lee `searchParams` y pasa `focoInicial`/`lenteInicial` al cliente, así el primer render ya muestra el holón y no hay salto al hidratar. `useSearchParams` va dentro de un `<Suspense>` para que `pnpm build` no falle.
- Los nombres de los parámetros (`holon`, `lente`, `desde`) no se traducen; `?lang=en` convive con ellos.
<!-- arquitecto: lo que viene de la dirección no se confía -->
- **Lo que llega por la dirección no se muestra ni se enlaza tal cual:** `holon`, `lente` y `desde` se validan contra el árbol y el registro de lentes con una sola función pura; los textos que se ven (nombres en migas, "Volver a…", "La abriste desde…") salen siempre del nodo encontrado, nunca del parámetro, y los enlaces se arman con `URLSearchParams` sobre rutas fijas (`/fogon`, `/fogon/propuestas/<id>`). La redirección de `/fogon/gobernanza` va siempre a `/fogon` y solo copia `holon` y `lente` (sin otros parámetros).

### 5. La propuesta en contexto
- "Abrir la propuesta" (tarjeta y panel de la lente Decisiones) arma `/fogon/propuestas/<id>?desde=<focoId>` y suma `&lente=<id>` si no es la primera.
- `propuesta-cliente.tsx`: las migas se arman con `caminoHasta(raiz, propuesta.holonId)` (la `raiz` se construye en `page.tsx` del servidor, como en la holarquía) más el título; cada holón es un `Link` a `/fogon?holon=<id>`; la última miga lleva `aria-current="page"`. Para la visita sin cuenta (A2) se muestran los holones sin el título, como hoy se oculta el título.
- Tarjeta "Dónde se decide": nombre y tipo del holón, sus "Decide sobre", el destino si la decisión lo tiene (§1b), y `caminoDe(decision)` en texto con nombres (`caminoEnArbol` filtra ids rotos). Reusa los textos de tipo de camino de la lente Decisiones.
- "Volver a {holón}": usa `desde` si existe en el árbol; si no, el `holonId` de la propuesta. "La abriste desde {holón}" solo si `desde` es válido y distinto del `holonId`.

### 6. Nombres en el dibujo
- `Circulo` suma `nombreCorto?: BilingueConOriginal` (≤ 12 caracteres) solo donde el nombre es largo. Ejemplos: "Permacultura y regeneración" → "Permacultura", "Marketing y comunicación" → "Marketing", "Gestión de contratistas" → "Contratistas", "Tokenomics y Semillas" → "Tokenomics", "Comunicación del común" → "Comunicación", "Tratamiento de aguas" → "Aguas". Para tribus y consejo: "Fundación Avelan Kerum" → "Avelan Kerum", "Consejo de tribus" → "Consejo". El nodo de la holarquía lleva `nombreCorto` ya resuelto en el idioma.
- `rotuloDe(nombre, corto, radioPx)` pura en `lib/gobernanza/zoom.ts`: devuelve el nombre si entra, el corto si entra, o `null`. Nunca recorta. Test de umbrales.
- `Dibujo` rotula: los hijos del foco (como hoy, con `rotuloDe`) y, **para los hijos contenedores cuyo rótulo entró**, también sus hijos contenedores (los nietos que son círculos, no personas), centrados y con letra más chica (9 px), solo si el nieto tiene radio ≥ 22 px en pantalla. El rótulo del hijo sigue arriba de su círculo, así no choca con los de adentro.
- Cada `<circle>` lleva un `<title>` con el nombre completo (tooltip del navegador). El SVG sigue `role="img"` con su nombre: los `<title>` internos no se anuncian, la información para lector de pantalla sigue en la lista y el panel.
- Test de datos: todo nodo contenedor y todo lugar del árbol tiene `nombre.trim() !== ""` en es y en, y ninguno es igual a su id.
- **Alternativa descartada:** etiquetas fuera del círculo con líneas guía. Más código y en 390 px se superponen igual.

### 7. Adhesión automática
- `reducir`: `adherir` sobre `COMUNIDAD_LIGHTHOUSE` da `"miembro"` directo; sobre una tribu, `"pedido"` como hoy. `aceptar` sobre `lighthouse` no hace nada.
- `leer`: una entrada `lighthouse: "pedido"` se normaliza a `"miembro"` al leer (migración silenciosa del navegador; no hace falta reescribir lo guardado).
- `MembresiaAcciones`: para `lighthouse` desaparecen `pedidoLlego` y el botón "Simular: la comunidad me acepta"; al adherir se anuncia "Ya sos parte de Lighthouse VRN" en la zona de avisos (el foco va ahí, como hoy al aceptar). La ayuda `ayudaPuede` ("tu pedido le llega a quien administra…") no se muestra para Lighthouse VRN.
- La versión del manifiesto se sigue guardando igual: con versión vieja, `adhesionDesactualizada` sigue pidiendo volver a adherir, y `reducir` ya permite volver a adherir porque el estado se recalcula con la versión.
- **Costura D37:** comentario `// D37: aval con constancias EAS` en `reducir`, junto al caso de Lighthouse, diciendo que ahí un aval podría condicionar `"miembro"`. Sin tipos ni funciones nuevas.
<!-- arquitecto: "miembro de lighthouse" cambia de significado (de "me aceptaron" a "adherí") y lo leen otros módulos (ADR-025, Propuesta) -->
- **Quién más lee "miembro de `lighthouse`":** `lib/pactos/postulacion.ts` (`relacionConHolon`: en las necesidades del común la persona pasa de "aspirante" a "miembro" apenas adhiere), `app/semillas/semillas-cliente.tsx` y `app/pactos/pactos-cliente.tsx` (`comunidadesDondeEsMiembro`: Lighthouse aparece entre sus comunidades), `lib/pasaporte/sellos.ts` y `app/perfil/perfil-cliente.tsx`. Es lo que pide Gus; no se cambia ninguno de esos archivos, pero sus tests tienen que seguir en verde, y se suma un test en `lib/pactos` que muestre que adherir a `lighthouse` da relación "miembro" con el común y que adherir a una tribu sigue dando "aspirante".
- **Versión vieja:** `reducir` no pisa una membresía `"miembro"`, así que "volver a adherir" con versión vieja depende de que la versión se guarde aparte (PR #144). Test explícito: con `lighthouse: "miembro"` y versión vieja, `puedeParticiparEnGobernanza` da `false`; al volver a adherir, la versión queda la vigente y da `true`. Si la implementación del PR #144 no permite esto, frenar y reportar.
- **`leer` normaliza solo la clave `lighthouse`:** un `"pedido"` de una tribu sigue siendo `"pedido"` (test).
- **En la base** (fuera de alcance): la membresía del común no se guarda aparte; se calcula desde la adhesión vigente (ADR-025). La costura D37 va en ese mismo punto.
- Se revisa el ⚖ `adhesiongobernanza` y `adhesion`: el texto de `adhesion` ya dice "la adhesión vale desde que adherís"; si algún texto de Lighthouse VRN dice que alguien acepta, se ajusta (con `borrador: true` si es nuevo).

### 8. Lo que pasó a `fogon-desde-mi-y-guardian` (Gus, 1-nov)
"Tus propuestas" en la lente Desde mí, el Pase Fundador con influencia en el Fondo Común y el Guardián (textos, desafío destacado y respuesta por escrito) se diseñan en ese cambio, apilado sobre este. Este cambio deja listas las piezas que aquel reusa: la ranura `adyacente` de `HolarquiaCliente`, `tarjeta-decision.tsx`, `useFogon()` y la etiqueta "en {círculo} · {tribu}".
- **Decisiones de Gus del 1-nov sobre el desafío del Guardián:** (1) si nadie responde el desafío y vence la fase, la propuesta se cierra sin llegar al llamado al consenso; (2) las personas afectadas respaldan el desafío y también lo responden. Viven en el delta de `fogon-desde-mi-y-guardian` (donde está el desafío), que ya las recoge; este cambio no toca el desafío.
- **Nombre del hook:** el estado compartido del Fogón se llama `useFogon()` (en `app/fogon/usar-fogon.ts`) porque la regla de lint de hooks de React exige el prefijo `use`.
- **La spec de `pase-fundador-gobernanza` queda desactualizada desde este cambio:** su requisito "Voto en el Fideicomiso" (la pestaña Fideicomiso del Fogón) deja de existir al sacar el ámbito (§1b). Por pedido de Gus no se modifica acá; hay que corregirla antes de archivar este cambio.

## Risks / Trade-offs

- [La columna derecha queda larga: propuestas + panel] → las propuestas van primero (es lo que pidió Gus) y el panel sigue debajo; en pantallas anchas la columna tiene su propio scroll natural de página, sin `overflow` interno (que rompería el teclado y la lupa).
- [Los e2e que usan `/fogon/gobernanza` o los filtros se rompen] → se actualizan en el mismo cambio; la redirección mantiene vivos los enlaces guardados.
- [Lighthouse como "miembro" lo hace aparecer en Pactos y Semillas (`comunidadesDondeEsMiembro`)] → ya pasaba al simular la aceptación; se revisa con `e2e/membresia.spec.ts` y los tests de pactos que lean membresía.
- [Rótulos de nietos en celular] → con el umbral de 22 px casi no aparecen a 390 px; está bien: la spec pide nombres "cuando hay lugar".
- [`router.replace` en cada zoom puede re-renderizar el servidor] → `replace` con la misma ruta y solo cambio de query en un cliente que no depende de `searchParams` del servidor después del primer render; si el implementador ve pedidos al servidor por zoom, usar `window.history.replaceState` (Next 15 lo integra con `useSearchParams`).
- [Cambiar `donde` de la huerta toca un dato del mock-up v6] → Gus lo aceptó el 1-nov.
<!-- arquitecto: antes decía que el voto viejo se reusaba como recomendación -->
- [Votos guardados en el navegador sobre `presupuesto` (obra del macrolote, con el Pase)] → la pregunta cambió, así que el id cambia (`presupuesto-fondo-comun`): `leer` recorre solo las decisiones que existen y el voto viejo se ignora sin error; nadie aparece recomendando algo que no eligió. Test: un estado guardado con `votos.presupuesto = "favor"` no marca voto en `presupuesto-fondo-comun`. Sin migración.
- [La spec `pase-fundador-gobernanza` contradice la app después de este cambio] → anotado en §8 y en tasks; no se archiva este cambio sin corregirla.
- [Con lo de adentro por defecto, la lista del común es la más larga] → el botón "Solo las de {holón}" la acota con un toque; con muchas tribus reales (D5) habrá que revisar si el común arranca acotado, pero hoy son pocas decisiones de ejemplo.
- [Dos cambios apilados] → `fogon-desde-mi-y-guardian` parte de la rama de este; si este cambia antes de entrar a `dev`, el de arriba se rebasa.

## Migration Plan

Sin datos en servidor. En el navegador, `lighthouse: "pedido"` se lee como miembro sin reescribirse. Volver atrás es revertir el PR: los enlaces `/fogon?holon=…` seguirían abriendo `/fogon` (el parámetro se ignoraría).
