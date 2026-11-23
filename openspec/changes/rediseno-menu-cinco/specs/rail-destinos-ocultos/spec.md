# Spec Delta

## MODIFIED Requirements

### Requirement: Compromisos fuera de la navegación principal
The navigation SHALL NOT show a Compromisos link anywhere: not in the rail, not in the mobile menu, not in the Explorar sub-navigation, not in the top bar and not in the avatar menu. Since the five-destination menu (rediseño del 23-nov-2026), the same applies to Pactos, Semillas, Fogón and Congreso: the Participar group no longer exists.

#### Scenario: Rail en la computadora
- **WHEN** una persona miembro abre la portada en una pantalla de 1280 px
- **THEN** la navegación "Principal" no tiene ningún enlace "Compromisos", "Pactos", "Semillas", "Fogón" ni "Congreso"

#### Scenario: Rail en el celular
- **WHEN** una persona abre la portada en una pantalla de 390 x 844 y abre el menú
- **THEN** el menú no tiene ningún enlace "Compromisos" y no aparece scroll horizontal

#### Scenario: Sin cuenta
- **WHEN** una persona sin cuenta mira el rail
- **THEN** no aparece Compromisos ni su ayuda "Sumate para participar: Compromisos", ni ningún destino deshabilitado de Participar

#### Scenario: En inglés
- **WHEN** una persona mira el rail con el idioma en inglés
- **THEN** no hay grupo "Take part" ni enlaces "Commitments", "Pacts", "Semillas", "Fireside" o "Congress"

#### Scenario: Barra superior y menú del avatar
- **WHEN** la persona abre el menú del avatar o recorre la barra superior
- **THEN** no encuentra ningún enlace a Compromisos

### Requirement: La lista única sigue declarando el destino
The single navigation list SHALL keep Compromisos, Pactos, Semillas, Fogón and Congreso declared as existing pages, marked as hidden from navigation, so that the check that compares the list with the real pages of the app keeps passing and each link can be brought back by removing the mark.

#### Scenario: Coincidencia con las páginas
- **WHEN** corre el test que compara cada destino con las páginas reales
- **THEN** `/compromisos`, `/pactos`, `/semillas`, `/fogon` y `/congreso` figuran como páginas existentes y el test pasa

#### Scenario: Volver a mostrarlo
- **WHEN** alguien quita la marca de oculto de Compromisos
- **THEN** el enlace vuelve a la navegación principal, después de los cinco destinos
