# Spec Delta

## Purpose

Que los miembros y aspirantes del holón de una necesidad puedan postularse para tomarla con un pacto de una sola tarea con fecha (pacto puntual), que una misma tarea la puedan tomar varias personas, y que quien administra ese holón pre-admita o no cada postulación con constancias de las dos partes (Backlog D18 y D20; decisiones de Gus del 28-oct).

## ADDED Requirements

### Requirement: Formatos que acepta cada comunidad
Cada comunidad SHALL tener una lista de formatos de pacto que acepta, en un solo lugar (`lib/pactos/formatos.ts`). Todas MUST aceptar "fijo". Con los datos de ejemplo, las tribus activas y en formación SHALL aceptar también "puntual", salvo Barda Productiva, y el Lighthouse SHALL aceptar solo "fijo". Una comunidad sin dato MUST tratarse como "solo fijo".

#### Scenario: Valle Solar
- **WHEN** se piden los formatos de `valle`
- **THEN** son "fijo" y "puntual"

#### Scenario: Barda Productiva
- **WHEN** se abre `/tribus/barda` y se despliega "Riego"
- **THEN** se lee "Barda Productiva por ahora no toma pactos puntuales" y no hay "Postularme para tomarla"

### Requirement: Solo miembros y aspirantes del holón se postulan
Solo SHALL poder postularse a una necesidad quien es miembro o aspirante de su holón. Mientras los círculos no tengan integrantes propios, la relación con un círculo MUST salir de la membresía en su tribu (o, si es transversal, en alguna de las tribus que participan): membresía aceptada es "miembro" y pedido de adhesión pendiente es "aspirante". Quien no es ninguna de las dos SHALL ver "Para postularte, primero sumate como aspirante a <tribu>" con enlace al manifiesto de la tribu, y MUST NOT poder crear una postulación.

#### Scenario: Miembro
- **WHEN** una persona miembro de Valle Solar despliega "Energía solar" en `/tribus/valle`
- **THEN** ve "Postularme para tomarla"

#### Scenario: Aspirante
- **WHEN** una persona que adhirió al manifiesto de Valle Solar y todavía no fue aceptada despliega "Energía solar"
- **THEN** ve "Postularme para tomarla"

#### Scenario: Ni miembro ni aspirante
- **WHEN** una persona sin relación con Valle Solar despliega "Energía solar"
- **THEN** ve "Para postularte, primero sumate como aspirante a Valle Solar" con enlace a `/tribus/valle/manifiesto`, y no ve "Postularme para tomarla"

#### Scenario: Por la URL sin relación
- **WHEN** una persona sin relación con Valle Solar abre `/pactos?comunidad=valle&necesidad=valle-solar`
- **THEN** ve "Para postularte, primero sumate como aspirante a Valle Solar" y no queda ninguna postulación guardada

#### Scenario: Círculo transversal
- **WHEN** una persona miembro de Taller Común (que participa en el círculo "Comunicación del común") despliega "Eventos y comunidad" en `/tribus/valle`
- **THEN** ve "Postularme para tomarla"

### Requirement: Solo se postula a una necesidad tomable
"Postularme para tomarla" SHALL aparecer solo en necesidades abiertas, de una tribu que acepta pactos puntuales y, si son de diseño, con el aval de su holón. Una necesidad puede tomarla más de una persona: que otras personas ya estén pre-admitidas MUST NOT impedir postularse. Solo SHALL aparecer si `/pactos` figura con `existe: true` en `lib/navegacion.ts`.

#### Scenario: Tarea de diseño sin aval
- **WHEN** una persona miembro de Puerto Trueque despliega "Marketing" en `/tribus/puerto`
- **THEN** ve "Esperando el aval del círculo Mercado" y no ve "Postularme para tomarla"

#### Scenario: Necesidad tomada de ejemplo
- **WHEN** en `/tribus/monte` se despliega "Maquinaria"
- **THEN** no hay "Postularme para tomarla"

