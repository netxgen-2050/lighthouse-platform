# Spec Delta

## MODIFIED Requirements

### Requirement: Compromisos fuera de la navegación principal
The navigation SHALL NOT show a Compromisos link anywhere: not in the rail (on desktop or on mobile), not in the top bar and not in the avatar menu. The "Lo que viene" group MUST show, in order, Tribus, Pactos, Semillas and Fogón.

#### Scenario: Rail en la computadora
- **WHEN** una persona miembro abre la portada en una pantalla de 1280 px
- **THEN** el grupo "Lo que viene" del rail trae Tribus, Pactos, Semillas y Fogón, y no hay ningún enlace "Compromisos" en la navegación "Principal"

#### Scenario: Rail en el celular
- **WHEN** una persona abre la portada en una pantalla de 390 x 844
- **THEN** el rail no tiene ningún enlace "Compromisos" y no aparece scroll horizontal

#### Scenario: Sin cuenta
- **WHEN** una persona sin cuenta mira el rail
- **THEN** Pactos, Semillas y Fogón se ven deshabilitados con su ayuda "Sumate para participar", y no aparece Compromisos ni su ayuda "Sumate para participar: Compromisos"

#### Scenario: En inglés
- **WHEN** una persona mira el rail con el idioma en inglés
- **THEN** el grupo "Coming next" trae Tribes, Pacts, Semillas y Fireside, sin "Commitments"

#### Scenario: Barra superior y menú del avatar
- **WHEN** la persona abre el menú del avatar o recorre la barra superior
- **THEN** no encuentra ningún enlace a Compromisos

### Requirement: La lista única sigue declarando el destino
The single navigation list SHALL keep Compromisos declared as an existing page, marked as hidden from navigation, so that the check that compares the list with the real pages of the app keeps passing and the link can be brought back by removing the mark.

#### Scenario: Coincidencia con las páginas
- **WHEN** corre el test que compara cada destino con las páginas reales
- **THEN** `/compromisos` figura como página existente y el test pasa

#### Scenario: Volver a mostrarlo
- **WHEN** alguien quita la marca de oculto de Compromisos
- **THEN** el enlace vuelve al grupo "Lo que viene", después de Fogón

## ADDED Requirements

### Requirement: Congreso fuera de la navegación principal
La navegación SHALL NOT mostrar un enlace a Congreso en el rail, en la barra superior ni en el menú del avatar. `/congreso` y `/congreso/en` MUST seguir respondiendo por su dirección, públicas y con el mismo contenido.

#### Scenario: Rail
- **WHEN** una persona abre la portada
- **THEN** no hay ningún enlace "Congreso" en la navegación "Principal"

#### Scenario: Entrar por la dirección
- **WHEN** una persona sin sesión abre `/congreso`
- **THEN** ve la vitrina del Congreso como antes y ningún enlace de la navegación tiene `aria-current="page"`

### Requirement: Nota para volver al Congreso
El repo SHALL tener una nota que explique por qué Congreso salió del menú, qué quedó en el código y cómo devolverlo. La lista única MUST seguir declarando Congreso como página existente.

#### Scenario: Volver a mostrarlo
- **WHEN** alguien sigue la nota y quita la marca de oculto de Congreso
- **THEN** el enlace vuelve al rail y el test que compara la lista con las páginas reales pasa
