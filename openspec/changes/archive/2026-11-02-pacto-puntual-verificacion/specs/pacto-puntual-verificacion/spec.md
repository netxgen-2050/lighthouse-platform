# Spec Delta

## Purpose

Que una tarea puntual pre-admitida se pueda marcar hecha con sus horas reales, que el holón verifique que se completó, y que recién con esa verificación nazca la constancia base de Semillas de cada persona, por sus propias horas y con el máximo por persona, sin ronda ni evaluación de pares (Backlog D15, D20 y D31; decisiones de Gus del 28-oct).

## ADDED Requirements

### Requirement: Esquemas de horas en las constancias de pactos
Las constancias de pactos SHALL tener dos esquemas más: "propone horas" (la persona dice cuántas horas hizo; apunta a su postulación pre-admitida o a su pacto aceptado y, para un mes, lleva ese mes) y "confirma horas" (la contraparte confirma esas horas; apunta a la propuesta de horas y lleva las horas que vio). Pedir revisar unas horas SHALL ser un "no acepta" con motivo que apunta a la propuesta de horas. Una propuesta de horas MUST tener como mucho una respuesta. Lo mal formado MUST ignorarse al leer sin romper el resto.

#### Scenario: Propuesta de horas
- **WHEN** la persona marca hecha "Energía solar" con 12 h
- **THEN** el registro compartido tiene una constancia "propone horas" afirmada por la persona, con 12 h, que apunta a su postulación pre-admitida

#### Scenario: Dos respuestas
- **WHEN** quien administra el holón verifica unas horas en una pestaña y en otra, con la lista vieja, aprieta "Verificar" otra vez
- **THEN** la segunda no se registra y ve "Estas horas ya se respondieron"

### Requirement: Marcar la tarea hecha
Con la postulación pre-admitida, la persona SHALL poder marcar la tarea como hecha con las horas reales (enteras, de 1 a 200; pueden ser distintas de las pactadas). La tarea SHALL quedar "Hecha · esperando que <holón> verifique" y SHALL poder retirarse mientras no hubo respuesta. La persona MUST NOT tener ningún botón para verificar sus propias horas.

#### Scenario: Otras horas
- **WHEN** en una postulación pre-admitida de 10 h la persona marca la tarea como hecha con 12 h
- **THEN** ve "Hecha · esperando que el círculo Energía solar verifique" con 12 h y ningún botón "Simular"

#### Scenario: Horas fuera de rango
- **WHEN** intenta marcarla hecha con 0 h
- **THEN** ve que las horas van de 1 a 200 y no se registra nada

### Requirement: El holón verifica
Las horas de una tarea SHALL verificarlas, en `/pactos/responder` ("Tareas para verificar"), quien administra el holón de la necesidad, con la misma regla que la pre-admisión. Nadie MUST poder verificar sus propias horas. "Verificar" SHALL confirmar que la tarea quedó hecha y sus horas; "Pedir revisar" SHALL pedir un motivo y devolver la tarea a "Pre-admitida" con el aviso "<holón> pidió revisar tus horas: <motivo>", sin constancia base.

#### Scenario: Verificar
- **WHEN** `admin@prueba.test` verifica las 10 h de `persona@prueba.test` en "Energía solar"
- **THEN** queda una constancia "confirma horas" que afirma `circulo:valle-3`, con `admin@prueba.test` como quien actuó, y la persona ve "Horas verificadas por el círculo Energía solar: 10 h · 50 Semillas" al abrir `/pactos`

#### Scenario: Pedir revisar
- **WHEN** `admin@prueba.test` pide revisar con el motivo "Faltó conectar el inversor"
- **THEN** la persona ve su tarea "Pre-admitida", el aviso con el motivo y ninguna constancia base

#### Scenario: Sus propias horas
- **WHEN** `admin@prueba.test` marcó hecha una tarea propia de Valle Solar y abre `/pactos/responder`
- **THEN** la ve sin botones, y la puede verificar `super@prueba.test`

### Requirement: Constancia base solo con la verificación
Al conciliar una verificación SHALL guardarse una constancia base con la forma de ADR-012: `schema` "semillas-base", `afirma` "netx", `sobre` el pacto puntual, `apunta_a` nulo, la fecha de la verificación, y en `datos` el tipo "puntual", la postulación pre-admitida de la persona, la necesidad, la fecha de la tarea, las horas verificadas, las horas con y sin Semillas, el máximo por persona y el máximo total aplicados (o nulos), el valor de la hora de referencia, el período (`AAAA-MM` de la verificación en hora de Argentina), la versión del pacto (1), la constancia de verificación y las Semillas (`round(horas con Semillas × valor hora)`, sin superar un máximo en Semillas). Su uid MUST empezar con `ejemplo-`. Las Semillas MUST NOT nacer de nada que haga la persona sola. La constancia MUST quedar congelada: se lee tal como se guardó, MUST NOT recalcularse si cambia el valor de la hora y MUST NOT editarse. Conciliar dos veces MUST dejar una sola constancia. Una constancia guardada mal formada MUST descartarse y la tarea SHALL volver a "Hecha · esperando que <holón> verifique".

