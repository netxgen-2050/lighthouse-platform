# Spec Delta

## Purpose

Mostrar el Token Inversor de la propuesta v0.1 (`NS_Tokenomics` doc 34) donde la plataforma habla de inversores, y que `/lotes/hibrido`, la Vista NetX y Sumarte no contradigan la propuesta y enlacen a `/bien-comun`.

## ADDED Requirements

### Requirement: Token Inversor en el modelo de financiamiento
`/netx/financiamiento` SHALL tener la sección "Token Inversor (propuesta v0.1, en discusión)", con entrada en el índice, que diga qué financia (la infraestructura de un barrio, con el monto calculado por `lib/bien-comun/barrio.ts`), cómo cobra (a medida que entran las cuotas, con la prima objetivo leída del módulo y el plazo máximo "sin dato") y por qué no hay fecha fija (la parte de lo que debe que tendría el fideicomiso a los 12 y a los 24 meses, calculada). MUST decir que primero sería entre pocos inversores conocidos, que un ticket chico al público necesita una vía de oferta pública a verificar con abogado, y que el Token Equity queda fuera de este acuerdo. MUST llevar el sello de propuesta, el aviso de simulación, los ⚖ `tokeninversor` y `fideicomisobarrio`, y un enlace a `/bien-comun`. MUST mantener el permiso actual de la página.

#### Scenario: Por qué no hay fecha fija
- **WHEN** una persona del equipo con sesión abre `/netx/financiamiento#m-token-inversor`
- **THEN** lee el monto a levantar, la cobertura a 12 y a 24 meses calculadas por el módulo, "sin dato" para el plazo máximo y un enlace a `/bien-comun`

#### Scenario: Sin sesión
- **WHEN** una persona sin sesión pide `/netx/financiamiento`
- **THEN** el acceso se comporta igual que antes de este cambio

### Requirement: El diseño B sigue, con contexto
Las secciones de series y dinero temprano de `/netx/financiamiento` SHALL sumar una línea que diga que la propuesta v0.1 ubica el fideicomiso de cada barrio como una serie y suma el Token Inversor, en discusión. MUST NOT borrar ni reescribir el resto del diseño B.

#### Scenario: Línea de contexto
- **WHEN** una persona lee la sección de series
- **THEN** lee la línea sobre la propuesta v0.1 "en discusión"

### Requirement: El híbrido no contradice la propuesta
`/lotes/hibrido` MUST NOT decir que el costo del común se cubriría con el token del bien común. SHALL decir que FARO no levanta capital y que el resto saldría de lo que el común produce, del prepago de servicios y de los barrios que sigan, con monto "sin dato", en los dos idiomas, y SHALL enlazar a `/bien-comun` como propuesta en discusión.

#### Scenario: Resto del costo
- **WHEN** una persona lee de dónde saldría el resto del costo del común en `/lotes/hibrido`
- **THEN** lee que FARO no levanta capital y un enlace a la propuesta en discusión

### Requirement: Vista NetX y Sumarte enlazan la propuesta
La tarjeta "Bien común" de `/netx` SHALL enlazar a `/bien-comun` como "propuesta v0.1, en discusión". La sección Invertir de Sumarte SHALL nombrar al Token Inversor como propuesta en discusión con enlace a `/bien-comun`. El texto del enlace al bien común que comparten la lista de lotes, el híbrido y Sumarte SHALL decir "ver la propuesta en discusión".

#### Scenario: Enlace desde Sumarte
- **WHEN** una persona lee la sección Invertir de `/sumarte`
- **THEN** lee "Token Inversor", "en discusión" y un enlace a `/bien-comun`

### Requirement: Ningún texto vende FARO
Ningún texto de la plataforma MUST hablar de vender FARO, de su precio, de tramos, de staking ni de rendimiento de FARO, salvo la sección "Qué cambió" de `/bien-comun`. Un test SHALL vigilarlo.

#### Scenario: Barrido
- **WHEN** corre el test de barrido sobre `app/`, `components/` y los diccionarios
- **THEN** "tramo", "staking" y "precio de FARO" solo aparecen en los textos de "Qué cambió"

### Requirement: Calidad
Las páginas tocadas SHALL seguir pasando axe, usar solo tokens del tema, no escribir números del modelo y decir "bien común" (nunca "procomún") y "comunidad" (nunca "tribu") en los textos nuevos. MUST NOT nombrar a Hadron como decisión.

#### Scenario: Accesibilidad
- **WHEN** corre `e2e/accesibilidad.spec.ts`
- **THEN** `/netx/financiamiento`, `/netx`, `/lotes/hibrido` y `/sumarte` no tienen violaciones
