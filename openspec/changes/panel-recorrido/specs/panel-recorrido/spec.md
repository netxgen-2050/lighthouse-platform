# Spec Delta

## Purpose

Darle a la persona un solo lugar donde ver qué hizo en la plataforma en modo demostración (perfil, compromisos y ticket del Congreso) y cuál es su próximo paso.

## ADDED Requirements

### Requirement: Estado del perfil
The system SHALL show at `/panel` a "Perfil" card that reads the interview saved in the browser and shows "N de 6 datos confirmados", or "Todavía no empezaste la entrevista" when nothing is saved, with a link to `/perfil`.

#### Scenario: Perfil a medias
- **WHEN** la persona respondió 3 preguntas y confirmó 2 en `/perfil` y abre `/panel`
- **THEN** la tarjeta "Perfil" dice "2 de 6 datos confirmados" y enlaza a `/perfil`

#### Scenario: Perfil sin empezar
- **WHEN** no hay nada guardado de la entrevista
- **THEN** la tarjeta "Perfil" dice "Todavía no empezaste la entrevista"

### Requirement: Estado de los compromisos
The system SHALL show a "Compromisos" card with the number of saved commitments of type "Ofrezco" and of type "Necesito" ("N ofrecés · M necesitás"), or "Todavía no registraste compromisos" when there are none, with a link to `/compromisos`. It MUST NOT show hours totals, amounts or currencies.

#### Scenario: Con compromisos
- **WHEN** la persona registró 2 "Ofrezco" y 1 "Necesito" en `/compromisos`
- **THEN** la tarjeta dice "2 ofrecés · 1 necesitás" y no muestra "h/mes", "USD" ni "$"

#### Scenario: Sin compromisos
- **WHEN** no hay compromisos guardados
- **THEN** la tarjeta dice "Todavía no registraste compromisos"

### Requirement: Estado del ticket del Congreso
The system SHALL show a "Congreso" card with "Ticket <código> registrado" and "Genesis pendiente" when a valid ticket code is saved, or "Sin ticket registrado" otherwise, with a link to `/congreso`. A saved value that is not a valid ticket code MUST be treated as no ticket.

#### Scenario: Con ticket
- **WHEN** la persona registró `LH27-8F3K-2Q` en `/congreso`
- **THEN** la tarjeta dice "Ticket LH27-8F3K-2Q registrado" y "Genesis pendiente"

#### Scenario: Dato guardado inválido
- **WHEN** el navegador tiene guardado un código con formato inválido
- **THEN** la tarjeta dice "Sin ticket registrado"

### Requirement: Próximo paso
The system SHALL show a "Tu próximo paso" block suggesting the first incomplete step in this order: profile with fewer than 6 confirmed fields, then no commitments, then no ticket; each suggestion MUST link to its page. When all three are complete it MUST say "Ya recorriste todo lo que hay por ahora."

#### Scenario: Falta el perfil
- **WHEN** el perfil tiene menos de 6 datos confirmados
- **THEN** el próximo paso sugiere terminar la entrevista y enlaza a `/perfil`, aunque falten también compromisos o ticket

#### Scenario: Todo completo
- **WHEN** hay 6 datos confirmados, al menos un compromiso y un ticket válido
- **THEN** el bloque dice "Ya recorriste todo lo que hay por ahora."

### Requirement: Modo demostración y borrado
The system SHALL show the notice "Modo demostración: este panel lee lo que guardaste en este navegador." and a button "Borrar todo lo de este navegador" that, after an explicit confirmation, removes all demo data saved by the platform and shows the empty state. Nothing MUST be sent to a server.

#### Scenario: Borrar todo
- **WHEN** la persona aprieta "Borrar todo lo de este navegador" y confirma
- **THEN** las tres tarjetas muestran su estado vacío
- **AND** al abrir `/perfil`, `/compromisos` y `/congreso` tampoco hay datos guardados

#### Scenario: Cancelar el borrado
- **WHEN** la persona aprieta el botón y cancela la confirmación
- **THEN** no se borra nada

#### Scenario: Sin pedidos al servidor
- **WHEN** la persona abre `/panel` con datos guardados
- **THEN** no se hace ningún pedido de red con esos datos

### Requirement: Navegador sin almacenamiento
The system SHALL, when the browser does not allow reading local storage, show an error message in text explaining that the demo data cannot be read, instead of showing the empty states as if there were no data.

#### Scenario: Almacenamiento bloqueado
- **WHEN** el acceso a `localStorage` lanza un error
- **THEN** `/panel` muestra un mensaje de error en texto y no dice "Todavía no empezaste la entrevista"

### Requirement: Enlace en el encabezado y accesibilidad
The global header SHALL include "Mi recorrido" linking to `/panel`, with `aria-current="page"` on that route. Card states MUST be conveyed in text, not only with color or icons, and every link and button on `/panel` MUST be operable with the keyboard.

#### Scenario: Recorrer con teclado
- **WHEN** una persona abre `/panel` y navega solo con Tab
- **THEN** llega al enlace del próximo paso, a los enlaces de las tarjetas Perfil, Compromisos y Congreso y al botón de borrado, en ese orden
- **AND** el enlace "Mi recorrido" del encabezado tiene `aria-current="page"`
