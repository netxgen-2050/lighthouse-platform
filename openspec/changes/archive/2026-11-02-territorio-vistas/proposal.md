# Proposal

## Why

Hoy el mapa de `/territorios/lighthouse` abre con los 12 barrios y sus tribus, como si esas comunidades ya existieran. Quien llega hoy necesita ver **dónde puede ayudar ya**: los frentes de trabajo de los equipos (agua, acceso, vivero, papeles). Las tribus por barrio siguen siendo el horizonte.

El 29-oct-2026 Gus aprobó el boceto "Cómo miramos el territorio" (`NS_platform/Documentation/mockup/territorio-vistas-boceto.html`). Propone un mismo lugar con varias miradas, un selector de vistas extensible (como las lentes de la holarquía) y una línea de tiempo que muestra cómo se pasa de equipos semilla a barrios con tribus. La línea de tiempo también es el primer paso de las capas temporales que pidió Don Powa (Backlog D17).

Es el segundo de dos cambios. Usa las fases, los frentes y el "Quiero sumarme" de `tribus-equipos`.

## What Changes

- **Selector de vistas** arriba del mapa: un grupo de botones con `aria-pressed`, nombre accesible "Vista del mapa" y tres vistas.
  - **"Ahora · frentes de trabajo"**, la vista por defecto.
  - **"Plan · zonas"**.
  - **"Visión · tribus por barrio"**.

  Las vistas son un **registro tipado**: sumar una (por ejemplo "Red · otros nodos") es agregar una entrada, sin tocar el resto. La vista y la fase elegidas quedan en la URL (`?vista=…&fase=…`) junto con la selección (`?sel=…`).
- **Línea de tiempo "Etapa"**: tres opciones (fase 0 · hoy, equipos semilla; fase 1 · 2027, primeras comunidades; fase 2 · barrios con tribus). La fase actual está marcada "hoy" en texto. Lo que cambia según la fase:
  - **Ahora**: muestra los frentes vigentes en esa fase. Los de fases siguientes van en la lista como "Más adelante · fase N", sin "Quiero sumarme". Solo se puede sumarse a frentes de la fase actual.
  - **Plan**: el plan ilustrativo no tiene etapas, y se lee "Este plan todavía no dice qué se hace en cada fase (sin dato)".
  - **Visión**: cambia el texto del panel ("En la fase 0 todavía no hay tribus: hay equipos", y así).
- **Vista Ahora**:
  - **En el mapa**: el contorno del Macrolote 7 y el terreno común como contexto, más un sello numerado por cada frente con lugar. Los barrios no se dibujan.
  - **En el panel, sin selección**: "Dónde podés ayudar", con la lista de frentes (botones con el mismo número del sello), el grupo "Sin lugar en el mapa" (Legal y Comunicación) y el grupo "Más adelante".
  - **En el panel, con un frente elegido**: su nombre, el equipo, la necesidad, "Falta: …" (o "sin dato"), "Para: …", el aviso de lugar ilustrativo y el "Quiero sumarme a este frente" de `tribus-equipos`.
- **Vista Plan · zonas**:
  - **En el mapa**: la distribución ilustrativa que ya existe (el común y las 12 zonas de barrio, sin nombres de tribu). Solo el común se puede elegir.
  - **Fuente del plan**: el panel tiene un selector con las fuentes disponibles. Hoy es una sola, "Distribución ilustrativa". Queda lugar para dos más:
    - la **alternativa de permacultura (PR #109)**, que entra como segunda fuente cuando esté en `dev`;
    - el **masterplan de Martín (L4)**, que se lista como "todavía no está".
- **Vista Visión · tribus por barrio**: los 12 barrios con sus tribus, como el mapa de hoy (sellos, estados, ficha del barrio). Todo va marcado "Tribus de ejemplo, a definir", en la leyenda, en el panel y en la ficha del barrio.
- **Leyenda por vista**, siempre en texto. Los frentes se distinguen por número y por forma, no solo por color: frente vigente con borde lleno, frente futuro con borde punteado.
- **Lista equivalente navegable con teclado** en cada vista: lo que se puede elegir en el mapa se puede elegir desde la lista, con el mismo resultado. El contenedor del mapa tiene un nombre accesible que dice la vista y la fase.
- **Chacras de Soluna** (contorno, fincas y "Consultar por este lote"): siguen igual en las tres vistas. Su lista "Fincas disponibles" también.
- **Equipos ↔ mapa**: en la pestaña Equipos de `/tribus`, cada frente con lugar enlaza a `/territorios/lighthouse?vista=ahora&sel=<frente>`.
- Textos es/en. Datos marcados como ejemplo. 390 px sin scroll horizontal. axe sin violaciones en las tres vistas.

**Fuera de alcance:**
- **Vista "Red · otros nodos"** (D28): después. El registro la deja posible.
- **Capas temporales con fechas de inicio y fin, fotos y planos (D17)**: solo se usa la fase con `vigenteEn`, la puerta que deja `tribus-equipos`.
- **Zonas por uso** (silvestre, agrícola, habitada, energía) como en el boceto: no hay datos. Se dibujan cuando llegue el masterplan de Martín (L4) o las zonas A–D (T2).
- **Implementar la alternativa de permacultura**: es el PR #109. Este cambio solo le deja el lugar (ver design §5 por el choque de `?vista=`).
- **Ocultar Soluna en alguna vista** (R33): sigue como hoy.
- **Tomar tareas de un frente** con pacto puntual, y editar frentes desde la pantalla.

## Capabilities

### New Capabilities
- `territorio-vistas`: vistas del mapa del territorio (Ahora, Plan, Visión) con su registro extensible, la línea de tiempo por fase, los frentes de trabajo en el mapa y su lista accesible.

### Modified Capabilities

`territorio-mapa` y `territorio-macrolote` todavía no están archivadas. Este cambio **reemplaza la vista por defecto** de su mapa: lo que hoy se ve al entrar pasa a la vista Visión, y en Plan se ve sin tribus. Sus requisitos se mantienen dentro de la vista Visión (barrios, sellos, ficha del barrio, ficha del común, Soluna). Ver `territorio-vistas`.

## Impact

- **Datos de las vistas:** `lib/territorios/vistas.ts`, nuevo y puro: registro, lectura de la URL, qué elementos se ven y se eligen en cada vista y fase. Lleva sus tests.
- **Pantalla:**
  - `app/territorios/[id]/vitrina-territorio.tsx`: selector, etapa, leyenda y lista por vista;
  - `app/territorios/[id]/mapa-leaflet.tsx`: grupos de capas por vista y sellos de frentes;
  - `app/territorios/[id]/ficha-lateral.tsx`: panel por vista y ficha de frente.
- **Otros:**
  - `app/tribus/page.tsx`: enlace al mapa;
  - `lib/idioma/textos/territorio.ts`;
  - `app/globals.css`: muestras de la leyenda con tokens.
- **e2e:** `e2e/territorio-vistas.spec.ts` nuevo; se ajustan `e2e/territorio-mapa.spec.ts`, `e2e/territorio.spec.ts`, `e2e/idioma-tribus-territorio.spec.ts` y `e2e/accesibilidad.spec.ts`.
- **Sin cambios de base:** no hay dependencias nuevas ni integraciones, y no se guarda nada nuevo en el navegador.
- **Depende de** `tribus-equipos`. Hay que coordinarlo con el **PR #109** (`territorio-alternativa-permacultura`).
