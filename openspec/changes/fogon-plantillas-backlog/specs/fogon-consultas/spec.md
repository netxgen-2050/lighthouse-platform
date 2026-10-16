# Spec Delta

## ADDED Requirements

### Requirement: Plantilla U7 con el backlog de producto
"Nueva consulta" in `/netx` SHALL offer a U7 template titled "¿Qué sigue en la plataforma?", mode Prioridades, scope Equipo, open vote, result at close, votes against off, whose description says the result is advisory and that Gus decides the order. Its options SHALL be exactly the 20 backlog items listed in the scenario, each labelled with its code and name.

#### Scenario: Opciones de U7
- **WHEN** el super admin elige la plantilla U7
- **THEN** ve estas 20 opciones, en este orden: "B2 · Tipos de usuario y permisos", "B3 · Registro desde Sumarte", "B4 · Alcances de Perfil, Pasaporte y Mi recorrido", "B5 · Pasaporte como KYC a pedido", "B6 · Aprobaciones de un admin de comunidad", "D1 · Comunidades postulantes vs. tribus", "D2 · Notificaciones y mensajes", "D3 · Utilidades de cada tribu", "D4 · Lo que te abre en Semillas", "D5 · Fogón con muchas tribus", "D6 · Mercado de compromisos", "L1 · Valor de la hora propio", "L2 · Cálculos finos de Semillas", "L3 · Congreso con la información de la organización", "L4 · Masterplan y 3D del Macrolote 7", "L5 · Funnel de venta de lotes de Soluna", "L6 · Imágenes en el mercado", "L7 · Calendly real", "L9 · Límite de reportes por persona", "L10 · Política de privacidad en inglés"

#### Scenario: Descripción consultiva
- **WHEN** el super admin elige la plantilla U7
- **THEN** la descripción dice "El resultado es consultivo: el orden lo decide Gus."

### Requirement: Plantilla U5 del centro comunitario
"Nueva consulta" SHALL offer a U5 template titled "Programa del centro comunitario", mode Prioridades, scope Equipo, open vote, result at close, with the options "Restaurante", "Cowork", "Co-living", "Aulas / I+D" and "Domo de eventos".

#### Scenario: Elegir U5
- **WHEN** el super admin elige la plantilla U5
- **THEN** el formulario trae ese título y las cinco opciones

### Requirement: Quitar opciones de una plantilla
Before creating a consultation, the super admin SHALL be able to remove any option brought by a template with a "Quitar" button labelled with the option name; removing MUST NOT be allowed below two options, and focus SHALL move to a sensible place after removing.

#### Scenario: Achicar U7
- **WHEN** el super admin elige U7, quita 14 opciones y crea la consulta
- **THEN** la consulta se crea con las 6 opciones restantes, en el mismo orden

#### Scenario: Mínimo de dos
- **WHEN** quedan dos opciones en el formulario
- **THEN** los botones "Quitar" de esas dos están deshabilitados y un texto dice "Una consulta necesita al menos dos opciones."

#### Scenario: Teclado
- **WHEN** el super admin llega con Tab a "Quitar B3 · Registro desde Sumarte" y aprieta Enter
- **THEN** la opción desaparece y el foco pasa al botón "Quitar" de la opción siguiente (o al de la anterior si era la última)

### Requirement: Consulta larga legible
A consultation with 20 options SHALL keep the "Mi reparto" screen and the group result usable: every option with its votes and cost in text, the equivalent table of the donut with all options, no horizontal scroll at 390 px, and the axe audit passing.

#### Scenario: U7 completa en el celular
- **WHEN** una persona del padrón abre U7 con sus 20 opciones en una pantalla de 390 px
- **THEN** puede repartir con el teclado, ve cada opción con sus votos y su costo escritos, no hay scroll horizontal y axe no reporta violaciones serias ni críticas
