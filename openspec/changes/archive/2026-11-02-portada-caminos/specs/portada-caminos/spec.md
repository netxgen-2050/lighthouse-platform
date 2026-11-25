# Spec Delta

## Purpose

Que quien llega a la portada entienda qué ofrece la plataforma y elija, en un paso, entre explorar el territorio, encontrar su tribu o ir al Congreso.

## ADDED Requirements

### Requirement: Tres caminos en la portada
The system SHALL show at `/`, below the existing headline and the "Ver las tribus" button, a section titled "Por dónde empezar" with exactly three links, in this order: "Explorar el Lighthouse" to `/territorios/lighthouse` (label "Descubrir"), "Encontrar mi tribu" to `/perfil` (label "Encontrarse") and "Congreso · Feb 2027" to `/congreso` (label "Encontrarse en persona"). Each link MUST include a one-line description.

#### Scenario: Ver los tres caminos
- **WHEN** una persona abre `/`
- **THEN** ve la sección "Por dónde empezar" con los tres caminos en ese orden
- **AND** sigue viendo el titular y el botón "Ver las tribus"

#### Scenario: Cada camino lleva a su página
- **WHEN** una persona activa "Explorar el Lighthouse", "Encontrar mi tribu" o "Congreso · Feb 2027"
- **THEN** llega a `/territorios/lighthouse`, `/perfil` o `/congreso`, respectivamente, y la página responde 200

### Requirement: Caminos usables con teclado
Each path SHALL be a single focusable link whose accessible name includes its title, reachable with Tab and activated with Enter, with a visible focus indicator.

#### Scenario: Recorrer con teclado
- **WHEN** una persona navega la portada solo con Tab
- **THEN** cada camino recibe el foco en orden y muestra un indicador de foco visible
- **AND** al apretar Enter sobre "Encontrar mi tribu" llega a `/perfil`

### Requirement: Cantidad de barrios desde los datos
The description of "Explorar el Lighthouse" SHALL derive the number of neighborhoods from the territory data, not from a hard-coded number.

#### Scenario: Cantidad de barrios desde los datos
- **WHEN** el territorio Lighthouse tiene 12 tribus en sus datos
- **THEN** la descripción de "Explorar el Lighthouse" dice "doce barrios" o "12 barrios"

### Requirement: Héroe del mock-up con la propuesta para inversores
The system SHALL use the hero text of `V.inicio` in mock-up v6, including its investment wording, so that the home page makes clear the platform is meant to raise money from investors and users (decision of Gus, 7-oct-2026, internal prototype). When the route `/sumarte` exists, the hero MUST include a secondary link "Elegí cómo sumarte" to it. Other nodes of the corridor (San Martín de los Andes, Atlántico Sur) MUST NOT appear.

#### Scenario: Propuesta visible
- **WHEN** una persona abre `/`
- **THEN** lee el texto del héroe del mock-up, con su mención a la inversión
- **AND** si existe `/sumarte`, ve el enlace "Elegí cómo sumarte"
- **AND** no aparecen San Martín de los Andes ni Atlántico Sur

### Requirement: Aviso de prototipo en la portada
The home page SHALL show the notice "Prototipo interno · datos de ejemplo".

#### Scenario: Aviso
- **WHEN** una persona abre `/`
- **THEN** ve el aviso de prototipo

### Requirement: Navegación
The home page change SHALL NOT add links to the header: navigation destinations live in the navigation rail (`navegacion-rail`, `lib/navegacion.ts`). If the rail is in the base branch, new routes are added to its single list.

#### Scenario: Sin enlaces nuevos en el encabezado
- **WHEN** se revisa el diff
- **THEN** `components/encabezado.tsx` no suma enlaces
