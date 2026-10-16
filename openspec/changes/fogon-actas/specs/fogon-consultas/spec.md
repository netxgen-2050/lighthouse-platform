# Spec Delta

## ADDED Requirements

### Requirement: Acta registrada al cierre
Cuando una consulta guardada en la base cierra, la plataforma SHALL registrar su acta **una sola vez**, con la fecha de cierre, si cerró a mano o por fecha, los participantes ("repartieron X de N"), la regla, el resultado ordenado (votos, porcentaje, personas que apoyaron y, en presupuesto, monto por opción y fondos sin asignar) y la versión del motor de cálculo. Al cerrar a mano, el acta SHALL escribirse en la misma operación que el cierre. Al cerrar por fecha, SHALL escribirse la primera vez que se lee la consulta después del cierre. La base MUST rechazar modificar o borrar un acta y MUST rechazar registrar el acta de una consulta abierta.

#### Scenario: Cierre a mano
- **WHEN** el super admin cierra U1 a mano
- **THEN** queda registrada el acta de U1 con "a mano", la hora del cierre y el resultado de ese momento

#### Scenario: Cierre por fecha
- **WHEN** pasa la fecha de cierre de U2 y alguien del padrón la abre
- **THEN** queda registrada el acta de U2 con "por fecha" y la fecha de cierre de la consulta, y una segunda lectura no registra otra

#### Scenario: Acta fija
- **WHEN** alguien intenta modificar o borrar el acta de U1 en la base
- **THEN** la base lo rechaza

#### Scenario: Consulta abierta
- **WHEN** alguien intenta registrar el acta de una consulta abierta
- **THEN** la base lo rechaza

### Requirement: Mostrar el acta registrada
En una consulta cerrada guardada en la base, la pantalla SHALL mostrar el acta registrada, sin recalcularla, con el título "Acta" y "Registrada el <fecha y hora>" en hora de Argentina, y SHALL mantener la frase de que el resultado es consultivo y no reemplaza decisiones reservadas por el contrato o el estatuto. Si la consulta está cerrada y su acta todavía no está registrada, la pantalla SHALL decir "El acta todavía no está registrada" y mostrar el resultado calculado, marcado como tal. En la versión del navegador, el acta SHALL seguir marcada como ejemplo.

#### Scenario: Acta de la base
- **WHEN** una persona del padrón abre U1 cerrada
- **THEN** ve "Acta", "Registrada el <fecha y hora>" y el resultado tal como quedó al cierre

#### Scenario: Falló el registro
- **WHEN** U3 está cerrada y su acta no se pudo registrar
- **THEN** la persona ve "El acta todavía no está registrada" y el resultado calculado

### Requirement: Copiar el acta
El acta SHALL tener un botón "Copiar el acta" que copia un texto simple con el título, la fecha de cierre, la regla, los participantes, el resultado ordenado y la frase de que es consultiva, y anuncia "Acta copiada" a los lectores de pantalla. El texto copiado MUST NOT incluir nombres ni repartos individuales, tampoco en voto abierto. Si el navegador no permite copiar, la pantalla SHALL mostrar el mismo texto en un campo de solo lectura para seleccionarlo.

#### Scenario: Copiar
- **WHEN** la persona aprieta "Copiar el acta" en U1 cerrada
- **THEN** el portapapeles tiene el acta en texto, sin nombres, y la pantalla anuncia "Acta copiada"

#### Scenario: Sin permiso para copiar
- **WHEN** el navegador rechaza copiar al portapapeles
- **THEN** la persona ve el texto del acta en un campo de solo lectura con la indicación "Seleccioná y copiá el texto"

### Requirement: Actas en el Fogón
`/fogon` SHALL mostrar la sección "Actas de consultas" con las consultas cerradas que la persona puede ver (las de su padrón; todas para el super admin), cada una con su título enlazado y "cerrada el <fecha>", la más reciente primero. Sin consultas cerradas SHALL decir "Todavía no hay actas de consultas". Si la lista no se pudo leer, SHALL decir "No pudimos cargar las actas" y MUST NOT mostrar la lista vacía.

#### Scenario: Ver las actas
- **WHEN** U1 y U2 están cerradas y la persona está en los dos padrones
- **THEN** `/fogon` muestra "Actas de consultas" con U2 y U1, cada una con su fecha de cierre

#### Scenario: Fuera del padrón
- **WHEN** U4 está cerrada y la persona no está en su padrón
- **THEN** U4 no aparece en sus actas

### Requirement: Accesibilidad del acta
La sección de actas y el botón de copiar SHALL ser usables con teclado, comunicar todo con texto (no solo con color), pasar la auditoría de axe y no generar scroll horizontal a 390 px.

#### Scenario: Auditoría
- **WHEN** corre la auditoría de accesibilidad sobre `/fogon` con actas y sobre una consulta cerrada con su acta
- **THEN** no hay violaciones serias ni críticas