#### Scenario: Diez horas verificadas
- **WHEN** el círculo verifica 10 h de "Energía solar" en noviembre de 2026
- **THEN** queda una constancia base con 10 h, período "2026-11" y 50 Semillas

#### Scenario: Fin de mes
- **WHEN** la verificación es del 30 de noviembre de 2026 a las 22:30 de Argentina (`2026-12-01T01:30:00Z`)
- **THEN** el período es "2026-11"

#### Scenario: Lo guardado roto
- **WHEN** la constancia guardada no tiene horas
- **THEN** se descarta, la tarea queda esperando la verificación y la pantalla no se rompe

### Requirement: Semillas por persona y máximo por persona
Cuando varias personas toman la misma tarea, cada una SHALL marcar hecha sus propias horas, el holón SHALL verificarlas por separado y cada una SHALL recibir una constancia base propia por sus horas verificadas; la verificación de una persona MUST NOT cambiar las horas ni las Semillas de otra. Si la propuesta pre-admitida trae un máximo por persona (en horas o en Semillas), la constancia SHALL guardar las horas verificadas, las horas con Semillas, las horas sin Semillas y el máximo aplicado, y las Semillas MUST calcularse solo con las horas con Semillas (o MUST NOT superar el máximo en Semillas). Las horas por encima del máximo SHALL mostrarse como horas verificadas sin Semillas, nunca borrarse ni mostrarse como 0. El uid de la constancia MUST NOT llevar el email de la persona.

#### Scenario: Más horas que el máximo
- **WHEN** el círculo verifica 12 h de `persona@prueba.test` en "Energía solar" (máximo por persona: 10 h)
- **THEN** la constancia base tiene 12 h verificadas, 10 h con Semillas, 2 h sin Semillas y 50 Semillas, y la persona ve "12 h verificadas · 10 h con Semillas · 2 h sin Semillas (máximo por persona: 10 h)"

#### Scenario: Dos personas en la misma tarea
- **WHEN** el círculo verifica 10 h de una persona y 6 h de otra en "Energía solar"
- **THEN** hay dos constancias base, una de 50 Semillas y otra de 30, y cada persona ve en `/semillas` solo la suya

#### Scenario: Máximo en Semillas
- **WHEN** la tribu verifica 16 h en "Plomería" de Agua Clara (máximo por persona: 60 Semillas)
- **THEN** la constancia tiene 60 Semillas, 11 h con Semillas y 5 h sin Semillas

### Requirement: Máximo total de la tarea
Si la propuesta pre-admitida trae un máximo total de la tarea (en horas o en Semillas, sumando a todas las personas, fijado por quien administra el holón), las Semillas SHALL repartirse por orden de verificación: cada constancia recibe lo que permite el máximo por persona y lo que queda del total, y MUST NOT superarlo. Las horas que superan el total SHALL mostrarse como horas verificadas sin Semillas, nunca borrarse ni mostrarse como 0. La constancia SHALL guardar el máximo total aplicado (o nulo). El orden y lo ya repartido MUST salir del registro compartido y no del estado local. Una constancia ya emitida MUST NOT recalcularse cuando se verifica a otra persona.

#### Scenario: Se llena el total en horas
- **WHEN** en "Energía solar" (máximo por persona 10 h, total 20 h) el círculo verifica 10 h de una persona, después 12 h de otra y después 6 h de una tercera
- **THEN** las constancias tienen 10 h con Semillas y 50 Semillas; 10 h con Semillas, 2 h sin Semillas y 50 Semillas; y 0 h con Semillas, 6 h sin Semillas y 0 Semillas, y la tercera persona ve "El máximo total de la tarea ya se completó"

#### Scenario: Total en Semillas
- **WHEN** en "Plomería" (máximo por persona 60 Semillas, total 150 Semillas) el equipo verifica 16 h de tres personas, una tras otra
- **THEN** reciben 60, 60 y 30 Semillas

#### Scenario: Orden de verificación
- **WHEN** la persona que se postuló segunda es verificada primera
- **THEN** recibe primero las Semillas del total

