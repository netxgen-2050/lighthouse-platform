# Spec Delta

## Purpose

Mostrar en la ficha de un territorio cómo avanza el proyecto en cuatro frentes (Legal, Masterplan, Financiero y Comunidad), con estado escrito, quién lo lleva y el avance en porcentaje solo cuando hay un dato.

## ADDED Requirements

### Requirement: Sección de avances en la ficha
La página `/territorios/[id]` SHALL mostrar una sección con el encabezado "Cómo avanza el proyecto", ubicada después del mapa y antes de "Bienes comunes", con cuatro frentes en este orden: Legal, Masterplan, Financiero y Comunidad.

#### Scenario: Orden de las secciones
- **WHEN** una persona abre `/territorios/lighthouse`
- **THEN** ve "Cómo avanza el proyecto" antes de "Bienes comunes"
- **AND** los frentes aparecen en el orden Legal, Masterplan, Financiero, Comunidad

### Requirement: Contenido de cada frente
Cada frente SHALL mostrar su nombre, un estado escrito (En curso, Sin empezar o Listo), el avance en porcentaje, una línea que diga qué mide ese número, el rol que lo lleva y la fecha de la última actualización. El estado y el porcentaje MUST leerse como texto, no solo por color o largo de barra.

#### Scenario: Frente con todos sus datos
- **WHEN** la persona mira el frente Comunidad
- **THEN** ve el estado escrito, un porcentaje en texto, la línea de qué mide, el rol responsable y la fecha o "sin dato"

### Requirement: El dato que falta no es cero
Si un frente no tiene porcentaje, SHALL mostrar "sin dato" en su lugar y ninguna barra. Si falta el rol o la fecha, SHALL mostrar "sin dato". Un territorio sin frentes cargados SHALL mostrar la sección con "sin dato" en cada frente. Nunca MUST aparecer 0 % por falta de dato.

#### Scenario: Legal y Masterplan sin porcentaje
- **WHEN** la persona mira los frentes Legal y Masterplan del Lighthouse
- **THEN** cada uno dice "En curso" y "sin dato" en el avance
- **AND** no muestra ninguna barra ni "0 %"

### Requirement: Comunidad se calcula con las tribus
El avance de Comunidad SHALL ser la cantidad de tribus activas del territorio sobre el total de barrios, redondeado al entero, con la línea "N de M barrios con tribu activa". MUST coincidir con el resumen de tribus de la misma ficha.

#### Scenario: Coincide con el resumen
- **WHEN** el territorio tiene A tribus activas en B barrios
- **THEN** el frente Comunidad dice "A de B barrios con tribu activa" y el porcentaje redondeado de A sobre B

### Requirement: Financiero se calcula con la cohorte del Pase
El avance Financiero SHALL ser lo recaudado por la cohorte del Pase Fundador sobre el mínimo para abrir el Fondo Común, con los mismos datos de ejemplo que usa `/sumarte`, la línea "USD X de USD Y para abrir el Fondo Común (ejemplo)" y el ⚖ `guardian`.

#### Scenario: Mismo número que en Sumarte
- **WHEN** la cohorte de ejemplo recaudó USD 46.000 de un mínimo de USD 75.000
- **THEN** el frente Financiero dice 61 % y "USD 46.000 de USD 75.000 para abrir el Fondo Común (ejemplo)"
- **AND** muestra el ⚖ `guardian`

### Requirement: Responsables como roles
Los responsables SHALL mostrarse como roles del equipo (por ejemplo "Equipo legal", "Arquitectura y masterplan", "Finanzas", "Comunidad NetX") y MUST NOT mostrar nombres de personas.

#### Scenario: Sin nombres propios
- **WHEN** la persona lee los responsables de los cuatro frentes
- **THEN** ve roles y no nombres de personas del equipo
