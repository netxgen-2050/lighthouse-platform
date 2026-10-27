# Spec Delta

## Purpose

Que un pacto de tiempo recurrente pueda tener horas que varían de un mes a otro dentro de un rango acordado, sin proponer un cambio cada mes, y que cada comunidad diga si acepta ese formato (Backlog D20).

## ADDED Requirements

### Requirement: Formato variable por comunidad
`lib/pactos/formatos.ts` SHALL incluir el formato "variable". Con los datos de ejemplo, lo SHALL aceptar el Lighthouse, Semilla Viva, Agua Clara, Valle Solar, Taller Común, Avelan Kerum y Puerto Trueque, y MUST NOT aceptarlo Monte Nuevo ni Barda Productiva. Si una comunidad no lo acepta, `/pactos` MUST NOT ofrecer la modalidad variable para ella.

#### Scenario: Comunidad que no lo acepta
- **WHEN** una persona miembro de Monte Nuevo arma su pacto de tiempo
- **THEN** no ve la opción "Horas variables"

### Requirement: Elegir la modalidad
El pacto de tiempo recurrente SHALL tener una modalidad, "Horas fijas" (la de hoy, por defecto) u "Horas variables", elegible en el borrador. Con "Horas variables" SHALL pedir un rango por mes, "de <mín> a <máx> h", con mínimo desde 0, máximo hasta 80, pasos de 2 y mínimo menor que máximo, en lugar de las horas fijas. El rol y la descripción MUST seguir siendo obligatorios.

#### Scenario: Rango
- **WHEN** una persona miembro de Valle Solar elige "Horas variables" y pone de 0 a 30 h
- **THEN** ve "Entre 0 y 30 h por mes" y puede enviarlo con rol y descripción

#### Scenario: Rango al revés
- **WHEN** pone de 30 a 10 h
- **THEN** ve "El mínimo tiene que ser menor que el máximo" y no puede enviarlo

### Requirement: Declarar las horas del mes
Con un pacto variable aceptado, la persona SHALL poder declarar las horas del mes en curso, enteras, en pasos de 2 y dentro del rango vigente, sin proponer un cambio. SHALL poder corregir la declaración del mes en curso; las de meses pasados MUST quedar como se declararon y MUST NOT editarse. Los meses futuros MUST NOT declararse. Declarar 0 SHALL guardarse como dato ("0 h, declarado"); un mes sin declarar SHALL mostrarse como "sin dato".

#### Scenario: Declarar
- **WHEN** en noviembre de 2026 la persona con un pacto variable de 0 a 30 h en Valle Solar declara 24 h
- **THEN** ve "Noviembre de 2026: 24 h" y no se creó ningún cambio de pacto

#### Scenario: Fuera del rango
- **WHEN** intenta declarar 40 h
- **THEN** ve "Está fuera de lo pactado (0 a 30 h). Para más horas, proponé un cambio." y no se guarda

#### Scenario: Mes pasado
- **WHEN** ya es diciembre de 2026 y la persona mira noviembre
- **THEN** ve las 24 h de noviembre sin poder editarlas

### Requirement: Cambiar de modalidad o de rango
"Proponer un cambio" SHALL permitir cambiar la modalidad y el rango además del rol, la descripción y las horas, con las mismas reglas de completitud. Mientras el cambio no se acepta, la versión vigente (con su modalidad y su rango) MUST seguir rigiendo las declaraciones y Semillas. El historial SHALL mostrar la modalidad de cada versión ("10 h/mes" o "entre 0 y 30 h/mes"). Las declaraciones ya hechas MUST conservarse al cambiar de versión.

#### Scenario: De fija a variable
- **WHEN** una persona con un pacto fijo de 10 h/mes en versión 1 propone pasar a variable de 0 a 30 h y la comunidad lo acepta (simulado)
- **THEN** el pacto queda en versión 2 "entre 0 y 30 h/mes" y el historial muestra "10 h/mes" en la versión 1

### Requirement: Semillas de un pacto variable
Con un pacto variable vigente, la parte de tiempo de Semillas SHALL sumar `round(h × valor hora)` de cada mes declarado entre el mes en curso y los dos anteriores, y SHALL listar los tres meses con su declaración o "sin dato". Si ninguno de los tres está declarado, la parte de tiempo MUST ser "sin dato", no 0. Con un pacto fijo, el cálculo MUST quedar como hoy. La ronda de reconocimiento SHALL habilitarse con un pacto variable aceptado igual que con uno fijo.

#### Scenario: Dos meses declarados
- **WHEN** en diciembre de 2026 la persona declaró 24 h en noviembre, 10 h en diciembre y nada en octubre
- **THEN** Semillas muestra octubre "sin dato", noviembre 121 y diciembre 50, y la parte de tiempo suma 171

#### Scenario: Sin declarar
- **WHEN** la persona tiene un pacto variable aceptado y no declaró ningún mes
- **THEN** la parte de tiempo dice "sin dato" y la ronda está disponible

### Requirement: Otras pantallas
Donde hoy se muestran las horas por mes del pacto (Perfil, Mi recorrido, panel), un pacto variable SHALL mostrarse como "entre <mín> y <máx> h/mes", nunca con un número inventado.

#### Scenario: Perfil
- **WHEN** la persona con un pacto variable de 0 a 30 h en Valle Solar abre `/perfil`
- **THEN** ve "entre 0 y 30 h/mes" en Valle Solar

### Requirement: Evento de la declaración
Declarar las horas de un mes SHALL registrar "Declaraste <N> h de <mes> en <comunidad>" en Mi recorrido una sola vez por comunidad y mes; corregir la declaración MUST NOT agregar otro evento.

#### Scenario: Corregir
- **WHEN** la persona declara 24 h de noviembre y después corrige a 20 h
- **THEN** Mi recorrido tiene un solo evento de noviembre en Valle Solar

### Requirement: Compatibilidad con lo guardado
Un pacto guardado sin modalidad SHALL leerse como "Horas fijas" con sus horas, versión e historial. Una declaración guardada con un mes inválido, un valor fuera de rango o de un mes futuro MUST descartarse sin romper el resto.

#### Scenario: Pacto anterior
- **WHEN** una persona tenía un pacto aceptado de 10 h/mes guardado antes de este cambio
- **THEN** lo ve como "Horas fijas · 10 h/mes" y Semillas calcula como antes

### Requirement: Textos y accesibilidad
Todos los textos nuevos SHALL existir en español (voseo) y en inglés, con los meses en el formato del idioma. La modalidad MUST elegirse con controles rotulados y usables con teclado, cada declaración SHALL anunciarse en una región `aria-live`, y axe MUST pasar sin violaciones `serious` ni `critical` en `/pactos` y `/semillas` con un pacto variable.

#### Scenario: En inglés
- **WHEN** se abre `/pactos` en inglés con un pacto variable aceptado
- **THEN** se lee "Variable hours" y "Between 0 and 30 h per month"
