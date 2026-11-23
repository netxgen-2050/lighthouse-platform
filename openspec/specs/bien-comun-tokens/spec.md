# bien-comun-tokens Specification

## Purpose
Mostrar, como simulación para el equipo, cómo un NFT por lote y un token del bien común podrían financiar y gobernar lo común de Lighthouse VRN, sin emitir, cobrar ni prometer nada.

## Requirements

### Requirement: Página del bien común
`/bien-comun` SHALL mostrar "El bien común de Lighthouse VRN" con un aviso fijo de que es una simulación, no se emite ningún token, nada se cobra y nada está decidido. MUST ser pública, bilingüe y estar enlazada desde el rail, `/lotes`, `/lotes/hibrido`, cada ficha de `lighthouse-norte` y la sección Invertir de Sumarte.

#### Scenario: Aviso
- **WHEN** una persona sin sesión abre `/bien-comun`
- **THEN** lee el aviso de simulación antes de cualquier número

### Requirement: Ostrom
La página SHALL mostrar los 8 principios de Elinor Ostrom con cómo los tomaría el diseño, cada uno marcado como "idea".

#### Scenario: Principios
- **WHEN** una persona lee esa sección
- **THEN** lee 8 filas, cada una con "idea"

### Requirement: NFT del lote y parcelas comunes
La página SHALL explicar el NFT del lote (deberes, metadata, que no reemplaza la escritura) y mostrar las parcelas comunes leídas del loteo, como un registro del tesoro que no son tokens y no se venden. El modelo de FARO (puertas, política, reparto, venta) lo define `bien-comun-propuesta`, que reemplazó aquí los requisitos de tramos, staking y reparto fijo (23-nov).

#### Scenario: Parcelas comunes sin token
- **WHEN** una persona lee las parcelas comunes
- **THEN** lee que no son tokens, que quedan en un registro del tesoro y que ninguna se vende

### Requirement: NFT en la ficha y en el boleto
Cada ficha de `lighthouse-norte` SHALL mostrar "NFT del lote (simulado)" con su metadata y los tokens que traería, leídos del módulo. El boleto de ejemplo SHALL decir que se acuñaría el NFT y se asignarían esos tokens, todo simulado. Los primeros 4 lotes (`lighthouse-primeros`) MUST NOT mostrar la tarjeta ni FARO en la ficha, el boleto ni el panel del mapa: si aportan al bien común es "sin dato" (R40; Gus, 19-nov). La nota provisoria de costos MUST NOT decir "RAIZ".

#### Scenario: Ficha
- **WHEN** una persona abre `/lotes/lote-1`
- **THEN** lee "NFT del lote (simulado)" y los FARO que trae ese lote

#### Scenario: Primeros 4 lotes
- **WHEN** una persona abre `/lotes/lote-535`, reserva y simula el pago, o lo elige en el mapa
- **THEN** no lee "NFT del lote" ni FARO

#### Scenario: Boleto
- **WHEN** reserva y simula el pago
- **THEN** el boleto dice que se acuñaría el NFT del lote y cuántos FARO se asignarían

### Requirement: Calidad
`/bien-comun` SHALL mostrar el aviso de prototipo, ser bilingüe, pasar axe en los dos idiomas, no tener scroll horizontal a 390 px, usar solo tokens del tema y no escribir números en la pantalla.

#### Scenario: Inglés
- **WHEN** una persona abre `/bien-comun?lang=en`
- **THEN** lee el contenido en inglés, sin español suelto
