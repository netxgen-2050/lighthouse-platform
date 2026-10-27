# Spec Delta

## Purpose

Permite que una página siga existiendo y se pueda abrir por su URL sin ofrecerla en la navegación principal (rail, barra superior y menú del avatar). La usa Compromisos desde el 27-oct-2026, cuando el Mercado pasó a llevarse fuera de la plataforma.

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
