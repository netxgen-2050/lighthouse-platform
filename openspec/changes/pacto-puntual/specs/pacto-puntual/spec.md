# Spec Delta

## Purpose

Que tomar una necesidad de una tribu abra un pacto de una sola tarea con fecha (pacto puntual), que la tribu lo acepte y confirme las horas hechas, y que esas horas den la constancia base de Semillas (Backlog D18 y D20).

## ADDED Requirements

### Requirement: Formatos que acepta cada comunidad
Cada comunidad SHALL tener una lista de formatos de pacto que acepta, en un solo lugar (`lib/pactos/formatos.ts`). Todas MUST aceptar "fijo". Con los datos de ejemplo, las tribus activas y en formación SHALL aceptar también "puntual", salvo Barda Productiva, y el Lighthouse SHALL aceptar solo "fijo". Una comunidad sin dato MUST tratarse como "solo fijo".

#### Scenario: Valle Solar
- **WHEN** se piden los formatos de `valle`
- **THEN** son "fijo" y "puntual"

#### Scenario: Barda Productiva
- **WHEN** se abre `/tribus/barda` y se despliega "Riego"
- **THEN** se lee "Barda Productiva por ahora no toma pactos puntuales" y no hay "Ofrecer tomarla"

### Requirement: Ofrecer tomar una necesidad
En la ficha de una tribu que acepta pactos puntuales, cada necesidad abierta SHALL ofrecer "Ofrecer tomarla", que lleva a `/pactos?comunidad=<tribu>&necesidad=<id>` (o primero a entrar, si no hay sesión). Solo SHALL aparecer si `/pactos` figura con `existe: true` en `lib/navegacion.ts`. Una necesidad tomada o hecha en los datos de ejemplo MUST NOT ofrecerlo.

#### Scenario: Necesidad abierta
- **WHEN** en `/tribus/valle` se despliega "Energía solar" y se activa "Ofrecer tomarla"
- **THEN** se llega a `/pactos?comunidad=valle&necesidad=valle-solar`

#### Scenario: Necesidad tomada de ejemplo
- **WHEN** en `/tribus/monte` se despliega "Maquinaria"
- **THEN** no hay "Ofrecer tomarla"

### Requirement: El pacto puntual nace de la necesidad
Al abrir `/pactos` con una `necesidad` abierta de esa comunidad y sin pacto puntual previo de la persona para esa necesidad, SHALL crearse un borrador de pacto puntual con: la necesidad, su título, la habilidad como rol (con su texto si es "Otro"), las horas aproximadas y la fecha de la ficha. Lo que la ficha no tiene MUST quedar vacío, nunca en 0 ni con una fecha inventada. La descripción MUST quedar vacía para que la persona cuente cómo la va a hacer. Si la necesidad no existe, es de otra comunidad, no está abierta o la comunidad no acepta puntuales, MUST NOT crearse nada y la persona SHALL ver "Esa necesidad no se puede tomar". Si ya existe un pacto puntual para esa necesidad, SHALL mostrarse ese, sin crear otro. Si la persona no es miembro de la comunidad, SHALL verse lo que `/pactos` ya muestra a quien no es miembro.

#### Scenario: Borrador desde la necesidad
- **WHEN** una persona miembro de Valle Solar abre `/pactos?comunidad=valle&necesidad=valle-solar`
- **THEN** ve un borrador de pacto puntual "Energía solar" con 10 h, fecha 21 de noviembre de 2026, rol "Otro: Electricidad" y la descripción vacía

#### Scenario: Horas que faltan
- **WHEN** abre `/pactos?comunidad=valle&necesidad=valle-eventos`
- **THEN** el campo de horas está vacío y no dice 0

#### Scenario: Necesidad que no se puede tomar
- **WHEN** abre `/pactos?comunidad=valle&necesidad=monte-bioconstruccion`
- **THEN** ve "Esa necesidad no se puede tomar" y no se crea ningún pacto

