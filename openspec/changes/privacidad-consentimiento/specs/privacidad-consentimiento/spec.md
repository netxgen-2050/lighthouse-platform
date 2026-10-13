## ADDED Requirements

### Requirement: Consentimiento al entrar
The system SHALL ask a logged-in person, before using the app the first time and whenever the policy version changes, to accept the privacy policy and the prototype terms with two mandatory checkboxes; without accepting, the person MUST NOT use pages that require a session.

#### Scenario: Primera vez
- **WHEN** una persona entra por primera vez
- **THEN** ve el resumen de privacidad con las dos casillas y no puede seguir sin marcarlas

#### Scenario: Nueva versión
- **WHEN** la versión de la política cambia
- **THEN** la persona vuelve a ver la pantalla de consentimiento al entrar

### Requirement: Registro del consentimiento
The system SHALL record the accepted policy version, date and what was accepted for each person, through a single function prepared to move to the database.

#### Scenario: Registrar
- **WHEN** la persona acepta
- **THEN** queda registrado con la versión y la fecha, y al recargar no se vuelve a pedir

### Requirement: Datos sensibles
Starting the KYC SHALL require an additional specific consent for identity, tax residence and source-of-funds data.

#### Scenario: KYC
- **WHEN** la persona aprieta "Verificar mi identidad"
- **THEN** antes del primer paso tiene que aceptar el tratamiento de esos datos

### Requirement: Política de privacidad
`/privacidad` SHALL be public and state, as a draft: the controller (NetXGen, Honduras), the data processed per screen, purposes, legal basis, retention, processors and their location (United States), and the person's rights with how to exercise them.

#### Scenario: Encargados
- **WHEN** alguien abre `/privacidad`
- **THEN** ve que Privy, Vercel y GitHub tratan datos y que están en Estados Unidos, marcado como borrador

### Requirement: Mis datos
`/mis-datos` SHALL let a logged-in person download all their data as JSON, withdraw consent (logs out and deletes their data), and request account deletion (sent to the team with the `privacidad` label).

#### Scenario: Descargar
- **WHEN** la persona aprieta "Descargar mis datos"
- **THEN** descarga un archivo JSON con sus datos y ninguno de otra persona

#### Scenario: Retirar el consentimiento
- **WHEN** la persona retira su consentimiento y confirma
- **THEN** se cierra su sesión y sus datos del navegador se borran
