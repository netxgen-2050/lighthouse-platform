# Spec Delta

## Purpose

Mostrar las Semillas de cada persona en cada comunidad a partir de sus constancias (ADR-012): lo recibido, lo pendiente y de dónde sale cada número, sin inventar datos ni guardar nada nuevo.

## ADDED Requirements

### Requirement: Semillas recibidas salen de las constancias vigentes
Las Semillas recibidas de una comunidad SHALL ser la suma de sus constancias vigentes. Cada base no revocada MUST contar una sola vez: por el valor de su ajuste vigente si lo tiene y, si no, por su propio valor. Sin constancias vigentes el valor MUST ser "sin dato", nunca 0.

#### Scenario: Base con ajuste no se cuenta dos veces
- **WHEN** hay una base de 50 Semillas y un ajuste vigente que apunta a ella con 54 Semillas
- **THEN** las Semillas recibidas son 54

#### Scenario: Base sin ajuste
- **WHEN** hay una base de tarea de 50 Semillas y ningún ajuste que apunte a ella
- **THEN** las Semillas recibidas son 50

#### Scenario: Varios orígenes
- **WHEN** hay una base de tarea de 50 Semillas y una base mensual recibida de 121 Semillas
- **THEN** las Semillas recibidas son 171

#### Scenario: Sin constancias
- **WHEN** la persona es miembro de la comunidad y no tiene ninguna constancia vigente
- **THEN** las Semillas recibidas dicen "sin dato" y no dicen 0

### Requirement: La proyección de un pacto fijo no es Semillas recibidas
La proyección a 3 meses de un pacto de horas fijas aceptado MUST NOT sumar a las Semillas recibidas ni al total. SHALL mostrarse rotulada como proyección, con las horas por mes del pacto.

#### Scenario: Pacto fijo sin ronda enviada
- **WHEN** la persona tiene un pacto de 20 h/mes aceptado, sin aportes y sin ronda enviada
- **THEN** las Semillas recibidas y el total dicen "sin dato", y se lee aparte la proyección de 303 Semillas en 3 meses, rotulada como que todavía no son Semillas recibidas

### Requirement: Constancias de un pacto de horas fijas
Con un pacto fijo aceptado y la ronda de ejemplo enviada, el historial SHALL mostrar una base y un ajuste que apunta a ella, de origen "ronda", calculados con la fuerza de partida de la comunidad. Sin ronda enviada, MUST NOT haber constancias de ronda.

#### Scenario: Ronda enviada con 20 h al mes
- **WHEN** la persona tiene un pacto de 20 h/mes aceptado y envió la ronda de ejemplo, que da factor 1,08
- **THEN** el historial muestra una base de 101 Semillas y un ajuste de 109 Semillas que apunta a ella, y las Semillas recibidas son 109

#### Scenario: Marcado como ejemplo
- **WHEN** la persona ve una constancia de origen "ronda"
- **THEN** la fila dice que es de ejemplo

### Requirement: La fuerza simulada no mueve el saldo
Elegir otra fuerza en el selector de simulación MUST NOT cambiar las Semillas recibidas, el total ni el historial. La simulación SHALL mostrar aparte la constancia de ajuste que resultaría, con otro id, apuntando a la misma base.

#### Scenario: Elegir fuerza 0,1
- **WHEN** la persona con pacto de 10 h/mes y ronda enviada elige "Fuerza 0,1"
- **THEN** las Semillas recibidas siguen en 54, el historial no cambia y la simulación muestra otro ajuste con factor 1,04 y su id terminado en `-f10`

### Requirement: Constancias de meses recibidos
Cada mes confirmado con más de 0 h de un compromiso cumplido SHALL figurar como una base de origen "pacto", también si el pacto pasó después a horas fijas. MUST rotularse como calculada, porque todavía no se emite ni se congela (ADR-021), y no tiene ajuste.

#### Scenario: Compromiso cumplido
- **WHEN** un pacto variable con compromiso de 1 mes tiene noviembre confirmado con 24 h
- **THEN** el historial muestra una base de origen "pacto", período noviembre, con 121 Semillas, rotulada como calculada, y las Semillas recibidas son 121

#### Scenario: Pasó a horas fijas con el mínimo cumplido
- **WHEN** el pacto pasó a fijas con noviembre (24 h) y diciembre (10 h) confirmados y el mínimo cumplido
- **THEN** las dos bases siguen en el historial y suman 171 Semillas recibidas

