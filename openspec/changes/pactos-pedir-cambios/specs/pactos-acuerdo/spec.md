# Spec Delta

## ADDED Requirements

### Requirement: La tribu pide cambios
En `/pactos/responder`, quien puede responder un pacto o un cambio pendiente SHALL tener "Pedir cambios", que pide otras horas por mes (dentro de los mismos límites que el pacto) y un mensaje obligatorio de hasta 500 caracteres. Las horas MUST ser distintas de las propuestas. Al confirmar, la propuesta de la persona SHALL dejar de estar pendiente para la tribu.

#### Scenario: Pedir menos horas
- **WHEN** `admin@prueba.test` pide cambios al pacto de 32 h/mes con 16 h/mes y el mensaje "Arranquemos con 16 y lo vemos en marzo"
- **THEN** el pacto sale de los pendientes de la tribu y aparece en "Esperando que persona@prueba.test responda tus cambios"

#### Scenario: Sin mensaje o con las mismas horas
- **WHEN** quien lidera confirma "Pedir cambios" sin mensaje o con las mismas horas que la propuesta
- **THEN** no se registra nada y ve qué le falta

### Requirement: La persona acepta los cambios o retira
Con cambios pedidos por la tribu, `/pactos` SHALL mostrar "<comunidad> pide cambios" con las horas propuestas por la persona, las de la tribu y el mensaje, y los botones "Aceptar los cambios" y "Retirar". Aceptar SHALL dejar el pacto (o el cambio) aceptado con las horas de la tribu y la versión siguiente. Retirar SHALL devolver el pacto a Borrador (o el cambio a borrador) con el contenido de la persona.

#### Scenario: Acepta
- **WHEN** la persona acepta los cambios de 32 a 16 h/mes de su primer pacto
- **THEN** ve el pacto "Aceptado", versión 1, con 16 h/mes, y Semillas calcula con 16 h/mes

#### Scenario: Acepta sobre un cambio
- **WHEN** la tribu pidió 15 h/mes a un cambio de 10 a 20 h/mes y la persona acepta
- **THEN** el pacto queda en versión 2 con 15 h/mes y el historial lo muestra

#### Scenario: Retira
- **WHEN** la persona retira en lugar de aceptar los cambios
- **THEN** su pacto vuelve a Borrador con sus 32 h/mes y la tribu ya no lo ve como esperando respuesta

### Requirement: Constancias del ida y vuelta
"Pedir cambios" SHALL quedar como una propuesta que afirma la tribu (con quien actuó por ella), apunta a la propuesta de la persona y lleva la versión, las horas y el mensaje. "Aceptar los cambios" SHALL quedar como una aceptación que afirma la persona y apunta a la propuesta de la tribu. Un pacto MUST quedar acordado solo con una propuesta de una parte y la aceptación de la otra.

#### Scenario: Acuerdo con contrapropuesta
- **WHEN** la tribu pidió 16 h/mes y la persona aceptó
- **THEN** el registro tiene la propuesta de la persona, la de la tribu que la apunta y la aceptación de la persona que apunta a la de la tribu, y ninguna se editó

### Requirement: Aviso al volver
Cuando la persona abre `/pactos` con cambios pedidos, SHALL anunciarse y registrarse una sola vez en Mi recorrido "<comunidad> pidió cambios a tu pacto". Los textos nuevos SHALL existir en español y en inglés, y la auditoría de axe MUST pasar con cambios pedidos en `/pactos` y en `/pactos/responder`.

#### Scenario: Evento una sola vez
- **WHEN** la tribu pidió cambios y la persona abre `/pactos` dos veces
- **THEN** Mi recorrido tiene un solo "Valle Solar pidió cambios a tu pacto"

#### Scenario: En inglés
- **WHEN** la persona ve los cambios pedidos con la interfaz en inglés
- **THEN** ve "Valle Solar asks for changes", "Accept the changes" y "Withdraw"
