## ADDED Requirements

### Requirement: Listado de las tribus del territorio
The system SHALL show at `/tribus` a public list with exactly the 12 tribes of the Lighthouse, one per barrio (barrios 1 to 12), ordered by barrio number. Each entry MUST show the tribe name, its seal with initials, its barrio number, its focus and its status, and MUST link to the tribe page.

#### Scenario: Una persona entra al listado
- **WHEN** una persona sin sesión abre `/tribus`
- **THEN** ve 12 tarjetas ordenadas del Barrio 1 al Barrio 12
- **AND** cada tarjeta enlaza a `/tribus/<id>`

#### Scenario: El estado se lee sin depender del color
- **WHEN** una tarjeta corresponde a una tribu activa, en formación o vacante
- **THEN** el estado aparece escrito ("Activa", "En formación", "Busca tribu"), no solo como color

### Requirement: Página de una tribu
The system SHALL show at `/tribus/<id>` the page of that tribe with: its name, its statement, what it has, what it is looking for, its open areas when it has them, what it contributes to the common pool, its entry ritual and its legal form.

#### Scenario: Tribu activa
- **WHEN** una persona abre `/tribus/valle`
- **THEN** ve "Valle Solar", su declaración, "Lo que tiene", "Lo que busca", "Lo que aporta al pozo común" y "Cómo se entra" con el ritual y la forma jurídica

#### Scenario: Tribu con áreas abiertas
- **WHEN** una persona abre `/tribus/avelan`
- **THEN** ve la lista de áreas y las abiertas (Nutrición, Energía, Encuentros) se distinguen de las demás con texto, no solo con color

### Requirement: Barrio vacante
The system SHALL show, for a barrio without a tribe, a page titled "Barrio N busca tribu" with what the Lighthouse needs from that barrio, and MUST NOT show an invented statement, members or contributions.

#### Scenario: Barrio 3 vacante
- **WHEN** una persona abre `/tribus/grano`
- **THEN** ve "Barrio 3 busca tribu" y la lista de lo que necesita (Agricultura extensiva, Animales, Molienda)
- **AND** no ve las secciones "Lo que tiene" ni "Lo que aporta al pozo común"

### Requirement: Tribu inexistente
The system SHALL answer with the not-found page (HTTP 404) for an id that is not one of the 12 tribes.

#### Scenario: Id desconocido
- **WHEN** una persona abre `/tribus/no-existe`
- **THEN** recibe la página de no encontrado con un enlace de vuelta a `/tribus`

### Requirement: Datos de ejemplo declarados
The system SHALL show on both pages the notice "Tribus, personas y cifras de ejemplo." and MUST NOT show money amounts, endorsements, affinity with the person, or links to pacts or chat rooms in this version.

#### Scenario: Sin plata en pantalla
- **WHEN** una persona recorre `/tribus` y cualquier `/tribus/<id>`
- **THEN** no aparece ningún monto en USD ni la palabra "avales"
- **AND** aparece el aviso de datos de ejemplo
