# Spec Delta

## Purpose

Muestra en una sola página los eventos de comunidad del Lighthouse VRN (encuentros, mingas, jornadas, talleres y visitas al territorio), y más adelante los de la red, con lo necesario para decidir si ir.

## ADDED Requirements

### Requirement: Página de eventos abierta
La plataforma SHALL ofrecer la página `/eventos`, que MUST verse sin cuenta y con un único `<main>`, el del layout.

#### Scenario: Sin cuenta
- **WHEN** una persona sin sesión abre `/eventos`
- **THEN** ve la lista de eventos, sin que se le pida entrar

#### Scenario: Con barra final y con query
- **WHEN** una persona sin sesión abre `/eventos/` o `/eventos?utm_source=x`
- **THEN** ve la misma página

### Requirement: Datos de cada evento
Cada evento SHALL mostrar nombre, tipo, fecha, lugar, quién organiza, cupo, qué se pide y qué se recibe. El tipo MUST ser encuentro, minga, jornada, taller o visita al territorio, y MUST decirse con palabras.

#### Scenario: Evento completo
- **WHEN** una persona mira la "Minga de retención de agua"
- **THEN** ve su tipo "Minga", su fecha, que es en el territorio, el círculo que la organiza, su cupo, lo que se pide y lo que se recibe

#### Scenario: Lugar fuera del territorio
- **WHEN** un evento es fuera del territorio
- **THEN** la tarjeta dice con palabras que es fuera del territorio y dónde, sin depender del color

### Requirement: El dato que falta dice sin dato
Un dato faltante de un evento MUST mostrarse como "sin dato" ("no data" en inglés), nunca como 0 ni como un valor inventado. Esto vale para fecha, lugar, organizador, cupo, qué se pide y qué se recibe.

#### Scenario: Cupo y fecha sin definir
- **WHEN** un evento no tiene cupo ni fecha cargados
- **THEN** la tarjeta dice "sin dato" en esos dos campos

#### Scenario: Organizador que no existe
- **WHEN** un evento nombra un círculo o una tribu que no está en los datos
- **THEN** el campo de quién organiza dice "sin dato" y la página no falla

### Requirement: Cupo abierto distinto de cupo limitado
El cupo SHALL distinguir tres casos: una cantidad de lugares, cupo abierto y sin dato. La página MUST NOT mostrar cuántos lugares quedan ni cuántas personas se anotaron.

#### Scenario: Cupo limitado
- **WHEN** un evento tiene 20 lugares
- **THEN** la tarjeta dice "20 lugares" y no dice cuántos quedan

#### Scenario: Cupo abierto
- **WHEN** un evento tiene cupo abierto
- **THEN** la tarjeta dice "Cupo abierto"

### Requirement: Próximos y pasados
La página SHALL mostrar primero los eventos próximos, del más cercano al más lejano, y después los eventos sin fecha. Los eventos cuya fecha de fin ya pasó MUST ir en una sección aparte, y MUST NOT ofrecer "Quiero ir". La fecha se compara con el día actual en la hora de Argentina.

#### Scenario: Evento de hoy
- **WHEN** la fecha de fin de un evento es el día de hoy
- **THEN** el evento sigue entre los próximos y ofrece "Quiero ir"

#### Scenario: Evento pasado
- **WHEN** la fecha de fin de un evento ya pasó
- **THEN** aparece en la sección de eventos pasados, sin el botón "Quiero ir"

#### Scenario: Evento sin fecha
- **WHEN** un evento no tiene fecha
- **THEN** aparece al final de los próximos, con "sin dato" en la fecha

### Requirement: Datos de ejemplo marcados
Todo evento de ejemplo MUST llevar una marca visible con la palabra "Ejemplo" ("Example" en inglés). Los datos MUST salir de una única función de lectura, sin red ni credenciales.

