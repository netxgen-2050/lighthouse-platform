# Spec Delta

## Purpose

Permitir recorrer la compra de un lote de punta a punta como una simulación: reservar, pago simulado y boleto de ejemplo, sin cobrar, sin datos de identidad y guardado solo en el navegador.

## ADDED Requirements

### Requirement: Solo lo que permite el estado administrativo
El flujo SHALL ofrecerse según las acciones que devuelve el estado administrativo de `lighthouse-norte`, y solo sobre un lote disponible. Un lote reservado o vendido MUST NOT ofrecer reservar. Las fincas de Soluna MUST seguir sin ofrecerlo.

#### Scenario: Lote vendido
- **WHEN** una persona con sesión abre un lote vendido
- **THEN** lee "Vendido" y no hay botón para reservar

#### Scenario: Finca de Soluna
- **WHEN** una persona elige una finca de Soluna
- **THEN** solo se ofrece consultar

### Requirement: Reservar
Una persona con sesión SHALL poder reservar un lote disponible, con el botón "Reservar (simulado)". La pantalla MUST decir que no reserva ningún lote de verdad y ofrecer deshacerlo. Sin sesión, la acción MUST reemplazarse por una invitación a entrar, sin guardar nada.

#### Scenario: Reservar
- **WHEN** una persona con sesión aprieta "Reservar (simulado)" con el teclado
- **THEN** lee que la reserva es simulada, el foco pasa al paso siguiente y el lote figura como "Reservado (simulado, por vos)"

#### Scenario: Sin sesión
- **WHEN** una persona sin sesión abre un lote disponible
- **THEN** ve "Entrá para reservar este lote" y no se guarda ninguna clave de persona

#### Scenario: Deshacer
- **WHEN** la persona aprieta "Deshacer"
- **THEN** el lote vuelve a "Disponible" también al recargar

### Requirement: Pago simulado
Después de reservar, la persona SHALL poder simular el pago. La pantalla MUST decir que no se cobra nada, MUST NOT tener ningún campo de pago y MUST NOT hacer un pedido de red con estos datos. MUST mostrar el precio y el aporte por separado.

#### Scenario: Pagar
- **WHEN** la persona aprieta "Simular el pago" y confirma
- **THEN** lee que no se cobró nada, y no se envió ningún pedido de red con datos del lote

#### Scenario: Sin campos
- **WHEN** la persona mira el paso de pago simulado
- **THEN** no hay ningún campo de tarjeta, cuenta ni documento

### Requirement: Boleto de ejemplo
Después del pago simulado, la persona SHALL ver un "Boleto de ejemplo" con la marca visible "SIMULADO · SIN VALOR LEGAL · NO SE PAGÓ NADA" antes de cualquier dato, y un ⚖ en borrador. MUST mostrar el lote, lo que se vio de precio, aporte y expensa, y "Aprobación municipal: supuesto de trabajo, no otorgada".

#### Scenario: Boleto
- **WHEN** la persona confirma el pago simulado
- **THEN** ve el boleto con la marca, "Comprador: Persona de ejemplo", "Vendedor: sin dato" y "supuesto de trabajo, no otorgada"

#### Scenario: Con casa
- **WHEN** la persona eligió "Con casa de referencia"
- **THEN** el boleto dice la opción y "Precio de la casa: sin dato"

#### Scenario: En inglés
- **WHEN** la persona ve el boleto en inglés
- **THEN** lee "SIMULATED · NO LEGAL VALUE · NOTHING WAS PAID"

### Requirement: Guardado en el navegador sin datos de identidad
Lo elegido SHALL guardarse solo en el navegador, separado por persona, con el lote, la opción, el paso, las fechas y lo que se vio. MUST NOT guardar nombre, documento, domicilio ni datos de pago. Debe entrar en la descarga de "Mis datos" y en "Borrar todo".

#### Scenario: Recargar
- **WHEN** la persona recarga la ficha después de pagar
- **THEN** sigue viendo el boleto

#### Scenario: Dato guardado inválido
- **WHEN** lo guardado no se puede leer
- **THEN** la ficha funciona como si no hubiera compras

#### Scenario: Borrar todo
- **WHEN** la persona usa "Borrar todo lo de este navegador" y confirma
- **THEN** ya no hay reservas ni boletos

### Requirement: Un boleto muestra lo que se vio
El boleto SHALL mostrar los valores y la versión del modelo vigentes al reservar, aunque el modelo cambie después.

#### Scenario: Cambia el modelo
- **WHEN** el módulo cambia de versión y la persona vuelve a su boleto
- **THEN** sigue viendo los valores y la versión de cuando reservó
