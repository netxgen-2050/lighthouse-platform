# Spec Delta

## Purpose

Mostrar, antes de activar un plan pago en Sumarte, un resumen del pago simulado que deja claro quién recibe la plata, y ofrecer el derecho de arrepentimiento del Pase Fundador.

## ADDED Requirements

### Requirement: Resumen del pago del Pase
Al apretar "Quiero el Pase <nivel>", el sistema SHALL abrir en línea, sin activar nada, un resumen titulado "Resumen del pago (simulado)" con: "Pase Fundador <nivel> · pago único", el total "USD <precio>", y la sección "Quién recibe la plata" con "El Guardián del Lighthouse recibe USD <precio>" (con el ⚖ `guardian`) y "NetX cobra su tarifa de servicio: sin dato".

#### Scenario: Abrir el resumen del Brote
- **WHEN** la persona elige el nivel Brote y aprieta "Quiero el Pase Brote"
- **THEN** ve "Pase Fundador Brote · pago único", "USD 1.500", "El Guardián del Lighthouse recibe USD 1.500" y "NetX cobra su tarifa de servicio: sin dato"
- **AND** el plan actual sigue siendo el que tenía y los medidores de la cohorte no cambian

### Requirement: Resumen del pago de la membresía
Al apretar "Hacerme miembro", el sistema SHALL abrir en línea un resumen "Resumen del pago (simulado)" con "Membresía de la red", el precio según la facturación elegida ("USD 10/mes" o "USD 100/año") y "Quién recibe la plata: NetX (ingreso de la plataforma)".

#### Scenario: Membresía anual
- **WHEN** la facturación es "Anual" y la persona aprieta "Hacerme miembro"
- **THEN** ve "Membresía de la red", "USD 100/año" y "Quién recibe la plata: NetX (ingreso de la plataforma)"

### Requirement: Confirmar o cancelar el pago simulado
Cada resumen SHALL tener el ⚖ `cobro`, el botón "Confirmar pago (simulado)" y el botón "Cancelar". Confirmar MUST activar el pase o la membresía como lo hacía el botón original y anunciarlo en una región en vivo. Cancelar MUST cerrar el resumen sin cambiar nada y devolver el foco al botón que lo abrió.

#### Scenario: Confirmar el Pase
- **WHEN** la persona confirma el resumen del Pase Brote
- **THEN** ve "Pase Brote activo (simulado)" y el medidor "Pases de la cohorte" suma uno

#### Scenario: Cancelar el Pase
- **WHEN** la persona abre el resumen del Pase y aprieta "Cancelar"
- **THEN** el resumen se cierra, el foco vuelve a "Quiero el Pase Brote" y no hay pase activo

### Requirement: Plazo de arrepentimiento del Pase
Al confirmar el Pase, el sistema SHALL guardar en el navegador la fecha del pago simulado. Con el pase activo y dentro de los 10 días corridos desde esa fecha, MUST mostrar "Podés arrepentirte hasta el <fecha límite>" con el ⚖ `arrepentimiento` y el botón "Arrepentirme (simulado)".

#### Scenario: Dentro del plazo
- **WHEN** la persona confirmó el Pase hoy
- **THEN** ve "Podés arrepentirte hasta el" con la fecha de dentro de 10 días y el botón "Arrepentirme (simulado)"

#### Scenario: Plazo vencido
- **WHEN** la fecha del pago guardada es de hace 11 días
- **THEN** ve "El plazo para arrepentirte venció el <fecha límite>" y no ve el botón "Arrepentirme (simulado)"

#### Scenario: Sin fecha guardada
- **WHEN** hay un pase activo guardado antes de este cambio, sin fecha de pago
- **THEN** ve "Fecha del pago: sin dato" y no ve el botón "Arrepentirme (simulado)"

### Requirement: Arrepentirse del Pase
"Arrepentirme (simulado)" SHALL deshacer el pase, devolver el plan que la persona tenía antes de confirmarlo (Explorador o Miembro) y anunciar "Te arrepentiste del Pase <nivel> (simulado): el Guardián te devolvería USD <precio>." en una región en vivo.

#### Scenario: Arrepentirse siendo Explorador
- **WHEN** una persona con plan Explorador confirma el Pase Brote y después aprieta "Arrepentirme (simulado)"
- **THEN** su plan vuelve a "Explorador", el medidor "Pases de la cohorte" vuelve al valor anterior y oye el anuncio con "USD 1.500"

#### Scenario: Arrepentirse siendo Miembro
- **WHEN** una persona con plan Miembro confirma el Pase y después se arrepiente
- **THEN** su plan vuelve a "Miembro"

### Requirement: Términos legales del cobro en borrador
El catálogo legal SHALL incluir `cobro` ("Quién cobra qué") y `arrepentimiento` ("Derecho de arrepentimiento"), escritos por el agente y marcados `borrador: true`.

#### Scenario: Abrir el ⚖ del cobro
- **WHEN** la persona abre el ⚖ de un resumen de pago
- **THEN** ve "Quién cobra qué" y "Borrador: texto a revisar"

### Requirement: Lectura compatible de lo guardado
El sistema MUST leer el estado de Sumarte guardado antes de este cambio sin fallar: un pase activo sin fecha se conserva, y una fecha inválida se trata como faltante.

#### Scenario: Fecha inválida
- **WHEN** lo guardado tiene un pase activo con una fecha que no es válida
- **THEN** el pase sigue activo y se muestra "Fecha del pago: sin dato"

### Requirement: Calidad
Los resúmenes y el arrepentimiento MUST ser usables solo con teclado (el foco va al título del resumen al abrirlo), comunicar el estado con texto y no solo con color, usar solo tokens del tema y no agregar un `<main>`; `/sumarte` con un resumen abierto MUST pasar la auditoría de axe sin violaciones `serious` ni `critical`.

#### Scenario: Pase solo con teclado
- **WHEN** la persona abre el resumen del Pase, confirma y después se arrepiente usando solo el teclado
- **THEN** cada anuncio se lee en la región en vivo y el foco nunca queda en un elemento que desapareció
