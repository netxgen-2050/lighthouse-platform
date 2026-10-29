# Spec Delta

## Purpose

Que un pacto de tiempo recurrente pueda tener horas que varían de un mes a otro dentro de un rango acordado, con un compromiso mínimo de 1 a 3 meses que fija cada comunidad, que la comunidad confirme las horas de cada mes, que sus Semillas queden pendientes hasta cumplir el mínimo en meses confirmados, y que cada comunidad diga si acepta ese formato (Backlog D20; decisiones de Gus del 28-oct).

## ADDED Requirements

### Requirement: Formato variable por comunidad
`lib/pactos/formatos.ts` SHALL incluir el formato "variable". Con los datos de ejemplo, lo SHALL aceptar el Lighthouse, Semilla Viva, Agua Clara, Valle Solar, Taller Común, Avelan Kerum y Puerto Trueque, y MUST NOT aceptarlo Monte Nuevo ni Barda Productiva. Si una comunidad no lo acepta, `/pactos` MUST NOT ofrecer la modalidad variable para ella.

#### Scenario: Comunidad que no lo acepta
- **WHEN** una persona miembro de Monte Nuevo arma su pacto de tiempo
- **THEN** no ve la opción "Horas variables"

### Requirement: Compromiso mínimo por comunidad
Cada comunidad SHALL tener un compromiso mínimo de 1, 2 o 3 meses para el pacto variable, en un solo lugar; sin dato MUST tomarse 3. Con los datos de ejemplo, Agua Clara SHALL tener 2, Taller Común 1 y el resto 3. El pacto variable SHALL llevar el compromiso de su comunidad al enviarse, mostrarlo como "Compromiso mínimo: <N> meses · después dura lo que quieras sostenerlo" con el ⚖ `compromisominimo`, y MUST NOT tener fecha de fin. La persona MUST NOT poder cambiarlo. Un cambio de pacto MUST conservar el compromiso de la versión vigente.

#### Scenario: Valle Solar
- **WHEN** una persona miembro de Valle Solar elige "Horas variables"
- **THEN** ve "Compromiso mínimo: 3 meses · después dura lo que quieras sostenerlo"

#### Scenario: Taller Común
- **WHEN** una persona miembro de Taller Común elige "Horas variables"
- **THEN** ve "Compromiso mínimo: 1 mes · después dura lo que quieras sostenerlo"

### Requirement: Elegir la modalidad
El pacto de tiempo recurrente SHALL tener una modalidad, "Horas fijas" (la de hoy, por defecto) u "Horas variables", elegible en el borrador. Con "Horas variables" SHALL pedir un rango por mes, con mínimo desde 0, máximo hasta 80, pasos de 2 y mínimo menor que máximo, en lugar de las horas fijas. El rol y la descripción MUST seguir siendo obligatorios. La comunidad SHALL aceptarlo o no como cualquier pacto de `pactos-dos-partes`, viendo la modalidad, el rango y el compromiso.

#### Scenario: Rango
- **WHEN** una persona miembro de Valle Solar elige "Horas variables" y pone de 0 a 30 h
- **THEN** ve "Entre 0 y 30 h por mes" y puede enviarlo con rol y descripción

#### Scenario: Rango al revés
- **WHEN** pone de 30 a 10 h
- **THEN** ve "El mínimo tiene que ser menor que el máximo" y no puede enviarlo

#### Scenario: La tribu lo ve
- **WHEN** `admin@prueba.test` abre `/pactos/responder` con ese pacto pendiente
- **THEN** ve "Horas variables · entre 0 y 30 h/mes · compromiso mínimo 3 meses"

### Requirement: Declarar las horas del mes
Con un pacto variable aceptado, la persona SHALL poder declarar las horas del mes en curso, enteras, en pasos de 2 y dentro del rango vigente, sin proponer un cambio. Mientras la comunidad no respondió, SHALL poder corregirlas. Un mes confirmado MUST NOT editarse. Los meses pasados MUST NOT declararse, salvo un mes que la comunidad pidió revisar. Los meses futuros MUST NOT declararse. Declarar 0 SHALL guardarse como dato; un mes sin declarar SHALL mostrarse como "sin dato".

#### Scenario: Declarar
- **WHEN** en noviembre de 2026 la persona con un pacto variable de 0 a 30 h en Valle Solar declara 24 h
- **THEN** ve "Noviembre de 2026: 24 h · esperando que Valle Solar las confirme" y no se creó ningún cambio de pacto

#### Scenario: Fuera del rango
- **WHEN** intenta declarar 40 h
- **THEN** ve "Está fuera de lo pactado (0 a 30 h). Para más horas, proponé un cambio." y no se guarda

#### Scenario: Corregir antes de la respuesta
- **WHEN** declara 24 h de noviembre y, antes de que la tribu responda, corrige a 20 h
- **THEN** la tribu ve una sola declaración de noviembre, con 20 h

#### Scenario: Mes pasado
- **WHEN** ya es diciembre de 2026 y la persona mira noviembre, ya confirmado
- **THEN** ve las 24 h de noviembre sin poder editarlas

