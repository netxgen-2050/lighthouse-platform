# Spec Delta

## Purpose

Define cómo un pacto de tiempo, y cada cambio a un pacto aceptado, se acuerda entre dos partes (la persona y la tribu de ese pacto), y cómo cada paso queda como una constancia con la forma de EAS que la otra parte puede leer.

## ADDED Requirements

### Requirement: Quién responde por la comunidad
Un pacto enviado a una tribu SHALL poder responderlo solo quien lidera esa tribu en la sesión (Plan Tribu de esa tribu o el nivel asignado de antemano, como `admin@prueba.test` para Valle Solar). Un pacto con el Lighthouse SHALL responderlo solo el super admin. Nadie MUST poder responder un pacto propio.

#### Scenario: Responde quien lidera
- **WHEN** `persona@prueba.test` envía un pacto a Valle Solar y entra `admin@prueba.test`
- **THEN** `admin@prueba.test` ve ese pacto en `/pactos/responder` con "Aceptar" y "No aceptar"

#### Scenario: Otra tribu no lo ve
- **WHEN** quien lidera otra tribu abre `/pactos/responder`
- **THEN** no ve el pacto enviado a Valle Solar

#### Scenario: Pacto con el Lighthouse
- **WHEN** una persona envía un pacto al Lighthouse y entra `super@prueba.test`
- **THEN** el super admin lo ve para responder, y quien lidera Valle Solar no

#### Scenario: Su propio pacto
- **WHEN** quien lidera Valle Solar envía un pacto propio a Valle Solar y abre `/pactos/responder`
- **THEN** lo ve sin botones para responder y con el texto "Es tu propio pacto: lo tiene que responder otra persona de la tribu"

#### Scenario: Sin permiso
- **WHEN** una persona que no lidera ninguna tribu ni es super admin abre `/pactos/responder`
- **THEN** ve "No tenés pactos para responder" y ningún pacto de otras personas

### Requirement: Sin aceptación simulada del lado de la persona
La pantalla `/pactos` MUST NOT ofrecer a la persona ningún botón para aceptar o rechazar en nombre de la comunidad, ni para un pacto nuevo ni para un cambio. Con un pacto o un cambio enviado SHALL mostrar "Esperando la respuesta de <comunidad>" y SHALL seguir ofreciendo "Retirar y editar".

#### Scenario: Pacto enviado
- **WHEN** una persona envía un pacto a Valle Solar
- **THEN** ve "Esperando la respuesta de Valle Solar" y "Retirar y editar", y no ve "Simular: la comunidad acepta"

#### Scenario: Cambio enviado
- **WHEN** una persona envía un cambio a 20 h/mes sobre su pacto aceptado de 10 h/mes
- **THEN** ve el cambio esperando la respuesta, sin "Simular: la comunidad acepta el cambio" ni "Simular: la comunidad no lo acepta", y Semillas sigue calculando con 10 h/mes

### Requirement: La tribu acepta
Al aceptar, el pacto (o el cambio) SHALL quedar aceptado por las dos partes con el número de versión siguiente, y desde ese momento Semillas SHALL usar sus horas. La versión y el historial MUST ser los mismos que ya existen (versión 1 al aceptar el primero, +1 por cada cambio).

#### Scenario: Primer pacto
- **WHEN** `admin@prueba.test` acepta el pacto de 10 h/mes de `persona@prueba.test` en Valle Solar y la persona vuelve a entrar
- **THEN** la persona ve su pacto "Aceptado", versión 1, y Semillas calcula con 10 h/mes

#### Scenario: Cambio
- **WHEN** la tribu acepta el cambio a 20 h/mes de un pacto en versión 1
- **THEN** la persona ve la versión 2 con 20 h/mes y el historial con las dos versiones

### Requirement: La tribu no acepta, con motivo
"No aceptar" SHALL pedir un motivo escrito (obligatorio, hasta 500 caracteres) antes de confirmar. Un pacto nuevo no aceptado SHALL volver a Borrador con su contenido; un cambio no aceptado SHALL descartarse y la versión vigente seguir igual. En los dos casos la persona SHALL ver el motivo.

#### Scenario: Motivo vacío
- **WHEN** quien lidera aprieta "No aceptar" sin escribir el motivo
- **THEN** no se registra nada y ve "Contá por qué, así la persona puede ajustarlo"

#### Scenario: Pacto nuevo no aceptado
- **WHEN** la tribu no acepta un pacto de 32 h/mes con el motivo "Por ahora necesitamos 16 h/mes"
- **THEN** la persona ve su pacto en Borrador con sus 32 h/mes y el aviso "Valle Solar no aceptó tu pacto: Por ahora necesitamos 16 h/mes"

#### Scenario: Cambio no aceptado
- **WHEN** la tribu no acepta un cambio a 20 h/mes sobre la versión 1 con un motivo
- **THEN** la persona sigue en la versión 1 con 10 h/mes y ve el aviso con el motivo

### Requirement: Retirar mientras se espera
Mientras la tribu no respondió, la persona SHALL poder retirar su pacto (vuelve a Borrador) o su cambio (vuelve a borrador del cambio). Lo retirado MUST desaparecer de los pendientes de la tribu. Si la tribu ya respondió, retirar MUST NOT deshacer la respuesta.

#### Scenario: Retirar
- **WHEN** una persona retira un pacto enviado a Valle Solar
- **THEN** su pacto vuelve a Borrador y `admin@prueba.test` ya no lo ve en `/pactos/responder`

