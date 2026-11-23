# Spec Delta

## Purpose

Mostrar en la ficha de cada lote de `lighthouse-norte` el plan en cuotas como Token Tierra simulado y el FARO que se acredita con cada cuota, según la propuesta v0.1 (`NS_Tokenomics` doc 34 §3), y dejar el NFT del lote como la ficha del lote.

## ADDED Requirements

### Requirement: Plan en cuotas como Token Tierra
Cada ficha de `lighthouse-norte` SHALL mostrar la tarjeta "Plan en cuotas · Token Tierra (simulado)" con una elección accesible entre contado y 12, 24 o 36 cuotas (de partida, la del módulo), y el anticipo y la cuota del precio del lote, calculados por el módulo. El plan MUST aplicarse solo al lote; si hay casa elegida, SHALL decir que la casa se paga aparte. Interés y actualización MUST mostrarse "sin dato".

#### Scenario: Plan de partida
- **WHEN** una persona abre `/lotes/lote-1`
- **THEN** lee la tarjeta con 24 cuotas elegidas, el anticipo y el valor de cada cuota, leídos del módulo

#### Scenario: Cambiar el plan con teclado
- **WHEN** elige "12 cuotas" con las flechas del teclado
- **THEN** la cuota se recalcula y el anticipo no cambia

#### Scenario: Contado
- **WHEN** elige "Contado"
- **THEN** lee un solo pago igual al precio del lote y ninguna cuota

### Requirement: FARO con cada cuota
La tarjeta SHALL mostrar cuántos FARO se acreditarían con el anticipo, con cada cuota y en total, calculados por el módulo a partir de la superficie del lote, y que si se deja de pagar el FARO de las cuotas no pagadas no se emite. La suma del anticipo y todas las cuotas MUST ser igual a los FARO del lote. Sin superficie, MUST mostrar "sin dato".

#### Scenario: Proporcional a lo pagado
- **WHEN** una persona lee la tarjeta de un lote con superficie
- **THEN** lee los FARO del anticipo, los de cada cuota y el total, y la frase de que el FARO de las cuotas no pagadas no se emite

### Requirement: Avisos de Token Tierra
La tarjeta SHALL decir, en texto, que es una simulación, que no es una oferta, que Token Tierra no arranca antes de la aprobación municipal (Ordenanza 173/2026) y que esa aprobación no está otorgada, y que lo legal está a verificar con abogado, con los ⚖ `tokentierra` y `ordenanza173`. MUST enlazar a `/bien-comun`.

#### Scenario: Ordenanza 173
- **WHEN** una persona lee la tarjeta
- **THEN** lee "Ordenanza 173" y que la aprobación no está otorgada, y nunca lee que esté aprobada

### Requirement: El NFT como ficha del lote
La tarjeta del NFT SHALL llamarse "Ficha del lote (NFT, simulado)" y mostrar superficie, contorno, estado administrativo, deberes y red, sin la cantidad de FARO. SHALL decir que no es un instrumento de inversión y que no reemplaza la escritura. El ⚖ `nftlote` SHALL reescribirse en ese sentido, con `borrador: true`.

#### Scenario: Sin FARO en la ficha del NFT
- **WHEN** una persona lee la ficha del lote (NFT)
- **THEN** lee "no es un instrumento de inversión" y no lee una cantidad de FARO en esa tarjeta

### Requirement: Boleto con el plan
El pago simulado SHALL ser el primer pago (el precio entero si es contado; el anticipo si es en cuotas) y así se rotula. El boleto de ejemplo SHALL mostrar el plan elegido, el anticipo, la cuota, los FARO acreditados con el primer pago y los que se acreditarían con cada cuota, todo marcado como simulado. Una compra simulada guardada antes de este cambio MUST seguir mostrándose sin error.

#### Scenario: Boleto en cuotas
- **WHEN** una persona elige 24 cuotas, reserva y simula el primer pago
- **THEN** el boleto dice "24 cuotas", el anticipo, la cuota y los FARO acreditados con el anticipo

#### Scenario: Compra vieja
- **WHEN** el navegador tiene una compra simulada guardada sin plan
- **THEN** la ficha y el boleto se muestran como antes, sin error

### Requirement: Primeros 4 lotes y Soluna
Los primeros 4 lotes (`lighthouse-primeros`) MUST NOT mostrar la tarjeta de Token Tierra ni FARO en la ficha, el boleto ni el panel del mapa; SHALL decir que el plan en cuotas para esos lotes es "sin dato". `accionesDeLote("soluna")` MUST seguir devolviendo solo `consultar`.

#### Scenario: Lote 535
- **WHEN** una persona abre `/lotes/lote-535`
- **THEN** no lee "Token Tierra" ni FARO y lee "sin dato" para el plan en cuotas

### Requirement: Calidad de la ficha
La ficha SHALL seguir siendo bilingüe, pasar axe en los dos idiomas, no tener scroll horizontal a 390 px, usar solo tokens del tema y no escribir números en pantalla ni en el diccionario. La tarjeta de Token Tierra SHALL vivir en un componente que recibe datos y textos por props.

#### Scenario: Inglés
- **WHEN** una persona abre `/lotes/lote-1?lang=en`
- **THEN** lee la tarjeta del plan en inglés y axe no reporta violaciones

### Requirement: Estado de un lote en cuotas
<!-- Decisión de Gus, 23-nov-2026 (issue #79) -->
Después del primer pago con un plan en cuotas, el lote MUST mostrarse como "En cuotas (simulado)" ("In instalments (simulated)"), y nunca como vendido. "Vendido (simulado, a vos)" SHALL quedar solo para la compra al contado.

#### Scenario: Compra en 24 cuotas
- **WHEN** una persona paga el anticipo de un plan de 24 cuotas
- **THEN** la ficha, la lista y el mapa muestran el lote como "En cuotas (simulado)"

#### Scenario: Compra al contado
- **WHEN** una persona paga al contado
- **THEN** el lote se muestra como "Vendido (simulado, a vos)"