#### Scenario: Dos veces la misma necesidad
- **WHEN** vuelve a abrir `/pactos?comunidad=valle&necesidad=valle-solar`
- **THEN** sigue teniendo un solo pacto puntual para "Energía solar"

### Requirement: Completar y enviar
Un pacto puntual SHALL poder enviarse solo con rol (y su texto si es "Otro"), descripción, horas enteras entre 1 y 200 y una fecha válida `AAAA-MM-DD`. Si falta algo, SHALL decir qué falta y MUST NOT enviarse. Una vez enviado MUST NOT editarse; SHALL poder retirarse ("Retirar y editar") mientras la tribu no respondió, y un borrador SHALL poder descartarse.

#### Scenario: Sin horas
- **WHEN** intenta enviar el pacto de "Eventos y comunidad" sin poner horas
- **THEN** ve "Para enviarlo poné cuántas horas, la fecha y contá cómo la vas a hacer." y sigue en Borrador

#### Scenario: Retirar
- **WHEN** retira un pacto puntual enviado
- **THEN** vuelve a Borrador con sus horas, fecha, rol y descripción

### Requirement: Pasos del pacto puntual
Los pasos SHALL ser, en este orden y escritos con texto: "Borrador", "Enviado a <tribu>", "Aceptado", "Hecha · esperando que <tribu> confirme las horas" y "Horas confirmadas". Con el pacto aceptado, la persona SHALL poder marcar la tarea como hecha con las horas reales (enteras, de 1 a 200; pueden ser distintas de las pactadas).

#### Scenario: Marcar hecha con otras horas
- **WHEN** en un pacto puntual aceptado de 10 h la persona marca la tarea como hecha con 12 h
- **THEN** ve "Hecha · esperando que Valle Solar confirme las horas" con 12 h

### Requirement: Respuestas de la tribu, simuladas y en un solo lugar
Mientras la aceptación real no exista, las respuestas de la tribu SHALL ser botones de simulación: con el pacto enviado, "Simular: <tribu> acepta"; con la tarea marcada hecha, "Simular: <tribu> confirma tus horas" y "Simular: <tribu> pide revisar las horas" (vuelve a "Aceptado" con el aviso "<tribu> pidió revisar las horas"). Estas respuestas MUST pasar por dos acciones del reductor (aceptar y responder las horas) que la pantalla de la persona solo llama desde esos botones. Las Semillas MUST NOT nacer de un clic de la persona que no sea una de esas simulaciones de la tribu.

#### Scenario: La tribu acepta
- **WHEN** la persona activa "Simular: Valle Solar acepta" en su pacto puntual enviado
- **THEN** el pacto queda "Aceptado"

#### Scenario: La tribu pide revisar
- **WHEN** la persona activa "Simular: Valle Solar pide revisar las horas"
- **THEN** el pacto vuelve a "Aceptado", ve el aviso y no hay constancia

### Requirement: Estado de la necesidad para la persona
En la ficha de la tribu, una necesidad con un pacto puntual de la persona SHALL mostrar su estado para esa persona en lugar del de ejemplo: "Tenés un borrador para tomarla" (con enlace al pacto), "Ofreciste tomarla · esperando respuesta", "Tomada por vos" o "Hecha por vos". "Ofrecer tomarla" MUST NOT aparecer si ya hay un pacto puntual de la persona para esa necesidad.

#### Scenario: Tomada por vos
- **WHEN** Valle Solar aceptó (simulado) el pacto puntual de "Energía solar" y la persona abre `/tribus/valle`
- **THEN** "Energía solar" dice "Tomada por vos" y no ofrece tomarla

### Requirement: Constancia base al confirmar las horas
Al confirmarse las horas SHALL guardarse una constancia base con la forma de ADR-012: `schema` "semillas-base", `afirma` "netx", `sobre` el pacto puntual, `apunta_a` nulo, la fecha de creación, y en `datos` el tipo "puntual", la necesidad, la fecha de la tarea, las horas confirmadas, el valor de la hora de referencia, el período (`AAAA-MM` de la confirmación), la versión del pacto (1) y las Semillas (`round(horas × valor hora)`). La constancia MUST quedar congelada: se lee tal como se guardó, MUST NOT recalcularse si cambia el valor de la hora y MUST NOT editarse. Una constancia guardada mal formada MUST descartarse y el pacto SHALL volver a "Hecha · esperando que <tribu> confirme las horas".