#### Scenario: Mes con 0 h
- **WHEN** un mes se confirmó con 0 h
- **THEN** no tiene constancia ni cuenta para el compromiso mínimo

### Requirement: Constancias de tareas verificadas
Cada constancia base guardada de un pacto puntual verificado SHALL figurar en el historial con origen "tarea", con el nombre de la tarea, las horas verificadas, las horas sin Semillas si las hay y sus Semillas tal como se guardaron, sin recalcularlas.

#### Scenario: Tarea con máximo
- **WHEN** una tarea se verificó con 12 h y un máximo de 10 h por persona
- **THEN** la fila muestra el nombre de la tarea, 12 h verificadas, 2 h sin Semillas y 50 Semillas

#### Scenario: Tarea sin verificar
- **WHEN** la persona marcó la tarea como hecha y el holón todavía no la verificó
- **THEN** no hay constancia en el historial y esas horas no aparecen como Semillas pendientes

#### Scenario: La tarea no abre la ronda
- **WHEN** la persona solo tiene un pacto puntual verificado
- **THEN** ve su constancia y no se le habilita la ronda ni tiene ajuste

### Requirement: Semillas pendientes con cuánto falta
Las Semillas pendientes SHALL salir solo de meses confirmados con más de 0 h de un compromiso sin cumplir y MUST NOT sumar a las recibidas ni al total. Mientras el pacto sea variable, SHALL decir cuántos meses confirmados faltan. Sin pendientes MUST decir "sin dato".

#### Scenario: Falta un mes
- **WHEN** un compromiso de 3 meses tiene noviembre (24 h) y diciembre (10 h) confirmados
- **THEN** las Semillas pendientes son 171, se lee que falta 1 mes confirmado (2 de 3) y no suman a las recibidas

#### Scenario: Faltan varios meses
- **WHEN** un compromiso de 3 meses tiene un solo mes confirmado
- **THEN** se lee que faltan 2 meses confirmados, en plural correcto

#### Scenario: Mes sin confirmar
- **WHEN** un mes está declarado o a revisar
- **THEN** no genera Semillas pendientes y figura con su estado en texto

#### Scenario: Pasó a fijas con pendientes
- **WHEN** el pacto pasó a horas fijas con Semillas pendientes
- **THEN** se ven aparte, sin sumar, con el aviso de que se reciben solo si se validan y que si no se pierden, sin decir cuántos meses faltan

#### Scenario: Pacto fijo sin etapa variable
- **WHEN** la persona tiene solo un pacto de horas fijas
- **THEN** las Semillas pendientes dicen "sin dato"

### Requirement: Historial de constancias
La vista SHALL listar las constancias de la comunidad elegida con su tipo (base o ajuste), su estado, su origen, su período, sus Semillas y si cuentan en el saldo. Un ajuste MUST decir a qué base apunta. El orden MUST ser estable: del período más nuevo al más viejo, con cada ajuste después de su base.

#### Scenario: Base reemplazada por su ajuste
- **WHEN** una base tiene un ajuste vigente
- **THEN** la base dice que no suma porque la reemplaza su ajuste, y el ajuste dice que cuenta en el saldo

#### Scenario: Sin constancias
- **WHEN** la comunidad elegida no tiene constancias
- **THEN** el historial dice "sin dato" y explica cómo se generan

#### Scenario: Pacto variable con ronda enviada
- **WHEN** la persona tiene un pacto variable aceptado y envió la ronda de ejemplo
- **THEN** no hay constancias de ronda y se lee que las constancias de ronda de ejemplo son para un pacto de horas fijas

#### Scenario: Sin datos de terceros
- **WHEN** se arma el historial
- **THEN** no contiene nombres ni ids de evaluadores, motivos, nombre ni email de la persona

### Requirement: Constancias revocadas
Una constancia revocada SHALL seguir en el historial, marcada en texto como "revocada" y con su fecha cuando se conozca, y MUST NOT contar en el saldo. Su fuente es un `revoca` del registro compartido sobre la confirmación que le dio origen. Nada se borra ni se edita.

#### Scenario: Tarea con la verificación revocada
- **WHEN** el registro tiene un `revoca` válido sobre la confirmación de una base de tarea de 50 Semillas
- **THEN** la fila dice "revocada" con su fecha, sigue mostrando las 50 Semillas y las recibidas ya no las suman

#### Scenario: Mes con la confirmación revocada
- **WHEN** el registro tiene un `revoca` válido sobre la confirmación de un mes
- **THEN** ese mes no cuenta para el mínimo ni genera Semillas, y si ya tenía constancia figura como revocada

