# Spec Delta

## Purpose

Borrar los datos del Congreso de febrero de 2027, que se canceló el 23-oct-2026 (decisión de Gus, 25-nov-2026). Qué pasa con la página `/congreso` lo decide `eventos-reemplaza-congreso`.

## ADDED Requirements

### Requirement: Sin datos del Congreso
`lh-congreso-ticket` and `lh-congreso-idioma` SHALL be removed from `NOMBRES_BASE` and from the browser (with and without a person prefix) the first time the person opens the app after this change, without copying them anywhere. No screen SHALL write or read a Congress ticket or the old Congress language preference.

#### Scenario: Navegador con ticket viejo
- **WHEN** una persona entra con `lh-congreso-ticket` guardado
- **THEN** la clave desaparece y ninguna pantalla muestra un ticket

#### Scenario: Pasaporte, Semillas y Mi recorrido
- **WHEN** una persona abre el Pasaporte, Semillas o su recorrido en el panel
- **THEN** no aparece nada que dependa de un ticket del Congreso, y lo demás se ve igual que antes

### Requirement: Sin registro de ticket
The ticket registration form and the NetX ticket view SHALL be removed. The Congress sample figures of the showcase (`tribus-con-ticket`) are not personal data and MAY stay.

#### Scenario: Vitrina
- **WHEN** alguien abre `/congreso` mientras exista
- **THEN** no hay ningún formulario para registrar un ticket ni ningún ticket vinculado

### Requirement: Semillas y Compromisos intactos
Removing the ticket MUST NOT delete Semillas or Compromisos code or data (`lighthouse.compromisos.v1` included); only their reading of the ticket SHALL go.

#### Scenario: Compromisos guardados
- **WHEN** una persona con compromisos guardados entra después del cambio
- **THEN** sus compromisos siguen en el navegador igual que antes
