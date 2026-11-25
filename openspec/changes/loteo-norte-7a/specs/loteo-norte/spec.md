# Spec Delta

## Purpose

Mostrar los lotes del sector norte de Lighthouse VRN en el mapa y en una lista equivalente, marcados como provisorios, con datos que se pueden reemplazar por el plano real sin tocar pantallas.

## ADDED Requirements

### Requirement: Capa de lotes
La vista "Lotes" SHALL dibujar el sector norte, cada lote, el espacio de uso común, la producción y el camino, y encuadrar el mapa en los lotes al entrar. La cantidad de lotes, sus superficies y la superficie del sector MUST salir de los datos, no escribirse en las pantallas.

#### Scenario: Ver el loteo
- **WHEN** una persona abre `/territorios/lighthouse`
- **THEN** ve el sector norte con sus lotes y lee "25 lotes de 1.344 a 2.200 m² en un sector de 102 ha"

#### Scenario: Otros datos
- **WHEN** el archivo de datos tiene otra cantidad de lotes
- **THEN** el resumen muestra esa cantidad sin cambiar el código de la pantalla

### Requirement: Marcado como provisorio
La vista SHALL decir en texto "Loteo provisorio, ilustrativo" en la leyenda, arriba de la lista y en el panel de cada lote. SHALL nombrar la fuente de los datos y, mientras sea el boceto, aclarar que no considera la línea de inundación, la costa ni el relieve.

#### Scenario: Con el boceto
- **WHEN** una persona mira la vista con los datos del boceto
- **THEN** lee "Loteo provisorio, ilustrativo", que lo reemplaza el plano de Martín y que no considera la línea de inundación, la costa ni el relieve

#### Scenario: Con el plano de Martín
- **WHEN** los datos vienen del KMZ de Martín
- **THEN** sigue leyendo "Loteo provisorio, ilustrativo" y la fuente dice "Plano de Martín"

### Requirement: Lista equivalente con teclado
La vista SHALL ofrecer una lista con todos los lotes, cada uno con su número, superficie y estado. Cada elemento MUST poder elegirse con el teclado, dar el mismo resultado que elegirlo en el mapa y escribir `sel=<id>` en la URL.

#### Scenario: Elegir con el teclado
- **WHEN** la persona llega con Tab a "Lote 7" y aprieta Enter
- **THEN** el lote queda resaltado en el mapa, el panel muestra sus datos y la URL tiene `sel=lote-7`

#### Scenario: Enlace a un lote
- **WHEN** una persona abre `/territorios/lighthouse?sel=lote-7`
- **THEN** se abre la vista Lotes con el lote 7 elegido

### Requirement: Estados en texto y forma
Cada lote SHALL tener uno de tres estados, disponible, reservado o vendido, comunicado con una palabra en la lista y en el panel, y con un borde de forma distinta en el mapa, nunca solo con color. La leyenda MUST nombrar cada estado y decir que son de ejemplo.

#### Scenario: Lote vendido
- **WHEN** la persona elige el lote 13
- **THEN** lee "Vendido" y su borde en el mapa es distinto del de un lote disponible

#### Scenario: Leyenda
- **WHEN** la persona lee la leyenda de la vista Lotes
- **THEN** encuentra "Disponible", "Reservado", "Vendido" y "Estados de ejemplo"

### Requirement: Panel del lote
Al elegir un lote, el panel SHALL mostrar su nombre, su superficie, su estado, la marca provisoria y el estado administrativo compacto de `lighthouse-norte`. Una superficie que falta MUST mostrarse como "sin dato".

#### Scenario: Panel
- **WHEN** la persona elige el lote 1
- **THEN** lee "Lote 1", "1.344 m²", "Disponible" y "supuesto de trabajo, no otorgada"

#### Scenario: Lote sin superficie
- **WHEN** un lote de los datos no tiene superficie
- **THEN** el panel y la lista dicen "sin dato", no 0

### Requirement: Reemplazar los datos no toca pantallas
Toda lectura de los lotes SHALL pasar por un único módulo con un único archivo de datos. Reemplazar ese archivo por la salida del importador MUST alcanzar para cambiar los lotes, sin modificar ninguna pantalla.

#### Scenario: Cambio de datos
- **WHEN** se reemplaza el archivo por una salida válida del importador
- **THEN** el mapa, la lista y el panel muestran los lotes nuevos, y el diff solo incluye el archivo de datos

### Requirement: Importador de KMZ
El repo SHALL incluir un comando que convierta un KMZ o KML al formato de los datos del loteo. Un polígono cuyo nombre no entienda MUST informarse y hacer fallar la importación, nunca descartarse en silencio. Con `--comprobar` MUST validar sin escribir.

#### Scenario: Comprobar
- **WHEN** Gus corre el comando con `--comprobar` sobre un KMZ válido
- **THEN** ve cuántos lotes hay y los avisos, y el archivo de datos no cambia

#### Scenario: Polígono desconocido
- **WHEN** el KMZ tiene un polígono llamado "Pileta"
- **THEN** el comando informa "Pileta", sale con error y no escribe nada

### Requirement: Validación del importador
El importador SHALL rechazar, sin escribir nada y nombrando los ids afectados, un lote fuera del polígono del 7A, dos lotes superpuestos, un id repetido o con formato inválido, y un anillo inválido. Compartir un lado entre lotes vecinos MUST NOT contar como superposición.

#### Scenario: Lote fuera del 7A
- **WHEN** un lote del KMZ queda fuera del polígono del 7A
- **THEN** el comando nombra ese lote, sale con error y no escribe nada

#### Scenario: Lotes superpuestos
- **WHEN** dos lotes del KMZ se superponen
- **THEN** el comando nombra los dos, sale con error y no escribe nada

#### Scenario: Vecinos
- **WHEN** se valida el boceto actual, con lotes vecinos que comparten lados
- **THEN** no hay errores

### Requirement: Ids estables
Los ids de los lotes SHALL derivarse del número de lote, de modo que importar otra versión del plano conserve el id de cada número. Un id del archivo anterior que ya no esté MUST informarse como aviso, porque afecta estados y reservas.

#### Scenario: Reimportar
- **WHEN** se importa un plano donde cambió la forma del lote 7
- **THEN** su id sigue siendo `lote-7`

#### Scenario: Lote que desaparece
- **WHEN** se importa un plano sin el lote 13
- **THEN** el comando avisa que `lote-13` ya no está

### Requirement: Franja del río sin verificar
Mientras no haya un dato de la franja del río, el importador SHALL avisar en cada corrida "Franja del río: sin verificar (sin dato)". MUST NOT dar a entender que los lotes están fuera de esa franja.

#### Scenario: Aviso
- **WHEN** Gus corre el importador
- **THEN** lee "Franja del río: sin verificar (sin dato)", aunque no haya errores

### Requirement: Calidad de la vista de lotes
La vista Lotes SHALL ser bilingüe (es/en), usar solo tokens del tema, pasar la auditoría de axe y no tener scroll horizontal a 390 px. El nombre accesible del mapa MUST nombrar la vista.

#### Scenario: Celular
- **WHEN** la página se ve a 390 × 844 px
- **THEN** el selector, el mapa y la lista se acomodan al ancho, sin scroll horizontal

#### Scenario: Inglés
- **WHEN** la persona cambia a inglés en la vista Lotes
- **THEN** lee "Provisional, illustrative subdivision", "Available", "Reserved" y "Sold"
