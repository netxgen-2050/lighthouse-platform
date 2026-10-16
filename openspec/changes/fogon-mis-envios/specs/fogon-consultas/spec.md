# Spec Delta

## ADDED Requirements

### Requirement: Comprobante al guardar
Después de guardar un reparto con éxito, la pantalla SHALL mostrar y anunciar a los lectores de pantalla "Tu reparto quedó guardado el <fecha> a las <hora> (hora de Argentina) · comprobante <código>", donde la hora es la que registró la fuente de datos (la base, en la versión con base) y el código son los primeros 8 caracteres del identificador del envío. Si el guardado falla, la pantalla MUST NOT mostrar un comprobante.

#### Scenario: Guardar
- **WHEN** la persona guarda su reparto en U1
- **THEN** ve "Tu reparto quedó guardado el <fecha> a las <hora> (hora de Argentina) · comprobante" seguido de un código de 8 caracteres

#### Scenario: Guardado fallido
- **WHEN** la persona intenta guardar y la consulta ya cerró
- **THEN** ve el error de consulta cerrada y ningún comprobante

### Requirement: Mis envíos en esta consulta
El detalle de una consulta SHALL ofrecer una sección desplegable "Mis envíos en esta consulta" con cada envío de la persona, del más nuevo al más viejo, con fecha y hora, código, votos por opción y créditos usados. El último envío SHALL marcarse "Este es el que cuenta", con texto. Un envío con todas las opciones en 0 SHALL mostrarse como "Sin votos". Sin envíos, la sección SHALL decir "Todavía no guardaste ningún reparto en esta consulta".

#### Scenario: Tres envíos
- **WHEN** la persona guardó tres repartos distintos en U1
- **THEN** ve tres envíos en orden, del más nuevo al más viejo, y solo el primero dice "Este es el que cuenta"

#### Scenario: Envío en cero
- **WHEN** la persona guardó un reparto con todas las opciones en 0
- **THEN** ese envío figura como "Sin votos"

### Requirement: Mis envíos después del cierre
En una consulta cerrada, la sección SHALL seguir visible. Si el último envío de la persona tenía al menos un voto, SHALL decir "Contó tu envío del <fecha y hora>"; si no tenía envíos, o si el último estaba todo en 0 (vale el último, igual que en el resultado del grupo), SHALL decir "No repartiste en esta consulta".

#### Scenario: Consulta cerrada
- **WHEN** U1 cierra y el último envío de la persona tenía votos
- **THEN** ve "Contó tu envío del <fecha y hora>" con el mismo código del comprobante

#### Scenario: Último envío en cero
- **WHEN** U1 cierra y el último envío de la persona estaba todo en 0, aunque uno anterior tenía votos
- **THEN** ve "No repartiste en esta consulta"

### Requirement: Solo los envíos propios
La vista de una consulta MUST incluir solo los envíos de la persona que la pide, nunca los de otra persona, en voto abierto y en voto secreto y también para el super admin. Los envíos propios MUST NOT incluir el identificador interno de la persona ni su email.

#### Scenario: Voto secreto
- **WHEN** la persona B abre U3 (voto secreto) en la que A guardó dos envíos
- **THEN** la respuesta de la API para B no trae ningún envío de A

#### Scenario: Super admin
- **WHEN** el super admin abre una consulta en la que no repartió
- **THEN** la sección dice "Todavía no guardaste ningún reparto en esta consulta" y la respuesta no trae envíos de nadie

### Requirement: Accesibilidad de mis envíos
El comprobante y la sección "Mis envíos en esta consulta" SHALL ser usables con teclado (el desplegable se abre y cierra con Enter y Espacio), comunicar todo con texto (no solo con color), pasar la auditoría de axe y no generar scroll horizontal a 390 px.

#### Scenario: Auditoría
- **WHEN** corre la auditoría de accesibilidad sobre el detalle de U1 con la sección abierta y un comprobante a la vista
- **THEN** no hay violaciones serias ni críticas
