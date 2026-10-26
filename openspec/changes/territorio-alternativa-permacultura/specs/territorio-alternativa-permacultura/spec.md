# Spec Delta

## Purpose

Mostrar, como alternativa a la distribución ilustrativa de barrios, un borrador de masterplan de permacultura del Macrolote 7 leído desde el agua y el relieve, dejando claro que es preliminar.

## ADDED Requirements

### Requirement: Selector de vista
La ficha `/territorios/lighthouse` SHALL mostrar, arriba del mapa, un grupo de dos botones con estado presionado ("Distribución ilustrativa" y "Alternativa: masterplan de permacultura (borrador)"). La vista por defecto MUST ser la distribución ilustrativa. La vista elegida SHALL quedar en la URL como `?vista=permacultura`, y al abrir un enlace con ese parámetro MUST mostrarse la alternativa.

#### Scenario: Cambiar a la alternativa
- **WHEN** una persona abre `/territorios/lighthouse` y aprieta "Alternativa: masterplan de permacultura (borrador)"
- **THEN** ese botón queda presionado, la URL incluye `vista=permacultura`
- **AND** dejan de verse los 12 sellos de barrio y el sello del terreno común

#### Scenario: Enlace compartido
- **WHEN** una persona abre `/territorios/lighthouse?vista=permacultura`
- **THEN** ve la alternativa sin tocar nada

#### Scenario: Volver a la distribución
- **WHEN** en la alternativa aprieta "Distribución ilustrativa"
- **THEN** vuelven los 12 sellos de barrio y la URL deja de tener `vista`

### Requirement: Capas de la alternativa
En la vista de permacultura el mapa SHALL dibujar todos los elementos de `lib/territorios/alternativa-permacultura.json` dentro del contorno del Macrolote 7. La primera hectárea, el núcleo común y los 4 clusters MUST tener un sello enfocable con Tab cuyo nombre accesible empieza con su nombre. Enter o un clic MUST elegirlo.

#### Scenario: Sellos de la alternativa
- **WHEN** se muestra la alternativa
- **THEN** hay sellos con nombre accesible "Primera hectárea…", "Núcleo común…" y "Cluster 1…" a "Cluster 4…"

#### Scenario: Elegir con teclado
- **WHEN** una persona llega con Tab al sello de la primera hectárea y aprieta Enter
- **THEN** la ficha lateral muestra "Primera hectárea · área foco", su superficie y su descripción

### Requirement: Leyenda y lista en texto
La alternativa SHALL tener una leyenda en texto con seis grupos: Agua y bienes comunes, Producción, Asentamiento, Implementación, Monte silvestre, y Caminos, sectores y obras. Cada grupo MUST distinguirse también por forma o trazo, no solo por color. La lista "Elegir en el mapa" SHALL ofrecer un botón por elemento, agrupado de la misma manera.

#### Scenario: Elegir desde la lista
- **WHEN** una persona aprieta "Columna verde del cañadón" en la lista
- **THEN** la ficha muestra ese elemento con su zona ("Zona 4–5 · bien común") y su superficie en hectáreas

### Requirement: Resumen y avisos de borrador
Sin selección, la ficha de la alternativa SHALL mostrar:
- la proporción ecológica calculada de los datos (conservación sobre el total del macrolote, en %);
- la superficie de la cuenca del cañadón;
- el método (MDE Copernicus GLO-30, 30 m);
- el aviso "Borrador del Agente de Regeneración · preliminar e ilustrativo";
- el aviso de que hacen falta relevamiento, observación del sitio y diseño humano.

Los clusters MUST NOT ofrecer consultar, reservar ni comprar.

#### Scenario: Resumen de la alternativa
- **WHEN** se muestra la alternativa sin selección
- **THEN** la ficha dice "Proporción ecológica" con un porcentaje mayor o igual a 50 %
- **AND** se leen los dos avisos de borrador

#### Scenario: Un cluster no es un lote
- **WHEN** una persona elige "Cluster 1"
- **THEN** la ficha no tiene botones de consultar, reservar ni comprar

### Requirement: Dato faltante y bilingüe
Un elemento sin superficie SHALL mostrar "sin dato", nunca 0. Todos los textos de la alternativa MUST existir en español y en inglés.

#### Scenario: En inglés
- **WHEN** la persona eligió inglés y abre la alternativa
- **THEN** el botón dice "Alternative: permaculture masterplan (draft)" y la leyenda y la ficha están en inglés

### Requirement: Sin teselas
Sin el mapa base, los polígonos, los sellos, la leyenda, la lista y la ficha de la alternativa SHALL seguir funcionando.

#### Scenario: Teselas bloqueadas
- **WHEN** las teselas satelitales no cargan
- **THEN** se puede elegir la primera hectárea con teclado y la ficha la muestra
