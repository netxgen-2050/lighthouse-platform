# Spec Delta

## Purpose

Borrar los datos del Congreso de febrero de 2027, que se canceló el 23-oct-2026, y dejar `/congreso` solo como vitrina.

## ADDED Requirements

### Requirement: Sin datos del Congreso
`lh-congreso-ticket` and `lh-congreso-idioma` SHALL be removed from `NOMBRES_BASE` and from the browser (with and without a person prefix) the first time the person opens the app after this change. No screen SHALL write or read a Congress ticket.

#### Scenario: Navegador con ticket viejo
- **WHEN** una persona entra con `lh-congreso-ticket` guardado
- **THEN** la clave desaparece y ninguna pantalla muestra un ticket

#### Scenario: Pasaporte y Semillas
- **WHEN** una persona abre el Pasaporte o Semillas
- **THEN** no aparece nada que dependa de un ticket del Congreso, y lo demás se ve igual que antes

### Requirement: Vitrina sin registro
`/congreso` SHALL remain reachable as a showcase without the ticket registration, in the app's general language (`?lang` and the general preference).

#### Scenario: Vitrina en inglés
- **WHEN** alguien abre `/congreso?lang=en`
- **THEN** ve la vitrina en inglés y no hay ningún formulario para registrar un ticket

### Requirement: Semillas y Compromisos intactos
Removing the ticket MUST NOT delete Semillas or Compromisos code or data (`lighthouse.compromisos.v1` included); only their reading of the ticket SHALL go.

#### Scenario: Compromisos guardados
- **WHEN** una persona con compromisos guardados entra después del cambio
- **THEN** sus compromisos siguen en el navegador igual que antes
