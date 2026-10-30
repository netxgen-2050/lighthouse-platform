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
- Guardar en la dirección la selección de una persona, la decisión elegida en la lente o "Sumar lo de adentro": solo holón y lente.

## Decisions

### 1. `holonId` en cada decisión (dato, no derivado)
`Decision` suma `holonId: string | null` (obligatorio en el tipo; `null` solo para `ambito: "fideicomiso"`). Valores: `huerta` → `semilla-1` (Huerta intensiva, Semilla Viva; ver pregunta abierta), `presupuesto` → `null`, `facilitador` → `valle`, `bomba` y `animales` → `lighthouse`, `siembra` → `valle-0`, `cisterna` → `valle`, `consejo-bomba` → `consejo`, `regalia` → `lighthouse`, `cisterna-compartida` → `consejo`; `copiaParaElConsejo` pone `consejo`. `ejemplos.ts` cambia la huerta de `null` a `semilla-1`.
- **Por qué dato y no derivarlo de `ambito`/`tribuId`:** el ámbito no alcanza para saber el círculo (`siembra` es "circulo" pero no dice cuál) y adivinarlo por el texto de `donde` es frágil.
- **Tests** (`lib/fogon`): todo `holonId` no nulo existe en `construirHolarquia("es")`; solo el fideicomiso tiene `null`; si la decisión tiene propuesta y la propuesta tiene `holonId`, coinciden; `ambito` es coherente con el tipo del holón (circulo ↔ nodo círculo, tribu ↔ tribu, consejo ↔ consejo, comun ↔ común).
- El texto `donde` de la huerta pasa a "Huerta intensiva · Semilla Viva" (es/en), con `tribu: "Semilla Viva"`.

### 2. Grupos de la lista adyacente: función pura
`decisionesDelHolon(raiz, holonId, estado)` en `lib/fogon/estado.ts` (reemplaza a `filtrar`, que se borra junto con sus tests de filtro) devuelve `{ aca, pasa, adentro, fideicomiso }`:
- `aca`: `holonId === H`.
- `pasa`: `holonId !== H` y su `caminoDe(d)` incluye `H` y (`tipo !== "queda"` o `camino[0] === H`). Así "se decide abajo" no aparece como que sube, y lo que nace en un círculo (la regalía) sí aparece ahí.
- `adentro`: el `holonId` es descendiente estricto de `H` y no está en `aca` ni en `pasa`, con el nombre del holón y de su tribu para el texto "en {círculo} · {tribu}".
- `fideicomiso`: solo cuando `H` es el común.
- Las copias llevadas al consejo salen de `decisionesVisibles(estado)`, como hoy.
- **Alternativa descartada:** listar en el común todas las decisiones de adentro siempre. Con muchas tribus (backlog D5) sería otra vez la lista larga; por eso queda detrás del botón.
- Tests con los escenarios de la spec (Valle Solar, Cuidado de la tierra, Tokenomics, común, Compost, copia al consejo).

### 3. Componentes: la holarquía recibe una ranura
- `fogon-cliente.tsx` se parte: `tarjeta-decision.tsx` (la tarjeta actual, sin cambios de comportamiento, con su foco y anuncios) y `propuestas-del-holon.tsx` (encabezado "Propuestas en {nombre}", grupos con `<h3>`, botón "Sumar lo de adentro" con `aria-expanded`/`aria-controls`, mensajes vacíos). El estado del Fogón (votos, almacenamiento, `useParticipacion`, condición) sube a un hook `usarFogon()` para que lo comparta la lista.
- `HolarquiaCliente` suma una prop opcional `adyacente?: (foco: NodoH, raiz: NodoH) => ReactNode`. Si viene, la columna derecha muestra primero esa sección y después el panel de la lente; si no, queda como hoy (los tests de la holarquía sin Fogón siguen valiendo).
- Layout: en ≥ 860 px, dos columnas (dibujo y leyenda | propuestas del holón y panel). En < 860 px una sola columna: dibujo, propuestas, panel, lista accesible. El `aria-live="polite"` sigue solo en el panel; la sección de propuestas no es una región viva (cambia con cada zoom y sería ruido), pero su encabezado nombra el holón.
- `app/fogon/page.tsx` arma la página: avisos, sobretítulo "Fogón", `h1` "Cómo decidimos", intro, `HolarquiaCliente` con `adyacente`, la sección "capas" que hoy está en `/fogon/gobernanza`, y "Otras herramientas" (consultas y simulador).
- `app/fogon/gobernanza/page.tsx` pasa a `redirect` (como el simulador), copiando `holon` y `lente` de `searchParams`.

