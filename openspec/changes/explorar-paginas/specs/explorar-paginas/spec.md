# Spec Delta

## Purpose

Parte Explorar en tres páginas propias (Territorio, Barrio Norte, Lotes) con pestañas, y cambia el botón principal de Inicio a "Explorar el territorio", por pedido de Gus del 25-nov-2026. Reemplaza los requisitos "Sección Explorar unificada", "Barra de secciones" y "URL viejas" de `explorar-unificado`.

## ADDED Requirements

### Requirement: Botón principal de Inicio
El botón principal del héroe de `/` SHALL decir "Explorar el territorio" ("Explore the territory" en inglés) y MUST llevar a `/explorar/territorio`. El texto "Ver los lotes" MUST NOT aparecer en ese botón.

#### Scenario: Tocar el botón en español
- **WHEN** una persona abre `/` y toca "Explorar el territorio"
- **THEN** llega a `/explorar/territorio` y ve el mapa del Macrolote 7

#### Scenario: En inglés
- **WHEN** una persona abre `/?lang=en`
- **THEN** el botón principal dice "Explore the territory"

### Requirement: Una página por sección de Explorar
Explorar SHALL tener tres páginas públicas y bilingües, cada una con su URL y su título: `/explorar/territorio` (mapa, capas, estado administrativo y bienes comunes), `/explorar/barrio-norte` (lotes por estado, bien común y panel de la obra solo con sesión) y `/explorar/lotes` (resumen del loteo y lista de lotes con enlace a cada ficha). Cada página MUST mostrar solo su sección. El contenido y los números MUST ser los mismos que mostraba la sección correspondiente de `/explorar`. La aprobación municipal MUST NOT mostrarse como otorgada y un dato que falta MUST mostrarse como "sin dato".

#### Scenario: Página de Lotes
- **WHEN** una persona sin sesión abre `/explorar/lotes`
- **THEN** ve la lista de lotes y no ve el mapa ni los lotes por estado de Barrio Norte

#### Scenario: Página de Barrio Norte con sesión
- **WHEN** una persona con sesión abre `/explorar/barrio-norte`
- **THEN** ve los lotes por estado, el bien común y el panel de la obra

#### Scenario: Barrio Norte sin sesión
- **WHEN** una persona sin sesión abre `/explorar/barrio-norte`
- **THEN** ve los lotes por estado y el bien común, sin montos de la obra

### Requirement: Héroe y pestañas comunes
Las tres páginas SHALL compartir el héroe de Barrio Norte (foto del valle, "Imagen ilustrativa", sello "Prototipo interno · datos de ejemplo" y "venta simulada · aprobación municipal pendiente") y una barra de pestañas pegajosa con Territorio, Barrio Norte y Lotes. Las pestañas MUST ser enlaces entre páginas. La pestaña de la página actual MUST llevar `aria-current="page"` y marcarse con algo más que color. Cada pestaña MUST tener 44 px de alto o más. La barra MUST NOT generar scroll horizontal de la página a 390 px.

#### Scenario: Cambiar de pestaña
- **WHEN** una persona está en `/explorar/territorio` y toca la pestaña "Lotes"
- **THEN** la URL pasa a `/explorar/lotes` y "Lotes" queda con `aria-current="page"`

### Requirement: Entrada a Explorar
`/explorar` SHALL llevar a `/explorar/territorio`. Si la dirección trae un ancla de sección (`#territorio`, `#barrio` o `#lotes`), MUST llevar a la página de esa sección. El destino Explorar del menú MUST marcarse como actual en las tres páginas.

#### Scenario: Tocar Explorar en el menú
- **WHEN** una persona toca Explorar en el menú
- **THEN** llega a `/explorar/territorio` con Explorar marcado

#### Scenario: Enlace con ancla de ayer
- **WHEN** una persona abre `/explorar#lotes`
- **THEN** llega a `/explorar/lotes`

### Requirement: URL viejas a páginas nuevas
`/territorios/lighthouse`, `/barrios/norte` y `/lotes` SHALL redirigir a `/explorar/territorio`, `/explorar/barrio-norte` y `/explorar/lotes`, conservando los parámetros `vista`, `fase` y `sel`. Las fichas `/lotes/[id]` y `/lotes/hibrido` MUST seguir en su URL. Los enlaces internos de la app MUST apuntar a las páginas nuevas, sin ancla.

#### Scenario: Enlace viejo al mapa
- **WHEN** una persona abre `/territorios/lighthouse?vista=ahora&sel=x`
- **THEN** llega a `/explorar/territorio?vista=ahora&sel=x` con el mapa en la vista "ahora" y `x` seleccionado

#### Scenario: Volver desde una ficha
- **WHEN** una persona está en la ficha de un lote y toca el enlace para volver a la lista
- **THEN** llega a `/explorar/lotes`
