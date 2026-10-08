## ADDED Requirements

### Requirement: Botón con ícono
The report button SHALL show a bug icon (decorative, `aria-hidden`) next to its text and keep its accessible name.

#### Scenario: Ver el botón
- **WHEN** una persona abre cualquier página
- **THEN** ve el botón con el ícono de un bicho y el texto "Reportar"

### Requirement: Héroe del inicio
The home hero's primary button SHALL be "Explorar el Lighthouse" linking to `/territorios/lighthouse`, and the "Descubrir" path card SHALL be "Ver las tribus" linking to `/tribus`.

#### Scenario: Botón principal
- **WHEN** una persona abre `/`
- **THEN** el primer botón del héroe es "Explorar el Lighthouse" y lleva a `/territorios/lighthouse`

### Requirement: Distribución 3/5/4
The sample tribe data SHALL have 3 active tribes, 5 in formation and 4 vacant barrios (3, 8, 9 and 12), and every count shown in the app MUST come from the data.

#### Scenario: Conteos
- **WHEN** una persona abre `/territorios/lighthouse`
- **THEN** el panel dice 3 activas, 5 en formación y 4 vacantes

### Requirement: Leyenda en tres grupos
The territory map SHALL use distinct palettes for the Lighthouse group, the Soluna group and points of interest, never reusing a color across groups, with a grouped legend in text.

#### Scenario: Colores distintos
- **WHEN** se compara el color de "tribu activa" con el de "finca disponible"
- **THEN** son distintos y la leyenda los muestra en grupos separados con su nombre

### Requirement: Sin personas de ejemplo
The app MUST NOT present sample personas (Lucía, Lucas) as the viewer anywhere.

#### Scenario: Fogón
- **WHEN** una persona abre `/fogon`, `/pactos` o `/semillas`
- **THEN** no aparecen Lucía ni Lucas como la persona que mira