#### Scenario: Diez horas confirmadas
- **WHEN** Valle Solar confirma (simulado) 10 h de "Energía solar" en noviembre de 2026
- **THEN** queda una constancia base con 10 h, período "2026-11" y 50 Semillas

#### Scenario: Lo guardado roto
- **WHEN** la constancia guardada no tiene horas
- **THEN** se descarta, el pacto queda esperando la confirmación y la pantalla no se rompe

### Requirement: Semillas de los pactos puntuales
La tarjeta de Semillas de cada comunidad SHALL mostrar la parte "Pactos puntuales" con la suma de las Semillas de sus constancias base y, debajo, cada constancia (tarea, horas, fecha de confirmación, Semillas). Sin constancias, la parte MUST decir "sin dato", no 0. El total SHALL sumarla. Las Semillas de un puntual MUST contarse una sola vez (no por mes). La ronda de reconocimiento MUST seguir habilitándose solo con el pacto fijo aceptado.

#### Scenario: Con una constancia
- **WHEN** la persona tiene 50 Semillas de un pacto puntual confirmado en Valle Solar y ningún otro pacto
- **THEN** la tarjeta de Valle Solar dice "Pactos puntuales: 50", el total es 50 y no aparece la ronda

#### Scenario: Sin constancias
- **WHEN** la persona no tiene pactos puntuales confirmados en Valle Solar
- **THEN** "Pactos puntuales" dice "sin dato"

### Requirement: Eventos en Mi recorrido
Enviar un pacto puntual, que la tribu lo acepte y que confirme las horas SHALL registrar, una sola vez cada uno, "Ofreciste tomar <tarea> en <tribu>", "<tribu> aceptó tu pacto puntual" y "<tribu> confirmó tus horas de <tarea>", con enlace a `/pactos?comunidad=<tribu>`.

#### Scenario: Confirmación
- **WHEN** Valle Solar confirma (simulado) las horas de "Energía solar"
- **THEN** Mi recorrido muestra "Valle Solar confirmó tus horas de Energía solar"

### Requirement: Compatibilidad con lo guardado
Lo guardado sin pactos puntuales SHALL leerse igual que antes, con la lista de puntuales vacía. Un pacto puntual guardado con datos inválidos MUST descartarse campo por campo con las mismas reglas que el pacto fijo, sin romper el resto.

#### Scenario: Pacto fijo anterior
- **WHEN** una persona tenía un pacto fijo aceptado guardado antes de este cambio
- **THEN** lo sigue viendo igual y Semillas calcula como antes

### Requirement: Término legal, textos y accesibilidad
"Pacto puntual" SHALL llevar el ⚖ con el texto `pactopuntual` del catálogo (`borrador: true`, con su inglés): un acuerdo de colaboración para una sola tarea, que no es un contrato de trabajo ni da derecho a un pago, y cuyas horas confirmadas se registran como Semillas. Todos los textos nuevos SHALL existir en español (voseo) y en inglés. Todo el flujo MUST usarse con teclado, cada respuesta simulada SHALL anunciarse en una región `aria-live`, y axe MUST pasar sin violaciones `serious` ni `critical` en `/pactos` con un pacto puntual en curso y en `/semillas` con una constancia.

#### Scenario: ⚖ con teclado
- **WHEN** en `/pactos` se llega con Tab al ⚖ de "Pacto puntual"
- **THEN** se ve que no es un contrato de trabajo y Escape lo esconde

#### Scenario: En inglés
- **WHEN** se abre `/pactos` en inglés con un pacto puntual aceptado
- **THEN** se lee "One-off pact" y "Accepted"
