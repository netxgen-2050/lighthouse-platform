# Spec Delta

## Purpose

Mostrar en `/sumarte` las tres formas de poner plata en el prototipo (Pase Fundador, círculo del Lote 7 y SAFE de NetX) lado a lado, con qué da y qué no da cada una, a quién va la plata y un monto de ejemplo que no se guarda.

## ADDED Requirements

### Requirement: Tabla comparativa de las tres puertas
La sección "Para inversores" de `/sumarte` SHALL empezar con una tabla "Compará cómo participar" con tres columnas (Pase Fundador; Proyecto del Lote 7, por invitación; Invertir en NetX, SAFE) y siete filas: qué es, qué recibís, qué no recibís, a quién va la plata, cómo salir, riesgos principales y estado. La tabla MUST tener encabezados de fila y de columna accesibles.

#### Scenario: La tabla aparece antes de las tarjetas de inversión
- **WHEN** una persona abre `/sumarte#inversores`
- **THEN** ve el encabezado "Compará cómo participar" antes de las tarjetas "Sumarte al proyecto del Lote 7" e "Invertir en NetX como empresa"
- **AND** la tabla tiene tres encabezados de columna y siete encabezados de fila

#### Scenario: Cada puerta lleva su explicación legal
- **WHEN** la persona mira los encabezados de columna
- **THEN** el Pase Fundador lleva el ⚖ `pasefundador`, el Lote 7 lleva el ⚖ `circulo` y el SAFE lleva el ⚖ `safe`

### Requirement: Ninguna puerta promete uso y retorno a la vez
La fila "qué no recibís" SHALL decir, para el Pase Fundador, que no da tierra, lotes, prioridad ni rendimiento y que no se revende; para el Lote 7, que no es una chacra identificada; y para el SAFE, que no da acceso, créditos ni voz en la comunidad.

#### Scenario: Lo que no da el Pase
- **WHEN** la persona lee la columna del Pase Fundador en la fila "qué no recibís"
- **THEN** el texto menciona tierra, lotes, prioridad, rendimiento y reventa

#### Scenario: Lo que no da el SAFE
- **WHEN** la persona lee la columna del SAFE en la fila "qué no recibís"
- **THEN** el texto dice que no da acceso, créditos ni voz en la comunidad

### Requirement: A quién va la plata
La fila "a quién va la plata" SHALL decir que el pago del Pase lo recibe el Guardián (con el ⚖ `guardian`), que el aporte al Lote 7 va a la caja del fiduciario y no a la plataforma (con el ⚖ `caja`) y que la inversión en NetX va al holding, fuera de la plataforma.

#### Scenario: La plataforma no recibe la plata de inversión
- **WHEN** la persona lee la fila "a quién va la plata"
- **THEN** la columna del Lote 7 dice que la plata va al fiduciario y muestra el ⚖ `caja`
- **AND** la columna del Pase dice que la recibe el Guardián y muestra el ⚖ `guardian`

### Requirement: Monto ilustrativo
La tabla SHALL ofrecer un campo numérico "Monto de ejemplo (USD)" con etiqueta visible, usable con teclado, que recalcule los ejemplos al cambiar. El monto MUST NOT guardarse en el navegador ni enviarse a ningún lado. Sin monto válido (vacío, cero, negativo o no numérico) los ejemplos SHALL decir "Escribí un monto para ver el ejemplo", nunca 0.

#### Scenario: Sin monto no se muestra cero
- **WHEN** el campo está vacío
- **THEN** cada columna muestra "Escribí un monto para ver el ejemplo"
- **AND** no aparece "USD 0" ni "0 %"

#### Scenario: El monto no se guarda
- **WHEN** la persona escribe un monto y recarga la página
- **THEN** el campo vuelve vacío y no hay ninguna clave nueva en el almacenamiento del navegador

### Requirement: Ejemplo del Pase Fundador
Con un monto válido, la columna del Pase SHALL mostrar el nivel más alto cuyo precio de ejemplo entra en el monto y los créditos de ese nivel, con los precios y créditos de ejemplo vigentes. Si el monto no alcanza para el nivel más barato, SHALL decir cuánto cuesta ese nivel.

#### Scenario: Monto que alcanza para Brote
- **WHEN** la persona escribe 2000
- **THEN** la columna del Pase dice que alcanza para el Pase Brote (USD 1.500) con USD 450 en créditos

#### Scenario: Monto que no alcanza
- **WHEN** la persona escribe 100
- **THEN** la columna del Pase dice que el nivel más accesible, Semilla, cuesta USD 300

### Requirement: Ejemplo del Lote 7
Con un monto válido, la columna del Lote 7 SHALL mostrar qué porcentaje de la emisión de ejemplo representa el monto, con un decimal y redondeado hacia arriba a 0,1 % si es menor, y recordar que el aporte se firma con el fiduciario, fuera de la plataforma.

#### Scenario: Porción de la emisión
- **WHEN** la persona escribe 48000 y la emisión de ejemplo es de USD 480.000
- **THEN** la columna del Lote 7 dice "10,0 % de esta emisión (ejemplo)"

#### Scenario: Monto muy chico
- **WHEN** la persona escribe 100
- **THEN** la columna del Lote 7 dice "menos de 0,1 % de esta emisión (ejemplo)"

### Requirement: El SAFE no muestra cifras
La columna del SAFE SHALL NOT mostrar ningún cálculo con el monto. SHALL decir que las condiciones se conversan en privado, uno a uno, y ofrecer ir a "Pedir una charla".

#### Scenario: Monto escrito y columna SAFE
- **WHEN** la persona escribe cualquier monto válido
- **THEN** la columna del SAFE no muestra porcentajes ni montos derivados
- **AND** muestra un enlace o botón que lleva a "Pedir una charla"

### Requirement: Aviso de cálculo ilustrativo
Junto al monto SHALL aparecer la frase "Ejemplo ilustrativo, no es una oferta" con el ⚖ `ilustrativo`, un término nuevo del catálogo legal marcado como borrador.

#### Scenario: El aviso está en borrador
- **WHEN** se lee el término `ilustrativo` del catálogo legal
- **THEN** tiene `borrador: true` y un texto en palabras simples que dice que los cálculos no son una oferta ni prometen rendimiento
