# Spec Delta

## Purpose

Mostrar, como simulación para el equipo, cómo un NFT por lote y un token del bien común podrían financiar y gobernar lo común de Lighthouse VRN, sin emitir, cobrar ni prometer nada.

## ADDED Requirements

### Requirement: Página del bien común
`/bien-comun` SHALL mostrar "El bien común de Lighthouse VRN" con un aviso fijo de que es una simulación, no se emite ningún token, nada se cobra y nada está decidido. MUST ser pública, bilingüe y estar enlazada desde el rail, `/lotes`, `/lotes/hibrido`, cada ficha y la sección Invertir de Sumarte.

#### Scenario: Aviso
- **WHEN** una persona sin sesión abre `/bien-comun`
- **THEN** lee el aviso de simulación antes de cualquier número

### Requirement: Ostrom
La página SHALL mostrar los 8 principios de Elinor Ostrom con cómo los tomaría el diseño, cada uno marcado como "idea".

#### Scenario: Principios
- **WHEN** una persona lee esa sección
- **THEN** lee 8 filas, cada una con "idea"

### Requirement: Dos tipos de token
La página SHALL explicar el NFT del lote (deberes, metadata, que no reemplaza la escritura) y el token del bien común con su nombre provisorio, con ⚖ en borrador.

#### Scenario: Nombre provisorio
- **WHEN** una persona lee la tarjeta del token del bien común
- **THEN** lee "FARO" y "nombre provisorio"

### Requirement: Reparto y parcelas comunes
La página SHALL mostrar el reparto del token (que suma 100 %, con tabla además de las barras) y las parcelas comunes leídas del loteo, como tokens semi-fungibles (ERC-1155) del tesoro, divididos en cuotas de cuidado y uso que no se venden ni se transfieren.

#### Scenario: Parcelas comunes como cuotas
- **WHEN** una persona lee las parcelas comunes
- **THEN** lee que cada parcela sería un token semi-fungible (ERC-1155) con cuotas de cuidado y uso que no se venden ni se transfieren

#### Scenario: Reparto
- **WHEN** una persona lee el reparto
- **THEN** lee los cuatro grupos con su porcentaje en una tabla

### Requirement: Venta temprana por tramos
La página SHALL mostrar los tramos y una calculadora accesible que, para un monto en USD, diga cuántos tokens recibiría, el precio promedio, los tramos que toca y lo que iría al tesoro. MUST decir que no se puede comprar y MUST NOT guardar nada.

#### Scenario: Calcular
- **WHEN** una persona escribe un monto con el teclado
- **THEN** una región que se anuncia muestra los tokens y el precio promedio, calculados por el módulo

#### Scenario: Monto chico
- **WHEN** escribe menos que el mínimo
- **THEN** lee el monto mínimo, sin resultado

### Requirement: Staking, CAPEX y OPEX, riesgos
La página SHALL comparar las dos opciones de staking, decir de dónde saldría la plata para inversión inicial y para mantenimiento (montos "sin dato"), nombrar los referentes como "a verificar" y listar los riesgos legales y las decisiones pendientes. MUST NOT hablar de ganancia, retorno ni valorización.

#### Scenario: Sin promesas
- **WHEN** se busca "ganancia", "retorno" o "valorización" en la página
- **THEN** no aparece

### Requirement: NFT en la ficha y en el boleto
Cada ficha SHALL mostrar "NFT del lote (simulado)" con su metadata y los tokens que traería, leídos del módulo. El boleto de ejemplo SHALL decir que se acuñaría el NFT y se asignarían esos tokens, todo simulado. La nota provisoria de costos MUST NOT decir "RAIZ".

#### Scenario: Ficha
- **WHEN** una persona abre `/lotes/lote-535`
- **THEN** lee "NFT del lote (simulado)" y los FARO que trae ese lote

#### Scenario: Boleto
- **WHEN** reserva y simula el pago
- **THEN** el boleto dice que se acuñaría el NFT del lote y cuántos FARO se asignarían

### Requirement: Calidad
`/bien-comun` SHALL mostrar el aviso de prototipo, ser bilingüe, pasar axe en los dos idiomas, no tener scroll horizontal a 390 px, usar solo tokens del tema y no escribir números en la pantalla.

#### Scenario: Inglés
- **WHEN** una persona abre `/bien-comun?lang=en`
- **THEN** lee el contenido en inglés, sin español suelto