#### Scenario: Fin de mes en Argentina
- **WHEN** declara el 30 de noviembre de 2026 a las 22:30 de Argentina (`2026-12-01T01:30:00Z`)
- **THEN** la declaración es de noviembre

### Requirement: La comunidad confirma las horas de cada mes
Las horas declaradas de un mes SHALL confirmarlas quien administra la comunidad del pacto (quien lidera la tribu; el super admin para el Lighthouse), en `/pactos/responder` ("Horas del mes para confirmar"), con "Confirmar" o "Pedir revisar" (con motivo obligatorio). Nadie MUST poder confirmar sus propias horas. Una declaración MUST tener como mucho una respuesta. Con "Pedir revisar", el mes SHALL quedar "a revisar" con el motivo y la persona SHALL poder declararlo de nuevo aunque haya pasado.

#### Scenario: Confirmar
- **WHEN** `admin@prueba.test` confirma las 24 h de noviembre de `persona@prueba.test`
- **THEN** la persona ve "Noviembre de 2026: 24 h · confirmadas por Valle Solar"

#### Scenario: Pedir revisar un mes pasado
- **WHEN** en diciembre la tribu pide revisar las horas de noviembre con el motivo "Fueron 20, no 24"
- **THEN** la persona ve el motivo y puede volver a declarar noviembre

### Requirement: Cambiar de modalidad o de rango
"Proponer un cambio" SHALL permitir cambiar la modalidad y el rango además del rol, la descripción y las horas, con las mismas reglas de completitud, y la comunidad SHALL responderlo como en `pactos-dos-partes`. Mientras el cambio no se acepta, la versión vigente (con su modalidad, su rango y su compromiso) MUST seguir rigiendo. El historial SHALL mostrar la modalidad de cada versión ("10 h/mes" o "entre 0 y 30 h/mes"). Las declaraciones ya hechas MUST conservarse al cambiar de versión.

#### Scenario: De fija a variable
- **WHEN** una persona con un pacto fijo de 10 h/mes en versión 1 propone pasar a variable de 0 a 30 h y la comunidad lo acepta
- **THEN** el pacto queda en versión 2 "entre 0 y 30 h/mes", con el compromiso de la comunidad, y el historial muestra "10 h/mes" en la versión 1

### Requirement: Semillas pendientes y Semillas de un pacto variable
Con un pacto variable vigente, solo los meses **confirmados** SHALL generar Semillas (`round(h × valor hora)`); un mes declarado y no confirmado MUST NOT generar nada. Las Semillas de cada mes confirmado SHALL ser "Semillas pendientes" mientras la persona no haya cumplido el compromiso mínimo, contado en meses confirmados con más de 0 h; un mes confirmado con 0 h MUST NOT contar para el mínimo. Al cumplirlo, las Semillas pendientes de esos meses SHALL recibirse y pasar a ser "Semillas". Solo las Semillas recibidas SHALL sumar al total; las pendientes SHALL mostrarse aparte. `/semillas` SHALL mostrar cuántos meses lleva del mínimo ("<N> de <M> meses confirmados") y listar los tres últimos meses con su estado en texto ("confirmadas · Semillas pendientes", "confirmadas · Semillas", "esperando confirmación", "a revisar" o "sin dato"). Sin Semillas recibidas o sin pendientes, cada valor MUST decir "sin dato", no 0. Los meses confirmados después de cumplir el mínimo SHALL recibirse al confirmarse (decisión de Gus, 28-oct). Si la persona pasa de horas variables a fijas con Semillas pendientes, esas Semillas pendientes SHALL recibirse solo si se validan y, si no, perderse (decisión de Gus, 28-oct). MUST NOT usarse otros nombres para estos estados. Con un pacto fijo, el cálculo MUST quedar como hoy. La ronda de reconocimiento SHALL habilitarse con un pacto variable aceptado igual que con uno fijo.

#### Scenario: Antes del mínimo
- **WHEN** en diciembre de 2026 Valle Solar (compromiso mínimo de 3 meses) confirmó 24 h de noviembre y 10 h de diciembre, y octubre no se declaró
- **THEN** Semillas muestra octubre "sin dato", noviembre "121 Semillas pendientes" y diciembre "50 Semillas pendientes", "Semillas pendientes: 171", "Semillas: sin dato" y "2 de 3 meses confirmados"

#### Scenario: Al cumplir el mínimo
- **WHEN** en noviembre de 2026 Taller Común (compromiso mínimo de 1 mes) confirmó 24 h de noviembre
- **THEN** noviembre dice "24 h · confirmadas · 121 Semillas", "Semillas: 121" suma al total y "Semillas pendientes" dice "sin dato"

#### Scenario: Un mes con 0 h no cuenta
- **WHEN** en diciembre de 2026 Valle Solar confirmó 0 h de octubre, 24 h de noviembre y 10 h de diciembre
- **THEN** se lee "2 de 3 meses confirmados" y las Semillas de noviembre y diciembre siguen pendientes

