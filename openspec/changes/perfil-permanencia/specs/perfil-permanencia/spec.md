# Spec Delta

## Purpose

Permitir que la persona diga cuánto se quiere involucrar con el territorio (solo invertir, visitar, vivir parte del año o mudarse) para mostrarle primero lo relevante, incluido un atajo directo a la sección de inversores.

## ADDED Requirements

### Requirement: Selector de permanencia en el perfil
La página `/perfil` SHALL mostrar, antes de la conversación, un grupo de opciones con la pregunta "¿Cuánto te querés quedar?" y exactamente cuatro niveles, en este orden: "Solo invertir", "Visitar", "Vivir parte del año" y "Mudarme". Cada nivel MUST tener una línea de texto que lo explique. El grupo MUST ser operable solo con teclado y MUST anunciar el nivel elegido con texto, no solo con color.

#### Scenario: Ver los cuatro niveles
- **WHEN** la persona abre `/perfil`
- **THEN** ve la pregunta "¿Cuánto te querés quedar?" antes de la conversación
- **AND** ve los cuatro niveles en el orden indicado, cada uno con su explicación

#### Scenario: Elegir con teclado
- **WHEN** la persona llega al grupo con Tab y elige "Visitar" con las flechas
- **THEN** "Visitar" queda marcado como elegido

#### Scenario: La entrevista no cambia
- **WHEN** la persona elige cualquier nivel
- **THEN** la conversación de la entrevista sigue disponible con las mismas preguntas

### Requirement: Atajo a inversores
Cuando el nivel elegido es "Solo invertir", `/perfil` SHALL mostrar un recuadro con un enlace "Para inversores" que lleva a `/sumarte#inversores` y una aclaración de que la entrevista sigue disponible para encontrar tribu. Con cualquier otro nivel, o sin nivel, el recuadro MUST NOT mostrarse.

#### Scenario: Elegir solo invertir
- **WHEN** la persona elige "Solo invertir"
- **THEN** ve el enlace "Para inversores"
- **AND** al activarlo llega a la sección "Para inversores" de `/sumarte`

#### Scenario: Otro nivel
- **WHEN** la persona elige "Mudarme"
- **THEN** no ve el recuadro de inversores

### Requirement: Guardado del nivel en modo demostración
El nivel elegido SHALL guardarse en el navegador y MUST recuperarse al volver a `/perfil`. Un valor guardado que no sea uno de los cuatro niveles MUST tratarse como "sin elegir". "Borrar todo" de `/panel` MUST borrar también el nivel. Si el permiso para guardar datos del navegador existe en la plataforma, el nivel MUST guardarse solo con ese permiso.

#### Scenario: Volver al perfil
- **WHEN** la persona elige "Vivir parte del año" y recarga `/perfil`
- **THEN** "Vivir parte del año" sigue elegido

#### Scenario: Valor guardado inválido
- **WHEN** lo guardado para el nivel es un texto que no corresponde a ningún nivel
- **THEN** `/perfil` muestra el selector sin nivel elegido y sin error

#### Scenario: Borrar todo
- **WHEN** la persona eligió un nivel y usa "Borrar todo" en `/panel`
- **THEN** al abrir `/perfil` no hay nivel elegido

### Requirement: Permanencia en Mi recorrido
`/panel` SHALL mostrar una tarjeta "Cuánto te querés quedar" con el nombre del nivel elegido, o "Sin elegir" con un enlace a `/perfil` si no hay nivel. La tarjeta MUST NOT mostrar un nivel que la persona no eligió.

#### Scenario: Con nivel
- **WHEN** la persona eligió "Visitar" y abre `/panel`
- **THEN** la tarjeta dice "Visitar"

#### Scenario: Sin nivel
- **WHEN** la persona no eligió nivel y abre `/panel`
- **THEN** la tarjeta dice "Sin elegir" y enlaza a `/perfil`

### Requirement: Próximo paso para quien solo invierte
Si el nivel es "Solo invertir" y el perfil no está completo, el próximo paso de `/panel` SHALL ser "Mirá cómo invertir" con enlace a `/sumarte#inversores`. En cualquier otro caso, la regla de próximo paso MUST seguir siendo la que ya existía (perfil, compromisos, Congreso).

#### Scenario: Inversor sin perfil
- **WHEN** el nivel es "Solo invertir" y no hay perfil guardado
- **THEN** el próximo paso es "Mirá cómo invertir" y enlaza a `/sumarte#inversores`

#### Scenario: Inversor con perfil completo
- **WHEN** el nivel es "Solo invertir" y el perfil tiene todas sus respuestas confirmadas, sin compromisos
- **THEN** el próximo paso es el de compromisos, como antes

#### Scenario: Otro nivel sin perfil
- **WHEN** el nivel es "Mudarme" y no hay perfil guardado
- **THEN** el próximo paso es completar el perfil, como antes
