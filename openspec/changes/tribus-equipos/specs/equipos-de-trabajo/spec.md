## ADDED Requirements

### Requirement: Fases del Lighthouse
The system SHALL define three phases of the Lighthouse, each with a bilingual label: phase 0 "hoy, equipos semilla", phase 1 "2027, primeras comunidades" and phase 2 "barrios con tribus". It SHALL mark phase 0 as the current phase (`FASE_ACTUAL`). The phases MUST be data in a single module, so the map timeline and the teams section read the same source.

#### Scenario: Fase actual
- **WHEN** el código pide la fase actual
- **THEN** recibe la fase 0 con el texto "hoy, equipos semilla" en español y su versión en inglés

### Requirement: Equipos son círculos del común
The system SHALL treat every work team as a circle of the commons (`CIRCULOS_DEL_COMUN` in `lib/gobernanza/datos.ts`) and MUST NOT introduce another entity for teams. The circle `comun-contratistas` ("Gestión de contratistas") MUST exist, with the same id, name, purpose and "Decide sobre" defined by `manifiesto-lighthouse-vrn`.

#### Scenario: Un frente apunta a un círculo que no existe
- **WHEN** un frente de ejemplo tiene como equipo un id que no está entre los círculos del común
- **THEN** el test de validación de frentes falla y nombra ese frente

### Requirement: Frentes de trabajo
The system SHALL provide sample work fronts. Each front has an id, a bilingual name, its team (a circle of the commons), the need it solves, who is missing, the date it is wanted by, the phase from which it runs, and either a point inside Macrolote 7 or no place on the map. Who is missing and the date MUST be either a text or empty ("sin dato"), never 0 and never an empty string. Every front MUST be marked as sample data. The sample set MUST include the eight fronts of the approved sketch:
- Agua y cuenca (Agua);
- Acceso y camino (Gestión de contratistas);
- Vivero y suelo (Permacultura);
- Línea de base (Permacultura), with who is missing empty;
- Primer obrador (Gestión de contratistas, phase 1);
- Parque agrovoltaico (Gestión de contratistas, phase 1);
- Papeles y fideicomiso (Legal, no place on the map);
- Comunicación (marketing and communication circle, no place on the map).

#### Scenario: Punto fuera del Macrolote 7
- **WHEN** un frente de ejemplo tiene un punto fuera del contorno del Macrolote 7
- **THEN** el test de validación de frentes falla y nombra ese frente

#### Scenario: Lo que falta no es cero
- **WHEN** se muestra el frente "Línea de base"
- **THEN** donde dice quién falta se lee "sin dato"

### Requirement: Pedir sumarse a un equipo
The system SHALL let a person ask to join a team as an applicant of its circle ("Quiero sumarme a <equipo>"). What the person sees depends on their state:
- Without a session: "Entrá para sumarte".
- With a plan that lacks the `adherir` capability: the same notice the manifesto page shows today.
- Without a request or membership in the Lighthouse community: "Para sumarte, primero sumate como aspirante al Lighthouse", with a link to `/tribus/lighthouse/manifiesto`.
- Otherwise: the button opens an in-place confirmation. It says the circle is run and facilitated by Hifa (simulated, experimental), with the super admin answering meanwhile. Confirming stores the request and shows "Pediste sumarte a <equipo> · aspirante".

Asking again MUST NOT create a second request. The request MUST be stored in the browser under the person's own key `lh-equipos`, separate from the membership key. The request MUST also be included in the download and the deletion of `/mis-datos`.

#### Scenario: Sin adhesión al Lighthouse
- **WHEN** una persona con sesión y plan Miembro, sin adhesión al Lighthouse, mira el equipo Agua
- **THEN** ve "Para sumarte, primero sumate como aspirante al Lighthouse" con el enlace al manifiesto
- **AND** no ve el botón "Quiero sumarme"

#### Scenario: Pedir sumarse
- **WHEN** una persona que ya adhirió al Lighthouse aprieta "Quiero sumarme a Agua" y confirma
- **THEN** ve "Pediste sumarte a Agua · aspirante"
- **AND** al recargar la página lo sigue viendo
- **AND** su membresía en las tribus no cambia

#### Scenario: Sin sesión
- **WHEN** una persona sin sesión mira un equipo
- **THEN** ve "Entrá para sumarte" en lugar del botón

#### Scenario: Mis datos
- **WHEN** una persona que pidió sumarse a un equipo descarga sus datos desde `/mis-datos`
- **THEN** la descarga incluye su pedido a ese equipo