#### Scenario: Declarado sin confirmar
- **WHEN** la persona declaró 24 h de noviembre y la tribu todavía no respondió
- **THEN** noviembre dice "24 h · esperando confirmación", no genera Semillas ni pendientes, y las dos dicen "sin dato"

#### Scenario: Mes confirmado después del mínimo
- **WHEN** ya cumplió el compromiso mínimo y la comunidad confirma un mes más
- **THEN** ese mes dice "confirmadas · <N> Semillas" y suma al total apenas se confirma

#### Scenario: Pasa a horas fijas con Semillas pendientes
- **WHEN** una persona con Semillas pendientes (no llegó al mínimo) propone pasar a horas fijas y la comunidad lo acepta
- **THEN** `/semillas` muestra esas Semillas pendientes aparte ("Horas variables confirmadas antes del cambio"), con el aviso (en palabras neutras, sin decir quién valida) de que se reciben solo si se valida y, si no, se pierden, y NO suman al total; las ya recibidas siguen sumando

#### Scenario: Tras pasar a fija no se confirman más meses (interino)
- **WHEN** la versión vigente ya es de horas fijas y quedan meses declarados sin confirmar
- **THEN** `/pactos/responder` no los ofrece, no se pueden confirmar y una confirmación ya escrita no se aplica, así el mínimo no se cumple sin que nadie valide las Semillas pendientes. **La validación sigue pendiente de decisión de Gus (tarea P.1).**

### Requirement: Alcance de las decisiones de Gus del 28-oct sobre tareas
El máximo total de una tarea (horas o Semillas sumando a todas las personas, que fija quien administra el holón) y los círculos transversales administrados y facilitados por Hifa (simulada, experimental, con el super admin como respaldo humano) pertenecen a las tareas (`pacto-puntual` y `pacto-puntual-verificacion`) y MUST NOT aplicarse al pacto recurrente de horas variables, que es con la tribu o el Lighthouse y no con un círculo. Los nombres MUST ser "Semillas pendientes" y "Semillas"; MUST NOT usarse otros.

#### Scenario: El pacto variable no tiene máximo total
- **WHEN** una persona arma un pacto de horas variables
- **THEN** solo ve el rango por mes y el compromiso mínimo, sin máximo total ni aviso de Hifa

### Requirement: Otras pantallas
Donde hoy se muestran las horas por mes del pacto (Perfil, Mi recorrido, panel), un pacto variable SHALL mostrarse como "entre <mín> y <máx> h/mes", nunca con un número inventado.

#### Scenario: Perfil
- **WHEN** la persona con un pacto variable de 0 a 30 h en Valle Solar abre `/perfil`
- **THEN** ve "entre 0 y 30 h/mes" en Valle Solar

### Requirement: Eventos
Declarar las horas de un mes SHALL registrar "Declaraste <N> h de <mes> en <comunidad>" una sola vez por comunidad y mes (corregir MUST NOT agregar otro evento), y la confirmación SHALL registrar "<comunidad> confirmó tus horas de <mes>" una sola vez.

#### Scenario: Corregir
- **WHEN** la persona declara 24 h de noviembre y después corrige a 20 h
- **THEN** Mi recorrido tiene un solo evento de declaración de noviembre en Valle Solar

### Requirement: Compatibilidad con lo guardado
Un pacto guardado sin modalidad SHALL leerse como "Horas fijas" con sus horas, versión e historial, y sin compromiso. Una declaración guardada con un mes inválido, horas fuera de rango, un estado desconocido o de un mes futuro MUST descartarse sin romper el resto.

#### Scenario: Pacto anterior
- **WHEN** una persona tenía un pacto aceptado de 10 h/mes guardado antes de este cambio
- **THEN** lo ve como "Horas fijas · 10 h/mes" y Semillas calcula como antes

### Requirement: Término legal, textos y accesibilidad
"Compromiso mínimo" SHALL llevar el ⚖ con el texto `compromisominimo` del catálogo (`borrador: true`, con su inglés): un compromiso voluntario, de palabra, que no es un contrato de trabajo ni un período de prueba, sin horario impuesto ni pago en dinero, que se puede dejar antes avisando, y cuyas horas confirmadas generan Semillas pendientes que se reciben al cumplir el compromiso (o las de los meses confirmados, si se deja antes avisando), y que las Semillas no son un sueldo. Todos los textos nuevos SHALL existir en español (voseo) y en inglés, con los meses en el formato del idioma. La modalidad MUST elegirse con controles rotulados y usables con teclado, cada declaración y cada respuesta SHALL anunciarse en una región `aria-live`, y axe MUST pasar sin violaciones `serious` ni `critical` en `/pactos`, `/pactos/responder` y `/semillas` con un pacto variable.

#### Scenario: ⚖ con teclado
- **WHEN** en `/pactos` se llega con Tab al ⚖ de "Compromiso mínimo"
- **THEN** se ve que no es un período de prueba y que se puede dejar avisando, y Escape lo esconde

#### Scenario: En inglés
- **WHEN** se abre `/pactos` en inglés con un pacto variable aceptado
- **THEN** se lee "Variable hours", "Between 0 and 30 h per month" y "Minimum commitment: 3 months"