#### Scenario: Responder algo retirado
- **WHEN** la persona retiró su pacto en otra pestaña y quien lidera aprieta "Aceptar" en una lista vieja
- **THEN** no se registra la aceptación y quien lidera ve "Este pacto ya no está pendiente"

### Requirement: Constancias de las dos partes
Cada propuesta, aceptación, no aceptación y retiro SHALL quedar como una constancia con: qué tipo es, quién afirma (la persona, o la tribu y quién actuó por ella), sobre qué pacto y qué versión, a qué constancia anterior apunta, cuándo y si es revocable. Las constancias MUST ser de solo agregar: retirar es revocar la propuesta con una constancia nueva; ninguna se edita ni se borra (salvo "Borrar mis datos").

#### Scenario: Aceptación
- **WHEN** `admin@prueba.test` acepta la versión 1 del pacto de `persona@prueba.test` en Valle Solar
- **THEN** queda una constancia de aceptación que afirma la tribu Valle Solar, con `admin@prueba.test` como quien actuó, sobre ese pacto y la versión 1, que apunta a la propuesta, con fecha y marcada revocable

#### Scenario: Retiro como revocación
- **WHEN** una persona retira su pacto enviado
- **THEN** la propuesta sigue en el registro y hay una constancia nueva que la revoca

#### Scenario: Lo guardado roto
- **WHEN** el registro de constancias guardado tiene una entrada mal formada
- **THEN** esa entrada se ignora, el resto se lee y la pantalla no se rompe

### Requirement: Vista de la tribu
`/pactos/responder` SHALL listar, por comunidad que la persona puede responder, los pactos y cambios pendientes con: quién lo propone (su email de la sesión), rol, horas por mes, descripción, versión que propone, si es un pacto nuevo o un cambio (y, si es un cambio, las horas vigentes) y cuándo se envió. Sin pendientes SHALL decir "No hay pactos esperando tu respuesta". En la ficha de la tribu, quien la lidera SHALL ver "Pactos para responder (N)" con enlace a esa página.

#### Scenario: Pendiente de un cambio
- **WHEN** hay un cambio a 20 h/mes sobre un pacto vigente de 10 h/mes en Valle Solar
- **THEN** `admin@prueba.test` lo ve como "Cambio · de 10 a 20 h/mes · propone la versión 2"

#### Scenario: Enlace en la ficha
- **WHEN** `admin@prueba.test` abre `/tribus/valle` con dos pactos pendientes
- **THEN** ve "Pactos para responder (2)" con enlace a `/pactos/responder`

#### Scenario: Fecha que falta
- **WHEN** una propuesta no tiene una fecha que se pueda leer
- **THEN** muestra "fecha sin dato", nunca una fecha inventada

### Requirement: La persona se entera al volver
Cuando la persona abre `/pactos`, las respuestas de la tribu SHALL aplicarse a su pacto, anunciarse y registrarse en Mi recorrido una sola vez ("<comunidad> aceptó tu pacto", "<comunidad> no aceptó tu pacto", y los de cambio que ya existen). Semillas, Perfil y Mi recorrido SHALL mostrar el pacto con las respuestas aplicadas aunque la persona no haya pasado por `/pactos`.

#### Scenario: Aviso una sola vez
- **WHEN** la tribu aceptó el pacto y la persona abre `/pactos` dos veces
- **THEN** Mi recorrido tiene un solo "Valle Solar aceptó tu pacto"

#### Scenario: Semillas sin pasar por Pactos
- **WHEN** la tribu aceptó el pacto y la persona entra directo a `/semillas`
- **THEN** Semillas ya cuenta ese pacto

### Requirement: Registro compartido, descarga y borrado
Las constancias de pactos SHALL guardarse en un registro del navegador compartido entre las personas de ese navegador (no con el prefijo de cada persona), con solo lo necesario para responder. La descarga de "Mis datos" SHALL incluir las constancias sobre los pactos de la persona. Retirar el consentimiento y borrar los datos SHALL quitar esas constancias del registro y MUST NOT tocar las de otras personas.

#### Scenario: Descargar
- **WHEN** `persona@prueba.test`, con un pacto enviado a Valle Solar, descarga sus datos en `/mis-datos`
- **THEN** el archivo incluye la propuesta de su pacto y no incluye pactos de otras personas

#### Scenario: Borrar
- **WHEN** `persona@prueba.test` retira su consentimiento y borra sus datos
- **THEN** su pacto deja de aparecer en `/pactos/responder`, y los pactos de otras personas siguen

### Requirement: Textos, ⚖ y accesibilidad
Todos los textos nuevos SHALL existir en español y en inglés. El estado "Aceptado" de un pacto acordado SHALL llevar el ⚖ "Pacto aceptado por las dos partes", marcado como borrador. Los botones y el campo del motivo MUST usarse con teclado, el resultado de cada respuesta SHALL anunciarse, y la auditoría de axe MUST pasar en `/pactos/responder`.

#### Scenario: En inglés
- **WHEN** quien lidera abre `/pactos/responder` con la interfaz en inglés
- **THEN** ve "Pacts waiting for your answer", "Accept" y "Don't accept"

#### Scenario: Teclado
- **WHEN** quien lidera responde un pacto solo con el teclado
- **THEN** puede escribir el motivo, confirmar, y el foco va al anuncio del resultado
