# Spec Delta

## Purpose

Que en el mapa del territorio la persona pueda mostrar u ocultar cada grupo (Lighthouse, Chacras de Soluna, lugares de interés) y compartir esa vista, sin perder la selección, la ficha ni el aviso del estado administrativo.

## ADDED Requirements

### Requirement: Casilla por grupo en la leyenda
La leyenda del mapa SHALL mostrar, para cada grupo (Lighthouse · Macrolote 7, Chacras de Soluna y Lugares de interés), una casilla nativa cuyo nombre accesible es "Mostrar" seguido del nombre del grupo. Al entrar sin parámetro `ocultar`, todas MUST estar marcadas.

#### Scenario: Entrar al territorio
- **WHEN** una persona abre `/territorios/lighthouse`
- **THEN** ve tres casillas marcadas, una por grupo, y el mapa con los tres grupos

### Requirement: Ocultar un grupo
Desmarcar la casilla de un grupo SHALL sacar del mapa sus polígonos y sus sellos, y los sellos ocultos MUST NOT recibir foco de teclado. Las zonas de contexto y la imagen satelital SHALL quedar siempre. Volver a marcarla MUST mostrar el grupo como estaba.

#### Scenario: Ocultar los lugares
- **WHEN** la persona desmarca "Mostrar Lugares de interés"
- **THEN** no queda ningún sello de lugar en el mapa y Tab no pasa por ninguno

#### Scenario: Ocultar el Lighthouse
- **WHEN** la persona desmarca "Mostrar Lighthouse · Macrolote 7"
- **THEN** no quedan sellos de barrios ni del terreno común en el mapa, y las fincas de Soluna siguen

#### Scenario: Volver a mostrar
- **WHEN** la persona vuelve a marcar una casilla
- **THEN** el grupo vuelve a verse con sus sellos y su leyenda

### Requirement: La selección sigue a las capas
Si lo elegido pertenece a un grupo que se oculta, la plataforma SHALL deseleccionarlo y la ficha MUST volver al resumen. Si la persona elige desde "Elegir en el mapa" un elemento de un grupo oculto, el grupo SHALL volver a mostrarse y el elemento quedar elegido. La lista "Elegir en el mapa" MUST seguir completa con cualquier combinación de capas.

#### Scenario: Ocultar lo elegido
- **WHEN** la persona eligió el Barrio 6 y desmarca "Mostrar Lighthouse · Macrolote 7"
- **THEN** la ficha muestra el resumen del territorio y la URL ya no tiene `sel`

#### Scenario: Elegir algo oculto desde la lista
- **WHEN** Soluna está oculta y la persona elige una finca desde "Fincas disponibles de Soluna"
- **THEN** la casilla de Soluna vuelve a estar marcada, la finca se ve resaltada y la ficha muestra esa finca

### Requirement: Grupos ocultos en el enlace
Los grupos ocultos SHALL quedar en la URL como `ocultar` con sus claves separadas por coma (`lighthouse`, `soluna`, `lugares`), sin sumar entradas al historial; sin grupos ocultos el parámetro MUST NOT estar. Al entrar con `ocultar`, la plataforma SHALL ocultar esos grupos e ignorar las claves desconocidas. Si `sel` apunta a un elemento de un grupo oculto, gana `sel`: ese grupo se muestra y se quita de `ocultar`.

#### Scenario: Compartir sin Soluna
- **WHEN** alguien abre `/territorios/lighthouse?ocultar=soluna`
- **THEN** la casilla de Soluna está desmarcada, no se ven las fincas y las otras dos casillas están marcadas

#### Scenario: Clave desconocida
- **WHEN** alguien abre `/territorios/lighthouse?ocultar=soluna,otra`
- **THEN** solo Soluna está oculta y no hay ningún error

#### Scenario: Selección en un grupo oculto
- **WHEN** alguien abre `/territorios/lighthouse?ocultar=lighthouse&sel=barrio-6`
- **THEN** el Barrio 6 está elegido, la casilla del Lighthouse está marcada y la URL ya no tiene `ocultar`

#### Scenario: Volver a mostrar todo
- **WHEN** la persona vuelve a marcar el único grupo oculto
- **THEN** la URL ya no tiene el parámetro `ocultar`

### Requirement: Aviso con todo oculto
Con los tres grupos ocultos, la plataforma SHALL mostrar junto a la leyenda el aviso "No hay capas a la vista. Marcá alguna en la leyenda.", anunciado como estado para los lectores de pantalla, y MUST quitarlo apenas se marque una casilla.

#### Scenario: Ocultar todo
- **WHEN** la persona desmarca las tres casillas
- **THEN** ve el aviso "No hay capas a la vista. Marcá alguna en la leyenda."

### Requirement: El estado administrativo no se oculta
El aviso del estado administrativo del loteo, las notas de distribución ilustrativa y de la imagen satelital SHALL seguir visibles con cualquier combinación de capas.

#### Scenario: Soluna oculta
- **WHEN** la persona oculta Chacras de Soluna
- **THEN** sigue viendo el aviso del estado administrativo del loteo

### Requirement: Idioma y accesibilidad de las capas
Las casillas y el aviso SHALL estar en inglés cuando la plataforma está en inglés. Todo SHALL usarse con teclado, el estado de cada grupo MUST leerse en la casilla (no solo por color) y la página MUST pasar axe sin violaciones serias ni críticas con cualquier combinación de capas.

#### Scenario: En inglés
- **WHEN** la plataforma está en inglés y la persona abre el territorio
- **THEN** las casillas dicen "Show" seguido del nombre del grupo en inglés

#### Scenario: Teclado y auditoría
- **WHEN** la persona llega con Tab a una casilla, la desmarca con Espacio y se audita la página con axe
- **THEN** el grupo se oculta y no hay violaciones serias ni críticas
