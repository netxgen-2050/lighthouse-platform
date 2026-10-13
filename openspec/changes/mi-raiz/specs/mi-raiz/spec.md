# Spec Delta

## Purpose

Reunir en `/mi-raiz` lo que la persona tiene en la red (pase, créditos, presencia, Semillas y voz), en modo solo lectura y con los datos que ya guarda el prototipo (nota 18 §1 punto 3).

## ADDED Requirements

### Requirement: Página Mi Raíz
El sistema SHALL ofrecer la página `/mi-raiz` con el título "Mi Raíz" y cinco tarjetas, en este orden: "Pase", "Créditos comunes y de estadía", "Presencia", "Semillas" y "Voz". La página SHALL aparecer en el menú de la persona como "Mi Raíz". La página MUST ser solo lectura: no tiene botones que cambien datos, solo enlaces a las pantallas donde se cambian.

#### Scenario: Entrar desde el menú
- **WHEN** la persona abre el menú de su avatar y elige "Mi Raíz"
- **THEN** llega a `/mi-raiz` y ve las cinco tarjetas en ese orden

### Requirement: Aviso de que no es plata
`/mi-raiz` SHALL mostrar arriba el aviso "Mi Raíz no es una billetera de plata: nada de esto se compra, se vende ni se transfiere." con el ⚖ `miraiz`, que MUST vivir en `lib/legal/terminos.ts` con `borrador: true`.

#### Scenario: Término de borrador
- **WHEN** se corre el test del catálogo legal
- **THEN** `esBorrador("miraiz")` es verdadero

### Requirement: Pase y créditos
Con un pase activo guardado por `/sumarte`, la tarjeta "Pase" SHALL mostrar "Pase {nivel} (simulado)" y la tarjeta de créditos SHALL mostrar el total de créditos de ese nivel, en la moneda elegida por la persona, con el texto "se liberan a lo largo de 3 años" y "Usados: sin dato (todavía no hay canjes)". Sin pase, "Pase" MUST mostrar "Sin Pase Fundador" con un enlace a `/sumarte`, y la tarjeta de créditos MUST mostrar "Los créditos vienen con el Pase Fundador", nunca un 0.

#### Scenario: Pase Brote
- **WHEN** la persona activó el Pase Brote en `/sumarte` y abre `/mi-raiz` con la moneda en USD
- **THEN** ve "Pase Brote (simulado)" y USD 450 en créditos, con "Usados: sin dato (todavía no hay canjes)"

#### Scenario: Sin pase
- **WHEN** la persona no tiene pase
- **THEN** ve "Sin Pase Fundador", un enlace a `/sumarte` y "Los créditos vienen con el Pase Fundador"
- **AND** la tarjeta de créditos no muestra ningún monto

### Requirement: Presencia
Con un ticket válido registrado en `/congreso`, la tarjeta "Presencia" SHALL mostrar "Ticket registrado" y "Genesis pendiente: se confirma con el primer check-in en el territorio". Sin ticket, o con un código inválido guardado, MUST mostrar "Sin ticket registrado" con un enlace a `/congreso`.

#### Scenario: Con ticket
- **WHEN** la persona registró un ticket válido
- **THEN** la tarjeta dice "Ticket registrado" y "Genesis pendiente"

### Requirement: Semillas
La tarjeta "Semillas" SHALL listar cada comunidad con algo guardado en `/pactos`, con el nombre de la comunidad y su total de Semillas, o "sin dato" si ese total no existe. Sin nada guardado en `/pactos`, MUST mostrar "Todavía no sumaste Semillas" con un enlace a `/pactos`, nunca un 0.

#### Scenario: Pacto propuesto pero no aceptado
- **WHEN** la persona propuso un pacto de tiempo en una comunidad y todavía no fue aceptado ni tiene aportes
- **THEN** esa comunidad aparece con "sin dato"

#### Scenario: Sin pactos
- **WHEN** no hay nada guardado en `/pactos`
- **THEN** la tarjeta dice "Todavía no sumaste Semillas" y enlaza a `/pactos`

### Requirement: Voz
La tarjeta "Voz" SHALL mostrar las puertas "Voz en tu tribu", "Voz en el Fondo Común" y "Voto en la Asamblea de residentes", cada una con su estado en texto tal como lo calcula el servicio de permisos para la persona armada con lo elegido en Sumarte (sin tribu, sin presencia, no residente): por ejemplo "Abierta · 1 voz" o "Cerrada" con "Se abre con: …".

#### Scenario: Con pase
- **WHEN** la persona tiene un Pase Fundador activo
- **THEN** "Voz en el Fondo Común" figura como abierta con "1 voz"
- **AND** "Voto en la Asamblea de residentes" figura como cerrada con lo que la abre

#### Scenario: Explorador
- **WHEN** la persona tiene plan Explorador y sin pase
- **THEN** las tres puertas figuran como cerradas, cada una con "Se abre con: …"

### Requirement: Datos guardados rotos
Si alguno de los datos que lee la página está mal guardado, la tarjeta correspondiente MUST mostrarse como si no hubiera dato (sin pase, sin ticket, sin Semillas) y la página no falla.

#### Scenario: Sumarte roto
- **WHEN** `lh-sumarte` contiene JSON inválido
- **THEN** la tarjeta "Pase" dice "Sin Pase Fundador" y las otras tarjetas se ven normales

### Requirement: Calidad
Cada tarjeta MUST tener un encabezado, los estados MUST leerse como texto (no solo color ni iconos), todo MUST ser usable con teclado, la página MUST mostrar el aviso "Prototipo interno · datos de ejemplo" del layout, usar solo tokens del tema y no anidar otro `<main>`, y `/mi-raiz` con y sin pase MUST pasar la auditoría de axe sin violaciones `serious` ni `critical`.

#### Scenario: Recorrido con teclado
- **WHEN** la persona recorre `/mi-raiz` con Tab
- **THEN** alcanza cada ⚖, el 🌱 y cada enlace en orden de lectura
