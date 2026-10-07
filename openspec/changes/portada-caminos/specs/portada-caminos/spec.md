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

### Requirement: Sin cifras inventadas ni plata
The description of "Explorar el Lighthouse" SHALL derive the number of neighborhoods from the territory data, not from a hard-coded number. The portada MUST NOT show amounts, the text "USD", the surface "~1.000 ha", nor the words "invertir", "capital", "lote" or "reservar".

#### Scenario: Cantidad de barrios desde los datos
- **WHEN** el territorio Lighthouse tiene 12 tribus en sus datos
- **THEN** la descripción de "Explorar el Lighthouse" dice "doce barrios" o "12 barrios"

#### Scenario: Portada sin plata ni lotes
- **WHEN** una persona recorre `/`
- **THEN** no aparece ningún monto, "USD", la unidad "ha" como palabra suelta, "invertir", "capital", "lote" ni "reservar"

### Requirement: Perfil y Congreso en el encabezado
The global header SHALL include the links "Perfil" to `/perfil` and "Congreso" to `/congreso`, after the existing links, and MUST mark the link of the current route with `aria-current="page"`.

#### Scenario: Enlace activo
- **WHEN** una persona está en `/congreso`
- **THEN** el enlace "Congreso" del encabezado tiene `aria-current="page"` y ningún otro enlace lo tiene