### 4. El lugar en la dirección
- `HolarquiaCliente` lee `holon` y `lente` con `useSearchParams()` al montar y escribe con `router.replace(`?${params}`, { scroll: false })` en cada cambio de foco o lente. `replace` y no `push`: un zoom no es una página nueva, y el botón "atrás" del navegador no tiene que deshacer zooms de a uno.
- Un id que no está en el árbol (`buscarNodo` da `null`) o una lente que no está en el registro se ignoran (común y primera lente); no se reescribe la dirección hasta que la persona cambie algo.
- `page.tsx` es de servidor: también lee `searchParams` y pasa `focoInicial`/`lenteInicial` al cliente, así el primer render ya muestra el holón y no hay salto al hidratar. `useSearchParams` va dentro de un `<Suspense>` para que `pnpm build` no falle.
- Los nombres de los parámetros (`holon`, `lente`, `desde`) no se traducen; `?lang=en` convive con ellos.

### 5. La propuesta en contexto
- "Abrir la propuesta" (tarjeta y panel de la lente Decisiones) arma `/fogon/propuestas/<id>?desde=<focoId>` y suma `&lente=<id>` si no es la primera.
- `propuesta-cliente.tsx`: las migas se arman con `caminoHasta(raiz, propuesta.holonId)` (la `raiz` se construye en `page.tsx` del servidor, como en la holarquía) más el título; cada holón es un `Link` a `/fogon?holon=<id>`; la última miga lleva `aria-current="page"`. Para la visita sin cuenta (A2) se muestran los holones sin el título, como hoy se oculta el título.
- Tarjeta "Dónde se decide": nombre y tipo del holón, sus "Decide sobre", y `caminoDe(decision)` en texto con nombres (`caminoEnArbol` filtra ids rotos). Reusa los textos de tipo de camino de la lente Decisiones.
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
- Se revisa el ⚖ `adhesiongobernanza` y `adhesion`: el texto de `adhesion` ya dice "la adhesión vale desde que adherís"; si algún texto de Lighthouse VRN dice que alguien acepta, se ajusta (con `borrador: true` si es nuevo).

## Risks / Trade-offs

- [La columna derecha queda larga: propuestas + panel] → las propuestas van primero (es lo que pidió Gus) y el panel sigue debajo; en pantallas anchas la columna tiene su propio scroll natural de página, sin `overflow` interno (que rompería el teclado y la lupa).
- [Los e2e que usan `/fogon/gobernanza` o los filtros se rompen] → se actualizan en el mismo cambio; la redirección mantiene vivos los enlaces guardados.
- [Lighthouse como "miembro" lo hace aparecer en Pactos y Semillas (`comunidadesDondeEsMiembro`)] → ya pasaba al simular la aceptación; se revisa con `e2e/membresia.spec.ts` y los tests de pactos que lean membresía.
- [Rótulos de nietos en celular] → con el umbral de 22 px casi no aparecen a 390 px; está bien: la spec pide nombres "cuando hay lugar".
- [`router.replace` en cada zoom puede re-renderizar el servidor] → `replace` con la misma ruta y solo cambio de query en un cliente que no depende de `searchParams` del servidor después del primer render; si el implementador ve pedidos al servidor por zoom, usar `window.history.replaceState` (Next 15 lo integra con `useSearchParams`).
- [Cambiar `donde` de la huerta toca un dato del mock-up v6] → queda como pregunta abierta para Gus; el resto del cambio no depende de esa respuesta (si dice otra cosa, se cambia un `holonId` y un texto).

## Migration Plan

Sin datos en servidor. En el navegador, `lighthouse: "pedido"` se lee como miembro sin reescribirse. Volver atrás es revertir el PR: los enlaces `/fogon?holon=…` seguirían abriendo `/fogon` (el parámetro se ignoraría).
