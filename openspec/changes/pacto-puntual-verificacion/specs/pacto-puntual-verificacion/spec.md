# Spec Delta

## Purpose

Que una tarea puntual pre-admitida se pueda marcar hecha con sus horas reales, que el holón verifique que se completó, y que recién con esa verificación nazca la constancia base de Semillas, sin ronda ni evaluación de pares (Backlog D15, D20 y D31; decisiones de Gus del 28-oct).

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
Al conciliar una verificación SHALL guardarse una constancia base con la forma de ADR-012: `schema` "semillas-base", `afirma` "netx", `sobre` el pacto puntual, `apunta_a` nulo, la fecha de la verificación, y en `datos` el tipo "puntual", la necesidad, la fecha de la tarea, las horas verificadas, el valor de la hora de referencia, el período (`AAAA-MM` de la verificación en hora de Argentina), la versión del pacto (1), la constancia de verificación y las Semillas (`round(horas × valor hora)`). Su uid MUST empezar con `ejemplo-`. Las Semillas MUST NOT nacer de nada que haga la persona sola. La constancia MUST quedar congelada: se lee tal como se guardó, MUST NOT recalcularse si cambia el valor de la hora y MUST NOT editarse. Conciliar dos veces MUST dejar una sola constancia. Una constancia guardada mal formada MUST descartarse y la tarea SHALL volver a "Hecha · esperando que <holón> verifique".

#### Scenario: Diez horas verificadas
- **WHEN** el círculo verifica 10 h de "Energía solar" en noviembre de 2026
- **THEN** queda una constancia base con 10 h, período "2026-11" y 50 Semillas

#### Scenario: Fin de mes
- **WHEN** la verificación es del 30 de noviembre de 2026 a las 22:30 de Argentina (`2026-12-01T01:30:00Z`)
- **THEN** el período es "2026-11"

#### Scenario: Lo guardado roto
- **WHEN** la constancia guardada no tiene horas
- **THEN** se descarta, la tarea queda esperando la verificación y la pantalla no se rompe

### Requirement: Semillas de los pactos puntuales, sin ronda
La tarjeta de Semillas de cada comunidad SHALL mostrar la parte "Pactos puntuales: horas verificadas" con la suma de las Semillas de sus constancias base y, debajo, cada constancia (tarea, horas, fecha de verificación, Semillas). Sin constancias, la parte MUST decir "sin dato", no 0. El total SHALL sumarla. Las Semillas de un puntual MUST contarse una sola vez. Un pacto puntual MUST NOT habilitar la ronda de reconocimiento ni el ajuste por evaluación de pares.

#### Scenario: Con una constancia
- **WHEN** la persona tiene 50 Semillas de un pacto puntual verificado en Valle Solar y ningún otro pacto
- **THEN** la tarjeta de Valle Solar dice "Pactos puntuales: 50", el total es 50 y no aparece la ronda

#### Scenario: Sin constancias
- **WHEN** la persona no tiene pactos puntuales verificados en Valle Solar
- **THEN** "Pactos puntuales" dice "sin dato"

### Requirement: La necesidad hecha
En la ficha de la tribu, una necesidad cuya tarea está marcada hecha SHALL decir "Hecha · esperando verificación" para quien la hizo; con la verificación, "Hecha por vos" para esa persona y "Hecha" para las demás personas del navegador.

#### Scenario: Hecha por vos
- **WHEN** el círculo verificó las horas de "Energía solar" y la persona abre `/tribus/valle`
- **THEN** "Energía solar" dice "Hecha por vos"

### Requirement: Eventos en Mi recorrido
Marcar la tarea hecha, que el holón la verifique y que pida revisar SHALL registrar, una sola vez por hecho, "Marcaste hecha <tarea> en <tribu>", "<holón> verificó tus horas de <tarea>" y "<holón> pidió revisar tus horas de <tarea>" (sin el motivo), con enlace a `/pactos?comunidad=<tribu>`.

#### Scenario: Verificación
- **WHEN** el círculo verifica las horas de "Energía solar" y la persona abre `/pactos` dos veces
- **THEN** Mi recorrido tiene un solo "El círculo Energía solar verificó tus horas de Energía solar"

### Requirement: Textos y accesibilidad
Todos los textos nuevos SHALL existir en español (voseo) y en inglés. "Verificar" SHALL referirse a la tarea ("la tarea quedó hecha"), nunca al desempeño de la persona. Todo el flujo MUST usarse con teclado, cada respuesta SHALL anunciarse en una región `aria-live`, y axe MUST pasar sin violaciones `serious` ni `critical` en `/pactos` con una tarea hecha, en `/pactos/responder` con una tarea para verificar y en `/semillas` con una constancia.

#### Scenario: En inglés
- **WHEN** se abre `/pactos` en inglés con una tarea verificada
- **THEN** se lee "Hours verified by" y "Seeds"
