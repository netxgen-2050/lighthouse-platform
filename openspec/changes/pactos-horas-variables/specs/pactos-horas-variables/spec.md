# Spec Delta

## Purpose

Que un pacto de tiempo recurrente pueda tener horas que varían de un mes a otro dentro de un rango acordado, con un compromiso mínimo de 1 a 3 meses que fija cada comunidad, que la comunidad confirme las horas de cada mes, y que cada comunidad diga si acepta ese formato (Backlog D20; decisiones de Gus del 28-oct).

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

### Requirement: Semillas de un pacto variable
Con un pacto variable vigente, la parte de tiempo de Semillas SHALL sumar `round(h × valor hora)` solo de los meses **confirmados** entre el mes en curso y los dos anteriores, y SHALL listar los tres meses con su estado ("confirmadas", "esperando confirmación", "a revisar" o "sin dato"). Un mes declarado y no confirmado MUST NOT sumar. Si ningún mes está confirmado, la parte de tiempo MUST ser "sin dato", no 0. Con un pacto fijo, el cálculo MUST quedar como hoy. La ronda de reconocimiento SHALL habilitarse con un pacto variable aceptado igual que con uno fijo.

#### Scenario: Dos meses confirmados
- **WHEN** en diciembre de 2026 la tribu confirmó 24 h de noviembre y 10 h de diciembre, y octubre no se declaró
- **THEN** Semillas muestra octubre "sin dato", noviembre 121 y diciembre 50, y la parte de tiempo suma 171

#### Scenario: Declarado sin confirmar
- **WHEN** la persona declaró 24 h de noviembre y la tribu todavía no respondió
- **THEN** noviembre dice "24 h · esperando confirmación", no suma, y la parte de tiempo dice "sin dato"

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
"Compromiso mínimo" SHALL llevar el ⚖ con el texto `compromisominimo` del catálogo (`borrador: true`, con su inglés): un compromiso voluntario, de palabra, que no es un contrato de trabajo ni un período de prueba, sin horario impuesto ni pago en dinero, que se puede dejar antes avisando, y cuyas horas confirmadas se reconocen con Semillas que no son un sueldo. Todos los textos nuevos SHALL existir en español (voseo) y en inglés, con los meses en el formato del idioma. La modalidad MUST elegirse con controles rotulados y usables con teclado, cada declaración y cada respuesta SHALL anunciarse en una región `aria-live`, y axe MUST pasar sin violaciones `serious` ni `critical` en `/pactos`, `/pactos/responder` y `/semillas` con un pacto variable.

#### Scenario: ⚖ con teclado
- **WHEN** en `/pactos` se llega con Tab al ⚖ de "Compromiso mínimo"
- **THEN** se ve que no es un período de prueba y que se puede dejar avisando, y Escape lo esconde

#### Scenario: En inglés
- **WHEN** se abre `/pactos` en inglés con un pacto variable aceptado
- **THEN** se lee "Variable hours", "Between 0 and 30 h per month" y "Minimum commitment: 3 months"
