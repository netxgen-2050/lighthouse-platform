# Spec Delta

## Purpose

Permite que una página siga existiendo y se pueda abrir por su URL sin que la plataforma la ofrezca: no aparece en la navegación principal (rail, barra superior y menú del avatar), no llegan avisos que lleven a ella, no hay preferencias sobre ella y la política de privacidad no la nombra. La usa Compromisos desde el 27-oct-2026, cuando el Mercado pasó a llevarse fuera de la plataforma.

## ADDED Requirements

### Requirement: Compromisos fuera de la navegación principal
The navigation SHALL NOT show a Compromisos link anywhere: not in the rail (on desktop or on mobile), not in the top bar and not in the avatar menu. The Participar group MUST show, in order, Pactos, Semillas, Fogón and Congreso.

#### Scenario: Rail en la computadora
- **WHEN** una persona miembro abre la portada en una pantalla de 1280 px
- **THEN** el grupo "Participar" del rail trae Pactos, Semillas, Fogón y Congreso, y no hay ningún enlace "Compromisos" en la navegación "Principal"

#### Scenario: Rail en el celular
- **WHEN** una persona abre la portada en una pantalla de 390 x 844
- **THEN** el rail no tiene ningún enlace "Compromisos" y no aparece scroll horizontal

#### Scenario: Sin cuenta
- **WHEN** una persona sin cuenta mira el rail
- **THEN** Pactos, Semillas y Fogón se ven deshabilitados con su ayuda "Sumate para participar", y no aparece Compromisos ni su ayuda "Sumate para participar: Compromisos"

#### Scenario: En inglés
- **WHEN** una persona mira el rail con el idioma en inglés
- **THEN** el grupo "Take part" trae Pacts, Semillas, Fireside y Congress, sin "Commitments"

#### Scenario: Barra superior y menú del avatar
- **WHEN** la persona abre el menú del avatar o recorre la barra superior
- **THEN** no encuentra ningún enlace a Compromisos

### Requirement: Compromisos sigue accesible por su URL
`/compromisos` SHALL keep working exactly as before when opened by its URL: same content, same Mercado, same access rule (it asks to be Miembro) and the axe audit MUST still pass. While on that page, no rail item SHALL be marked as the current page.

#### Scenario: Entrar por la URL
- **WHEN** una persona miembro abre `/compromisos` escribiendo la dirección
- **THEN** ve la página Compromisos con su formulario y su Mercado, con un único `<main>`

#### Scenario: Ningún destino marcado
- **WHEN** la persona está en `/compromisos`
- **THEN** ningún enlace de la navegación "Principal" tiene `aria-current="page"`

#### Scenario: Sin ser Miembro
- **WHEN** una persona sin membresía abre `/compromisos` por la URL
- **THEN** ve el mismo aviso de qué plan habilita la página que veía antes de este cambio

### Requirement: La lista única sigue declarando el destino
The single navigation list SHALL keep Compromisos declared as an existing page, marked as hidden from navigation, so that the check that compares the list with the real pages of the app keeps passing and the link can be brought back by removing the mark.

#### Scenario: Coincidencia con las páginas
- **WHEN** corre el test que compara cada destino con las páginas reales
- **THEN** `/compromisos` figura como página existente y el test pasa

#### Scenario: Volver a mostrarlo
- **WHEN** alguien quita la marca de oculto de Compromisos
- **THEN** el enlace vuelve al grupo Participar en su lugar de antes, entre Fogón y Congreso

### Requirement: Sin avisos que lleven al Mercado
The inbox (`/bandeja`), the bell (campanita) and Mi recorrido SHALL NOT list or count activity events of type `mercado` ("Publicaste en el mercado: …") or `interes-oferta` ("Alguien se interesó en tu oferta (simulado)"), including those already saved in the browser before this change. The code that creates those events MUST remain, and publishing from `/compromisos` MUST keep saving them.

#### Scenario: Aviso de interés guardado
- **WHEN** el navegador tiene guardada una notificación `interes-oferta` sin leer que ya se ve, y ninguna otra
- **THEN** la campanita dice "Notificaciones, sin novedades" y la bandeja dice "Todavía no tenés notificaciones"

#### Scenario: Junto con otros avisos
- **WHEN** el navegador tiene una notificación `interes-oferta` y otra de otro tipo, las dos sin leer
- **THEN** la campanita dice "1 notificación sin leer" y la bandeja muestra solo la otra

#### Scenario: Publicación en Mi recorrido
- **WHEN** el navegador tiene guardado un evento `mercado` "Publicaste en el mercado: Miel"
- **THEN** Mi recorrido no lo muestra ni enlaza a `/compromisos`

#### Scenario: Publicar por la URL sigue guardando
- **WHEN** una persona publica una oferta desde `/compromisos` entrando por la URL
- **THEN** el navegador guarda el evento de la publicación y el aviso de interés con demora, como antes, y ninguno de los dos aparece en la bandeja, la campanita ni Mi recorrido

### Requirement: Sin preferencia de aviso del Mercado
`/configuracion` SHALL NOT show the "Mercado" notification preference (in English, "Market"). The other notification preferences MUST stay, in order: Comunidades, Pactos, Rondas de reconocimiento and Postulaciones. A value already saved for `mercado` MUST be kept when reading and saving preferences.

#### Scenario: Ver las preferencias
- **WHEN** una persona abre la sección de avisos de `/configuracion`
- **THEN** ve cuatro casillas, sin ninguna "Mercado"

#### Scenario: En inglés
- **WHEN** la persona abre `/configuracion` en inglés
- **THEN** no aparece ninguna casilla "Market"

#### Scenario: Valor guardado
- **WHEN** las preferencias guardadas tienen `mercado: false` y la persona cambia otra preferencia
- **THEN** lo guardado sigue teniendo `mercado: false`

### Requirement: La política de privacidad no nombra Compromisos
The draft privacy policy (`/privacidad` and the consent screen) SHALL NOT name Compromisos or "los compromisos que asumís" as data the platform handles: not in the summary, not in the data-per-screen table and not in the purposes. The policy version MUST NOT change because of this edit.

#### Scenario: Leer la política
- **WHEN** una persona abre `/privacidad`
- **THEN** no encuentra la palabra "compromisos" en el resumen, en la tabla de datos por pantalla ni en las finalidades, y la fila de votos se llama "Votos"

#### Scenario: Consentimiento ya dado
- **WHEN** una persona que ya aceptó la política antes de este cambio vuelve a entrar
- **THEN** no se le vuelve a pedir el consentimiento
