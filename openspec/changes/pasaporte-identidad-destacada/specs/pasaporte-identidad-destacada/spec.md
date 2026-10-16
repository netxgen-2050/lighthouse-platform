# Spec Delta

## Purpose

Hace visible y explícita la verificación de identidad (KYC simulado) en el Pasaporte: una tarjeta principal que dice en qué estado está, para qué sirve y cómo completarla (issue #59, backlog B5).

## ADDED Requirements

### Requirement: Tarjeta de identidad primero
`/pasaporte` SHALL show a "Verificá tu identidad (KYC)" card before "Tus sellos", as a section with its own heading and the existing `kyc` legal term.

#### Scenario: Orden en la página
- **WHEN** una persona abre `/pasaporte`
- **THEN** el primer encabezado de sección después del título es "Verificá tu identidad (KYC)" y "Tus sellos" viene después

### Requirement: Indicador de estado escrito
The card SHALL show a three-step indicator "Sin empezar", "En trámite", "Verificada", marking the current step with text and `aria-current="step"`, never only with color.

#### Scenario: En trámite
- **WHEN** la persona envió su verificación y no fue aprobada
- **THEN** el paso "En trámite" tiene `aria-current="step"` y la tarjeta dice "Enviaste tus datos el <fecha>"

### Requirement: Para qué sirve y qué no requiere
Before verification, the card SHALL explain that the trustee asks for it before contributing money (invitation to the Lote 7 project or a money contribution in Pactos), that it is not needed to explore, join a tribe or propose time pacts, and list the five steps of the existing verification dialog.

#### Scenario: Sin empezar
- **WHEN** una persona sin trámite abre `/pasaporte`
- **THEN** la tarjeta nombra la invitación al proyecto del Lote 7 y el aporte en plata, dice que no hace falta para sumarse a una tribu, lista los cinco pasos y muestra "Completar mi verificación (KYC)"

### Requirement: Completar desde la tarjeta
"Completar mi verificación (KYC)" SHALL open the existing verification dialog; when it closes, focus MUST return to that button.

#### Scenario: Abrir y cerrar
- **WHEN** la persona aprieta "Completar mi verificación (KYC)" y cierra el diálogo con Escape
- **THEN** el foco vuelve al botón

#### Scenario: Aprobación simulada
- **WHEN** con el trámite en curso aprieta "Simular: verificación aprobada" en la tarjeta
- **THEN** la tarjeta pasa a "Verificada" y el sello "Identidad verificada" figura como obtenido

### Requirement: Estado verificado compacto
Once verified, the card SHALL collapse to one line with the approval date and state whether the person is an enabled investor; with foreign tax residence it MUST say not for now and show the existing `inversorexterior` legal term.

#### Scenario: Residencia en Argentina
- **WHEN** la verificación está aprobada y la residencia fiscal es Argentina
- **THEN** la tarjeta dice "Identidad verificada el <fecha> (simulado)" y que quedó habilitada como inversora

#### Scenario: Residencia en el exterior
- **WHEN** la verificación está aprobada y la residencia fiscal es del exterior
- **THEN** la tarjeta dice que por ahora no está habilitada como inversora y muestra el ⚖ `inversorexterior`

### Requirement: Enlace directo a la tarjeta
Opening `/pasaporte#identidad` SHALL scroll to the card and move focus to its heading.

#### Scenario: Desde otra pantalla
- **WHEN** alguien abre `/pasaporte#identidad`
- **THEN** el foco queda en el encabezado "Verificá tu identidad (KYC)"

### Requirement: Sello sin acción duplicada
The "Identidad verificada" stamp in the grid SHALL keep its state and what it opens, but replace its verify button with a "Ver la verificación" link to `#identidad`; the simulated approval button MUST live only in the card.

#### Scenario: Sello sin trámite
- **WHEN** la persona no empezó el trámite
- **THEN** el sello "Identidad verificada" no tiene botón "Verificar mi identidad" y tiene el enlace "Ver la verificación"
