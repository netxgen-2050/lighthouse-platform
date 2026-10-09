# Spec Delta

## Purpose

Mostrar en la ficha del territorio los bienes comunes con la plata y las horas de trabajo que necesitan y las que ya tienen comprometidas, para que se entienda para qué se pide plata y tiempo.

## ADDED Requirements

### Requirement: Bienes comunes con plata y horas
El sistema SHALL mostrar en `/territorios/lighthouse` una sección titulada "Bienes comunes del Lighthouse" con la marca de dato de ejemplo y una tarjeta por bien común. Cada tarjeta MUST mostrar el nombre del bien, un medidor "Plata" (USD comprometidos de USD necesarios, con porcentaje) y un medidor "Horas de trabajo" (horas comprometidas de horas necesarias, con porcentaje). Los datos SHALL ser los del mock-up v6.

#### Scenario: Ver el agua
- **WHEN** la persona abre `/territorios/lighthouse`
- **THEN** ve la tarjeta "Agua: toma, cisterna y riego" con "Plata" "USD 96.000 de USD 142.000 · 68%" y "Horas de trabajo" "1.800 de 3.200 · 56%"

#### Scenario: Cuatro bienes
- **WHEN** la persona abre `/territorios/lighthouse`
- **THEN** ve cuatro tarjetas: "Agua: toma, cisterna y riego", "Energía: parque solar comunitario", "Núcleo común: bioquincho y cocina" y "Vivero y banco de semillas"

### Requirement: Dato faltante en un bien
Si a un bien común le falta el monto comprometido, el necesario, las horas comprometidas o las necesarias, el sistema MUST mostrar "sin dato" en lugar del medidor correspondiente y MUST NOT mostrar 0 ni un porcentaje.

#### Scenario: Bien sin horas
- **WHEN** un bien común tiene plata cargada pero no tiene horas necesarias
- **THEN** su tarjeta muestra el medidor "Plata" y, en lugar del medidor de horas, "Horas de trabajo: sin dato"

### Requirement: Espejo del proyecto
La sección SHALL mostrar, junto al título, el texto "Plata y horas, en el espejo del proyecto" con el ⚖ `espejo`.

#### Scenario: Abrir el ⚖ del espejo
- **WHEN** la persona abre el ⚖ junto a "en el espejo del proyecto"
- **THEN** ve "Espejo del proyecto" y la explicación del catálogo

### Requirement: Cómo se protege la tierra
La sección SHALL terminar con la frase "Cómo se protege la tierra: Guardianes de la tierra y un Pacto de convivencia, con reglas sobre lo que se hace, no sobre lo que se piensa.", con el ⚖ `guardianes` junto a "Guardianes de la tierra" y el ⚖ `pacto` junto a "Pacto de convivencia".

#### Scenario: Abrir el ⚖ de los guardianes
- **WHEN** la persona abre el ⚖ junto a "Guardianes de la tierra"
- **THEN** ve "Guardianes de la tierra" y el texto sobre la servidumbre real negativa y perpetua
- **AND** no ve la marca de borrador

### Requirement: Término guardianes en el catálogo
El catálogo legal SHALL incluir la clave `guardianes` con título y texto copiados textualmente del objeto `LEGAL` del mock-up v6, sin la marca `borrador`.

#### Scenario: Texto igual al mock-up
- **WHEN** se corre el test del catálogo legal
- **THEN** el título y el texto de `guardianes` aparecen tal cual en `docs/referencia/netx-tribus-mockup-v6.html`

### Requirement: Enlace a ofrecer tiempo o plata
La sección SHALL incluir un enlace "Ofrecer tiempo o plata" que lleva a `/compromisos`.

#### Scenario: Ir a compromisos
- **WHEN** la persona activa "Ofrecer tiempo o plata"
- **THEN** llega a `/compromisos`

### Requirement: Calidad
La sección MUST comunicar el avance con texto (no solo con la barra ni con el color), ser usable con teclado (⚖ y enlace), usar solo tokens del tema, no agregar un `<main>` propio, y `/territorios/lighthouse` MUST pasar la auditoría de axe sin violaciones `serious` ni `critical`.

#### Scenario: Solo teclado
- **WHEN** la persona recorre la sección con Tab
- **THEN** llega al ⚖ del espejo, a los ⚖ de guardianes y pacto y al enlace "Ofrecer tiempo o plata", en ese orden
