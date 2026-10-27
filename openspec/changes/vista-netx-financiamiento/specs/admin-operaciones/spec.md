# Spec Delta

## Purpose

Que el super admin del prototipo tenga sus operaciones (lo pendiente, las personas y sus roles, las comunidades) en una página de administración propia, separada del relato de la Vista NetX, protegida en el servidor y a mano desde el rail con un contador de pendientes. Opción B elegida por Gus el 26-oct-2026 (pregunta 3 del PR #108).

## ADDED Requirements

### Requirement: Página de administración con pestañas
La plataforma SHALL tener una página de administración en `/admin` con una navegación de nombre "Secciones de la administración" y los enlaces "Pendientes" (`/admin`), "Personas y roles" (`/admin/personas`) y "Comunidades" (`/admin/comunidades`), en ese orden. El enlace de la pestaña abierta MUST estar marcado como página actual (no solo con color). Cada pestaña MUST tener un único h1 propio ("Pendientes", "Personas y roles", "Comunidades"), el aviso "Prototipo interno · datos de ejemplo", un solo `<main>`, usarse con teclado y no desbordar a 390 px.

#### Scenario: Pestañas del super admin
- **WHEN** el super admin abre `/admin`
- **THEN** ve "Pendientes", "Personas y roles" y "Comunidades", en ese orden, con "Pendientes" marcada como página actual y el h1 "Pendientes"

#### Scenario: Con teclado
- **WHEN** el super admin llega con Tab a "Comunidades" y aprieta Enter
- **THEN** se abre `/admin/comunidades` y esa pestaña queda marcada como página actual

### Requirement: La administración se protege en el servidor
Toda ruta bajo `/admin` SHALL responder con estado **403** a quien no sea el super admin: sin sesión, con sesión de otro rol, con una sesión vencida o inválida, o si el servidor no puede verificar a la persona. La respuesta 403 MUST NOT contener nada de las pestañas (pendientes, personas, comunidades) ni datos de personas, y MUST decir en palabras simples que la administración es solo para el super admin. Además del servidor, la pantalla SHALL ocultar el contenido a quien no sea super admin. Las lecturas y escrituras de personas MUST seguir verificando el rol también en `/api/personas`.

#### Scenario: Sin sesión
- **WHEN** alguien sin sesión pide `/admin`
- **THEN** recibe 403 con "No tenés acceso a esta página" y la respuesta no contiene "Pendientes", "Personas y roles" ni ningún email

#### Scenario: Persona sin rol de super admin
- **WHEN** una persona con rol "persona" pide `/admin`, `/admin/personas` o `/admin/comunidades`
- **THEN** recibe 403 y no ve pendientes, personas ni comunidades

#### Scenario: Super admin
- **WHEN** el super admin pide `/admin`
- **THEN** recibe 200 y ve la pestaña "Pendientes"

#### Scenario: La API también controla
- **WHEN** una persona con rol "persona" pide `/api/personas`
- **THEN** recibe 403

### Requirement: Ítem "Admin" en el rail solo para el super admin
El rail SHALL mostrar un ítem "Admin" que lleva a `/admin` solo cuando la sesión es del super admin. A cualquier otra persona, y mientras la sesión se verifica, el ítem MUST NOT aparecer de ninguna forma (ni bloqueado ni con candado). El ítem SHALL mostrar el número de pendientes en texto, con un nombre accesible que lo diga (por ejemplo "Admin, 3 pendientes"); con 0 pendientes no muestra número, y si el navegador no deja leer lo guardado dice "sin dato", nunca 0. Estando en cualquier pestaña de `/admin`, el ítem MUST estar marcado como página actual.

#### Scenario: Persona sin rol
- **WHEN** una persona con rol "persona" mira el rail
- **THEN** no hay ningún ítem ni texto "Admin"

#### Scenario: Super admin con pendientes
- **WHEN** el super admin tiene guardadas en su navegador una postulación de comunidad y un pedido de contacto
- **THEN** el rail muestra "Admin" con "2" y su nombre accesible es "Admin, 2 pendientes"

### Requirement: Pendientes
La pestaña "Pendientes" SHALL mostrar las postulaciones de comunidades y los pedidos de contacto guardados en este navegador (simulado), con el mismo comportamiento que tenían en la Vista NetX, y el contador de pendientes junto al nombre de la pestaña ("Pendientes · 2"). Pendiente es todo lo recibido mientras no exista forma de responderlo. La pestaña MUST NOT ofrecer acciones de aprobar, responder ni borrar.

#### Scenario: Lo guardado aparece
- **WHEN** el super admin guardó una postulación y un pedido de contacto y abre `/admin`
- **THEN** ve la postulación en "Postulaciones de comunidades", el pedido en "Pedidos de contacto" y "Pendientes · 2"

#### Scenario: Navegador que no deja leer
- **WHEN** el navegador no deja leer las postulaciones guardadas
- **THEN** la pestaña dice "Pendientes · sin dato" y la sección de postulaciones dice "sin dato"

### Requirement: Personas y roles
La pestaña "Personas y roles" SHALL mostrar el panel de personas y roles con el mismo comportamiento que tenía en la Vista NetX: lee y cambia roles solo a través de `/api/personas`.

#### Scenario: Panel de personas
- **WHEN** el super admin abre `/admin/personas`
- **THEN** ve el panel con las personas de la lista, incluida `persona@prueba.test` en el entorno de prueba

### Requirement: Comunidades
La pestaña "Comunidades" SHALL mostrar, como tabla con encabezados, las tribus del directorio (datos de ejemplo) con su nombre enlazado a la ficha, barrio, estado en texto, hogares, roles cubiertos sobre necesarios y forma jurídica. Es de solo lectura y MUST NOT mostrar datos de personas (líderes, emails). Un dato que falta MUST decir "sin dato".

#### Scenario: Tabla de comunidades
- **WHEN** el super admin abre `/admin/comunidades`
- **THEN** ve la tabla "Comunidades del directorio" con las columnas Comunidad, Barrio, Estado, Hogares, Roles y Forma jurídica, y cada nombre lleva a la ficha de su tribu

### Requirement: Accesibilidad de la administración
Las tres pestañas de `/admin` SHALL pasar la auditoría de axe sin violaciones serias ni críticas, usarse completas con teclado y no desbordar a 390 px (las tablas anchas con desplazamiento propio).

#### Scenario: 390 px
- **WHEN** el super admin abre cualquier pestaña de `/admin` con 390 px de ancho
- **THEN** el ancho del documento no pasa de 390 px
