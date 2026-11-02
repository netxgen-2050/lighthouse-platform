# Design

## Context

- **`vitrina-territorio.tsx` (cliente):**
  - tiene la selección (`?sel=`, con `replaceState`);
  - arma la leyenda de tres grupos (Lighthouse, Soluna, Lugares);
  - arma la lista "Elegir en el mapa" (barrios, común, fincas disponibles);
  - arma la ficha lateral (`ficha-lateral.tsx`, región viva).
- **`mapa-leaflet.tsx`:**
  - crea el mapa una sola vez por idioma;
  - dibuja todo con canvas: contexto, Soluna, fincas, macrolote, común y barrios;
  - pone marcadores `divIcon` enfocables (barrios, común, lugares), con `role="button"`, `aria-label` y Enter o Espacio;
  - toma los colores de los tokens leyendo `getComputedStyle`.
- **De `tribus-equipos`:** usa `FASES`, `FASE_ACTUAL`, `vigenteEn`, `frentesBilingues()` (con `lugar: Punto | null`) y `components/sumarme-equipo.tsx`.
- **El PR #109** (abierto, sin integrar) suma su propio selector "Distribución ilustrativa | Alternativa: masterplan de permacultura (borrador)", con `?vista=permacultura`.

## Goals / Non-Goals

**Goals:**
- registro de vistas;
- tres vistas;
- etapa por fase;
- frentes en el mapa con lista y panel;
- URL compartible;
- lugar para las fuentes del plan.

**Non-Goals:**
- vista Red;
- capas con fechas;
- zonas por uso;
- implementar la permacultura;
- tocar Soluna.

## Decisions

### 1. Registro de vistas (`lib/territorios/vistas.ts`, puro)

```ts
export type VistaId = "ahora" | "plan" | "vision";
export type Capa = "contexto" | "soluna" | "macrolote" | "comun" | "barrios" | "sellos-barrio" | "lugares" | "frentes";
export type Vista = {
  id: VistaId;
                                    // el nombre sale del id: tx.vistas[id].nombre (no hay campo propio)
  capas: readonly Capa[];           // qué grupos de Leaflet se ven
  elegibles(fase: Fase): string[];  // ids que se pueden elegir (sellos y lista)
};
export const VISTAS: readonly Vista[];   // orden de la barra: ahora, plan, vision
export const VISTA_POR_DEFECTO: VistaId = "ahora";
export function leerVista(x: string | null): VistaId;  // desconocida → "ahora"
export function leerFase(x: string | null): Fase;      // inválida → FASE_ACTUAL
export function numeroDeFrente(id: string): number | null; // 1..n por orden de frentesBilingues() con lugar; estable entre fases
export function frentesEn(fase: Fase): { conLugar: Frente[]; sinLugar: Frente[]; despues: Frente[] };
```

**Capas de cada vista:**

| Vista | Capas | Elegibles |
|---|---|---|
| Ahora | contexto, soluna, macrolote, comun, frentes, lugares | frentes vigentes con lugar, fincas, lugares |
| Plan | contexto, soluna, macrolote, comun, barrios (neutros), lugares | común, fincas, lugares |
| Visión | las de hoy (contexto, soluna, macrolote, comun, barrios por estado, sellos-barrio, lugares) | barrios, común, fincas, lugares |

- **Un número por frente, fijo entre fases.** El número del sello es el orden del frente entre los que tienen lugar, así que el 5 es siempre "Primer obrador". Si el número cambiara con la fase, la persona perdería la referencia entre el mapa y la lista.
- **Una selección que no es elegible se limpia.** Pasa al cambiar de vista, al cambiar a una fase donde el elemento ya no está, o con un `?sel=` de otra vista.
<!-- arquitecto: la regla de compatibilidad solo vale sin ?vista= -->
- **Cuándo un `?sel=` cambia la vista.** Solo cuando la URL **no** trae `vista`: si el `sel` no es elegible en Ahora, se busca en las otras vistas en el orden de `VISTAS` y se abre la primera donde sí lo sea (con la fase pedida). Si la URL **trae** `vista`, se respeta la vista y el `sel` que no es elegible se limpia. Así `?vista=ahora&sel=barrio-6` abre Ahora sin selección, y un enlace explícito nunca lleva a otra vista. Lo que es elegible en todas (común, fincas, lugares) se queda en la vista pedida o en Ahora.
- **`leerVista` devuelve solo la vista.** La fuente del plan se lee aparte con `leerFuentePlan(params) → FuentePlanId` (desconocida o no disponible → `"ilustrativa"`); el alias viejo `?vista=permacultura` lo resuelven las dos funciones juntas (vista `plan`, fuente `permacultura` si está disponible).
- **La vista Red (D28)** se agrega después como una entrada más con `capas: ["red"]`. Va a ser otro mapa a otra escala, y el registro no lo impide.
- **Paneles y leyendas:** son de React y se registran en `app/territorios/[id]/vistas/` (`panel-ahora.tsx`, `panel-plan.tsx`, `panel-vision.tsx`) con un `Record<VistaId, …>`. Es el mismo patrón que `lib/gobernanza/lentes.ts` con `app/fogon/gobernanza/lentes/`.

