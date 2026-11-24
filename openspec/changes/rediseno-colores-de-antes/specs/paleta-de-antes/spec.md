# Spec Delta

## Purpose

La paleta de la app vuelve a la anterior al rediseño, por decisión de Gus del 24-nov-2026, conservando las tipografías y los componentes nuevos.

## ADDED Requirements

### Requirement: Paleta de colores
La app SHALL usar la paleta anterior al rediseño (la del mock-up v6, en `dev` antes del PR #201) en el tema claro y en el oscuro, con los mismos nombres de token. Los tokens que sumó el rediseño (escala de regeneración y vidrio) MUST tomar valores de esa paleta. Todo par de texto y fondo MUST pasar AA en los dos temas.

#### Scenario: Tema claro
- **WHEN** una persona abre `/` con el tema claro
- **THEN** el fondo es el hueso de antes (`#f6f3ea`) y el verde profundo de antes (`#154626`) es el acento

#### Scenario: Tema oscuro
- **WHEN** una persona abre `/` con el tema oscuro
- **THEN** el fondo es el verde casi negro de antes (`#101a14`) y el acento es el verde claro de antes (`#8fd0a0`)

#### Scenario: Contraste
- **WHEN** corre `lib/tema-contraste.test.ts`
- **THEN** todos los pares de texto y fondo pasan AA en los dos temas

### Requirement: Tema por defecto
Sin una preferencia guardada, la app SHALL seguir el modo del sistema (claro u oscuro). Una preferencia guardada (claro, oscuro o sistema) MUST respetarse.

#### Scenario: Sin preferencia
- **WHEN** una persona sin preferencia guardada abre la app con el sistema en modo claro
- **THEN** la app se ve en tema claro

#### Scenario: Preferencia guardada
- **WHEN** una persona eligió Oscuro en Configuración y recarga
- **THEN** la app se ve en tema oscuro
