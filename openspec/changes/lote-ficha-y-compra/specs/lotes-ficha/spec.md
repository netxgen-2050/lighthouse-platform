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
`/lotes/[id]` SHALL mostrar la superficie, el estado, el precio de referencia, los costos, los derechos y deberes, el estado administrativo completo y quién vende como "sin dato". Un id desconocido MUST dar la página de no encontrado.

#### Scenario: Ficha
- **WHEN** una persona abre `/lotes/lote-1`
- **THEN** lee "Lote 1", "1.344 m²", "Disponible", "supuesto de trabajo, no otorgada" y "Quién vende: sin dato"

#### Scenario: Lote inexistente
- **WHEN** una persona abre `/lotes/no-existe`
- **THEN** ve la página de no encontrado

### Requirement: Precio de referencia marcado de ejemplo
La ficha SHALL mostrar el precio de referencia con el texto "de ejemplo, a confirmar" y su ⚖ en borrador, diciendo que es por familia, como mínimo e igual para todos los lotes por ahora. El valor MUST salir del módulo del modelo.

#### Scenario: Precio
- **WHEN** una persona lee la ficha de cualquier lote
- **THEN** lee "Desde USD 500.000 por familia", "precio de referencia, de ejemplo, a confirmar" y su ⚖

### Requirement: Costos, aporte y expensas
La ficha SHALL mostrar el aporte único al procomún, las expensas por año, la infraestructura y la parte del dueño, cada una con su valor o "sin dato". El aporte MUST mostrarse aparte del precio, sin sumarlos, y decir que no hay dato de si va incluido.

#### Scenario: Valores
- **WHEN** una persona lee los costos
- **THEN** lee el aporte "USD 25.000", las expensas "USD 3.000" por año, e Infraestructura y Parte del dueño "sin dato"

#### Scenario: Aporte y precio
- **WHEN** una persona compara el aporte con el precio
- **THEN** no hay un total, y lee que si se suma o va incluido es "sin dato"

### Requirement: Derechos y deberes
La ficha SHALL listar qué daría el lote y qué pediría, con un ⚖ en borrador, y decir que ningún pase, ticket ni token da prioridad, crédito o reserva sobre un lote.

#### Scenario: Leer
- **WHEN** una persona lee "Derechos y deberes"
- **THEN** encuentra servidumbres, reglamento, aporte, expensas y preferencia de reventa, con su ⚖
- **AND** lee que ningún pase da prioridad sobre un lote

### Requirement: Opción con casa
La ficha SHALL ofrecer elegir entre "Solo el lote" y "Con casa de referencia". La casa MUST describirse como de 170 m² y borrador de Martín, con su precio y el total como "sin dato". La elección MUST poder hacerse con el teclado.

#### Scenario: Con casa
- **WHEN** una persona elige "Con casa de referencia" con el teclado
- **THEN** lee "170 m²", "borrador de Martín", "Precio: sin dato" y "Total: sin dato"

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