### 2. Mapa: grupos de capas, sin rehacer el mapa

- **Grupos de capas.** `mapa-leaflet.tsx` crea un `L.layerGroup()` por `Capa` y recibe `vista` y `fase` como props. Un `useEffect([vista, fase])` agrega y quita los grupos según `VISTAS`. El mapa no se destruye: el encuadre y el zoom se mantienen.
- **Un sello oculto no se puede enfocar.** Al quitar un grupo, Leaflet saca sus marcadores del DOM, así que un sello oculto deja de existir y no recibe Tab.
- **Barrios neutros en Plan.** Es otra capa (`barrios-plan`, interna) con estilo `faint` y borde punteado, sin sellos ni clic. Así el estilo por estado de Visión no se toca.
- **Sellos de frente** (`mapa-sello mapa-sello-frente`):
  - **qué muestran:** el número;
  - **forma:** círculo de 32 px con borde lleno `deep` si el frente está vigente;
  - **`aria-label`:** "Frente 1: Agua y cuenca · equipo Agua" (`tx.marcador.frente(n, nombre, equipo)`).
  - **Frentes de fases siguientes:** no se dibujan en el mapa, porque un sello atenuado que no se puede elegir confunde con el teclado. Solo van en la lista "Más adelante".
  <!-- arquitecto: borde punteado = vigente en la fase elegida pero todavía no hoy; antes el design decía borde lleno y la leyenda mostraba un símbolo que nunca aparecía -->
  - **Borde lleno o punteado.** Con una fase futura elegida, un frente con `desde > FASE_ACTUAL` (por ejemplo "Primer obrador" en fase 1) se dibuja y se elige, pero con borde punteado (`mapa-sello-frente-despues`), su `aria-label` suma "· más adelante, fase N" y el panel dice "Más adelante · fase N" sin "Quiero sumarme". Borde lleno solo para los frentes vigentes hoy. La muestra punteada de la leyenda aparece solo cuando hay alguno dibujado, para que la leyenda no nombre un símbolo que no está en el mapa. La función pura `esDeHoy(frente)` (`desde <= FASE_ACTUAL`, vía `vigenteEn`) decide las dos cosas: borde y "Quiero sumarme".
  - **Ojo, el boceto es distinto:** ahí los frentes que vienen se ven tenues en el mapa. Acá se cambia por la lista "Más adelante" para no tener elementos que no responden.
- **Nombre accesible del mapa.** El contenedor del mapa lleva `role="region"` y `aria-label={tx.mapa.aria(vista, fase)}`, por ejemplo "Mapa del Macrolote 7 · vista Ahora · fase 0 (hoy). La lista equivalente está al lado". Se actualiza con la vista y la fase.
- **Colores.** Los nuevos (`deep`, `faint`, `violet` para el común) salen de `token()`. Las muestras de la leyenda son clases en `app/globals.css` con `var(--color-…)`.

### 3. Etapa: radios, no un deslizador

- **Qué es:** un `<fieldset>` con `<legend>` "Etapa" y tres `<input type="radio">` en fila, que se apilan a 390 px. Cada etiqueta es "Fase 0 · hoy, equipos semilla" y así; a la actual se le agrega " (hoy)". Las flechas mueven entre opciones, como en cualquier grupo de radios.
- **Por qué no el deslizador del boceto:** el `range` tiene sus tres rótulos fuera del control. A 390 px no entran, y el lector de pantalla lee "1" en vez de la fase. Con radios se lee el nombre completo, que es más claro.
- **URL.** `?fase=` se escribe con `replaceState`, como `?sel=` y `?vista=`. La fase actual no se escribe, para que la URL quede limpia.
- **Una sola lectura de la URL.** `vitrina-territorio.tsx` junta `vista`, `fase` y `sel` en un solo `useEffect` de entrada, que lee `URLSearchParams` y valida con `leerVista`, `leerFase` y `elegibles`. Escribe los tres juntos, con el cuidado de hoy de no pisar un `?sel=` recién llegado.

### 4. Panel y lista por vista

- **La ficha lateral** sigue siendo una sola región viva. Su contenido sin selección depende de la vista:
  - Ahora: "Dónde podés ayudar";
  - Plan: fuentes y aviso de fases;
  - Visión: el resumen y los conteos de hoy, más "Tribus de ejemplo, a definir" y el texto de la fase.

  Con selección, suma la ficha de **frente**: nombre, equipo, necesidad, falta, para cuándo, aviso ilustrativo y `SumarmeEquipo` o "Más adelante · fase N".
