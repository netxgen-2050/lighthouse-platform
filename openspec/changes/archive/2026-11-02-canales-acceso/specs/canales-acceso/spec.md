# Spec Delta

## Purpose

Mostrar a cada persona qué salas, foros, voz y créditos le abre su lugar en la red (plan, pase, tribu, presencia y rol) y por qué, para que se vea qué se obtiene con cada plan de Sumarte.

## ADDED Requirements

### Requirement: Situación leída de Sumarte
La página `/canales` SHALL armar la situación de la persona con el plan y el pase elegidos en `/sumarte` en el mismo navegador. Sin tribu aceptada, sin presencia Genesis y no residente. Si no hay nada guardado, la situación MUST ser Explorador sin pase.

#### Scenario: Sin nada elegido
- **WHEN** una persona abre `/canales` sin haber elegido nada en `/sumarte`
- **THEN** la situación dice "Explorador" y "Sin Pase Fundador"
- **AND** solo figuran abiertas "Mapa, tribus y eventos abiertos" y "Registrar tu ticket del Congreso"

#### Scenario: Con Pase Fundador elegido
- **WHEN** una persona activa el Pase Fundador nivel Brote en `/sumarte` y abre `/canales`
- **THEN** la situación dice "Miembro" y "Pase Fundador · Brote"
- **AND** "Canal de fundadores" figura "Abierta" con el motivo "por tu pase"

#### Scenario: Ticket registrado no es presencia
- **WHEN** la persona tiene un ticket registrado en `/congreso`
- **THEN** la presencia Genesis figura "pendiente: la confirma el anfitrión en el check-in"
- **AND** ninguna puerta muestra el motivo "por tu presencia"

### Requirement: Una fila por puerta
La página SHALL mostrar una fila por cada puerta del servicio de permisos, con su nombre en lenguaje simple y su estado en texto ("Abierta", "Abierta como visita" o "Cerrada"). El estado MUST NOT comunicarse solo con color.

#### Scenario: Nueve puertas
- **WHEN** se abre `/canales`
- **THEN** hay exactamente 9 filas de puertas, cada una con un texto de estado

### Requirement: Motivos y cómo se abre
Cada puerta abierta SHALL listar todos sus motivos ("por tu plan", "por tu pase", "por tu tribu", "por tu presencia", "por tu rol"). Cada puerta cerrada SHALL decir qué la abre según la tabla de la nota 18.

#### Scenario: Dos motivos
- **WHEN** la situación es Miembro con pase Brote
- **THEN** "Foros de la red" figura abierta "por tu plan" y "por tu pase"

#### Scenario: Puerta cerrada con pista
- **WHEN** la situación es Explorador sin pase
- **THEN** "Canal de fundadores" figura "Cerrada" con "Se abre con: Pase Fundador"
- **AND** "Voto en la Asamblea de residentes" figura "Cerrada" con "Se abre con: ser residente"

### Requirement: Salas de tribu
La fila de salas de tribu SHALL distinguir la sala de cada tribu aceptada (acceso completo) de las salas de otras tribus (visita o cerrada).

#### Scenario: Tribu aceptada en el simulador
- **WHEN** en "Probá otra situación" se elige Explorador y la tribu Valle Solar como aceptada
- **THEN** "Sala de Valle Solar" figura "Abierta" con "por tu tribu"
- **AND** "Salas de otras tribus" figura "Cerrada"

### Requirement: Lo no decidido no se inventa
Cuando la voz en el Fondo Común está abierta y hay presencia Genesis, la página SHALL mostrar "Refuerzo por presencia: a decidir" y MUST NOT mostrar un multiplicador.

#### Scenario: Pase con presencia
- **WHEN** en el simulador se elige pase Raíz y presencia Genesis
- **THEN** "Voz en el Fondo Común" figura "Abierta · 1 voz" con "Refuerzo por presencia: a decidir"
- **AND** no aparecen "×1,5" ni "×2"

### Requirement: Simulador sin guardar
"Probá otra situación" SHALL cambiar las puertas al instante sin guardar nada. "Volver a mi situación" MUST restaurar la situación leída de Sumarte, y recargar la página también.

#### Scenario: Residente simulado
- **WHEN** en el simulador se marca "Residente"
- **THEN** "Voto en la Asamblea de residentes" figura "Abierta" con "por tu rol"
- **AND** al recargar la página vuelve a figurar "Cerrada"

### Requirement: Enlace desde Sumarte
`/sumarte` SHALL tener un enlace "Ver qué te abre cada plan" que lleva a `/canales`.

#### Scenario: Desde Sumarte
- **WHEN** una persona activa el enlace en `/sumarte`
- **THEN** llega a `/canales`

### Requirement: Accesibilidad y estilo
`/canales` SHALL ser usable solo con teclado, pasar axe sin violaciones `serious` ni `critical`, tener un único `<main>`, usar solo tokens del tema y mostrar el aviso de modo demostración.

#### Scenario: Auditoría
- **WHEN** se corre axe sobre `/canales`
- **THEN** no hay violaciones `serious` ni `critical`
