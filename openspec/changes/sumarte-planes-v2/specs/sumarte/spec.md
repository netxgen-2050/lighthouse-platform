# Spec Delta

## Purpose

Planes de Sumarte para la fase 1 (Gus, 27-nov-2026): Explorador, Amigo, Fundador y Aliados. Lo que se cobra son utilidades y FARO de prepago, nunca voz ni acceso a un lote o a una inversión.

## ADDED Requirements

### Requirement: Tres planes y Aliados
The system SHALL show at `/sumarte` three plans, Explorador (free), Amigo (monthly or yearly price) and Fundador (one-time price with a cohort cap), plus an Aliados band for organizations whose action opens the contact request instead of choosing a plan. Every price and cap MUST come from `lib/sumarte/datos.ts`. The page MUST NOT show the plans Miembro de la red or Plan Tribu, nor the Semilla, Brote or Raíz levels.

#### Scenario: Planes visibles
- **WHEN** una persona abre `/sumarte`
- **THEN** ve Explorador, Amigo y Fundador con su precio y la franja de Aliados con "Hablemos"
- **AND** no ve "Raíz", "Brote", "Semilla" ni "Plan Tribu"

#### Scenario: Cohorte del Fundador
- **WHEN** una persona mira el plan Fundador
- **THEN** lee cuántos pases quedan como "N de 100", en texto

### Requirement: Tabla de precios en compu
At 1024 px or wider, the system SHALL show the three plans as columns of equal width, with Amigo marked "El más elegido" in text and with an accent border, and below them a comparison table with a sticky header whose cells say "Incluido", "No incluido" or "Próximamente" in text. Below 1024 px the system SHALL show one plan at a time with a three-option keyboard-operable selector and no table, and MUST NOT scroll horizontally at 390 px.

#### Scenario: Compu
- **WHEN** una persona abre `/sumarte` a 1440 px
- **THEN** ve las tres columnas una al lado de la otra y "El más elegido" en Amigo

#### Scenario: Celular
- **WHEN** una persona abre `/sumarte` a 390 px
- **THEN** ve un plan por vez, elige otro con el selector y la página no tiene scroll horizontal

### Requirement: Plan en la URL con direcciones viejas
The chosen plan SHALL be reflected in the URL as `plan=explorador`, `plan=amigo` or `plan=fundador`. The old values `plan=miembro` and `plan=comunidad` MUST lead to Amigo and to the Aliados band.

#### Scenario: Dirección vieja
- **WHEN** una persona abre `/sumarte?plan=miembro`
- **THEN** ve el plan Amigo y la URL dice `plan=amigo`

### Requirement: FARO de prepago en borrador
For Amigo and Fundador, the system SHALL show a block "Cómo funciona el FARO de tu plan" with the five rules of the prepaid FARO (fixed price, redeemable only for what exists, burned on use, expiry, no voice) in text, and the split of the payment between the NetX service and the FARO for the commons. While the data marks the rules as draft, the block MUST show the label "Borrador · a definir" and every number in the rules MUST show "(a definir)" next to it.

#### Scenario: Reglas en borrador
- **WHEN** una persona elige Amigo
- **THEN** lee "Borrador · a definir", las cinco reglas y cuánto de la cuota va al servicio y cuánto a FARO
- **AND** cada número de las reglas dice "(a definir)"

### Requirement: Beneficios que todavía no existen
Every plan benefit that is not built yet SHALL be labelled "Próximamente" in text, never only with an icon or color.

#### Scenario: Bitácora
- **WHEN** una persona mira lo que incluye Amigo
- **THEN** la bitácora de obra dice "Próximamente"

### Requirement: Ningún plan es una inversión ni da un lote
No plan SHALL give priority, reservation or credit toward a lot, nor access to investing. "Comprar un lote" and "Invertir" MUST be shown outside the plans as destination cards. The Sumarte texts MUST NOT contain "inversión", "retorno", "rendimiento" or "de por vida" in Spanish, nor their English equivalents.

#### Scenario: Tarjetas aparte
- **WHEN** una persona baja hasta el final de `/sumarte`
- **THEN** ve las tarjetas "Comprar un lote" e "Invertir", y la de Invertir lleva a `/invertir`
- **AND** no ve "Pedir invitación"

### Requirement: Solo el pago es simulado
The system SHALL never charge: choosing, changing or cancelling a plan MUST be simulated and labelled "(simulado)". The page MUST say that the payment is simulated, never that everything is simulated. A person with Amigo MUST see "Darme de baja" next to their plan, as visible as the button to choose it.

#### Scenario: Darse de baja
- **WHEN** una persona con Amigo aprieta "Darme de baja"
- **THEN** vuelve a Explorador (simulado) y al recargar sigue en Explorador

#### Scenario: Estado viejo guardado
- **WHEN** una persona tenía guardado el Pase Brote del modelo anterior
- **THEN** al abrir `/sumarte` figura como Fundador

## MODIFIED Requirements

### Requirement: Ahorro anual visible por plan
The system SHALL show, while "Anual" is selected, the text "2 meses gratis" next to the Amigo price, in text (not only with color or an icon). While "Mensual" is selected, the text SHALL NOT be shown next to the price; the "Anual" button MAY keep its own "2 meses gratis" label. The selector MUST NOT change the Fundador price.

#### Scenario: Ahorro en anual
- **WHEN** una persona elige "Anual"
- **THEN** Amigo dice "2 meses gratis" junto a su precio anual

#### Scenario: Sin ahorro en mensual
- **WHEN** una persona elige "Mensual"
- **THEN** Amigo no dice "2 meses gratis" junto a su precio

#### Scenario: Fundador no cambia
- **WHEN** una persona alterna entre "Mensual" y "Anual"
- **THEN** el precio del Fundador queda igual

## REMOVED Requirements

### Requirement: Planes para usuarios
**Reason**: Los cuatro planes del mock-up v6 venden funciones en pausa (salas, pactos, tribus, influencia). Gus, 27-nov-2026.
**Migration**: Reemplazado por "Tres planes y Aliados" y "Tabla de precios en compu".

### Requirement: Cohorte del Pase Fundador
**Reason**: El mínimo para abrir el Fondo Común y la cohorte de 300 eran del Pase viejo.
**Migration**: La cohorte del Fundador se muestra como "N de 100" dentro de "Tres planes y Aliados".

### Requirement: Acceso para inversores
**Reason**: Invertir es otro camino, con otros documentos; no va dentro de Sumarte.
**Migration**: Tarjeta "Invertir" que lleva a `/invertir` ("Ningún plan es una inversión ni da un lote").

### Requirement: Todo simulado
**Reason**: La regla vigente es que solo el pago es simulado.
**Migration**: Reemplazado por "Solo el pago es simulado".

### Requirement: Pase Fundador como pago único de por vida
**Reason**: El FARO del Fundador vence, así que "de por vida" ya no es cierto; lo permanente es el registro Génesis.
**Migration**: Fundador como pago único en "Tres planes y Aliados".
