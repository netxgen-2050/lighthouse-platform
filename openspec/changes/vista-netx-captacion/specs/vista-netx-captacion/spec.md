# Spec Delta

## Purpose

Mostrar en la Vista NetX cuánta plata capta el prototipo y a quién va, separada en ingresos de NetX, ventas de terceros que procesa la plataforma e inversión que no pasa por ella.

## ADDED Requirements

### Requirement: Sección de captación en la Vista NetX
La página `/netx` SHALL mostrar, solo a quien la puede ver hoy (super admin), una sección con el encabezado "Captación · a quién va la plata", después de los indicadores y antes del embudo, con tres bloques en este orden: "A · Ingresos de NetX", "B · Ventas de terceros que procesa la plataforma" y "C · Inversión (no pasa por la plataforma)".

#### Scenario: Orden de los bloques
- **WHEN** el super admin abre `/netx`
- **THEN** ve "Captación · a quién va la plata" antes de "Embudo"
- **AND** los bloques aparecen en el orden A, B, C con su rótulo escrito

#### Scenario: Sin acceso
- **WHEN** una persona que no es super admin abre `/netx`
- **THEN** no ve la sección de captación

### Requirement: Ingresos de NetX
El bloque A SHALL listar la membresía (precio de ejemplo mensual y anual, ⚖ `membresia`), el Plan Tribu (precio de ejemplo por tribu y por mes, ⚖ `plantribu`) y la tarifa al Guardián. Las cantidades, el monto de la tarifa y el ingreso total SHALL mostrarse como "sin dato".

#### Scenario: Precios presentes, cantidades sin dato
- **WHEN** el super admin mira el bloque A
- **THEN** ve USD 10/mes y USD 100/año para la membresía y USD 60/mes por tribu para el Plan Tribu
- **AND** las cantidades, la tarifa al Guardián y el total dicen "sin dato", nunca 0

### Requirement: Pase Fundador como venta de terceros
El bloque B SHALL mostrar el Pase Fundador con dos medidores (pases vendidos sobre el cupo de la cohorte; recaudado sobre el mínimo para abrir el Fondo Común) con los mismos datos de ejemplo que `/sumarte`, la frase "Lo recibe el Guardián" con el ⚖ `guardian` y la tarifa de NetX como "sin dato". Los medidores MUST mostrar los números en texto.

#### Scenario: Mismos números que Sumarte
- **WHEN** la cohorte de ejemplo tiene 142 de 300 pases y USD 46.000 de USD 75.000
- **THEN** el bloque B muestra "142 / 300" y "46.000 / 75.000" con sus porcentajes en texto
- **AND** dice "Lo recibe el Guardián" con el ⚖ `guardian`

### Requirement: La inversión no pasa por la plataforma
El bloque C SHALL mostrar el proyecto del Lote 7 (monto de la emisión de ejemplo y lugares usados del círculo sobre el cupo, ⚖ `circulo`), el SAFE como conversación privada (⚖ `safe`) y la línea "Fondos recibidos por la plataforma: USD 0" con el ⚖ `caja`. Los datos de la emisión MUST salir de la misma fuente que `/sumarte`.

#### Scenario: Fondos recibidos
- **WHEN** el super admin mira el bloque C
- **THEN** ve "Fondos recibidos por la plataforma: USD 0" con el ⚖ `caja`
- **AND** ve la emisión de USD 480.000 y "22 / 35" lugares del círculo

### Requirement: Pedidos de inversión de este navegador
El bloque C SHALL contar los pedidos de la bandeja local de contactos con motivo invitación al círculo y charla para invertir en NetX, mostrar cada cantidad con su etiqueta y un enlace a la bandeja de pedidos de la misma página. Sin pedidos SHALL decir "Todavía no hay pedidos de inversión en este navegador"; mientras no se leyó el navegador, "Cargando…".

#### Scenario: Con pedidos
- **WHEN** la bandeja local tiene dos pedidos de invitación al círculo, uno de charla y uno de consulta por un lote
- **THEN** el bloque C dice 2 pedidos de invitación al círculo y 1 pedido de charla
- **AND** no cuenta la consulta por un lote

#### Scenario: Sin pedidos
- **WHEN** la bandeja local está vacía
- **THEN** el bloque C dice "Todavía no hay pedidos de inversión en este navegador"