### Requirement: La postulación nace de la necesidad
Al abrir `/pactos` con una `necesidad` tomable de esa comunidad, siendo miembro o aspirante de su holón y sin postulación previa para esa necesidad, SHALL crearse un borrador de pacto puntual con la necesidad, su título, la habilidad como rol (con su texto si es "Otro"), las horas aproximadas, la fecha y el máximo por persona de la ficha. Lo que la ficha no tiene MUST quedar vacío, nunca en 0 ni con una fecha inventada. La descripción MUST quedar vacía. Si la necesidad no existe, es de otra comunidad o no es tomable, MUST NOT crearse nada y la persona SHALL ver "Esa necesidad no se puede tomar". Si ya existe una postulación para esa necesidad, SHALL mostrarse esa, sin crear otra. Una persona aspirante SHALL ver sus postulaciones en `/pactos` aunque no pueda armar un pacto de tiempo con esa comunidad.

#### Scenario: Borrador desde la necesidad
- **WHEN** una persona miembro de Valle Solar abre `/pactos?comunidad=valle&necesidad=valle-solar`
- **THEN** ve un borrador de pacto puntual "Energía solar" con 10 h, fecha 21 de noviembre de 2026, rol "Otro: Electricidad", la descripción vacía, "Máximo por persona: 10 h · las horas de más no generan Semillas", "Máximo total de la tarea: 20 h" y "Responde: círculo Energía solar"

#### Scenario: Horas que faltan
- **WHEN** abre `/pactos?comunidad=valle&necesidad=valle-eventos`
- **THEN** el campo de horas está vacío y no dice 0

#### Scenario: Necesidad que no se puede tomar
- **WHEN** abre `/pactos?comunidad=valle&necesidad=monte-bioconstruccion`
- **THEN** ve "Esa necesidad no se puede tomar" y no se crea ningún pacto

#### Scenario: Dos veces la misma necesidad
- **WHEN** vuelve a abrir `/pactos?comunidad=valle&necesidad=valle-solar`
- **THEN** sigue teniendo una sola postulación para "Energía solar"

#### Scenario: Aspirante en Pactos
- **WHEN** una persona aspirante a Valle Solar abre `/pactos?comunidad=valle&necesidad=valle-solar`
- **THEN** ve su borrador de postulación y el texto "Sos aspirante a Valle Solar: podés postularte a sus tareas; el pacto de tiempo es para miembros"

### Requirement: Completar, enviar y retirar
Una postulación SHALL poder enviarse solo con rol (y su texto si es "Otro"), descripción, horas enteras entre 1 y 200 y una fecha válida `AAAA-MM-DD`. Si falta algo, SHALL decir qué falta y MUST NOT enviarse. Enviada, SHALL mostrar "Esperando que <holón> responda", MUST NOT editarse y MUST NOT ofrecer ningún botón para responder en nombre del holón. Mientras el holón no respondió SHALL poder retirarse ("Retirar y editar"), y un borrador SHALL poder descartarse.

#### Scenario: Sin horas
- **WHEN** intenta enviar la postulación a "Eventos y comunidad" sin poner horas
- **THEN** ve "Para enviarla poné cuántas horas, la fecha y contá cómo la vas a hacer." y sigue en Borrador

#### Scenario: Enviada
- **WHEN** envía la postulación completa a "Energía solar"
- **THEN** ve "Esperando que el círculo Energía solar responda" y "Retirar y editar", sin ningún botón "Simular"

#### Scenario: Retirar
- **WHEN** retira una postulación enviada
- **THEN** vuelve a Borrador con sus horas, fecha, rol y descripción, y quien administra el holón ya no la ve pendiente

### Requirement: Quién pre-admite
Una postulación SHALL responderla quien administra el holón de la necesidad: quien lidera la tribu, para la tribu o para un círculo de esa tribu; el super admin, para el común y, como respaldo humano de Hifa, para un círculo transversal (ver "Círculos transversales administrados por Hifa"). Nadie MUST poder responder su propia postulación: la de quien administra ese holón SHALL responderla otra persona que lo administre o el super admin.

