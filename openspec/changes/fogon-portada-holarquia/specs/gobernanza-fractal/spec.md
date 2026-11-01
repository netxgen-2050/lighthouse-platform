## MODIFIED Requirements

### Requirement: Estructura de gobernanza visible
The system SHALL show at `/fogon` (la portada del Fogón; `/fogon/gobernanza` redirige ahí) the governance structure as a holarchy of nested circles: Lighthouse (el común) as the outer circle; inside it, the común's own example circles, the council of tribes with one seat per tribe validated by the común, the transversal circles and the 12 tribes of the territory with their state; inside each active or forming tribe, its example circles; inside each circle, its roles. Tribes that look for a tribe MUST show a "Lugar libre" and no circles. Every example person, circle and role MUST be marked as example data.

#### Scenario: Ver la estructura
- **WHEN** una persona abre `/fogon`
- **THEN** ve el común con sus círculos (entre ellos "Agua" y "Tokenomics y Semillas"), el "Consejo de tribus" y las 12 tribus con su estado en texto

#### Scenario: Tribu que busca tribu
- **WHEN** la persona entra a "Barrio 3"
- **THEN** la ve como "Busca tribu", con "Lugar libre", sin círculos y sin lugar en el consejo

#### Scenario: Consejo
- **WHEN** la persona entra al "Consejo de tribus"
- **THEN** ve un lugar por cada tribu validada por el común, cada uno con "Sin representante elegido", y ningún nombre inventado en esos lugares

## ADDED Requirements

### Requirement: La dirección vieja de la holarquía redirige
`/fogon/gobernanza` SHALL redirigir a `/fogon`, conservando los parámetros `holon` y `lente` si vienen. Todo enlace interno que hoy apunta a `/fogon/gobernanza` MUST apuntar a `/fogon`.

#### Scenario: Enlace guardado
- **WHEN** alguien abre `/fogon/gobernanza?holon=valle`
- **THEN** llega a `/fogon?holon=valle` con Valle Solar enfocado

#### Scenario: Desde la ficha del común
- **WHEN** la persona activa el enlace a la gobernanza en la ficha de Lighthouse VRN
- **THEN** llega a `/fogon`

### Requirement: Todo círculo tiene nombre
Todo círculo, tribu, consejo y lugar de la holarquía SHALL tener un nombre legible no vacío en es y en en; ninguno MUST mostrarse con su id ni sin nombre. En la lista accesible, en el panel de detalle, en las migas y en la sección de propuestas adyacente MUST verse siempre el nombre completo.

#### Scenario: Lista completa
- **WHEN** la persona recorre la lista accesible entera con lector de pantalla
- **THEN** cada círculo, tribu, consejo y lugar se anuncia con un nombre, nunca con un id como `valle-0`

#### Scenario: En inglés
- **WHEN** la persona abre `/fogon?lang=en` y entra a Fundación Avelan Kerum
- **THEN** cada área tiene su nombre en inglés en el panel y en la lista

### Requirement: Nombres en el dibujo cuando hay lugar
El dibujo SHALL rotular los holones del nivel enfocado y también los círculos del nivel de adentro cuando su tamaño en pantalla alcanza. Si el nombre completo no entra, MUST usar el nombre corto del círculo cuando existe; si tampoco entra, MUST NOT rotularlo (nunca se recorta con "…"). Al pasar el mouse por un círculo MUST verse su nombre completo. Los rótulos MUST NOT superponerse entre un nivel y el de adentro.

#### Scenario: El común en escritorio
- **WHEN** la persona abre `/fogon` en una pantalla de 1280 px
- **THEN** cada círculo del común, el consejo y cada tribu muestran en el dibujo su nombre o su nombre corto

#### Scenario: Un nivel más adentro
- **WHEN** la persona, en una pantalla de 1280 px, entra a Valle Solar
- **THEN** cada uno de sus círculos muestra su nombre y, dentro de cada círculo, las personas siguen con nombre y rol como hoy

#### Scenario: Celular sin lugar
- **WHEN** la persona abre `/fogon` a 390 px y un círculo no tiene lugar para ningún nombre
- **THEN** el círculo no tiene texto recortado y su nombre completo está en la lista y en el panel

#### Scenario: Pasar el mouse
- **WHEN** la persona pasa el mouse sobre el círculo "Permacultura y regeneración" en el nivel del común
- **THEN** el navegador muestra "Permacultura y regeneración"