#### Scenario: Base revocada con ajuste
- **WHEN** se revoca una base que tiene ajuste
- **THEN** ninguna de las dos suma

#### Scenario: Ajuste revocado
- **WHEN** se revoca el ajuste de una base vigente
- **THEN** la base vuelve a contar por su propio valor

#### Scenario: Registro ilegible
- **WHEN** el registro compartido no se puede leer
- **THEN** la vista muestra lo guardado, sin marcar nada como revocado y sin romperse

#### Scenario: Revocación mal formada
- **WHEN** un `revoca` no apunta a una confirmación de esa misma constancia o lo afirma otra parte
- **THEN** se ignora

### Requirement: Aportes en plata separados de las constancias
Los aportes en plata registrados SHALL mostrarse en una línea propia, sin constancia y fuera de las Semillas recibidas, y SHALL seguir sumando al total de la comunidad hasta que se decida otra cosa.

#### Scenario: Solo aportes
- **WHEN** la persona registró un aporte de 200 sin ninguna constancia
- **THEN** las Semillas recibidas dicen "sin dato", la línea de aportes dice 200 Semillas y el total dice 200 Semillas

#### Scenario: Aportes y constancias
- **WHEN** tiene 121 Semillas recibidas, 50 de una tarea y un aporte de 200
- **THEN** las Semillas recibidas son 171 y el total es 371 Semillas

### Requirement: Un mismo número en todas las pantallas
Las tarjetas de `/semillas`, el detalle de la comunidad y "Semillas totales" de `/perfil` SHALL usar el mismo cálculo y MUST coincidir. Con ningún dato, `/perfil` MUST decir "sin dato".

#### Scenario: Perfil y Semillas coinciden
- **WHEN** la persona tiene un pacto fijo de 20 h/mes sin ronda enviada y un aporte de 200 en la misma comunidad
- **THEN** `/semillas` muestra un total de 200 Semillas y `/perfil` dice "Semillas totales: 200"

#### Scenario: La ronda enviada llega al perfil
- **WHEN** la persona envió la ronda de ejemplo con un pacto de 10 h/mes y no tiene otros datos
- **THEN** `/perfil` dice "Semillas totales: 54"

### Requirement: Lo que abren las Semillas
La vista SHALL tener una sección "Lo que abren tus Semillas" para la comunidad elegida que diga que lo define cada tribu y que todavía no está definido. MUST NOT listar utilidades, escalones, metas ni cantidades.

#### Scenario: Ver la sección
- **WHEN** la persona elige una comunidad
- **THEN** ve la sección con el nombre de la comunidad, el texto "a definir por cada tribu" y ninguna utilidad, meta ni cantidad

#### Scenario: Sin medidor
- **WHEN** la persona abre `/semillas`
- **THEN** no ve el medidor "Sembrador/a activo/a" ni la meta de 120, y sigue el enlace a lo que abre su pasaporte

#### Scenario: Sin ser miembro
- **WHEN** la persona no es miembro de ninguna comunidad
- **THEN** ve cómo empezar y no ve historial ni detalle de ninguna comunidad

### Requirement: Nombres y accesibilidad
Los textos nuevos MUST existir en español y en inglés y MUST nombrar solo "Semillas" y "Semillas pendientes", nunca "brotes" ni "germinar" para ellas. Ningún estado MUST comunicarse solo con color, y todo MUST poder usarse con teclado.

#### Scenario: En inglés
- **WHEN** la página se ve en inglés
- **THEN** el historial, las pendientes y la sección de lo que abren se leen en inglés, dicen "Semillas" y "Pending Semillas", y no queda texto suelto en español

#### Scenario: Estados en texto
- **WHEN** se ven constancias vigentes, reemplazadas y revocadas
- **THEN** cada estado se lee en texto y la auditoría de axe pasa sin errores serios ni críticos

### Requirement: Sin datos nuevos ni pedidos de red
Calcular y mostrar el libro MUST NOT agregar claves en el navegador ni escribir en lo guardado, y MUST NOT hacer pedidos de red.

#### Scenario: Abrir la vista
- **WHEN** la persona abre `/semillas`, cambia de comunidad y envía la ronda
- **THEN** la única clave escrita es la de la ronda, que ya existía, y no sale ningún pedido con datos

#### Scenario: Fallo al leer la ronda
- **WHEN** lo guardado de la ronda está mal formado
- **THEN** se trata como ronda no enviada y no hay constancias de ronda
