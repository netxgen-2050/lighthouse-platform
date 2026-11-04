# Spec Delta

## Purpose

Mostrar, en una lista y en una ficha por lote, qué se compraría en Lighthouse VRN: superficie, precio de ejemplo, estado, derechos y deberes, costos y estado administrativo.

## ADDED Requirements

### Requirement: Lista de lotes
`/lotes` SHALL listar todos los lotes con su número, superficie y estado en texto y forma, un enlace a su ficha, el estado administrativo completo de `lighthouse-norte` y la marca "Loteo provisorio, ilustrativo". El rail SHALL mostrar el destino "Lotes" en el grupo Descubrir.

#### Scenario: Abrir la lista
- **WHEN** una persona abre `/lotes` sin sesión
- **THEN** ve los lotes, el estado administrativo y "Loteo provisorio, ilustrativo"

#### Scenario: Rail
- **WHEN** una persona está en `/lotes/lote-7`
- **THEN** el enlace "Lotes" del rail tiene `aria-current="page"`

### Requirement: Ficha del lote
`/lotes/[id]` SHALL mostrar la superficie, el estado, el precio del lote, los costos, los derechos y deberes, el estado administrativo completo y quién vende como "sin dato". Un id desconocido MUST dar la página de no encontrado.

#### Scenario: Ficha
- **WHEN** una persona abre `/lotes/lote-1`
- **THEN** lee "Lote 1", "1.755 m²", "Disponible", "supuesto de trabajo, no otorgada" y "Quién vende: sin dato"

#### Scenario: Lote inexistente
- **WHEN** una persona abre `/lotes/no-existe`
- **THEN** ve la página de no encontrado

### Requirement: Precio del lote marcado de ejemplo
La ficha SHALL mostrar el precio del lote según su superficie, con el texto "precio de ejemplo, a confirmar", su ⚖ en borrador y el rango de precios de lotes. El valor MUST salir del módulo del modelo. MUST NOT mostrar USD 500.000 por familia.

#### Scenario: Precio
- **WHEN** una persona lee la ficha de `lote-1`, de 1.755 m²
- **THEN** lee "USD 21.064", "precio de ejemplo, a confirmar", el rango de USD 15.000 a USD 40.000 y su ⚖

### Requirement: Costos, aporte y expensas
La ficha SHALL mostrar el aporte único al procomún, las expensas por año, la infraestructura y la parte del dueño, cada una con su valor marcado "de ejemplo". El aporte MUST mostrarse aparte del precio, sin sumarlos, y decir que no hay dato de si va incluido.

#### Scenario: Valores
- **WHEN** una persona lee los costos de `lote-1` con "Solo el lote"
- **THEN** lee el aporte "USD 1.053", las expensas "USD 1.200" por año, la infraestructura "USD 12.000" y la parte del dueño "USD 4.213", todos de ejemplo

#### Scenario: Aporte y precio
- **WHEN** una persona compara el aporte con el precio
- **THEN** no están sumados, y lee que si se suma o va incluido es "sin dato"

### Requirement: Derechos y deberes
La ficha SHALL listar qué daría el lote y qué pediría, con un ⚖ en borrador, y decir que ningún pase, ticket ni token da prioridad, crédito o reserva sobre un lote.

#### Scenario: Leer
- **WHEN** una persona lee "Derechos y deberes"
- **THEN** encuentra servidumbres, reglamento, aporte, expensas y preferencia de reventa, con su ⚖
- **AND** lee que ningún pase da prioridad sobre un lote

### Requirement: Opción con casa
La ficha SHALL ofrecer elegir entre "Solo el lote", "Casa modular", "Casa familiar" y "Casa amplia". Cada casa MUST decir sus m², su precio y el total de lote más casa, marcados como estimación de ejemplo y sin presupuesto. La elección MUST poder hacerse con el teclado, y el aporte MUST recalcularse sobre la opción elegida.

#### Scenario: Con casa
- **WHEN** una persona elige "Casa familiar" con el teclado en `lote-1`
- **THEN** lee "170 m²", "referencia de Martín", "USD 238.000", el total "USD 259.064" y "estimación de ejemplo"
- **AND** el aporte pasa a "USD 12.953"

### Requirement: Hablar con alguien
La ficha SHALL ofrecer "Hablar con alguien", con el mismo pedido de contacto de la plataforma, registrado como consulta por un lote de Lighthouse VRN, con destino "Equipo NetX". Enviarlo MUST NOT reservar el lote.

#### Scenario: Enviar
- **WHEN** una persona con sesión envía el pedido desde el lote 7
- **THEN** el pedido figura como "Consulta por un lote de Lighthouse VRN · Lote 7", con destino "Equipo NetX"
- **AND** el lote sigue "Disponible"

### Requirement: Del mapa a la ficha
El panel de un lote en el mapa SHALL enlazar a su ficha. El mapa, la lista y la ficha MUST mostrar el mismo estado para un mismo lote.

#### Scenario: Enlace
- **WHEN** la persona elige el lote 7 en el mapa y activa "Ver la ficha"
- **THEN** llega a `/lotes/lote-7`

### Requirement: Calidad de la ficha
`/lotes` y `/lotes/[id]` SHALL mostrar el aviso de prototipo, ser bilingües (es/en), usar solo tokens del tema, pasar la auditoría de axe en los dos idiomas y no tener scroll horizontal a 390 px.

#### Scenario: Inglés
- **WHEN** una persona abre una ficha en inglés
- **THEN** los títulos, los costos y el estado se leen en inglés, y "sin dato" se lee como en el resto de la plataforma en ese idioma

#### Scenario: Celular
- **WHEN** la ficha se ve a 390 × 844 px
- **THEN** no hay scroll horizontal
