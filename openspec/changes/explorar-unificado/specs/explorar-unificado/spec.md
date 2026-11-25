# Spec Delta

## Purpose

Une Territorio, Barrio Norte y Lotes en una sola sección Explorar con el diseño de Barrio Norte, y llama Inicio a la portada, por pedido de Gus del 24-nov-2026.

## ADDED Requirements

### Requirement: Destino Inicio
El destino del menú que apunta a `/` SHALL llamarse "Inicio" ("Home" en inglés) y MUST marcarse como actual solo en `/`.

#### Scenario: Portada
- **WHEN** una persona abre `/`
- **THEN** el menú muestra "Inicio" marcado como actual

#### Scenario: Lotes no marca Inicio
- **WHEN** una persona abre `/lotes/hibrido`
- **THEN** el menú marca "Explorar", no "Inicio"

### Requirement: Orden del menú
Los destinos principales SHALL ser, en este orden y mostrando solo los que existen: Inicio, Explorar, Participa, Bien común, Invertir, Sumarte, Mi tierra. La subnavegación de Explorar (Territorio, Barrios, Lotes, Comunidades) MUST NOT aparecer en ninguna página.

#### Scenario: Rail
- **WHEN** una persona abre la app a 1280 px
- **THEN** el rail muestra Inicio, Explorar, Bien común, Invertir, Sumarte y Mi tierra en ese orden (y Participa cuando exista su página)

### Requirement: Sección Explorar unificada
`/explorar` SHALL ser una página pública y bilingüe con un héroe igual al de Barrio Norte (foto del valle a sangre, título encima, "Imagen ilustrativa", sello "Prototipo interno · datos de ejemplo" y "venta simulada · aprobación municipal pendiente") y tres secciones en este orden: Territorio (el mapa del Macrolote 7 con sus capas y avisos de loteo), Barrio Norte (lotes por estado, lo que va al bien común y el panel de la obra solo con sesión) y Lotes (la lista con enlaces a cada ficha). La aprobación municipal MUST NOT mostrarse como otorgada y un dato que falta MUST mostrarse como "sin dato".

#### Scenario: Abrir Explorar
- **WHEN** una persona sin sesión abre `/explorar`
- **THEN** ve el héroe con el sello y, al bajar, las secciones Territorio, Barrio Norte y Lotes, sin montos de la obra

#### Scenario: Con sesión
- **WHEN** una persona con sesión abre `/explorar#barrio`
- **THEN** ve el panel de la obra del barrio

### Requirement: Barra de secciones
`/explorar` SHALL tener una barra de secciones pegajosa con enlaces a `#territorio`, `#barrio` y `#lotes`; el enlace de la sección visible MUST llevar `aria-current="location"` y los enlaces MUST tener 44 px de alto o más.

#### Scenario: Saltar a Lotes
- **WHEN** la persona toca "Lotes" en la barra de secciones
- **THEN** la página baja a la lista de lotes y "Lotes" queda marcado

### Requirement: URL viejas
`/territorios/lighthouse`, `/barrios/norte` y `/lotes` SHALL redirigir a `/explorar#territorio`, `/explorar#barrio` y `/explorar#lotes`, conservando los parámetros `vista`, `fase` y `sel` del mapa. Las fichas `/lotes/[id]` y `/lotes/hibrido` MUST seguir en su URL.

#### Scenario: Enlace viejo al mapa
- **WHEN** una persona abre `/territorios/lighthouse?vista=ahora&sel=x`
- **THEN** llega a `/explorar` con el mapa en la vista "ahora" y el elemento `x` seleccionado

#### Scenario: Ficha de un lote
- **WHEN** una persona abre `/lotes/hibrido`
- **THEN** ve la ficha como antes, sin redirección