#### Scenario: Marca en cada tarjeta
- **WHEN** una persona recorre la lista
- **THEN** cada tarjeta de ejemplo trae la marca escrita, y el aviso "Prototipo interno · datos de ejemplo" sigue visible

### Requirement: Semillas descritas sin prometer cantidad
Un evento SHALL poder indicar que da Semillas por asistir o por ayudar. MUST NOT mostrar una cantidad, MUST aclarar que las confirma quien organiza y MUST llevar el ⚖ de Semillas. La palabra "token" MUST NOT aparecer en la página.

#### Scenario: Semillas por ayudar
- **WHEN** una persona mira un evento que da Semillas por ayudar
- **THEN** lee que recibe Semillas por ayudar, que las confirma quien organiza y que anotarse no las da, y puede abrir el ⚖

### Requirement: Marcas legales en borrador
Los eventos marcados como educativos SHALL llevar el ⚖ "Encuentro educativo" para eventos, que MUST vivir en el catálogo legal como borrador, en español e inglés, y MUST NOT nombrar al Congreso. Las mingas y jornadas MUST llevar el ⚖ de horas de obra.

#### Scenario: Evento educativo
- **WHEN** una persona abre el ⚖ de un evento educativo
- **THEN** lee que es un encuentro educativo y no una oferta de inversión, con la marca de borrador

#### Scenario: Minga
- **WHEN** una persona mira una minga o una jornada
- **THEN** puede abrir el ⚖ de horas de obra, que explica que falta definir la modalidad y el seguro

#### Scenario: Vitrina sin cambios
- **WHEN** se compara el catálogo antes y después de este cambio
- **THEN** el término `encuentroeducativo` que usa la vitrina del Congreso sigue igual

### Requirement: Sin venta de entradas ni oferta de tierra
La página MUST NOT mostrar precios de entrada, botones de compra, "reservá", lotes ni pedidos de inversión.

#### Scenario: Recorrer la página
- **WHEN** una persona recorre `/eventos` en español o en inglés
- **THEN** no encuentra un precio, un botón de compra, la palabra "reservá" ni la palabra "lote"

### Requirement: Anuncio de las convocatorias de la red
Un evento SHALL poder indicar su formato de convocatoria: voluntariado, jornada o minga, o actividad puntual. La página MUST traer un bloque breve que diga que las convocatorias de otros nodos llegan más adelante, sin formulario, sin nombrar nodos reales y sin mostrar un 0.

#### Scenario: Bloque de la red
- **WHEN** una persona llega a ese bloque
- **THEN** lee que todavía no hay eventos de otros nodos y qué formatos va a haber, y no encuentra nada para completar

#### Scenario: Formato en la tarjeta
- **WHEN** un evento tiene formato de convocatoria
- **THEN** la tarjeta lo dice con palabras

### Requirement: Página en dos idiomas
Todos los textos de `/eventos`, incluidos los de los eventos, SHALL estar en español y en inglés, en la misma dirección. El idioma MUST salir de la elección de la plataforma, y la página MUST NOT mostrar el aviso de página solo en español.

#### Scenario: Con inglés elegido
- **WHEN** una persona con la plataforma en inglés abre `/eventos`
- **THEN** ve la página en inglés, con el idioma correcto marcado en `lang`

#### Scenario: Traducción que falta
- **WHEN** a un evento le falta un texto en inglés
- **THEN** ese texto cae al español y nunca queda vacío

### Requirement: Accesibilidad de la página
La página SHALL pasar la auditoría de axe sin violaciones serias ni críticas, MUST ser usable con teclado y MUST NOT comunicar nada solo con color. Tiene que usar solo los tokens permitidos y no generar scroll horizontal en 390 px.

#### Scenario: Auditoría
- **WHEN** corre axe sobre `/eventos`, con y sin sesión, y en los dos idiomas
- **THEN** no hay violaciones serias ni críticas

#### Scenario: Celular
- **WHEN** una persona abre `/eventos` en una pantalla de 390 x 844
- **THEN** no aparece scroll horizontal
