## ADDED Requirements

### Requirement: Manifiesto de Lighthouse VRN
The system SHALL hold the manifesto of the meta-tribe Lighthouse VRN as typed bilingual data (Spanish original, English translation marked as translated) under the existing community id `lighthouse`, replacing the former "Pacto de convivencia del Lighthouse". It MUST contain, in this order: a one-sentence purpose; between 10 and 15 principles grouped as tierra, agua, comunidad, economía and generaciones futuras, each with a one-line practical meaning; the rights of the land that the community assumes (to exist, to regenerate its cycles, to water, to clean air, to integral health, to not be polluted, to restoration); the commitments of whoever adheres; and how the manifesto is changed. It MUST be marked as a draft to be ratified by the común and as example data, and MUST NOT name the reference communities its principles were drawn from.

#### Scenario: Estructura completa
- **WHEN** se lee el manifiesto `lighthouse` en español
- **THEN** tiene propósito, entre 10 y 15 principios repartidos en los cinco grupos (ninguno vacío), los siete derechos, entre 5 y 7 compromisos y la sección de cómo se cambia, y está marcado "borrador, a ratificar por el común"

#### Scenario: Sin nombrar las fuentes
- **WHEN** se revisan todos los textos del manifiesto en los dos idiomas
- **THEN** ninguno nombra a las comunidades de referencia de las que salieron los principios

#### Scenario: En inglés
- **WHEN** una persona lee el manifiesto con `?lang=en`
- **THEN** ve todos los textos en inglés con una sola nota de que están traducidos del español

### Requirement: Fuente única de principios
The principles of Lighthouse VRN SHALL be read from a single source with stable ids, exposed with the shape of the `FuentePrincipios` seam of `fogon-propuestas` (`principios()`, `estado: "borrador"`, `origen: "manifiesto"`) and a lookup by id that returns nothing for an unknown id. The Fogón (concerns and blocks), Hifa and the Guardián (AI) MUST cite principles from this source only; no screen or test MUST keep its own copy of the list.

#### Scenario: Ids únicos y estables
- **WHEN** se piden los principios de la fuente
- **THEN** cada uno tiene un id único, un nombre y una explicación en los dos idiomas, y un grupo de los cinco

#### Scenario: Principio que no existe
- **WHEN** se busca un id que no está en la lista vigente
- **THEN** la búsqueda no devuelve nada y no da error

### Requirement: Ficha de Lighthouse VRN Procomún en Tribus
`/tribus/lighthouse` SHALL show the sheet of the común with its public name ("Lighthouse VRN Procomún" in Spanish and "Lighthouse VRN Commons" in English, decided by Gus), stating that it is the meta-tribe all tribes belong to. The sheet MUST show the purpose, the principles grouped under their five headings, the rights of the land, the transversal teams, the person's adhesion state in text, and the actions to read and adhere to the manifesto. The name MUST come from a single bilingual constant. `/tribus` MUST show a highlighted card that links to this sheet before the list of tribes.

#### Scenario: Llegar desde Tribus
- **WHEN** una persona activa la tarjeta "Lighthouse VRN Procomún" en `/tribus` con el teclado
- **THEN** llega a `/tribus/lighthouse`, con "Lighthouse VRN Procomún" como encabezado (en inglés, "Lighthouse VRN Commons") y el propósito debajo

#### Scenario: Principios agrupados
- **WHEN** la persona mira la ficha
- **THEN** ve los encabezados Tierra, Agua, Comunidad, Economía y Generaciones futuras, cada uno con sus principios y su línea de qué significa en la práctica

#### Scenario: Sin adhesión
- **WHEN** una persona con sesión de Miembro que no adhirió mira la ficha
- **THEN** lee en texto que todavía no adhirió y que sin adhesión puede mirar la gobernanza pero no participar, y ve "Leer el manifiesto" y "Adherir al manifiesto"

#### Scenario: Con adhesión
- **WHEN** la persona ya adhirió
- **THEN** la ficha dice en texto que adhirió al manifiesto de Lighthouse VRN y no ofrece "Adherir"

### Requirement: Leer y adherir al manifiesto de Lighthouse VRN
`/tribus/lighthouse/manifiesto` SHALL show the full manifesto (all its sections) and keep the existing conscious-adhesion flow: the adhere button stays disabled until the person reaches the end of the text and checks both statements. The back link MUST lead to the sheet `/tribus/lighthouse`. Adhering MUST write the existing membership of `lighthouse` in the browser.

#### Scenario: Adherir
- **WHEN** una persona de nivel Miembro lee el manifiesto hasta el final, marca las dos casillas y aprieta "Adherir"
- **THEN** su adhesión queda registrada en el navegador y la ficha dice que adhirió, también al recargar

#### Scenario: Volver
- **WHEN** la persona activa el enlace de volver en el manifiesto
- **THEN** llega a `/tribus/lighthouse`

### Requirement: Cómo se cambia el manifiesto
The manifesto SHALL state that any person who adhered can propose a change in the Fogón as a decision of the común, that a change is adopted only by consensus of the común following the proposals process of the Fogón, that a block must rest on a principle of this same manifesto, and that every version keeps its date and earlier versions stay readable. The page MUST link to `/fogon` and MUST NOT offer a button to change, ratify or vote the manifesto.