- **La lista "Elegir en el mapa"** sale de `elegibles(fase)`:
  - en Ahora, los frentes vigentes con su número;
  - en Plan, el común;
  - en Visión, los barrios y el común, como hoy.

  Las fincas disponibles (desplegable) y los lugares siguen en las tres vistas. En Ahora, los frentes del panel son la lista principal y la sección "Elegir en el mapa" muestra solo lo demás (común no, fincas sí), para no repetir los frentes dos veces con el teclado.
- **La leyenda** es por vista. El grupo de Soluna y el de Lugares se repiten en las tres. El grupo del Lighthouse cambia:
  - Ahora: "Frente de trabajo (número)", "Frente que viene (borde punteado)" y "Terreno común";
  - Plan: "Zona de barrio (ilustrativa)" y "Terreno común";
  - Visión: los cuatro estados de hoy, con el título "Tribus de ejemplo, a definir".

### 5. Fuentes del plan y el PR #109

- **Registro de fuentes** en `vistas.ts`:

  ```ts
  type FuentePlan = { id: "ilustrativa" | "permacultura" | "martin"; estado: "disponible" | "pendiente" }
  ```

  Hoy hay dos entradas: `ilustrativa` (disponible) y `martin` (pendiente). La lista del panel es un grupo de botones `aria-pressed` con las disponibles. Las pendientes van como texto "Masterplan de Martín: todavía no está".
  <!-- arquitecto: versión más chica; un grupo de un solo botón no elige nada -->
  - **Con una sola fuente disponible** (hoy) no se dibuja el grupo de botones: se lee "Fuente: Distribución ilustrativa" en texto, más la línea de Martín. El grupo `aria-pressed` aparece recién con dos o más disponibles (cuando entre el PR #109). El registro y `leerFuentePlan` sí se hacen ya.
- **Choque de `?vista=`:**
  - **Si este cambio entra primero:** el PR #109 tiene que rebasarse. Su alternativa pasa a ser la fuente `permacultura` de la vista Plan (`?vista=plan&plan=permacultura`), y su selector propio desaparece. Para no romper enlaces ya compartidos, `leerVista("permacultura")` devuelve `"plan"` y la fuente `permacultura` si existe; si no existe, devuelve `"plan"` con la ilustrativa.
  - **Si el PR #109 entra primero:** este cambio absorbe su selector en la lista de fuentes, con el mismo mapeo.
  - **En los dos casos** queda **un** selector de vistas y, dentro de Plan, **una** lista de fuentes.
- **Lo que esta vista no hace:** las zonas por uso (silvestre, agrícola, habitada, energía) del boceto no se dibujan, porque no hay datos. Cuando lleguen L4 o T2, son otra fuente.

### 6. Enlace desde Equipos

`app/tribus/page.tsx` (de `tribus-equipos`): en cada frente con lugar, el texto "En el mapa del Lighthouse (ilustrativo)" pasa a ser un enlace "Ver en el mapa" a `/territorios/lighthouse?vista=ahora&sel=<id>`.

## Risks / Trade-offs

- **[e2e existentes que eligen el barrio 6 al entrar]** → pasan a abrir `?vista=vision`. Hay una tarea explícita para eso. Así se ve que el comportamiento de Visión es el de hoy.
- **[`mapa-leaflet.tsx` crece mucho]** → los grupos y estilos se separan a `capas.ts` (cliente, sin JSX). La lógica de qué se ve queda pura en `vistas.ts` y se prueba sin navegador.
- **[Puntos de frentes inventados sobre imagen satelital real]** → aviso "Lugar ilustrativo" en el panel y en la leyenda. Los puntos están en datos, para cambiarlos sin tocar la pantalla.
- **[Cambiar de vista con el foco en un sello que desaparece]** → el foco pasa al botón de la vista elegida, que es donde está la persona.
- **[Conflicto de merge con PR #109]** → design §5. Gus decide el orden.

## Migration Plan

Sin base ni claves nuevas. Los enlaces viejos `?sel=barrio-6` siguen funcionando: si el `sel` no es elegible en Ahora pero sí en Visión, se abre Visión. Es la única regla de compatibilidad y tiene un test. Para revertir, se vuelve al componente anterior; los datos de `tribus-equipos` quedan.

## Open Questions

- ¿Los frentes que vienen se ven tenues en el mapa, como en el boceto, o solo en la lista, como propone este design?
- ¿Soluna se sigue viendo en Ahora? (R33)
- ¿Qué entra primero, este cambio o el PR #109?
