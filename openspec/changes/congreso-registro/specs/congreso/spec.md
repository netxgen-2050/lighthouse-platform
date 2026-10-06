## ADDED Requirements

### Requirement: Página del Congreso
The system SHALL show at `/congreso` the event title "Congreso · Febrero 2027", an explanation that the ticket is sold by the organizer (with the ⚖ `ticket`), the 5-day agenda from mock-up v6 (Llegada y visita al Lighthouse; Encuentros de tribus; Minga: primera jornada de obra; Masterplan y Ronda 0; Fogón de cierre) and the note on presence with the ⚖ `presencia`. Day 3 MUST carry the ⚖ `obra`.

#### Scenario: Ver la agenda
- **WHEN** una persona abre `/congreso`
- **THEN** ve los 5 días en orden, numerados "Día 1" a "Día 5"
- **AND** el Día 3 tiene el ⚖ "Horas de obra"

#### Scenario: Sin precios
- **WHEN** una persona recorre `/congreso`
- **THEN** no aparece ningún monto ni la sigla "USD"

### Requirement: Registro del ticket en modo demostración
The system SHALL let a person enter a ticket code with format `LH27-XXXX-XX` (letters A–Z and digits, case-insensitive, normalized to uppercase). A valid code MUST be stored only in the browser and show "Ticket <código> registrado" and "Genesis pendiente: se confirma cuando el anfitrión escanea tu ticket en el territorio". The page MUST show the notice "Modo demostración: el registro queda solo en este navegador." An invalid code MUST show an error message linked to the field and not store anything.

#### Scenario: Código válido
- **WHEN** una persona escribe `lh27-8f3k-2q` y aprieta "Registrar"
- **THEN** ve "Ticket LH27-8F3K-2Q registrado" y "Genesis pendiente"
- **AND** al recargar la página el ticket sigue registrado

#### Scenario: Código inválido
- **WHEN** una persona escribe `1234` y aprieta "Registrar"
- **THEN** ve un mensaje de error asociado al campo (`aria-describedby`) y no se guarda nada

#### Scenario: Quitar el registro
- **WHEN** una persona con ticket registrado aprieta "Quitar ticket"
- **THEN** vuelve a ver el campo vacío

### Requirement: Términos legales del Congreso
The system SHALL add to the legal catalog the keys `ticket`, `presencia` and `obra`, copied verbatim (title and text) from the `LEGAL` object of mock-up v6.

#### Scenario: Textos idénticos
- **WHEN** corren los tests del catálogo
- **THEN** las cinco claves (`ritual`, `personeria`, `ticket`, `presencia`, `obra`) coinciden textualmente con el mock-up