#### Scenario: Proceso visible
- **WHEN** la persona lee "Cómo se cambia este manifiesto"
- **THEN** lee que los cambios van por consenso del común en el Fogón y ve un enlace al Fogón, sin un botón para cambiarlo

### Requirement: Equipos transversales del Lighthouse VRN
The transversal teams of Lighthouse VRN SHALL be the circles of the común of the holarchy (no new entity). They MUST include, by name: Legal, Permacultura y regeneración, Marketing y comunicación, Tecnología, Gestión de contratistas, Gobernanza, Cuidado y conflictos, and Agua, each with a one-line purpose for the whole Lighthouse. The sheet MUST list them under "Equipos transversales: una startup para el procomún", and the holarchy in `/fogon/gobernanza` MUST show the same circles with the same names under the común.

#### Scenario: Mismos equipos en los dos lugares
- **WHEN** se comparan los equipos de la ficha con los círculos del común de la holarquía
- **THEN** son los mismos, con los mismos nombres, e incluyen Gestión de contratistas y Gobernanza

#### Scenario: Raíz de la holarquía
- **WHEN** la persona abre `/fogon/gobernanza`
- **THEN** la raíz de la estructura se llama "Lighthouse VRN Procomún" (en inglés, "Lighthouse VRN Commons")

### Requirement: Las tribus suman principios sin contradecir
A tribe's manifesto SHALL be able to add its own principles to those of Lighthouse VRN and MUST NOT contradict, replace, relax or remove them. The rule MUST be written in the Lighthouse VRN manifesto. The data of tribe principles MUST pass a validation that rejects: an id equal to a Lighthouse VRN principle id, a principle that declares itself an exception to a Lighthouse VRN principle, a principle that cites as deepened a principle that does not exist, and an empty text. The reading of a tribe's manifesto MUST show its own principles under "Suma a los principios de Lighthouse VRN", with a link to the Lighthouse VRN manifesto, or say in text that the tribe has not added any yet.

#### Scenario: Tribu que suma
- **WHEN** la persona lee el manifiesto de Semilla Viva
- **THEN** ve sus principios propios bajo "Suma a los principios de Lighthouse VRN", cada uno con el principio de Lighthouse VRN que profundiza, y el enlace al manifiesto de Lighthouse VRN

#### Scenario: Tribu sin principios propios
- **WHEN** la persona lee el manifiesto de Taller Común
- **THEN** lee que la tribu todavía no sumó principios propios y ve el enlace al manifiesto de Lighthouse VRN

#### Scenario: Excepción rechazada
- **WHEN** la validación recibe un principio de tribu que se declara excepción a "Suelo vivo"
- **THEN** lo rechaza con el motivo "contradice un principio de Lighthouse VRN"

#### Scenario: Datos de ejemplo válidos
- **WHEN** corren los tests sobre los principios de todas las tribus de ejemplo
- **THEN** ninguna validación falla

### Requirement: Manifiesto en la Vista NetX
The "Juego A o Juego B" section of `/netx/financiamiento` SHALL include a short block "Las decisiones, con la vida en el centro" with the purpose of Lighthouse VRN, the names of the five groups of principles with how many principles each has, the draft mark and a link to `/tribus/lighthouse`. The block MUST read from the same source as the sheet.

#### Scenario: Relato del Juego B
- **WHEN** una persona del equipo abre `/netx/financiamiento` en la sección "Juego A o Juego B"
- **THEN** lee el propósito de Lighthouse VRN, los cinco grupos con su cantidad de principios, la marca de borrador y un enlace a la ficha

### Requirement: No aparece en Sumarte
The manifesto of Lighthouse VRN, its principles and the adhesion requirement SHALL NOT appear in `/sumarte` or in its plans.

#### Scenario: Sumarte
- **WHEN** una persona recorre `/sumarte`
- **THEN** no ve el manifiesto de Lighthouse VRN, sus principios ni el aviso de adhesión

### Requirement: Prototipo y accesibilidad del manifiesto
The sheet, the manifesto reading and the Vista NetX block SHALL show the prototype notice, mark the manifesto and its principles as example data and draft, carry a ⚖ in draft for the manifesto, the rights of the land and the adhesion requirement, explained in simple words, take their texts from the es/en dictionaries (the Vista NetX block follows that page, which is in Spanish only), use only theme tokens, keep the single `<main>` of the layout, show the adhesion state in text and not only with color, be fully usable with the keyboard and pass the axe audit.

#### Scenario: Auditoría
- **WHEN** corre la auditoría de accesibilidad sobre `/tribus/lighthouse` y `/tribus/lighthouse/manifiesto`
- **THEN** no hay violaciones serias ni críticas

#### Scenario: Términos con peso legal
- **WHEN** la persona abre el ⚖ junto a "Derechos de la tierra"
- **THEN** lee en palabras simples que son lo que el común se compromete a respetar, que no es un texto jurídico y que es un borrador