#### Scenario: Círculo de la tribu
- **WHEN** `persona@prueba.test` envía su postulación a "Energía solar" (círculo de Valle Solar) y entra `admin@prueba.test`
- **THEN** la ve en `/pactos/responder`, en "Postulaciones a tareas", con "Pre-admitir" y "No pre-admitir"

#### Scenario: Círculo transversal
- **WHEN** `persona@prueba.test` envía su postulación a "Eventos y comunidad" (círculo transversal)
- **THEN** la ve `super@prueba.test` para responder, y `admin@prueba.test` no

#### Scenario: Su propia postulación
- **WHEN** `admin@prueba.test` se postula a "Energía solar" y abre `/pactos/responder`
- **THEN** la ve sin botones y con "Es tu propia postulación: la responde otra persona que administre el círculo Energía solar o el super admin"

### Requirement: Círculos transversales administrados por Hifa
Los círculos transversales SHALL ser administrados y facilitados por Hifa (la IA), según la decisión de Gus del 28-oct. En el prototipo esto SHALL ser simulado y estar marcado como experimental: Hifa MUST NOT responder postulaciones y, como respaldo humano, las SHALL responder el super admin. La postulación a una necesidad de un círculo transversal MUST decir que lo administra Hifa (experimental, simulado) y que, si no está disponible, responde el super admin; `/pactos/responder` MUST decir que se responde como respaldo de Hifa; y la pre-admisión o la no pre-admisión SHALL quedar con la marca `respaldoDeHifa`. Los demás holones MUST NOT nombrar a Hifa. La decisión definitiva depende de probar que Hifa sea estable y fiable.

#### Scenario: Aviso en la postulación
- **WHEN** la persona abre su postulación a "Eventos y comunidad" (círculo transversal)
- **THEN** lee que el círculo lo administra y facilita Hifa (experimental, simulado) y que, si Hifa no está disponible, responde el super admin

#### Scenario: Respaldo
- **WHEN** `super@prueba.test` pre-admite esa postulación
- **THEN** la constancia de aceptación afirma `circulo:comunicacion-comun`, lleva `respaldoDeHifa` y tiene a `super@prueba.test` como quien actuó

#### Scenario: Un círculo de la tribu no nombra a Hifa
- **WHEN** la persona abre su postulación a "Energía solar"
- **THEN** no se nombra a Hifa

### Requirement: Pre-admitir o no
Pre-admitir SHALL dejar la postulación "Pre-admitida" para la persona, con el contenido y el máximo por persona que vio quien respondió. "No pre-admitir" SHALL pedir un motivo escrito (obligatorio, hasta 500 caracteres); la postulación SHALL volver a Borrador con su contenido y la persona SHALL ver el motivo. Una necesidad SHALL poder tener varias postulaciones pre-admitidas, como mucho una por persona; pre-admitir a una persona MUST NOT cambiar las postulaciones de las demás. Una misma postulación MUST tener como mucho una respuesta: si ya la tiene, la segunda MUST NOT registrarse y quien responde SHALL ver "Esta postulación ya se respondió". Al responder, SHALL verse cuántas personas ya pre-admitió ese holón para esa tarea y, si la tarea tiene un máximo total en horas, cuántas horas suman las personas pre-admitidas. Pre-admitir MUST NOT bloquearse por el máximo total (el reparto de las Semillas con el total es de `pacto-puntual-verificacion`).

#### Scenario: Pre-admitida
- **WHEN** `admin@prueba.test` pre-admite la postulación de `persona@prueba.test` a "Energía solar" y la persona abre `/pactos`
- **THEN** ve "Pre-admitida" en su postulación

#### Scenario: No pre-admitida
- **WHEN** `admin@prueba.test` no pre-admite con el motivo "Necesitamos a alguien con matrícula de electricista"
- **THEN** la persona ve su postulación en Borrador y el aviso "El círculo Energía solar no pre-admitió tu postulación: Necesitamos a alguien con matrícula de electricista"

