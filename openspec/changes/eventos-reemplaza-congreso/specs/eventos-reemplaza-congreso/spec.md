# Spec Delta

## Purpose

Reemplaza la sección Congreso por Eventos en toda la plataforma tras la cancelación del Congreso de febrero 2027, y conserva el código de la vitrina con instrucciones para volver.

## ADDED Requirements

### Requirement: Eventos en lugar de Congreso en la navegación
El grupo Participar SHALL mostrar, en orden, Pactos, Semillas, Fogón y Eventos. Eventos MUST llevar a `/eventos` y MUST estar habilitado también sin cuenta. Ningún menú MUST mostrar un enlace a Congreso.

#### Scenario: Rail en la computadora
- **WHEN** una persona miembro abre la portada en una pantalla de 1280 px
- **THEN** Participar trae Pactos, Semillas, Fogón y Eventos, y no hay un enlace "Congreso" en la navegación "Principal"

#### Scenario: Sin cuenta
- **WHEN** una persona sin cuenta mira el rail
- **THEN** Eventos es un enlace habilitado a `/eventos`, sin la ayuda "Sumate"

#### Scenario: En inglés
- **WHEN** una persona mira el rail en inglés
- **THEN** el grupo trae "Events", sin "Congress"

#### Scenario: Página actual
- **WHEN** la persona está en `/eventos`
- **THEN** Eventos tiene `aria-current="page"`

### Requirement: Redirección de las direcciones del Congreso
`/congreso` y `/congreso/en` SHALL redirigir de forma temporal a `/eventos`, conservando la query y el ancla. Ninguna MUST mostrar la vitrina.

#### Scenario: Enlace viejo con campaña
- **WHEN** una persona abre `/congreso?utm_source=newsletter`
- **THEN** llega a `/eventos?utm_source=newsletter` con una redirección 307, y el origen de la campaña se guarda igual

#### Scenario: Otras direcciones
- **WHEN** una persona abre `/congreso/otra`
- **THEN** recibe la misma respuesta que antes de este cambio, sin redirección

### Requirement: Idioma al llegar desde la dirección en inglés
Quien llega desde `/congreso/en` sin un idioma elegido SHALL quedar con la plataforma en inglés. Si ya eligió un idioma, MUST conservarse.

#### Scenario: Sin idioma elegido
- **WHEN** una persona sin cookie de idioma y con el navegador en español abre `/congreso/en`
- **THEN** llega a `/eventos` en inglés, sin `lang` en la dirección

#### Scenario: Con español elegido
- **WHEN** una persona con español elegido abre `/congreso/en`
- **THEN** llega a `/eventos` en español y su elección no cambia

### Requirement: La plataforma no enlaza al Congreso
Ningún enlace visible de la plataforma SHALL llevar a `/congreso`. Portada, Mi recorrido, Pasaporte, Semillas y actividad MUST llevar a `/eventos`.

#### Scenario: Portada
- **WHEN** una persona abre la portada
- **THEN** el camino de encontrarse en persona se llama "Eventos", no dice "Feb 2027" y lleva a `/eventos`

#### Scenario: Camino viejo
- **WHEN** una persona abre `/?camino=congreso`
- **THEN** la tarjeta de Eventos aparece como recomendada

#### Scenario: Aviso guardado
- **WHEN** Mi recorrido muestra un "Registraste tu ticket del Congreso" guardado antes de este cambio
- **THEN** la línea se sigue viendo y su enlace termina en `/eventos`

### Requirement: Próximo paso de Mi recorrido
El último próximo paso de Mi recorrido SHALL ser elegir un evento, con enlace a `/eventos`. Se MUST dar por cumplido si la persona anotó un "Quiero ir", aunque ese evento ya haya pasado, o si tiene un ticket válido guardado.

#### Scenario: Sin eventos
- **WHEN** una persona tiene hechos los demás pasos y no se anotó a ningún evento
- **THEN** el próximo paso es "Elegí un evento"

#### Scenario: Con Quiero ir
- **WHEN** se anota a un evento
- **THEN** ese paso deja de aparecer

#### Scenario: Ticket anterior
- **WHEN** tiene guardado un ticket válido de antes de este cambio
- **THEN** ese paso no aparece

### Requirement: Sin invitaciones a registrar un ticket
Pasaporte, Semillas y Sumarte MUST NOT invitar a registrar un ticket del Congreso. El sello Genesis MUST decir que se está definiendo cómo se obtiene, MUST NOT aparecer como disponible y MUST NOT prometer una forma concreta de obtenerlo.

#### Scenario: Sello Genesis sin ticket
- **WHEN** una persona sin ticket abre el Pasaporte
- **THEN** el sello Genesis figura como no disponible, dice que se está definiendo y no ofrece "Registrar mi ticket"

#### Scenario: Sello Genesis con ticket anterior
- **WHEN** una persona con un ticket válido guardado abre el Pasaporte
- **THEN** ve que su ticket quedó registrado y que el Congreso se canceló, y conserva el ticket

#### Scenario: Semillas
- **WHEN** una persona sin ticket mira la presencia en Semillas
- **THEN** sigue diciendo "sin dato" y lee un enlace a Eventos, sin pedido de ticket

#### Scenario: Sumarte
- **WHEN** una persona lee los planes en Sumarte, en español o en inglés
- **THEN** Explorador nombra Eventos y no menciona el registro de un ticket

### Requirement: Vitrina conservada
El código de la vitrina, sus tests unitarios y lo guardado en el navegador MUST quedar sin borrar. Una nota en el repo MUST explicar por qué se pausó, qué quedó, qué falta resolver y los pasos para volver.

#### Scenario: Nada borrado
- **WHEN** se compara `app/congreso/` y `lib/congreso/` con la versión anterior
- **THEN** no hay archivos borrados ni modificados, y sus tests unitarios siguen en verde

#### Scenario: Ticket guardado
- **WHEN** una persona tiene un ticket guardado y descarga sus datos
- **THEN** el ticket sigue en el archivo

#### Scenario: Volver
- **WHEN** alguien sigue los pasos de la nota
- **THEN** la vitrina vuelve a verse en `/congreso` y `/congreso/en`, y `/eventos` sigue funcionando
