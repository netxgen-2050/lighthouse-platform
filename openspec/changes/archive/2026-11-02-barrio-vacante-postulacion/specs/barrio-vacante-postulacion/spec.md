## ADDED Requirements

### Requirement: Botón en barrios vacantes
Vacant barrios SHALL offer "Proponer una comunidad" leading to `/tribus/<id>/postular`, both from the map panel and from the barrio page.

#### Scenario: Desde el mapa
- **WHEN** una persona elige el Barrio 3 en el mapa
- **THEN** ve "Proponer una comunidad" y al apretarlo llega a `/tribus/grano/postular`

### Requirement: Formulario y requisitos
The application page SHALL show the requirements box and the eight sample questions; required fields MUST show errors next to them; the form MUST NOT exist for non-vacant barrios.

#### Scenario: Falta el nombre
- **WHEN** la persona envía sin el nombre de la comunidad
- **THEN** ve el error junto al campo y no se envía

### Requirement: Envío simulado y llamada
On submit the system SHALL store the application in the browser, show the confirmation and offer "Agendar una llamada" opening the sample Calendly link in a new tab.

#### Scenario: Enviar
- **WHEN** la persona completa y envía
- **THEN** ve la confirmación y el botón "Agendar una llamada" con `target="_blank"`

### Requirement: Conteo en NetX
`/netx` SHALL show the number of simulated community applications.

#### Scenario: NetX
- **WHEN** hay una postulación enviada
- **THEN** `/netx` muestra 1 postulación
