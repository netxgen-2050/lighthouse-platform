# Spec Delta

## Purpose

Pedir permiso explícito antes de guardar datos de la persona, explicar en un solo lugar qué se guarda y cómo borrarlo, y marcar como borrador los textos legales que todavía no revisó nadie.

## ADDED Requirements

### Requirement: Nada se guarda sin OK
Las pantallas que guardan datos en el navegador (`/perfil`, `/compromisos`, `/congreso`, `/sumarte`) SHALL NOT escribir nada en el almacenamiento del navegador mientras la persona no haya dado su OK. Sin OK, la pantalla MUST seguir funcionando en memoria.

#### Scenario: Primera visita sin OK
- **WHEN** una persona sin OK registra un compromiso en `/compromisos`
- **THEN** el compromiso aparece en la lista
- **AND** no se escribe nada en el almacenamiento del navegador
- **AND** al recargar la página, la lista está vacía

### Requirement: Aviso de consentimiento
Mientras no haya OK, cada una de esas pantallas SHALL mostrar un aviso con el texto "Para guardar lo que hagas acá en este navegador necesitamos tu OK", los botones "Acepto" y "Ahora no", el ⚖ `datos` y un enlace a `/privacidad`. El aviso MUST ser accesible con teclado y no bloquear la pantalla.

#### Scenario: Dar el OK
- **WHEN** una persona aprieta "Acepto" en `/perfil` y después confirma un dato
- **THEN** el aviso desaparece
- **AND** al recargar, el dato confirmado sigue ahí

#### Scenario: Ahora no
- **WHEN** una persona aprieta "Ahora no"
- **THEN** el aviso se reduce a la línea "No se guarda: lo que hagas se pierde al recargar", con un botón para dar el OK

#### Scenario: Un OK para todas
- **WHEN** una persona dio el OK en `/perfil` y abre `/congreso`
- **THEN** `/congreso` no muestra el aviso y guarda el ticket que registre

### Requirement: Registro del OK
El OK SHALL guardarse con la fecha y la versión del texto de consentimiento. Si la versión del texto cambia, el sistema MUST volver a pedir el OK.

#### Scenario: Texto nuevo
- **WHEN** hay un OK guardado con una versión anterior a la vigente
- **THEN** las pantallas vuelven a mostrar el aviso

### Requirement: Lo ya guardado antes de este cambio
Si hay datos guardados de antes y no hay OK, las pantallas SHALL mostrarlos y el aviso MUST ofrecer, además de "Acepto", la opción "Borrar lo guardado".

#### Scenario: Datos viejos
- **WHEN** hay un ticket guardado y no hay OK, y la persona aprieta "Borrar lo guardado" en `/congreso`
- **THEN** se borran todos los datos del modo demostración y `/congreso` muestra "Sin ticket registrado"

### Requirement: Página de privacidad
`/privacidad` SHALL explicar qué guarda cada una de las cuatro pantallas, que queda solo en este navegador hasta que se borre, que nada se envía a un servidor y que no se piden datos sensibles. La página MUST mostrar el estado del OK (dado, con fecha, o no dado) y la marca "Borrador para revisión".

#### Scenario: Contenido
- **WHEN** una persona abre `/privacidad`
- **THEN** ve una sección por cada pantalla (Perfil, Compromisos, Congreso, Sumarte) con lo que guarda
- **AND** ve "Borrador para revisión"

### Requirement: Retirar el OK
`/privacidad` SHALL ofrecer "Retirar mi OK y borrar todo" cuando hay OK, que MUST borrar el OK y todos los datos del modo demostración, y "Dar mi OK" cuando no lo hay.

#### Scenario: Retirar
- **WHEN** una persona con OK y datos guardados aprieta "Retirar mi OK y borrar todo" y confirma
- **THEN** no queda nada del modo demostración en el almacenamiento del navegador
- **AND** `/perfil` vuelve a mostrar el aviso de consentimiento

### Requirement: Borrar todo incluye el OK
El botón "Borrar todo lo de este navegador" de `/panel` SHALL borrar también el OK y los datos de Sumarte.

#### Scenario: Desde el panel
- **WHEN** una persona usa "Borrar todo lo de este navegador" en `/panel`
- **THEN** las pantallas vuelven a pedir el OK

### Requirement: Textos legales en borrador
El catálogo legal SHALL permitir marcar un término como borrador. El ⚖ de un término borrador MUST mostrar "Borrador: texto a revisar" junto con su explicación. El término `datos` MUST estar marcado como borrador.

#### Scenario: ⚖ borrador
- **WHEN** una persona abre el ⚖ "Tus datos personales"
- **THEN** la explicación incluye "Borrador: texto a revisar"

#### Scenario: ⚖ del mock-up
- **WHEN** una persona abre el ⚖ "Ritual de entrada"
- **THEN** la explicación no incluye "Borrador"

### Requirement: Enlace en el pie
El pie de todas las páginas SHALL tener un enlace "Privacidad" a `/privacidad`.

#### Scenario: Desde cualquier página
- **WHEN** una persona activa "Privacidad" en el pie de `/tribus`
- **THEN** llega a `/privacidad`

### Requirement: Accesibilidad y estilo
`/privacidad` y el aviso SHALL pasar axe sin violaciones `serious` ni `critical`, ser usables con teclado, usar solo tokens del tema y no agregar un `<main>` propio.

#### Scenario: Auditoría
- **WHEN** se corre axe sobre `/privacidad` y sobre `/perfil` con el aviso visible
- **THEN** no hay violaciones `serious` ni `critical`
