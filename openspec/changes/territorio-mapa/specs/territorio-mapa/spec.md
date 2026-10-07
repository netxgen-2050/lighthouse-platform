# Spec Delta

## Purpose

Mostrar dónde está el territorio y cómo se reparten sus barrios y tribus en un mapa ilustrativo, usable con teclado y con una alternativa en texto, hasta que llegue el GIS real.

## ADDED Requirements

### Requirement: Mapa en la ficha del territorio
La ficha `/territorios/lighthouse` SHALL mostrar un mapa con el contorno del Lighthouse, el núcleo común y los 12 barrios, cada uno en la posición que define la geometría ilustrativa del mock-up v6. El mapa MUST tener un nombre accesible ("Mapa del Lighthouse").

#### Scenario: El mapa aparece con los doce barrios
- **WHEN** una persona abre `/territorios/lighthouse`
- **THEN** ve una región llamada "Mapa del Lighthouse"
- **AND** dentro hay exactamente 12 sellos de barrio, uno por cada barrio del 1 al 12

#### Scenario: Territorio sin geometría
- **WHEN** se abre la ficha de un territorio que no tiene geometría cargada
- **THEN** no se muestra mapa y aparece el texto "Mapa: sin dato"
- **AND** el resto de la ficha se muestra igual

### Requirement: Sellos de barrio navegables
Cada sello de barrio SHALL ser enfocable con Tab y SHALL tener un nombre accesible con el número de barrio, el nombre de la tribu (o "busca tribu") y el estado en texto. Activarlo con Enter o con un clic MUST llevar a `/tribus/[id]` de esa tribu.

#### Scenario: Ir a una tribu con teclado
- **WHEN** una persona llega con Tab al sello del barrio 6 y aprieta Enter
- **THEN** la página navega a `/tribus/valle`

#### Scenario: Barrio vacante
- **WHEN** una persona enfoca el sello de un barrio vacante
- **THEN** el sello muestra "+" y su nombre accesible incluye "Barrio N" y "Busca tribu"

### Requirement: Nada se comunica solo con color
El mapa SHALL incluir una leyenda en texto para tribu activa, en formación, barrio que busca tribu y núcleo común. El estado de cada barrio MUST poder conocerse sin ver colores (nombre accesible y forma del sello).

#### Scenario: Leyenda visible
- **WHEN** se muestra el mapa
- **THEN** debajo aparece una leyenda con los textos "Tribu activa", "En formación", "Busca tribu" y "Núcleo común"

### Requirement: Datos ilustrativos declarados
El mapa SHALL mostrar la nota "Ubicación, forma y barrios ilustrativos, a la espera del GIS de ARQVA" y la atribución "© colaboradores de OpenStreetMap". La geometría MUST estar marcada como ilustrativa en los datos.

#### Scenario: Nota y atribución
- **WHEN** se muestra el mapa
- **THEN** se lee la nota de datos ilustrativos y la atribución de OpenStreetMap

### Requirement: El mapa no depende de la red para funcionar
Si el mapa base no carga, los sellos, el contorno, la leyenda y la nota SHALL seguir visibles y usables.

#### Scenario: Sin mapa base
- **WHEN** las imágenes de `tile.openstreetmap.org` no cargan
- **THEN** los 12 sellos siguen enfocables y llevan a su tribu

### Requirement: Sin lotes ni plata en el mapa
El mapa SHALL NOT mostrar lotes o fincas de BioPueblo, precios, montos ni botones de reservar o comprar.

#### Scenario: Contenido del mapa
- **WHEN** se inspecciona el texto del mapa
- **THEN** no aparecen "Finca", "lote", "USD", "$", "reservar" ni "comprar"

### Requirement: Accesibilidad y estilo
La ficha con el mapa SHALL pasar la auditoría de axe sin violaciones `serious` ni `critical`, MUST seguir teniendo un único `<main>` y los estilos del mapa MUST usar solo tokens del tema.

#### Scenario: Auditoría
- **WHEN** se corre axe sobre `/territorios/lighthouse`
- **THEN** no hay violaciones `serious` ni `critical`