### Requirement: Círculos transversales administrados por Hifa
La verificación de una tarea de un círculo transversal SHALL decir que lo administra y facilita Hifa (la IA) y que en el prototipo es simulado y experimental. Como Hifa no está disponible, el super admin SHALL poder responder como respaldo humano, y la verificación o el pedido de revisar MUST dejar `respaldoDeHifa`. La decisión definitiva depende de probar que Hifa sea estable y fiable.

#### Scenario: Respaldo del super admin
- **WHEN** `super@prueba.test` abre `/pactos/responder` con una tarea hecha de un círculo transversal
- **THEN** ve "Lo administra y facilita Hifa (experimental, simulado)", puede verificar, y la constancia de verificación lleva `respaldoDeHifa`

### Requirement: Las Semillas de un puntual se reciben al verificarse
Las Semillas de una constancia base puntual SHALL contarse como "Semillas" (recibidas) desde la verificación. MUST NOT mostrarse como "Semillas pendientes": ese estado es solo de los meses de un compromiso recurrente.

#### Scenario: Recibidas
- **WHEN** la persona tiene una constancia puntual de 50 Semillas y abre `/semillas`
- **THEN** las 50 figuran como Semillas y no como "Semillas pendientes"

### Requirement: Semillas de los pactos puntuales, sin ronda
La tarjeta de Semillas de cada comunidad SHALL mostrar la parte "Pactos puntuales: horas verificadas" con la suma de las Semillas de sus constancias base y, debajo, cada constancia (tarea, horas, fecha de verificación, Semillas). Sin constancias, la parte MUST decir "sin dato", no 0. El total SHALL sumarla. Las Semillas de un puntual MUST contarse una sola vez. Un pacto puntual MUST NOT habilitar la ronda de reconocimiento ni el ajuste por evaluación de pares.

#### Scenario: Con una constancia
- **WHEN** la persona tiene 50 Semillas de un pacto puntual verificado en Valle Solar y ningún otro pacto
- **THEN** la tarjeta de Valle Solar dice "Pactos puntuales: 50", el total es 50 y no aparece la ronda

#### Scenario: Sin constancias
- **WHEN** la persona no tiene pactos puntuales verificados en Valle Solar
- **THEN** "Pactos puntuales" dice "sin dato"

### Requirement: La necesidad hecha
En la ficha de la tribu, una necesidad cuya tarea está marcada hecha SHALL decir "Hecha · esperando verificación" para quien la hizo; con la verificación, "Hecha por vos" para esa persona y "La hicieron <N> personas" (o "La hizo 1 persona") para las demás personas del navegador. Que otras personas la hayan hecho MUST NOT impedir postularse mientras la necesidad siga tomable.

#### Scenario: Hecha por vos
- **WHEN** el círculo verificó las horas de "Energía solar" y la persona abre `/tribus/valle`
- **THEN** "Energía solar" dice "Hecha por vos"

#### Scenario: La hizo otra persona
- **WHEN** otra persona miembro de Valle Solar, en el mismo navegador, abre `/tribus/valle`
- **THEN** "Energía solar" dice "La hizo 1 persona" y le ofrece "Postularme para tomarla"

### Requirement: Eventos en Mi recorrido
Marcar la tarea hecha, que el holón la verifique y que pida revisar SHALL registrar, una sola vez por hecho, "Marcaste hecha <tarea> en <tribu>", "<holón> verificó tus horas de <tarea>" y "<holón> pidió revisar tus horas de <tarea>" (sin el motivo), con enlace a `/pactos?comunidad=<tribu>`.

#### Scenario: Verificación
- **WHEN** el círculo verifica las horas de "Energía solar" y la persona abre `/pactos` dos veces
- **THEN** Mi recorrido tiene un solo "El círculo Energía solar verificó tus horas de Energía solar"

### Requirement: Textos y accesibilidad
Todos los textos nuevos SHALL existir en español (voseo) y en inglés. Las Semillas SHALL llamarse "Semillas pendientes" y "Semillas"; MUST NOT aparecer "brotes" ni "germinar". "Verificar" SHALL referirse a la tarea ("la tarea quedó hecha"), nunca al desempeño de la persona. Todo el flujo MUST usarse con teclado, cada respuesta SHALL anunciarse en una región `aria-live`, y axe MUST pasar sin violaciones `serious` ni `critical` en `/pactos` con una tarea hecha, en `/pactos/responder` con una tarea para verificar y en `/semillas` con una constancia.

#### Scenario: En inglés
- **WHEN** se abre `/pactos` en inglés con una tarea verificada
- **THEN** se lee "Hours verified by" y "Seeds"