#### Scenario: Dos personas en la misma tarea
- **WHEN** dos personas se postulan a "Energía solar" y `admin@prueba.test` pre-admite a la primera y después a la segunda
- **THEN** las dos quedan "Pre-admitida", y al responder la segunda se lee "Ya pre-admitiste a 1 persona para esta tarea"

#### Scenario: Responder dos veces
- **WHEN** `admin@prueba.test` pre-admite una postulación en una pestaña y en otra, con la lista vieja, aprieta "Pre-admitir" otra vez
- **THEN** la segunda no se registra y ve "Esta postulación ya se respondió"

#### Scenario: Máximo total a la vista
- **WHEN** `admin@prueba.test` abre `/pactos/responder` con una postulación a "Energía solar" y otra persona ya pre-admitida con 10 h
- **THEN** lee "Máximo total de la tarea: 20 h" y "Entre todas las personas pre-admitidas suman 10 h de las 20 h del máximo total"

### Requirement: Máximo total de la tarea
Una necesidad con máximo total (`tribu-necesidades`: horas o Semillas, sumando a todas las personas, que fija quien administra el holón) SHALL mostrarlo en la postulación ("Máximo total de la tarea: 20 h") junto al máximo por persona, y MUST llevarlo en la propuesta para que valga el que vio el holón, aunque el dato de la necesidad cambie después. Una necesidad sin máximo total MUST NOT mostrar ninguna línea de total.

#### Scenario: Con máximo en Semillas
- **WHEN** la persona abre su postulación a "Plomería" (máximo por persona 60 Semillas, total 150 Semillas)
- **THEN** lee "Máximo por persona: 60 Semillas" y "Máximo total de la tarea: 150 Semillas"

#### Scenario: Sin máximo total
- **WHEN** la persona abre su postulación a "Eventos y comunidad"
- **THEN** no hay ninguna línea de máximo por persona ni de máximo total

### Requirement: Constancias de la postulación
Enviar, pre-admitir, no pre-admitir y retirar SHALL quedar como constancias del registro compartido de `pactos-dos-partes`, con su misma forma: la postulación afirmada por la persona, sobre esa necesidad y esa persona, con el holón, la relación (miembro o aspirante), rol, descripción, horas, fecha y el máximo por persona y el máximo total de la necesidad (si tiene), y el nombre o las iniciales (MUST NOT llevar el email); la pre-admisión y la no pre-admisión afirmadas por el holón, con quien actuó por él, apuntando a la postulación. Retirar SHALL ser revocar la postulación con una constancia nueva.

#### Scenario: Pre-admisión
- **WHEN** `admin@prueba.test` pre-admite la postulación a "Energía solar"
- **THEN** queda una constancia de aceptación que afirma `circulo:valle-3`, con `admin@prueba.test` como quien actuó, que apunta a la postulación

### Requirement: Estado de la necesidad
En la ficha de la tribu, una necesidad con una postulación de la persona SHALL mostrar su estado para esa persona en lugar del de ejemplo: "Tenés un borrador para postularte" (con enlace al pacto), "Te postulaste · esperando a <holón>", "Pre-admitida: la tomaste" o "<holón> no pre-admitió tu postulación"; "Postularme para tomarla" MUST NOT aparecer en esos casos. Con postulaciones pre-admitidas de otras personas SHALL decir "La tomaron <N> personas" (o "La tomó 1 persona") y, si la persona no tiene postulación y la necesidad sigue tomable, SHALL seguir ofreciendo "Postularme para tomarla".

#### Scenario: La tomaste
- **WHEN** el círculo pre-admitió la postulación de la persona a "Energía solar" y ella abre `/tribus/valle`
- **THEN** "Energía solar" dice "Pre-admitida: la tomaste"

#### Scenario: Otra persona se suma
- **WHEN** otra persona miembro de Valle Solar, en el mismo navegador, abre `/tribus/valle`
- **THEN** "Energía solar" dice "La tomó 1 persona" y le ofrece "Postularme para tomarla"

### Requirement: Sin ronda ni evaluación de pares
Un pacto puntual MUST NOT habilitar la ronda de reconocimiento ni la evaluación de pares, en ningún paso. La ronda SHALL seguir habilitándose solo con un pacto recurrente aceptado.

#### Scenario: Solo un puntual
- **WHEN** la persona tiene solo una postulación pre-admitida en Valle Solar y abre `/semillas`
- **THEN** no aparece la ronda de reconocimiento

### Requirement: Eventos en Mi recorrido
Enviar una postulación, que el holón la pre-admita y que no la pre-admita SHALL registrar, una sola vez por hecho, "Te postulaste para <tarea> en <tribu>", "<holón> pre-admitió tu postulación a <tarea>" y "<holón> no pre-admitió tu postulación a <tarea>" (sin el motivo), con enlace a `/pactos?comunidad=<tribu>`.

#### Scenario: Pre-admisión una sola vez
- **WHEN** el círculo pre-admitió la postulación y la persona abre `/pactos` dos veces
- **THEN** Mi recorrido tiene un solo "El círculo Energía solar pre-admitió tu postulación a Energía solar"

### Requirement: Nombres de las Semillas
Los textos nuevos SHALL llamar "Semillas" a lo que se reconoce por las horas verificadas y "Semillas pendientes" solo a lo de los compromisos recurrentes que todavía no se recibió (`pactos-horas-variables`); MUST NOT usar "brotes" ni "germinar". En inglés "Semillas" no se traduce. Un pacto puntual MUST NOT hablar de Semillas pendientes.

#### Scenario: Sin otros nombres
- **WHEN** se recorren los textos de la postulación y de `/pactos/responder`
- **THEN** dicen "Semillas" y no aparece "brotes", "germinar" ni "Semillas pendientes"

### Requirement: Compatibilidad, descarga y borrado
Lo guardado sin pactos puntuales SHALL leerse igual que antes, con la lista vacía. Una postulación guardada con datos inválidos MUST corregirse o descartarse campo por campo sin romper el resto. La descarga de "Mis datos" SHALL incluir las constancias de las postulaciones de la persona, y borrar sus datos SHALL quitarlas del registro compartido sin tocar las de otras personas.

#### Scenario: Pacto fijo anterior
- **WHEN** una persona tenía un pacto fijo aceptado guardado antes de este cambio
- **THEN** lo sigue viendo igual y Semillas calcula como antes

#### Scenario: Borrar
- **WHEN** `persona@prueba.test` borra sus datos con una postulación enviada
- **THEN** `admin@prueba.test` ya no la ve en `/pactos/responder`

### Requirement: Término legal, textos y accesibilidad
"Pacto puntual" SHALL llevar el ⚖ con el texto `pactopuntual` del catálogo (`borrador: true`, con su inglés): un acuerdo voluntario de colaboración para una sola tarea, sin horario impuesto, sin órdenes sobre cómo hacerla y sin pago en dinero, que no es un contrato de trabajo, donde el holón decide si la deja tomar y verifica el resultado, y cuyas horas verificadas se reconocen con Semillas que no son un sueldo. Todos los textos nuevos SHALL existir en español (voseo) y en inglés. Todo el flujo MUST usarse con teclado, cada respuesta SHALL anunciarse en una región `aria-live`, y axe MUST pasar sin violaciones `serious` ni `critical` en `/pactos` con una postulación enviada y en `/pactos/responder` con una postulación pendiente.

#### Scenario: ⚖ con teclado
- **WHEN** en `/pactos` se llega con Tab al ⚖ de "Pacto puntual"
- **THEN** se ve que no es un contrato de trabajo y que no hay horario impuesto, y Escape lo esconde

#### Scenario: En inglés
- **WHEN** se abre `/pactos` en inglés con una postulación pre-admitida
- **THEN** se lee "One-off pact" y "Pre-admitted"
